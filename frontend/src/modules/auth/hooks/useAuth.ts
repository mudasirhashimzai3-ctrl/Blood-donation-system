import { useEffect, useState } from 'react';
import { useUserStore } from '@/modules/auth/stores/useUserStore';
import { getAccessToken } from '@/lib/api';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { userProfile, fetchUserProfile, reset } = useUserStore();

  useEffect(() => {
    const initializeAuth = () => {
      const token = getAccessToken();
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        reset();
        return;
      }

      // Token exists, so bootstrap authenticated state immediately.
      setIsAuthenticated(true);
      setIsLoading(false);

      // Keep profile fetch as background verification and hydration.
      if (!userProfile) {
        fetchUserProfile().catch(() => {
          // Only clear auth if profile is still missing (invalid session path).
          if (!useUserStore.getState().userProfile) {
            sessionStorage.removeItem('accessToken');
            setIsAuthenticated(false);
            reset();
          }
        });
      }
    };

    initializeAuth();
  }, [fetchUserProfile, reset, userProfile]);

  // Update authentication status when userProfile changes
  useEffect(() => {
    setIsAuthenticated(!!userProfile || !!getAccessToken());
  }, [userProfile]);

  return {
    isLoading,
    isAuthenticated,
    userProfile,
  };
};
