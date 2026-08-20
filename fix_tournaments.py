import re

with open('c:\\Unicric Stats\\src\\pages\\Tournaments.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Object.keys... with hardcoded 3 / 32
content = re.sub(
    r'\{Object\.keys\(completedMatchScorecards\s*\|\|\s*\{\}\)\.length\}\s*/\s*32 Matches',
    r'3 / 32 Matches',
    content
)

# Look for the exact groups declaration at line 139
groups_decl = "const groups = tournamentData?.groups || tournament.groups || [];"

new_groups_decl = """let rawGroups = tournamentData?.groups || tournament.groups || [];

  // INJECTED OVERRIDES FOR GROUP C
  const GROUP_C_OVERRIDES = {
    "JAF": { played: 1, won: 1, lost: 0, points: 2, nrr: "+1.500", for: "271/50.0", against: "91/22.3", last5: ["W"] },
    "UOM": { played: 1, won: 1, lost: 0, points: 2, nrr: "+2.414", for: "115/24.3", against: "114/50.0", last5: ["W"] },
    "PER": { played: 1, won: 0, lost: 1, points: 0, nrr: "-2.414", for: "114/50.0", against: "115/24.3", last5: ["L"] },
    "VAV": { played: 1, won: 0, lost: 1, points: 0, nrr: "-1.500", for: "91/22.3", against: "271/50.0", last5: ["L"] }
  };

  const wayambaTeam = teams.find(t => t.code === "WAY") || { code: "WAY", name: "Wayamba" };
  const rajarataTeam = teams.find(t => t.code === "RAJ") || { code: "RAJ", name: "Rajarata" };

  const GROUP_D_TEAMS = [
    { ...wayambaTeam, played: 1, won: 1, lost: 0, points: 2, nrr: "+1.040", for: "63/19.4", against: "62/28.4", last5: ["W"] },
    { ...rajarataTeam, played: 1, won: 0, lost: 1, points: 0, nrr: "-1.040", for: "62/28.4", against: "63/19.4", last5: ["L"] }
  ];

  let groupCTeams = [];
  if (rawGroups.length > 0 && rawGroups[0].teams) {
    // Force Group C to only have JAF, UOM, PER, VAV
    groupCTeams = rawGroups[0].teams
      .filter(t => ["JAF", "UOM", "PER", "VAV"].includes(t.code))
      .map(t => GROUP_C_OVERRIDES[t.code] ? { ...t, ...GROUP_C_OVERRIDES[t.code] } : t);
  }

  const groups = [
    { code: "GROUP_C", name: "Group C", isOurGroup: true, teams: groupCTeams },
    { code: "GROUP_D", name: "Group D", isOurGroup: false, teams: GROUP_D_TEAMS }
  ];"""

content = content.replace(groups_decl, new_groups_decl)

# Now we must REMOVE the old GROUP_C_OVERRIDES from line ~185 because it's redefined above
# Find from "// INJECTED OVERRIDES FOR GROUP C" up to the end of the object.
override_regex = re.compile(r'// INJECTED OVERRIDES FOR GROUP C\s*const GROUP_C_OVERRIDES = \{.*?\};\s*', re.DOTALL)
content = override_regex.sub('', content)

# Remove the line `const groupC = groups.find(g => g.code === 'GROUP_C') || { teams: [] };` if it exists near line 183
content = content.replace("const groupC = groups.find(g => g.code === 'GROUP_C') || { teams: [] };", "")

# In the table mapping, it was doing `return isGroupC && GROUP_C_OVERRIDES[baseTm.code] ? ...` 
# I need to simplify the table mapping because we already applied the overrides above!
table_mapping_regex = re.compile(r'\{\[\.\.\.grp\.teams\]\.map\(baseTm => \{.*?\}\)\.sort\(\(a, b\) => \{', re.DOTALL)
new_table_mapping = '{[...grp.teams].sort((a, b) => {'
content = table_mapping_regex.sub(new_table_mapping, content)

with open('c:\\Unicric Stats\\src\\pages\\Tournaments.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Tournaments.jsx perfectly.")
