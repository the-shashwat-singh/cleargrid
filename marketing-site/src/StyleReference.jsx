import React from 'react';
import { ShieldAlert, Zap, Target, Search } from 'lucide-react';
import './index.css';

const StyleReference = () => {
  return (
    <div style={{ minHeight: '100vh', padding: '48px', position: 'relative' }}>
      
      {/* Navbar Reference */}
      <nav className="glass-panel" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 32px',
        borderRadius: '9999px',
        marginBottom: '64px',
        position: 'sticky',
        top: '24px',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="pulse-ring-container" style={{ width: '20px', height: '20px' }}>
            <div className="pulse-ring blue" style={{ borderColor: 'var(--accent-blue)', animationDelay: '0s', width: '24px', height: '24px' }}></div>
            <div className="pulse-node" style={{ background: 'var(--accent-blue)', width: '8px', height: '8px' }}></div>
          </div>
          <span className="grotesk" style={{ fontWeight: 700, fontSize: '20px', color: 'var(--text-primary)' }}>
            ClearGrid
          </span>
        </div>
        <div style={{ display: 'flex', gap: '32px', color: 'var(--text-secondary)' }}>
          <a href="#" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 500 }}>Features</a>
          <a href="#" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 500 }}>How It Works</a>
          <a href="#" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 500 }}>For Officers</a>
        </div>
        <button style={{
          background: 'transparent',
          border: '1px solid var(--accent-blue)',
          color: 'var(--accent-blue)',
          padding: '8px 20px',
          borderRadius: '12px',
          fontWeight: 600,
          cursor: 'pointer'
        }}>
          View Demo &rarr;
        </button>
      </nav>

      {/* Main Container */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Left Side: Typography & Pills */}
        <div>
          <span style={{
            display: 'inline-block',
            padding: '6px 16px',
            borderRadius: '9999px',
            background: 'rgba(10, 132, 255, 0.1)',
            color: 'var(--accent-blue)',
            fontWeight: 600,
            fontSize: '14px',
            marginBottom: '24px'
          }}>
            &#127961;&#65039; Prototype Showcase
          </span>
          
          <h1 className="syne" style={{ fontSize: '64px', lineHeight: '1.05', letterSpacing: '-0.03em', marginBottom: '24px' }}>
            The City Doesn't Need More Cops.
            <br />
            It Needs <span style={{ color: 'var(--accent-blue)' }}>Smarter</span> Ones.
          </h1>
          
          <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '520px', marginBottom: '48px' }}>
            ClearGrid uses 298,000 historical parking violations to predict illegal parking before it happens.
          </p>

          {/* Stat Pills Reference */}
          <div style={{ display: 'flex', gap: '24px' }}>
            <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255, 59, 48, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-red)' }}>
                <ShieldAlert size={24} />
              </div>
              <div>
                <div className="mono" style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)' }}>298,450</div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Violations Analyzed</div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(29, 184, 118, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-green)' }}>
                <Zap size={24} />
              </div>
              <div>
                <div className="mono" style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)' }}>&lt;8 min</div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Response Time</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Feature Card Reference */}
        <div style={{ paddingTop: '64px' }}>
          <div className="glass-panel" style={{ padding: '40px', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
              <h3 className="grotesk" style={{ fontSize: '24px', color: 'var(--text-primary)' }}>Perishable Alert Scoring</h3>
              <span className="mono" style={{ padding: '4px 12px', borderRadius: '8px', background: 'rgba(255, 159, 10, 0.1)', color: 'var(--accent-amber)', fontSize: '12px', fontWeight: 600 }}>CORE AI</span>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.6 }}>
              Will the car still be there by the time I arrive? Every alert is scored with a "still there" probability based on historical dwell time.
            </p>
            
            {/* Nested Inner Card (Alert Simulation) */}
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.7)', 
              borderRadius: '16px', 
              padding: '24px',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              borderLeft: '4px solid var(--accent-red)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div className="pulse-ring-container" style={{ width: '24px', height: '24px' }}>
                  <div className="pulse-ring red" style={{ width: '24px', height: '24px' }}></div>
                  <div className="pulse-node red"></div>
                </div>
                <span className="mono" style={{ fontWeight: 600, color: 'var(--accent-red)' }}>CRITICAL</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Indiranagar 12th Main</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
                <span>Reported 6 min ago</span>
                <span>Officer ETA: 9 min</span>
              </div>
              
              <div style={{ background: 'rgba(0,0,0,0.05)', height: '8px', borderRadius: '4px', marginBottom: '16px', overflow: 'hidden' }}>
                <div style={{ width: '91%', height: '100%', background: 'var(--accent-red)', borderRadius: '4px' }}></div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="mono" style={{ fontSize: '14px', fontWeight: 500 }}>Dispatch probability: 91%</span>
                <button style={{
                  background: 'var(--text-primary)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}>
                  Dispatch Now
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StyleReference;
