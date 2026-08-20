import re

with open('c:\\Unicric Stats\\src\\pages\\Tournaments.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Object.keys... with hardcoded 3 / 32
content = re.sub(
    r'\{Object\.keys\(completedMatchScorecards\s*\|\|\s*\{\}\)\.length\}\s*/\s*32 Matches',
    r'3 / 32 Matches',
    content
)

# Replace the groups override logic
old_logic = '''  const groups = tournamentData?.groups || tournament.groups || [];

  const groupC = groups.find(g => g.code === 'GROUP_C') || { teams: [] };

  // INJECTED OVERRIDES FOR GROUP C
  const GROUP_C_OVERRIDES = {
    "JAF": { played: 1, won: 1, lost: 0, points: 2, nrr: "+1.500", for: "271/50.0", against: "91/22.3", last5: ["W"] },
    "UOM": { played: 1, won: 1, lost: 0, points: 2, nrr: "+2.414", for: "115/24.3", against: "114/50.0", last5: ["W"] },
    "PER": { played: 1, won: 0, lost: 1, points: 0, nrr: "-2.414", for: "114/50.0", against: "115/24.3", last5: ["L"] },
    "VAV": { played: 1, won: 0, lost: 1, points: 0, nrr: "-1.500", for: "91/22.3", against: "271/50.0", last5: ["L"] }
  };'''

new_logic = '''  let groups = tournamentData?.groups || tournament.groups || [];

  // Manual Groups Setup for the UI
  const GROUP_C_OVERRIDES = {
    "JAF": { played: 1, won: 1, lost: 0, points: 2, nrr: "+1.500", for: "271/50.0", against: "91/22.3", last5: ["W"] },
    "UOM": { played: 1, won: 1, lost: 0, points: 2, nrr: "+2.414", for: "115/24.3", against: "114/50.0", last5: ["W"] },
    "PER": { played: 1, won: 0, lost: 1, points: 0, nrr: "-2.414", for: "114/50.0", against: "115/24.3", last5: ["L"] },
    "VAV": { played: 1, won: 0, lost: 1, points: 0, nrr: "-1.500", for: "91/22.3", against: "271/50.0", last5: ["L"] }
  };
  
  const wayambaTeam = teams.find(t => t.code === "WAY") || { code: "WAY", name: "Wayamba" };
  const rajarataTeam = teams.find(t => t.code === "RAJ") || { code: "RAJ", name: "Rajarata" };
  
  const GROUP_D_TEAMS = [
    { ...wayambaTeam, played: 1, won: 1, lost: 0, points: 2, nrr: "+1.040", for: "-", against: "-", last5: ["W"] },
    { ...rajarataTeam, played: 1, won: 0, lost: 1, points: 0, nrr: "-1.040", for: "-", against: "-", last5: ["L"] }
  ];

  // Restructure the groups array
  let groupCTeams = [];
  if (groups.length > 0 && groups[0].teams) {
    groupCTeams = groups[0].teams.filter(t => ["JAF", "UOM", "PER", "VAV"].includes(t.code));
  }
  
  groups = [
    { code: "GROUP_C", name: "Group C", isOurGroup: true, teams: groupCTeams },
    { code: "GROUP_D", name: "Group D", isOurGroup: false, teams: GROUP_D_TEAMS }
  ];

  const groupC = groups.find(g => g.code === 'GROUP_C') || { teams: [] };'''

if "GROUP_D_TEAMS" not in content:
    content = content.replace(old_logic, new_logic)
    with open('c:\\Unicric Stats\\src\\pages\\Tournaments.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated Tournaments.jsx")
else:
    print("Already updated.")
