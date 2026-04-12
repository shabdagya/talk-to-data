import React, { useState, useRef, useEffect } from 'react';
import AnswerCard from './AnswerCard';
import './ChatWindow.css';

export default function ChatWindow({ chatHistory, onNewMessage, onSummarize }) {
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const isLoading = chatHistory.some(m => m.loading);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onNewMessage(input);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="cw-container">
      <div className="cw-messages">
        {chatHistory.length === 0 ? (
          <div className="cw-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="cw-empty-icon">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <h2>Ask a question about your data</h2>
            <p>Try: 'What is revenue by region?' or 'Show me monthly trends'</p>
            <button className="cw-summarize-btn" onClick={onSummarize} disabled={isLoading}>
              ✨ Generate Executive Summary
            </button>
          </div>
        ) : (
          <div className="cw-history">
            {chatHistory.map(msg => (
              <AnswerCard key={msg.id} {...msg} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
      
      <div className="cw-input-area">
        <form className="cw-form" onSubmit={handleSubmit}>
          <textarea
            className="cw-textarea"
            placeholder="Ask a question about your data..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={1}
          />
          <button type="submit" className="cw-send-btn" disabled={!input.trim() || isLoading}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
