import re

with open('c:\\Unicric Stats\\src\\pages\\Tournaments.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Insert GROUP_C_OVERRIDES right after rawGroups
target_line = "  let rawGroups = tournamentData?.groups || tournament.groups || [];"
overrides = """
  // INJECTED OVERRIDES FOR GROUP C
  const GROUP_C_OVERRIDES = {
    "JAF": { played: 1, won: 1, lost: 0, points: 2, nrr: "+1.500", for: "271/50.0", against: "91/22.3", last5: ["W"] },
    "UOM": { played: 1, won: 1, lost: 0, points: 2, nrr: "+2.414", for: "115/24.3", against: "114/50.0", last5: ["W"] },
    "PER": { played: 1, won: 0, lost: 1, points: 0, nrr: "-2.414", for: "114/50.0", against: "115/24.3", last5: ["L"] },
    "VAV": { played: 1, won: 0, lost: 1, points: 0, nrr: "-1.500", for: "91/22.3", against: "271/50.0", last5: ["L"] }
  };
"""

content = content.replace(target_line, target_line + overrides)

with open('c:\\Unicric Stats\\src\\pages\\Tournaments.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Successfully restored GROUP_C_OVERRIDES")
