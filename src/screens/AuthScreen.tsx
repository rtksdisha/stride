import { useState, useEffect } from 'react';
import { signUp, logIn, googleSignIn } from '../lib/auth';

interface AuthScreenProps {
  onAuth: () => void;
  onGuest: () => void;
  onLogoClick?: () => void;
  initialMode?: 'signup' | 'login';
}

export function AuthScreen({ onAuth, onGuest, onLogoClick, initialMode = 'signup' }: AuthScreenProps) {
  const [mode, setMode] = useState<'signup' | 'login'>(initialMode);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      if (mode === 'signup') {
        if (!name.trim()) { setError('Please enter your name.'); setLoading(false); return; }
        await signUp(email, password, name.trim());
      } else {
        await logIn(email, password);
      }
      onAuth();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Something went wrong.';
      // Clean up Firebase error messages
      if (msg.includes('auth/email-already-in-use')) setError('An account with this email already exists.');
      else if (msg.includes('auth/invalid-email')) setError('Please enter a valid email address.');
      else if (msg.includes('auth/weak-password')) setError('Password must be at least 6 characters.');
      else if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password') || msg.includes('auth/user-not-found')) setError('Invalid email or password.');
      else setError(msg);
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      await googleSignIn();
      onAuth();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Google sign-in failed.';
      if (msg.includes('auth/popup-closed-by-user')) setError('Sign-in popup was closed.');
      else setError(msg);
    }
    setLoading(false);
  };

  const inputStyle = (focused: boolean): React.CSSProperties => ({
    width: '100%',
    maxWidth: 380,
    padding: '14px 16px',
    border: `1.5px solid ${focused ? 'var(--ink)' : 'rgba(30,37,34,0.12)'}`,
    borderRadius: 12,
    font: "400 15px 'Spline Sans'",
    color: '#1E2522',
    outline: 'none',
    background: '#fff',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.15s ease',
  });

  const [focusField, setFocusField] = useState<string | null>(null);

  return (
    <div className="app-shell" style={{ display: 'flex' }}>
      {/* LEFT PANEL */}
      <div
        style={{
          width: '46%',
          padding: '54px 48px',
          background: '#1E2522',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div onClick={onLogoClick} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <span style={{ font: "600 22px 'Spline Sans'", letterSpacing: '-0.02em' }}>stride</span>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2f7d5b', marginTop: 8 }} />
        </div>
        <div>
          <div style={{
            font: "400 13px 'Spline Sans Mono'",
            letterSpacing: '0.12em',
            color: 'rgba(255,255,255,0.5)',
            textTransform: 'uppercase',
          }}>
            {mode === 'signup' ? 'Create your account' : 'Welcome back'}
          </div>
          <div style={{
            font: "400 42px/1.18 'Newsreader'",
            marginTop: 18,
            letterSpacing: '-0.01em',
          }}>
            {mode === 'signup'
              ? 'Start your financial forecast.'
              : 'Pick up where you left off.'}
          </div>
          <div style={{
            font: "400 16px/1.6 'Spline Sans'",
            color: 'rgba(255,255,255,0.62)',
            marginTop: 20,
            maxWidth: 380,
          }}>
            Stride projects your affordability years into the future and tells you the date you can hit every goal.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 26 }}>
          <div>
            <div style={{ font: "500 22px 'Newsreader'", color: '#fff' }}>5 yrs</div>
            <div style={{ font: "400 12px 'Spline Sans Mono'", color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>forecast horizon</div>
          </div>
          <div>
            <div style={{ font: "500 22px 'Newsreader'", color: '#fff' }}>~2 min</div>
            <div style={{ font: "400 12px 'Spline Sans Mono'", color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>to set up</div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '54px 56px',
      }}>
        <div style={{
          font: "500 11px 'Spline Sans Mono'",
          letterSpacing: '0.14em',
          color: '#A8AEA8',
          textTransform: 'uppercase',
        }}>
          {mode === 'signup' ? 'Sign up' : 'Log in'}
        </div>
        <div style={{
          font: "400 32px/1.22 'Newsreader'",
          color: '#1E2522',
          marginTop: 12,
          letterSpacing: '-0.01em',
        }}>
          {mode === 'signup' ? 'Create your account' : 'Sign in to your account'}
        </div>

        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 380 }}>
          {mode === 'signup' && (
            <div>
              <label style={{ font: "500 11px 'Spline Sans Mono'", letterSpacing: '0.06em', color: '#7B827D', textTransform: 'uppercase' }}>
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocusField('name')}
                onBlur={() => setFocusField(null)}
                placeholder="John Doe"
                style={{ ...inputStyle(focusField === 'name'), marginTop: 6, display: 'block' }}
              />
            </div>
          )}
          <div>
            <label style={{ font: "500 11px 'Spline Sans Mono'", letterSpacing: '0.06em', color: '#7B827D', textTransform: 'uppercase' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusField('email')}
              onBlur={() => setFocusField(null)}
              placeholder="you@example.com"
              style={{ ...inputStyle(focusField === 'email'), marginTop: 6, display: 'block' }}
            />
          </div>
          <div>
            <label style={{ font: "500 11px 'Spline Sans Mono'", letterSpacing: '0.06em', color: '#7B827D', textTransform: 'uppercase' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusField('password')}
              onBlur={() => setFocusField(null)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
              style={{ ...inputStyle(focusField === 'password'), marginTop: 6, display: 'block' }}
            />
          </div>

          {error && (
            <div style={{
              font: "500 13px 'Spline Sans'",
              color: 'var(--debt-bad)',
              background: 'rgba(192,70,59,0.07)',
              padding: '10px 14px',
              borderRadius: 10,
            }}>
              {error}
            </div>
          )}

          <div
            onClick={!loading ? handleSubmit : undefined}
            style={{
              width: '100%',
              padding: '16px',
              background: loading ? '#3a4540' : '#1E2522',
              color: '#fff',
              borderRadius: 14,
              font: "600 15px 'Spline Sans'",
              cursor: loading ? 'default' : 'pointer',
              textAlign: 'center',
              marginTop: 4,
              boxSizing: 'border-box',
            }}
          >
            {loading ? '...' : mode === 'signup' ? 'Create account' : 'Log in'}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            color: '#A8AEA8',
            font: "400 12px 'Spline Sans'",
          }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(30,37,34,0.1)' }} />
            or
            <div style={{ flex: 1, height: 1, background: 'rgba(30,37,34,0.1)' }} />
          </div>

          <div
            onClick={!loading ? handleGoogle : undefined}
            style={{
              width: '100%',
              padding: '14px',
              background: '#fff',
              border: '1.5px solid rgba(30,37,34,0.12)',
              borderRadius: 14,
              font: "600 14px 'Spline Sans'",
              color: '#1E2522',
              cursor: loading ? 'default' : 'pointer',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              boxSizing: 'border-box',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </div>
        </div>

        <div style={{ marginTop: 24, font: "400 13px 'Spline Sans'", color: '#7B827D' }}>
          {mode === 'signup' ? (
            <span>Already have an account? <span onClick={() => { setMode('login'); setError(null); }} style={{ color: 'var(--ink)', fontWeight: 600, cursor: 'pointer' }}>Log in</span></span>
          ) : (
            <span>Don't have an account? <span onClick={() => { setMode('signup'); setError(null); }} style={{ color: 'var(--ink)', fontWeight: 600, cursor: 'pointer' }}>Sign up</span></span>
          )}
        </div>
        <div
          onClick={onGuest}
          style={{
            marginTop: 16,
            font: "500 12px 'Spline Sans'",
            color: '#A8AEA8',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 5,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h9m0 0l-4-4m4 4l-4 4" stroke="#A8AEA8" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Skip — try as guest
        </div>
      </div>
    </div>
  );
}
