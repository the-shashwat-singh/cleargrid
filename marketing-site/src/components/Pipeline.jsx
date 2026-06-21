import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollerContext } from '../pages/MarketingPage';

export default function Pipeline() {
  const containerRef = useRef(null);
  const scroller = React.useContext(ScrollerContext);

  useGSAP(() => {
    // Animate the connection lines drawing
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        scroller: scroller,
        start: 'top 80%',
      }
    });

    // Main container fade in
    tl.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 });
    
    // Nodes staggering
    const nodes = gsap.utils.toArray('.pipeline-node');
    tl.fromTo(nodes, { y: 30, opacity: 0, scale: 0.9 }, {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 0.8,
      stagger: 0.2,
      ease: 'back.out(1.2)',
    }, '-=0.2');

    // Lines expanding
    const lines = gsap.utils.toArray('.pipeline-line');
    tl.fromTo(lines, { scaleX: 0 }, {
      scaleX: 1,
      duration: 0.6,
      stagger: 0.2,
      ease: 'power2.inOut',
    }, '-=1'); // Overlap with nodes
  }, { scope: containerRef, dependencies: [scroller] });

  const Node = ({ title, subtitle, items }) => (
    <div className="pipeline-node" style={{
      background: 'rgba(255,255,255,0.6)',
      border: '1px solid rgba(255,255,255,0.8)',
      padding: '24px',
      borderRadius: 'var(--radius-xl)',
      flex: 1,
      boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
      zIndex: 2,
      position: 'relative'
    }}>
      <div className="mono" style={{ color: 'var(--accent-blue)', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>{subtitle}</div>
      <h3 className="grotesk" style={{ fontSize: '20px', marginBottom: '16px' }}>{title}</h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.8 }}>
        {items.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    </div>
  );

  const Arrow = () => (
    <div className="pipeline-arrow" style={{ 
      flex: 0.3, 
      height: '2px', 
      background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-green))',
      position: 'relative',
      marginTop: '60px'
    }}>
      <div style={{
        position: 'absolute',
        right: '-4px',
        top: '-4px',
        width: '10px',
        height: '10px',
        borderTop: '2px solid var(--accent-green)',
        borderRight: '2px solid var(--accent-green)',
        transform: 'rotate(45deg)'
      }}></div>
    </div>
  );

  return (
    <div ref={containerRef} style={{ padding: '80px 0' }}>
      <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, color: 'var(--accent-blue)', letterSpacing: '2px', fontSize: '14px', marginBottom: '24px', textTransform: 'uppercase', textAlign: 'center' }}>
        The Pipeline
      </div>
      
      <h2 className="syne" style={{ fontSize: '48px', textAlign: 'center', marginBottom: '80px' }}>
        One dataset. Five layers of AI.
      </h2>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '80px' }}>
        <Node 
          title="Raw Data" 
          subtitle="[ INPUT ]" 
          items={["298K violations", "Historical logs", "Timestamps", "Geocodes"]} 
        />
        <Arrow />
        <Node 
          title="Detect" 
          subtitle="[ LAYER 1 ]" 
          items={["Vehicle archetypes", "Hotspot clusters", "Enforcement gaps"]} 
        />
        <Arrow />
        <Node 
          title="Score" 
          subtitle="[ LAYER 2 ]" 
          items={["Chokepoint × Dwell", "Impact per zone", "Cascade probability"]} 
        />
        <Arrow />
        <Node 
          title="Predict" 
          subtitle="[ LAYER 3 ]" 
          items={["Time-series per zone", "Emerging hotspot alert", "Cascade seed detection"]} 
        />
        <Arrow />
        <Node 
          title="Dispatch" 
          subtitle="[ LAYER 4 ]" 
          items={["VRP patrol scheduler", "Perishable alert score", "Optimal routing"]} 
        />
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: '20px', textAlign: 'center', maxWidth: '800px', margin: '0 auto', fontStyle: 'italic', lineHeight: 1.6 }}>
        "Every layer uses only what was given — the 298,000-row violation dataset and the MapMyIndia API. No additional sensors. No extra hardware. Just the data Bengaluru already has."
      </p>
    </div>
  );
}
