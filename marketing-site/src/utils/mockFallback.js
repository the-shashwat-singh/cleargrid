export const getMockData = (endpoint) => {
  const baseData = [
    { lat: 12.9716, lng: 77.5946, violation_count: 6500, score: 88, avg_dwell_minutes: 45 },
    { lat: 12.9850, lng: 77.6050, violation_count: 4200, score: 75, avg_dwell_minutes: 30 },
    { lat: 12.9600, lng: 77.5800, violation_count: 1500, score: 45, avg_dwell_minutes: 15 },
    { lat: 12.9650, lng: 77.6100, violation_count: 8200, score: 95, avg_dwell_minutes: 60 },
    { lat: 12.9900, lng: 77.5800, violation_count: 3100, score: 60, avg_dwell_minutes: 25 },
  ];

  if (endpoint.includes('hotspots')) return { hotspots: baseData };
  if (endpoint.includes('optimal-routes')) {
    return {
      routes: [
        {
          id: 1,
          hotspots: baseData.slice(0, 3),
          violation_count: 12200,
          geometry: "y}onA_{wxM?@yA{AoAsAi@o@a@i@a@g@e@a@c@_@a@c@_@a@_@a@_@c@_@e@a@c@_@a@c@_@"
        }
      ]
    };
  }
  if (endpoint.includes('chokepoints')) return { chokepoints: baseData };
  if (endpoint.includes('dwell-time')) return { dwell_times: baseData };
  if (endpoint.includes('repeat-offenders')) return { repeat_offenders: baseData };
  if (endpoint.includes('coverage-gaps')) return { coverage_gaps: baseData };
  if (endpoint.includes('pipeline-health')) {
    return [
      { name: 'Edge Devices Status', value: 'Healthy', type: 'system', status: 'online' },
      { name: 'SCITA Integration', value: 'Syncing', type: 'system', status: 'syncing' },
      { name: 'Global Correction Rate', value: '3.4%', type: 'system', status: 'online' },
      { name: 'DuckDB Ingestion', value: 'Live', type: 'system', status: 'online' }
    ];
  }

  return { hotspots: baseData };
};
