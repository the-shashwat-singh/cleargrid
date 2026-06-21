import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollerContext } from '../pages/MarketingPage';

gsap.registerPlugin(ScrollTrigger);

const FeatureCard = ({ id, label, title, children, tags, style, fullWidth = false }) => {
  return (
    <div 
      className="feature-card glass-panel"
      style={{
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        gridColumn: fullWidth ? '1 / -1' : 'auto',
        ...style
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div className="mono" style={{ color: 'var(--text-muted)', fontSize: '14px' }}>FEATURE {id}</div>
        {label && (
          <div className="mono" style={{ 
            background: 'rgba(79, 140, 247, 0.1)', 
            color: 'var(--accent-blue)', 
            padding: '4px 12px', 
            borderRadius: 'var(--radius-sm)', 
            fontSize: '12px',
            fontWeight: 600
          }}>
            {label}
          </div>
        )}
      </div>
      <h3 className="grotesk" style={{ fontSize: '24px', marginBottom: '16px' }}>{title}</h3>
      <div style={{ flex: 1 }}>{children}</div>
      {tags && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '32px', flexWrap: 'wrap' }}>
          {tags.map(tag => (
            <span key={tag} className="mono" style={{ color: 'var(--text-muted)', fontSize: '12px' }}>[{tag}]</span>
          ))}
        </div>
      )}
    </div>
  );
};

export default function IntelligenceLayers() {
  const containerRef = useRef(null);
  const scroller = React.useContext(ScrollerContext);

  useGSAP(() => {
    // Header animation
    gsap.fromTo('.section-header', { y: 30, opacity: 0 }, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: containerRef.current,
        scroller: scroller,
        start: 'top 80%',
      }
    });

    // Feature cards staggered entrance
    const cards = gsap.utils.toArray('.feature-card');
    
    cards.forEach((card) => {
      gsap.fromTo(card, { y: 80, opacity: 0, scale: 0.95 }, {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          scroller: scroller,
          start: 'top 85%',
        }
      });
    });
  }, { scope: containerRef, dependencies: [scroller] });

  return (
    <div ref={containerRef} style={{ padding: '20px 0' }}>
      <div className="section-header" style={{ fontFamily: 'Space Grotesk', fontWeight: 600, color: 'var(--accent-blue)', letterSpacing: '2px', fontSize: '14px', marginBottom: '24px', textTransform: 'uppercase' }}>
        Intelligence Layers
      </div>
      
      <h2 className="syne" style={{ fontSize: '56px', lineHeight: 1.1, marginBottom: '24px' }}>
        Not a heatmap.<br/>
        An operating system<br/>
        for enforcement.
      </h2>

      <p style={{ color: 'var(--text-secondary)', fontSize: '20px', maxWidth: '600px', marginBottom: '80px', lineHeight: 1.6 }}>
        Most systems show you where violations happened yesterday. 
        ClearGrid tells you where they'll happen in the next two hours — 
        and sends the right officer there before the car even parks.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
        
        {/* Feature 1 */}
        <FeatureCard id="01" label="[Live]" title="Hotspot Map" style={{ gridColumn: 'span 4' }} tags={['Density Analysis', 'DuckDB']}>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Real-time visualization of violation density across H3 hexagonal cells. Instantly see where the highest concentrations of illegal parking are occurring.
          </p>
        </FeatureCard>

        {/* Feature 2 */}
        <FeatureCard id="02" label="[Live]" title="Optimal Patrol Routing" style={{ gridColumn: 'span 8' }} tags={['OSRM API', 'KMeans Clustering', 'DuckDB']}>
          <div style={{ display: 'flex', gap: '40px' }}>
            <div style={{ flex: 1, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <p>Generates optimal driving routes for enforcement vehicles.</p>
              <br/>
              <p>Instead of manual patrolling, we cluster live violation hotspots using KMeans and snap the waypoints to the actual road network using the Open Source Routing Machine (OSRM) driving API to create highly efficient patrol paths.</p>
            </div>
            <div style={{ flex: 1, background: 'rgba(0,0,0,0.03)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#4F8CF7' }}></div>
                <div style={{ fontSize: '14px' }}><strong>Patrol 1:</strong> Coverage: 4,200 estimated violations</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#34C759' }}></div>
                <div style={{ fontSize: '14px' }}><strong>Patrol 2:</strong> Coverage: 3,150 estimated violations</div>
              </div>
            </div>
          </div>
        </FeatureCard>

        {/* Feature 3, 4, 5 */}
        <FeatureCard id="03" label="[Live]" title="Dwell Time Analytics" style={{ gridColumn: 'span 4' }} tags={['Median Aggregation']}>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>"How long are vehicles staying illegally parked?"</p>
          <div className="mono" style={{ background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '16px', borderRadius: '12px', fontSize: '12px', lineHeight: 1.6 }}>
            Aggregating historical dwell_minutes.<br/>
            Identifies zones where quick drop-offs turn into chronic congestion.
          </div>
        </FeatureCard>

        <FeatureCard id="04" label="[Live]" title="Repeat Offenders" style={{ gridColumn: 'span 4' }} tags={['Entity Tracking', 'DuckDB']}>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>Track habitual violators across zones.</p>
          <div style={{ background: 'rgba(255,255,255,0.6)', padding: '16px', borderRadius: '12px', fontSize: '14px', lineHeight: 1.6 }}>
            <strong>KA-01-XX-9999</strong> &rarr; <span style={{ color: 'var(--text-secondary)' }}>Flagged</span><br/>
            Spotted 45 times in last 30 days.
          </div>
        </FeatureCard>

        <FeatureCard id="05" label="[Live]" title="Coverage Gaps" style={{ gridColumn: 'span 4' }} tags={['Spatial Auditing']}>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>Find enforcement deserts.</p>
          <div style={{ background: 'rgba(255,255,255,0.6)', padding: '16px', borderRadius: '12px', fontSize: '14px', lineHeight: 1.6 }}>
            Identifies high-violation zones lacking sufficient officer patrols or traffic cameras.
          </div>
        </FeatureCard>

        {/* Feature 6 */}
        <FeatureCard id="06" label="[Live]" title="Pipeline Health" fullWidth tags={['System Telemetry']}>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px', fontSize: '18px' }}>
            Live metrics on Edge integration and SCITA correction rates.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', background: 'linear-gradient(90deg, rgba(79, 140, 247, 0.1), rgba(79, 140, 247, 0.0))', padding: '24px', borderRadius: '12px' }}>
            <div style={{ flex: 1, fontWeight: 500 }}>Top Officer Correction Rate</div>
            <div style={{ color: 'var(--accent-blue)' }}>&rarr;</div>
            <div style={{ flex: 1, fontWeight: 600, color: 'var(--accent-blue)' }}>Ensures Data Quality</div>
          </div>
        </FeatureCard>

        {/* Features 7 & 8 */}
        <FeatureCard id="07" label="[Batch Analysis]" title="Anomaly Detection (CUSUM)" style={{ gridColumn: 'span 6' }} tags={['Statistical Process Control', 'Offline']}>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <strong>Computed from historical data:</strong> We ran a CUSUM control chart against the 298k row dataset to flag H3 cells where the cumulative sum of violations deviates significantly from the 8-12 week baseline.
          </p>
        </FeatureCard>

        <FeatureCard id="08" label="[Batch Analysis]" title="Cascade Prediction" style={{ gridColumn: 'span 6' }} tags={['Temporal Correlation', 'Offline']}>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <strong>Computed from historical data:</strong> Sliding-window seed/follower detection. Identifying which highly-congested cells historically act as triggers for adjacent cell congestion.
          </p>
        </FeatureCard>

        {/* Features 9, 10, 11 */}
        <FeatureCard id="09" label="[Designed]" title="Predictive Deployment" style={{ gridColumn: 'span 4' }} tags={['Architecture']}>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '14px' }}>
            <strong>Methodology:</strong> Time-series forecasting (LSTM) to predict where hotspots will shift in the next 2 hours.<br/><br/>
            <strong>Missing Dependency:</strong> A trained, validated model iterating over months of seasonal data (weather, holidays) to prevent false positives.
          </p>
        </FeatureCard>

        <FeatureCard id="10" label="[Designed]" title="Impact Simulation" style={{ gridColumn: 'span 4' }} tags={['Architecture']}>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '14px' }}>
            <strong>Methodology:</strong> Simulating traffic redistribution when a chokepoint is closed.<br/><br/>
            <strong>Missing Dependency:</strong> A dynamic traffic routing engine (like SUMO) and live Origin-Destination (OD) flow data.
          </p>
        </FeatureCard>

        <FeatureCard id="11" label="[Designed]" title="Civic Integration" style={{ gridColumn: 'span 4' }} tags={['Architecture']}>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '14px' }}>
            <strong>Methodology:</strong> Live dispatch of police officers to critical chokepoints using VRP.<br/><br/>
            <strong>Missing Dependency:</strong> Live GPS telemetry from police patrol cars.
          </p>
        </FeatureCard>

      </div>
    </div>
  );
}
