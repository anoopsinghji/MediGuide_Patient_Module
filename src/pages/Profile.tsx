import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTitle } from '../hooks';
import { useConfirm } from '../components/confirm/ConfirmProvider';
import { authService } from '../services';
import { useAuthStore } from '../store/authStore';
import { User } from '../models';

const LANGUAGES = ['English', 'Hindi', 'French', 'Spanish', 'German', 'Portuguese', 'Chinese'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDERS = ['male', 'female', 'other'];

type ProfileForm = {
  name: string;
  email: string;
  phone: string;
  nationality: string;
  preferredLanguage: string;
  currentLocation: string;
  age: string;
  gender: User['gender'] | '';
  bloodGroup: string;
  emergencyContactNumber: string;
  existingConditions: string;
};

export default function Profile() {
  useTitle('My Profile');
  const confirm = useConfirm();
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProfileForm>({
    name: '',
    email: '',
    phone: '',
    nationality: '',
    preferredLanguage: '',
    currentLocation: '',
    age: '',
    gender: '',
    bloodGroup: '',
    emergencyContactNumber: '',
    existingConditions: '',
  });

  const fillFormFromUser = (u: any) => {
    setForm({
      name: u?.name || '',
      email: u?.email || '',
      phone: u?.phone || '',
      nationality: u?.nationality || '',
      preferredLanguage: u?.preferredLanguage || '',
      currentLocation: u?.currentLocation || '',
      age: u?.age ? String(u.age) : '',
      gender: u?.gender || '',
      bloodGroup: u?.bloodGroup || '',
      emergencyContactNumber: u?.emergencyContactNumber || '',
      existingConditions: Array.isArray(u?.existingConditions)
        ? u.existingConditions.join(', ')
        : '',
    });
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        if (user) {
          fillFormFromUser(user);
        }

        const response = await authService.getCurrentUser();
        if (response.success && response.user) {
          setUser(response.user);
          fillFormFromUser(response.user);
          if (!response.user.currentLocation) {
            detectCurrentLocation();
          }
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        toast.error('Could not load latest profile data');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [setUser]);

  const detectCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported in this browser');
      return;
    }

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

          setForm((prev) => ({
            ...prev,
            currentLocation: location || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          }));
          toast.success('Current location detected');
        } catch (error) {
          console.error('Location resolution failed:', error);
          toast.error('Could not resolve your location');
        }
      },
      () => {
        toast.error('Location permission denied');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  const onChange = (field: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSave = async () => {
    const accepted = await confirm({
      title: 'Save profile changes?',
      description: 'Updated details will be used for doctor recommendations and future appointments.',
      confirmText: 'Save changes',
      cancelText: 'Continue editing',
    });

    if (!accepted) {
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: form.name,
        phone: form.phone,
        nationality: form.nationality,
        preferredLanguage: form.preferredLanguage,
        currentLocation: form.currentLocation,
        age: form.age ? Number(form.age) : undefined,
        gender: form.gender ? form.gender : undefined,
        bloodGroup: form.bloodGroup || undefined,
        emergencyContactNumber: form.emergencyContactNumber || undefined,
        existingConditions: form.existingConditions
          ? form.existingConditions.split(',').map((item) => item.trim()).filter(Boolean)
          : [],
      };

      const response = await authService.updateProfile(payload);
      if (response.success && response.user) {
        setUser(response.user);
        fillFormFromUser(response.user);
        toast.success('Profile updated successfully');
      } else {
        toast.error(response.message || 'Profile update failed');
      }
    } catch (error: any) {
      console.error('Profile update failed:', error);
      toast.error(error?.response?.data?.message || 'Profile update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 flex items-center justify-center">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">All details from registration are available here and can be edited.</p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <input className="w-full px-4 py-2 border border-gray-300 rounded-lg" value={form.name} onChange={(e) => onChange('name', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100" value={form.email} disabled />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
              <input className="w-full px-4 py-2 border border-gray-300 rounded-lg" value={form.phone} onChange={(e) => onChange('phone', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nationality</label>
              <input className="w-full px-4 py-2 border border-gray-300 rounded-lg" value={form.nationality} onChange={(e) => onChange('nationality', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Language</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg" value={form.preferredLanguage} onChange={(e) => onChange('preferredLanguage', e.target.value)}>
                <option value="">Select language</option>
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Current Location</label>
              <div className="flex gap-2">
                <input className="w-full px-4 py-2 border border-gray-300 rounded-lg" value={form.currentLocation} onChange={(e) => onChange('currentLocation', e.target.value)} placeholder="City, Country" />
                <button type="button" onClick={detectCurrentLocation} className="px-3 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700">
                  Auto
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
              <input type="number" className="w-full px-4 py-2 border border-gray-300 rounded-lg" value={form.age} onChange={(e) => onChange('age', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg" value={form.gender} onChange={(e) => onChange('gender', e.target.value)}>
                <option value="">Select gender</option>
                {GENDERS.map((gender) => (
                  <option key={gender} value={gender}>{gender}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Blood Group</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg" value={form.bloodGroup} onChange={(e) => onChange('bloodGroup', e.target.value)}>
                <option value="">Select blood group</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Emergency Contact Number</label>
              <input className="w-full px-4 py-2 border border-gray-300 rounded-lg" value={form.emergencyContactNumber} onChange={(e) => onChange('emergencyContactNumber', e.target.value)} />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Existing Conditions</label>
            <textarea
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              rows={3}
              placeholder="Comma separated: Diabetes, Asthma"
              value={form.existingConditions}
              onChange={(e) => onChange('existingConditions', e.target.value)}
            />
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="px-6 py-3 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
