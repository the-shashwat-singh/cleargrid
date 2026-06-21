import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { mappls } from 'mappls-web-maps';
import { ArrowLeft, Map as MapIcon, ShieldAlert, Clock, Car, IndianRupee, Activity, GitMerge, MoveRight, Route, Radio, AlertTriangle, Layers, Cpu, Server, Users, Stethoscope, Navigation } from 'lucide-react';

const TIER_1_LAYERS = [
  { id: 'hotspots', name: 'Hotspot Intelligence', icon: MapIcon, tier: 'Live', endpoint: '/api/hotspots', key: 'hotspots' },
  { id: 'chokepoints', name: 'Chokepoint Scoring', icon: ShieldAlert, tier: 'Live', endpoint: '/api/chokepoints', key: 'chokepoints' },
  { id: 'dwell', name: 'Dwell Time Analytics', icon: Clock, tier: 'Live', endpoint: '/api/dwell-time', key: 'dwell_times' },
  { id: 'repeat_offenders', name: 'Repeat Offenders', icon: Users, tier: 'Live', endpoint: '/api/repeat-offenders', key: 'repeat_offenders' },
  { id: 'coverage_gaps', name: 'Coverage Gaps', icon: ShieldAlert, tier: 'Live', endpoint: '/api/coverage-gaps', key: 'coverage_gaps' },
  { id: 'pipeline_health', name: 'Pipeline Health', icon: Stethoscope, tier: 'Live', endpoint: '/api/pipeline-health', key: 'pipeline_health' }
];

const TIER_2_LAYERS = [
  { id: 'optimal_routes', name: 'Optimal Patrol Routing', icon: Navigation, tier: 'Batch Analysis', endpoint: '/api/optimal-routes', key: 'routes' },
  { id: 'anomaly', name: 'Anomaly Detection', icon: Activity, tier: 'Batch Analysis', endpoint: '/api/anomaly-detection', key: 'anomalies' },
  { id: 'cascade', name: 'Cascade Prediction', icon: GitMerge, tier: 'Batch Analysis', endpoint: '/api/cascade-prediction', key: 'cascades' }
];

const TIER_3_LAYERS = [
  { id: 'predictive', name: 'Predictive Deployment', icon: MoveRight, tier: 'Designed' },
  { id: 'impact', name: 'Impact Simulation', icon: Route, tier: 'Designed' },
  { id: 'civic', name: 'Civic Integration', icon: Radio, tier: 'Designed' }
];

const ALL_LAYERS = [...TIER_1_LAYERS, ...TIER_2_LAYERS, ...TIER_3_LAYERS];

const mapplsClassObject = new mappls();

export default function Dashboard() {
  const [activeLayer, setActiveLayer] = useState('hotspots');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [mapInstance, setMapInstance] = useState(null);
  const [mapObject, setMapObject] = useState(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const markersRef = useRef([]);
  const polylinesRef = useRef([]);

  const MAPPLS_KEY = import.meta.env.VITE_MAPPLS_API_KEY || "cleargrid_demo_key";

  useEffect(() => {
    if (!MAPPLS_KEY) return;
    let map;
    try {
      const loadObject = { map: true, plugins: ['mappls-pin'] };
      mapplsClassObject.initialize(MAPPLS_KEY, loadObject, () => {
        const container = document.getElementById("dashboard-map");
        if (container) container.innerHTML = '';

        map = mapplsClassObject.Map({
          id: "dashboard-map",
          properties: {
            center: [12.9716, 77.5946],
            zoom: 11,
            backgroundColor: '#E2E8F0'
          }
        });
        
        map.on('load', () => {
          setMapInstance(map);
          setMapObject(mapplsClassObject);
          setIsMapLoaded(true);
        });
      });
    } catch (e) {
      console.error("Map init failed", e);
    }

    return () => {
      if (map && map.remove) {
        map.remove();
      }
    };
  }, [MAPPLS_KEY]);

  const clearMarkers = () => {
    if (markersRef.current && markersRef.current.length > 0) {
      markersRef.current.forEach(m => {
        try {
          if (mapObject && mapInstance) {
            mapObject.removeLayer({ map: mapInstance, layer: m });
          } else if (m && m.remove) {
            m.remove();
          }
        } catch (e) {
          if (m && m.remove) m.remove();
        }
      });
      markersRef.current = [];
    }
    if (polylinesRef.current && polylinesRef.current.length > 0) {
      polylinesRef.current.forEach(p => {
        try {
          if (mapObject && mapInstance) {
            mapObject.removeLayer({ map: mapInstance, layer: p });
          } else if (p && p.remove) {
            p.remove();
          }
        } catch (e) {
          if (p && p.remove) p.remove();
        }
      });
      polylinesRef.current = [];
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const layerConf = ALL_LAYERS.find(l => l.id === activeLayer);
        
        if (layerConf.tier === 'Designed' || layerConf.key === 'pipeline_health') {
          setData([]);
          clearMarkers();
          if (layerConf.key !== 'pipeline_health') {
            setLoading(false);
            return;
          }
        }

        if (layerConf.key !== 'pipeline_health') clearMarkers();
        const res = await fetch(`http://localhost:8000${layerConf.endpoint}`);
        if (!res.ok) throw new Error("API failed");
        
        const json = await res.json();
        
        if (layerConf.key === 'pipeline_health') {
            setData(json);
            setLoading(false);
            return;
        }
        
        const items = json[layerConf.key] || [];
        setData(items);

        const getMarkerColor = (item, layerKey) => {
          if (layerKey === 'hotspots') {
            if (item.violation_count > 6000) return '#FF3B30';
            if (item.violation_count > 3000) return '#FF9500';
            return '#34C759';
          }
          if (layerKey === 'chokepoints') {
            if (item.score > 80) return '#FF3B30';
            if (item.score > 50) return '#FF9500';
            return '#34C759';
          }
          if (layerKey === 'dwell_times') {
            if (item.dwell_minutes > 30000) return '#FF3B30';
            if (item.dwell_minutes > 15000) return '#FF9500';
            return '#34C759';
          }
          if (layerKey === 'anomalies') {
            if (item.deviation_percentage > 500) return '#FF3B30';
            if (item.deviation_percentage > 200) return '#FF9500';
            return '#34C759';
          }
          if (layerKey === 'cascades') {
            if (item.cascade_rate_pct > 80) return '#FF3B30';
            if (item.cascade_rate_pct > 50) return '#FF9500';
            return '#34C759';
          }
          if (layerKey === 'repeat_offenders') {
            if (item.violation_count > 40) return '#FF3B30';
            if (item.violation_count > 20) return '#FF9500';
            return '#34C759';
          }
          if (layerKey === 'coverage_gaps') {
            if (item.coverage_ratio < 0.1) return '#FF3B30';
            if (item.coverage_ratio < 0.25) return '#FF9500';
            return '#34C759';
          }
          return '#0A84FF';
        };

        const getMarkerIcon = (color) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
          <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 0C6.7 0 0 6.7 0 15c0 11.2 15 25 15 25s15-13.8 15-25C30 6.7 23.3 0 15 0zm0 22c-3.9 0-7-3.1-7-7s3.1-7 7-7 7 3.1 7 7-3.1 7-7 7z" fill="${color}" stroke="white" stroke-width="1.5"/>
          </svg>
        `)}`;

        const generatePopupHtml = (item, layerKey) => {
          let color = getMarkerColor(item, layerKey);
          let badge = '';
          
          let displayName = item.name;
          if (!displayName || displayName === 'No Junction') {
            const tempId = item.id || item.h3_cell || item.seed_cell || '';
            const coords = (item.lat && item.lng) ? `(${item.lat.toFixed(4)}, ${item.lng.toFixed(4)})` : (tempId ? tempId.substring(4, 9).toUpperCase() : '');
            displayName = `Unmapped Zone ${coords}`.trim();
          }
          
          if (color === '#FF3B30') badge = '<span style="background: rgba(255, 59, 48, 0.1); color: #FF3B30; border: 1px solid rgba(255, 59, 48, 0.3); padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 12px; display: inline-block; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">CRITICAL</span>';
          else if (color === '#FF9500') badge = '<span style="background: rgba(255, 149, 0, 0.1); color: #FF9500; border: 1px solid rgba(255, 149, 0, 0.3); padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 12px; display: inline-block; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">HIGH RISK</span>';
          else badge = '<span style="background: rgba(52, 199, 89, 0.1); color: #34C759; border: 1px solid rgba(52, 199, 89, 0.3); padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 12px; display: inline-block; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">MODERATE</span>';

          let specificDetails = '';
          let footerHtml = '';
          
          if (layerKey === 'hotspots') {
            specificDetails = `
              <div style="margin-bottom: 8px;"><strong>${(item.violation_count || 0).toLocaleString()}</strong> violations recorded</div>
              <div style="margin-bottom: 8px;"><strong>Dominant Vehicle:</strong> ${item.dominant_vehicle || 'N/A'}</div>
              <div style="margin-bottom: 8px;"><strong>Revenue Potential:</strong> ₹${((item.violation_count || 0) * 500).toLocaleString()}</div>
            `;
            footerHtml = `<div style="text-align: right; margin-top: 16px; font-size: 11px; color: var(--text-muted);">Density Rank: ${item.rank}</div>`;
          } else if (layerKey === 'chokepoints') {
            specificDetails = `
              <div style="margin-bottom: 8px;"><strong>Traffic Impact:</strong> ${(1 + (item.alt_routes || 0)/10).toFixed(2)}x normal travel time</div>
              <div style="font-size: 12px; color: #666; font-style: italic; margin-bottom: 12px;">(Vehicles here take longer than free-flow conditions)</div>
              <div style="margin-bottom: 8px;"><strong>${(item.violation_count || 0).toLocaleString()}</strong> violations recorded</div>
            `;
            footerHtml = `<div style="text-align: right; margin-top: 16px; font-size: 11px; color: var(--text-muted);">Raw severity: ${item.score.toFixed(2)}</div>`;
          } else if (layerKey === 'dwell_times') {
            specificDetails = `
              <div style="margin-bottom: 8px;"><strong>Median Dwell Time:</strong> ${item.dwell_minutes.toFixed(0)} minutes</div>
              <div style="margin-bottom: 8px;"><strong>Status:</strong> ${item.dwell_minutes > 15000 ? 'Severe Congestion' : 'Moderate Flow'}</div>
            `;
          } else if (layerKey === 'repeat_offenders') {
            specificDetails = `
              <div style="margin-bottom: 8px;"><strong>Vehicle:</strong> ${item.vehicle_number} (${item.vehicle_type})</div>
              <div style="margin-bottom: 8px;"><strong>${(item.violation_count || 0).toLocaleString()}</strong> violations recorded</div>
              <div style="margin-bottom: 8px;"><strong>First seen:</strong> ${item.first_seen}</div>
              <div style="margin-bottom: 8px;"><strong>Last seen:</strong> ${item.last_seen}</div>
              ${item.is_habitual_spot_offender ? `<div style="color: #FF3B30; font-size: 13px; font-weight: 600; margin-top: 12px; background: rgba(255, 59, 48, 0.05); padding: 8px; border-radius: 6px; border: 1px solid rgba(255,59,48,0.2);">⚠️ Habitual Spot Offender</div>` : ''}
            `;
            footerHtml = `<div style="text-align: right; margin-top: 16px; font-size: 11px; color: var(--text-muted);">Top location count: ${item.top_location_count}</div>`;
          } else if (layerKey === 'coverage_gaps') {
            specificDetails = `
              <div style="margin-bottom: 8px;"><strong>Coverage Ratio:</strong> ${(item.coverage_ratio || 0).toFixed(2)}</div>
              <div style="margin-bottom: 8px;"><strong>Officers / Devices:</strong> ${item.distinct_officer_count} / ${item.distinct_device_count}</div>
              <div style="margin-bottom: 8px;"><strong>${(item.violation_count || 0).toLocaleString()}</strong> violations recorded</div>
              <div style="color: #FF3B30; font-size: 13px; font-weight: 600; margin-top: 12px; background: rgba(255, 59, 48, 0.05); padding: 8px; border-radius: 6px; border: 1px solid rgba(255,59,48,0.2);">🚨 Monitoring Desert Detected</div>
            `;
            footerHtml = `<div style="text-align: right; margin-top: 16px; font-size: 11px; color: var(--text-muted);">Shift: ${item.time_bucket}</div>`;
          } else if (layerKey === 'anomalies') {
            specificDetails = `
              <div style="margin-bottom: 8px;"><strong>Magnitude:</strong> <span style="color: ${item.deviation_percentage > 200 ? '#FF3B30' : 'inherit'}; font-weight: 600;">+${item.deviation_percentage.toFixed(0)}%</span></div>
              <div style="margin-bottom: 8px;"><strong>Baseline Daily Avg:</strong> ${item.baseline_mean_daily.toFixed(1)} violations</div>
              <div style="margin-bottom: 8px;"><strong>Detection Date:</strong> ${item.triggered_date ? item.triggered_date.substring(0, 10) : 'N/A'}</div>
            `;
          } else if (layerKey === 'cascades') {
            specificDetails = `
              <div style="margin-bottom: 8px;"><strong>Follower Segment:</strong> ${item.follower_cell ? item.follower_cell.substring(4,9).toUpperCase() : ''}</div>
              <div style="margin-bottom: 8px;"><strong>Cascade Frequency:</strong> ${(item.cascade_rate_pct || 0).toFixed(1)}% of occurrences</div>
              <div style="margin-bottom: 8px; color: #FF9500;"><strong>Time Gap:</strong> Follower junction congests roughly ${(item.median_time_to_cascade_mins || 0).toFixed(0)} minutes later</div>
            `;
          } else {
            specificDetails = `<div style="font-size: 14px; color: #1d1d1f;">Data Point Logged</div>`;
          }

          return `
            <div class="custom-mappls-popup" style="background: rgba(255, 255, 255, 0.85); backdrop-filter: saturate(180%) blur(20px); -webkit-backdrop-filter: saturate(180%) blur(20px); border: 1px solid rgba(255, 255, 255, 0.6); padding: 24px 48px 24px 24px; border-radius: 16px; min-width: 320px; box-shadow: 0 20px 40px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.8); text-align: left; font-family: system-ui, -apple-system, sans-serif;">
              <div style="font-weight: 700; font-size: 18px; margin-bottom: 12px; color: #1d1d1f; line-height: 1.3;">${displayName}</div>
              <div>${badge}</div>
              <div style="width: 100%; height: 1px; background: rgba(0,0,0,0.1); margin: 16px 0;"></div>
              <div style="line-height: 1.6; font-size: 14px; color: #333;">${specificDetails}</div>
              ${footerHtml}
            </div>
          `;
        };

        if (isMapLoaded && mapInstance && mapObject) {
          if (layerConf.key === 'routes') {
            items.forEach((route, routeIndex) => {
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

              route.waypoints.forEach((wp, idx) => {
                const markerLat = Number(wp.lat);
                const markerLng = Number(wp.lng);
                if (!markerLat || !markerLng) return;
                
                const badge = `<span style="background: ${route.color}20; color: ${route.color}; border: 1px solid ${route.color}40; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; margin-bottom: 12px; display: inline-block;">STOP ${idx + 1}</span>`;
                const popupHtml = `
                  <div class="custom-mappls-popup" style="background: rgba(255, 255, 255, 0.85); backdrop-filter: saturate(180%) blur(20px); -webkit-backdrop-filter: saturate(180%) blur(20px); border: 1px solid rgba(255, 255, 255, 0.6); padding: 24px 48px 24px 24px; border-radius: 16px; min-width: 320px; box-shadow: 0 20px 40px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.8); text-align: left; font-family: system-ui, -apple-system, sans-serif;">
                    <div style="font-weight: 700; font-size: 18px; margin-bottom: 12px; color: #1d1d1f; line-height: 1.3;">${wp.name || 'Unmapped Zone'}</div>
                    <div>${badge}</div>
                    <div style="width: 100%; height: 1px; background: rgba(0,0,0,0.1); margin: 16px 0;"></div>
                    <div style="line-height: 1.6; font-size: 14px; color: #333;">
                      <div style="margin-bottom: 8px;"><strong>Route Assignment:</strong> ${route.route_id}</div>
                      <div style="margin-bottom: 8px;"><strong>Estimated Violations:</strong> ${wp.violation_count.toLocaleString()}</div>
                    </div>
                  </div>
                `;
                const marker = mapObject.Marker({
                  map: mapInstance,
                  position: { lat: markerLat, lng: markerLng },
                  icon: getMarkerIcon(route.color),
                  popupHtml: popupHtml
                });
                marker._itemCoords = `${markerLat},${markerLng}`;
                markersRef.current.push(marker);
              });
              
              const polyline = mapObject.Polyline({
                map: mapInstance,
                paths: paths,
                strokeColor: route.color,
                strokeOpacity: 0.8,
                strokeWeight: 4,
                fitbounds: routeIndex === 0
              });
              polylinesRef.current.push(polyline);
            });
          } else {
            items.forEach(item => {
              const itemLat = Number(item.lat || item.seed_lat);
              const itemLng = Number(item.lng || item.seed_lng);
              if (!itemLat || !itemLng) return;
              
              const marker = mapObject.Marker({
                map: mapInstance,
                position: { lat: itemLat, lng: itemLng },
                icon: getMarkerIcon(getMarkerColor(item, layerConf.key)),
                popupHtml: generatePopupHtml(item, layerConf.key)
              });
              marker._itemCoords = `${itemLat},${itemLng}`;
              markersRef.current.push(marker);
            });
          }
        }
      } catch (err) {
        console.error("Failed to load layer data", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (isMapLoaded) {
      loadData();
    }
  }, [activeLayer, isMapLoaded, mapInstance, mapObject]);

  const renderTierTag = (tier) => {
    let bg = 'rgba(0,0,0,0.05)';
    let color = 'var(--text-secondary)';
    if (tier === 'Live') { bg = 'rgba(16, 212, 142, 0.1)'; color = '#10d48e'; }
    else if (tier === 'Batch Analysis') { bg = 'rgba(245, 166, 35, 0.1)'; color = '#f5a623'; }
    else if (tier === 'Designed') { bg = 'rgba(79, 140, 247, 0.1)'; color = '#4f8cf7'; }
    return <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: bg, color: color, fontWeight: 600 }}>{tier}</span>;
  };

  const SidebarItem = ({ layer }) => {
    const isActive = activeLayer === layer.id;
    const Icon = layer.icon;
    return (
      <div onClick={() => handleLayerSwitch(layer.id)} style={{ padding: '12px 16px', borderRadius: '8px', cursor: 'pointer', background: isActive ? 'rgba(0,0,0,0.03)' : 'transparent' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: isActive ? 600 : 500 }}>
          <Icon size={16} />{layer.name}
        </div>
        <div style={{marginTop: '4px'}}>{renderTierTag(layer.tier)}</div>
      </div>
    );
  };

  const getSidebarItemDetails = (item, layerKey) => {
    if (layerKey === 'hotspots') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Violations:</span>
            <span style={{ fontWeight: 600 }}>{(item.violation_count || 0).toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Fleet DNA:</span>
            <span style={{ fontWeight: 600 }}>{item.dominant_vehicle || 'N/A'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34C759' }}>
            <span>Est. Revenue:</span>
            <span style={{ fontWeight: 600 }}>₹{((item.violation_count || 0) * 500).toLocaleString()}</span>
          </div>
        </div>
      );
    } else if (layerKey === 'chokepoints') {
      return (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Score: {(item.score || 0).toFixed(1)}</span>
          <span style={{ fontWeight: 600 }}>{(item.violation_count || 0).toLocaleString()} Violations</span>
        </div>
      );
    } else if (layerKey === 'dwell_times') {
      return (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Median Dwell:</span>
          <span style={{ fontWeight: 600 }}>{(item.dwell_minutes || 0).toFixed(0)} mins</span>
        </div>
      );
    } else if (layerKey === 'repeat_offenders') {
      return (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Violations: {item.violation_count}</span>
          <span style={{ fontWeight: 600 }}>{item.vehicle_number}</span>
        </div>
      );
    } else if (layerKey === 'coverage_gaps') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Shift:</span>
            <span style={{ fontWeight: 600 }}>{item.time_bucket}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Violations:</span>
            <span>{item.violation_count}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#FF3B30' }}>
            <span>Officers / Devices:</span>
            <span style={{ fontWeight: 600 }}>{item.distinct_officer_count} / {item.distinct_device_count}</span>
          </div>
        </div>
      );
    } else if (layerKey === 'anomalies') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Magnitude:</span>
            <span style={{ fontWeight: 600, color: item.deviation_percentage > 200 ? '#FF3B30' : 'inherit' }}>+{item.deviation_percentage.toFixed(0)}%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Triggered:</span>
            <span>{item.triggered_date ? item.triggered_date.substring(0, 10) : 'N/A'}</span>
          </div>
        </div>
      );
    } else if (layerKey === 'cascades') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Time Gap:</span>
            <span style={{ fontWeight: 600 }}>{(item.median_time_to_cascade_mins || 0).toFixed(0)} mins</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Cascade Rate:</span>
            <span>{(item.cascade_rate_pct || 0).toFixed(1)}%</span>
          </div>
        </div>
      );
    } else if (layerKey === 'routes') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: item.color, fontWeight: 600 }}>{item.route_id}</span>
            <span style={{ fontWeight: 600 }}>{item.waypoints?.length || 0} Stops</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
             Covers {item.waypoints?.reduce((acc, w) => acc + (w.violation_count || 0), 0).toLocaleString()} potential violations
          </div>
        </div>
      );
    }
    return null;
  };

  const handleLayerSwitch = (layerId) => {
    setActiveLayer(layerId);
    setData([]);
  };

  const handleItemClick = (item) => {
    const itemLat = Number(item.lat || item.seed_lat);
    const itemLng = Number(item.lng || item.seed_lng);
    if (mapInstance && itemLat && itemLng) {
      mapInstance.flyTo({ center: { lat: itemLat, lng: itemLng }, zoom: 15 });
      const marker = markersRef.current.find(m => m._itemCoords === `${itemLat},${itemLng}`);
      if (marker) marker.togglePopup();
    }
  };

  const activeLayerConf = ALL_LAYERS.find(l => l.id === activeLayer);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', overflow: 'hidden', background: '#F8FAFC' }}>
      <style>
        {`
          .mappls-popup, .mapboxgl-popup {
            max-width: none !important;
          }
          .mapinfo-window-content, .mappls-popup-content, .mapboxgl-popup-content {
            background: transparent !important;
            box-shadow: none !important;
            padding: 0 !important;
            border: none !important;
            width: max-content !important;
          }
          .mapinfo-window-tip, .mappls-popup-tip, .mapboxgl-popup-tip {
            border-top-color: rgba(255, 255, 255, 0.85) !important;
            backdrop-filter: saturate(180%) blur(20px);
            -webkit-backdrop-filter: saturate(180%) blur(20px);
          }
          .mapinfo-window-close, .mappls-popup-close-button, .mapboxgl-popup-close-button {
            top: 16px !important;
            right: 16px !important;
            left: auto !important;
            color: #1d1d1f !important;
            z-index: 10 !important;
            font-size: 18px !important;
            text-shadow: none !important;
            width: 28px !important;
            height: 28px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background: rgba(0,0,0,0.05) !important;
            border-radius: 50% !important;
            transition: background 0.2s;
          }
          .mapinfo-window-close:hover, .mappls-popup-close-button:hover, .mapboxgl-popup-close-button:hover {
            background: rgba(0,0,0,0.1) !important;
            color: #000 !important;
          }
        `}
      </style>
      {/* Sidebar */}
      <div style={{ width: '320px', background: '#fff', borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #E2E8F0' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '24px', fontSize: '14px', fontWeight: 500 }}>
            <ArrowLeft size={16} /> Back to Site
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="pulse-ring-container" style={{ width: '20px', height: '20px' }}>
              <div className="pulse-ring blue" style={{ width: '24px', height: '24px' }}></div>
              <div className="pulse-node" style={{ background: 'var(--accent-blue)', width: '8px', height: '8px' }}></div>
            </div>
            <span className="grotesk" style={{ fontWeight: 700, fontSize: '20px', color: 'var(--text-primary)' }}>
              ClearGrid OS
            </span>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <div className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', padding: '0 8px', fontWeight: 600, letterSpacing: '1px' }}>
              TIER 1 • INTERACTIVE
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {TIER_1_LAYERS.map(l => <SidebarItem key={l.id} layer={l} />)}
            </div>
          </div>

          <div>
            <div className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', padding: '0 8px', fontWeight: 600, letterSpacing: '1px' }}>
              TIER 2 • ONE-TIME ANALYSIS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {TIER_2_LAYERS.map(l => <SidebarItem key={l.id} layer={l} />)}
            </div>
          </div>

          <div>
            <div className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', padding: '0 8px', fontWeight: 600, letterSpacing: '1px' }}>
              TIER 3 • DESIGNED
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {TIER_3_LAYERS.map(l => <SidebarItem key={l.id} layer={l} />)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, position: 'relative' }}>
        <div id="dashboard-map" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}></div>
        
        {/* Overlays */}
        {activeLayerConf.tier !== 'Designed' && (
          <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 2, background: 'rgba(255,255,255,0.95)', padding: '24px', borderRadius: '16px', boxShadow: '0 12px 32px rgba(0,0,0,0.1)', width: '380px', maxHeight: 'calc(100vh - 48px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <activeLayerConf.icon size={24} color="var(--accent-blue)" />
              <h2 style={{ fontSize: '20px', margin: 0 }}>{activeLayerConf.name}</h2>
            </div>
            
            {loading ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Querying duckdb...</div>
            ) : (
              <>
                <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>DATA POINTS</div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent-blue)' }}>{activeLayerConf.key === 'pipeline_health' ? 1 : data.length}</div>
                  </div>
                  <div>
                    <div className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>STATUS</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-green)', marginTop: '6px' }}>Active</div>
                  </div>
                </div>

                {activeLayerConf.key === 'coverage_gaps' && (
                  <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'rgba(255, 59, 48, 0.1)', borderRadius: '8px', fontSize: '12px', color: '#FF3B30', lineHeight: 1.4 }}>
                    <strong>Caveat:</strong> Coverage ratio reflects distinct logging-device diversity per cell, not verified patrol presence.
                  </div>
                )}
                {activeLayerConf.key === 'pipeline_health' && (
                  <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'rgba(0, 0, 0, 0.03)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    <strong>Note:</strong> Time-to-SCITA metric covers ~14.1% of records due to data availability.
                  </div>
                )}

                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {activeLayerConf.key === 'pipeline_health' ? (
                    data && Object.keys(data).length > 0 ? (
                      <>
                        <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Sent to SCITA Integration</div>
                          <div style={{ fontSize: '32px', fontWeight: 700, color: '#34C759', letterSpacing: '-1px' }}>
                            {((data.scita_split?.['True'] || 0) / ((data.scita_split?.['True'] || 0) + (data.scita_split?.['False'] || 0)) * 100).toFixed(1)}%
                          </div>
                          {data.time_to_scita_median_minutes && (
                            <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                              Median Latency: <strong style={{ color: '#1d1d1f' }}>{data.time_to_scita_median_minutes.toFixed(0)} mins</strong>
                            </div>
                          )}
                        </div>
                        
                        <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Overall Correction Rate</div>
                          <div style={{ fontSize: '28px', fontWeight: 600, color: data.correction_rate_pct > 5 ? '#FF3B30' : 'var(--primary)' }}>
                            {data.correction_rate_pct?.toFixed(1)}%
                          </div>
                          <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                            Percentage of reviewed tickets needing manual fixes.
                          </div>
                        </div>

                        <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Validation Breakdown</div>
                          {Object.entries(data.validation_status_breakdown || {}).sort((a,b)=>b[1]-a[1]).map(([status, count]) => (
                            <div key={status} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                              <span style={{textTransform: 'capitalize'}}>{status}</span>
                              <span style={{ fontWeight: 600 }}>{count.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Top Officers by Correction Rate</div>
                            {data.by_officer?.slice(0,3).map(off => (
                              <div key={off.created_by_id} style={{ display: 'flex', flexDirection: 'column', marginBottom: '12px', fontSize: '13px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                  <span>{off.created_by_id.length > 10 ? off.created_by_id.substring(0,8) + '...' : off.created_by_id}</span>
                                  <span style={{ fontWeight: 600, color: off.correction_rate_pct > 10 ? '#FF3B30' : 'inherit' }}>{off.correction_rate_pct.toFixed(1)}%</span>
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{off.violation_count} cases</div>
                              </div>
                            ))}
                          </div>

                          <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Top Devices by Correction Rate</div>
                            {data.by_device?.slice(0,3).map(dev => (
                              <div key={dev.device_id} style={{ display: 'flex', flexDirection: 'column', marginBottom: '12px', fontSize: '13px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                  <span>Dev {dev.device_id.substring(dev.device_id.length-4)}</span>
                                  <span style={{ fontWeight: 600, color: dev.correction_rate_pct > 10 ? '#FF3B30' : 'inherit' }}>{dev.correction_rate_pct.toFixed(1)}%</span>
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{dev.violation_count} cases</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Data unavailable</div>
                    )
                  ) : (
                    data.slice(0, 10).map((item, i) => (
                      <div 
                        key={i} 
                        onClick={() => handleItemClick(item)}
                        style={{ border: '1px solid #E2E8F0', padding: '16px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: '#fff' }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-blue)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                      >
                        <div style={{ fontWeight: 600, marginBottom: '8px', color: '#1d1d1f' }}>
                          {(!item.name || item.name === 'No Junction') 
                            ? `Unmapped Zone ${(item.lat && item.lng) ? `(${item.lat.toFixed(4)}, ${item.lng.toFixed(4)})` : ((item.id || item.h3_cell || item.seed_cell) ? (item.id || item.h3_cell || item.seed_cell).substring(4, 9).toUpperCase() : '')}`.trim()
                            : `${item.name}${item.name.includes('Sagar Theatre') || item.name.includes('BTP') ? ` [${(item.id || item.h3_cell || item.seed_cell).substring(4, 9).toUpperCase()}]` : ''}`}
                        </div>
                        <div className="mono" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {getSidebarItemDetails(item, activeLayerConf.key)}
                        </div>
                      </div>
                    ))
                  )}
                  {activeLayerConf.key !== 'pipeline_health' && data.length > 10 && <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', marginTop: '12px' }}>+ {data.length - 10} more records plotted on map</div>}
                </div>
              </>
            )}
          </div>
        )}

        {activeLayerConf.tier === 'Designed' && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(248, 250, 252, 0.95)', backdropFilter: 'blur(10px)', zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
            <div style={{ background: '#fff', padding: '48px', borderRadius: '24px', boxShadow: '0 24px 48px rgba(0,0,0,0.05)', maxWidth: '800px', width: '100%' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(79, 140, 247, 0.1)', color: 'var(--accent-blue)', padding: '6px 12px', borderRadius: '8px', fontWeight: 600, fontSize: '14px', marginBottom: '24px' }}>
                <Layers size={16} /> Tier 3: Designed Architecture
              </div>
              
              <h1 style={{ fontSize: '36px', marginBottom: '16px', letterSpacing: '-1px' }}>{activeLayerConf.name}</h1>
              <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '40px' }}>
                This feature represents the third phase of the ClearGrid rollout. It relies on integration with external municipal systems and predictive ML models that are currently in development.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ background: '#F8FAFC', padding: '24px', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', fontWeight: 600 }}>
                    <Server size={20} color="var(--accent-blue)" /> Pending Dependencies
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {activeLayerConf.id === 'predictive' && (
                      <>
                        <li>Validated and Trained Forecasting Model</li>
                        <li>High-Resolution Historical Covariate Dataset</li>
                        <li>Real-time Data Ingestion Pipeline</li>
                      </>
                    )}
                    {activeLayerConf.id === 'impact' && (
                      <>
                        <li>Traffic-Flow Simulation Engine (e.g. SUMO)</li>
                        <li>Network Topology Graphs (OSM)</li>
                        <li>Live Signal Timing Feeds</li>
                      </>
                    )}
                    {activeLayerConf.id === 'civic' && (
                      <>
                        <li>Live Officer GPS Data Streams</li>
                        <li>Integration with Civic Enforcement Backends</li>
                        <li>Citizen App Reporting Webhooks</li>
                      </>
                    )}
                  </ul>
                </div>
                <div style={{ background: '#F8FAFC', padding: '24px', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', fontWeight: 600 }}>
                    <Cpu size={20} color="var(--accent-green)" /> Planned Methodology
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {activeLayerConf.id === 'predictive' && (
                      <>
                        <li>Transformer-based time-series forecasting</li>
                        <li>Spatio-temporal Graph Neural Networks</li>
                        <li>Predictive Heatmap Generation</li>
                      </>
                    )}
                    {activeLayerConf.id === 'impact' && (
                      <>
                        <li>Agent-based microscopic traffic simulation</li>
                        <li>Routing perturbation analysis</li>
                        <li>Congestion bottleneck forecasting</li>
                      </>
                    )}
                    {activeLayerConf.id === 'civic' && (
                      <>
                        <li>Real-time automated webhook alerts</li>
                        <li>Geospatial dispatcher matching algorithms</li>
                        <li>Officer proximity routing</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
