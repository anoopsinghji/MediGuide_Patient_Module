export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const APPOINTMENT_TYPES = ['In-Person', 'Teleconsultation'] as const;

export const APPOINTMENT_STATUSES = ['booked', 'confirmed', 'completed', 'cancelled'] as const;

export const USER_ROLES = ['tourist', 'doctor', 'admin', 'moderator'] as const;

export const LANGUAGES = ['English', 'Hindi', 'Spanish', 'French', 'Mandarin'] as const;

export const SPECIALTIES = [
  'General Practice',
  'Cardiology',
  'Orthopedics',
  'Neurology',
  'Pediatrics',
  'Dermatology',
  'Ophthalmology',
  'ENT',
  'Dentistry',
  'Psychiatry',
] as const;

export const SYMPTOMS = [
  'Headache',
  'Fever',
  'Cough',
  'Cold',
  'Sore Throat',
  'Body Ache',
  'Fatigue',
  'Dizziness',
  'Shortness of Breath',
  'Chest Pain',
] as const;
