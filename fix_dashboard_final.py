import re

file_path = r'c:\Unicric Stats\src\pages\Dashboard.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix uomTeam default
content = re.sub(
    r"const uomTeam = dashboardData\?\.uomTeam\?\.played > 0 \? dashboardData\.uomTeam : \{ played: 1, won: 1, points: 2, nrr: '\+2\.414' \};",
    r"const uomTeam = dashboardData?.uomTeam || { played: 0, won: 0, points: 0, nrr: '0.000' };",
    content
)

# 2. Fix uomCompletedMatch default
content = re.sub(
    r"const uomCompletedMatch = dashboardData\?\.uomCompletedMatch \|\| \{.*?scoreSummary: 'PER 114/10 • UOM 115/5'\s*\};",
    r"const uomCompletedMatch = dashboardData?.uomCompletedMatch;",
    content,
    flags=re.DOTALL
)

# 3. Fix nextTargetMatch default
content = re.sub(
    r"const nextTargetMatch = dashboardData\?\.nextTargetMatch \|\| \{.*?venue: 'Vavuniya Ground \(Away\)'\s*\};",
    r"const nextTargetMatch = dashboardData?.nextTargetMatch;",
    content,
    flags=re.DOTALL
)

# 4. Fix upcomingMatch default
content = re.sub(
    r"const upcomingMatch = dashboardData\?\.upcomingMatch \|\| \{.*?venue: 'Moratuwa Ground \(Home\)'\s*\};",
    r"const upcomingMatch = dashboardData?.upcomingMatch;",
    content,
    flags=re.DOTALL
)

# 5. Fix groupTeams logic. dashboardData returns `groupTeams` as an array of teams.
content = re.sub(
    r"const rawGroups = dashboardData\?\.groups \|\| \[\];\s*const groupC = rawGroups\.find\(g => g\.code === 'GROUP_C'\) \|\| \{ teams: \[\] \};\s*const groupTeams = groupC\.teams;",
    r"const groupTeams = dashboardData?.groupTeams || [];",
    content
)

# Also fix the rendering issues if these matches are null
content = re.sub(
    r"<div className=\"result-badge\">W</div>",
    r"{uomCompletedMatch && <div className=\"result-badge\">W</div>}",
    content
)

# I should make sure it doesn't crash if nextTargetMatch is null
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Dashboard.jsx fixed")
