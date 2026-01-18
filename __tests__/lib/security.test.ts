import { describe, it, expect, vi, beforeEach } from 'vitest';
import { secureStorage, getCsrfToken, refreshCsrfToken, addCsrfHeader } from '@/lib/security';

describe('security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear memory store
    secureStorage.clearAll();
  });

  describe('secureStorage', () => {
    it('should store and retrieve tokens', () => {
      secureStorage.setToken('test_key', 'test_value');
      expect(secureStorage.getToken('test_key')).toBe('test_value');
    });

    it('should remove tokens', () => {
      secureStorage.setToken('test_key', 'test_value');
      secureStorage.removeToken('test_key');
      expect(secureStorage.getToken('test_key')).toBeNull();
    });

    it('should clear all tokens', () => {
      secureStorage.setToken('key1', 'value1');
      secureStorage.setToken('key2', 'value2');
      secureStorage.clearAll();
      expect(secureStorage.getToken('key1')).toBeNull();
      expect(secureStorage.getToken('key2')).toBeNull();
    });

    it('should return null for non-existent keys', () => {
      expect(secureStorage.getToken('non_existent')).toBeNull();
    });
  });

  describe('CSRF Token', () => {
    it('should generate CSRF token', () => {
      const token = getCsrfToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should return same token on multiple calls', () => {
      const token1 = getCsrfToken();
      const token2 = getCsrfToken();
      expect(token1).toBe(token2);
    });

    it('should generate new token on refresh', () => {
      const token1 = getCsrfToken();
      const token2 = refreshCsrfToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('addCsrfHeader', () => {
    it('should add CSRF token to headers', () => {
      const headers = addCsrfHeader({ 'Content-Type': 'application/json' });
      expect(headers).toHaveProperty('X-CSRF-Token');
      expect(headers).toHaveProperty('Content-Type', 'application/json');
    });

    it('should work with empty headers', () => {
      const headers = addCsrfHeader();
      expect(headers).toHaveProperty('X-CSRF-Token');
    });
  });
});
