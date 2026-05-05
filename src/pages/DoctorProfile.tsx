import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTitle } from '../hooks';
import { toast } from 'react-hot-toast';
import { useConfirm } from '../components/confirm/ConfirmProvider';
import { appointmentService } from '../services';
import { useAuthWall } from '../hooks/useAuthWall';
import {
  ArrowLeft,
  Loader2,
  TriangleAlert,
  Stethoscope,
  Star,
  BriefcaseBusiness,
  BadgeCheck,
  Globe2,
  MapPin,
  Ban,
  Check,
  Circle,
  CreditCard,
  CalendarDays,
  Clock3,
  Wallet,
  Landmark,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  X,
} from 'lucide-react';
import {
  generateDemoTransactionId,
  upsertDemoPaymentRecord,
  type DemoPaymentMethod,
} from '../utils/paymentDemoStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');
const IST_OFFSET_MINUTES = 330;
const IST_OFFSET_MS = IST_OFFSET_MINUTES * 60 * 1000;
const MIN_BOOKING_LEAD_MINUTES = 30;
const MIN_BOOKING_LEAD_MS = MIN_BOOKING_LEAD_MINUTES * 60 * 1000;

interface Doctor {
  _id: string;
  name: string;
  profileImage?: string;
  specialty: string;
  hospital: string;
  city: string;
  rate: number;
  reviewCount: number;
  languages: string[];
  consultationFee: number;
  teleconsultationFee?: number;
  inClinicFee?: number;
  videoConsultationFee?: number;
  experience: number;
  education: string;
  qualifications?: { degree?: string; specialization?: string; university?: string; year?: string }[];
  clinicAddress?: string;
  about: string;
  verified: boolean;
  touristFriendly: boolean;
  availableToday: boolean;
  distanceKm?: number | null;
  reviews: any[];
}

export default function DoctorProfile() {
  useTitle('Doctor Profile');
  const { id } = useParams();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { isAuthenticated, goToAuthWall } = useAuthWall();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedMode, setSelectedMode] = useState('Video Call');
  const [booking, setBooking] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<DemoPaymentMethod>('card');
  const [paymentInput, setPaymentInput] = useState('');
  const [pendingPayment, setPendingPayment] = useState<{
    appointmentId: string;
    amount: number;
    mode: string;
    doctorName: string;
    bookedDate: string;
    timeLabel: string;
  } | null>(null);

  const inClinicFee = doctor?.inClinicFee ?? doctor?.consultationFee ?? 0;
  const videoFee = doctor?.videoConsultationFee ?? doctor?.teleconsultationFee ?? doctor?.consultationFee ?? 0;
  const payableFee = selectedMode === 'Video Call' ? videoFee : inClinicFee;

  const getCurrentIstDateString = () => {
    const istNow = new Date(Date.now() + IST_OFFSET_MS);
    const year = istNow.getUTCFullYear();
    const month = String(istNow.getUTCMonth() + 1).padStart(2, '0');
    const day = String(istNow.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const toUtcMsFromIstDateTime = (dateValue: string, timeValue: string) => {
    const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateValue || '').trim());
    const timeMatch = /^(\d{1,2}):(\d{2})$/.exec(String(timeValue || '').trim());

    if (!dateMatch || !timeMatch) return null;

    const year = Number(dateMatch[1]);
    const month = Number(dateMatch[2]);
    const day = Number(dateMatch[3]);
    const hour = Number(timeMatch[1]);
    const minute = Number(timeMatch[2]);

    if (
      !year ||
      month < 1 || month > 12 ||
      day < 1 || day > 31 ||
      hour < 0 || hour > 23 ||
      minute < 0 || minute > 59
    ) {
      return null;
    }

    return Date.UTC(year, month - 1, day, hour, minute, 0, 0) - IST_OFFSET_MS;
  };

  const isBookableFutureSlot = (dateValue: string, timeValue: string) => {
    const slotMs = toUtcMsFromIstDateTime(dateValue, timeValue);
    if (slotMs === null) return false;
    return slotMs >= Date.now() + MIN_BOOKING_LEAD_MS;
  };

  const minSelectableDate = getCurrentIstDateString();

  const resolveDoctorImage = (imagePath?: string) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    return `${BACKEND_BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  const formatSlotLabel = (slot: string) => {
    const [hourStr, minute = '00'] = slot.split(':');
    const hour = Number(hourStr);
    if (Number.isNaN(hour)) return slot;
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minute} ${period}`;
  };

  const getPaymentPlaceholder = () => {
    switch (paymentMethod) {
      case 'upi':
        return 'demo@upi';
      case 'netbanking':
        return 'Choose demo bank reference';
      case 'wallet':
        return 'Wallet mobile/email';
      default:
        return '**** **** **** 1234';
    }
  };

  const completeDemoPayment = async () => {
    if (!pendingPayment) return;

    try {
      setPaymentProcessing(true);
      await new Promise((resolve) => window.setTimeout(resolve, 1500));

      const transactionId = generateDemoTransactionId();

      upsertDemoPaymentRecord({
        appointmentId: pendingPayment.appointmentId,
        transactionId,
        paymentMethod,
        paidAmount: pendingPayment.amount,
        paidAt: new Date().toISOString(),
        status: 'completed',
        isDemo: true,
      });

      setShowPaymentModal(false);
      setPendingPayment(null);
      setPaymentInput('');
      toast.success(`Demo payment successful (${transactionId})`);
      navigate('/appointments');
    } catch (error) {
      toast.error('Unable to complete demo payment. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Fetch doctor data
  useEffect(() => {
    setImageFailed(false);
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(`${API_BASE_URL}/doctors/${id}`);

        if (!response.ok) {
          throw new Error('Doctor not found');
        }

        const result = await response.json();
        setDoctor(result.data);
      } catch (err) {
        setError('Error loading doctor details. Please try again.');
        console.error('Error fetching doctor:', err);
        toast.error('Failed to load doctor profile');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (selectedDate && selectedDate < getCurrentIstDateString()) {
        setAvailableSlots([]);
        setSelectedTime('');
        return;
      }

      if (!doctor?._id || !selectedDate || !doctor.availableToday) {
        setAvailableSlots([]);
        setSelectedTime('');
        return;
      }

      try {
        setSlotsLoading(true);
        const response = await appointmentService.getDoctorAvailableSlots(doctor._id, selectedDate);
        const slots = response?.data?.slots || [];
        setAvailableSlots(slots);
        if (selectedTime && !slots.includes(selectedTime)) {
          setSelectedTime('');
        }
      } catch (slotError: any) {
        console.error('Error fetching available slots:', slotError);
        setAvailableSlots([]);
        setSelectedTime('');
        toast.error(slotError?.response?.data?.message || 'Failed to fetch available slots');
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
  }, [doctor?._id, doctor?.availableToday, selectedDate]);

  const handleBookAppointment = async () => {
    if (!isAuthenticated) {
      goToAuthWall({ feature: 'booking', doctorId: doctor?._id, returnTo: `/doctor/${id}` });
      return;
    }

    if (!selectedDate || !selectedTime || !doctor?._id) {
      toast.error('Please select date and time');
      return;
    }

    if (selectedDate < minSelectableDate) {
      toast.error('Past dates are not allowed for booking.');
      return;
    }

    if (!isBookableFutureSlot(selectedDate, selectedTime)) {
      toast.error(`Appointments must be at least ${MIN_BOOKING_LEAD_MINUTES} minutes in advance (IST).`);
      return;
    }

    const bookedDate = new Date(selectedDate).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const accepted = await confirm({
      title: 'Confirm appointment booking?',
      description: `${selectedMode} with ${doctor.name} on ${bookedDate} at ${formatSlotLabel(selectedTime)}.`,
      confirmText: 'Book appointment',
      cancelText: 'Review details',
    });

    if (!accepted) {
      return;
    }

    try {
      setBooking(true);
      const response = await appointmentService.bookAppointment({
        doctorId: doctor._id,
        appointmentDate: selectedDate,
        timeSlot: selectedTime,
        appointmentType: selectedMode === 'Video Call' ? 'Teleconsultation' : 'In-Person',
        reason: `Consultation with ${doctor.specialty}`,
      });

      if (response.success) {
        const appointmentId =
          response?.data?._id ||
          response?.data?.appointment?._id ||
          response?.appointment?._id;

        if (!appointmentId) {
          toast.success('Appointment booked successfully');
          navigate('/appointments');
          return;
        }

        setPendingPayment({
          appointmentId,
          amount: payableFee,
          mode: selectedMode,
          doctorName: doctor.name,
          bookedDate,
          timeLabel: formatSlotLabel(selectedTime),
        });
        setPaymentMethod('card');
        setPaymentInput('');
        setShowPaymentModal(true);
        toast.success('Appointment reserved. Complete demo payment to finish booking.');
      } else {
        toast.error(response.message || 'Booking failed');
      }
    } catch (error: any) {
      console.error('Booking error:', error);
      toast.error(error?.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin w-14 h-14 text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading doctor profile...</p>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-8 shadow-md border border-gray-200 max-w-md">
          <TriangleAlert className="w-14 h-14 text-red-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Profile</h3>
          <p className="text-gray-600 mb-6">{error || 'Doctor profile not found'}</p>
          <button
            onClick={() => navigate('/find-doctors')}
            className="bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-primary-700 transition inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Doctors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-teal-50/40 pt-20">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <button
          onClick={() => navigate('/find-doctors')}
          className="inline-flex items-center gap-2 text-primary-700 font-semibold hover:text-primary-800 bg-white border border-primary-100 rounded-full px-4 py-2 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Doctors
        </button>
      </div>

      {/* Doctor Header */}
      <div className="bg-white/90 border-y border-gray-200/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar */}
            {doctor.profileImage && !imageFailed ? (
              <img
                src={resolveDoctorImage(doctor.profileImage)}
                alt={doctor.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg flex-shrink-0"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <div className="bg-gradient-to-br from-primary-400 to-primary-600 w-32 h-32 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                <Stethoscope className="w-14 h-14 text-white" />
              </div>
            )}

            {/* Doctor Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">{doctor.name}</h1>
              <p className="text-primary-700 font-semibold text-lg mb-2">{doctor.specialty}</p>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {doctor.verified && (
                  <span className="bg-emerald-100 text-emerald-700 px-3.5 py-1.5 rounded-full font-semibold text-sm inline-flex items-center gap-1.5 border border-emerald-200">
                    <BadgeCheck className="w-4 h-4" /> Verified Doctor
                  </span>
                )}
                {doctor.touristFriendly && (
                  <span className="bg-blue-100 text-blue-700 px-3.5 py-1.5 rounded-full font-semibold text-sm inline-flex items-center gap-1.5 border border-blue-200">
                    <Globe2 className="w-4 h-4" /> Tourist Friendly
                  </span>
                )}
              </div>
              <p className="text-gray-700 mb-5">{doctor.hospital}</p>
              {typeof doctor.distanceKm === 'number' ? (
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3.5 py-1.5 text-sm font-semibold text-cyan-800">
                  <span className="w-2 h-2 rounded-full bg-cyan-600" />
                  {doctor.distanceKm.toFixed(1)} km away from you
                </div>
              ) : null}

              {/* Rating and Reviews */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="rounded-2xl border border-amber-100 bg-amber-50/60 px-4 py-3">
                  <div className="text-2xl font-bold text-gray-900 inline-flex items-center gap-2">
                    <Star className="w-6 h-6 text-amber-500 fill-amber-500" /> {doctor.rate.toFixed(1)}
                  </div>
                  <p className="text-sm text-gray-600">{doctor.reviewCount} reviews</p>
                </div>
                <div className="rounded-2xl border border-primary-100 bg-primary-50/50 px-4 py-3">
                  <div className="text-2xl font-bold text-gray-900 inline-flex items-center gap-2">
                    <BriefcaseBusiness className="w-6 h-6 text-primary-600" /> {doctor.experience} years
                  </div>
                  <p className="text-sm text-gray-600">Experience</p>
                </div>
                <div className="rounded-2xl border border-teal-100 bg-teal-50/60 px-4 py-3">
                  <div className="text-2xl font-bold text-teal-700">
                    ₹ {inClinicFee}
                  </div>
                  <p className="text-sm text-gray-600">In-Clinic Fee</p>
                </div>
              </div>

              {/* Availability */}
              <div className="flex flex-wrap gap-2">
                {!doctor.availableToday && (
                  <span className="bg-red-100 text-red-700 px-4 py-2 rounded-full font-semibold text-sm inline-flex items-center gap-1.5 border border-red-200">
                    <Ban className="w-4 h-4" /> Unavailable Today
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed">
                {doctor.about || `${doctor.name} is an experienced ${doctor.specialty} specialist with ${doctor.experience} years of medical practice.`}
              </p>
            </div>

            {/* Education Section */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Education & Qualifications</h2>
              <div className="space-y-3">
                {doctor?.qualifications && doctor.qualifications.length > 0 ? (
                  doctor.qualifications.map((q, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary-600 mt-0.5" />
                      <span className="text-gray-700">
                        {[
                          q.degree,
                          q.specialization ? q.specialization : undefined,
                          q.university,
                          q.year,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    </div>
                  ))
                ) : (
                  doctor?.education && (
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary-600 mt-0.5" />
                      <span className="text-gray-700">{doctor.education}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Clinic Address Section */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Clinic Address</h2>
              <div className="text-gray-700 inline-flex items-start gap-3">
                <MapPin className="w-5 h-5 text-cyan-700 mt-0.5" />
                <span>
                  {doctor?.clinicAddress || `${doctor?.hospital}, ${doctor?.city}`}
                </span>
              </div>
            </div>

            {/* Languages Section */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Languages</h2>
              <div className="flex flex-wrap gap-2">
                {doctor.languages.map((lang) => (
                  <span
                    key={lang}
                    className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-semibold text-sm inline-flex items-center gap-1.5"
                  >
                    <Globe2 className="w-4 h-4" /> {lang}
                  </span>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Patient Reviews</h2>
              {doctor.reviews && doctor.reviews.length > 0 ? (
                <div className="space-y-6">
                  {doctor.reviews.map((review: any, idx: number) => (
                    <div key={idx} className="pb-6 border-b border-gray-200 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-gray-900">{review.patientName || 'Anonymous'}</div>
                        <span className="text-sm text-gray-600">
                          {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recently'}
                        </span>
                      </div>
                      <div className="mb-2">
                        <div className="inline-flex items-center gap-1 text-yellow-500">
                          {Array.from({ length: review.rating || 5 }).map((_, starIdx) => (
                            <Star key={starIdx} className="w-4 h-4 fill-yellow-500" />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700">{review.comment || 'Excellent service'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No reviews yet. Be the first to review!</p>
              )}
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="h-fit">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200/80 p-5 sm:p-7 sticky top-24">
              <div className="rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-4 sm:p-5 mb-6">
                <h3 className="text-xl sm:text-2xl font-bold">Book Appointment</h3>
                <p className="text-sm text-teal-50 mt-1">Choose your preferred date, slot, and consultation mode.</p>
              </div>

              {typeof doctor.distanceKm === 'number' ? (
                <div className="mb-4">
                  <div className="inline-flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-cyan-700" />
                    <span className="bg-cyan-50 border border-cyan-100 text-cyan-800 px-3 py-1 rounded-full font-semibold text-sm">
                      {doctor.distanceKm.toFixed(1)} km away
                    </span>
                  </div>
                </div>
              ) : null}

              {/* Next Available */}
              <div className={`mb-6 p-4 rounded-xl border ${doctor.availableToday ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <p className="text-xs uppercase tracking-wide text-gray-600 mb-1">Current Status</p>
                <p className={`font-bold text-lg inline-flex items-center gap-2 ${doctor.availableToday ? 'text-green-700' : 'text-red-700'}`}>
                  {doctor.availableToday ? <Circle className="w-4 h-4 fill-green-600" /> : <Ban className="w-4 h-4" />}
                  {doctor.availableToday ? 'Available Today' : 'Unavailable Today'}
                </p>
              </div>

              {/* Date Picker */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-700 mb-2 inline-flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-primary-600" /> Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    const nextDate = e.target.value;
                    if (nextDate && nextDate < minSelectableDate) {
                      toast.error('Please choose today or a future date.');
                      setSelectedDate('');
                      setSelectedTime('');
                      return;
                    }
                    setSelectedDate(nextDate);
                    setSelectedTime('');
                  }}
                  disabled={!doctor.availableToday}
                  min={minSelectableDate}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                />
              </div>

              {/* Time Picker */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-700 mb-2 inline-flex items-center gap-2">
                  <Clock3 className="w-4 h-4 text-primary-600" /> Select Time
                </label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  disabled={!doctor.availableToday || !selectedDate || slotsLoading || availableSlots.length === 0}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                >
                  <option value="">
                    {!doctor.availableToday
                      ? 'Doctor unavailable today'
                      : slotsLoading
                      ? 'Loading slots...'
                      : !selectedDate
                        ? 'Select date first...'
                        : availableSlots.length === 0
                          ? 'No slots available'
                          : 'Choose time slot...'}
                  </option>
                  {availableSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {formatSlotLabel(slot)}
                    </option>
                  ))}
                </select>
                {doctor.availableToday && selectedDate && !slotsLoading && availableSlots.length === 0 ? (
                  <p className="text-xs text-amber-700 mt-2">No eligible slots available for the selected day (past/too-soon slots are blocked).</p>
                ) : null}
                {!doctor.availableToday ? (
                  <p className="text-xs text-red-700 mt-2">This doctor has marked themselves unavailable today.</p>
                ) : null}
              </div>

              {/* Consultation Mode */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Consultation Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Video Call', 'In-Clinic'].map((mode) => {
                    const isActive = selectedMode === mode;
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setSelectedMode(mode)}
                        disabled={!doctor.availableToday}
                        className={`px-3 py-2 rounded-xl border text-sm font-semibold transition ${
                          isActive
                            ? 'bg-primary-600 border-primary-600 text-white shadow-sm'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        } disabled:opacity-60 disabled:cursor-not-allowed`}
                      >
                        {mode}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Total */}
              <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                  <div className={`rounded-xl border p-3 ${selectedMode === 'In-Clinic' ? 'bg-primary-50 border-primary-200' : 'bg-white border-primary-100'}`}>
                    <p className="text-[11px] uppercase tracking-wide text-primary-700 font-semibold">In-Clinic</p>
                    <p className="text-lg font-extrabold text-primary-700">₹{inClinicFee}</p>
                  </div>
                  <div className={`rounded-xl border p-3 ${selectedMode === 'Video Call' ? 'bg-cyan-50 border-cyan-200' : 'bg-white border-cyan-100'}`}>
                    <p className="text-[11px] uppercase tracking-wide text-cyan-700 font-semibold">Video Call</p>
                    <p className="text-lg font-extrabold text-cyan-700">₹{videoFee}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                  <span className="text-gray-800 font-semibold inline-flex items-center gap-1.5 text-sm sm:text-base">
                    <Wallet className="w-4 h-4 text-teal-600" /> Payable Now
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-teal-700">₹{payableFee}</span>
                </div>

                <p className="text-xs text-gray-600 mt-2">
                  Selected mode: <span className="font-semibold text-gray-800">{selectedMode}</span>
                </p>
              </div>

              {/* Book Button */}
              <button
                onClick={handleBookAppointment}
                disabled={!doctor.availableToday || !selectedDate || !selectedTime || booking}
                className="w-full bg-gradient-to-r from-primary-600 via-primary-700 to-cyan-700 text-white font-bold py-3.5 px-6 rounded-xl hover:brightness-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!isAuthenticated
                  ? 'Create Account to Book'
                  : booking
                  ? 'Booking...'
                  : `Book Appointment - ₹${payableFee}`}
              </button>

              {!isAuthenticated ? (
                <p className="text-xs text-amber-700 mt-3 text-center">
                  Browse doctor details freely. Booking is available after quick registration.
                </p>
              ) : null}

              {/* Disclaimer */}
              <p className="text-xs text-gray-600 mt-4 text-center inline-flex items-center justify-center gap-1.5 w-full">
                <CreditCard className="w-3.5 h-3.5" /> Payment will be processed after confirmation
              </p>
            </div>
          </div>
        </div>
      </div>

      {showPaymentModal && pendingPayment ? (
        <div className="fixed inset-0 z-[60] bg-black/45 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-gray-200 p-5 sm:p-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-teal-700 bg-teal-50 border border-teal-100 inline-flex px-2.5 py-1 rounded-full">
                  Demo Payment
                </p>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">Complete Booking Payment</h3>
                <p className="text-sm text-gray-600 mt-1">No real transaction will happen. This is a realistic demo flow.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (paymentProcessing) return;
                  setShowPaymentModal(false);
                }}
                className="text-gray-500 hover:text-gray-800"
                aria-label="Close payment modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-slate-50 p-4 mb-4 space-y-1.5">
              <p className="text-sm text-gray-700 font-semibold">{pendingPayment.mode} with {pendingPayment.doctorName}</p>
              <p className="text-xs text-gray-600">{pendingPayment.bookedDate} at {pendingPayment.timeLabel}</p>
              <p className="text-2xl font-extrabold text-teal-700 mt-2">₹{pendingPayment.amount}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Payment Method</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'card', label: 'Card', icon: CreditCard },
                  { value: 'upi', label: 'UPI', icon: Smartphone },
                  { value: 'netbanking', label: 'Net Banking', icon: Landmark },
                  { value: 'wallet', label: 'Wallet', icon: Wallet },
                ].map((methodOption) => {
                  const isActive = paymentMethod === methodOption.value;
                  const Icon = methodOption.icon;
                  return (
                    <button
                      key={methodOption.value}
                      type="button"
                      onClick={() => setPaymentMethod(methodOption.value as DemoPaymentMethod)}
                      className={`rounded-xl border px-3 py-2.5 text-sm font-semibold inline-flex items-center justify-center gap-2 transition ${
                        isActive
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" /> {methodOption.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Details (Demo)</label>
              <input
                type="text"
                value={paymentInput}
                onChange={(e) => setPaymentInput(e.target.value)}
                placeholder={getPaymentPlaceholder()}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2.5 text-xs text-emerald-800 inline-flex items-center gap-2 mb-5 w-full">
              <ShieldCheck className="w-4 h-4" />
              Always-success demo mode is active for live presentation.
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => {
                  if (paymentProcessing) return;
                  setShowPaymentModal(false);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
              >
                Pay Later
              </button>
              <button
                type="button"
                onClick={completeDemoPayment}
                disabled={paymentProcessing}
                className="w-full bg-gradient-to-r from-primary-600 to-cyan-700 text-white font-semibold py-2.5 px-4 rounded-xl hover:brightness-105 transition disabled:opacity-70 inline-flex items-center justify-center gap-2"
              >
                {paymentProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {paymentProcessing ? 'Processing Payment...' : `Pay ₹${pendingPayment.amount}`}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
