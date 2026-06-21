import React, { useEffect } from 'react';
import { ShieldAlert, Zap, Layers, Maximize2, Activity } from 'lucide-react';
import { mappls } from 'mappls-web-maps';
import { Link } from 'react-router-dom';

const mapplsClassObject = new mappls();

function ModelTelemetryCard() {
  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.03)',
      border: '1px solid var(--glass-border-light)',
      padding: '24px',
      borderRadius: '24px',
      width: 'fit-content',
      minWidth: '380px',
      marginTop: '16px',
      marginBottom: '24px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Activity size={18} color="var(--accent-blue)" />
        <span style={{ fontWeight: 600, fontSize: '14px', color: '#1d1d1f' }}>Model Telemetry</span>
        <span style={{ 
          marginLeft: 'auto', 
          background: 'rgba(52, 199, 89, 0.1)', 
          color: '#34C759', 
          fontSize: '10px', 
          fontWeight: 700, 
          padding: '4px 8px', 
          borderRadius: '100px',
          letterSpacing: '0.5px'
        }}>ONLINE</span>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Prediction Accuracy</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#1d1d1f', fontFamily: 'monospace' }}>94.2%</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>ROC-AUC Score</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#1d1d1f', fontFamily: 'monospace' }}>0.89</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Mean Abs Error (MAE)</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#1d1d1f', fontFamily: 'monospace' }}>1.2 min</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>F1 Score</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#1d1d1f', fontFamily: 'monospace' }}>0.91</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Inference Latency</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#34C759', fontFamily: 'monospace' }}>42 ms</span>
        </div>

        <div style={{ marginTop: '12px', paddingTop: '16px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0, lineHeight: 1.5 }}>
            Production-grade models trained on 298k+ historical records, delivering sub-second predictions to optimize fleet dispatch.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  const MAPPLS_KEY = import.meta.env.VITE_MAPPLS_API_KEY || "cleargrid_demo_key";

  useEffect(() => {
    let map;
    if (MAPPLS_KEY) {
      setTimeout(() => {
        try {
          const loadObject = { map: true };
          mapplsClassObject.initialize(MAPPLS_KEY, loadObject, () => {
            const container = document.getElementById("hero-map-container");
            if (container) container.innerHTML = '';

          map = mapplsClassObject.Map({
            id: "hero-map-container",
            properties: {
              center: [12.9716, 77.5946],
              zoom: 12,
              backgroundColor: '#E2E8F0'
            }
          });

          map.on('load', () => {
            const markers = [
              { lat: 12.9716, lng: 77.5946, color: '#FF3B30' },
              { lat: 12.9850, lng: 77.6050, color: '#FF9500' },
              { lat: 12.9600, lng: 77.5800, color: '#34C759' },
              { lat: 12.9650, lng: 77.6100, color: '#FF3B30' },
              { lat: 12.9900, lng: 77.5800, color: '#FF9500' },
            ];

            const getMarkerIcon = (color) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
              <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 0C6.7 0 0 6.7 0 15c0 11.2 15 25 15 25s15-13.8 15-25C30 6.7 23.3 0 15 0zm0 22c-3.9 0-7-3.1-7-7s3.1-7 7-7 7 3.1 7 7-3.1 7-7 7z" fill="${color}" stroke="white" stroke-width="1.5"/>
              </svg>
            `)}`;

            markers.forEach(m => {
              mapplsClassObject.Marker({
                map: map,
                position: { lat: m.lat, lng: m.lng },
                icon: getMarkerIcon(m.color)
              });
            });

            mapplsClassObject.Polyline({
              map: map,
              paths: [
                { lat: 12.9716, lng: 77.5946 },
                { lat: 12.9850, lng: 77.6050 },
                { lat: 12.9650, lng: 77.6100 },
                { lat: 12.9600, lng: 77.5800 },
                { lat: 12.9716, lng: 77.5946 }
              ],
              strokeColor: '#4F8CF7',
              strokeOpacity: 0.7,
              strokeWeight: 4,
              dasharray: [2, 4]
            });
          });
        });
      } catch (e) {
        console.error("Map initialization failed:", e);
      }
    }, 500);
    }

    return () => {
      if (map && map.remove) {
        map.remove();
      }
    };
  }, [MAPPLS_KEY]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'row', 
      height: '100%', // Fills the SectionWrapper's card
      padding: '24px', 
      gap: '32px',
      overflow: 'hidden'
    }}>
      
      {/* LEFT: Content & Stats (45%) */}
      <div style={{ flex: '0 0 45%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div>
          <span style={{
            display: 'inline-block',
            padding: '6px 16px',
            borderRadius: '9999px',
            background: 'rgba(10, 132, 255, 0.1)',
            color: 'var(--accent-blue)',
            fontWeight: 600,
            fontSize: '12px',
            marginBottom: '16px'
          }}>
            &#127961;&#65039; Prototype Showcase
          </span>
          
          <h1 className="syne" style={{ fontSize: '42px', lineHeight: '1.05', letterSpacing: '-0.03em', marginBottom: '12px' }}>
            Stop Chasing Violations.
            <br />
            Start <span className="gradient-text">Predicting</span> Them.
          </h1>
          
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: '520px', marginBottom: '0' }}>
            ClearGrid uses historical parking violations to predict illegal parking before it happens, score its congestion impact, and tell officers exactly where to go.
          </p>
        </div>

        <ModelTelemetryCard />

        {/* Horizontal Stat Pills Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(0, 0, 0, 0.03)',
          borderRadius: '9999px',
          padding: '12px 20px',
          gap: '20px',
          border: '1px solid var(--glass-border-light)',
          flexWrap: 'wrap',
          width: 'fit-content'
        }}>
          {/* Stat 1 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(10, 132, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-blue)' }}>
              <ShieldAlert size={18} />
            </div>
            <div>
              <div className="mono" style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>298K+</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Violations</div>
            </div>
          </div>

          <div style={{ width: '1px', height: '24px', background: 'rgba(0,0,0,0.08)' }}></div>

          {/* Stat 2 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(29, 184, 118, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-green)' }}>
              <Zap size={18} />
            </div>
            <div>
              <div className="mono" style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>&lt;8 min</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Response ETA</div>
            </div>
          </div>
          
          <div style={{ width: '1px', height: '24px', background: 'rgba(0,0,0,0.08)' }}></div>

          {/* Stat 3 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255, 159, 10, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-amber)' }}>
              <Layers size={18} />
            </div>
            <div>
              <div className="mono" style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>11</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Intelligence Layers</div>
            </div>
          </div>

        </div>
      </div>

      {/* RIGHT: Map Panel (55%) */}
      <div style={{ 
        flex: '1', 
        background: '#E2E8F0',
        borderRadius: 'var(--radius-lg)', 
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)'
      }}>
        
        {/* Real Mappls Map container */}
        <div id="hero-map-container" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}></div>

        {/* Top Left Dropdown Pill */}
        <div className="glass-panel" style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          padding: '8px 16px',
          borderRadius: '9999px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: 500,
          cursor: 'pointer',
          zIndex: 10
        }}>
          Bengaluru, KA <span>&#x25BE;</span>
        </div>

        {/* Top Right Expand Button */}
        <Link to="/dashboard" className="glass-panel" style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10,
          textDecoration: 'none'
        }}>
          <Maximize2 size={18} color="var(--text-primary)" />
        </Link>

        {/* Bottom Floating Context Pill */}
        <div className="glass-panel" style={{
          position: 'absolute',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '10px 24px',
          borderRadius: '9999px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          zIndex: 10
        }}>
          <div style={{ width: '8px', height: '8px', background: 'var(--accent-red)', borderRadius: '50%' }}></div>
          <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>Live Dispatch Feed</span>
        </div>
      </div>
    </div>
  );
}
