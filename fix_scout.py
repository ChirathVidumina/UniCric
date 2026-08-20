import re

with open('c:\\Unicric Stats\\src\\pages\\UOMOppositionScout.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Dynamic Player Roles in Selection List
# Replace logic around line 704
old_roles_logic = """                {opponentPlayers.map(p => {
                  const roleString = p.role?.toLowerCase() || '';
                  const displayRole = roleString.includes('bowler') ? 'Bowler' : 'Batter';
                  
                  return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlayerId(p.id)}"""
                    
new_roles_logic = """                {opponentPlayers.map(p => {
                  const roleString = p.role?.toLowerCase() || '';
                  const displayRole = p.role || 'Batter';
                  const icon = roleString.includes('bowler') ? '🎯' : roleString.includes('all-rounder') ? '⚔️' : roleString.includes('keeper') ? '🧤' : '🏏';
                  
                  return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlayerId(p.id)}"""
content = content.replace(old_roles_logic, new_roles_logic)

old_button_content = """<span>{displayRole === 'Bowler' ? '🎯' : (p.icon || '🏏')}</span> {p.name} ({displayRole})"""
new_button_content = """<span>{icon}</span> {p.name} ({displayRole})"""
content = content.replace(old_button_content, new_button_content)


# Fix 2: Match Logs Table Formatting
old_table = """                    <table className="matchup-table">
                      <thead>
                        <tr>
                          <th>Match Date</th>
                          <th>Vs Opponent</th>
                          <th>Runs (Balls)</th>
                          <th>4s / 6s</th>
                          <th>Dot Balls</th>
                          <th>Dismissal Mode / Tactical Note</th>
                        </tr>
                      </thead>
                      <tbody>
                        {playerWindowStats.logsWindow.map((log, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: '700' }}>{log.matchDate}</td>
                            <td style={{ color: 'var(--cric-gold)', fontWeight: '700' }}>vs {log.vs}</td>
                            <td style={{ fontWeight: '800' }}>{log.runs} ({log.balls})</td>
                            <td>{log.fours || 0}4s / {log.sixes || 0}6s</td>
                            <td>{log.dots || 0} dots</td>
                            <td style={{ color: log.isOut ? '#dc2626' : 'var(--cric-green)', fontWeight: '700' }}>
                              {log.dismissalMode}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>"""

new_table = """                    <table className="w-full text-left border-collapse mt-2">
                      <thead className="bg-[#0f172a] text-slate-300 text-[0.8rem] uppercase tracking-wider border-b border-slate-700">
                        <tr>
                          <th className="px-4 py-3 font-bold border-b border-slate-700">Match (Date / ID)</th>
                          <th className="px-4 py-3 font-bold border-b border-slate-700">Vs Opponent</th>
                          <th className="px-4 py-3 font-bold border-b border-slate-700">Runs (Balls) / Bowling Figures</th>
                          <th className="px-4 py-3 font-bold border-b border-slate-700">4s / 6s</th>
                          <th className="px-4 py-3 font-bold border-b border-slate-700">Dot Balls</th>
                          <th className="px-4 py-3 font-bold border-b border-slate-700">Dismissal Mode / Tactical Note</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {playerWindowStats.logsWindow.map((log, idx) => (
                          <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
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
                          </tr>
                        ))}
                      </tbody>
                    </table>"""
content = content.replace(old_table, new_table)

with open('c:\\Unicric Stats\\src\\pages\\UOMOppositionScout.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Applied fixes to UOMOppositionScout.jsx")
