from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import duckdb
import h3
import pandas as pd
import json
import os
import numpy as np
import requests
from sklearn.cluster import KMeans
from math import radians, cos, sin, asin, sqrt

app = FastAPI(title="ClearGrid API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = 'data/processed/cleargrid.duckdb'

def get_db():
    return duckdb.connect(DB_PATH, read_only=True)

def haversine(lon1, lat1, lon2, lat2):
    """Calculate the great circle distance in kilometers between two points on the earth."""
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    r = 6371 # Radius of earth in kilometers.
    return c * r

@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.get("/api/hotspots")
def get_hotspots(limit: int = 100):
    """Returns the top hotspot locations based on violation density."""
    conn = get_db()
    try:
        query = f"""
            SELECT h3_cell, violation_count, density_rank, junction_name, dominant_vehicle_type
            FROM junction_agg
            ORDER BY density_rank ASC
            LIMIT {int(limit)}
        """
        df = conn.execute(query).df()
        
        results = []
        for _, row in df.iterrows():
            lat, lng = h3.cell_to_latlng(row['h3_cell'])
            results.append({
                "id": row['h3_cell'],
                "lat": lat,
                "lng": lng,
                "violation_count": int(row['violation_count']),
                "rank": int(row['density_rank']),
                "name": str(row['junction_name']),
                "dominant_vehicle": str(row['dominant_vehicle_type'])
            })
        return {"hotspots": results}
    finally:
        conn.close()

@app.get("/api/chokepoints")
def get_chokepoints(limit: int = 50):
    """Returns scored chokepoints based on network topology."""
    conn = get_db()
    try:
        # Check if table exists
        tables = conn.execute("SHOW TABLES").df()
        if 'chokepoint_scores' not in tables['name'].values:
            return {"chokepoints": [], "message": "Chokepoint model hasn't been run yet."}
            
        query = f"""
            SELECT h3_cell, violation_count, junction_name, alt_routes_estimate, chokepoint_score
            FROM chokepoint_scores
            ORDER BY chokepoint_score DESC
            LIMIT {int(limit)}
        """
        df = conn.execute(query).df()
        
        results = []
        for _, row in df.iterrows():
            lat, lng = h3.cell_to_latlng(row['h3_cell'])
            results.append({
                "id": row['h3_cell'],
                "lat": lat,
                "lng": lng,
                "violation_count": int(row['violation_count']),
                "name": str(row['junction_name']),
                "alt_routes": float(row['alt_routes_estimate']),
                "score": float(row['chokepoint_score'])
            })
        return {"chokepoints": results}
    finally:
        conn.close()

@app.get("/api/vehicle/{vehicle_number}")
def get_vehicle(vehicle_number: str):
    """Returns fingerprinting features for a specific vehicle."""
    conn = get_db()
    try:
        vnum = vehicle_number.upper().strip().replace(' ', '')
        query = f"""
            SELECT * FROM vehicle_features
            WHERE clean_vehicle_number = '{vnum}'
        """
        df = conn.execute(query).df()
        
        if df.empty:
            raise HTTPException(status_code=404, detail="Vehicle not found in database")
            
        row = df.iloc[0]
        return {
            "vehicle_number": row['clean_vehicle_number'],
            "violation_count": int(row['violation_count']),
            "distinct_locations": int(row['distinct_h3_cells']),
            "weekend_ratio": float(row['weekend_ratio']),
            "dominant_type": str(row['dominant_vehicle_type']),
            "dominant_hour": int(row['dominant_hour'])
        }
    finally:
        conn.close()

@app.get("/api/dwell-time")
def get_dwell_time(limit: int = 100):
    """Returns average dwell times per hotspot."""
    conn = get_db()
    try:
        query = f"""
            SELECT h3_cell, median(dwell_minutes) as median_dwell, max(junction_name) as junction_name
            FROM violations_clean
            WHERE dwell_minutes IS NOT NULL AND dwell_minutes > 0 AND dwell_minutes < 43200
              AND junction_name IS NOT NULL AND junction_name != 'No Junction' AND junction_name != ''
            GROUP BY h3_cell
            ORDER BY median_dwell DESC
            LIMIT {int(limit)}
        """
        df = conn.execute(query).df()
        results = []
        for _, row in df.iterrows():
            lat, lng = h3.cell_to_latlng(row['h3_cell'])
            results.append({
                "id": row['h3_cell'],
                "lat": lat,
                "lng": lng,
                "name": str(row['junction_name']),
                "dwell_minutes": float(row['median_dwell'])
            })
        return {"dwell_times": results}
    finally:
        conn.close()


@app.get("/api/repeat-offenders")
def get_repeat_offenders(min_violations: int = 3, limit: int = 50):
    """Returns habitual offenders and habitual spot offenders."""
    conn = get_db()
    try:
        query = f"""
        WITH vehicle_stats AS (
            SELECT 
                NULLIF(COALESCE(NULLIF(updated_vehicle_number, 'NULL'), NULLIF(vehicle_number, 'NULL')), 'NULL') as v_num,
                COUNT(*) as total_violations,
                MIN(created_datetime) as first_seen,
                MAX(created_datetime) as last_seen,
                MODE(NULLIF(COALESCE(NULLIF(updated_vehicle_type, 'NULL'), NULLIF(vehicle_type, 'NULL')), 'NULL')) as dominant_type
            FROM violations_clean
            WHERE NULLIF(COALESCE(NULLIF(updated_vehicle_number, 'NULL'), NULLIF(vehicle_number, 'NULL')), 'NULL') IS NOT NULL
            GROUP BY 1
            HAVING COUNT(*) >= {int(min_violations)}
        ),
        spot_stats AS (
            SELECT 
                NULLIF(COALESCE(NULLIF(updated_vehicle_number, 'NULL'), NULLIF(vehicle_number, 'NULL')), 'NULL') as v_num,
                h3_cell,
                COUNT(*) as spot_violations,
                MAX(latitude) as lat,
                MAX(longitude) as lng,
                MAX(junction_name) as junction_name
            FROM violations_clean
            WHERE NULLIF(COALESCE(NULLIF(updated_vehicle_number, 'NULL'), NULLIF(vehicle_number, 'NULL')), 'NULL') IS NOT NULL
            GROUP BY 1, 2
        ),
        ranked_spots AS (
            SELECT v_num, h3_cell, junction_name, spot_violations, lat, lng,
                   ROW_NUMBER() OVER (PARTITION BY v_num ORDER BY spot_violations DESC) as rn
            FROM spot_stats
        )
        SELECT 
            v.v_num as vehicle_number,
            v.dominant_type as vehicle_type,
            v.total_violations as violation_count,
            v.first_seen,
            v.last_seen,
            s.h3_cell,
            s.junction_name as top_location,
            s.spot_violations as top_location_count,
            s.lat,
            s.lng,
            CASE WHEN s.spot_violations >= 3 THEN true ELSE false END as is_habitual_spot_offender
        FROM vehicle_stats v
        JOIN ranked_spots s ON v.v_num = s.v_num AND s.rn = 1
        ORDER BY v.total_violations DESC
        LIMIT {int(limit)}
        """
        df = conn.execute(query).df()

        results = []
        for _, row in df.iterrows():
            results.append({
                "id": str(row['h3_cell']), # For mapping clicks if needed
                "vehicle_number": str(row['vehicle_number']),
                "vehicle_type": str(row['vehicle_type']),
                "violation_count": int(row['violation_count']),
                "first_seen": str(row['first_seen'])[:10] if pd.notnull(row['first_seen']) else None,
                "last_seen": str(row['last_seen'])[:10] if pd.notnull(row['last_seen']) else None,
                "name": str(row['top_location']),
                "top_location_count": int(row['top_location_count']),
                "lat": float(row['lat']) if pd.notnull(row['lat']) else None,
                "lng": float(row['lng']) if pd.notnull(row['lng']) else None,
                "is_habitual_spot_offender": bool(row['is_habitual_spot_offender'])
            })
            
        return {
            "tier": "live",
            "total_repeat_offenders": len(results),
            "repeat_offenders": results
        }
    finally:
        conn.close()

@app.get("/api/coverage-gaps")
def get_coverage_gaps():
    """Returns areas with low distinct logging devices relative to violation volume."""
    conn = get_db()
    try:
        query = """
        WITH cell_stats AS (
            SELECT 
                h3_cell,
                CAST(EXTRACT(HOUR FROM TRY_CAST(NULLIF(CAST(created_datetime AS VARCHAR), 'NULL') AS TIMESTAMP)) / 8 AS INTEGER) as shift_id,
                COUNT(*) as violation_count,
                COUNT(DISTINCT device_id) as distinct_device_count,
                COUNT(DISTINCT created_by_id) as distinct_officer_count,
                COUNT(DISTINCT device_id) * 1.0 / NULLIF(COUNT(*), 0) as coverage_ratio,
                MAX(latitude) as lat,
                MAX(longitude) as lng,
                MAX(junction_name) as junction_name
            FROM violations_clean
            WHERE NULLIF(h3_cell, 'NULL') IS NOT NULL
            GROUP BY 1, 2
        ),
        percentiles AS (
            SELECT 
                percentile_cont(0.25) WITHIN GROUP (ORDER BY coverage_ratio) as p25,
                median(violation_count) as med_violations
            FROM cell_stats
        )
        SELECT 
            m.h3_cell,
            m.junction_name,
            m.shift_id,
            m.violation_count,
            m.distinct_device_count,
            m.distinct_officer_count,
            m.coverage_ratio,
            m.lat,
            m.lng,
            true as gap_flag
        FROM cell_stats m
        CROSS JOIN percentiles p
        WHERE m.coverage_ratio <= p.p25 
          AND m.violation_count >= p.med_violations
          AND m.junction_name IS NOT NULL 
          AND m.junction_name != 'No Junction' 
          AND m.junction_name != ''
        ORDER BY m.coverage_ratio ASC
        LIMIT 200
        """
        df = conn.execute(query).df()
        
        results = []
        for _, row in df.iterrows():
            sid = int(row['shift_id']) if pd.notnull(row['shift_id']) else 0
            time_bucket = f"{sid*8:02d}:00-{(sid*8+8)%24:02d}:00"
            lat = float(row['lat']) if pd.notnull(row['lat']) else None
            lng = float(row['lng']) if pd.notnull(row['lng']) else None
            if pd.isnull(lat) or pd.isnull(lng):
                lat, lng = h3.cell_to_latlng(row['h3_cell'])
                
            results.append({
                "id": str(row['h3_cell']),
                "h3_cell": str(row['h3_cell']),
                "name": str(row['junction_name']),
                "time_bucket": time_bucket,
                "violation_count": int(row['violation_count']),
                "distinct_device_count": int(row['distinct_device_count']),
                "distinct_officer_count": int(row['distinct_officer_count']),
                "coverage_ratio": float(row['coverage_ratio']),
                "gap_flag": bool(row['gap_flag']),
                "lat": lat,
                "lng": lng
            })
            
        return {
            "tier": "live",
            "caveat": "Coverage ratio reflects distinct logging-device diversity per cell, not verified patrol presence.",
            "coverage_gaps": results
        }
    finally:
        conn.close()

@app.get("/api/pipeline-health")
def get_pipeline_health():
    """Returns enforcement pipeline health metrics and SCITA integration status."""
    conn = get_db()
    try:
        q_corr = """
        SELECT 
            SUM(CASE WHEN NULLIF(updated_vehicle_number, 'NULL') != NULLIF(vehicle_number, 'NULL') OR NULLIF(updated_vehicle_type, 'NULL') != NULLIF(vehicle_type, 'NULL') THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0) as correction_rate_pct
        FROM violations_clean
        WHERE NULLIF(validation_status, 'NULL') IS NOT NULL
        """
        correction_rate_pct = conn.execute(q_corr).fetchone()[0] or 0.0
        
        q_val = """
        SELECT NULLIF(validation_status, 'NULL') as status, COUNT(*) as count
        FROM violations_clean
        WHERE NULLIF(validation_status, 'NULL') IS NOT NULL
        GROUP BY 1
        """
        val_df = conn.execute(q_val).df()
        validation_status_breakdown = {str(row['status']): int(row['count']) for _, row in val_df.iterrows() if pd.notnull(row['status'])}
        
        q_scita = """
        SELECT data_sent_to_scita, COUNT(*) as count
        FROM violations_clean
        WHERE data_sent_to_scita IS NOT NULL
        GROUP BY 1
        """
        scita_df = conn.execute(q_scita).df()
        scita_split = {str(row['data_sent_to_scita']): int(row['count']) for _, row in scita_df.iterrows()}
        
        q_lat = """
        SELECT median(EXTRACT(EPOCH FROM (TRY_CAST(NULLIF(CAST(data_sent_to_scita_timestamp AS VARCHAR), 'NULL') AS TIMESTAMP) - TRY_CAST(NULLIF(CAST(created_datetime AS VARCHAR), 'NULL') AS TIMESTAMP)))/60) as median_mins
        FROM violations_clean
        WHERE TRY_CAST(NULLIF(CAST(data_sent_to_scita_timestamp AS VARCHAR), 'NULL') AS TIMESTAMP) IS NOT NULL
        """
        time_to_scita_median_minutes = conn.execute(q_lat).fetchone()[0]
        
        q_dev = """
        SELECT 
            device_id, 
            COUNT(*) as total_reviewed,
            SUM(CASE WHEN NULLIF(updated_vehicle_number, 'NULL') != NULLIF(vehicle_number, 'NULL') OR NULLIF(updated_vehicle_type, 'NULL') != NULLIF(vehicle_type, 'NULL') THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0) as correction_rate_pct
        FROM violations_clean
        WHERE NULLIF(validation_status, 'NULL') IS NOT NULL AND NULLIF(device_id, 'NULL') IS NOT NULL
        GROUP BY 1
        HAVING COUNT(*) >= 30
        ORDER BY correction_rate_pct DESC
        LIMIT 10
        """
        dev_df = conn.execute(q_dev).df()
        by_device = [
            {"device_id": str(row['device_id']), "violation_count": int(row['total_reviewed']), "correction_rate_pct": float(row['correction_rate_pct'])}
            for _, row in dev_df.iterrows()
        ]
        
        q_off = """
        SELECT 
            created_by_id, 
            COUNT(*) as total_reviewed,
            SUM(CASE WHEN NULLIF(updated_vehicle_number, 'NULL') != NULLIF(vehicle_number, 'NULL') OR NULLIF(updated_vehicle_type, 'NULL') != NULLIF(vehicle_type, 'NULL') THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0) as correction_rate_pct
        FROM violations_clean
        WHERE NULLIF(validation_status, 'NULL') IS NOT NULL AND NULLIF(created_by_id, 'NULL') IS NOT NULL
        GROUP BY 1
        HAVING COUNT(*) >= 30
        ORDER BY correction_rate_pct DESC
        LIMIT 10
        """
        off_df = conn.execute(q_off).df()
        by_officer = [
            {"created_by_id": str(row['created_by_id']), "violation_count": int(row['total_reviewed']), "correction_rate_pct": float(row['correction_rate_pct'])}
            for _, row in off_df.iterrows()
        ]

        return {
            "tier": "live",
            "correction_rate_pct": float(correction_rate_pct),
            "validation_status_breakdown": validation_status_breakdown,
            "scita_split": scita_split,
            "time_to_scita_median_minutes": float(time_to_scita_median_minutes) if time_to_scita_median_minutes is not None else None,
            "by_device": by_device,
            "by_officer": by_officer
        }
    finally:
        conn.close()


@app.get("/api/anomaly-detection")
def get_anomaly_detection():
    """Returns the pre-computed CUSUM anomaly detection results."""
    try:
        with open('data/processed/cusum_results.json', 'r') as f:
            data = json.load(f)
            # Fetch coordinates for each h3_cell to render on map if needed
            for anomaly in data.get('anomalies', []):
                lat, lng = h3.cell_to_latlng(anomaly['h3_cell'])
                anomaly['lat'] = lat
                anomaly['lng'] = lng
            return data
    except Exception as e:
        return {"anomalies": [], "message": f"Results not generated yet: {e}"}

@app.get("/api/cascade-prediction")
def get_cascade_prediction():
    """Returns the pre-computed cascade detection results."""
    try:
        with open('data/processed/cascade_results.json', 'r') as f:
            data = json.load(f)
            # Add coordinates for seeds and followers
            for cascade in data.get('cascades', []):
                s_lat, s_lng = h3.cell_to_latlng(cascade['seed_cell'])
                f_lat, f_lng = h3.cell_to_latlng(cascade['follower_cell'])
                cascade['seed_lat'] = s_lat
                cascade['seed_lng'] = s_lng
                cascade['follower_lat'] = f_lat
                cascade['follower_lng'] = f_lng
            return data
    except Exception as e:
        return {"cascades": [], "message": f"Results not generated yet: {e}"}


_ROUTE_CACHE = None

@app.get("/api/optimal-routes")
def get_optimal_routes(num_vehicles: int = 3, limit: int = 40):
    """Calculates optimal patrol routes using KMeans and Nearest Neighbor."""
    global _ROUTE_CACHE
    if _ROUTE_CACHE is not None:
        return _ROUTE_CACHE
    conn = get_db()
    try:
        # Fetch top hotspots
        query = f"""
            SELECT h3_cell, violation_count, junction_name
            FROM junction_agg
            ORDER BY density_rank ASC
            LIMIT {int(limit)}
        """
        df = conn.execute(query).df()
        
        if df.empty:
            return {"routes": []}
            
        # Get lat/lng
        coords = []
        hotspots = []
        for _, row in df.iterrows():
            lat, lng = h3.cell_to_latlng(row['h3_cell'])
            coords.append([lat, lng])
            hotspots.append({
                "id": row['h3_cell'],
                "lat": lat,
                "lng": lng,
                "violation_count": int(row['violation_count']),
                "name": str(row['junction_name'])
            })
            
        if len(hotspots) < num_vehicles:
            num_vehicles = len(hotspots)
            
        # Cluster
        kmeans = KMeans(n_clusters=num_vehicles, random_state=42, n_init='auto')
        labels = kmeans.fit_predict(coords)
        
        # Build routes
        routes = []
        route_colors = ['#0A84FF', '#FF3B30', '#34C759', '#FF9500', '#AF52DE']
        
        for i in range(num_vehicles):
            cluster_points = [hotspots[j] for j in range(len(hotspots)) if labels[j] == i]
            
            if not cluster_points:
                continue
                
            # Nearest neighbor sorting
            unvisited = cluster_points.copy()
            current = unvisited.pop(0)
            ordered_path = [current]
            
            while unvisited:
                closest_idx = 0
                min_dist = float('inf')
                for idx, point in enumerate(unvisited):
                    dist = haversine(current['lng'], current['lat'], point['lng'], point['lat'])
                    if dist < min_dist:
                        min_dist = dist
                        closest_idx = idx
                
                current = unvisited.pop(closest_idx)
                ordered_path.append(current)
                
            # Fetch OSRM Road Geometry
            route_geometry = []
            if len(ordered_path) > 1:
                try:
                    coords_str = ";".join([f"{p['lng']},{p['lat']}" for p in ordered_path])
                    osrm_url = f"https://router.project-osrm.org/route/v1/driving/{coords_str}?overview=full&geometries=geojson"
                    res = requests.get(osrm_url, timeout=5)
                    if res.status_code == 200:
                        osrm_data = res.json()
                        if osrm_data.get("code") == "Ok" and len(osrm_data.get("routes", [])) > 0:
                            # Extract coordinates [lng, lat]
                            route_geometry = osrm_data["routes"][0]["geometry"]["coordinates"]
                except Exception as e:
                    print(f"OSRM Error: {e}")
                    
            if not route_geometry:
                # Fallback to straight lines if OSRM fails
                route_geometry = [[p['lng'], p['lat']] for p in ordered_path]
                
            routes.append({
                "route_id": f"Patrol-{i+1}",
                "color": route_colors[i % len(route_colors)],
                "waypoints": ordered_path,
                "route_geometry": route_geometry
            })
            
        _ROUTE_CACHE = {"routes": routes}
        return _ROUTE_CACHE
    finally:
        conn.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
