import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

export default function SectionWrapper({ children, cardStyle, containerStyle }) {
  const containerRef = useRef(null);
  const cardRef = useRef(null);

  useGSAP(() => {
    // Apply perspective directly to the transform property via GSAP,
    // rather than putting CSS perspective on the parent container.
    gsap.set(cardRef.current, { transformPerspective: 1200 });

    gsap.to(cardRef.current, {
      scrollTrigger: {
        trigger: containerRef.current,
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
  }, { scope: containerRef });

  return (
    <section 
      ref={containerRef} 
      className="snap-section"
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
