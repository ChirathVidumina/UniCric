import psycopg2

POSTGRES_URL = 'postgresql://unicric_db_user:CbvArPPcXTKtUA9ahsPzMTeR1bKRtfma@dpg-d9ucis15efls739nsgmg-a.oregon-postgres.render.com/unicric_db'

conn = psycopg2.connect(POSTGRES_URL)
c = conn.cursor()

tables = ['teams', 'matches', 'players', 'player_stats']
for t in tables:
    c.execute(f"SELECT count(*) FROM {t};")
    count = c.fetchone()[0]
    print(f"PostgreSQL table '{t}': {count} rows")

conn.close()
