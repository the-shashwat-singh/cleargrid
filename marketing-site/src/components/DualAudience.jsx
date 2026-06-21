import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function DualAudience() {
  const containerRef = useRef(null);

  useGSAP(() => {
    gsap.fromTo('.audience-panel', { y: 40, opacity: 0 }, {
      y: 0,
      opacity: 1,
      stagger: 0.2,
      duration: 1,
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
      }
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} style={{ padding: '0' }}>
      <h2 className="syne" style={{ fontSize: '42px', textAlign: 'center', marginBottom: '40px' }}>
        Built for Two. Useful for Everyone.
      </h2>

      <div style={{ display: 'flex', gap: '40px', position: 'relative' }}>
        {/* Center Glowing Divider */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '0',
          bottom: '0',
          width: '2px',
          background: 'linear-gradient(180deg, rgba(79, 140, 247, 0), rgba(79, 140, 247, 0.8), rgba(16, 212, 142, 0.8), rgba(16, 212, 142, 0))',
          transform: 'translateX(-50%)',
          boxShadow: '0 0 20px rgba(79, 140, 247, 0.4)'
        }}></div>

        {/* Left: Officers */}
        <div className="audience-panel" style={{ 
          flex: 1, 
          background: 'linear-gradient(135deg, rgba(255,255,255,0.7), rgba(79,140,247,0.05))',
          padding: '32px',
          borderRadius: 'var(--radius-2xl)',
          border: '1px solid rgba(255,255,255,0.8)',
          boxShadow: '0 8px 32px rgba(79, 140, 247, 0.05)'
        }}>
          <div style={{ color: 'var(--accent-blue)', fontWeight: 600, letterSpacing: '2px', marginBottom: '16px', fontSize: '14px' }}>
            ENFORCEMENT OFFICER
          </div>
          <div style={{ height: '2px', width: '40px', background: 'var(--accent-blue)', marginBottom: '24px' }}></div>
          
          <h3 className="syne" style={{ fontSize: '24px', marginBottom: '24px', lineHeight: 1.3 }}>
            "I used to drive to a violation and find an empty spot half the time."
          </h3>

          <p style={{ fontWeight: 600, marginBottom: '12px', fontSize: '14px' }}>Now with ClearGrid:</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '14px' }}>
            <li style={{ marginBottom: '8px' }}><span style={{ color: 'var(--accent-blue)', marginRight: '8px' }}>✓</span> Know if the vehicle will still be there before you go</li>
            <li style={{ marginBottom: '8px' }}><span style={{ color: 'var(--accent-blue)', marginRight: '8px' }}>✓</span> Get ranked dispatch list by shift, not gut feeling</li>
            <li style={{ marginBottom: '8px' }}><span style={{ color: 'var(--accent-blue)', marginRight: '8px' }}>✓</span> See cascade alerts before the crowd forms</li>
            <li style={{ marginBottom: '8px' }}><span style={{ color: 'var(--accent-blue)', marginRight: '8px' }}>✓</span> Optimal patrol route calculated automatically</li>
            <li style={{ marginBottom: '8px' }}><span style={{ color: 'var(--accent-blue)', marginRight: '8px' }}>✓</span> Enforcement blind spots highlighted for your zone</li>
          </ul>

          <div style={{ marginTop: '24px', fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '14px' }}>
            "My first two hours of the shift now clear 3x as many violations as before."<br/>
            — Hypothetical Officer Quote
          </div>
        </div>

        {/* Right: Commuters */}
        <div className="audience-panel" style={{ 
          flex: 1, 
          background: 'linear-gradient(135deg, rgba(255,255,255,0.7), rgba(16,212,142,0.05))',
          padding: '32px',
          borderRadius: 'var(--radius-2xl)',
          border: '1px solid rgba(255,255,255,0.8)',
          boxShadow: '0 8px 32px rgba(16, 212, 142, 0.05)'
        }}>
          <div style={{ color: 'var(--accent-green)', fontWeight: 600, letterSpacing: '2px', marginBottom: '16px', fontSize: '14px' }}>
            DAILY COMMUTER
          </div>
          <div style={{ height: '2px', width: '40px', background: 'var(--accent-green)', marginBottom: '24px' }}></div>
          
          <h3 className="syne" style={{ fontSize: '24px', marginBottom: '24px', lineHeight: 1.3 }}>
            "I never know when Silk Board will be a nightmare because of one truck."
          </h3>

          <p style={{ fontWeight: 600, marginBottom: '12px', fontSize: '14px' }}>Now with ClearGrid:</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '14px' }}>
            <li style={{ marginBottom: '8px' }}><span style={{ color: 'var(--accent-green)', marginRight: '8px' }}>✓</span> Route risk score before you leave home</li>
            <li style={{ marginBottom: '8px' }}><span style={{ color: 'var(--accent-green)', marginRight: '8px' }}>✓</span> Parking-induced congestion warnings</li>
            <li style={{ marginBottom: '8px' }}><span style={{ color: 'var(--accent-green)', marginRight: '8px' }}>✓</span> Know which roads are structurally choke-prone</li>
            <li style={{ marginBottom: '8px' }}><span style={{ color: 'var(--accent-green)', marginRight: '8px' }}>✓</span> Real-time alternate route if violations spike</li>
          </ul>

          <div style={{ marginTop: '24px', fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '14px' }}>
            "Finally something that explains why my Tuesday commute is always worse than Monday."<br/>
            — Everyday Driver
          </div>
        </div>
      </div>
    </div>
  );
}
