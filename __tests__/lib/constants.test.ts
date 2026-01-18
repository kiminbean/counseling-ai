import { describe, it, expect } from 'vitest';
import {
  CRISIS_HOTLINES,
  HOTLINE_SUICIDE,
  HOTLINE_MENTAL_HEALTH,
  EMOTION_COLORS,
  getEmotionColors,
  getEmotionEmoji,
  MOOD_OPTIONS,
  APP_CONFIG,
} from '@/lib/constants';

describe('constants', () => {
  describe('Crisis Hotlines', () => {
    it('should have suicide prevention hotline', () => {
      expect(CRISIS_HOTLINES.suicidePrevention).toBeDefined();
      expect(CRISIS_HOTLINES.suicidePrevention.number).toBe('1393');
    });

    it('should have mental health hotline', () => {
      expect(CRISIS_HOTLINES.mentalHealth).toBeDefined();
      expect(CRISIS_HOTLINES.mentalHealth.number).toBe('1577-0199');
    });

    it('should export shortcut constants', () => {
      expect(HOTLINE_SUICIDE).toBe('1393');
      expect(HOTLINE_MENTAL_HEALTH).toBe('1577-0199');
    });
  });

  describe('Emotion Colors', () => {
    it('should have colors for common emotions', () => {
      expect(EMOTION_COLORS.happy).toBeDefined();
      expect(EMOTION_COLORS.sad).toBeDefined();
      expect(EMOTION_COLORS.angry).toBeDefined();
      expect(EMOTION_COLORS.anxious).toBeDefined();
      expect(EMOTION_COLORS.calm).toBeDefined();
      expect(EMOTION_COLORS.neutral).toBeDefined();
    });

    it('should have bg and text properties', () => {
      expect(EMOTION_COLORS.happy.bg).toContain('bg-');
      expect(EMOTION_COLORS.happy.text).toContain('text-');
    });
  });

  describe('getEmotionColors', () => {
    it('should return colors for known emotions', () => {
      const colors = getEmotionColors('happy');
      expect(colors.bg).toBe('bg-amber-100');
      expect(colors.text).toBe('text-amber-700');
    });

    it('should be case-insensitive', () => {
      const colors1 = getEmotionColors('HAPPY');
      const colors2 = getEmotionColors('Happy');
      expect(colors1).toEqual(colors2);
    });

    it('should return neutral for unknown emotions', () => {
      const colors = getEmotionColors('unknown_emotion');
      expect(colors).toEqual(EMOTION_COLORS.neutral);
    });
  });

  describe('getEmotionEmoji', () => {
    it('should return emoji for known emotions', () => {
      expect(getEmotionEmoji('happy')).toBe('😊');
      expect(getEmotionEmoji('sad')).toBe('😢');
    });

    it('should return default emoji for unknown emotions', () => {
      expect(getEmotionEmoji('unknown')).toBe('💭');
    });
  });

  describe('Mood Options', () => {
    it('should have 5 mood options', () => {
      expect(MOOD_OPTIONS).toHaveLength(5);
    });

    it('should have required properties', () => {
      MOOD_OPTIONS.forEach((option) => {
        expect(option.value).toBeDefined();
        expect(option.label).toBeDefined();
        expect(option.emoji).toBeDefined();
        expect(option.color).toBeDefined();
      });
    });
  });

  describe('App Config', () => {
    it('should have app name', () => {
      expect(APP_CONFIG.name).toBe('MindBridge AI');
    });

    it('should have version', () => {
      expect(APP_CONFIG.version).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });
});
