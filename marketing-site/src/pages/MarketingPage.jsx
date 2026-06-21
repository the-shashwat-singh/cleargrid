import React, { useRef, useEffect, useState, createContext } from 'react';
import { Link } from 'react-router-dom';
import SectionWrapper from '../components/SectionWrapper';
import Hero from '../components/Hero';
import HorizonSVG from '../components/HorizonSVG';
import CostOfChaos from '../components/CostOfChaos';
import IntelligenceLayers from '../components/IntelligenceLayers';
import DualAudience from '../components/DualAudience';
import Pipeline from '../components/Pipeline';
import DashboardPreview from '../components/DashboardPreview';
import ClosingCTA from '../components/ClosingCTA';

export const ScrollerContext = createContext(null);

export default function MarketingPage() {
  const snapContainerRef = useRef(null);
  const [isMounted, setIsMounted] = React.useState(false);
  const [scroller, setScroller] = useState(null);

  useEffect(() => {
    setIsMounted(true);
    const handleKeyDown = (e) => {
      const container = snapContainerRef.current;
      if (!container) return;
      
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const behavior = prefersReducedMotion ? 'auto' : 'smooth';

      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        container.scrollBy({ top: container.clientHeight, behavior });
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        container.scrollBy({ top: -container.clientHeight, behavior });
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    const container = snapContainerRef.current;
    const target = document.getElementById(targetId);
    if (container && target) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const behavior = prefersReducedMotion ? 'auto' : 'smooth';
      const containerTop = container.getBoundingClientRect().top;
      const targetTop = target.getBoundingClientRect().top;
      container.scrollBy({ top: targetTop - containerTop, behavior });
    }
  };

  return (
    <div style={{ position: 'relative', overflowX: 'hidden', height: '100dvh', overflowY: 'hidden' }}>
      <HorizonSVG />
      
      {/* Shared Navbar */}
      <nav className="glass-panel" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 32px',
        borderRadius: '9999px',
        position: 'fixed',
        top: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 80px)',
        maxWidth: '1400px',
        zIndex: 100,
        background: 'var(--bg-primary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="pulse-ring-container" style={{ width: '20px', height: '20px' }}>
            <div className="pulse-ring blue" style={{ width: '24px', height: '24px' }}></div>
            <div className="pulse-node" style={{ background: 'var(--accent-blue)', width: '8px', height: '8px' }}></div>
          </div>
          <span className="grotesk" style={{ fontWeight: 700, fontSize: '20px', color: 'var(--text-primary)' }}>
            ClearGrid
          </span>
        </div>
        <div style={{ display: 'flex', gap: '32px', color: 'var(--text-secondary)' }}>
          <a href="#features" onClick={(e) => handleNavClick(e, 'features')} style={{ textDecoration: 'none', color: 'inherit', fontWeight: 500 }}>Features</a>
          <a href="#how-it-works" onClick={(e) => handleNavClick(e, 'how-it-works')} style={{ textDecoration: 'none', color: 'inherit', fontWeight: 500 }}>How It Works</a>
          <a href="#for-officers" onClick={(e) => handleNavClick(e, 'for-officers')} style={{ textDecoration: 'none', color: 'inherit', fontWeight: 500 }}>For Officers</a>
        </div>
        <a href="/dashboard" style={{
          background: 'transparent',
          border: '1px solid var(--accent-blue)',
          color: 'var(--accent-blue)',
          padding: '8px 20px',
          borderRadius: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          textDecoration: 'none'
        }}>
          View Demo &rarr;
        </a>
      </nav>

      <ScrollerContext.Provider value={scroller}>
        <div 
          id="snap-container"
          ref={(node) => {
            snapContainerRef.current = node;
            if (node && !scroller) setScroller(node);
          }}
          style={{
            height: '100dvh',
            overflowY: 'scroll',
            overflowX: 'hidden',
            scrollSnapType: 'y mandatory',
            overscrollBehaviorY: 'none' // Prevent bounce on Mac/iOS
          }}
        >
          {scroller && (
            <>
              <div className="snap-section" style={{ minHeight: '100dvh', scrollSnapAlign: 'start', scrollSnapStop: 'always' }}>
                <SectionWrapper 
                  containerStyle={{ paddingTop: '110px', paddingBottom: '30px', minHeight: '100dvh' }}
                  cardStyle={{ minHeight: '85vh', maxHeight: '88vh' }}
                >
                  <Hero />
                </SectionWrapper>
              </div>
              
              <div className="snap-section" style={{ minHeight: '100dvh', scrollSnapAlign: 'start', scrollSnapStop: 'always', overflowY: 'auto' }}>
                <SectionWrapper cardStyle={{ minHeight: '80vh', padding: '64px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <CostOfChaos />
                </SectionWrapper>
              </div>

              {/* IntelligenceLayers now renders its own snap slides */}
              <IntelligenceLayers />

              <div id="for-officers" className="snap-section" style={{ minHeight: '100dvh', scrollSnapAlign: 'start', scrollSnapStop: 'always', overflowY: 'auto' }}>
                <SectionWrapper cardStyle={{ minHeight: '80vh', padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <DualAudience />
                </SectionWrapper>
              </div>

              <div id="how-it-works" className="snap-section" style={{ minHeight: '100dvh', scrollSnapAlign: 'start', scrollSnapStop: 'always', overflowY: 'auto' }}>
                <SectionWrapper cardStyle={{ minHeight: '80vh', padding: '64px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Pipeline />
                </SectionWrapper>
              </div>

              <div className="snap-section" style={{ minHeight: '100dvh', scrollSnapAlign: 'start', scrollSnapStop: 'always', overflowY: 'auto' }}>
                <SectionWrapper cardStyle={{ minHeight: '80vh', padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <DashboardPreview />
                </SectionWrapper>
              </div>

              <div className="snap-section" style={{ minHeight: '100dvh', scrollSnapAlign: 'start', scrollSnapStop: 'always', overflowY: 'auto' }}>
                <SectionWrapper cardStyle={{ minHeight: '100vh', padding: '0', background: 'transparent', border: 'none', boxShadow: 'none' }}>
                  <ClosingCTA />
                </SectionWrapper>
              </div>
            </>
          )}
        </div>
      </ScrollerContext.Provider>
    </div>
  );
}
