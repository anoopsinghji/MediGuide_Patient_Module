import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services';

export const useTitle = (title: string) => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${title} | MediGuide`;
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
};

export const useLocalStorage = <T,>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
};

export const useAuth = () => {
  const { user, token, isAuthenticated, setUser, setToken, setIsAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  return {
    user,
    token,
    isAuthenticated,
    setUser,
    setToken,
    setIsAuthenticated,
    logout: () => {
      logout();
      navigate('/login');
    },
    loginUser: async (email: string, password: string) => {
      try {
        const response = await authService.login(email, password);
        if (response.user && response.token) {
          setUser(response.user);
          setToken(response.token);
          setIsAuthenticated(true);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Login failed:', error);
        return false;
      }
    },
  };
};
