import { useState, useRef, useEffect, useCallback } from 'react';

const FIRST_MESSAGE = "Hey. I'm here whenever you want to talk. No agenda, no pressure. Just say whatever's on your mind — or don't. Either way, I'm not going anywhere.";

const STORAGE_KEY = 'zan-companion-messages';

function loadMessages() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [{ role: 'assistant', content: FIRST_MESSAGE }];
}

function saveMessages(messages) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {}
}

export default function App() {
  const [messages, setMessages] = useState(loadMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const messagesRef = useRef(null);
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef(null);

  // Persist messages
  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  // Online/offline detection
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Auto-resize textarea
  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 140) + 'px';
  }, []);

  useEffect(() => {
    resizeTextarea();
  }, [input, resizeTextarea]);

  // Send message
  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setError(null);
    setInput('');

    const userMessage = { role: 'user', content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Something went wrong');
      }

      const data = await res.json();
      const assistantMessage = { role: 'assistant', content: data.response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError(
        err.message === 'Failed to fetch'
          ? "Can't reach the server right now. Try again in a bit."
          : err.message || 'Something went wrong. Try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);

  // Handle keyboard
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  // Triple-tap status dot to start new conversation (hidden feature)
  const handleStatusTap = useCallback(() => {
    tapCountRef.current += 1;
    clearTimeout(tapTimerRef.current);
    if (tapCountRef.current >= 3) {
      tapCountRef.current = 0;
      if (window.confirm('Start a new conversation?')) {
        const fresh = [{ role: 'assistant', content: FIRST_MESSAGE }];
        setMessages(fresh);
        setError(null);
      }
    } else {
      tapTimerRef.current = setTimeout(() => {
        tapCountRef.current = 0;
      }, 600);
    }
  }, []);

  // Render message content with paragraph breaks
  const renderContent = (content) => {
    const paragraphs = content.split('\n\n');
    if (paragraphs.length === 1) {
      return content.split('\n').map((line, i) => (
        <span key={i}>
          {line}
          {i < content.split('\n').length - 1 && <br />}
        </span>
      ));
    }
    return paragraphs.map((p, i) => <p key={i}>{p}</p>);
  };

  return (
    <div className="app">
      {/* Header */}
      <div className="header" onClick={handleStatusTap}>
        <div className={`status-dot ${isOnline ? '' : 'offline'}`} />
        <span className="status-text">
          {isOnline ? 'connected' : 'offline'}
        </span>
      </div>

      {/* Offline banner */}
      {!isOnline && (
        <div className="offline-banner">
          No connection right now. Your messages are saved.
        </div>
      )}

      {/* Messages */}
      <div className="messages" ref={messagesRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            {renderContent(msg.content)}
          </div>
        ))}

        {isLoading && (
          <div className="message assistant">
            <div className="typing">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          </div>
        )}

        {error && (
          <div className="error-msg" onClick={() => setError(null)}>
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="input-area">
        <div className="input-wrapper">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Say what's on your mind..."
            rows={1}
            disabled={isLoading}
          />
        </div>
        <button
          className="send-btn"
          onClick={sendMessage}
          disabled={!input.trim() || isLoading}
          aria-label="Send"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="19" x2="12" y2="5" />
            <polyline points="5 12 12 5 19 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
