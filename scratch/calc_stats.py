import json

players_data = [
    {"name": "Sivakaran Venujan", "team": "JAF", "role": "Wicket Keeper", "battingStyle": "Right-Hand Batter", "r": 11, "b": 47, "fours": 1, "sixes": 0, "sr": 23.40, "w": 0, "econ": 0.0, "o": 0, "bowl_dots": 0},
    {"name": "Shanmuganathan Silaxan", "team": "JAF", "role": "Batter", "battingStyle": "Right-Hand Batter", "r": 26, "b": 28, "fours": 4, "sixes": 1, "sr": 92.86, "w": 0, "econ": 0.0, "o": 0, "bowl_dots": 0},
    {"name": "Ashmika Iddamalgoda", "team": "JAF", "role": "All-Rounder", "battingStyle": "Right-Hand Batter", "r": 79, "b": 81, "fours": 13, "sixes": 1, "sr": 97.53, "w": 1, "econ": 3.50, "o": 2, "bowl_dots": 9},
    {"name": "Sivaruban Sivanujan", "team": "JAF", "role": "Batter", "battingStyle": "Right-Hand Batter", "r": 33, "b": 42, "fours": 3, "sixes": 2, "sr": 78.57, "w": 0, "econ": 9.00, "o": 1, "bowl_dots": 2},
    {"name": "Patkunam Mathushan", "team": "JAF", "role": "All-Rounder", "battingStyle": "Right-Hand Batter", "r": 10, "b": 17, "fours": 0, "sixes": 0, "sr": 58.82, "w": 1, "econ": 3.67, "o": 3, "bowl_dots": 13},
    {"name": "Antony Desvin", "team": "JAF", "role": "Captain (All-Rounder)", "battingStyle": "Right-Hand Batter", "r": 23, "b": 31, "fours": 1, "sixes": 2, "sr": 74.19, "w": 3, "econ": 1.33, "o": 6, "bowl_dots": 30},
    {"name": "K Siyanujan", "team": "JAF", "role": "Batter", "battingStyle": "Right-Hand Batter", "r": 14, "b": 11, "fours": 2, "sixes": 1, "sr": 127.27, "w": 0, "econ": 10.00, "o": 2, "bowl_dots": 6},
    {"name": "Selvanathan Niroshan", "team": "JAF", "role": "Bowler", "battingStyle": "Right-Hand Batter", "r": 13, "b": 6, "fours": 0, "sixes": 2, "sr": 216.67, "w": 4, "econ": 2.91, "o": 5.3, "bowl_dots": 26},
    {"name": "V Priyankan", "team": "JAF", "role": "Batter", "battingStyle": "Right-Hand Batter", "r": 20, "b": 15, "fours": 0, "sixes": 0, "sr": 133.33, "w": 0, "econ": 0.0, "o": 0, "bowl_dots": 0},
    {"name": "Chalithya Millangoda", "team": "JAF", "role": "All-Rounder", "battingStyle": "Right-Hand Batter", "r": 2, "b": 5, "fours": 0, "sixes": 0, "sr": 40.00, "w": 1, "econ": 6.67, "o": 3, "bowl_dots": 12},
    {"name": "Ebenezer Johanan", "team": "JAF", "role": "Batter", "battingStyle": "Right-Hand Batter", "r": 16, "b": 17, "fours": 0, "sixes": 1, "sr": 94.12, "w": 0, "econ": 0.0, "o": 0, "bowl_dots": 0},
    {"name": "Janith Dilshan", "team": "VAV", "role": "Bowler", "battingStyle": "Left-Hand Batter", "r": 1, "b": 10, "fours": 0, "sixes": 0, "sr": 10.00, "w": 1, "econ": 5.40, "o": 10, "bowl_dots": 36},
    {"name": "Ekjfernando", "team": "VAV", "role": "Batter", "battingStyle": "Right-Hand Batter", "r": 3, "b": 15, "fours": 0, "sixes": 0, "sr": 20.00, "w": 0, "econ": 0.0, "o": 0, "bowl_dots": 0},
    {"name": "Lahiru Welagedara", "team": "VAV", "role": "Wicket Keeper", "battingStyle": "Left-Hand Batter", "r": 35, "b": 31, "fours": 4, "sixes": 2, "sr": 112.90, "w": 0, "econ": 0.0, "o": 0, "bowl_dots": 0},
    {"name": "Rmid Ranaweera", "team": "VAV", "role": "Batter", "battingStyle": "Left-Hand Batter", "r": 1, "b": 6, "fours": 0, "sixes": 0, "sr": 16.67, "w": 0, "econ": 0.0, "o": 0, "bowl_dots": 0},
    {"name": "Rashan Wijerathna", "team": "VAV", "role": "Batter", "battingStyle": "Left-Hand Batter", "r": 23, "b": 28, "fours": 3, "sixes": 1, "sr": 82.14, "w": 0, "econ": 0.0, "o": 0, "bowl_dots": 0},
    {"name": "Sahan Siriwardana", "team": "VAV", "role": "Captain (All-Rounder)", "battingStyle": "Left-Hand Batter", "r": 3, "b": 13, "fours": 0, "sixes": 0, "sr": 23.08, "w": 1, "econ": 5.60, "o": 10, "bowl_dots": 40},
    {"name": "Pahan Bimsara", "team": "VAV", "role": "Bowler", "battingStyle": "Right-Hand Batter", "r": 0, "b": 2, "fours": 0, "sixes": 0, "sr": 0.0, "w": 0, "econ": 9.75, "o": 4, "bowl_dots": 11},
    {"name": "Mohammed Riwaqi", "team": "VAV", "role": "Bowler", "battingStyle": "Right-Hand Batter", "r": 11, "b": 9, "fours": 2, "sixes": 0, "sr": 122.22, "w": 2, "econ": 4.75, "o": 8, "bowl_dots": 32},
    {"name": "Sithamparalingam Nharthanan", "team": "VAV", "role": "All-Rounder", "battingStyle": "Left-Hand Batter", "r": 6, "b": 8, "fours": 1, "sixes": 0, "sr": 75.00, "w": 1, "econ": 5.33, "o": 6, "bowl_dots": 29},
    {"name": "Kkirubagaran", "team": "VAV", "role": "Bowler", "battingStyle": "Right-Hand Batter", "r": 1, "b": 14, "fours": 0, "sixes": 0, "sr": 7.14, "w": 1, "econ": 4.71, "o": 7, "bowl_dots": 23},
    {"name": "Ravichandran Ragulan", "team": "VAV", "role": "Bowler", "battingStyle": "Right-Hand Batter", "r": 0, "b": 1, "fours": 0, "sixes": 0, "sr": 0.0, "w": 1, "econ": 3.20, "o": 5, "bowl_dots": 22}
]

out = []
for i, p in enumerate(players_data):
    b_balls = p['b']
    bounds = p['fours'] + p['sixes']
    boundary_pct = round((bounds / b_balls * 100)) if b_balls > 0 else 0
    
    # Calculate overs properly
    overs = p['o']
    bowl_balls = int(overs) * 6 + int(round((overs - int(overs)) * 10))
    bowl_dots = p['bowl_dots']
    
    bowl_dot_pct = round((bowl_dots / bowl_balls * 100)) if bowl_balls > 0 else 0
    
    out.append(f"          {{ id: 'p{i+1}', name: \"{p['name']}\", team: \"{p['team']}\", role: \"{p['role']}\", battingStyle: \"{p['battingStyle']}\", matches: 1, runs: {p['r']}, balls: {p['b']}, fours: {p['fours']}, sixes: {p['sixes']}, sr: {p['sr']}, wickets: {p['w']}, econ: {p['econ']:.2f}, boundaryPct: {boundary_pct}, bowlDotPct: {bowl_dot_pct} }},")

print("\n".join(out))
