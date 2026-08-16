import json
import sqlite3
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

db_paths = [
    r"c:\Unicric Stats\unicric.db",
    r"c:\Unicric Stats\backend\unicric.db"
]

for db_path in db_paths:
    if not os.path.exists(db_path):
        continue
    print(f"Applying hard reset to {db_path}...")
    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    # 1. Ensure strictly 4 teams exist
    c.execute("DELETE FROM teams WHERE code NOT IN ('UOM', 'PER', 'JAF', 'VAV')")
    
    # 2. Update players table
    for p in PAYLOAD["players"]:
        team_code = "UOM" if p["team"] == "Moratuwa" else "PER"
        role_str = f"Captain ({p['role']})" if p["is_captain"] else p["role"]
        
        # Check if player exists
        existing = c.execute("SELECT id FROM players WHERE name = ?", (p["name"],)).fetchone()
        
        if existing:
            c.execute("UPDATE players SET role = ?, team_code = ? WHERE name = ?", (role_str, team_code, p["name"]))
        else:
            c.execute('''
                INSERT INTO players (name, team_code, role, matches, total_runs, total_balls, total_fours, total_sixes, strike_rate, total_wickets, economy_rate)
                VALUES (?, ?, ?, 1, 0, 0, 0, 0, 0.0, 0, 0.0)
            ''', (p["name"], team_code, role_str))
            
        # Ensure they are linked to match 2 so stats are correctly aggregated
        # A player might not have batted or bowled, so they wouldn't exist in player_stats for m2
        stat_exists = c.execute("SELECT id FROM player_stats WHERE match_id = 'm2' AND player_name = ?", (p["name"],)).fetchone()
        if not stat_exists:
            c.execute('''
                INSERT INTO player_stats (match_id, player_name, team_code, runs, balls, fours, sixes, wickets, overs, runs_conceded)
                VALUES ('m2', ?, ?, 0, 0, 0, 0, 0, 0, 0)
            ''', (p["name"], team_code))
            
    conn.commit()
    conn.close()

print("Hard reset complete.")
