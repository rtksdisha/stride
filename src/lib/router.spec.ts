import { describe, it, expect } from 'vitest';
import { parseUrl, getPathForState } from './router';

describe('Vite App Router URL Mapping', () => {
  describe('parseUrl', () => {
    it('should map /login to auth screen with login mode', () => {
      expect(parseUrl('/login')).toEqual({ screen: 'auth', authMode: 'login' });
    });

    it('should map /signup to auth screen with signup mode', () => {
      expect(parseUrl('/signup')).toEqual({ screen: 'auth', authMode: 'signup' });
    });

    it('should map /onboarding to onboarding screen', () => {
      expect(parseUrl('/onboarding')).toEqual({ screen: 'onboarding' });
    });

    it('should map /forecast and /dashboard to dashboard screen', () => {
      expect(parseUrl('/forecast')).toEqual({ screen: 'dashboard' });
      expect(parseUrl('/dashboard')).toEqual({ screen: 'dashboard' });
    });

    it('should map /plan and /scenario to scenario screen', () => {
      expect(parseUrl('/plan')).toEqual({ screen: 'scenario' });
      expect(parseUrl('/scenario')).toEqual({ screen: 'scenario' });
    });

    it('should map /goals and /milestones to milestone screen', () => {
      expect(parseUrl('/goals')).toEqual({ screen: 'milestone' });
      expect(parseUrl('/milestones')).toEqual({ screen: 'milestone' });
    });

    it('should map unknown routes to landing screen', () => {
      expect(parseUrl('/')).toEqual({ screen: 'landing' });
      expect(parseUrl('/unknown-route')).toEqual({ screen: 'landing' });
    });
  });

  describe('getPathForState', () => {
    it('should generate /login for auth screen with login mode', () => {
      expect(getPathForState('auth', 'login')).toBe('/login');
    });

    it('should generate /signup for auth screen with signup mode', () => {
      expect(getPathForState('auth', 'signup')).toBe('/signup');
    });

    it('should generate /onboarding for onboarding screen', () => {
      expect(getPathForState('onboarding', 'signup')).toBe('/onboarding');
    });

    it('should generate /forecast for dashboard screen', () => {
      expect(getPathForState('dashboard', 'signup')).toBe('/forecast');
    });

    it('should generate /plan for scenario screen', () => {
      expect(getPathForState('scenario', 'signup')).toBe('/plan');
    });

    it('should generate /goals for milestone screen', () => {
      expect(getPathForState('milestone', 'signup')).toBe('/goals');
    });

    it('should generate / for landing screen', () => {
      expect(getPathForState('landing', 'signup')).toBe('/');
    });
  });
});
