import React, { useState, useEffect, useRef } from 'react';
import { getMockData } from '../utils/mockFallback';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { mappls } from 'mappls-web-maps';
import { Link } from 'react-router-dom';

const mapplsClassObject = new mappls();

export default function DashboardPreview() {
  const MAPPLS_KEY = import.meta.env.VITE_MAPPLS_API_KEY || "cleargrid_demo_key";
  const containerRef = useRef(null);
  const [activeTab, setActiveTab] = useState(0);
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { name: 'Hotspot Map', endpoint: '/api/hotspots', key: 'hotspots' },
    { name: 'Optimal Patrol Routing', endpoint: '/api/optimal-routes', key: 'routes' },
    { name: 'Chokepoint Scoring', endpoint: '/api/chokepoints', key: 'chokepoints' },
    { name: 'Dwell Time Analytics', endpoint: '/api/dwell-time', key: 'dwell_times' },
    { name: 'Repeat Offenders', endpoint: '/api/repeat-offenders', key: 'repeat_offenders' },
    { name: 'Coverage Gaps', endpoint: '/api/coverage-gaps', key: 'coverage_gaps' },
    { name: 'Pipeline Health', endpoint: '/api/pipeline-health', key: 'pipeline_health' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8000${tabs[activeTab].endpoint}`);
        if (res.ok) {
          const data = await res.json();
          const tKey = tabs[activeTab].key;
          if (tKey === 'pipeline_health') {
            setHotspots([
              { name: 'Edge Devices Status', value: 'Healthy', type: 'system' },
              { name: 'SCITA Integration', value: 'Syncing', type: 'system' },
              { name: 'Global Correction Rate', value: '3.4%', type: 'system' }
            ]);
          } else {
            setHotspots(data[tKey] || []);
          }
        } else {
          throw new Error("API failed");
        }
      } catch (err) {
        console.warn("Failed to fetch from API, using mock fallback", err);
        const data = getMockData(tabs[activeTab].endpoint);
        const tKey = tabs[activeTab].key;
        if (tKey === 'pipeline_health') {
          setHotspots(data);
        } else {
          setHotspots(data[tKey] || []);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    let map;
    if (hotspots.length > 0 && MAPPLS_KEY) {
      try {
        const loadObject = { map: true };
        mapplsClassObject.initialize(MAPPLS_KEY, loadObject, () => {
          const container = document.getElementById("preview-map-container");
          if (container) container.innerHTML = '';

          map = mapplsClassObject.Map({
            id: "preview-map-container",
            properties: {
              center: [12.9716, 77.5946],
              zoom: 11,
              backgroundColor: '#E2E8F0'
            }
          });

          map.on('load', () => {
            const getMarkerColor = (item) => {
              if (item.violation_count > 6000) return '#FF3B30';
              if (item.violation_count > 3000) return '#FF9500';
              return '#34C759';
            };

            const getMarkerIcon = (color) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
              <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 0C6.7 0 0 6.7 0 15c0 11.2 15 25 15 25s15-13.8 15-25C30 6.7 23.3 0 15 0zm0 22c-3.9 0-7-3.1-7-7s3.1-7 7-7 7 3.1 7 7-3.1 7-7 7z" fill="${color}" stroke="white" stroke-width="1.5"/>
              </svg>
            `)}`;

            if (tabs[activeTab].key === 'routes') {
              hotspots.forEach(route => {
                const paths = [];
                if (route.route_geometry && route.route_geometry.length > 0) {
                  route.route_geometry.forEach(coord => {
                    paths.push({ lat: Number(coord[1]), lng: Number(coord[0]) });
                  });
                } else {
                  route.waypoints.forEach(wp => {
                    paths.push({ lat: Number(wp.lat), lng: Number(wp.lng) });
                  });
                }

                route.waypoints.forEach(wp => {
                  mapplsClassObject.Marker({
                    map: map,
                    position: { lat: Number(wp.lat), lng: Number(wp.lng) },
                    icon: getMarkerIcon(route.color)
                  });
                });
                mapplsClassObject.Polyline({
                  map: map,
                  paths: paths,
                  strokeColor: route.color,
                  strokeOpacity: 0.8,
                  strokeWeight: 3
                });
              });
            } else if (tabs[activeTab].key !== 'pipeline_health') {
              hotspots.slice(0, 50).forEach(hs => {
                if (hs.type === 'system') return; // Skip map markers for pipeline health mockup
                mapplsClassObject.Marker({
                  map: map,
                  position: { lat: Number(hs.lat), lng: Number(hs.lng) },
                  icon: getMarkerIcon(getMarkerColor(hs))
                });
              });
            }
          });
        });
      } catch (e) {
        console.error("Map initialization failed:", e);
      }
    }

    return () => {
      if (map && map.remove) {
        map.remove();
      }
    };
  }, [hotspots]);

  useGSAP(() => {
    gsap.fromTo('.mock-browser', { y: 40, opacity: 0, scale: 0.95 }, {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: containerRef.current,
        scroller: '#snap-container',
        start: 'top 80%',
      }
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ fontFamily: 'Space Grotesk', fontWeight: 600, color: 'var(--accent-blue)', letterSpacing: '2px', fontSize: '14px', marginBottom: '16px', textTransform: 'uppercase' }}>
        Live Preview
      </div>
      
      <h2 className="syne" style={{ fontSize: '42px', textAlign: 'center', marginBottom: '32px' }}>
        The Dashboard Officers Actually Use
      </h2>

      {/* Browser Mockup */}
      <div className="mock-browser glass-panel" style={{
        width: '100%',
        maxWidth: '1200px',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)',
        border: '1px solid rgba(255,255,255,0.5)',
        marginBottom: '32px'
      }}>
        {/* Browser Header */}
        <div style={{ 
          height: '48px', 
          background: 'rgba(255,255,255,0.4)', 
          borderBottom: '1px solid rgba(255,255,255,0.3)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: '8px'
        }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F04E4E' }}></div>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F5A623' }}></div>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10D48E' }}></div>
          
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            justifyContent: 'center' 
          }}>
            <div className="mono" style={{ 
              background: 'rgba(255,255,255,0.5)', 
              padding: '6px 200px', 
              borderRadius: '8px', 
              fontSize: '12px', 
              color: 'var(--text-secondary)' 
            }}>
              app.cleargrid.in/dashboard
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div style={{ display: 'flex', height: '480px', background: 'rgba(250,251,252,0.6)' }}>
          {/* Sidebar Tabs */}
          <div style={{ width: '280px', borderRight: '1px solid rgba(0,0,0,0.05)', padding: '24px 0', background: 'rgba(255,255,255,0.3)' }}>
            <div style={{ padding: '0 24px', marginBottom: '32px', fontWeight: 600, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', background: 'var(--accent-blue)', borderRadius: '4px' }}></div>
              ClearGrid
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 12px' }}>
              <div className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', padding: '0 12px', fontWeight: 600, letterSpacing: '1px' }}>
                TIER 1 • INTERACTIVE
              </div>
              {tabs.map((tab, idx) => (
                <div 
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: activeTab === idx ? 600 : 500,
                    background: activeTab === idx ? 'rgba(16, 212, 142, 0.1)' : 'transparent',
                    color: activeTab === idx ? 'var(--accent-green)' : 'var(--text-secondary)',
                    transition: 'all 0.2s',
                    fontSize: '14px'
                  }}
                >
                  {tab.name}
                </div>
              ))}
            </div>
          </div>

          {/* Main Area */}
          <div style={{ flex: 1, position: 'relative', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: 'var(--text-muted)' }}>Querying ClearGrid Engine...</div>
              </div>
            ) : (
              <div style={{ width: '100%', minHeight: '100%', background: '#E2E8F0', padding: '24px', position: 'relative' }}>
                <div id="preview-map-container" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, borderRadius: '16px', overflow: 'hidden' }}></div>
                
                <div style={{ position: 'relative', zIndex: 2, background: 'rgba(255,255,255,0.95)', padding: '16px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '24px', display: 'inline-block' }}>
                  <div className="mono" style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>DATA SUMMARY</div>
                  <div style={{ fontSize: '14px' }}>Data Points Rendered: <strong style={{ color: 'var(--accent-blue)' }}>{hotspots.length}</strong></div>
                </div>
                
                <div style={{ position: 'relative', zIndex: 2, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', pointerEvents: 'none' }}>
                  {hotspots.slice(0, 12).map((hs, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.95)', padding: '16px', borderRadius: '12px', borderLeft: '4px solid var(--accent-green)', pointerEvents: 'auto', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                      <div style={{ fontWeight: 600, marginBottom: '4px', fontSize: '14px' }}>{hs.name || 'H3 Cell Region'}</div>
                      <div className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {hs.type === 'system' ? `Status: ${hs.value}` : (hs.violation_count ? `Violations: ${hs.violation_count}` : hs.score ? `Score: ${hs.score.toFixed(1)}` : `Value: ${hs.avg_dwell_minutes || hs.current_revenue || 'Recorded'}`)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {tabs[activeTab].key === 'pipeline_health' && (
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: '#F8FAFC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
               <div style={{ padding: '24px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                 <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                   <div style={{ color: '#34C759', fontWeight: 'bold', fontSize: '24px' }}>✓</div>
                 </div>
                 <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#1d1d1f' }}>All Systems Operational</h3>
                 <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>Pipeline ingestion and processing are running smoothly.</p>
               </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px' }}>
        <a href="/dashboard" style={{
          background: 'rgba(79, 140, 247, 0.1)',
          border: '1px solid var(--accent-blue)',
          color: 'var(--accent-blue)',
          padding: '16px 32px',
          borderRadius: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          fontSize: '16px',
          textDecoration: 'none'
        }}>
          🎯 Open Full Interactive Dashboard &rarr;
        </a>
      </div>
    </div>
  );
}
