import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authService } from '../services';
import { useAuthStore } from '../store/authStore';
import { useTitle } from '../hooks';
import { BadgeCheck, MessageSquareText, FileText, ShieldCheck } from 'lucide-react';

// Form validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  useTitle('Login');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setAuthState = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const returnTo = searchParams.get('returnTo') || '/home';

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const email = watch('email');
  const password = watch('password');

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data.email, data.password);

      if (response.user && response.token) {
        setAuthState.setUser(response.user);
        setAuthState.setToken(response.token);
        setAuthState.setIsAuthenticated(true);
        toast.success('Login successful!');
        navigate(returnTo);
      } else {
        toast.error(response.message || 'Login failed');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const goNext = async () => {
    const ok = await trigger('email');
    if (!ok) return;
    setDirection('forward');
    setStep(2);
  };

  const goBack = () => {
    setDirection('backward');
    setStep(1);
  };

  const stepClass = direction === 'forward' ? 'wizard-step wizard-step-forward' : 'wizard-step wizard-step-backward';

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-teal-50">
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
        <section className="relative px-8 py-12 lg:px-14 lg:py-16 bg-gradient-to-br from-sky-100 via-cyan-100 to-teal-100 border-b lg:border-b-0 lg:border-r border-white/70 overflow-hidden">
          <div className="absolute -top-16 -right-20 w-72 h-72 rounded-full bg-cyan-300/30 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-emerald-300/20 blur-3xl" />

          <div className="relative z-10 max-w-xl mx-auto lg:mx-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-white/70 px-4 py-2 text-xs tracking-widest font-bold text-cyan-800 uppercase mb-6">
              Welcome Back
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
              Continue your care journey with confidence.
            </h1>
            <p className="text-slate-700 mt-5 text-lg leading-relaxed">
              Access trusted doctors, chat history, and your health records in one secure place.
            </p>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/80 border border-white p-5 shadow-md">
                <BadgeCheck className="w-8 h-8 text-cyan-600 mb-3" strokeWidth={2.3} />
                <p className="font-semibold text-slate-900">Verified specialists across major cities</p>
              </div>
              <div className="rounded-2xl bg-white/80 border border-white p-5 shadow-md">
                <MessageSquareText className="w-8 h-8 text-cyan-600 mb-3" strokeWidth={2.3} />
                <p className="font-semibold text-slate-900">Secure doctor chat after confirmation</p>
              </div>
              <div className="rounded-2xl bg-white/80 border border-white p-5 shadow-md">
                <FileText className="w-8 h-8 text-cyan-600 mb-3" strokeWidth={2.3} />
                <p className="font-semibold text-slate-900">Prescription and visit continuity</p>
              </div>
              <div className="rounded-2xl bg-white/80 border border-white p-5 shadow-md">
                <ShieldCheck className="w-8 h-8 text-cyan-600 mb-3" strokeWidth={2.3} />
                <p className="font-semibold text-slate-900">Trusted, privacy-first account security</p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-8 md:px-8 lg:px-12 lg:py-12 flex items-center justify-center">
          <div className="w-full max-w-xl rounded-3xl bg-white border border-slate-100 shadow-2xl p-6 md:p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-slate-700">Step {step} of 2</p>
                <p className="text-sm text-slate-500">{step === 1 ? 'Account Email' : 'Password Verification'}</p>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-600 to-emerald-600 transition-all duration-300"
                  style={{ width: `${step === 1 ? 50 : 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <span className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center ${step >= 1 ? 'bg-cyan-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    1
                  </span>
                  <span className="text-xs text-slate-500">Email</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center ${step >= 2 ? 'bg-cyan-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    2
                  </span>
                  <span className="text-xs text-slate-500">Password</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              {step === 1 ? (
                <div className={`${stepClass} space-y-5`}>
                  <h2 className="text-2xl font-bold text-slate-900">Sign in to MediGuide</h2>
                  <p className="text-sm text-slate-600">Enter your account email to continue.</p>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      placeholder="your.email@example.com"
                      {...register('email')}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition ${
                        errors.email ? 'border-red-500' : 'border-slate-200'
                      }`}
                    />
                    {errors.email ? <p className="text-red-500 text-sm mt-2">{errors.email.message}</p> : null}
                  </div>

                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!email?.trim()}
                    className="w-full bg-gradient-to-r from-cyan-600 to-emerald-600 text-white font-bold py-3 rounded-xl hover:from-cyan-700 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              ) : null}

              {step === 2 ? (
                <div className={`${stepClass} space-y-5`}>
                  <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
                  <p className="text-sm text-slate-600">
                    Signing in as <span className="font-semibold text-slate-800">{email || 'your account'}</span>
                  </p>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-semibold text-slate-700">Password</label>
                      <Link to="/forgot-password" className="text-sm text-cyan-700 hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <input
                      type="password"
                      placeholder="••••••••"
                      {...register('password')}
                      className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition ${
                        errors.password ? 'border-red-500' : 'border-slate-200'
                      }`}
                    />
                    {errors.password ? <p className="text-red-500 text-sm mt-2">{errors.password.message}</p> : null}
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={goBack}
                      className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || !password?.trim()}
                      className="flex-1 bg-gradient-to-r from-cyan-600 to-emerald-600 text-white font-bold py-3 rounded-xl hover:from-cyan-700 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="mt-7 text-center text-sm text-slate-600">
                New to MediGuide?{' '}
                <Link
                  to={`/register?returnTo=${encodeURIComponent(returnTo)}`}
                  className="font-semibold text-cyan-700 hover:text-cyan-900"
                >
                  Create account
                </Link>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
