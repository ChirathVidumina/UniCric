import re

with open('c:\\Unicric Stats\\src\\pages\\Tournaments.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Restore groupC definition before rawUomTeam
old_str = "  const rawUomTeam = groupC.teams"
new_str = "  const groupC = groups.find(g => g.code === 'GROUP_C') || { teams: [] };\n  const rawUomTeam = groupC.teams"

content = content.replace(old_str, new_str)

with open('c:\\Unicric Stats\\src\\pages\\Tournaments.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Restored groupC definition to fix crash.")
