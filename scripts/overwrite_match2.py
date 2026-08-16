import json
import sqlite3
import os

PAYLOAD = {
  "match_metadata": {
    "team_a": "Peradeniya",
    "team_b": "Moratuwa",
    "ground": "University Of Moratuwa Ground, Moratuwa",
    "date": "2026-08-01",
    "toss": "Peradeniya University opt to bat",
    "result": "Moratuwa University won by 5 wickets"
  },
  "normalization_map": {
    "University Of Moratuwa": "Moratuwa",
    "UOM": "Moratuwa",
    "Peradeniya University": "Peradeniya",
    "PERA": "Peradeniya"
  },
  "team_a_innings": {
    "team": "Peradeniya",
    "total_runs": 114,
    "wickets": 10,
    "overs": 46.0,
    "batting": [
      {"name": "Nadeeshan Bandara", "runs": 28, "balls": 49, "fours": 2, "sixes": 0, "sr": 57.14, "status": "out"},
      {"name": "Sahan Arumasinghe", "runs": 0, "balls": 3, "fours": 0, "sixes": 0, "sr": 0.00, "status": "out"},
      {"name": "Maneesha Nilanduwa", "runs": 2, "balls": 14, "fours": 0, "sixes": 0, "sr": 14.29, "status": "out"},
      {"name": "Pulitha Sarathchandra", "runs": 26, "balls": 70, "fours": 0, "sixes": 0, "sr": 37.14, "status": "out"},
      {"name": "G P Rashmika", "runs": 12, "balls": 46, "fours": 1, "sixes": 0, "sr": 26.09, "status": "out"},
      {"name": "Janeesha Hansaka", "runs": 2, "balls": 4, "fours": 0, "sixes": 0, "sr": 50.00, "status": "out"},
      {"name": "Nahularaja Kathurshan", "runs": 19, "balls": 46, "fours": 3, "sixes": 0, "sr": 41.30, "status": "out"},
      {"name": "Vijayan Yashwinshan", "runs": 10, "balls": 23, "fours": 1, "sixes": 0, "sr": 43.48, "status": "out"},
      {"name": "Isuru Kuruneru", "runs": 5, "balls": 10, "fours": 0, "sixes": 0, "sr": 50.00, "status": "not out"},
      {"name": "Deshan Ekanayake", "runs": 2, "balls": 6, "fours": 0, "sixes": 0, "sr": 33.33, "status": "out"},
      {"name": "Kavindu Bandara", "runs": 0, "balls": 6, "fours": 0, "sixes": 0, "sr": 0.00, "status": "out"}
    ],
    "bowling": [
      {"name": "Muftee Mysan", "overs": 6.0, "maidens": 1, "runs": 20, "wickets": 0, "eco": 3.33},
      {"name": "Kelum Hirudika", "overs": 4.0, "maidens": 0, "runs": 10, "wickets": 1, "eco": 2.50},
      {"name": "Behan Wickramasinghe", "overs": 4.0, "maidens": 0, "runs": 7, "wickets": 2, "eco": 1.75},
      {"name": "Sanithu Wijerathne", "overs": 8.0, "maidens": 3, "runs": 15, "wickets": 1, "eco": 1.88},
      {"name": "Kevindu Perera", "overs": 6.0, "maidens": 1, "runs": 16, "wickets": 3, "eco": 2.67},
      {"name": "Yasiru Ruwantha", "overs": 10.0, "maidens": 0, "runs": 25, "wickets": 1, "eco": 2.50},
      {"name": "Lahiru Amarasekara", "overs": 8.0, "maidens": 1, "runs": 20, "wickets": 1, "eco": 2.50}
    ]
  },
  "team_b_innings": {
    "team": "Moratuwa",
    "total_runs": 115,
    "wickets": 5,
    "overs": 24.3,
    "batting": [
      {"name": "Sathira Vikasitha", "runs": 48, "balls": 63, "fours": 6, "sixes": 0, "sr": 76.19, "status": "out"},
      {"name": "Devdun Nethusahan", "runs": 9, "balls": 25, "fours": 1, "sixes": 0, "sr": 36.00, "status": "out"},
      {"name": "Muftee Mysan", "runs": 33, "balls": 28, "fours": 4, "sixes": 1, "sr": 117.86, "status": "out"},
      {"name": "Lahiru Amarasekara", "runs": 0, "balls": 4, "fours": 0, "sixes": 0, "sr": 0.00, "status": "out"},
      {"name": "Behan Wickramasinghe", "runs": 10, "balls": 16, "fours": 2, "sixes": 0, "sr": 62.50, "status": "not out"},
      {"name": "Kevindu Perera", "runs": 8, "balls": 9, "fours": 0, "sixes": 1, "sr": 88.89, "status": "out"},
      {"name": "Sasith Rambukwella", "runs": 1, "balls": 2, "fours": 0, "sixes": 0, "sr": 50.00, "status": "not out"}
    ],
    "bowling": [
      {"name": "Isuru Kuruneru", "overs": 6.0, "maidens": 1, "runs": 24, "wickets": 0, "eco": 4.00},
      {"name": "Nadeeshan Bandara", "overs": 2.0, "maidens": 0, "runs": 20, "wickets": 0, "eco": 10.00},
      {"name": "Vijayan Yashwinshan", "overs": 2.0, "maidens": 0, "runs": 14, "wickets": 0, "eco": 7.00},
      {"name": "Janeesha Hansaka", "overs": 1.0, "maidens": 0, "runs": 9, "wickets": 0, "eco": 9.00},
      {"name": "Deshan Ekanayake", "overs": 7.0, "maidens": 1, "runs": 20, "wickets": 2, "eco": 2.86},
      {"name": "Kavindu Bandara", "overs": 6.3, "maidens": 1, "runs": 28, "wickets": 3, "eco": 4.31}
    ]
  }
}

db_paths = [
    r"c:\Unicric Stats\unicric.db",
    r"c:\Unicric Stats\backend\unicric.db"
]

def map_team_code(name, norm_map):
    # e.g., "Moratuwa" -> "UOM", "Peradeniya" -> "PER"
    norm_name = norm_map.get(name, name)
    if norm_name == "Moratuwa": return "UOM"
    if norm_name == "Peradeniya": return "PER"
    return name[:3].upper()

match_id = "m2"

for db_path in db_paths:
    if not os.path.exists(db_path):
        continue
    print(f"Overwriting match in {db_path}...")
    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    # 1. Delete existing match
    c.execute("DELETE FROM matches WHERE id = 'm2'")
    # 2. Delete existing player_stats for this match
    c.execute("DELETE FROM player_stats WHERE match_id = 'm2'")

    # 3. Create the match
    meta = PAYLOAD["match_metadata"]
    c.execute('''
        INSERT INTO matches (id, title, date_label, venue, status, result, score_summary)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        match_id,
        f"{meta['team_a']} University vs {meta['team_b']} University",
        meta["date"],
        meta["ground"],
        "COMPLETED",
        meta["result"],
        f"{meta['team_a']} {PAYLOAD['team_a_innings']['total_runs']}/{PAYLOAD['team_a_innings']['wickets']} ({PAYLOAD['team_a_innings']['overs']} Ov)"
    ))

    # 4. Insert Player Stats
    norm_map = PAYLOAD["normalization_map"]
    
    for innings in [PAYLOAD["team_a_innings"], PAYLOAD["team_b_innings"]]:
        team_code = map_team_code(innings["team"], norm_map)
        
        for bat in innings["batting"]:
            # Ensure player exists
            p = c.execute("SELECT id FROM players WHERE name = ?", (bat["name"],)).fetchone()
            if not p:
                c.execute('''
                    INSERT INTO players (name, team_code, role, matches, total_runs, total_balls, total_fours, total_sixes, strike_rate, total_wickets, economy_rate)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (bat["name"], team_code, "Batter", 1, 0, 0, 0, 0, 0.0, 0, 0.0))
                
            c.execute('''
                INSERT INTO player_stats (match_id, player_name, team_code, runs, balls, fours, sixes, strike_rate, dismissal, is_out)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (match_id, bat["name"], team_code, bat["runs"], bat["balls"], bat["fours"], bat["sixes"], bat["sr"], bat["status"], 1 if bat["status"] == "out" else 0))

        for bowl in innings["bowling"]:
            p = c.execute("SELECT id FROM players WHERE name = ?", (bowl["name"],)).fetchone()
            if not p:
                c.execute('''
                    INSERT INTO players (name, team_code, role, matches, total_runs, total_balls, total_fours, total_sixes, strike_rate, total_wickets, economy_rate)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (bowl["name"], team_code, "Bowler", 1, 0, 0, 0, 0, 0.0, 0, 0.0))
                
            c.execute('''
                INSERT INTO player_stats (match_id, player_name, team_code, wickets, overs, runs_conceded, economy)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (match_id, bowl["name"], team_code, bowl["wickets"], bowl["overs"], bowl["runs"], bowl["eco"]))

    conn.commit()
    conn.close()
    
print("Overwrite complete.")
