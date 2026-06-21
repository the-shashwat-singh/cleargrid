import pandas as pd
import duckdb
import h3

DB_PATH = 'data/processed/cleargrid.duckdb'

def run_feature_engineering():
    print("Connecting to DuckDB...")
    conn = duckdb.connect(DB_PATH)
    
    # Load clean data
    print("Loading clean violations...")
    df = conn.execute("SELECT * FROM violations_clean").df()
    
    print("Computing H3 cells (Resolution 9)...")
    # Drop rows with invalid coordinates
    df = df.dropna(subset=['latitude', 'longitude'])
    df['h3_cell'] = df.apply(lambda r: h3.latlng_to_cell(r.latitude, r.longitude, 9), axis=1)
    
    print("Building junction_agg table...")
    # Calculate mode for categorical variables
    mode_agg = df.groupby('h3_cell').agg({
        'junction_name': lambda x: x.mode()[0] if not x.mode().empty else "Unknown",
        'final_vehicle_type': lambda x: x.mode()[0] if not x.mode().empty else "Unknown",
        'hour_of_day': lambda x: x.mode()[0] if not x.mode().empty else 0
    }).rename(columns={
        'final_vehicle_type': 'dominant_vehicle_type',
        'hour_of_day': 'dominant_hour'
    })
    
    # Calculate counts and ratios
    count_agg = df.groupby('h3_cell').agg(
        violation_count=('id', 'count'),
        weekend_violations=('is_weekend', 'sum')
    )
    count_agg['weekend_ratio'] = count_agg['weekend_violations'] / count_agg['violation_count']
    
    junction_agg = count_agg.join(mode_agg).reset_index()
    junction_agg['density_rank'] = junction_agg['violation_count'].rank(method='min', ascending=False)
    
    print("Building vehicle_features table...")
    # Filter out low-confidence or missing plates
    vdf = df[df['vehicle_number_confidence'] == 1.0].copy()
    
    v_mode_agg = vdf.groupby('clean_vehicle_number').agg({
        'final_vehicle_type': lambda x: x.mode()[0] if not x.mode().empty else "Unknown",
        'hour_of_day': lambda x: x.mode()[0] if not x.mode().empty else 0
    }).rename(columns={
        'final_vehicle_type': 'dominant_vehicle_type',
        'hour_of_day': 'dominant_hour'
    })
    
    v_count_agg = vdf.groupby('clean_vehicle_number').agg(
        violation_count=('id', 'count'),
        distinct_h3_cells=('h3_cell', 'nunique'),
        weekend_violations=('is_weekend', 'sum')
    )
    v_count_agg['weekend_ratio'] = v_count_agg['weekend_violations'] / v_count_agg['violation_count']
    
    vehicle_features = v_count_agg.join(v_mode_agg).reset_index()
    
    print("Building dwell_distributions table...")
    # Only use resolved violations with valid dwell_minutes
    dwell_df = df.dropna(subset=['dwell_minutes']).copy()
    # Filter out negative or crazy outliers if any (e.g., > 1 month)
    dwell_df = dwell_df[(dwell_df['dwell_minutes'] > 0) & (dwell_df['dwell_minutes'] < 43200)]
    
    def q80(x): return x.quantile(0.80)
    def q95(x): return x.quantile(0.95)
    
    dwell_distributions = dwell_df.groupby(['final_vehicle_type', 'h3_cell', 'hour_of_day']).agg(
        dwell_median=('dwell_minutes', 'median'),
        dwell_p80=('dwell_minutes', q80),
        dwell_p95=('dwell_minutes', q95),
        sample_size=('dwell_minutes', 'count')
    ).reset_index()
    
    # Save back to DuckDB
    print("Saving feature tables to DuckDB...")
    conn.execute("CREATE OR REPLACE TABLE violations_clean AS SELECT * FROM df") # Update with h3_cell
    conn.execute("CREATE OR REPLACE TABLE junction_agg AS SELECT * FROM junction_agg")
    conn.execute("CREATE OR REPLACE TABLE vehicle_features AS SELECT * FROM vehicle_features")
    conn.execute("CREATE OR REPLACE TABLE dwell_distributions AS SELECT * FROM dwell_distributions")
    
    conn.close()
    print("Feature engineering complete!")

if __name__ == "__main__":
    run_feature_engineering()
