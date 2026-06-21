import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function ClosingCTA() {
  const containerRef = useRef(null);

  useGSAP(() => {
    // Add any specific animations for closing CTA if needed
  }, { scope: containerRef });

  return (
    <div ref={containerRef} style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center',
      padding: '40px'
    }}>
      <h2 className="syne" style={{ fontSize: '72px', textAlign: 'center', lineHeight: 1.1, marginBottom: '32px' }}>
        Bengaluru<br/>
        doesn't need more<br/>
        red lights.<br/>
        It needs<br/>
        <span style={{ 
          background: 'linear-gradient(90deg, #F04E4E, #10D48E)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundSize: '200% auto',
          animation: 'shimmer 3s linear infinite'
        }}>
          green ones.
        </span>
      </h2>

      <style>{`
        @keyframes shimmer {
          to { background-position: 200% center; }
        }
      `}</style>

      <p style={{ color: 'var(--text-secondary)', fontSize: '20px', textAlign: 'center', maxWidth: '600px', marginBottom: '64px', lineHeight: 1.6 }}>
        Built for Bengaluru. Designed for every city.<br/>
        Powered by 298,000 data points and one idea:<br/>
        what if enforcement was intelligent?
      </p>

      <div style={{ display: 'flex', gap: '24px', marginBottom: '120px' }}>
        <a href="/dashboard" style={{
          background: 'rgba(255, 255, 255, 0.9)',
          border: 'none',
          color: '#060C1A',
          padding: '16px 32px',
          borderRadius: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          fontSize: '16px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          textDecoration: 'none',
          display: 'inline-block'
        }}>
          🏆 View Prototype
        </a>
      </div>

      <div style={{ 
        textAlign: 'center', 
        color: 'var(--text-muted)', 
        fontSize: '14px', 
        lineHeight: 1.6,
        paddingTop: '40px',
        borderTop: '1px solid rgba(0,0,0,0.05)',
        width: '100%',
        maxWidth: '800px'
      }}>
        ClearGrid — From Gridlock to Greenlight<br/>
        Built for Flipkart Gridlock Hackathon 2.0 — Prototype Phase<br/>
        MapMyIndia API | HackerEarth Dataset | React + AI
      </div>
    </div>
  );
}
