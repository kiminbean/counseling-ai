/**
 * 보안 유틸리티
 * - 토큰 암호화/복호화
 * - 메모리 기반 토큰 저장소
 * - CSRF 토큰 관리
 */

// 간단한 XOR 기반 난독화 (브라우저에서 완전한 암호화는 불가능)
const OBFUSCATION_KEY = 'MindBridge_2024_SecureKey';

/**
 * 문자열 난독화 (XOR 기반)
 * 완전한 암호화가 아닌 casual observer로부터 보호
 */
function obfuscate(text: string): string {
  if (!text) return '';
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ OBFUSCATION_KEY.charCodeAt(i % OBFUSCATION_KEY.length);
    result += String.fromCharCode(charCode);
  }
  return btoa(result); // Base64 인코딩
}

/**
 * 난독화 해제
 */
function deobfuscate(encoded: string): string {
  if (!encoded) return '';
  try {
    const text = atob(encoded); // Base64 디코딩
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ OBFUSCATION_KEY.charCodeAt(i % OBFUSCATION_KEY.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch {
    return '';
  }
}

// 메모리 기반 토큰 저장소 (XSS에 대해 더 안전)
const memoryStore: Map<string, string> = new Map();

// HTTPS 체크
function isSecureContext(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.protocol === 'https:' || window.location.hostname === 'localhost';
}

/**
 * 보안 토큰 저장소
 * - 메모리에 평문 저장 (1차)
 * - localStorage에 난독화하여 백업 (2차)
 */
export const secureStorage = {
  /**
   * 토큰 저장
   */
  setToken(key: string, value: string): void {
    if (typeof window === 'undefined') return;

    // 메모리에 저장 (가장 안전)
    memoryStore.set(key, value);

    // localStorage에 난독화하여 백업 (페이지 새로고침 대비)
    try {
      const obfuscatedValue = obfuscate(value);
      localStorage.setItem(`_sec_${key}`, obfuscatedValue);
    } catch {
      // localStorage 실패 시 무시 (private browsing 등)
    }
  },

  /**
   * 토큰 가져오기
   */
  getToken(key: string): string | null {
    if (typeof window === 'undefined') return null;

    // 메모리에서 먼저 확인
    const memoryValue = memoryStore.get(key);
    if (memoryValue) return memoryValue;

    // localStorage 백업에서 복구
    try {
      const obfuscatedValue = localStorage.getItem(`_sec_${key}`);
      if (obfuscatedValue) {
        const value = deobfuscate(obfuscatedValue);
        if (value) {
          // 메모리에 다시 저장
          memoryStore.set(key, value);
          return value;
        }
      }
    } catch {
      // 복구 실패 시 null 반환
    }

    return null;
  },

  /**
   * 토큰 삭제
   */
  removeToken(key: string): void {
    if (typeof window === 'undefined') return;

    memoryStore.delete(key);
    try {
      localStorage.removeItem(`_sec_${key}`);
    } catch {
      // 무시
    }
  },

  /**
   * 모든 토큰 삭제 (로그아웃 시)
   */
  clearAll(): void {
    if (typeof window === 'undefined') return;

    memoryStore.clear();
    try {
      // _sec_ 접두사로 시작하는 모든 항목 삭제
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('_sec_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch {
      // 무시
    }
  },

  /**
   * 보안 컨텍스트 확인
   */
  isSecure(): boolean {
    return isSecureContext();
  },
};

// CSRF 토큰 관리
let csrfToken: string | null = null;

/**
 * CSRF 토큰 생성
 */
function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * CSRF 토큰 가져오기 (없으면 생성)
 */
export function getCsrfToken(): string {
  if (!csrfToken) {
    csrfToken = generateCsrfToken();
  }
  return csrfToken;
}

/**
 * CSRF 토큰 갱신
 */
export function refreshCsrfToken(): string {
  csrfToken = generateCsrfToken();
  return csrfToken;
}

/**
 * 요청 헤더에 CSRF 토큰 추가
 */
export function addCsrfHeader(headers: HeadersInit = {}): HeadersInit {
  return {
    ...headers,
    'X-CSRF-Token': getCsrfToken(),
  };
}

// 기존 localStorage 마이그레이션 (한 번만 실행)
export function migrateTokenStorage(): void {
  if (typeof window === 'undefined') return;

  const migrationKey = '_token_migrated';
  if (localStorage.getItem(migrationKey)) return;

  // 기존 평문 토큰 마이그레이션
  const oldKeys = ['access_token', 'refresh_token'];
  oldKeys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      secureStorage.setToken(key, value);
      localStorage.removeItem(key);
    }
  });

  localStorage.setItem(migrationKey, 'true');
}
