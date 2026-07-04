import { useState, useRef, useEffect } from 'react';
import { useStride } from '../state/StrideContext';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export function AiChat({ inline = false }: { inline?: boolean }) {
  const stride = useStride();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hi! I'm Stride AI, your personal financial copilot. Ask me to add milestones, simulate budget changes, or optimize your debt payoff strategies, and I'll update your dashboard in real-time!",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, loading, isOpen]);

  // Send a custom text prompt to the agent (e.g. from the form)
  const sendPrompt = async (textPrompt: string) => {
    if (loading) return;
    setLoading(true);

    try {
      const currentState = {
        incomeStreams: stride.incomeStreams,
        spending: stride.spending,
        accounts: stride.accounts,
        debts: stride.debts,
        goals: stride.goals,
        extraPayment: stride.extraPayment,
        strategy: stride.strategy,
      };

      const response = await fetch('http://localhost:8000/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appName: 'app',
          userId: 'user_anya',
          sessionId: sessionId,
          newMessage: {
            role: 'user',
            parts: [{ text: textPrompt }],
          },
          stateDelta: currentState,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const events = await response.json();
      
      let replyText = '';
      let errorText = '';

      if (Array.isArray(events)) {
        for (const ev of events) {
          if (ev.errorCode) {
            errorText = ev.errorMessage || 'An error occurred during execution.';
          }
          if (ev.content && ev.content.parts && ev.author === 'stride_agent') {
            const textPart = ev.content.parts[0]?.text || '';
            replyText += textPart;
          }
          if (ev.actions && ev.actions.stateDelta) {
            stride.applyStateDelta(ev.actions.stateDelta);
          }
        }
      }

      const finalReply = errorText || replyText || "I've processed that request but didn't return a text explanation.";

      setMessages((prev) => [
        ...prev,
        {
          id: `msg_${Date.now()}_m`,
          role: 'model',
          text: finalReply,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_${Date.now()}_err`,
          role: 'model',
          text: `Failed to connect to Stride AI backend: ${err.message}. Please verify the Python server is running on port 8000.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userText = input.trim();
    setInput('');

    const userMessage: Message = {
      id: `msg_${Date.now()}_u`,
      role: 'user',
      text: userText,
    };
    setMessages((prev) => [...prev, userMessage]);
    
    await sendPrompt(userText);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const parseMessage = (text: string) => {
    const match = text.match(/\[FORM:\s*(\w+)\]/);
    if (match) {
      return {
        cleanText: text.replace(/\[FORM:\s*\w+\]/, '').trim(),
        formType: match[1] as 'sabbatical' | 'car' | 'house' | 'simple',
      };
    }
    return { cleanText: text, formType: null };
  };

  return (
    <>
      {/* FLOATING ACTION BUTTON */}
      {!inline && (
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          style={{
            position: 'fixed',
            right: 28,
            bottom: 28,
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'var(--ink)',
            border: 'none',
            boxShadow: '0 4px 16px rgba(30,37,34,0.25), 0 8px 32px rgba(30,37,34,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10000,
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            transform: `scale(${isOpen ? 0.95 : 1})`,
          }}
        >
          {isOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          )}
        </button>
      )}

      {/* CHAT WINDOW CARD */}
      {(inline || isOpen) && (
        <div
          style={{
            width: inline ? '100%' : 400,
            height: inline ? '100%' : 580,
            position: inline ? 'relative' : 'fixed',
            right: inline ? undefined : 28,
            bottom: inline ? undefined : 96,
            borderRadius: inline ? 0 : 20,
            borderLeft: '1px solid rgba(30,37,34,0.08)',
            borderRight: 'none',
            borderTop: 'none',
            borderBottom: 'none',
            background: '#fff',
            boxShadow: inline ? 'none' : '0 12px 48px rgba(30,37,34,0.15), 0 2px 8px rgba(30,37,34,0.05)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: inline ? 1 : 9999,
            animation: inline ? 'none' : 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          {/* HEADER */}
          <div
            style={{
              padding: '16px 20px',
              background: '#fff',
              borderBottom: '1px solid rgba(30,37,34,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ font: "600 15px 'Spline Sans'", color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 6 }}>
                Stride AI Copilot
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
              </div>
              <div style={{ font: "400 11px 'Spline Sans'", color: 'var(--ink-faint)', marginTop: 1 }}>
                Ask me to adjust goals, budget, or strategy
              </div>
            </div>
            <button
              onClick={() => {
                setMessages([
                  {
                    id: 'welcome',
                    role: 'model',
                    text: "Session reset. Ask me to add milestones, simulate budget changes, or optimize your debt payoff strategies!",
                  },
                ]);
              }}
              style={{
                font: "600 11px 'Spline Sans'",
                color: 'var(--ink-faint)',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                padding: '4px 8px',
              }}
            >
              Reset
            </button>
          </div>

          {/* MESSAGES */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12, background: '#F8F9F6' }}>
            {messages.map((m) => {
              const isModel = m.role === 'model';
              const { cleanText, formType } = parseMessage(m.text);
              return (
                <div
                  key={m.id}
                  style={{
                    alignSelf: isModel ? 'flex-start' : 'flex-end',
                    maxWidth: '85%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isModel ? 'flex-start' : 'flex-end',
                  }}
                >
                  {isModel && (
                    <div style={{ font: "500 9px 'Spline Sans Mono'", color: 'var(--ink-faint)', textTransform: 'uppercase', marginBottom: 2, letterSpacing: '0.05em' }}>
                      Stride AI
                    </div>
                  )}
                  <div
                    style={{
                      background: isModel ? '#fff' : 'var(--ink)',
                      color: isModel ? 'var(--ink)' : '#fff',
                      padding: '10px 14px',
                      borderRadius: isModel ? '14px 14px 14px 4px' : '14px 14px 4px 14px',
                      font: isModel ? "400 13.5px/1.45 'Newsreader'" : "400 13px/1.45 'Spline Sans'",
                      boxShadow: isModel ? '0 1px 2px rgba(30,37,34,0.02)' : 'none',
                      border: isModel ? '1px solid rgba(30,37,34,0.04)' : 'none',
                      whiteSpace: 'pre-line',
                      width: '100%',
                    }}
                  >
                    {cleanText}
                    {isModel && formType && (
                      <InteractiveForm
                        type={formType}
                        onSubmit={(submittedPrompt) => {
                          const userMsg: Message = {
                            id: `msg_${Date.now()}_u`,
                            role: 'user',
                            text: `Submitted Form Details:\n${submittedPrompt}`,
                          };
                          setMessages((prev) => [...prev, userMsg]);
                          sendPrompt(submittedPrompt);
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
            {loading && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ font: "500 9px 'Spline Sans Mono'", color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Stride AI
                </div>
                <div
                  style={{
                    background: '#fff',
                    padding: '10px 16px',
                    borderRadius: '14px 14px 14px 4px',
                    border: '1px solid rgba(30,37,34,0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span className="dot" style={{ width: 5, height: 5, borderRadius: '50%', background: '#7B827D', display: 'inline-block', animation: 'pulse 1.2s infinite ease-in-out' }} />
                  <span className="dot" style={{ width: 5, height: 5, borderRadius: '50%', background: '#7B827D', display: 'inline-block', animation: 'pulse 1.2s infinite ease-in-out 0.2s' }} />
                  <span className="dot" style={{ width: 5, height: 5, borderRadius: '50%', background: '#7B827D', display: 'inline-block', animation: 'pulse 1.2s infinite ease-in-out 0.4s' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* MULTILINE INPUT AREA */}
          <div style={{ padding: '12px 16px 16px', background: '#fff', borderTop: '1px solid rgba(30,37,34,0.06)' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={loading ? "Planning..." : "Ask Stride AI to model a goal..."}
                disabled={loading}
                rows={2}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: '1px solid rgba(30,37,34,0.12)',
                  borderRadius: 10,
                  font: "400 13px/1.4 'Spline Sans'",
                  color: 'var(--ink)',
                  outline: 'none',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.01)',
                  background: loading ? '#F4F5F2' : '#fff',
                  resize: 'none',
                  minHeight: 52,
                  maxHeight: 120,
                }}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                style={{
                  padding: '12px 16px',
                  background: 'var(--ink)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  font: "600 13px 'Spline Sans'",
                  cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                  opacity: loading || !input.trim() ? 0.6 : 1,
                  transition: 'all 0.2s',
                  height: 42,
                }}
              >
                Send
              </button>
            </div>
            <div style={{ font: "400 10px 'Spline Sans'", color: 'var(--ink-faint)', marginTop: 6, textAlign: 'center' }}>
              Press Enter to Send · Shift+Enter for new line
            </div>
          </div>
        </div>
      )}

      {/* ANIMATION KEYFRAMES */}
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(0.6); opacity: 0.4; }
          50% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </>
  );
}

/* INTERACTIVE INPUT FORM SUB-COMPONENT */
interface InteractiveFormProps {
  type: 'sabbatical' | 'car' | 'house' | 'simple';
  onSubmit: (submittedPrompt: string) => void;
}

function InteractiveForm({ type, onSubmit }: InteractiveFormProps) {
  const stride = useStride();
  
  // Sabbatical States
  const [sabName, setSabName] = useState('My Sabbatical');
  const [sabDuration, setSabDuration] = useState('3');
  const [sabSpend, setSabSpend] = useState('3000');
  const [sabHealthcare, setSabHealthcare] = useState('200');
  const [sabPauseKey, setSabPauseKey] = useState('none');
  const [sabStart, setSabStart] = useState('12');

  // Car States
  const [carName, setCarName] = useState('New Car');
  const [carPrice, setCarPrice] = useState('15000');
  const [carDown, setCarDown] = useState('3000');
  const [carStart, setCarStart] = useState('12');

  // House States
  const [houseName, setHouseName] = useState('First House');
  const [housePrice, setHousePrice] = useState('350000');
  const [houseDown, setHouseDown] = useState('70000');
  const [houseStart, setHouseStart] = useState('24');

  // Simple States
  const [simName, setSimName] = useState('Savings Goal');
  const [simAmount, setSimAmount] = useState('5000');
  const [simStart, setSimStart] = useState('12');

  const activeIncomes = stride.incomeStreams.filter(inc => inc.active !== false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'sabbatical') {
      onSubmit(
        `add a sabbatical milestone named "${sabName}" for ${sabDuration} months starting at month ${sabStart} with monthly travel spend of $${sabSpend}, monthly healthcare cost of $${sabHealthcare}, and pause income key "${sabPauseKey}"`
      );
    } else if (type === 'car') {
      onSubmit(
        `add a car milestone named "${carName}" at month ${carStart} with price of $${carPrice} and down payment of $${carDown}`
      );
    } else if (type === 'house') {
      onSubmit(
        `add a house milestone named "${houseName}" at month ${houseStart} with price of $${housePrice} and down payment of $${houseDown}`
      );
    } else if (type === 'simple') {
      onSubmit(
        `add a simple milestone named "${simName}" at month ${simStart} with target amount of $${simAmount}`
      );
    }
  };

  const labelStyle: React.CSSProperties = {
    font: "600 11px 'Spline Sans'",
    color: '#4B524E',
    marginBottom: 4,
    display: 'block',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '7px 9px',
    border: '1.5px solid rgba(30,37,34,0.1)',
    borderRadius: 8,
    font: "400 12.5px 'Spline Sans'",
    color: 'var(--ink)',
    outline: 'none',
    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.01)',
    background: '#fff',
    marginBottom: 10,
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        marginTop: 10,
        background: '#F4F5F2',
        borderRadius: 12,
        padding: '12px 14px',
        border: '1px solid rgba(30,37,34,0.08)',
        color: 'var(--ink)',
      }}
    >
      <div style={{ font: "600 12px 'Spline Sans'", color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>
        Interactive milestone Form
      </div>

      {type === 'sabbatical' && (
        <>
          <label style={labelStyle}>Sabbatical Name</label>
          <input type="text" value={sabName} onChange={e => setSabName(e.target.value)} style={inputStyle} required />

          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Duration (months)</label>
              <input type="number" value={sabDuration} onChange={e => setSabDuration(e.target.value)} style={inputStyle} min={1} required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Start Month</label>
              <input type="number" value={sabStart} onChange={e => setSabStart(e.target.value)} style={inputStyle} min={0} required />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Monthly Travel Spend</label>
              <input type="number" value={sabSpend} onChange={e => setSabSpend(e.target.value)} style={inputStyle} min={0} required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Monthly Healthcare</label>
              <input type="number" value={sabHealthcare} onChange={e => setSabHealthcare(e.target.value)} style={inputStyle} min={0} required />
            </div>
          </div>

          <label style={labelStyle}>Income Stream to Pause</label>
          <select value={sabPauseKey} onChange={e => setSabPauseKey(e.target.value)} style={inputStyle}>
            <option value="none">Don't pause any income</option>
            {activeIncomes.map(inc => (
              <option key={inc.key} value={inc.key}>
                {inc.name} (${inc.amount}/mo)
              </option>
            ))}
          </select>
        </>
      )}

      {type === 'car' && (
        <>
          <label style={labelStyle}>Car Name</label>
          <input type="text" value={carName} onChange={e => setCarName(e.target.value)} style={inputStyle} required />

          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Purchase Month</label>
              <input type="number" value={carStart} onChange={e => setCarStart(e.target.value)} style={inputStyle} min={0} required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Car Price ($)</label>
              <input type="number" value={carPrice} onChange={e => setCarPrice(e.target.value)} style={inputStyle} min={0} required />
            </div>
          </div>

          <label style={labelStyle}>Down Payment ($)</label>
          <input type="number" value={carDown} onChange={e => setCarDown(e.target.value)} style={inputStyle} min={0} required />
        </>
      )}

      {type === 'house' && (
        <>
          <label style={labelStyle}>House Name</label>
          <input type="text" value={houseName} onChange={e => setHouseName(e.target.value)} style={inputStyle} required />

          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Purchase Month</label>
              <input type="number" value={houseStart} onChange={e => setHouseStart(e.target.value)} style={inputStyle} min={0} required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>House Price ($)</label>
              <input type="number" value={housePrice} onChange={e => setHousePrice(e.target.value)} style={inputStyle} min={0} required />
            </div>
          </div>

          <label style={labelStyle}>Down Payment ($)</label>
          <input type="number" value={houseDown} onChange={e => setHouseDown(e.target.value)} style={inputStyle} min={0} required />
        </>
      )}

      {type === 'simple' && (
        <>
          <label style={labelStyle}>Milestone Name</label>
          <input type="text" value={simName} onChange={e => setSimName(e.target.value)} style={inputStyle} required />

          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Target Month</label>
              <input type="number" value={simStart} onChange={e => setSimStart(e.target.value)} style={inputStyle} min={0} required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Target Amount ($)</label>
              <input type="number" value={simAmount} onChange={e => setSimAmount(e.target.value)} style={inputStyle} min={0} required />
            </div>
          </div>
        </>
      )}

      <button
        type="submit"
        style={{
          width: '100%',
          padding: '9px',
          background: 'var(--ink)',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          font: "600 12.5px 'Spline Sans'",
          cursor: 'pointer',
          marginTop: 4,
          transition: 'opacity 0.2s',
        }}
      >
        Submit Parameters
      </button>
    </form>
  );
}
