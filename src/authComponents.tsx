import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  Eye,
  EyeOff,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  UserRoundCheck,
  MessageCircleHeart,
  ChevronDown,
} from 'lucide-react';
import { LOCAL_LANGUAGE_OPTIONS, FOREIGN_LANGUAGE_OPTIONS, INDIAN_STATES } from './config/languages';
import { useCitiesByState } from './hooks/useCitiesByState';
import DoctorQualificationFieldArray, {
  type QualificationItem,
} from './components/forms/DoctorQualificationFieldArray';
import { ClinicLocationPicker } from './components/ClinicLocationPicker';

type AuthIllustrationProps = {
  authTab: 'login' | 'register';
};

export function AuthIllustration({ authTab }: AuthIllustrationProps) {
  return (
    <div className="relative h-full rounded-[2rem] overflow-hidden bg-gradient-to-br from-cyan-100 via-teal-100 to-emerald-100 border border-white/70 p-8 lg:p-10">
      <motion.div
        className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-cyan-300/35 blur-3xl"
        animate={{ scale: [1, 1.1, 1], x: [0, -8, 0], y: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-emerald-300/30 blur-3xl"
        animate={{ scale: [1, 1.05, 1], x: [0, 10, 0], y: [0, -10, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 h-full flex flex-col justify-start gap-10">
        <div>
          <span className="inline-flex items-center rounded-full border border-cyan-500/30 bg-white/75 px-4 py-2 text-xs font-bold tracking-[0.16em] uppercase text-cyan-900">
            Doctor Portal
          </span>
          <h2 className="mt-5 text-4xl leading-tight font-bold font-display text-slate-900">
            {authTab === 'login' ? 'Welcome back, doctor.' : 'Build your trusted doctor profile.'}
          </h2>
          <p className="mt-4 text-slate-700 text-base leading-relaxed max-w-lg">
            Access appointments, patient communication, prescription tools, and profile verification in one secure healthcare workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
          <motion.div
            whileHover={{ y: -4 }}
            className="rounded-2xl bg-white/80 border border-white p-4 shadow-md"
          >
            <ShieldCheck className="w-7 h-7 text-cyan-700 mb-2" />
            <p className="text-sm font-semibold text-slate-900">Secure doctor verification workflow</p>
          </motion.div>
          <motion.div
            whileHover={{ y: -4 }}
            className="rounded-2xl bg-white/80 border border-white p-4 shadow-md"
          >
            <UserRoundCheck className="w-7 h-7 text-cyan-700 mb-2" />
            <p className="text-sm font-semibold text-slate-900">Faster patient trust with complete profiles</p>
          </motion.div>
          <motion.div
            whileHover={{ y: -4 }}
            className="rounded-2xl bg-white/80 border border-white p-4 shadow-md"
          >
            <MessageCircleHeart className="w-7 h-7 text-cyan-700 mb-2" />
            <p className="text-sm font-semibold text-slate-900">Communication-ready clinical dashboard</p>
          </motion.div>
          <motion.div
            whileHover={{ y: -4 }}
            className="rounded-2xl bg-white/80 border border-white p-4 shadow-md"
          >
            <Activity className="w-7 h-7 text-cyan-700 mb-2" />
            <p className="text-sm font-semibold text-slate-900">Daily practice analytics and insights</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  loading: boolean;
  error: string;
}

export function LoginForm({ onSubmit, loading, error }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold font-display text-gray-900">Welcome Back</h2>
        <p className="text-gray-600 mt-2">Sign in to access your patient dashboard</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="doctor@hospital.com"
          required
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </button>

      
    </form>
  );
}

interface PasswordStrengthMeterProps {
  password: string;
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const getStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength;
  };

  const strength = getStrength();
  const strengthText = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength] || 'Too weak';
  const barClasses = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];
  const textClasses = ['text-red-600', 'text-orange-600', 'text-yellow-600', 'text-lime-600', 'text-green-600'];
  const activeBarClass = barClasses[strength] || 'bg-red-500';
  const activeTextClass = textClasses[strength] || 'text-red-600';

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition ${
              i < strength ? activeBarClass : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-600">
        Password strength: <span className={`font-semibold ${activeTextClass}`}>{strengthText}</span>
      </p>
    </div>
  );
}

interface RegisterStep {
  number: number;
  label: string;
}

interface RegistrationFormProps {
  onSubmit: (data: FormData) => void;
  loading: boolean;
  error: string;
}

interface MultiSelectDropdownProps {
  label: string;
  options: string[];
  value: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  helperText?: string;
  error?: string;
  required?: boolean;
}

function MultiSelectDropdown({
  label,
  options,
  value,
  onChange,
  placeholder,
  helperText,
  error,
  required = false,
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const toggleOption = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((item) => item !== option));
      return;
    }
    onChange([...value, option]);
  };

  const removeOption = (option: string) => {
    onChange(value.filter((item) => item !== option));
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required ? '*' : ''}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full min-h-[50px] px-3 py-2 border rounded-lg text-left bg-white transition flex items-center justify-between gap-2 ${
          error ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <div className="flex flex-wrap gap-2">
          {value.length === 0 ? (
            <span className="text-gray-400">{placeholder}</span>
          ) : (
            value.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 border border-primary-200 rounded-full px-2 py-1 text-xs"
              >
                {item}
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(event) => {
                    event.stopPropagation();
                    removeOption(item);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      event.stopPropagation();
                      removeOption(item);
                    }
                  }}
                  className="text-primary-700 hover:text-primary-900 font-semibold"
                >
                  x
                </span>
              </span>
            ))
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen ? (
        <div className="absolute z-30 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-56 overflow-y-auto">
          {options.map((option) => {
            const selected = value.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => toggleOption(option)}
                className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition ${
                  selected ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  readOnly
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span>{option}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {helperText ? <p className="text-gray-500 text-xs mt-1">{helperText}</p> : null}
      {error ? <p className="text-red-600 text-xs mt-1">{error}</p> : null}
    </div>
  );
}

export function RegistrationForm({ onSubmit, loading, error }: RegistrationFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    specialty: 'General Physician',
    hospital: '',
    state: '',
    city: '',
    qualifications: [
      {
        degree: '',
        specialization: '',
        university: '',
        year: '',
      },
    ] as QualificationItem[],
    experience: '',
    inClinicFee: '',
    videoConsultationFee: '',
    localLanguages: [] as string[],
    foreignLanguages: [] as string[],
    medicalNumber: '',
    council: '',
    emergencyContact: '',
    clinicAddress: '',
    clinicLat: undefined as number | undefined,
    clinicLng: undefined as number | undefined,
    about: '',
    profileImage: null as File | null,
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isQualificationsValid, setIsQualificationsValid] = useState(false);

  // Fetch cities based on selected state
  const { cities, loading: citiesLoading, error: citiesError } = useCitiesByState(formData.state);

  // Reset city when state changes
  useEffect(() => {
    if (formData.state) {
      setFormData((prev) => ({ ...prev, city: '' }));
    }
  }, [formData.state]);

  const steps: RegisterStep[] = [
    { number: 1, label: 'Profile Basics' },
    { number: 2, label: 'Professional Info' },
    { number: 3, label: 'Credentials' },
    { number: 4, label: 'Contact & Photo' },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setValidationErrors((prev) => ({ ...prev, profileImage: 'File size must be less than 2MB' }));
        return;
      }
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setValidationErrors((prev) => ({ ...prev, profileImage: 'Only JPG and PNG files are allowed' }));
        return;
      }
      setFormData((prev) => ({ ...prev, profileImage: file }));
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      setValidationErrors((prev) => ({ ...prev, profileImage: '' }));
    }
  };

  const handleLanguageSelection = (
    fieldName: 'localLanguages' | 'foreignLanguages',
    selectedValues: string[]
  ) => {
    setFormData((prev) => ({ ...prev, [fieldName]: selectedValues }));
    setValidationErrors((prev) => ({ ...prev, [fieldName]: '' }));
  };

  const handleQualificationsChange = useCallback((qualifications: QualificationItem[]) => {
    setFormData((prev) => {
      const previousSerialized = JSON.stringify(prev.qualifications || []);
      const nextSerialized = JSON.stringify(qualifications || []);
      if (previousSerialized === nextSerialized) {
        return prev;
      }
      return { ...prev, qualifications };
    });

    setValidationErrors((prev) =>
      prev.qualifications ? { ...prev, qualifications: '' } : prev
    );
  }, []);

  const handleQualificationsValidityChange = useCallback((nextIsValid: boolean) => {
    setIsQualificationsValid((prev) => (prev === nextIsValid ? prev : nextIsValid));
  }, []);

  const validateStep = (): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) errors.name = 'Name is required';
      if (!formData.email.trim()) errors.email = 'Email is required';
      if (!formData.password) errors.password = 'Password is required';
      if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    if (step === 2) {
      if (!formData.state.trim()) errors.state = 'State is required';
      if (!formData.city.trim()) errors.city = 'City is required';
      if (!formData.qualifications || formData.qualifications.length === 0 || !isQualificationsValid) {
        errors.qualifications = 'Please complete at least one valid qualification';
      }
      if (!formData.experience) errors.experience = 'Experience is required';
      if (!formData.inClinicFee) errors.inClinicFee = 'In-clinic fee is required';
      if (!formData.videoConsultationFee) {
        errors.videoConsultationFee = 'Video consultation fee is required';
      }
      if (!formData.localLanguages || formData.localLanguages.length === 0) {
        errors.localLanguages = 'At least one local language is required';
      }
    }

    if (step === 3) {
      if (!formData.medicalNumber.trim()) errors.medicalNumber = 'Medical registration number is required';
      if (!formData.council.trim()) errors.council = 'Registration council is required';
    }

    if (step === 4) {
      if (!formData.emergencyContact.trim()) errors.emergencyContact = 'Emergency contact is required';
      if (!formData.clinicAddress.trim()) errors.clinicAddress = 'Clinic address is required';
      if (!formData.profileImage) errors.profileImage = 'Profile photo is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep()) {
      const fd = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'profileImage' && value instanceof File) {
          fd.append(key, value);
        } else if (key === 'qualifications' && Array.isArray(value)) {
          fd.append('qualifications', JSON.stringify(value));
        } else if ((key === 'localLanguages' || key === 'foreignLanguages') && Array.isArray(value)) {
          fd.append(key, value.join(','));
        } else if (value !== null && value !== '') {
          fd.append(key, value as string);
        }
      });

      // Backward-compatible payload fields expected by existing backend/routes.
      const allLanguages = Array.from(
        new Set([...(formData.localLanguages || []), ...(formData.foreignLanguages || [])])
      );

      const educationSummary = formData.qualifications
        .filter((q) => q.degree && q.specialization && q.university)
        .map((q) => {
          const yearPart = q.year ? ` - ${q.year}` : '';
          return `${q.degree} (${q.specialization}), ${q.university}${yearPart}`;
        })
        .join('; ');

      fd.append('education', educationSummary || 'MBBS');
      fd.append('languages', allLanguages.join(','));
      fd.append('consultationFee', formData.inClinicFee);
      fd.append('teleConsultationFee', formData.videoConsultationFee);
      fd.append('medicalRegistrationNumber', formData.medicalNumber);
      fd.append('registrationCouncil', formData.council);
      fd.append('emergencyContactNumber', formData.emergencyContact);
      if (formData.clinicLat !== undefined) {
        fd.append('clinicLat', String(formData.clinicLat));
      }
      if (formData.clinicLng !== undefined) {
        fd.append('clinicLng', String(formData.clinicLng));
      }
      onSubmit(fd);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold font-display text-gray-900">Become a Doctor Partner</h2>
        <p className="text-gray-600 mt-2">Create your verified profile and start helping patients</p>
      </div>

      {/* Progress Indicator */}
      <div className="space-y-3">
        <div className="flex justify-between">
          {steps.map((s) => (
            <div
              key={s.number}
              className={`flex-1 h-1 rounded-full mx-1 transition ${
                s.number <= step ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs font-medium">
          {steps.map((s) => (
            <span key={s.number} className={s.number <= step ? 'text-primary-600' : 'text-gray-500'}>
              {s.label}
            </span>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22 }}
            className="space-y-5"
          >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Dr. First Last"
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition ${
                validationErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'
              }`}
            />
            {validationErrors.name && <p className="text-red-600 text-xs mt-1">{validationErrors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="you@hospital.com"
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition ${
                validationErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'
              }`}
            />
            {validationErrors.email && <p className="text-red-600 text-xs mt-1">{validationErrors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Min 6 characters"
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition pr-12 ${
                  validationErrors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {validationErrors.password && <p className="text-red-600 text-xs mt-1">{validationErrors.password}</p>}
            {formData.password && <PasswordStrengthMeter password={formData.password} />}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Re-enter password"
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition ${
                validationErrors.confirmPassword
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-primary-500'
              }`}
            />
            {validationErrors.confirmPassword && (
              <p className="text-red-600 text-xs mt-1">{validationErrors.confirmPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
            <select
              name="specialty"
              value={formData.specialty}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            >
              <option>General Physician</option>
              <option>Cardiologist</option>
              <option>Gastroenterologist</option>
              <option>Orthopedic</option>
              <option>Dermatologist</option>
              <option>ENT Specialist</option>
              <option>Ophthalmologist</option>
            </select>
          </div>
          </motion.div>
        ) : null}

        {step === 2 ? (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22 }}
            className="space-y-5"
          >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hospital / Clinic</label>
              <input
                type="text"
                name="hospital"
                value={formData.hospital}
                onChange={handleInputChange}
                placeholder="Hospital name"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition ${
                  validationErrors.state ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'
                }`}
              >
                <option value="">Select State *</option>
                {INDIAN_STATES.map((state: string) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              {validationErrors.state && <p className="text-red-600 text-xs mt-1">{validationErrors.state}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
            <select
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              disabled={!formData.state}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition ${
                validationErrors.city
                  ? 'border-red-500 focus:ring-red-500'
                  : formData.state
                    ? 'border-gray-300 focus:ring-primary-500'
                    : 'border-gray-300 bg-gray-50 cursor-not-allowed'
              }`}
            >
              <option value="">
                {!formData.state
                  ? 'Select State First'
                  : citiesLoading
                    ? 'Loading cities...'
                    : 'Select City *'}
              </option>
              {cities.map((city: string) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            {citiesError && <p className="text-amber-600 text-xs mt-1">Note: {citiesError}</p>}
            {validationErrors.city && <p className="text-red-600 text-xs mt-1">{validationErrors.city}</p>}
          </div>

          <div>
            <DoctorQualificationFieldArray
              value={formData.qualifications}
              onChange={handleQualificationsChange}
              onValidityChange={handleQualificationsValidityChange}
            />
            {validationErrors.qualifications ? (
              <p className="text-red-600 text-xs mt-1">{validationErrors.qualifications}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Experience (Years) *</label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                placeholder="8"
                min={0}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition ${
                  validationErrors.experience ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'
                }`}
              />
              {validationErrors.experience && <p className="text-red-600 text-xs mt-1">{validationErrors.experience}</p>}
            </div>
            <MultiSelectDropdown
              label="Local Languages"
              options={LOCAL_LANGUAGE_OPTIONS}
              value={formData.localLanguages}
              onChange={(values) => handleLanguageSelection('localLanguages', values)}
              placeholder="Select local languages"
              helperText="Select one or more local languages"
              error={validationErrors.localLanguages}
              required
            />
            <MultiSelectDropdown
              label="Foreign Languages"
              options={FOREIGN_LANGUAGE_OPTIONS}
              value={formData.foreignLanguages}
              onChange={(values) => handleLanguageSelection('foreignLanguages', values)}
              placeholder="Select foreign languages"
              helperText="Choose any international languages you speak"
              error={validationErrors.foreignLanguages}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">In-Clinic Fee (₹) *</label>
              <input
                type="number"
                name="inClinicFee"
                value={formData.inClinicFee}
                onChange={handleInputChange}
                placeholder="700"
                min={0}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition ${
                  validationErrors.inClinicFee
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-primary-500'
                }`}
              />
              {validationErrors.inClinicFee && (
                <p className="text-red-600 text-xs mt-1">{validationErrors.inClinicFee}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Video Consultation Fee (₹) *</label>
              <input
                type="number"
                name="videoConsultationFee"
                value={formData.videoConsultationFee}
                onChange={handleInputChange}
                placeholder="600"
                min={0}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition ${
                  validationErrors.videoConsultationFee
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-primary-500'
                }`}
              />
              {validationErrors.videoConsultationFee && (
                <p className="text-red-600 text-xs mt-1">{validationErrors.videoConsultationFee}</p>
              )}
            </div>
          </div>
          </motion.div>
        ) : null}

        {step === 3 ? (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22 }}
            className="space-y-5"
          >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Medical Registration Number *</label>
            <input
              type="text"
              name="medicalNumber"
              value={formData.medicalNumber}
              onChange={handleInputChange}
              placeholder="Council registration number"
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition ${
                validationErrors.medicalNumber ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'
              }`}
            />
            {validationErrors.medicalNumber && (
              <p className="text-red-600 text-xs mt-1">{validationErrors.medicalNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Registration Council *</label>
            <input
              type="text"
              name="council"
              value={formData.council}
              onChange={handleInputChange}
              placeholder="State Medical Council"
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition ${
                validationErrors.council ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'
              }`}
            />
            {validationErrors.council && <p className="text-red-600 text-xs mt-1">{validationErrors.council}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Professional Summary</label>
            <textarea
              name="about"
              value={formData.about}
              onChange={handleInputChange}
              placeholder="Brief profile summary (optional)"
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            />
            <p className="text-xs text-gray-500 mt-1">Max 500 characters</p>
          </div>
          </motion.div>
        ) : null}

        {step === 4 ? (
          <motion.div
            key="step-4"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22 }}
            className="space-y-5"
          >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Number *</label>
            <input
              type="text"
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleInputChange}
              placeholder="Emergency phone number"
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition ${
                validationErrors.emergencyContact
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-primary-500'
              }`}
            />
            {validationErrors.emergencyContact && (
              <p className="text-red-600 text-xs mt-1">{validationErrors.emergencyContact}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Clinic Address *</label>
            <input
              type="text"
              name="clinicAddress"
              value={formData.clinicAddress}
              onChange={handleInputChange}
              placeholder="Full clinic address"
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition ${
                validationErrors.clinicAddress
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-primary-500'
              }`}
            />
            {validationErrors.clinicAddress && (
              <p className="text-red-600 text-xs mt-1">{validationErrors.clinicAddress}</p>
            )}
          </div>

          <div>
            <ClinicLocationPicker
              initialLat={formData.clinicLat}
              initialLng={formData.clinicLng}
              clinicCity={formData.city}
              onLocationSelect={(lat, lng, address) => {
                setFormData((prev) => ({
                  ...prev,
                  clinicLat: lat,
                  clinicLng: lng,
                  clinicAddress: address,
                }));
                setValidationErrors((prev) => ({ ...prev, clinicLocation: '' }));
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo (JPG/PNG, max 2MB) *</label>
            <div className="flex gap-4">
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-24 h-24 rounded-lg object-cover border-2 border-primary-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoPreview(null);
                      setFormData((prev) => ({ ...prev, profileImage: null }));
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <label className="flex gap-2 px-4 py-2.5 bg-gray-50 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                  <Upload className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-700">Choose Photo</span>
                  <input
                    type="file"
                    name="profileImage"
                    accept="image/jpeg,image/png"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-600 mt-2">JPG or PNG, max 2MB</p>
              </div>
            </div>
            {validationErrors.profileImage && <p className="text-red-600 text-xs mt-1">{validationErrors.profileImage}</p>}
            {photoPreview && (
              <div className="flex items-center gap-1 text-sm text-green-600 mt-2">
                <CheckCircle2 className="w-4 h-4" /> Photo selected
              </div>
            )}
          </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex gap-4 pt-6">
        {step > 1 && (
          <button
            type="button"
            onClick={handlePrevStep}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
        )}
        {step < 4 ? (
          <button
            type="button"
            onClick={handleNextStep}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold rounded-lg transition"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Create Account
              </>
            )}
          </button>
        )}
      </div>
    </form>
  );
}
