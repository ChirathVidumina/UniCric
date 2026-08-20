import json
import re

with open('c:\\Unicric Stats\\src\\pages\\TeamsPlayers.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

m = re.search(r'const staticPlayers = (\[.*?\]);', content, re.DOTALL)
if m:
    players = json.loads(m.group(1))
    
    # Check if Dineth Gamage is already there
    exists = any(p.get("name") == "Dineth Gamage" for p in players)
    if not exists:
        players.append({
            "id": "66",
            "name": "Dineth Gamage",
            "team": "UOM",
            "role": "Wicket Keeper",
            "matches": 1,
            "runs": 0,
            "balls": 0,
            "fours": 0,
            "sixes": 0,
            "wickets": 0,
            "sr": 0.0,
            "econ": 0.0,
            "boundaryPct": 0,
            "bowlDotPct": 0,
            "battingStyle": "Right-Hand Batter"
        })
        
        new_players_str = json.dumps(players, indent=2)
        content = content.replace(m.group(0), f'const staticPlayers = {new_players_str};')
        
        with open('c:\\Unicric Stats\\src\\pages\\TeamsPlayers.jsx', 'w', encoding='utf-8') as f:
            f.write(content)
        print("Successfully added Dineth Gamage to staticPlayers.")
    else:
        print("Dineth Gamage already exists.")
else:
    print("Could not find staticPlayers array.")
