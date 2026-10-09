import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuthStore } from '../stores/admin-auth.store.js';
import { adminApiService } from '../services/admin-api.service.js';

export function useAdminLogout(): () => Promise<void> {
  const navigate = useNavigate();
  const clearAuth = useAdminAuthStore((s) => s.clearAuth);

  return React.useCallback(async () => {
    try {
      await adminApiService.logout();
    } finally {
      clearAuth();
      navigate('/login');
    }
  }, [clearAuth, navigate]);
}
