import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { ConfirmProvider } from './components/confirm/ConfirmProvider';

// Components
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedLayout from './components/ProtectedLayout';

// Pages
import Home from './pages/Home';
import FindDoctors from './pages/FindDoctors';
import DoctorProfile from './pages/DoctorProfile';
import SymptomChecker from './pages/SymptomChecker';
import MyAppointments from './pages/MyAppointments';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import Prescriptions from './pages/Prescriptions';
import RegisterWall from './pages/RegisterWall';
import { PatientVideoConsultation } from './pages/PatientVideoConsultation';
import InfoPage from './pages/InfoPage';
import PublicLayout from './components/PublicLayout';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import HelpCenter from './pages/HelpCenter';
import About from './pages/About';
import Partner from './pages/Partner';
import Careers from './pages/Careers';
import Contact from './pages/Contact';

function App() {
  const { isAuthenticated } = useAuthStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const syncViewport = () => setIsMobile(mediaQuery.matches);
    syncViewport();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', syncViewport);
      return () => mediaQuery.removeEventListener('change', syncViewport);
    }

    mediaQuery.addListener(syncViewport);
    return () => mediaQuery.removeListener(syncViewport);
  }, []);

  return (
    <ConfirmProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/home" replace /> : <Login />}
          />
          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to="/home" replace /> : <Register />}
          />
          <Route path="/register-wall" element={<RegisterWall />} />

          {/* Shared Layout Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/find-doctors" element={<FindDoctors />} />
            <Route path="/doctor/:id" element={<DoctorProfile />} />
            <Route path="/symptom-checker" element={<SymptomChecker />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/about" element={<About />} />
            <Route path="/partner" element={<Partner />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/company/:page" element={<InfoPage />} />
            <Route path="/legal/:page" element={<InfoPage />} />
          </Route>

          <Route element={<ProtectedLayout />}>
            <Route
              path="/appointments"
              element={
                <ProtectedRoute>
                  <MyAppointments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/consultation/:appointmentId"
              element={
                <ProtectedRoute>
                  <PatientVideoConsultation />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/prescriptions"
              element={
                <ProtectedRoute>
                  <Prescriptions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Redirect */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Router>

      {/* Toast Notifications */}
      <Toaster
        position={isMobile ? 'bottom-center' : 'top-right'}
        reverseOrder={false}
        gutter={8}
        containerStyle={isMobile ? { bottom: 12, left: 12, right: 12 } : undefined}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#000',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            maxWidth: 'min(92vw, 420px)',
            fontSize: '0.95rem',
          },
          success: {
            style: {
              background: '#10b981',
              color: '#fff',
            },
          },
          error: {
            style: {
              background: '#ef4444',
              color: '#fff',
            },
          },
        }}
      />
    </ConfirmProvider>
  );
}

export default App;
