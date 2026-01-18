'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { secureStorage, migrateTokenStorage, addCsrfHeader } from '@/lib/security';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  anonymousId: string | null;
  accessToken: string | null;
}

interface AuthContextType extends AuthState {
  initialize: () => Promise<void>;
  logout: () => void;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

// 민감하지 않은 ID는 일반 localStorage 사용
function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return '';

  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
}

function getOrCreateUserId(): string {
  if (typeof window === 'undefined') return '';

  let userId = localStorage.getItem('user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('user_id', userId);
  }
  return userId;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    userId: null,
    anonymousId: null,
    accessToken: null,
  });

  const initialize = useCallback(async () => {
    if (typeof window === 'undefined') {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    // 기존 평문 토큰 마이그레이션 (한 번만)
    migrateTokenStorage();

    // secureStorage에서 기존 토큰 확인
    const storedToken = secureStorage.getToken('access_token');
    const storedUserId = localStorage.getItem('user_id');
    const storedAnonymousId = localStorage.getItem('anonymous_id');

    if (storedToken && storedUserId) {
      setState({
        isAuthenticated: true,
        isLoading: false,
        userId: storedUserId,
        anonymousId: storedAnonymousId,
        accessToken: storedToken,
      });
      return;
    }

    // 익명 토큰 획득 시도
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
      const deviceId = getOrCreateDeviceId();
      const userId = getOrCreateUserId();

      const response = await fetch(`${API_BASE_URL}/api/v3/auth/anonymous`, {
        method: 'POST',
        headers: addCsrfHeader({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          device_id: deviceId,
          language: 'ko'
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // 토큰은 secureStorage에 저장 (암호화)
        if (data.access_token) {
          secureStorage.setToken('access_token', data.access_token);
        }
        if (data.refresh_token) {
          secureStorage.setToken('refresh_token', data.refresh_token);
        }
        // 민감하지 않은 ID는 일반 localStorage에 저장
        if (data.user_id) {
          localStorage.setItem('user_id', data.user_id);
        }
        if (data.anonymous_id) {
          localStorage.setItem('anonymous_id', data.anonymous_id);
        }

        setState({
          isAuthenticated: true,
          isLoading: false,
          userId: data.user_id || userId,
          anonymousId: data.anonymous_id || null,
          accessToken: data.access_token || null,
        });
      } else {
        // 인증 서버 오류 시에도 userId는 유지
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Anonymous auth failed, continuing without token');
        }
        setState({
          isAuthenticated: false,
          isLoading: false,
          userId: userId,
          anonymousId: null,
          accessToken: null,
        });
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Auth initialization failed:', error);
      }
      const userId = getOrCreateUserId();
      setState({
        isAuthenticated: false,
        isLoading: false,
        userId: userId,
        anonymousId: null,
        accessToken: null,
      });
    }
  }, []);

  const logout = useCallback(() => {
    if (typeof window === 'undefined') return;

    // secureStorage 토큰 삭제
    secureStorage.removeToken('access_token');
    secureStorage.removeToken('refresh_token');
    localStorage.removeItem('anonymous_id');
    // user_id와 device_id는 유지

    setState({
      isAuthenticated: false,
      isLoading: false,
      userId: localStorage.getItem('user_id'),
      anonymousId: null,
      accessToken: null,
    });
  }, []);

  const getToken = useCallback(() => {
    if (typeof window === 'undefined') return null;
    return secureStorage.getToken('access_token');
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <AuthContext.Provider value={{ ...state, initialize, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
