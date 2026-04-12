import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import './AnswerCard.css';

export default function AnswerCard({
  question, answer, confidence, confidence_label, key_insight, data_note,
  sql_used, sql_explanation, results, loading, error
}) {
  const [sqlOpen, setSqlOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasDataForChart = results && results.length >= 2;
  let chartDataKeyX = null;
  let chartDataKeyY = null;

  if (hasDataForChart) {
    const keys = Object.keys(results[0]);
    for (let k of keys) {
      if (typeof results[0][k] === 'string' && !chartDataKeyX) chartDataKeyX = k;
      if (typeof results[0][k] === 'number' && !chartDataKeyY) chartDataKeyY = k;
    }
  }
  const showChart = hasDataForChart && chartDataKeyX && chartDataKeyY;

  return (
    <div className="ac-wrapper">
      <div className="ac-user-bubble">
        {question}
      </div>

      {loading && (
        <div className="ac-ai-card">
          <div className="ac-skeleton">
            <div className="ac-skel-bar w-3/4"></div>
            <div className="ac-skel-bar w-full"></div>
            <div className="ac-skel-bar w-5/6"></div>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="ac-ai-card ac-error-card">
          <div className="ac-error-title">⚠ Could not answer this question</div>
          <div className="ac-error-message">{error}</div>
        </div>
      )}

      {!loading && !error && (
        <div className="ac-ai-card">
          <div className="ac-header">
            <div className="ac-brand">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                 <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-1v4h2v2h-4v-2h2V8h-1a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"></path>
                 <rect x="4" y="14" width="16" height="8" rx="2" ry="2"></rect>
              </svg>
              Talk to Data
            </div>
            <div className={`ac-badge ac-badge-${(confidence_label || '').toLowerCase()}`}>
              ● {confidence_label} confidence
            </div>
          </div>

          <div className="ac-answer">{answer}</div>
          
          {key_insight && <div className="ac-insight">{key_insight}</div>}
          {data_note && <div className="ac-note">{data_note}</div>}

          {showChart && (
            <div className="ac-chart-container">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={results} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey={chartDataKeyX} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => val.toLocaleString()} />
                  <Tooltip cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey={chartDataKeyY} fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {sql_used && (
            <div className="ac-sql-section">
              <button className="ac-sql-toggle" onClick={() => setSqlOpen(!sqlOpen)}>
                {sqlOpen ? 'Hide SQL ▲' : 'View SQL ▼'}
              </button>
              <div className={`ac-sql-content ${sqlOpen ? 'open' : ''}`}>
                <pre>{sql_used}</pre>
                {sql_explanation && <div className="ac-sql-explanation">{sql_explanation}</div>}
              </div>
            </div>
          )}

          <button className="ac-copy" onClick={handleCopy}>
            {copied ? '✓ Copied' : 'Copy answer'}
          </button>
        </div>
      )}
    </div>
  );
}
