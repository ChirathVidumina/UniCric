import json
import psycopg2
import os

PAYLOAD = {
  "match_metadata": {
    "team_a": "Peradeniya",
    "team_b": "Moratuwa",
    "winner": "Moratuwa",
    "points_awarded": {"Moratuwa": 2, "Peradeniya": 0}
  },
  "captains": {
    "Peradeniya": "Nadeeshan Bandara",
    "Moratuwa": "Behan Wickramasinghe"
  },
  "players": [
    {"team": "Peradeniya", "name": "Nadeeshan Bandara", "is_captain": True, "role": "All-Rounder"},
    {"team": "Peradeniya", "name": "Sahan Arumasinghe", "is_captain": False, "role": "Batter"},
    {"team": "Peradeniya", "name": "Maneesha Nilanduwa", "is_captain": False, "role": "Batter"},
    {"team": "Peradeniya", "name": "Pulitha Sarathchandra", "is_captain": False, "role": "Batter"},
    {"team": "Peradeniya", "name": "G P Rashmika", "is_captain": False, "role": "Batter"},
    {"team": "Peradeniya", "name": "Janeesha Hansaka", "is_captain": False, "role": "All-Rounder"},
    {"team": "Peradeniya", "name": "Nahularaja Kathurshan", "is_captain": False, "role": "Wicket Keeper"},
    {"team": "Peradeniya", "name": "Vijayan Yashwinshan", "is_captain": False, "role": "All-Rounder"},
    {"team": "Peradeniya", "name": "Isuru Kuruneru", "is_captain": False, "role": "Bowler"},
    {"team": "Peradeniya", "name": "Deshan Ekanayake", "is_captain": False, "role": "Bowler"},
    {"team": "Peradeniya", "name": "Kavindu Bandara", "is_captain": False, "role": "Bowler"},
    {"team": "Moratuwa", "name": "Sathira Vikasitha", "is_captain": False, "role": "Batter"},
    {"team": "Moratuwa", "name": "Devdun Nethusahan", "is_captain": False, "role": "Batter"},
    {"team": "Moratuwa", "name": "Muftee Mysan", "is_captain": False, "role": "All-Rounder"},
    {"team": "Moratuwa", "name": "Lahiru Amarasekara", "is_captain": False, "role": "All-Rounder"},
    {"team": "Moratuwa", "name": "Behan Wickramasinghe", "is_captain": True, "role": "All-Rounder"},
    {"team": "Moratuwa", "name": "Kevindu Perera", "is_captain": False, "role": "Bowler"},
    {"team": "Moratuwa", "name": "Sasith Rambukwella", "is_captain": False, "role": "Batter"},
    {"team": "Moratuwa", "name": "Kelum Hirudika", "is_captain": False, "role": "Bowler"},
    {"team": "Moratuwa", "name": "Sanithu Wijerathne", "is_captain": False, "role": "Bowler"},
    {"team": "Moratuwa", "name": "Yasiru Ruwantha", "is_captain": False, "role": "Bowler"},
    {"team": "Moratuwa", "name": "Dineth Gamage", "is_captain": False, "role": "Wicket Keeper"}
  ]
}

POSTGRES_URL = 'postgresql://unicric_db_user:CbvArPPcXTKtUA9ahsPzMTeR1bKRtfma@dpg-d9ucis15efls739nsgmg-a.oregon-postgres.render.com/unicric_db'

print(f"Applying hard reset to PostgreSQL DB...")
conn = psycopg2.connect(POSTGRES_URL)
c = conn.cursor()

# 1. Ensure strictly 4 teams exist (Fix the 5 teams issue)
# Insert UOM and PER if they don't exist
c.execute("INSERT INTO teams (code, name, group_name) VALUES ('UOM', 'Moratuwa University', 'Group C') ON CONFLICT (code) DO NOTHING")
c.execute("INSERT INTO teams (code, name, group_name) VALUES ('PER', 'Peradeniya University', 'Group C') ON CONFLICT (code) DO NOTHING")

# Migrate old team codes (MOR, UNI) to UOM
c.execute("UPDATE players SET team_code = 'UOM' WHERE team_code IN ('MOR', 'UNI')")
c.execute("UPDATE player_stats SET team_code = 'UOM' WHERE team_code IN ('MOR', 'UNI')")
c.execute("DELETE FROM teams WHERE code IN ('MOR', 'UNI')")

# 2. Update Points for UOM and PER (Since Render API uses static columns)
c.execute("UPDATE teams SET played = 1, won = 1, lost = 0, points = 2 WHERE code = 'UOM'")
c.execute("UPDATE teams SET played = 1, won = 0, lost = 1, points = 0 WHERE code = 'PER'")

# 3. Update players table
for p in PAYLOAD["players"]:
    team_code = "UOM" if p["team"] == "Moratuwa" else "PER"
    role_str = f"Captain ({p['role']})" if p["is_captain"] else p["role"]
    
    # Check if player exists
    c.execute("SELECT id FROM players WHERE name = %s", (p["name"],))
    existing = c.fetchone()
    
    if existing:
        c.execute("UPDATE players SET role = %s, team_code = %s WHERE name = %s", (role_str, team_code, p["name"]))
    else:
        c.execute('''
            INSERT INTO players (name, team_code, role, matches, total_runs, total_balls, total_fours, total_sixes, strike_rate, total_wickets, economy_rate)
            VALUES (%s, %s, %s, 1, 0, 0, 0, 0, 0.0, 0, 0.0)
        ''', (p["name"], team_code, role_str))
        
    # Ensure they are linked to match 2 so stats are correctly aggregated
    c.execute("SELECT id FROM player_stats WHERE match_id = 'match_import_scratch_scorecard' AND player_name = %s", (p["name"],))
    stat_exists = c.fetchone()
    if not stat_exists:
        c.execute('''
            INSERT INTO player_stats (match_id, player_name, team_code, runs, balls, fours, sixes, wickets, overs, runs_conceded)
            VALUES ('match_import_scratch_scorecard', %s, %s, 0, 0, 0, 0, 0, 0, 0)
        ''', (p["name"], team_code))
        
conn.commit()
conn.close()

print("Hard reset complete on PostgreSQL.")
