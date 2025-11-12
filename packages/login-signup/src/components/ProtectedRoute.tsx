import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';

/**
 * ProtectedRoute with dev bypass toggle.
 *
 * Behavior:
 * - If VITE_AUTH_ENABLED === 'true' (env var), it will enforce auth (token required).
 * - Otherwise (default) it bypasses auth, allowing you to develop without tokens.
 *
 * This lets you work while the backend is unsecured, and switch on enforcement later
 * by setting VITE_AUTH_ENABLED=true and restarting Vite.
 */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const authEnabled = import.meta.env.VITE_AUTH_ENABLED === 'true';

  if (!authEnabled) {
    // Auth disabled — allow through for development convenience
    return <>{children}</>;
  }

  // Auth enabled — check redux token first, then localStorage fallback
  try {
    const tokenFromStore = useSelector((s: RootState) => s.auth?.token);
    const token = tokenFromStore || typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (!token) {
      return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
  } catch (e) {
    // If Redux isn't fully initialized for some reason, fallback to localStorage check:
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return <Navigate to="/login" replace />;
    return <>{children}</>;
  }
}
