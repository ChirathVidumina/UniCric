import re

# 1. Update UOMOppositionScout.jsx
with open('c:\\Unicric Stats\\src\\pages\\UOMOppositionScout.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix role display
# Look for: <span>{icon}</span> {p.name} ({displayRole})
content = content.replace("<span>{icon}</span> {p.name} ({displayRole})", "<span>{icon}</span> {p.name} ({p.role})")

# Remove displayRole variable
content = content.replace("const displayRole = p.role || 'Batter';", "")

# Fix table squash
old_tr_block = """                          <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                            <td className="px-4 py-3 font-bold text-slate-200">
                              {log.matchDate} <span className="text-slate-500 text-xs block">{log.matchId || ''}</span>
                            </td>
                            <td className="px-4 py-3 font-bold text-[#fbbf24]">vs {log.vs}</td>
                            <td className="px-4 py-3 font-extrabold text-white">
                              {log.bowlingFigures ? log.bowlingFigures : `${log.runs} (${log.balls})`}
                            </td>
                            <td className="px-4 py-3 text-slate-300">
                              {log.bowlingFigures ? '-' : `${log.fours || 0} 4s / ${log.sixes || 0} 6s`}
                            </td>
                            <td className="px-4 py-3 text-slate-300">
                              {log.dots || 0} dots
                            </td>
                            <td className={`px-4 py-3 font-bold ${log.isOut ? 'text-red-500' : 'text-emerald-400'}`}>
                              {log.dismissalMode || log.tacticalNote || '-'}
                            </td>
                          </tr>"""

new_tr_block = """                          <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                            <td className="px-4 py-2">{log.matchDate}</td>
                            <td className="px-4 py-2">vs {log.vs}</td>
                            <td className="px-4 py-2">{log.runs} ({log.balls})</td>
                            <td className="px-4 py-2">{log.fours || 0} 4s / {log.sixes || 0} 6s</td>
                            <td className="px-4 py-2">{log.dots || 0} dots</td>
                            <td className={`px-4 py-2 ${log.isOut ? 'text-red-400' : 'text-emerald-400'}`}>{log.isOut ? 'Out' : 'Not Out'}</td>
                          </tr>"""

content = content.replace(old_tr_block, new_tr_block)

with open('c:\\Unicric Stats\\src\\pages\\UOMOppositionScout.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

# 2. Update Tournaments.jsx (Clear m2 and m3 data)
with open('c:\\Unicric Stats\\src\\pages\\Tournaments.jsx', 'r', encoding='utf-8') as f:
    tournaments = f.read()

# We'll use regex to clear the 'batting' and 'bowling' arrays for m2 and m3
def clear_innings(match_id, html):
    # This is a bit tricky, let's just find the m2 block and manually replace it
    pass

# Actually, I can just replace the whole m2 and m3 objects in FALLBACK_SCORECARDS with empty arrays for batting and bowling.
# Let's extract FALLBACK_SCORECARDS
start_idx = tournaments.find('const FALLBACK_SCORECARDS = {')
end_idx = tournaments.find('};', start_idx) + 2
fallback_block = tournaments[start_idx:end_idx]

# Replace m2 and m3 data
m2_empty = """  m2: {
    id: 'm2',
    title: 'Peradeniya vs Moratuwa',
    date: '2026-08-01',
    venue: 'University Of Moratuwa Ground, Moratuwa',
    result: 'MATCH SUMMARY PENDING UPDATE',
    toss: '',
    playerOfMatch: null,
    innings1: {
      team: 'PERADENIYA UNIVERSITY',
      score: '114/10',
      overs: '46.0',
      batting: [],
      bowling: []
    },
    innings2: {
      team: 'MORATUWA UNIVERSITY',
      score: '115/5',
      overs: '24.3',
      batting: [],
      bowling: []
    }
  }"""

m3_empty = """  m3: {
    id: 'm3',
    title: 'Rajarata vs Wayamba',
    date: '2026-08-01',
    venue: 'Wayamba University Grounds, Kuliyapitiya',
    result: 'MATCH SUMMARY PENDING UPDATE',
    toss: '',
    playerOfMatch: null,
    innings1: {
      team: 'RAJARATA UNIVERSITY',
      score: '62/10',
      overs: '28.4',
      batting: [],
      bowling: []
    },
    innings2: {
      team: 'WAYAMBA UNIVERSITY',
      score: '63/6',
      overs: '19.4',
      batting: [],
      bowling: []
    }
  }"""

# regex substitute m2 and m3
fallback_block = re.sub(r'm2: \{[\s\S]*?(?=\n  m3:)', m2_empty + ",\n", fallback_block)
fallback_block = re.sub(r'm3: \{[\s\S]*?(?=\n};)', m3_empty + "\n", fallback_block)

tournaments = tournaments[:start_idx] + fallback_block + tournaments[end_idx:]

with open('c:\\Unicric Stats\\src\\pages\\Tournaments.jsx', 'w', encoding='utf-8') as f:
    f.write(tournaments)

print("Files updated successfully.")
