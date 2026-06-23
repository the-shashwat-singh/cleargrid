import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ScrollerContext } from '../pages/MarketingPage';

gsap.registerPlugin(ScrollTrigger);

export default function SectionWrapper({ children, cardStyle, containerStyle }) {
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const scroller = React.useContext(ScrollerContext);

  useGSAP(() => {
    if (!cardRef.current || !containerRef.current) return;

    // Apply perspective directly to the transform property via GSAP
    gsap.set(cardRef.current, { transformPerspective: 1200 });

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return; // Skip animation if reduced motion is requested

    gsap.to(cardRef.current, {
      scrollTrigger: {
        trigger: containerRef.current,
        scroller: scroller,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
      rotateX: -20,
      scale: 0.95,
      y: -50,
      ease: 'none',
      transformOrigin: 'top center',
    });
  }, { scope: containerRef, dependencies: [scroller] });

  return (
    <section 
      ref={containerRef} 
      style={{ 
        width: '100%', 
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        padding: '120px 40px 40px 40px',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 1,
        ...containerStyle
      }}
    >
      <div 
        ref={cardRef} 
        className="glass-panel"
        style={{ 
          width: '100%',
          maxWidth: '1400px',
          ...cardStyle
        }}
      >
        {children}
      </div>
    </section>
  );
}
