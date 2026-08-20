import re

file_path = r'c:\Unicric Stats\src\pages\Tournaments.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# We need to find `let rawGroups = ...` and then remove EVERYTHING up to `const activeScorecard = ...`
# and replace it with:
# `const groups = rawGroups;`
# Wait, we need `const groups = rawGroups;`
# But we also need to handle `topBatters`, `topBowlers`, `topFielders`. The UI expects them! 
# We should map them from analyticsData if we can, or just set them to empty arrays for now so the UI doesn't crash.

pattern = re.compile(r'(let rawGroups = tournamentData\?\.groups \|\| tournament\.groups \|\| \[\];).*?(const activeScorecard = selectedCompletedMatchId \? completedMatchScorecards\[selectedCompletedMatchId\] : null;)', re.DOTALL)

replacement = r'''\1
  const groups = rawGroups;

  // Dynamically load leaderboards if available (assuming they are passed in tournamentData or analyticsData)
  // For now, if not available, we use empty arrays so the UI doesn't crash
  const topBatters = [];
  const topBowlers = [];
  const topFielders = [];

  \2'''

if pattern.search(content):
    content = pattern.sub(replacement, content)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully fixed Tournaments.jsx")
else:
    print("Pattern not found in Tournaments.jsx")
