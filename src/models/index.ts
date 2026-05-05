// User Models
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  nationality?: string;
  preferredLanguage?: string;
  currentLocation?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  existingConditions?: string[];
  emergencyContactNumber?: string;
  bloodGroup?: string;
  role: 'tourist' | 'doctor' | 'admin' | 'moderator';
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
  data?: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  // Basic Fields
  name: string;
  email: string;
  password: string;
  phone: string;
  
  // Travel Info
  preferredLanguage: string;
  currentLocation?: string;
  nationality?: string;
  
  // Health Info
  age?: number;
  gender?: 'male' | 'female' | 'other';
  existingConditions?: string[];
  
  // Emergency Info
  emergencyContactNumber?: string;
  bloodGroup?: string;
}

// Doctor Models
export interface Doctor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  hospital: string;
  city: string;
  state?: string;
  yearsOfExperience?: number;
  experience?: number;
  qualifications?: string[];
  biography?: string;
  consultationFee: number;
  inClinicFee?: number;
  videoConsultationFee?: number;
  teleconsultationFee?: number;
  rate?: number;
  rating?: number;
  reviewCount?: number;
  touristFriendly: boolean;
  teleconsultation: boolean;
  verified: boolean;
  languages?: string[];
  localLanguages?: string[];
  foreignLanguages?: string[];
  trustScore?: number;
  distanceKm?: number | null;
  matchReasons?: string[];
  availability?: AvailabilitySlot[];
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilitySlot {
  day: string;
  startTime: string;
  endTime: string;
  slots?: TimeSlot[];
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface DoctorSearchQuery {
  search?: string;
  specialty?: string;
  city?: string;
  state?: string;
  language?: string;
  languages?: string[];
  foreignLanguage?: string | string[];
  touristFriendly?: boolean;
  teleconsultation?: boolean;
  availableToday?: boolean;
  minRating?: number;
  sortBy?: 'trust' | 'rating' | 'distance' | 'latest';
  lat?: number;
  lng?: number;
  radiusKm?: number;
  page?: number;
  limit?: number;
}

// Appointment Models
export interface Appointment {
  _id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  hospital: string;
  appointmentDate: string;
  timeSlot: string;
  appointmentType: 'In-Person' | 'Teleconsultation';
  reason: string;
  notes?: string;
  status: 'booked' | 'confirmed' | 'completed' | 'cancelled';
  consultationFee: number;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentPayload {
  doctorId: string;
  appointmentDate: string;
  timeSlot: string;
  appointmentType: string;
  reason: string;
  notes?: string;
}

// Chat Models
export interface Chat {
  _id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  lastMessage: string;
  lastMessageTime: string;
  isRead: boolean;
  messages?: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  _id: string;
  sender: 'patient' | 'doctor';
  content: string;
  timestamp: string;
  read: boolean;
}

// Review Models
export interface Review {
  _id: string;
  doctorId: string;
  patientId: string;
  appointmentId?: string;
  rating: number;
  title?: string;
  comment: string;
  patientName: string;
  date: string;
  helpful?: number;
  flagged?: boolean;
  approved?: boolean;
  isApproved?: boolean;
  isFlagged?: boolean;
}

export interface ReviewPayload {
  doctorId: string;
  appointmentId: string;
  rating: number;
  title?: string;
  comment: string;
}

// Prescription Models
export interface Prescription {
  _id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  hospital: string;
  doctorLicense: string;
  issueDate: string;
  validUntil: string;
  diagnosis: string;
  medicines: Medicine[];
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

// Symptom Checker Models
export interface SymptomAnalysisResult {
  urgency: 'Low' | 'Medium' | 'High' | 'Emergency';
  urgencyLevel?: 'low' | 'medium' | 'high' | 'emergency';
  message?: string;
  detectedSymptoms?: string[];
  primarySpecialty?: string;
  possibleConditions: Condition[];
  recommendedSpecialties: Specialty[];
  advice?: string[];
  recommendedDoctors?: Doctor[];
  safety?: {
    isEmergency: boolean;
    disclaimer: string;
    emergencyAction?: string | null;
  };
  searchContext?: {
    usedGeo: boolean;
    city?: string | null;
    radiusKm?: number | null;
    specialty?: string;
  };
}

export interface SymptomRecommendationPayload {
  text: string;
  city?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  preferredLanguages?: string[];
  limit?: number;
}

export interface Condition {
  name: string;
  description: string;
  probability: number;
}

export interface Specialty {
  name: string;
  description: string;
  relevance: number;
}

// API Response Models
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ListResponse<T> {
  success: boolean;
  message: string;
  data?: T[];
  count?: number;
  page?: number;
  totalPages?: number;
}
