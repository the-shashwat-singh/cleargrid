import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function CostOfChaos() {
  const containerRef = useRef(null);
  const countersRef = useRef([]);
  const cardsRef = useRef([]);

  useGSAP(() => {
    // Number counting animations
    gsap.fromTo(countersRef.current[0], { innerHTML: 0 }, {
      innerHTML: 243,
      duration: 2,
      scrollTrigger: {
        trigger: countersRef.current[0],
        start: 'top 85%',
      },
      snap: { innerHTML: 1 }
    });

    gsap.fromTo(countersRef.current[1], { innerHTML: 0 }, {
      innerHTML: 1.5,
      duration: 2,
      scrollTrigger: {
        trigger: countersRef.current[1],
        start: 'top 85%',
      },
      snap: { innerHTML: 0.1 }
    });

    // Flash the 0 in red
    gsap.to(countersRef.current[2], {
      color: 'var(--accent-red)',
      duration: 0.5,
      repeat: 3,
      yoyo: true,
      scrollTrigger: {
        trigger: countersRef.current[2],
        start: 'top 85%',
      }
    });

    // Cards staggered reveal
    gsap.fromTo(cardsRef.current, { y: 40, opacity: 0 }, {
      y: 0,
      opacity: 1,
      stagger: 0.15,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: cardsRef.current[0],
        start: 'top 90%',
      }
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} style={{ padding: '20px 0' }}>
      <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, color: 'var(--accent-red)', letterSpacing: '2px', fontSize: '14px', marginBottom: '24px', textTransform: 'uppercase' }}>
        The Cost of Chaos
      </div>
      
      <h2 className="syne" style={{ fontSize: '56px', lineHeight: 1.1, marginBottom: '64px', maxWidth: '800px' }}>
        One badly parked car.<br/>
        500 metres of congestion.<br/>
        Zero warning.
      </h2>

      {/* Counters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px', marginBottom: '80px' }}>
        <div>
          <div className="mono" style={{ fontSize: '56px', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 500 }}>
            <span ref={el => countersRef.current[0] = el}>0</span>
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '18px', lineHeight: 1.4 }}>
            hours/year lost<br/>to congestion
          </div>
        </div>
        <div>
          <div className="mono" style={{ fontSize: '56px', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 500 }}>
            ₹<span ref={el => countersRef.current[1] = el}>0</span>L Cr
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '18px', lineHeight: 1.4 }}>
            annual economic loss<br/>to Bengaluru traffic
          </div>
        </div>
        <div>
          <div className="mono" style={{ fontSize: '56px', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 500 }}>
            <span ref={el => countersRef.current[2] = el}>0</span>
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '18px', lineHeight: 1.4 }}>
            predictive systems exist<br/>in the city today
          </div>
        </div>
      </div>

      {/* 3 Problem Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        {[
          { icon: '👁️', title: 'Enforcement is Blind', text: "Patrol-based enforcement only finds violations after they've already created congestion. By the time a cop responds, the damage is done." },
          { icon: '⚖️', title: 'Not All Violations Are Equal', text: "A bike on a footpath vs a truck at a junction. Current systems treat them identically. Congestion impact varies by 47x." },
          { icon: '🔥', title: 'No One Predicts', text: "No system exists today that tells an officer where to be before a violation hotspot forms. ClearGrid changes that." }
        ].map((card, i) => (
          <div 
            key={i}
            ref={el => cardsRef.current[i] = el}
            style={{ 
              background: 'rgba(255, 255, 255, 0.4)',
              padding: '32px', 
              borderRadius: 'var(--radius-lg)', 
              border: '1px solid rgba(255, 255, 255, 0.5)',
              borderTop: '2px solid rgba(240, 78, 78, 0.4)', 
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)' 
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '20px' }}>{card.icon}</div>
            <h3 className="grotesk" style={{ fontSize: '20px', marginBottom: '12px' }}>{card.title}</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{card.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
