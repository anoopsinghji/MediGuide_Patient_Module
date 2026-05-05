import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, Menu, UserRound, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { AnimatePresence, motion } from 'framer-motion';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out ${
    isActive
      ? 'text-teal-600'
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
  } after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:bg-teal-600 after:transition-all after:duration-300 after:ease-in-out ${
    isActive ? 'after:w-4' : 'after:w-0'
  } after:-translate-x-1/2`;

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block px-4 py-3 rounded-md text-base font-medium ${
    isActive ? 'bg-teal-50 text-teal-700' : 'text-gray-700 hover:bg-gray-50'
  }`;

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { t } = useTranslation();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isProfileMenuOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsProfileMenuOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isProfileMenuOpen]);

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
    logout();
    navigate('/login');
  };

  const navLinks = (isMobile = false) => {
    const links = [
      { to: '/home', label: t('navbar.home') },
      { to: '/symptom-checker', label: t('navbar.symptom_checker') },
      { to: '/find-doctors', label: t('navbar.find_doctors') },
    ];

    if (isAuthenticated) {
      links.push(
        { to: '/appointments', label: t('navbar.appointments') },
        { to: '/prescriptions', label: t('navbar.prescriptions') },
        { to: '/chat', label: t('navbar.chat') }
      );
    }

    return links.map((link) => (
      <NavLink
        key={link.to}
        to={link.to}
        className={isMobile ? mobileLinkClass : linkClass}
        onClick={() => isMobile && setIsMobileMenuOpen(false)}
      >
        {link.label}
      </NavLink>
    ));
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200/80">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <button
                onClick={() => navigate('/home')}
                className="flex items-center gap-2 text-xl font-bold text-gray-800 tracking-tight"
              >
                <img src="/logo.svg" alt="MediGuide Logo" className="h-8 w-auto" />
                <span className="hidden sm:inline">MediGuide</span>
              </button>
            </div>

            <nav className="hidden md:flex items-center justify-center gap-1 flex-1">
              {navLinks()}
            </nav>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2">
                {isAuthenticated ? (
                  <div className="relative" ref={profileMenuRef}>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                      className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors duration-200"
                      aria-haspopup="menu"
                      aria-expanded={isProfileMenuOpen}
                    >
                      <span className="h-8 w-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-sm font-bold border border-teal-200">
                        {(user?.name || 'U').trim().charAt(0).toUpperCase()}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                          isProfileMenuOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </motion.button>

                    <AnimatePresence>
                      {isProfileMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.15, ease: 'easeOut' }}
                          className="absolute right-0 mt-2 w-60 origin-top-right bg-white border border-gray-200 rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden z-50"
                          role="menu"
                        >
                          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                            <p className="text-sm font-semibold text-gray-800 truncate">
                              {user?.name || 'User'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user?.email || ''}
                            </p>
                          </div>
                          <div className="py-1" role="none">
                            <button
                              onClick={() => { setIsProfileMenuOpen(false); navigate('/profile'); }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                              role="menuitem"
                            >
                              <UserRound className="w-4 h-4 text-gray-500" />
                              <span>{t('navbar.profile')}</span>
                            </button>
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                              role="menuitem"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>{t('navbar.logout')}</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => navigate('/login')}
                      className="px-4 py-1.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      {t('navbar.login')}
                    </button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/register')}
                      className="px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors duration-200 shadow-sm"
                    >
                      {t('navbar.join_now')}
                    </motion.button>
                  </>
                )}
              </div>
              <div className="pl-2 border-l border-gray-200">
                <LanguageSwitcher />
              </div>
              <div className="md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
                >
                  <span className="sr-only">Open main menu</span>
                  {isMobileMenuOpen ? (
                    <X className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Menu className="block h-6 w-6" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="md:hidden fixed top-16 left-0 right-0 z-40 bg-white shadow-md overflow-hidden"
          >
            <div className="pt-2 pb-3 space-y-1 px-2">
              {navLinks(true)}
              {!isAuthenticated && (
                <div className="border-t border-gray-200 pt-4 mt-4 flex items-center gap-3 px-2">
                   <button
                      onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}
                      className="flex-1 text-center px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                    >
                      {t('navbar.login')}
                    </button>
                    <button
                      onClick={() => { navigate('/register'); setIsMobileMenuOpen(false); }}
                      className="flex-1 text-center px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors duration-200 shadow-sm"
                    >
                      {t('navbar.join_now')}
                    </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
