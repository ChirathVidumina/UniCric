import psycopg2

POSTGRES_URL = 'postgresql://unicric_db_user:CbvArPPcXTKtUA9ahsPzMTeR1bKRtfma@dpg-d9ucis15efls739nsgmg-a.oregon-postgres.render.com/unicric_db'

batting_lines = [
    "Sathira Vikasitha 48 63 6 0 76.19",
    "Muftee Mysan 33 28 4 1 117.86",
    "Nadeeshan Bandara 28 49 2 0 57.14",
    "Pulitha Sarathchandra 26 70 0 0 37.14",
    "Nahularaja Kathurshan 19 46 3 0 41.30",
    "G P Rashmika 12 46 1 0 26.09",
    "Behan Wickramasinghe 10 16 2 0 62.50",
    "Vijayan Yashwinshan 10 23 1 0 43.48",
    "Devdun Nethusahan 9 25 1 0 36.00",
    "Kevindu Perera 8 9 0 1 88.89",
    "Isuru Kuruneru 5 10 0 0 50.00",
    "Janeesha Hansaka 2 4 0 0 50.00",
    "Maneesha Nilanduwa 2 14 0 0 14.29",
    "Deshan Ekanayake 2 6 0 0 33.33",
    "Sasith Rambukwella 1 2 0 0 50.00",
    "Sahan Arumasinghe 0 3 0 0 0.00",
    "Kavindu Bandara 0 6 0 0 0.00",
    "Lahiru Amarasekara 0 4 0 0 0.00"
]

bowling_lines = [
    "Isuru Kuruneru 6.0 1 24 0 4.00",
    "Muftee Mysan 6.0 1 20 0 3.33",
    "Kelum Hirudika 4.0 0 10 1 2.50",
    "Behan Wickramasinghe 4.0 0 7 2 1.75",
    "Sanithu Wijerathne 8.0 3 15 1 1.88",
    "Kevindu Perera 6.0 1 16 3 2.67",
    "Yasiru Ruwantha 10.0 0 25 1 2.50",
    "Lahiru Amarasekara 8.0 1 20 1 2.50",
    "Nadeeshan Bandara 2.0 0 20 0 10.00",
    "Vijayan Yashwinshan 2.0 0 14 0 7.00",
    "Janeesha Hansaka 1.0 0 9 0 9.00",
    "Deshan Ekanayake 7.0 1 20 2 2.86",
    "Kavindu Bandara 6.3 1 28 3 4.31"
]

print(f"Applying stats update to PostgreSQL DB...")
conn = psycopg2.connect(POSTGRES_URL)
c = conn.cursor()

match_id = 'match_import_scratch_scorecard'

for line in batting_lines:
    parts = line.split()
    sr = float(parts[-1])
    sixes = int(parts[-2])
    fours = int(parts[-3])
    balls = int(parts[-4])
    runs = int(parts[-5])
    name = " ".join(parts[:-5])

    c.execute("""
        UPDATE player_stats 
        SET runs = %s, balls = %s, fours = %s, sixes = %s, strike_rate = %s
        WHERE match_id = %s AND player_name = %s
    """, (runs, balls, fours, sixes, sr, match_id, name))
    
    c.execute("""
        UPDATE players
        SET total_runs = %s, total_balls = %s, total_fours = %s, total_sixes = %s, strike_rate = %s
        WHERE name = %s
    """, (runs, balls, fours, sixes, sr, name))

for line in bowling_lines:
    parts = line.split()
    econ = float(parts[-1])
    wickets = int(parts[-2])
    runs_con = int(parts[-3])
    maidens = int(parts[-4])
    overs = float(parts[-5])
    name = " ".join(parts[:-5])

    c.execute("""
        UPDATE player_stats 
        SET wickets = %s, overs = %s, runs_conceded = %s, economy = %s
        WHERE match_id = %s AND player_name = %s
    """, (wickets, overs, runs_con, econ, match_id, name))
    
    c.execute("""
        UPDATE players
        SET total_wickets = %s, economy_rate = %s
        WHERE name = %s
    """, (wickets, econ, name))

conn.commit()
conn.close()

print("Stats successfully mapped to players.")
