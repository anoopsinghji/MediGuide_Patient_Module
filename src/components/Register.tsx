import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authService } from '../services';
import { useAuthStore } from '../store/authStore';
import { useTitle } from '../hooks';
import { BadgeCheck, MapPinned, MessageSquareText, Smartphone } from 'lucide-react';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    phone: z.string().regex(/^[0-9+\-\s()]+$/, 'Invalid phone number'),
    preferredLanguage: z.string().min(1, 'Please select a language'),
    currentLocation: z.string().optional(),
    nationality: z.string().optional(),
    age: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(parseInt(val, 10)), 'Age must be a valid number'),
    gender: z.enum(['male', 'female', 'other']).optional(),
    existingConditions: z.array(z.string()).optional(),
    emergencyContactNumber: z
      .string()
      .regex(/^[0-9+\-\s()]+$/, 'Invalid phone number')
      .optional()
      .or(z.literal('')),
    bloodGroup: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const LANGUAGES = ['English', 'Hindi', 'French', 'Spanish', 'German', 'Portuguese', 'Chinese'];
const GENDERS: Array<'male' | 'female' | 'other'> = ['male', 'female', 'other'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const COMMON_CONDITIONS = [
  'Diabetes',
  'High Blood Pressure',
  'Heart Disease',
  'Asthma',
  'Thyroid',
  'Kidney Disease',
  'Allergy',
];

const STEP_LABELS = [
  'Account Information',
  'Travel Information',
  'Health Information',
  'Emergency Information',
  'Review & Submit',
];

export default function Register() {
  useTitle('Register');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setAuthState = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [locationLoading, setLocationLoading] = useState(false);
  const returnTo = searchParams.get('returnTo') || '/home';

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      existingConditions: [],
    },
  });

  const watchValues = watch();
  const watchExistingConditions = watch('existingConditions') || [];

  const detectCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported in this browser');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const city =
            data?.address?.city ||
            data?.address?.town ||
            data?.address?.village ||
            data?.address?.state ||
            '';
          const country = data?.address?.country || '';
          const location = [city, country].filter(Boolean).join(', ');

          setValue(
            'currentLocation',
            location || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            { shouldValidate: true }
          );
          toast.success('Location detected');
        } catch (error) {
          console.error('Location resolution failed:', error);
          toast.error('Could not resolve your location');
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        toast.error('Location permission denied');
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  useEffect(() => {
    detectCurrentLocation();
  }, []);

  const toggleCondition = (condition: string) => {
    if (watchExistingConditions.includes(condition)) {
      setValue(
        'existingConditions',
        watchExistingConditions.filter((c) => c !== condition),
        { shouldValidate: true }
      );
      return;
    }

    setValue('existingConditions', [...watchExistingConditions, condition], { shouldValidate: true });
  };

  const canProceedStep = useMemo(() => {
    if (step === 1) {
      const hasRequired =
        !!watchValues.name?.trim() &&
        !!watchValues.email?.trim() &&
        !!watchValues.password &&
        !!watchValues.confirmPassword &&
        !!watchValues.phone?.trim();
      return hasRequired;
    }

    if (step === 2) {
      return !!watchValues.preferredLanguage;
    }

    return true;
  }, [step, watchValues]);

  const goNext = async () => {
    if (step === 1) {
      const ok = await trigger(['name', 'email', 'password', 'confirmPassword', 'phone']);
      if (!ok) return;
    }

    if (step === 2) {
      const ok = await trigger(['preferredLanguage', 'currentLocation', 'nationality']);
      if (!ok) return;
    }

    if (step === 3) {
      const ok = await trigger(['age', 'gender', 'existingConditions']);
      if (!ok) return;
    }

    if (step === 4) {
      const ok = await trigger(['emergencyContactNumber', 'bloodGroup']);
      if (!ok) return;
    }

    setDirection('forward');
    setStep((prev) => Math.min(prev + 1, 5));
  };

  const goBack = () => {
    setDirection('backward');
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const response = await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        preferredLanguage: data.preferredLanguage,
        currentLocation: data.currentLocation,
        nationality: data.nationality,
        age: data.age ? parseInt(data.age, 10) : undefined,
        gender: data.gender,
        existingConditions: data.existingConditions,
        emergencyContactNumber: data.emergencyContactNumber,
        bloodGroup: data.bloodGroup,
      });

      if (response.success && response.user && response.token) {
        setAuthState.setUser(response.user);
        setAuthState.setToken(response.token);
        setAuthState.setIsAuthenticated(true);
        toast.success('Registration successful!');
        navigate(returnTo);
      } else {
        toast.error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const progressPercent = Math.round((step / 5) * 100);
  const stepAnimClass =
    direction === 'forward'
      ? 'wizard-step wizard-step-forward'
      : 'wizard-step wizard-step-backward';

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-emerald-50">
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
        <section className="relative overflow-hidden px-8 py-12 lg:px-14 lg:py-16 bg-gradient-to-br from-sky-100 via-cyan-100 to-emerald-100 border-b lg:border-b-0 lg:border-r border-white/70">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-cyan-300/30 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-emerald-300/20 blur-3xl" />

          <div className="relative z-10 max-w-xl mx-auto lg:mx-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-white/70 px-4 py-2 text-xs tracking-widest font-bold text-cyan-800 uppercase mb-6">
              MediGuide Onboarding
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
              Get trusted healthcare anywhere, anytime.
            </h1>

            <p className="text-slate-700 mt-5 text-lg leading-relaxed">
              Start your secure onboarding with a guided setup built for travelers who need trusted care in unfamiliar cities.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/80 border border-white p-5 shadow-md">
                <BadgeCheck className="w-8 h-8 text-cyan-600 mb-3" strokeWidth={2.3} />
                <p className="font-semibold text-slate-900">Verified doctors, carefully vetted</p>
              </div>
              <div className="rounded-2xl bg-white/80 border border-white p-5 shadow-md">
                <MapPinned className="w-8 h-8 text-cyan-600 mb-3" strokeWidth={2.3} />
                <p className="font-semibold text-slate-900">Location-aware recommendations</p>
              </div>
              <div className="rounded-2xl bg-white/80 border border-white p-5 shadow-md">
                <MessageSquareText className="w-8 h-8 text-cyan-600 mb-3" strokeWidth={2.3} />
                <p className="font-semibold text-slate-900">Seamless doctor chat and follow-up</p>
              </div>
              <div className="rounded-2xl bg-white/80 border border-white p-5 shadow-md">
                <Smartphone className="w-8 h-8 text-cyan-600 mb-3" strokeWidth={2.3} />
                <p className="font-semibold text-slate-900">AI-powered digital health assistance</p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-8 md:px-8 lg:px-12 lg:py-12 flex items-center justify-center">
          <div className="w-full max-w-2xl rounded-3xl bg-white border border-slate-100 shadow-2xl p-6 md:p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-slate-700">Step {step} of 5</p>
                <p className="text-sm text-slate-500">{STEP_LABELS[step - 1]}</p>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-4 gap-2">
                {STEP_LABELS.map((label, idx) => {
                  const index = idx + 1;
                  const active = step === index;
                  const done = step > index;
                  return (
                    <div key={label} className="flex-1 text-center">
                      <div
                        className={`mx-auto w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center border transition ${
                          done
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : active
                            ? 'bg-cyan-600 border-cyan-600 text-white'
                            : 'bg-white border-slate-300 text-slate-500'
                        }`}
                      >
                        {index}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              {step === 1 ? (
                <div className={`${stepAnimClass} space-y-4`}>
                  <h2 className="text-2xl font-bold text-slate-900">Account Information</h2>
                  <p className="text-sm text-slate-600">Create your secure account to start your care journey.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-1.5">Full Name</label>
                      <input
                        {...register('name')}
                        placeholder="John Doe"
                        className={`w-full rounded-xl border px-4 py-2.5 ${errors.name ? 'border-red-400' : 'border-slate-300'}`}
                      />
                      {errors.name ? <p className="text-xs text-red-500 mt-1">{errors.name.message}</p> : null}
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-1.5">Email Address</label>
                      <input
                        {...register('email')}
                        type="email"
                        placeholder="you@example.com"
                        className={`w-full rounded-xl border px-4 py-2.5 ${errors.email ? 'border-red-400' : 'border-slate-300'}`}
                      />
                      {errors.email ? <p className="text-xs text-red-500 mt-1">{errors.email.message}</p> : null}
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-1.5">Password</label>
                      <input
                        {...register('password')}
                        type="password"
                        placeholder="At least 8 characters"
                        className={`w-full rounded-xl border px-4 py-2.5 ${errors.password ? 'border-red-400' : 'border-slate-300'}`}
                      />
                      {errors.password ? <p className="text-xs text-red-500 mt-1">{errors.password.message}</p> : null}
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-1.5">Confirm Password</label>
                      <input
                        {...register('confirmPassword')}
                        type="password"
                        placeholder="Re-enter password"
                        className={`w-full rounded-xl border px-4 py-2.5 ${errors.confirmPassword ? 'border-red-400' : 'border-slate-300'}`}
                      />
                      {errors.confirmPassword ? (
                        <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1.5">Phone Number</label>
                    <input
                      {...register('phone')}
                      placeholder="+1 (555) 123-4567"
                      className={`w-full rounded-xl border px-4 py-2.5 ${errors.phone ? 'border-red-400' : 'border-slate-300'}`}
                    />
                    {errors.phone ? <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p> : null}
                  </div>
                </div>
              ) : null}

              {step === 2 ? (
                <div className={`${stepAnimClass} space-y-4`}>
                  <h2 className="text-2xl font-bold text-slate-900">Travel Information</h2>
                  <p className="text-sm text-slate-600">We use this to recommend nearby trusted doctors and language fit.</p>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1.5">Preferred Language</label>
                    <select
                      {...register('preferredLanguage')}
                      className={`w-full rounded-xl border px-4 py-2.5 ${errors.preferredLanguage ? 'border-red-400' : 'border-slate-300'}`}
                    >
                      <option value="">Select language</option>
                      {LANGUAGES.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                    </select>
                    {errors.preferredLanguage ? (
                      <p className="text-xs text-red-500 mt-1">{errors.preferredLanguage.message}</p>
                    ) : null}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm font-semibold text-slate-700">Current Location</label>
                      <span className="text-xs text-slate-500">Why we ask this? To suggest relevant nearby care.</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        {...register('currentLocation')}
                        placeholder="City, Country"
                        className="w-full rounded-xl border border-slate-300 px-4 py-2.5"
                      />
                      <button
                        type="button"
                        onClick={detectCurrentLocation}
                        className="px-3 md:px-4 rounded-xl bg-cyan-600 text-white font-semibold text-sm hover:bg-cyan-700"
                        disabled={locationLoading}
                      >
                        {locationLoading ? 'Detecting...' : 'Auto'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1.5">Nationality</label>
                    <input
                      {...register('nationality')}
                      placeholder="e.g. British"
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5"
                    />
                  </div>
                </div>
              ) : null}

              {step === 3 ? (
                <div className={`${stepAnimClass} space-y-4`}>
                  <h2 className="text-2xl font-bold text-slate-900">Health Information</h2>
                  <p className="text-sm text-slate-600">Optional details that help doctors provide better recommendations.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-1.5">Age</label>
                      <input
                        type="number"
                        {...register('age')}
                        min={1}
                        max={120}
                        placeholder="Optional"
                        className={`w-full rounded-xl border px-4 py-2.5 ${errors.age ? 'border-red-400' : 'border-slate-300'}`}
                      />
                      {errors.age ? <p className="text-xs text-red-500 mt-1">{errors.age.message}</p> : null}
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-1.5">Gender</label>
                      <div className="grid grid-cols-3 gap-2">
                        {GENDERS.map((gender) => (
                          <label
                            key={gender}
                            className="rounded-xl border border-slate-300 px-3 py-2 text-center text-sm cursor-pointer hover:border-cyan-500"
                          >
                            <input type="radio" value={gender} {...register('gender')} className="sr-only" />
                            {gender.charAt(0).toUpperCase() + gender.slice(1)}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-slate-700">Existing Medical Conditions</label>
                      <span className="text-xs text-slate-500">Why we ask this? To personalize safe care suggestions.</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {COMMON_CONDITIONS.map((condition) => (
                        <button
                          key={condition}
                          type="button"
                          onClick={() => toggleCondition(condition)}
                          className={`text-left rounded-xl border px-3 py-2 text-sm transition ${
                            watchExistingConditions.includes(condition)
                              ? 'border-cyan-500 bg-cyan-50 text-cyan-800'
                              : 'border-slate-300 hover:border-cyan-400'
                          }`}
                        >
                          {condition}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {step === 4 ? (
                <div className={`${stepAnimClass} space-y-4`}>
                  <h2 className="text-2xl font-bold text-slate-900">Emergency Information</h2>
                  <p className="text-sm text-slate-600">Optional but useful in critical situations.</p>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm font-semibold text-slate-700">Emergency Contact Number</label>
                      <span className="text-xs text-slate-500">Why we ask this? For urgent care coordination.</span>
                    </div>
                    <input
                      {...register('emergencyContactNumber')}
                      placeholder="+1 (555) 987-6543"
                      className={`w-full rounded-xl border px-4 py-2.5 ${
                        errors.emergencyContactNumber ? 'border-red-400' : 'border-slate-300'
                      }`}
                    />
                    {errors.emergencyContactNumber ? (
                      <p className="text-xs text-red-500 mt-1">{errors.emergencyContactNumber.message}</p>
                    ) : null}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1.5">Blood Group</label>
                    <select
                      {...register('bloodGroup')}
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5"
                    >
                      <option value="">Select blood group</option>
                      {BLOOD_GROUPS.map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : null}

              {step === 5 ? (
                <div className={`${stepAnimClass} space-y-4`}>
                  <h2 className="text-2xl font-bold text-slate-900">Review & Submit</h2>
                  <p className="text-sm text-slate-600">Please review your details before creating your account.</p>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-sm">
                    <p><span className="font-semibold text-slate-700">Name:</span> {watchValues.name || '-'}</p>
                    <p><span className="font-semibold text-slate-700">Email:</span> {watchValues.email || '-'}</p>
                    <p><span className="font-semibold text-slate-700">Phone:</span> {watchValues.phone || '-'}</p>
                    <p><span className="font-semibold text-slate-700">Language:</span> {watchValues.preferredLanguage || '-'}</p>
                    <p><span className="font-semibold text-slate-700">Location:</span> {watchValues.currentLocation || '-'}</p>
                    <p><span className="font-semibold text-slate-700">Nationality:</span> {watchValues.nationality || '-'}</p>
                    <p><span className="font-semibold text-slate-700">Age:</span> {watchValues.age || '-'}</p>
                    <p><span className="font-semibold text-slate-700">Gender:</span> {watchValues.gender || '-'}</p>
                    <p>
                      <span className="font-semibold text-slate-700">Existing Conditions:</span>{' '}
                      {(watchValues.existingConditions || []).join(', ') || '-'}
                    </p>
                    <p><span className="font-semibold text-slate-700">Emergency Contact:</span> {watchValues.emergencyContactNumber || '-'}</p>
                    <p><span className="font-semibold text-slate-700">Blood Group:</span> {watchValues.bloodGroup || '-'}</p>
                  </div>
                </div>
              ) : null}

              <div className="mt-8 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={step === 1}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold disabled:opacity-40"
                >
                  Back
                </button>

                {step < 5 ? (
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!canProceedStep}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 text-white font-bold disabled:opacity-50"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 text-white font-bold disabled:opacity-50"
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </button>
                )}
              </div>

              <div className="mt-5 text-center text-sm text-slate-600">
                Already have an account?{' '}
                <Link
                  to={`/login?returnTo=${encodeURIComponent(returnTo)}`}
                  className="font-semibold text-cyan-700 hover:text-cyan-900"
                >
                  Login here
                </Link>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
