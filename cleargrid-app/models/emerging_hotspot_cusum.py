import duckdb
import pandas as pd
import json
import os

DB_PATH = '../data/processed/cleargrid.duckdb'
OUTPUT_PATH = '../data/processed/cusum_results.json'

def run_cusum_analysis():
    print("Connecting to DuckDB...")
    conn = duckdb.connect(DB_PATH, read_only=True)
    
    print("Running CUSUM (Cumulative Sum) Anomaly Detection on H3 Cells...")
    # Get daily violation counts per H3 cell
    query = """
        SELECT 
            h3_cell, 
            CAST(created_datetime AS DATE) as violation_date,
            COUNT(*) as daily_violations
        FROM violations_clean
        GROUP BY h3_cell, CAST(created_datetime AS DATE)
        ORDER BY h3_cell, violation_date
    """
    df = conn.execute(query).df()
    
    # We will compute a simple CUSUM logic per cell
    results = []
    
    # Filter to cells with at least 30 days of data to have a baseline
    cell_groups = df.groupby('h3_cell')
    
    for cell, group in cell_groups:
        if len(group) < 30:
            continue
            
        # Sort by date
        group = group.sort_values('violation_date')
        
        # Split into baseline (first 80% of days) and recent (last 7 days)
        baseline = group.iloc[:-7]
        recent = group.iloc[-7:]
        
        if len(baseline) == 0 or len(recent) == 0:
            continue
            
        baseline_mean = baseline['daily_violations'].mean()
        baseline_std = baseline['daily_violations'].std()
        
        # If std is 0 or NaN, set to 1 to avoid division by zero
        if pd.isna(baseline_std) or baseline_std == 0:
            baseline_std = 1.0
            
        # CUSUM accumulation
        cusum = 0
        threshold = 3 * baseline_std # 3-sigma threshold
        triggered_date = None
        deviation = 0
        
        for _, row in recent.iterrows():
            val = row['daily_violations']
            # CUSUM formula: S_i = max(0, S_{i-1} + x_i - mean - drift)
            # Drift is typically 0.5 * std
            drift = 0.5 * baseline_std
            cusum = max(0, cusum + val - baseline_mean - drift)
            
            if cusum > threshold:
                triggered_date = str(row['violation_date'])
                deviation = (val - baseline_mean) / baseline_mean * 100 if baseline_mean > 0 else val * 100
                break
                
        if triggered_date:
            results.append({
                "h3_cell": cell,
                "baseline_mean_daily": round(baseline_mean, 1),
                "triggered_date": triggered_date,
                "deviation_percentage": round(deviation, 1),
                "cusum_score": round(cusum, 2)
            })
            
    # Sort by highest deviation
    results = sorted(results, key=lambda x: x['deviation_percentage'], reverse=True)
    
    # We only need the top 10 anomalies for the dashboard
    top_anomalies = results[:10]
    
    print(f"Detected {len(results)} anomalous cells. Saving top {len(top_anomalies)} to JSON.")
    
    with open(OUTPUT_PATH, 'w') as f:
        json.dump({"anomalies": top_anomalies}, f, indent=2)
        
    print(f"Saved to {OUTPUT_PATH}")

if __name__ == "__main__":
    # Ensure run from the models directory or handle paths
    if not os.path.exists('../data'):
        # Maybe run from root
        DB_PATH = 'data/processed/cleargrid.duckdb'
        OUTPUT_PATH = 'data/processed/cusum_results.json'
    run_cusum_analysis()
