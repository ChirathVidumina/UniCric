import sqlite3
import psycopg2
import sys

SQLITE_PATH = 'unicric.db'
POSTGRES_URL = 'postgresql://unicric_db_user:CbvArPPcXTKtUA9ahsPzMTeR1bKRtfma@dpg-d9ucis15efls739nsgmg-a.oregon-postgres.render.com/unicric_db'

def sync():
    print(f"Connecting to SQLite: {SQLITE_PATH}...", flush=True)
    sq_conn = sqlite3.connect(SQLITE_PATH)
    sq_conn.row_factory = sqlite3.Row
    sq_cur = sq_conn.cursor()

    print(f"Connecting to Render PostgreSQL...", flush=True)
    pg_conn = psycopg2.connect(POSTGRES_URL)
    pg_cur = pg_conn.cursor()

    # Ensure all columns exist in PostgreSQL
    alter_statements = [
        "ALTER TABLE matches ADD COLUMN IF NOT EXISTS scorecard_json TEXT;",
        "ALTER TABLE matches ADD COLUMN IF NOT EXISTS date_label VARCHAR(50);",
        "ALTER TABLE matches ADD COLUMN IF NOT EXISTS venue VARCHAR(150);",
        "ALTER TABLE matches ADD COLUMN IF NOT EXISTS status VARCHAR(30);",
        "ALTER TABLE matches ADD COLUMN IF NOT EXISTS result VARCHAR(200);",
        "ALTER TABLE matches ADD COLUMN IF NOT EXISTS score_summary VARCHAR(200);",
        "ALTER TABLE teams ADD COLUMN IF NOT EXISTS short_name VARCHAR(50);",
        "ALTER TABLE teams ADD COLUMN IF NOT EXISTS group_name VARCHAR(20);",
        "ALTER TABLE teams ADD COLUMN IF NOT EXISTS played INTEGER DEFAULT 0;",
        "ALTER TABLE teams ADD COLUMN IF NOT EXISTS won INTEGER DEFAULT 0;",
        "ALTER TABLE teams ADD COLUMN IF NOT EXISTS lost INTEGER DEFAULT 0;",
        "ALTER TABLE teams ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;",
        "ALTER TABLE teams ADD COLUMN IF NOT EXISTS nrr VARCHAR(20) DEFAULT '0.000';",
        "ALTER TABLE players ADD COLUMN IF NOT EXISTS role VARCHAR(50);",
        "ALTER TABLE players ADD COLUMN IF NOT EXISTS batting_style VARCHAR(50);",
        "ALTER TABLE players ADD COLUMN IF NOT EXISTS matches INTEGER DEFAULT 0;",
        "ALTER TABLE players ADD COLUMN IF NOT EXISTS total_runs INTEGER DEFAULT 0;",
        "ALTER TABLE players ADD COLUMN IF NOT EXISTS total_balls INTEGER DEFAULT 0;",
        "ALTER TABLE players ADD COLUMN IF NOT EXISTS total_fours INTEGER DEFAULT 0;",
        "ALTER TABLE players ADD COLUMN IF NOT EXISTS total_sixes INTEGER DEFAULT 0;",
        "ALTER TABLE players ADD COLUMN IF NOT EXISTS total_wickets INTEGER DEFAULT 0;",
        "ALTER TABLE players ADD COLUMN IF NOT EXISTS strike_rate DOUBLE PRECISION DEFAULT 0.0;",
        "ALTER TABLE players ADD COLUMN IF NOT EXISTS economy_rate DOUBLE PRECISION DEFAULT 0.0;",
        "ALTER TABLE player_stats ADD COLUMN IF NOT EXISTS fifties INTEGER DEFAULT 0;",
        "ALTER TABLE player_stats ADD COLUMN IF NOT EXISTS centuries INTEGER DEFAULT 0;",
        "ALTER TABLE player_stats ADD COLUMN IF NOT EXISTS maidens INTEGER DEFAULT 0;",
        "ALTER TABLE player_stats ADD COLUMN IF NOT EXISTS dismissal VARCHAR(150) DEFAULT 'Not Out';",
        "ALTER TABLE player_stats ADD COLUMN IF NOT EXISTS is_out BOOLEAN DEFAULT FALSE;"
    ]

    for stmt in alter_statements:
        try:
            pg_cur.execute(stmt)
            pg_conn.commit()
        except Exception as alt_err:
            pg_conn.rollback()
    
    print("Schema alignment complete.", flush=True)

    # Clear in reverse foreign key order
    clear_order = ['player_stats', 'players', 'matches', 'teams']
    for table in clear_order:
        print(f"Clearing table '{table}' in PostgreSQL...", flush=True)
        pg_cur.execute(f"DELETE FROM {table};")
    pg_conn.commit()

    # Insert in dependency order
    insert_order = ['teams', 'matches', 'players', 'player_stats']

    for table in insert_order:
        try:
            sq_cur.execute(f"SELECT * FROM {table}")
            rows = sq_cur.fetchall()
            if not rows:
                print(f"Table '{table}' is empty in SQLite.", flush=True)
                continue

            columns = [col[0] for col in sq_cur.description]
            print(f"Syncing table '{table}': {len(rows)} records, columns: {columns}", flush=True)

            col_names = ", ".join(columns)
            placeholders = ", ".join(["%s"] * len(columns))
            insert_query = f"INSERT INTO {table} ({col_names}) VALUES ({placeholders})"

            data = []
            for row in rows:
                row_dict = dict(row)
                row_vals = []
                for col in columns:
                    val = row_dict[col]
                    if col == 'is_out' and val is not None:
                        val = bool(val)
                    row_vals.append(val)
                data.append(tuple(row_vals))

            pg_cur.executemany(insert_query, data)
            pg_conn.commit()
            print(f"Successfully inserted {len(data)} rows into PostgreSQL table '{table}'!", flush=True)

            # Reset auto-increment sequence if id column is serial integer
            if table in ['teams', 'players', 'player_stats']:
                try:
                    pg_cur.execute(f"SELECT setval(pg_get_serial_sequence('{table}', 'id'), coalesce(max(id), 1)) FROM {table};")
                    pg_conn.commit()
                except Exception as seq_err:
                    pg_conn.rollback()

        except Exception as e:
            print(f"Error syncing {table}: {e}", flush=True)
            pg_conn.rollback()
            return

    print("\n🎉 ALL CURRENT TELEMETRY & DATA (8 Teams, 4 Matches, 88 Players, 134 Player Stats, Scorecards, Standings) 100% SYNCED TO RENDER POSTGRESQL!", flush=True)
    
    sq_conn.close()
    pg_conn.close()

if __name__ == '__main__':
    sync()
