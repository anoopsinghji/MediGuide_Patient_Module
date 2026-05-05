import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTitle } from '../hooks';
import { toast } from 'react-hot-toast';
import { useAuthWall } from '../hooks/useAuthWall';
import {
  Search,
  Loader2,
  TriangleAlert,
  Stethoscope,
  BadgeCheck,
  Globe2,
  Star,
  Languages,
  Filter,
  SlidersHorizontal,
  MapPin,
  IndianRupee,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { doctorService } from '../services';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

interface Doctor {
  _id: string;
  name: string;
  specialty: string;
  hospital: string;
  city: string;
  availableToday?: boolean;
  rate: number;
  reviewCount: number;
  languages: string[];
  consultationFee: number;
  inClinicFee?: number;
  videoConsultationFee?: number;
  trustScore?: number;
  distanceKm?: number | null;
  verified: boolean;
  touristFriendly: boolean;
  profileImage?: string;
}

export default function FindDoctors() {
  useTitle('Find Doctors');
  const navigate = useNavigate();
  const { requireAuth } = useAuthWall();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('');
  const [filterAvailable, setFilterAvailable] = useState(false);
  const [filterTouristFriendly, setFilterTouristFriendly] = useState(false);
  const [filterMinRating, setFilterMinRating] = useState(0);
  const [filterSortBy, setFilterSortBy] = useState<'trust' | 'rating' | 'distance' | 'latest'>('trust');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');

  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Your browser does not support location access. Results will stay city-based.');
      toast.error('Location access is not available in this browser');
      return;
    }

    setLocationLoading(true);
    setLocationMessage('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationMessage('Location enabled. Distance will now show on each doctor card.');
        setLocationLoading(false);
        toast.success('Your location is enabled');
      },
      () => {
        setUserLocation(null);
        setLocationMessage('Location access was denied. You can still browse by city.');
        setLocationLoading(false);
        toast.error('Could not access your location');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5 * 60 * 1000,
      }
    );
  };

  const resolveDoctorImage = (imagePath?: string) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    return `${BACKEND_BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setFiltersLoading(true);
        const [cityData, specialtyData, languageData] = await Promise.all([
          doctorService.getCities(),
          doctorService.getSpecialties(),
          doctorService.getLanguages(),
        ]);

        setCities(cityData);
        setSpecialties(specialtyData);
        setLanguages(languageData.all || []);
      } catch (fetchError) {
        console.error('Failed to load filter metadata:', fetchError);
        setCities(['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune']);
        setSpecialties(['Cardiology', 'Dermatology', 'Gastroenterology', 'Orthopedics', 'Neurology', 'Pediatrics']);
        setLanguages(['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Marathi']);
      } finally {
        setFiltersLoading(false);
      }
    };

    fetchFilterOptions();
  }, []);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError('');

        const hasLocation = Boolean(userLocation);
        const sortBy = filterSortBy === 'distance' && !hasLocation ? 'trust' : filterSortBy;

        const result = await doctorService.getDoctors({
          search: searchTerm || undefined,
          city: filterCity || undefined,
          specialty: filterSpecialty || undefined,
          language: filterLanguage || undefined,
          availableToday: filterAvailable,
          touristFriendly: filterTouristFriendly,
          minRating: filterMinRating > 0 ? filterMinRating : undefined,
          sortBy,
          ...(hasLocation
            ? {
                lat: userLocation!.lat,
                lng: userLocation!.lng,
                radiusKm: 50,
              }
            : {}),
        });

        setDoctors((result.data || []) as unknown as Doctor[]);
      } catch (err) {
        setError('Error loading doctors. Please try again.');
        console.error('Error fetching doctors:', err);
        toast.error('Failed to load doctors');
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchDoctors, 300);
    return () => clearTimeout(timer);
  }, [filterCity, filterSpecialty, filterLanguage, filterAvailable, filterTouristFriendly, filterMinRating, filterSortBy, searchTerm, userLocation]);

  const clearFilters = () => {
    setFilterCity('');
    setFilterSpecialty('');
    setFilterLanguage('');
    setFilterAvailable(false);
    setFilterTouristFriendly(false);
    setFilterMinRating(0);
    setFilterSortBy('trust');
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-teal-50/30 pt-20">
      <div className="bg-white/90 border-b border-gray-200/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-full mb-4">
              <Filter className="w-4 h-4" /> Smart search and filters
            </p>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">Find a Doctor</h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              Browse verified healthcare providers with advanced filters, clear fees, and a faster booking flow.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-600" />
            <input
              type="text"
              placeholder="Search by name, specialty, city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900 inline-flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-teal-600" /> Filters
              </h2>
              <p className="text-sm text-gray-500 mt-1">Refine by location, specialty, availability, and rating.</p>
            </div>
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-full border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition self-start lg:self-auto"
            >
              Clear all
            </button>
          </div>

          <div className="mb-5 rounded-2xl border border-teal-100 bg-teal-50/70 p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-teal-900">Distance from your current location</p>
                <p className="text-xs text-teal-800 mt-1">
                  Enable location once to see how far each doctor is from you. If access is denied, the app will keep city-based search working.
                </p>
              </div>
              <button
                onClick={requestUserLocation}
                disabled={locationLoading}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {locationLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {userLocation ? 'Refresh my location' : 'Use my location'}
              </button>
            </div>
            {locationMessage ? <p className="text-xs text-teal-800 mt-3">{locationMessage}</p> : null}
            {filterSortBy === 'distance' && !userLocation ? (
              <p className="text-xs text-amber-800 mt-3">
                Distance sorting will work after you allow location access.
              </p>
            ) : null}
          </div>

          {filtersLoading ? (
            <div className="text-sm text-gray-600 inline-flex items-center gap-2 mb-5">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading filters...
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-gray-200 p-4 bg-slate-50/70">
              <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                <MapPin className="w-3.5 h-3.5" /> City
              </label>
              <select
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
              >
                <option value="">All Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl border border-gray-200 p-4 bg-slate-50/70">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Specialty
              </label>
              <select
                value={filterSpecialty}
                onChange={(e) => setFilterSpecialty(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
              >
                <option value="">All Specialties</option>
                {specialties.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl border border-gray-200 p-4 bg-slate-50/70">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Language
              </label>
              <select
                value={filterLanguage}
                onChange={(e) => setFilterLanguage(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
              >
                <option value="">Any Language</option>
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl border border-gray-200 p-4 bg-slate-50/70">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Sort By
              </label>
              <select
                value={filterSortBy}
                onChange={(e) => setFilterSortBy(e.target.value as 'trust' | 'rating' | 'distance' | 'latest')}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
              >
                <option value="trust">Best for Travelers</option>
                <option value="rating">Highest Rated</option>
                <option value="latest">Newest Profiles</option>
                <option value="distance">Nearest (requires GPS-enabled query)</option>
              </select>
            </div>

            <div className="md:col-span-2 xl:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center gap-3 cursor-pointer rounded-2xl border border-gray-200 p-4 bg-white hover:border-teal-200 transition">
                <input
                  type="checkbox"
                  checked={filterAvailable}
                  onChange={(e) => setFilterAvailable(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                />
                <span className="text-gray-700 font-medium">Available Today</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer rounded-2xl border border-gray-200 p-4 bg-white hover:border-teal-200 transition">
                <input
                  type="checkbox"
                  checked={filterTouristFriendly}
                  onChange={(e) => setFilterTouristFriendly(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                />
                <span className="text-gray-700 font-medium">Tourist Friendly</span>
              </label>

              <div className="rounded-2xl border border-gray-200 p-4 bg-white">
                <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Minimum Rating
                </label>
                <select
                  value={String(filterMinRating)}
                  onChange={(e) => setFilterMinRating(Number(e.target.value))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
                >
                  <option value="0">Any Rating</option>
                  <option value="3">3.0+</option>
                  <option value="4">4.0+</option>
                  <option value="4.5">4.5+</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-2 xl:col-span-4 flex flex-wrap gap-2">
              {filterCity ? <span className="px-3 py-1.5 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold">City: {filterCity}</span> : null}
              {filterSpecialty ? <span className="px-3 py-1.5 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold">Specialty: {filterSpecialty}</span> : null}
              {filterLanguage ? <span className="px-3 py-1.5 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold">Language: {filterLanguage}</span> : null}
              {filterAvailable ? <span className="px-3 py-1.5 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold">Available today</span> : null}
              {filterTouristFriendly ? <span className="px-3 py-1.5 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold">Tourist friendly</span> : null}
              {filterMinRating > 0 ? <span className="px-3 py-1.5 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold">Rating {filterMinRating}+</span> : null}
            </div>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between gap-4">
          <p className="text-gray-600 text-sm">{loading ? 'Loading...' : `Showing ${doctors.length} doctor(s)`}</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <Loader2 className="animate-spin w-10 h-10 text-primary-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading doctors...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <TriangleAlert className="w-10 h-10 text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-900 mb-2">Error Loading Doctors</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
            {doctors.length > 0 ? (
              doctors.map((doctor) => {
                const inClinicFee = doctor.inClinicFee ?? doctor.consultationFee;
                const videoFee = doctor.videoConsultationFee ?? doctor.consultationFee;
                const isExpanded = expandedCardId === doctor._id;

                return (
                  <div
                    key={doctor._id}
                    onClick={() => navigate(`/doctor/${doctor._id}`)}
                    className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200/80 overflow-hidden cursor-pointer relative group/card"
                  >
                      {typeof doctor.distanceKm === 'number' ? (
                        <div className="absolute top-4 right-4">
                          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-cyan-600 text-white text-sm font-bold shadow">
                            <MapPin className="w-4 h-4" /> {doctor.distanceKm.toFixed(1)} km
                          </span>
                        </div>
                      ) : null}
                    <div className="h-1.5 bg-gradient-to-r from-teal-600 via-cyan-500 to-primary-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />

                    <div className="p-5 sm:p-6">
                      <div className="flex gap-3 mb-3 items-start">
                        {doctor.profileImage && !brokenImages[doctor._id] ? (
                          <img
                            src={resolveDoctorImage(doctor.profileImage)}
                            alt={doctor.name}
                            className="w-14 h-14 rounded-2xl object-cover border border-gray-200 flex-shrink-0 shadow-sm"
                            onError={() => setBrokenImages((prev) => ({ ...prev, [doctor._id]: true }))}
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-cyan-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                            <Stethoscope className="w-7 h-7 text-white" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="font-bold text-gray-900 leading-tight truncate">{doctor.name}</h3>
                              <p className="text-primary-700 text-sm font-semibold truncate">{doctor.specialty}</p>
                            </div>
                            {doctor.verified ? (
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full whitespace-nowrap">
                                <BadgeCheck className="w-3.5 h-3.5" /> Verified
                              </span>
                            ) : null}
                          </div>
                          <p className="text-gray-700 text-xs mt-1 inline-flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" /> {doctor.city}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <p className="text-gray-600 text-xs truncate" title={doctor.hospital}>
                              <span className="font-semibold text-gray-700">Clinic:</span> {doctor.hospital}
                            </p>
                            {typeof doctor.distanceKm === 'number' ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-cyan-100 bg-cyan-50 px-2.5 py-1 text-[11px] font-semibold text-cyan-800 whitespace-nowrap">
                                <Globe2 className="w-3 h-3" />
                                {doctor.distanceKm.toFixed(1)} km away
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {doctor.touristFriendly ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                            <Globe2 className="w-3.5 h-3.5" /> Tourist Friendly
                          </span>
                        ) : null}
                      </div>

                      <div className={`mb-3 rounded-xl border px-3 py-2 inline-flex items-center gap-2 text-xs font-semibold ${doctor.availableToday ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
                        <span className={`w-2 h-2 rounded-full ${doctor.availableToday ? 'bg-emerald-600' : 'bg-amber-500'}`} />
                        {doctor.availableToday ? 'Available today' : 'Schedule on request'}
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="rounded-xl bg-amber-50 border border-amber-100 p-2.5 text-center">
                          <p className="text-[11px] text-amber-800 font-semibold">Rating</p>
                          <p className="font-bold text-gray-900 inline-flex items-center gap-1 justify-center">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> {doctor.rate.toFixed(1)}
                          </p>
                        </div>
                        <div className="rounded-xl bg-teal-50 border border-teal-100 p-2.5 text-center">
                          <p className="text-[11px] text-teal-800 font-semibold">Starts From</p>
                          <p className="font-bold text-teal-700 inline-flex items-center gap-1 justify-center">
                            <IndianRupee className="w-3.5 h-3.5" />{Math.min(inClinicFee, videoFee)}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-200 flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            requireAuth(
                              () => navigate(`/doctor/${doctor._id}`),
                              { feature: 'booking', returnTo: `/doctor/${doctor._id}`, doctorId: doctor._id }
                            );
                          }}
                          className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-700 text-white font-semibold py-2.5 px-4 rounded-xl hover:brightness-105 transition shadow-sm"
                        >
                          Book Now
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedCardId((prev) => (prev === doctor._id ? null : doctor._id));
                          }}
                          className="lg:hidden px-3 py-2.5 rounded-xl border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition inline-flex items-center gap-1.5 text-sm font-semibold"
                          aria-label="Toggle additional doctor details"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          Info
                        </button>
                      </div>

                      {isExpanded ? (
                        <div className="mt-3 lg:hidden rounded-2xl border border-gray-200 bg-slate-50 p-3 space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="rounded-xl border border-primary-100 bg-white p-2.5">
                              <p className="text-[11px] uppercase tracking-wide text-primary-700 font-semibold">In-Clinic</p>
                              <p className="text-base font-extrabold text-primary-700 inline-flex items-center gap-1">
                                <IndianRupee className="w-3.5 h-3.5" />{inClinicFee}
                              </p>
                            </div>
                            <div className="rounded-xl border border-cyan-100 bg-white p-2.5">
                              <p className="text-[11px] uppercase tracking-wide text-cyan-700 font-semibold">Video Call</p>
                              <p className="text-base font-extrabold text-cyan-700 inline-flex items-center gap-1">
                                <IndianRupee className="w-3.5 h-3.5" />{videoFee}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {doctor.languages.slice(0, 4).map((lang) => (
                              <span key={lang} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full border border-gray-200">
                                {lang}
                              </span>
                            ))}
                            {doctor.languages.length > 4 ? (
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full border border-gray-200">
                                +{doctor.languages.length - 4} more
                              </span>
                            ) : null}
                          </div>

                          {typeof doctor.trustScore === 'number' ? (
                            <div className="text-[11px] text-center text-primary-700 font-semibold bg-primary-50 rounded-full py-1.5 border border-primary-100">
                              Traveler Match Score: {doctor.trustScore.toFixed(1)}
                            </div>
                          ) : null}

                          <p className="text-xs text-gray-600">
                            <span className="font-semibold text-gray-700">Reviews:</span> {doctor.reviewCount} | <span className="font-semibold text-gray-700">Languages:</span> {doctor.languages.length}
                          </p>
                        </div>
                      ) : null}
                    </div>

                    <div className="hidden lg:block absolute top-3 right-3 z-20 w-[44%] rounded-2xl border border-gray-200 bg-gradient-to-b from-white via-white to-slate-50 p-4 shadow-2xl opacity-0 translate-x-3 -translate-y-1 group-hover/card:opacity-100 group-hover/card:translate-x-0 group-hover/card:translate-y-0 transition-all duration-200 ease-out pointer-events-none">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-2">More Details</h4>

                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="rounded-xl border border-primary-100 bg-white p-2.5">
                            <p className="text-[11px] uppercase tracking-wide text-primary-700 font-semibold">In-Clinic</p>
                            <p className="text-base font-extrabold text-primary-700 inline-flex items-center gap-1">
                              <IndianRupee className="w-3.5 h-3.5" />{inClinicFee}
                            </p>
                          </div>
                          <div className="rounded-xl border border-cyan-100 bg-white p-2.5">
                            <p className="text-[11px] uppercase tracking-wide text-cyan-700 font-semibold">Video Call</p>
                            <p className="text-base font-extrabold text-cyan-700 inline-flex items-center gap-1">
                              <IndianRupee className="w-3.5 h-3.5" />{videoFee}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {doctor.languages.slice(0, 4).map((lang) => (
                            <span key={lang} className="text-[11px] bg-gray-100 text-gray-700 px-2 py-1 rounded-full border border-gray-200">
                              {lang}
                            </span>
                          ))}
                          {doctor.languages.length > 4 ? (
                            <span className="text-[11px] bg-gray-100 text-gray-700 px-2 py-1 rounded-full border border-gray-200">
                              +{doctor.languages.length - 4}
                            </span>
                          ) : null}
                        </div>

                        {typeof doctor.trustScore === 'number' ? (
                          <div className="text-[11px] text-center text-primary-700 font-semibold bg-primary-50 rounded-full py-1.5 border border-primary-100">
                            Traveler Match Score: {doctor.trustScore.toFixed(1)}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-16">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No doctors found</h3>
                <p className="text-gray-600">Try adjusting your filters to find doctors</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}