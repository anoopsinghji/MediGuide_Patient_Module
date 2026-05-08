import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';

interface UseDoctorVideoConsultationProps {
  appointmentId: string;
  token: string;
}

type WebRTCSignalConfig = {
  roomName: string;
  role: 'doctor' | 'patient';
  signaling: {
    url: string;
    path: string;
  };
  iceServers: RTCIceServer[];
};

type CallAdapter = {
  mount: (container: HTMLDivElement) => void;
  leave: () => Promise<void>;
  destroy: () => void;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SIGNALING_BASE_FALLBACK = API_BASE_URL.replace(/\/api\/?$/, '');

const resolveSignalingUrl = (url: string) => {
  if (!url) return SIGNALING_BASE_FALLBACK;

  const usingSecureFrontend = typeof window !== 'undefined' && window.location.protocol === 'https:';

  try {
    const parsedUrl = new URL(url);
    const isLoopback = /localhost|127\.0\.0\.1/i.test(parsedUrl.hostname);

    if (isLoopback && usingSecureFrontend) {
      return SIGNALING_BASE_FALLBACK;
    }

    if (usingSecureFrontend && (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'ws:')) {
      parsedUrl.protocol = parsedUrl.protocol === 'ws:' ? 'wss:' : 'https:';
    }

    return parsedUrl.toString().replace(/\/$/, '');
  } catch (_error) {
    if (/localhost|127\.0\.0\.1/i.test(url) && usingSecureFrontend) {
      return SIGNALING_BASE_FALLBACK;
    }

    return url;
  }
};

export function useDoctorVideoConsultation({
  appointmentId,
  token,
}: UseDoctorVideoConsultationProps) {
  const callRef = useRef<CallAdapter | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const localVideoElementRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoElementRef = useRef<HTMLVideoElement | null>(null);
  const remoteAudioElementRef = useRef<HTMLAudioElement | null>(null);
  const remoteSocketIdRef = useRef<string | null>(null);
  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const playbackRetrySetRef = useRef(new WeakSet<HTMLMediaElement>());
  const isJoiningRef = useRef(false);
  const hasActiveSessionRef = useRef(false);
  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [signalConfig, setSignalConfig] = useState<WebRTCSignalConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [isConsultationStarted, setIsConsultationStarted] = useState(false);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');
  const [iceConnectionState, setIceConnectionState] = useState<RTCIceConnectionState>('new');
  const [signalingState, setSignalingState] = useState<RTCSignalingState>('stable');
  const [socketConnected, setSocketConnected] = useState(false);
  const durationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch video room token from backend
  const createVideoRoom = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${API_BASE_URL}/consultation/webrtc-bootstrap/${appointmentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create video room');
      }

      setRoomUrl(response.data.roomName);
      setSignalConfig({
        roomName: response.data.roomName,
        role: response.data.role,
        signaling: {
          ...response.data.signaling,
          url: resolveSignalingUrl(response.data.signaling?.url || ''),
        },
        iceServers: response.data.iceServers,
      });
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to create video room';
      setError(message);
      console.error('Video room creation error:', message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const ensureVideoElementsExist = () => {
    // Create video elements early, before peer connection receives tracks
    // This prevents the race condition where ontrack fires before elements exist
    
    if (!remoteVideoElementRef.current) {
      const remoteVideo = document.createElement('video');
      remoteVideo.autoplay = true;
      remoteVideo.playsInline = true;
      remoteVideo.muted = false;
      remoteVideo.style.transform = 'scaleX(-1)';
      remoteVideoElementRef.current = remoteVideo;
      console.log('[doctor-webrtc] Pre-created remote video element');
    }

    if (!localVideoElementRef.current) {
      const localVideo = document.createElement('video');
      localVideo.autoplay = true;
      localVideo.playsInline = true;
      localVideo.muted = true;
      localVideo.style.transform = 'scaleX(-1)';
      localVideoElementRef.current = localVideo;
      console.log('[doctor-webrtc] Pre-created local video element');
    }

    if (!remoteAudioElementRef.current) {
      const remoteAudio = document.createElement('audio');
      remoteAudio.autoplay = true;
      remoteAudio.muted = false;
      remoteAudioElementRef.current = remoteAudio;
      console.log('[doctor-webrtc] Pre-created remote audio element');
    }
  };

  const attemptMediaPlayback = (element: HTMLMediaElement | null, label: string) => {
    if (!element) return;

    try {
      const playPromise = element.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch((playError) => {
          console.warn(`[doctor-webrtc] ${label} autoplay blocked, waiting for user gesture:`, playError);

          if (typeof window === 'undefined' || playbackRetrySetRef.current.has(element)) {
            return;
          }

          playbackRetrySetRef.current.add(element);
          const retryPlayback = () => {
            element.play()
              .then(() => {
                playbackRetrySetRef.current.delete(element);
                console.log(`[doctor-webrtc] ${label} playback resumed after user gesture`);
              })
              .catch((retryError) => {
                console.warn(`[doctor-webrtc] ${label} playback retry failed:`, retryError);
              });
          };

          window.addEventListener('pointerdown', retryPlayback, { once: true });
        });
      }
    } catch (playError) {
      console.warn(`[doctor-webrtc] ${label} playback error:`, playError);
    }
  };

  const mountStreams = (container: HTMLDivElement) => {
    if (!container) return;

    // Ensure elements exist first
    ensureVideoElementsExist();

    container.innerHTML = '';

    const remoteVideo = remoteVideoElementRef.current || document.createElement('video');
    const localVideo = localVideoElementRef.current || document.createElement('video');
    const remoteAudio = remoteAudioElementRef.current || document.createElement('audio');

    // Configure remote video
    remoteVideo.autoplay = true;
    remoteVideo.playsInline = true;
    remoteVideo.muted = false;
    remoteVideo.className = 'w-full h-full object-cover bg-black';
    remoteVideo.style.transform = 'scaleX(-1)';
    remoteVideo.style.width = '100%';
    remoteVideo.style.height = '100%';

    // Configure local video
    localVideo.autoplay = true;
    localVideo.playsInline = true;
    localVideo.muted = true;
    localVideo.className = 'absolute bottom-4 right-4 w-40 h-28 rounded-lg border border-white/20 object-cover bg-black shadow-lg';
    localVideo.style.transform = 'scaleX(-1)';

    // Configure hidden remote audio element for reliable voice playback
    remoteAudio.autoplay = true;
    remoteAudio.muted = false;
    remoteAudio.controls = false;
    remoteAudio.style.display = 'none';

    // Set stream objects
    if (remoteStreamRef.current) {
      remoteVideo.srcObject = remoteStreamRef.current;
      remoteAudio.srcObject = remoteStreamRef.current;
      console.log('[doctor-webrtc] Mounted with existing remote stream');
      attemptMediaPlayback(remoteVideo, 'Remote video');
      attemptMediaPlayback(remoteAudio, 'Remote audio');
    } else {
      console.log('[doctor-webrtc] Mounted with null remote stream - will bind on ontrack');
    }

    if (localStreamRef.current) {
      localVideo.srcObject = localStreamRef.current;
      console.log('[doctor-webrtc] Local stream mounted');
    }

    remoteVideoElementRef.current = remoteVideo;
    localVideoElementRef.current = localVideo;
    remoteAudioElementRef.current = remoteAudio;

    container.style.position = 'relative';
    container.appendChild(remoteVideo);
    container.appendChild(localVideo);
    container.appendChild(remoteAudio);

    console.log('[doctor-webrtc] Video elements mounted to container');
  };

  const cleanupCallState = async () => {
    if (socketRef.current) {
      socketRef.current.emit('webrtc:leave-room');
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    remoteStreamRef.current = null;
    localVideoElementRef.current = null;
    remoteVideoElementRef.current = null;
    remoteAudioElementRef.current = null;
    remoteSocketIdRef.current = null;
    pendingIceCandidatesRef.current = [];
    hasActiveSessionRef.current = false;
    isJoiningRef.current = false;
    setConnectionState('closed');
    setIceConnectionState('closed');
    setSignalingState('stable');
    setSocketConnected(false);
  };

  const initializePeerConnection = () => {
    if (!signalConfig) {
      throw new Error('WebRTC signal configuration is missing');
    }

    const pc = new RTCPeerConnection({ iceServers: signalConfig.iceServers });
    peerConnectionRef.current = pc;

    pc.onicecandidate = (event) => {
      if (!event.candidate || !socketRef.current) return;
      socketRef.current.emit('webrtc:ice-candidate', {
        targetSocketId: remoteSocketIdRef.current,
        candidate: event.candidate,
      });
    };

    pc.ontrack = (event) => {
      console.log('[doctor-webrtc] ontrack event fired:', {
        trackKind: event.track.kind,
        trackId: event.track.id,
        streamsCount: event.streams.length,
        remoteVideoElementRef: !!remoteVideoElementRef.current,
      });

      if (!remoteStreamRef.current) {
        remoteStreamRef.current = new MediaStream();
        console.log('[doctor-webrtc] Created new MediaStream for remote');
      }

      event.streams[0].getTracks().forEach((track) => {
        remoteStreamRef.current?.addTrack(track);
        console.log('[doctor-webrtc] Added track to remote stream:', track.kind);
      });

      // Critical: rebind video element to stream
      if (remoteVideoElementRef.current) {
        if (remoteStreamRef.current) {
          remoteVideoElementRef.current.srcObject = remoteStreamRef.current;
          console.log('[doctor-webrtc] Bound remote stream to video element, stream tracks:', remoteStreamRef.current.getTracks().length);
          attemptMediaPlayback(remoteVideoElementRef.current, 'Remote video');
        }
      } else {
        console.warn('[doctor-webrtc] remoteVideoElementRef is null!');
      }

      if (remoteAudioElementRef.current && remoteStreamRef.current) {
        remoteAudioElementRef.current.srcObject = remoteStreamRef.current;
        attemptMediaPlayback(remoteAudioElementRef.current, 'Remote audio');
      }
    };

    pc.onconnectionstatechange = () => {
      setConnectionState(pc.connectionState);
      console.log('[doctor-webrtc] connectionState:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        startConsultation();
      }
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        endConsultation();
      }
    };

    pc.oniceconnectionstatechange = () => {
      setIceConnectionState(pc.iceConnectionState);
      console.log('[doctor-webrtc] iceConnectionState:', pc.iceConnectionState);
    };

    pc.onsignalingstatechange = () => {
      setSignalingState(pc.signalingState);
      console.log('[doctor-webrtc] signalingState:', pc.signalingState);
    };

    return pc;
  };

  const getLocalMediaStream = async () => {
    const preferredConstraints: MediaStreamConstraints = {
      audio: true,
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    };

    try {
      return await navigator.mediaDevices.getUserMedia(preferredConstraints);
    } catch (mediaError: any) {
      const errorName = mediaError?.name || 'UnknownError';
      const canFallbackToAudioOnly = [
        'NotReadableError',
        'OverconstrainedError',
        'NotFoundError',
        'AbortError',
        'TrackStartError',
      ].includes(errorName);

      if (!canFallbackToAudioOnly) {
        throw mediaError;
      }

      console.warn('[doctor-webrtc] Camera unavailable, falling back to audio-only:', mediaError);

      return navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
    }
  };

  const flushPendingIceCandidates = async (pc: RTCPeerConnection) => {
    if (!pendingIceCandidatesRef.current.length) return;

    const pending = [...pendingIceCandidatesRef.current];
    pendingIceCandidatesRef.current = [];

    for (const candidate of pending) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.warn('Failed to apply queued ICE candidate:', error);
      }
    }
  };

  const initializeCall = async () => {
    try {
      if (!signalConfig) {
        throw new Error('No signaling config found');
      }

      if (signalConfig.role !== 'doctor') {
        throw new Error('Doctor consultation room role is invalid');
      }

      if (hasActiveSessionRef.current || socketRef.current || peerConnectionRef.current) {
        return;
      }

      isJoiningRef.current = true;

      // ⭐ CRITICAL: Ensure video elements exist BEFORE peer connection is created
      // This prevents the race condition where ontrack fires before elements are created
      ensureVideoElementsExist();

      const pc = initializePeerConnection();
      const localStream = await getLocalMediaStream();

      localStreamRef.current = localStream;
      if (localVideoElementRef.current) {
        localVideoElementRef.current.srcObject = localStream;
      }
      localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

      const socket = io(signalConfig.signaling.url, {
        path: signalConfig.signaling.path,
        transports: ['websocket'],
        auth: {
          token: `Bearer ${token}`,
        },
      });
      socketRef.current = socket;

      socket.on('connect', () => {
        setSocketConnected(true);
        console.log('[doctor-webrtc] socket connected:', socket.id);
      });

      socket.on('disconnect', (reason) => {
        setSocketConnected(false);
        console.log('[doctor-webrtc] socket disconnected:', reason);
      });

      socket.on('connect_error', (connectError) => {
        setError(connectError.message || 'Signaling connection failed');
      });

      socket.on('webrtc:error', (event) => {
        setError(event?.message || 'Consultation signaling error');
      });

      socket.on('webrtc:room-joined', async (event) => {
        console.log('[doctor-webrtc] room joined:', event?.roomName, 'peers:', event?.peers?.length || 0);
        const peers = Array.isArray(event?.peers) ? event.peers : [];
        if (peers.length > 0) {
          const firstPeer = peers[0];
          remoteSocketIdRef.current = firstPeer.socketId;
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('webrtc:offer', {
            targetSocketId: firstPeer.socketId,
            sdp: offer,
          });
        }
      });

      socket.on('webrtc:peer-joined', async (event) => {
        console.log('[doctor-webrtc] peer joined:', event?.socketId);
        remoteSocketIdRef.current = event?.socketId || null;
        if (!remoteSocketIdRef.current) return;

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('webrtc:offer', {
          targetSocketId: remoteSocketIdRef.current,
          sdp: offer,
        });
      });

      socket.on('webrtc:offer', async (event) => {
        if (!event?.sdp) return;

        // Doctor should never answer an inbound offer in this flow.
        return;

      });

      socket.on('webrtc:answer', async (event) => {
        if (!event?.sdp) return;
        if (pc.signalingState !== 'have-local-offer') {
          console.log('[doctor-webrtc] ignoring answer due to signalingState:', pc.signalingState);
          return;
        }

        console.log('[doctor-webrtc] received answer from:', event.senderSocketId);

        await pc.setRemoteDescription(new RTCSessionDescription(event.sdp));
        await flushPendingIceCandidates(pc);
      });

      socket.on('webrtc:ice-candidate', async (event) => {
        if (!event?.candidate) return;
        if (!pc.remoteDescription) {
          pendingIceCandidatesRef.current.push(event.candidate);
          return;
        }
        try {
          await pc.addIceCandidate(new RTCIceCandidate(event.candidate));
        } catch (candidateError) {
          console.warn('Skipping invalid ICE candidate:', candidateError);
        }
      });

      socket.emit('webrtc:join-room', {
        appointmentId,
      });

      hasActiveSessionRef.current = true;
      isJoiningRef.current = false;

      callRef.current = {
        mount: mountStreams,
        leave: async () => {
          await cleanupCallState();
        },
        destroy: () => {
          cleanupCallState();
        },
      };
    } catch (err: any) {
      console.error('Failed to initialize call:', err);
      setError(err.message || 'Failed to initialize video call');
      isJoiningRef.current = false;
    }
  };

  // Join video call
  const joinCall = async () => {
    try {
      if (isJoiningRef.current || hasActiveSessionRef.current || socketRef.current) {
        return;
      }

      if (signalConfig) {
        await initializeCall();
      }
    } catch (err) {
      console.error('Failed to join call:', err);
    }
  };

  // Start consultation timer
  const startConsultation = () => {
    try {
      setIsConsultationStarted(true);

      // Notify backend
      axios.patch(
        `${API_BASE_URL}/consultation/start/${appointmentId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Start duration timer
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
      durationTimerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error starting consultation:', err);
    }
  };

  // End consultation
  const endConsultation = async () => {
    try {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }

      setIsConsultationStarted(false);

      // Notify backend
      await axios.patch(
        `${API_BASE_URL}/consultation/end/${appointmentId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (err) {
      console.error('Error ending consultation:', err);
    }
  };

  // Leave video call
  const leaveCall = async () => {
    try {
      if (callRef.current) {
        await callRef.current.leave();
      }
      await endConsultation();
    } catch (err) {
      console.error('Failed to leave call:', err);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callRef.current) {
        callRef.current.destroy();
      }
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
    };
  }, []);

  return {
    roomUrl,
    loading,
    error,
    callRef,
    createVideoRoom,
    joinCall,
    leaveCall,
    duration,
    isConsultationStarted,
    connectionState,
    iceConnectionState,
    signalingState,
    socketConnected,
  };
}
