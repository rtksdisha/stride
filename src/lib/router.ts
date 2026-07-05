import type { ScreenId } from '../types';

export interface RouteState {
  screen: ScreenId;
  authMode?: 'login' | 'signup';
}

export function parseUrl(pathname: string): RouteState {
  if (pathname === '/login') return { screen: 'auth', authMode: 'login' };
  if (pathname === '/signup') return { screen: 'auth', authMode: 'signup' };
  if (pathname === '/onboarding') return { screen: 'onboarding' };
  if (pathname === '/forecast' || pathname === '/dashboard') return { screen: 'dashboard' };
  if (pathname === '/plan' || pathname === '/scenario') return { screen: 'scenario' };
  if (pathname === '/goals' || pathname === '/milestones') return { screen: 'milestone' };
  return { screen: 'landing' };
}

export function getPathForState(screen: ScreenId, authMode: 'login' | 'signup'): string {
  if (screen === 'auth') return authMode === 'login' ? '/login' : '/signup';
  if (screen === 'onboarding') return '/onboarding';
  if (screen === 'dashboard') return '/forecast';
  if (screen === 'scenario') return '/plan';
  if (screen === 'milestone') return '/goals';
  return '/';
}
