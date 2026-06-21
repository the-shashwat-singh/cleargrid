import pandas as pd
import duckdb
import re
import os

# Ensure processed directory exists
os.makedirs('data/processed', exist_ok=True)

RAW_DATA_PATH = 'data/raw/parking_violations.csv'
DB_PATH = 'data/processed/cleargrid.duckdb'

def clean_vehicle_number(vnum):
    if pd.isna(vnum) or str(vnum).upper() == 'NULL':
        return None, 0.0
    
    # Uppercase and strip whitespaces
    vnum = str(vnum).upper().strip().replace(' ', '')
    
    # Indian Plate regex or Anonymized (FKN0...)
    if re.match(r'^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$', vnum) or vnum.startswith('FKN'):
        return vnum, 1.0
    return vnum, 0.5 # Flag low confidence for malformed plates

def run_cleaning_pipeline():
    print(f"Loading raw data from {RAW_DATA_PATH}...")
    df = pd.read_csv(RAW_DATA_PATH, low_memory=False)
    
    initial_rows = len(df)
    print(f"Initial rows: {initial_rows}")
    
    # Use updated_vehicle_number if available, fallback to vehicle_number
    if 'updated_vehicle_number' in df.columns:
        df['final_vehicle_number'] = df['updated_vehicle_number'].replace('NULL', pd.NA).fillna(df['vehicle_number'])
    else:
        df['final_vehicle_number'] = df['vehicle_number']
        
    if 'updated_vehicle_type' in df.columns:
        df['final_vehicle_type'] = df['updated_vehicle_type'].replace('NULL', pd.NA).fillna(df['vehicle_type'])
    else:
        df['final_vehicle_type'] = df['vehicle_type']

    print("Cleaning vehicle numbers...")
    # Apply cleaning
    cleaned = df['final_vehicle_number'].apply(clean_vehicle_number)
    df['clean_vehicle_number'] = cleaned.apply(lambda x: x[0])
    df['vehicle_number_confidence'] = cleaned.apply(lambda x: x[1])

    print("Parsing datetimes...")
    # Parse datetimes (coercing errors to NaT) and make them tz-naive
    df['created_datetime'] = pd.to_datetime(df['created_datetime'].replace('NULL', pd.NA), errors='coerce', utc=True).dt.tz_localize(None)
    df['closed_datetime'] = pd.to_datetime(df['closed_datetime'].replace('NULL', pd.NA), errors='coerce', utc=True).dt.tz_localize(None)
    df['modified_datetime'] = pd.to_datetime(df['modified_datetime'].replace('NULL', pd.NA), errors='coerce', utc=True).dt.tz_localize(None)
    
    # Fill missing closed_datetime with modified_datetime as a proxy for the hackathon
    df['closed_datetime'] = df['closed_datetime'].fillna(df['modified_datetime'])
    
    # Derive features
    print("Deriving temporal features...")
    df['hour_of_day'] = df['created_datetime'].dt.hour
    df['day_of_week'] = df['created_datetime'].dt.dayofweek
    df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
    
    # Dwell minutes only where closed_datetime exists
    df['dwell_minutes'] = (df['closed_datetime'] - df['created_datetime']).dt.total_seconds() / 60.0

    print("Deduplicating...")
    if 'id' in df.columns:
        df = df.drop_duplicates(subset=['id'])
    
    final_rows = len(df)
    print(f"Final rows after deduplication: {final_rows}")
    print(f"Missing closed_datetime (unresolved/active): {df['closed_datetime'].isna().sum()}")
    print(f"Low confidence vehicle plates: {(df['vehicle_number_confidence'] < 1.0).sum()}")

    # Save to DuckDB
    print(f"Writing to DuckDB at {DB_PATH}...")
    conn = duckdb.connect(DB_PATH)
    conn.execute("CREATE OR REPLACE TABLE violations_clean AS SELECT * FROM df")
    conn.close()
    
    print("Pipeline complete!")

if __name__ == "__main__":
    run_cleaning_pipeline()
