import React from 'react';
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

export default function MarketingPage() {
  return (
    <div style={{ position: 'relative', overflowX: 'hidden' }}>
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
        zIndex: 100
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
          <a href="#features" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 500 }}>Features</a>
          <a href="#how-it-works" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 500 }}>How It Works</a>
          <a href="#for-officers" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 500 }}>For Officers</a>
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

      <div>
        <SectionWrapper 
          containerStyle={{ paddingTop: '110px', paddingBottom: '30px', minHeight: '100vh' }}
          cardStyle={{ minHeight: '85vh', maxHeight: '88vh' }}
        >
          <Hero />
        </SectionWrapper>
        
        <div style={{ marginTop: '100px' }}>
          <SectionWrapper cardStyle={{ minHeight: '80vh', padding: '64px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <CostOfChaos />
          </SectionWrapper>
        </div>

        <section id="features" className="snap-section" style={{ padding: '120px 40px', maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <IntelligenceLayers />
        </section>

        <div id="for-officers">
          <SectionWrapper cardStyle={{ minHeight: '80vh', padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <DualAudience />
          </SectionWrapper>
        </div>

        <div id="how-it-works">
          <SectionWrapper cardStyle={{ minHeight: '80vh', padding: '64px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Pipeline />
          </SectionWrapper>
        </div>

        <SectionWrapper cardStyle={{ minHeight: '80vh', padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <DashboardPreview />
        </SectionWrapper>

        <SectionWrapper cardStyle={{ minHeight: '100vh', padding: '0', background: 'transparent', border: 'none', boxShadow: 'none' }}>
          <ClosingCTA />
        </SectionWrapper>
      </div>
    </div>
  );
}
