import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

type AuthWallOptions = {
  feature?: string;
  returnTo?: string;
  doctorId?: string;
};

export const useAuthWall = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const goToAuthWall = (options: AuthWallOptions = {}) => {
    const params = new URLSearchParams();
    params.set('feature', options.feature || 'member-feature');
    params.set('returnTo', options.returnTo || `${location.pathname}${location.search}`);

    if (options.doctorId) {
      params.set('doctorId', options.doctorId);
    }

    navigate(`/register-wall?${params.toString()}`);
  };

  const requireAuth = (onAllowed: () => void, options: AuthWallOptions = {}) => {
    if (isAuthenticated) {
      onAllowed();
      return true;
    }

    goToAuthWall(options);
    return false;
  };

  return {
    isAuthenticated,
    goToAuthWall,
    requireAuth,
  };
};
