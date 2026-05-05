import { useEffect, useMemo, useState } from 'react';
import { useAuth, useTitle } from '../hooks';
import { useNavigate } from 'react-router-dom';
import { doctorService } from '../services';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import HeroIllustration from '../components/illustrations/HeroIllustration';
import Flow from '../components/illustrations/Flow';
import Network from '../components/illustrations/Network';
import { MultilingualIllustration } from '../components/illustrations/MultilingualIllustration';
import {
  Languages,
  BadgeCheck,
  Wallet,
  MapPinned,
  Video,
  Siren,
  Stethoscope,
  Brain,
  CalendarCheck2,
  Bot,
  Search,
  UserRound,
  Star,
  Check,
  Loader2,
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

type RecommendedDoctor = {
  _id: string;
  name: string;
  specialty: string;
  hospital: string;
  city: string;
  state?: string;
  profileImage?: string;
  languages?: string[];
  inClinicFee?: number;
  consultationFee?: number;
  rate?: number;
  reviewCount?: number;
  verified?: boolean;
  touristFriendly?: boolean;
  trustScore?: number;
};

export default function Home() {
  useTitle('Home');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [recommendedDoctors, setRecommendedDoctors] = useState<RecommendedDoctor[]>([]);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [recommendationError, setRecommendationError] = useState('');
  const [recommendationReloadKey, setRecommendationReloadKey] = useState(0);
  const [minimumRating, setMinimumRating] = useState(4);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const profileCity = useMemo(
    () => (user?.currentLocation || '').split(',')[0]?.trim() || '',
    [user?.currentLocation]
  );

  const resolveDoctorImage = (imagePath?: string) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    return `${BACKEND_BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  const ctaHeadline = user ? `Welcome back, ${user.name || 'Traveler'}` : 'Start Your Health Journey Today';

  const cities = [
    'Bangalore',
    'Mumbai',
    'Delhi',
    'Hyderabad',
    'Chennai',
    'Kolkata',
    'Pune',
    'Jaipur',
    'Ahmedabad',
    'Lucknow',
    'Chandigarh',
    'Indore',
  ];

  useEffect(() => {
    let ignore = false;

    const loadRecommendations = async () => {
      if (!user) {
        setRecommendedDoctors([]);
        setRecommendationError('');
        setRecommendationLoading(false);
        return;
      }

      if (!profileCity) {
        setRecommendedDoctors([]);
        setRecommendationError('');
        setRecommendationLoading(false);
        return;
      }

      try {
        setRecommendationLoading(true);
        setRecommendationError('');

        const primaryResponse = await doctorService.getDoctors({
          city: profileCity,
          sortBy: 'trust',
          minRating: minimumRating > 0 ? minimumRating : undefined,
          limit: 6,
        });

        const primaryDoctors = (primaryResponse.data || []) as unknown as RecommendedDoctor[];

        if (!ignore) {
          setRecommendedDoctors(primaryDoctors);
        }
      } catch (error) {
        if (!ignore) {
          setRecommendationError('Unable to load city-matched recommendations right now.');
          setRecommendedDoctors([]);
        }
      } finally {
        if (!ignore) {
          setRecommendationLoading(false);
        }
      }
    };

    loadRecommendations();

    return () => {
      ignore = true;
    };
  }, [user, profileCity, minimumRating, recommendationReloadKey]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO SECTION */}
      <section className="relative min-h-screen bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 overflow-hidden flex items-center pt-20 pb-10">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-400 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-400 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content (Animated with Framer Motion) */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-block bg-accent-400 bg-opacity-20 border border-accent-400 border-opacity-40 px-4 py-2 rounded-full mb-6">
                <span className="text-accent-300 text-xs font-semibold tracking-widest inline-flex items-center gap-2">
                  <Bot className="w-4 h-4" /> {t('home.hero.tagline')}
                </span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                {t('home.hero.title')}<br />
                <span className="text-accent-400">{t('home.hero.subtitle')}</span>
              </h1>

              <p className="text-lg lg:text-xl text-white text-opacity-90 mb-10 leading-relaxed max-w-xl font-light">
                {t('home.hero.description')}
              </p>

              {/* Interactive Triage Search Hero */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate('/symptom-checker')}
                className="bg-white p-2 rounded-2xl shadow-2xl flex items-center gap-3 cursor-text max-w-xl w-full"
              >
                <div className="bg-primary-50 p-4 rounded-xl">
                  <Search className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex-1 px-2">
                  <p className="text-slate-400 text-sm font-bold tracking-wide uppercase mb-1">{t('home.hero.search_prompt')}</p>
                  <p className="text-slate-800 text-lg font-medium">{t('home.hero.search_placeholder')}</p>
                </div>
                <button className="hidden sm:flex bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 px-8 rounded-xl transition items-center gap-2">
                  {t('home.hero.analyze_button')}
                </button>
              </motion.div>

              {/* Micro-Stats under Triage */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="flex items-center gap-6 mt-8 text-white/80 text-sm font-medium"
              >
                 <div className="flex items-center gap-2"><BadgeCheck className="w-5 h-5 text-accent-400" /> {t('home.hero.verified_providers')}</div>
                 <div className="flex items-center gap-2"><MapPinned className="w-5 h-5 text-accent-400" /> {t('home.hero.pan_india')}</div>
              </motion.div>
            </motion.div>

            {/* Right - Custom SVG Illustration */}
            <div className="hidden lg:flex justify-center items-center w-full">
               <HeroIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* NEW: Trust Marquee Strip */}
      <div className="bg-primary-800 border-y border-primary-900 py-3 overflow-hidden text-center sm:text-left flex">
        <motion.div 
          className="flex gap-16 px-10 items-center justify-start whitespace-nowrap min-w-full"
          animate={{ x: ["0%", "-100%"] }}
          transition={{ ease: "linear", duration: 25, repeat: Infinity }}
        >
          <div className="flex items-center gap-3 text-cyan-100 font-semibold tracking-wider text-sm"><Check className="w-4 h-4 text-emerald-400"/> HIPAA ALIGNED ENCRYPTION</div>
          <div className="flex items-center gap-3 text-cyan-100 font-semibold tracking-wider text-sm"><Check className="w-4 h-4 text-emerald-400"/> INDIAN MEDICAL COUNCIL VERIFIED</div>
          <div className="flex items-center gap-3 text-cyan-100 font-semibold tracking-wider text-sm"><Check className="w-4 h-4 text-emerald-400"/> UPFRONT FEE TRANSPARENCY</div>
          <div className="flex items-center gap-3 text-cyan-100 font-semibold tracking-wider text-sm"><Check className="w-4 h-4 text-emerald-400"/> MULTILINGUAL TRIAGE SUPPORT</div>
          {/* Duplicates for smooth infinite scrolling */}
          <div className="flex items-center gap-3 text-cyan-100 font-semibold tracking-wider text-sm"><Check className="w-4 h-4 text-emerald-400"/> HIPAA ALIGNED ENCRYPTION</div>
          <div className="flex items-center gap-3 text-cyan-100 font-semibold tracking-wider text-sm"><Check className="w-4 h-4 text-emerald-400"/> INDIAN MEDICAL COUNCIL VERIFIED</div>
        </motion.div>
      </div>

      {user ? (
        <section className="py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-10">
              <div>
                <p className="text-sm font-bold tracking-widest uppercase text-primary-600">Personalized For You</p>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">
                  {profileCity
                    ? `Doctors in ${profileCity}`
                    : 'Set your city to see local doctors'}
                </h2>
                <p className="text-slate-600 mt-3 max-w-3xl">
                  {profileCity
                    ? 'Only doctors whose city matches your profile city are shown here.'
                    : 'Update your profile city to get personalized local doctor recommendations on home.'}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {profileCity ? (
                    <span className="px-3 py-1 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-xs font-semibold">
                      City: {profileCity}
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
                      Add current location in profile for city-level recommendations
                    </span>
                  )}

                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
                    <span>Minimum rating</span>
                    <select
                      value={String(minimumRating)}
                      onChange={(e) => setMinimumRating(Number(e.target.value))}
                      className="bg-white border border-slate-300 rounded-md px-2 py-0.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="0">Any</option>
                      <option value="4">4.0+</option>
                      <option value="4.5">4.5+</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/find-doctors')}
                className="px-5 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
              >
                View All Doctors
              </button>
            </div>

            {recommendationLoading ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-10 text-slate-700 inline-flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading personalized recommendations...
              </div>
            ) : null}

            {!recommendationLoading && recommendationError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-5 text-rose-700">
                <p className="font-semibold">{recommendationError}</p>
                <button
                  onClick={() => setRecommendationReloadKey((prev) => prev + 1)}
                  className="mt-3 text-sm font-semibold text-rose-700 underline"
                >
                  Retry
                </button>
              </div>
            ) : null}

            {!recommendationLoading && !recommendationError && recommendedDoctors.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-8">
                <p className="text-slate-800 font-semibold">
                  {profileCity
                    ? `No verified doctors found in ${profileCity} right now.`
                    : 'No personalized recommendations available yet.'}
                </p>
                <p className="text-slate-600 mt-2">
                  {profileCity
                    ? 'Try lowering minimum rating, browsing all doctors, or checking another city from doctor search.'
                    : 'Update your profile location to match doctors by city on home.'}
                </p>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => navigate('/profile')}
                    className="px-4 py-2 rounded-lg border border-primary-300 text-primary-700 hover:bg-primary-50 transition"
                  >
                    Update Profile
                  </button>
                  <button
                    onClick={() => navigate('/find-doctors')}
                    className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition"
                  >
                    Browse Doctors
                  </button>
                </div>
              </div>
            ) : null}

            {!recommendationLoading && !recommendationError && recommendedDoctors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedDoctors.map((doctor) => (
                  <div
                    key={doctor._id}
                    onClick={() => navigate(`/doctor/${doctor._id}`)}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg transition cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      {doctor.profileImage && !brokenImages[doctor._id] ? (
                        <img
                          src={resolveDoctorImage(doctor.profileImage)}
                          alt={doctor.name}
                          className="w-14 h-14 rounded-full object-cover border border-slate-200 flex-shrink-0"
                          onError={() => setBrokenImages((prev) => ({ ...prev, [doctor._id]: true }))}
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center flex-shrink-0">
                          <Stethoscope className="w-6 h-6 text-white" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold text-slate-900">{doctor.name}</h3>
                        <p className="text-sm font-semibold text-primary-700 mt-0.5">{doctor.specialty}</p>
                        <p className="text-xs text-slate-600 mt-1">
                          {doctor.hospital} • {doctor.city}{doctor.state ? `, ${doctor.state}` : ''}
                        </p>
                        {typeof doctor.trustScore === 'number' ? (
                          <span className="mt-2 inline-flex text-xs font-bold px-2.5 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700">
                            Match {doctor.trustScore.toFixed(1)}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {doctor.verified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-green-100 text-green-800 px-2.5 py-1 rounded-full">
                          <BadgeCheck className="w-3 h-3" /> Verified
                        </span>
                      ) : null}
                      {doctor.touristFriendly ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">
                          Traveler Friendly
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="text-lg font-bold text-slate-900">₹{doctor.inClinicFee ?? doctor.consultationFee ?? 0}</div>
                        <p className="text-xs text-slate-500">In-clinic fee</p>
                      </div>
                      <div className="text-right">
                        <div className="inline-flex items-center gap-1 text-sm font-semibold text-slate-900">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {(doctor.rate || 0).toFixed(1)}
                        </div>
                        <p className="text-xs text-slate-500">{doctor.reviewCount || 0} reviews</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* EXPERIENCE FLOW */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-60">
          <div className="absolute top-10 right-10 w-72 h-72 bg-cyan-100 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary-100 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-xs font-bold tracking-widest uppercase">
              Premium Journey
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mt-5 mb-4">Designed for calm decisions under pressure</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">A guided experience that turns confusion into clear next actions in minutes.</p>
          </div>

          <Flow />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-8 shadow-sm hover:shadow-xl transition">
              <div className="text-xs font-black tracking-[0.35em] text-slate-400 mb-4">01</div>
              <Stethoscope className="w-10 h-10 text-primary-600 mb-5" strokeWidth={2.4} />
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Describe your symptoms</h3>
              <p className="text-slate-600 leading-relaxed">Use natural language in your preferred language. MediGuide extracts the medical signal from your input.</p>
            </div>

            <div className="rounded-3xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-white p-8 shadow-sm hover:shadow-xl transition lg:-translate-y-5">
              <div className="text-xs font-black tracking-[0.35em] text-cyan-500 mb-4">02</div>
              <Brain className="w-10 h-10 text-cyan-600 mb-5" strokeWidth={2.4} />
              <h3 className="text-2xl font-bold text-slate-900 mb-3">AI triage with clarity</h3>
              <p className="text-slate-600 leading-relaxed">Get urgency level, recommended specialty, and practical next steps with transparent guidance.</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-8 shadow-sm hover:shadow-xl transition">
              <div className="text-xs font-black tracking-[0.35em] text-slate-400 mb-4">03</div>
              <CalendarCheck2 className="w-10 h-10 text-primary-600 mb-5" strokeWidth={2.4} />
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Consult with confidence</h3>
              <p className="text-slate-600 leading-relaxed">Book verified doctors instantly, chat securely after confirmation, and keep your care history connected.</p>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-slate-900 text-white p-5">
              <p className="text-3xl font-bold">4.9/5</p>
              <p className="text-sm text-slate-300 mt-1">Average doctor ratings</p>
            </div>
            <div className="rounded-2xl bg-white border border-slate-200 p-5">
              <p className="text-3xl font-bold text-slate-900">98%</p>
              <p className="text-sm text-slate-500 mt-1">Resolution confidence score</p>
            </div>
            <div className="rounded-2xl bg-white border border-slate-200 p-5">
              <p className="text-3xl font-bold text-slate-900">10+</p>
              <p className="text-sm text-slate-500 mt-1">Language pathways supported</p>
            </div>
            <div className="rounded-2xl bg-white border border-slate-200 p-5">
              <p className="text-3xl font-bold text-slate-900">24/7</p>
              <p className="text-sm text-slate-500 mt-1">Intelligent triage availability</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE BENTO */}
      <section className="py-24 bg-gradient-to-b from-slate-100 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <p className="text-sm font-bold tracking-widest uppercase text-primary-600">Platform Capabilities</p>
              <h2 className="text-4xl font-bold text-slate-900 mt-2">Built for modern health mobility</h2>
            </div>
            <button
              onClick={() => navigate('/find-doctors')}
              className="px-5 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
            >
              Explore Doctors
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-5 auto-rows-[220px]">
            {/* Large Main Anchor Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-3xl border border-slate-200 bg-white p-8 md:col-span-2 xl:col-span-2 xl:row-span-2 flex flex-col justify-between overflow-hidden relative shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative z-10 max-w-sm">
                <div className="bg-primary-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                  <Languages className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-3xl font-bold mb-3 text-slate-900">Multilingual Support</h3>
                <p className="text-slate-600 text-lg leading-relaxed">
                  Search, read, and communicate in 10+ languages. We break the language barrier so you can focus on getting better.
                </p>
              </div>
              <div className="absolute -bottom-8 -right-8 w-[320px] h-[320px] opacity-90 pointer-events-none">
                 <MultilingualIllustration />
              </div>
            </motion.div>

            {/* Verification Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center"
            >
              <BadgeCheck className="w-8 h-8 text-emerald-500 mb-4" strokeWidth={2} />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Verified Doctors</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Every professional is credential-checked by our verification team.</p>
            </motion.div>

            {/* Cost Transparency Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center"
            >
              <Wallet className="w-8 h-8 text-primary-600 mb-4" strokeWidth={2} />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Cost Transparency</h3>
              <p className="text-slate-600 text-sm leading-relaxed">See exact consultation fees upfront with zero hidden charges.</p>
            </motion.div>

            {/* Location Dark Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center"
            >
              <MapPinned className="w-8 h-8 text-emerald-600 mb-4" strokeWidth={2} />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Location-Based</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Find top-rated healthcare providers tailored to your exact city location.</p>
            </motion.div>

            {/* Teleconsultation Tall Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center"
            >
              <Video className="w-8 h-8 text-primary-600 mb-4" strokeWidth={2} />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Teleconsultation</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Video consult directly from your hotel room. Secure and recorded.</p>
            </motion.div>

            {/* Emergency Wide Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center md:col-span-2 relative overflow-hidden"
            >
              <div className="relative z-10 max-w-sm">
                <Siren className="w-8 h-8 text-emerald-600 mb-4" strokeWidth={2} />
                <h3 className="text-xl font-bold text-slate-900 mb-2">Emergency AI Triage</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Our advanced algorithm rapidly flags high-urgency symptoms and guides you to the nearest emergency care facility immediately.</p>
              </div>
              <div className="absolute right-0 bottom-0 opacity-10 blur-xl scale-150 transform translate-x-12 translate-y-12 pointer-events-none">
                 <Siren className="w-64 h-64 text-emerald-600" />
              </div>
            </motion.div>

            {/* Location Dark Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="rounded-3xl border border-slate-800 bg-slate-900 text-white p-8 shadow-sm hover:shadow-lg transition-shadow flex flex-col justify-center"
            >
              <MapPinned className="w-8 h-8 text-cyan-400 mb-4" strokeWidth={2} />
              <h3 className="text-xl font-bold mb-2">Location-Based</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Find top-rated healthcare providers tailored to your exact city location.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CITY NETWORK */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div>
              <p className="text-sm font-bold tracking-widest uppercase text-primary-600">City Network</p>
              <h2 className="text-4xl font-bold text-slate-900 mt-2 mb-4">Trusted care in India’s major travel corridors</h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-8">
                Find clinically verified professionals whether you are in a metro hub, a business city, or a cultural destination.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => navigate(`/find-doctors?city=${encodeURIComponent(city)}`)}
                    className="text-left px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-primary-50 hover:border-primary-300 transition"
                  >
                    <span className="text-sm font-semibold text-slate-800">{city}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-primary-900 text-white p-8 shadow-2xl relative overflow-hidden">
              <Network />
              
              <div className="relative z-10 mt-6">
                <h3 className="text-2xl font-bold mb-5">Why travelers choose MediGuide</h3>
                <div className="space-y-4 text-slate-200">
                  <p className="flex items-start gap-3"><Check className="w-4 h-4 text-emerald-400 mt-1 flex-shrink-0" /> Fast specialist discovery with contextual AI recommendations.</p>
                  <p className="flex items-start gap-3"><Check className="w-4 h-4 text-emerald-400 mt-1 flex-shrink-0" /> Verified doctor profiles with transparent consultation fees.</p>
                  <p className="flex items-start gap-3"><Check className="w-4 h-4 text-emerald-400 mt-1 flex-shrink-0" /> Seamless transition from triage to booking to secure follow-up.</p>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-2xl font-bold">50K+</p>
                    <p className="text-xs text-slate-300 mt-1">Users</p>
                  </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-2xl font-bold">99%</p>
                  <p className="text-xs text-slate-300 mt-1">Satisfaction</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-2xl font-bold">15+</p>
                  <p className="text-xs text-slate-300 mt-1">Cities</p>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PREMIUM CTA */}
      <section className="py-24 bg-gradient-to-r from-primary-700 via-primary-600 to-cyan-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-25 pointer-events-none">
          <div className="absolute -top-24 left-10 w-80 h-80 rounded-full bg-white blur-3xl"></div>
          <div className="absolute -bottom-24 right-10 w-80 h-80 rounded-full bg-accent-400 blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            <div className="lg:col-span-2 rounded-3xl border border-white/25 bg-white/10 backdrop-blur-sm p-8 md:p-10">
              <p className="text-xs font-bold tracking-widest uppercase text-cyan-100 mb-3">Member Experience</p>
              <h2 className="text-4xl font-bold mb-4">{ctaHeadline}</h2>
              <p className="text-white/90 text-lg max-w-2xl">
                Join a modern healthcare onboarding flow built to reduce stress and accelerate trustworthy care access.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate('/register')}
                  className="px-7 py-3 rounded-xl bg-accent-400 hover:bg-accent-500 text-white font-bold transition shadow-xl"
                >
                  Create Free Account
                </button>
                <button
                  onClick={() => navigate('/symptom-checker')}
                  className="px-7 py-3 rounded-xl border border-white/60 bg-white/10 hover:bg-white/20 text-white font-semibold transition"
                >
                  Try Symptom Checker
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-white/25 bg-black/20 backdrop-blur-sm p-8">
              <h3 className="text-xl font-bold mb-5">What unlocks after signup</h3>
              <div className="space-y-3 text-sm text-white/90">
                <p className="inline-flex items-center gap-2"><Check className="w-4 h-4" /> Book and manage appointments in one dashboard</p>
                <p className="inline-flex items-center gap-2"><Check className="w-4 h-4" /> Chat securely with confirmed doctors</p>
                <p className="inline-flex items-center gap-2"><Check className="w-4 h-4" /> Access digital prescriptions and visit history</p>
                <p className="inline-flex items-center gap-2"><Check className="w-4 h-4" /> Faster repeat consultations while traveling</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
