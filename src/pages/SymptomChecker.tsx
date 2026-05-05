import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useTitle } from '../hooks';
import { symptomService } from '../services';
import { useAuthStore } from '../store/authStore';
import { Brain, Search, Loader2, AlertTriangle, Star, Microscope, IndianRupee, MapPin, BadgeCheck } from 'lucide-react';

type RecommendedDoctor = {
  _id: string;
  name: string;
  specialty: string;
  city: string;
  state?: string;
  consultationFee: number;
  inClinicFee?: number;
  rate?: number;
  reviewCount?: number;
  distanceKm?: number | null;
  trustScore?: number;
  verified?: boolean;
  touristFriendly?: boolean;
  matchReasons?: string[];
};

type AnalysisView = {
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  label: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  message: string;
  specialty: string;
  detectedSymptoms: string[];
  recommendedDoctors: RecommendedDoctor[];
  cityUsed?: string;
};

export default function SymptomChecker() {
  useTitle('Symptom Checker');
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [symptoms, setSymptoms] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [result, setResult] = useState<AnalysisView | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [detectedLocationLabel, setDetectedLocationLabel] = useState('');

  const commonSymptoms = useMemo(
    () => [
      'Fever',
      'Cough',
      'Headache',
      'Stomach Pain',
      'Body Ache',
      'Fatigue',
      'Sore Throat',
      'Nausea',
      'Chest Pain',
      'Dizziness',
      'Skin Rash',
      'Eye Pain',
    ],
    []
  );

  const cities = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune'];

  const urgencyStyle = {
    low: {
      label: 'LOW Priority',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300',
      textColor: 'text-green-900',
    },
    medium: {
      label: 'MEDIUM Priority',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-300',
      textColor: 'text-yellow-900',
    },
    high: {
      label: 'HIGH Priority',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-300',
      textColor: 'text-red-900',
    },
    emergency: {
      label: 'EMERGENCY',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-500',
      textColor: 'text-red-900',
    },
  } as const;

  const cityFromProfile = (user?.currentLocation || '').split(',')[0]?.trim() || '';

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
          setCurrentCoords({ lat: latitude, lng: longitude });

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

          if (city) {
            setSelectedCity((prev) => prev || city);
          }

          setDetectedLocationLabel(city || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          toast.success('Current location detected');
        } catch (error) {
          console.error('Location resolution failed:', error);
          toast.error('Could not resolve location details, using coordinates only');
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

  const handleAnalyze = async () => {
    if (!symptoms.trim()) return;

    setIsAnalyzing(true);
    setResult(null);

    try {
      const effectiveCity = selectedCity || cityFromProfile;
      const analysis = await symptomService.recommendDoctors({
        text: symptoms,
        city: effectiveCity || undefined,
        lat: currentCoords?.lat,
        lng: currentCoords?.lng,
        radiusKm: 40,
        preferredLanguages: user?.preferredLanguage ? [user.preferredLanguage] : undefined,
        limit: 5,
      });

      const urgencyLevel =
        analysis.urgencyLevel ||
        (analysis.urgency || 'Low').toLowerCase() as 'low' | 'medium' | 'high' | 'emergency';

      const style = urgencyStyle[urgencyLevel] || urgencyStyle.low;
      const primarySpecialty =
        analysis.primarySpecialty || analysis.recommendedSpecialties?.[0]?.name || 'General Physician';

      const rankedDoctors = (analysis.recommendedDoctors || []) as unknown as RecommendedDoctor[];

      setResult({
        urgencyLevel,
        label: style.label,
        bgColor: style.bgColor,
        borderColor: style.borderColor,
        textColor: style.textColor,
        message: analysis.message || 'Consult a doctor for a clinical assessment.',
        specialty: primarySpecialty,
        detectedSymptoms:
          analysis.detectedSymptoms?.length
            ? analysis.detectedSymptoms
            : symptoms
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean)
                .slice(0, 5),
        recommendedDoctors: rankedDoctors,
        cityUsed: analysis.searchContext?.city || effectiveCity || undefined,
      });

      if (analysis.safety?.isEmergency || urgencyLevel === 'emergency') {
        toast.error('Emergency symptoms detected. Please seek immediate medical care.');
      }
    } catch (error: any) {
      console.error('Symptom analysis failed:', error);
      toast.error(error?.response?.data?.message || 'Failed to analyze symptoms. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleSymptom = (symptom: string) => {
    if (symptoms.includes(symptom)) {
      setSymptoms(symptoms.replace(symptom + ', ', '').replace(', ' + symptom, '').replace(symptom, ''));
    } else {
      setSymptoms(symptoms ? `${symptoms}, ${symptom}` : symptom);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold mb-2 inline-flex items-center gap-3">
            <Brain className="w-9 h-9" /> AI Symptom Checker
          </h1>
          <p className="text-white text-opacity-90">Describe how you feel and our AI will recommend the right specialist</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Symptom Input Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us your symptoms</h2>
              <p className="text-gray-600 mb-6 text-sm">
                Describe in plain language — e.g., "I have fever and stomach pain since yesterday"
              </p>

              {/* Symptom Text Area */}
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Type your symptoms here..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent resize-none mb-6"
              />

              {/* Common Symptoms Tags */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">Or select common symptoms:</p>
                <div className="flex flex-wrap gap-2">
                  {commonSymptoms.map((symptom) => (
                    <button
                      key={symptom}
                      onClick={() => toggleSymptom(symptom)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition border-2 ${
                        symptoms.includes(symptom)
                          ? 'bg-primary-600 border-primary-600 text-white'
                          : 'bg-gray-100 border-gray-300 text-gray-700 hover:border-primary-600'
                      }`}
                    >
                      {symptom}
                    </button>
                  ))}
                </div>
              </div>

              {/* City Selector */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Current City (optional)
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                >
                  <option value="">Select city...</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>

                <button
                  onClick={detectCurrentLocation}
                  type="button"
                  disabled={locationLoading}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 border border-primary-300 text-primary-700 rounded-lg hover:bg-primary-50 transition disabled:opacity-60"
                >
                  {locationLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                  {locationLoading ? 'Detecting location...' : 'Use My Current Location'}
                </button>

                {detectedLocationLabel ? (
                  <p className="mt-2 text-xs text-gray-600">Detected location: {detectedLocationLabel}</p>
                ) : null}
              </div>

              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={!symptoms.trim() || isAnalyzing}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold py-3 px-6 rounded-lg hover:from-primary-700 hover:to-primary-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" /> Analyze with AI
                  </>
                )}
              </button>

              {/* Disclaimer */}
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 inline-flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  This is not a medical diagnosis. Always consult a qualified doctor.
                </p>
              </div>
            </div>
          </div>

          {/* Results Section */}
          {result && (
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Analysis Result</h3>

              {/* Urgency Banner */}
              <div className={`rounded-lg p-4 mb-6 border-2 ${result.bgColor} ${result.borderColor}`}>
                <div className={`text-xl font-bold ${result.textColor} mb-2 inline-flex items-center gap-2`}>
                  <AlertTriangle className="w-5 h-5" />
                  {result.label}
                </div>
                <p className={`${result.textColor} text-sm`}>{result.message}</p>
              </div>

              {/* Recommended Specialty */}
              <div className="mb-6">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Recommended Specialist
                </div>
                <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
                  <div className="text-lg font-bold text-primary-700">{result.specialty}</div>
                </div>
              </div>

              {/* Detected Symptoms */}
              <div className="mb-6">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Detected Symptoms
                </div>
                <div className="flex flex-wrap gap-2">
                  {(result.detectedSymptoms || []).map((symptom: string, idx: number) => (
                    <span
                      key={idx}
                      className="inline-block bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold"
                    >
                      {symptom.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recommended Doctors */}
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Recommended Doctors
                </div>
                <div className="space-y-2">
                  {result.recommendedDoctors.map((doctor) => (
                    <div
                      key={doctor._id}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-primary-50 transition cursor-pointer"
                      onClick={() => navigate(`/doctor/${doctor._id}`)}
                    >
                      <div className="font-semibold text-gray-900">{doctor.name}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {doctor.specialty} • {doctor.city}{doctor.state ? `, ${doctor.state}` : ''}
                      </div>
                      <div className="text-xs text-gray-600 mt-1 inline-flex items-center gap-2">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> {doctor.rate || 0}
                        <span>·</span>
                        <IndianRupee className="w-3.5 h-3.5" />{doctor.inClinicFee ?? doctor.consultationFee ?? 0}
                        {doctor.distanceKm !== null && doctor.distanceKm !== undefined ? (
                          <>
                            <span>·</span>
                            <MapPin className="w-3.5 h-3.5" /> {doctor.distanceKm} km
                          </>
                        ) : null}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {doctor.verified ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            <BadgeCheck className="w-3 h-3" /> Verified
                          </span>
                        ) : null}
                        {doctor.touristFriendly ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Traveler Friendly
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                  {result.recommendedDoctors.length === 0 && (
                    <div className="text-sm text-gray-600 border border-dashed border-gray-300 rounded-lg p-3">
                      No direct matches found for this city. Try viewing all doctors or remove city filter.
                    </div>
                  )}
                </div>
              </div>

              {result.cityUsed ? (
                <p className="text-xs text-gray-500 mt-4">Recommendations are prioritized for {result.cityUsed}.</p>
              ) : null}

              {/* View Doctors Button */}
              <button
                className="w-full mt-6 bg-primary-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-700 transition"
                onClick={() => navigate('/find-doctors')}
              >
                View All Doctors
              </button>
            </div>
          )}

          {/* Empty State */}
          {!result && !isAnalyzing && (
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 flex flex-col items-center justify-center text-center">
              <Microscope className="w-14 h-14 text-primary-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI Analysis</h3>
              <p className="text-gray-600 text-sm">
                Describe your symptoms and our AI will analyze them to recommend the best specialist for you.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
