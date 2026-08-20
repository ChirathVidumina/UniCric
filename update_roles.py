import json
import re

with open('c:\\Unicric Stats\\src\\pages\\TeamsPlayers.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

m = re.search(r'const staticPlayers = (\[.*?\]);', content, re.DOTALL)
if m:
    players = json.loads(m.group(1))
    
    for p in players:
        role = p.get('role', '').lower()
        if 'all-rounder' in role or 'allrounder' in role or 'all rounder' in role:
            p['role'] = 'All-Rounder'
        elif 'bowler' in role:
            p['role'] = 'Bowler'
        elif 'batter' in role or 'wk' in role or 'wicket keeper' in role or 'wicket-keeper' in role or 'wicketkeeper' in role or 'reserve' in role:
            p['role'] = 'Batter'
        else:
            # Fallback
            p['role'] = 'Batter'
            
    new_players_str = json.dumps(players, indent=2)
    content = content.replace(m.group(0), f'const staticPlayers = {new_players_str};')
    
    with open('c:\\Unicric Stats\\src\\pages\\TeamsPlayers.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully mapped all player roles to Batter, Bowler, or All-Rounder.")
else:
    print("Could not find staticPlayers array.")
