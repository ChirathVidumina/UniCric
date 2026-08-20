import re

file_path = r'c:\Unicric Stats\src\pages\TeamsPlayers.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the staticPlayers and staticTeams definitions and merge logic
# The block starts right after `apiPlayers = playersData.players || [];` and ends right before `} catch (err) {`
new_content = re.sub(
    r'(apiPlayers = playersData\.players \|\| \[\];\s*\n).*?(} catch \(err\))',
    r'\1        setPlayersList(apiPlayers);\n      \2',
    content,
    flags=re.DOTALL
)

# Fix hardcoded JSX strings
new_content = new_content.replace('66 Verified Player Profiles', '{playersList.length} Verified Player Profiles')
new_content = new_content.replace('<div className="stat-value" style={{ color: \'#dc2626\' }}>66 Players</div>', '<div className="stat-value" style={{ color: \'#dc2626\' }}>{playersList.length} Players</div>')
new_content = new_content.replace('<div className="stat-value">6 Universities</div>', '<div className="stat-value">{teams.length} Universities</div>')
new_content = new_content.replace('66 Players', '{playersList.length} Players')
new_content = new_content.replace('6 Universities', '{teams.length} Universities')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("File updated successfully.")
