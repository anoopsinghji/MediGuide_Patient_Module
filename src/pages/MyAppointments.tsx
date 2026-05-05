import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useTitle } from '../hooks';
import { useConfirm } from '../components/confirm/ConfirmProvider';
import { appointmentService } from '../services';
import reviewService from '../services/reviewService';
import {
  CalendarDays,
  Search,
  Loader2,
  Clock3,
  MessageCircle,
  CalendarClock,
  XCircle,
  Star,
  ClipboardList,
  Lightbulb,
  Bell,
  Circle,
  Check,
  CheckCircle2,
  X,
  Wallet,
  ReceiptText,
} from 'lucide-react';
import {
  generateDemoTransactionId,
  getDemoPaymentsMap,
  upsertDemoPaymentRecord,
  type DemoPaymentMethod,
  type DemoPaymentRecord,
} from '../utils/paymentDemoStore';

type AppointmentItem = {
  _id: string;
  appointmentDate: string;
  time: string;
  type: 'in-person' | 'teleconsultation';
  status: 'booked' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  consultationFee?: number;
  doctorId?: {
    _id?: string;
    name?: string;
    specialty?: string;
  };
  review?: string | { _id?: string } | null;
};

export default function MyAppointments() {
  useTitle('My Appointments');
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [searchTerm, setSearchTerm] = useState('');
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewAppointment, setReviewAppointment] = useState<AppointmentItem | null>(null);
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [paymentMap, setPaymentMap] = useState<Record<string, DemoPaymentRecord>>({});
  const previousStatusMapRef = useRef<Record<string, string>>({});

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getMyAppointments();
      if (response.success) {
        const nextAppointments = (response.data as unknown as AppointmentItem[]) || [];

        nextAppointments.forEach((appointment) => {
          const previousStatus = previousStatusMapRef.current[appointment._id];
          if (
            previousStatus &&
            previousStatus !== appointment.status &&
            appointment.status === 'confirmed' &&
            appointment.type === 'teleconsultation'
          ) {
            toast.success(`Your video consultation with ${appointment.doctorId?.name || 'your doctor'} is confirmed. Join now.`);
          }
        });

        previousStatusMapRef.current = nextAppointments.reduce<Record<string, string>>((acc, appointment) => {
          acc[appointment._id] = appointment.status;
          return acc;
        }, {});

        setAppointments(nextAppointments);
        setPaymentMap(getDemoPaymentsMap());
      } else {
        toast.error(response.message || 'Failed to load appointments');
      }
    } catch (error: any) {
      console.error('Load appointments failed:', error);
      toast.error(error?.response?.data?.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      loadAppointments();
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'booked':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'completed':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status: string): ReactNode => {
    switch (status) {
      case 'confirmed':
        return <Check className="w-4 h-4" />;
      case 'booked':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };

  const handleReschedule = () => {
    toast('Reschedule feature will be connected next.');
  };

  const handleCancel = async (id: string) => {
    const accepted = await confirm({
      title: 'Cancel this appointment?',
      description: 'This action will release your slot. You can book another consultation any time.',
      confirmText: 'Yes, cancel',
      cancelText: 'Keep appointment',
      tone: 'danger',
    });

    if (!accepted) {
      return;
    }

    try {
      const response = await appointmentService.cancelAppointment(id, 'Cancelled by user');
      if (response.success) {
        toast.success('Appointment cancelled');
        setAppointments((prev) =>
          prev.map((apt) => (apt._id === id ? { ...apt, status: 'cancelled' } : apt))
        );
      } else {
        toast.error(response.message || 'Cancel failed');
      }
    } catch (error: any) {
      console.error('Cancel failed:', error);
      toast.error(error?.response?.data?.message || 'Cancel failed');
    }
  };

  const openReviewForm = (appointment: AppointmentItem) => {
    setReviewAppointment(appointment);
    setReviewForm({ rating: 5, title: '', comment: '' });
  };

  const closeReviewForm = () => {
    if (reviewSaving) return;
    setReviewAppointment(null);
  };

  const submitReview = async () => {
    if (!reviewAppointment?.doctorId?._id) {
      toast.error('Doctor information is missing for this appointment');
      return;
    }

    if (!reviewForm.comment.trim()) {
      toast.error('Please add a comment for your review');
      return;
    }

    try {
      setReviewSaving(true);
      const response = await reviewService.submitReview({
        doctorId: reviewAppointment.doctorId._id,
        appointmentId: reviewAppointment._id,
        rating: reviewForm.rating,
        title: reviewForm.title.trim(),
        comment: reviewForm.comment.trim(),
      });

      if (response.success) {
        toast.success('Review submitted for moderation');
        setAppointments((prev) =>
          prev.map((apt) =>
            apt._id === reviewAppointment._id
              ? { ...apt, review: response.data?._id || 'submitted' }
              : apt
          )
        );
        setReviewAppointment(null);
      } else {
        toast.error(response.message || 'Failed to submit review');
      }
    } catch (error: any) {
      console.error('Review submit failed:', error);
      toast.error(error?.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewSaving(false);
    }
  };

  const filteredAppointments = useMemo(() => {
    if (!searchTerm) {
      return appointments;
    }

    const needle = searchTerm.toLowerCase();
    return appointments.filter((apt) => {
      const doctor = apt.doctorId?.name?.toLowerCase() || '';
      const specialty = apt.doctorId?.specialty?.toLowerCase() || '';
      return doctor.includes(needle) || specialty.includes(needle);
    });
  }, [appointments, searchTerm]);

  const toLabel = (status: string) =>
    status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');

  const toPaymentMethodLabel = (method: DemoPaymentMethod) => {
    switch (method) {
      case 'netbanking':
        return 'Net Banking';
      case 'upi':
        return 'UPI';
      case 'wallet':
        return 'Wallet';
      default:
        return 'Card';
    }
  };

  const handleDemoPayment = async (appointment: AppointmentItem) => {
    const accepted = await confirm({
      title: 'Complete demo payment?',
      description: 'This simulation always succeeds and stores a demo transaction reference for your presentation.',
      confirmText: 'Pay now',
      cancelText: 'Not now',
    });

    if (!accepted) return;

    const transactionId = generateDemoTransactionId();
    upsertDemoPaymentRecord({
      appointmentId: appointment._id,
      transactionId,
      paymentMethod: 'card',
      paidAmount: appointment.consultationFee || 0,
      paidAt: new Date().toISOString(),
      status: 'completed',
      isDemo: true,
    });

    setPaymentMap(getDemoPaymentsMap());
    toast.success(`Demo payment successful (${transactionId})`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold mb-2 inline-flex items-center gap-3">
            <CalendarDays className="w-9 h-9" /> My Appointments
          </h1>
          <p className="text-white text-opacity-90">Manage your upcoming consultations and medical appointments</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Search by Doctor Name or Email
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter doctor name or specialty..."
                className="w-full px-5 py-3 pl-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              />
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Appointments List */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-16 text-center">
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Loading Appointments</h3>
            <p className="text-gray-600">Please wait while we fetch your bookings.</p>
          </div>
        ) : filteredAppointments.length > 0 ? (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment._id}
                className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition"
              >
                <div className="grid grid-cols-1 md:grid-cols-6 gap-6 items-center">
                  {(() => {
                    const paymentRecord = paymentMap[appointment._id];

                    return (
                      <>
                  {/* Doctor Info */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{appointment.doctorId?.name || 'Doctor'}</h3>
                    <p className="text-sm text-gray-600">{appointment.doctorId?.specialty || 'Specialist'}</p>
                  </div>

                  {/* Date & Time */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Appointment Date
                    </p>
                    <p className="text-lg font-semibold text-gray-900 inline-flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-primary-600" />
                      {new Date(appointment.appointmentDate).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-gray-600 inline-flex items-center gap-1.5">
                      <Clock3 className="w-3.5 h-3.5" /> {appointment.time}
                    </p>
                  </div>

                  {/* Consultation Mode & Fee */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Consultation Details
                    </p>
                    <p className="text-sm text-gray-900 font-semibold">
                      {appointment.type === 'teleconsultation' ? 'Video Call' : 'In-Clinic'}
                    </p>
                    <p className="text-sm text-primary-600 font-bold">₹{appointment.consultationFee || 0}</p>
                  </div>

                  {/* Status Badge */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Status
                    </p>
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 font-bold ${getStatusColor(appointment.status)}`}>
                      <span>{getStatusIcon(appointment.status)}</span>
                      {toLabel(appointment.status)}
                    </span>
                  </div>

                  {/* Payment */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Payment
                    </p>
                    {paymentRecord ? (
                      <>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold">
                          <Wallet className="w-3.5 h-3.5" /> Paid (Demo)
                        </span>
                        <p className="text-xs text-gray-600 mt-1.5 inline-flex items-center gap-1">
                          <ReceiptText className="w-3.5 h-3.5" /> {paymentRecord.transactionId}
                        </p>
                        <p className="text-xs text-gray-500">via {toPaymentMethodLabel(paymentRecord.paymentMethod)}</p>
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold">
                        <Loader2 className="w-3.5 h-3.5" /> Pending (Demo)
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {appointment.type === 'teleconsultation' && appointment.status === 'confirmed' && paymentRecord ? (
                      <button
                        onClick={() => navigate(`/consultation/${appointment._id}`)}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition text-sm inline-flex items-center justify-center gap-1.5"
                      >
                        <MessageCircle className="w-4 h-4" /> Join Video
                      </button>
                    ) : null}

                    {appointment.type === 'teleconsultation' && appointment.status === 'confirmed' && !paymentRecord ? (
                      <div className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
                        Complete demo payment to join video
                      </div>
                    ) : null}

                    {appointment.type === 'teleconsultation' && appointment.status === 'booked' ? (
                      <div className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg">
                        Waiting for doctor confirmation
                      </div>
                    ) : null}

                    {(appointment.status === 'booked' || appointment.status === 'confirmed') && !paymentRecord ? (
                      <button
                        onClick={() => handleDemoPayment(appointment)}
                        className="bg-gradient-to-r from-teal-600 to-cyan-700 text-white px-4 py-2 rounded-lg font-semibold hover:brightness-105 transition text-sm inline-flex items-center justify-center gap-1.5"
                      >
                        <Wallet className="w-4 h-4" /> Pay Now (Demo)
                      </button>
                    ) : null}

                    {(appointment.status === 'confirmed' || appointment.status === 'booked') && (
                      <>
                        {appointment.status === 'confirmed' && paymentRecord && appointment.doctorId?._id && appointment.type !== 'teleconsultation' ? (
                          <button
                            onClick={() => navigate(`/chat?doctorId=${appointment.doctorId?._id}`)}
                            className="bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition text-sm inline-flex items-center justify-center gap-1.5"
                          >
                            <MessageCircle className="w-4 h-4" /> Chat
                          </button>
                        ) : null}
                        <button
                          onClick={() => handleReschedule()}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition text-sm inline-flex items-center justify-center gap-1.5"
                        >
                          <CalendarClock className="w-4 h-4" /> Reschedule
                        </button>
                        <button
                          onClick={() => handleCancel(appointment._id)}
                          className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-semibold hover:bg-red-200 transition text-sm border border-red-300 inline-flex items-center justify-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4" /> Cancel
                        </button>
                      </>
                    )}
                    {appointment.status === 'no-show' && (
                      <button
                        onClick={() => handleCancel(appointment._id)}
                        className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-semibold hover:bg-red-200 transition text-sm border border-red-300 inline-flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" /> Cancel
                      </button>
                    )}
                    {appointment.status === 'cancelled' && (
                      <button
                        onClick={() => handleReschedule()}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition text-sm inline-flex items-center justify-center gap-1.5"
                      >
                        <CalendarClock className="w-4 h-4" /> Rebook
                      </button>
                    )}
                    {appointment.status === 'completed' && (
                      appointment.review ? (
                        <div className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
                          Review submitted
                        </div>
                      ) : (
                        <button
                          onClick={() => openReviewForm(appointment)}
                          className="bg-amber-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-amber-600 transition text-sm inline-flex items-center justify-center gap-1.5"
                        >
                          <Star className="w-4 h-4 fill-white" /> Write Review
                        </button>
                      )
                    )}
                  </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-16 text-center">
            <ClipboardList className="w-14 h-14 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Appointments Found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'No appointments match your search.' : 'You have no scheduled appointments.'}
            </p>
            <Link
              to="/find-doctors"
              className="inline-block bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold py-3 px-8 rounded-lg hover:from-primary-700 hover:to-primary-800 transition"
            >
              Book an Appointment
            </Link>
          </div>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <Lightbulb className="w-8 h-8 mb-2 text-blue-600" />
            <h4 className="font-bold text-gray-900 mb-2">Tip</h4>
            <p className="text-sm text-gray-700">
              Join your video consultation 5 minutes early to test your camera and microphone.
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
            <ClipboardList className="w-8 h-8 mb-2 text-green-600" />
            <h4 className="font-bold text-gray-900 mb-2">Prepare</h4>
            <p className="text-sm text-gray-700">
              Keep your medical history and current medications handy during the consultation.
            </p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6">
            <Bell className="w-8 h-8 mb-2 text-purple-600" />
            <h4 className="font-bold text-gray-900 mb-2">Reminder</h4>
            <p className="text-sm text-gray-700">
              You'll receive a confirmation email and SMS reminder 24 hours before your appointment.
            </p>
          </div>
        </div>
      </div>

      {reviewAppointment ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Write a Review</h2>
                <p className="text-sm text-gray-600">
                  Share feedback for {reviewAppointment.doctorId?.name || 'this doctor'} after your completed visit.
                </p>
              </div>
              <button
                type="button"
                onClick={closeReviewForm}
                className="text-gray-500 hover:text-gray-900"
                aria-label="Close review form"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4 flex items-center gap-2 text-amber-500">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setReviewForm((prev) => ({ ...prev, rating: value }))}
                  className="transition hover:scale-110"
                  aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}
                >
                  <Star
                    className={`w-7 h-7 ${value <= reviewForm.rating ? 'fill-amber-500 text-amber-500' : 'text-gray-300'}`}
                  />
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-500 focus:outline-none"
                  placeholder="Friendly, clear, helpful"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Comment</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-500 focus:outline-none"
                  rows={5}
                  placeholder="Tell others what went well and what could improve."
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeReviewForm}
                className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitReview}
                disabled={reviewSaving}
                className="rounded-lg bg-primary-600 px-4 py-2 font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
              >
                {reviewSaving ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
