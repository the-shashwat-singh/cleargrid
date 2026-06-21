import duckdb
import osmnx as ox
import networkx as nx
import pandas as pd
import h3

DB_PATH = 'data/processed/cleargrid.duckdb'

def run_chokepoint_scoring():
    print("Connecting to DuckDB...")
    conn = duckdb.connect(DB_PATH)
    
    print("Fetching top hotspots...")
    # Get top 50 hotspots by density rank
    hotspots = conn.execute("""
        SELECT h3_cell, violation_count, density_rank, junction_name
        FROM junction_agg
        WHERE violation_count > 10
        ORDER BY density_rank ASC
        LIMIT 50
    """).df()
    
    if hotspots.empty:
        print("No hotspots found to score. Skipping.")
        return

    # Convert H3 to lat/lng
    hotspots['lat'] = hotspots['h3_cell'].apply(lambda c: h3.cell_to_latlng(c)[0])
    hotspots['lng'] = hotspots['h3_cell'].apply(lambda c: h3.cell_to_latlng(c)[1])
    
    print(f"Scoring {len(hotspots)} hotspots using OSMnx network topology...")
    
    # Pre-download the graph for Bengaluru to avoid pulling it 50 times
    # Using a bounding box or place query
    print("Downloading OSM road network for Bengaluru...")
    try:
        # We download the drive network for Bengaluru
        # This might take a minute but it's much faster than per-node querying
        G = ox.graph_from_place('Bengaluru, India', network_type='drive')
        
        print("Computing edge betweenness centrality (approximate for speed)...")
        # Compute centrality on the largest weakly connected component
        G_lg = max(nx.weakly_connected_components(G), key=len)
        G_sub = G.subgraph(G_lg)
        
        # We use node degree and betweenness
        edge_betweenness = nx.edge_betweenness_centrality(nx.Graph(G_sub), k=min(100, len(G_sub.nodes)))
        
        # Map (u, v) to (u, v, 0) since OSMnx uses MultiDiGraph with a key
        multi_edge_betweenness = {}
        for (u, v), val in edge_betweenness.items():
            multi_edge_betweenness[(u, v, 0)] = val
            
        nx.set_edge_attributes(G, multi_edge_betweenness, 'betweenness')
        
    except Exception as e:
        print(f"Warning: Could not fetch graph for Bengaluru: {e}")
        G = None

    scores = []
    
    for _, row in hotspots.iterrows():
        lat, lng = row['lat'], row['lng']
        
        score_dict = {
            'h3_cell': row['h3_cell'],
            'violation_count': row['violation_count'],
            'junction_name': row['junction_name'],
            'alt_routes_estimate': 1,
            'chokepoint_score': 0.0
        }
        
        if G is not None:
            try:
                # Find nearest edge
                nearest_edge = ox.distance.nearest_edges(G, X=lng, Y=lat)
                u, v, key = nearest_edge
                
                # Get degree
                degree_u = G.degree[u]
                degree_v = G.degree[v]
                avg_degree = (degree_u + degree_v) / 2.0
                
                # Estimate alternatives based on degree (proxy)
                # If degree is 2, it's a straight road (no alternatives). If >3, it's an intersection.
                alts = max(1, avg_degree - 1)
                
                # Get betweenness from the edge
                edge_data = G.get_edge_data(u, v, key)
                b_cent = edge_data.get('betweenness', 0.001)
                
                # Chokepoint formula: high betweenness (many people use it) / high alternatives
                score = (row['violation_count'] * b_cent) / alts
                
                score_dict['alt_routes_estimate'] = round(alts, 1)
                score_dict['chokepoint_score'] = score
            except Exception as e:
                pass
                
        scores.append(score_dict)
    
    scores_df = pd.DataFrame(scores)
    # Normalize score 0-100
    if not scores_df.empty and scores_df['chokepoint_score'].max() > 0:
        max_s = scores_df['chokepoint_score'].max()
        scores_df['chokepoint_score'] = (scores_df['chokepoint_score'] / max_s) * 100.0
        
    print("Saving chokepoint_scores to DuckDB...")
    conn.execute("CREATE OR REPLACE TABLE chokepoint_scores AS SELECT * FROM scores_df")
    
    conn.close()
    print("Chokepoint scoring complete!")

if __name__ == "__main__":
    run_chokepoint_scoring()
