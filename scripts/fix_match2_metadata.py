import psycopg2

POSTGRES_URL = 'postgresql://unicric_db_user:CbvArPPcXTKtUA9ahsPzMTeR1bKRtfma@dpg-d9ucis15efls739nsgmg-a.oregon-postgres.render.com/unicric_db'

print("Connecting to PostgreSQL to fix Match 2 metadata...")
try:
    conn = psycopg2.connect(POSTGRES_URL)
    c = conn.cursor()
    
    # Update match metadata for the injected PDF scorecard
    c.execute("""
        UPDATE matches 
        SET title = 'Peradeniya University vs Moratuwa University',
            date_label = '2026-08-01',
            venue = 'University Of Moratuwa Ground, Moratuwa',
            score_summary = 'PER 114/10 (46.0) - MOR 115/5 (24.3)',
            result = 'Moratuwa University won by 5 wickets'
        WHERE id = 'match_import_scratch_scorecard'
    """)
    
    conn.commit()
    conn.close()
    print("Successfully updated Match 2 metadata in PostgreSQL.")
except Exception as e:
    print(f"Error: {e}")
