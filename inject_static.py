import json
import re

with open('c:\\Unicric Stats\\players_dump.json', 'r', encoding='utf-8') as f:
    players = json.load(f)["players"]
with open('c:\\Unicric Stats\\teams_dump.json', 'r', encoding='utf-8') as f:
    teams = json.load(f)["teams"]

players_str = json.dumps(players, indent=2)
teams_str = json.dumps(teams, indent=2)

with open('c:\\Unicric Stats\\src\\pages\\TeamsPlayers.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace staticPlayers
static_players_match = re.search(r'const staticPlayers = \[.*?\];', content, re.DOTALL)
if static_players_match:
    content = content.replace(static_players_match.group(0), f'const staticPlayers = {players_str};')

# Insert staticTeams after staticPlayers
content = re.sub(r'const staticPlayers = \[.*?\];', f'const staticPlayers = {players_str};\nconst staticTeams = {teams_str};', content, flags=re.DOTALL)
if "const staticTeams =" not in content:
    content = content.replace(f'const staticPlayers = {players_str};', f'const staticPlayers = {players_str};\nconst staticTeams = {teams_str};')

# Modify fetch logic to use static data directly
# Find the useEffect that fetches
fetch_effect = r'''  useEffect\(\(\) => \{
    const fetchTelemetry = async \(\) => \{
      setLoading\(true\);
      try \{
        const \[teamsRes, playersRes\] = await Promise\.all\(\[
          fetch\(`\$\{API_URL\}/api/teams`\)\.catch\(\(\) => null\),
          fetch\(`\$\{API_URL\}/api/players`\)\.catch\(\(\) => null\)
        \]\);

        let fetchedTeams = \[\];
        if \(teamsRes && teamsRes\.ok\) \{
          const tData = await teamsRes\.json\(\);
          fetchedTeams = tData\.teams \|\| \[\];
        \}
        
        let fetchedPlayers = \[\];
        if \(playersRes && playersRes\.ok\) \{
          const pData = await playersRes\.json\(\);
          fetchedPlayers = pData\.players \|\| \[\];
        \}

        // Merge logic
        const mergedPlayers = \[\.\.\.staticPlayers\];
        fetchedPlayers\.forEach\(fp => \{
          if \(!mergedPlayers\.some\(p => p\.name === fp\.name && p\.team === fp\.team\)\) \{
            mergedPlayers\.push\(fp\);
          \}
        \}\);

        setTeams\(fetchedTeams\.length > 0 \? fetchedTeams : \[\]\);
        setPlayersList\(mergedPlayers\);
      \} catch \(error\) \{
        console\.error\("Error fetching telemetry:", error\);
        setTeams\(\[\]\);
        setPlayersList\(staticPlayers\);
      \} finally \{
        setLoading\(false\);
      \}
    \};

    fetchTelemetry\(\);
  \}, \[\]\);'''

new_effect = '''  useEffect(() => {
    // Hardcoded bypass as requested
    setTeams(staticTeams);
    setPlayersList(staticPlayers);
    setLoading(false);
  }, []);'''

content = re.sub(fetch_effect, new_effect, content, flags=re.DOTALL)

with open('c:\\Unicric Stats\\src\\pages\\TeamsPlayers.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated TeamsPlayers.jsx")
