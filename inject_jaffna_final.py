import re

with open('c:\\Unicric Stats\\src\\pages\\UOMOppositionScout.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

jaffna_players_js = """
// Hardcoded Jaffna Players from Match 1 (Jaffna vs Vavuniya)
const jaffnaPlayers = [
  { id: 'jaf-1', name: "Sivakaran Venujan", role: "Wicket Keeper", style: "Right-Hand Batter", runs: 11, balls: 47, fours: 1, sixes: 0, dotBalls: 39, status: "Out", opponent: "Vavuniya" },
  { id: 'jaf-2', name: "Shanmuganathan Silaxan", role: "Batter", style: "Right-Hand Batter", runs: 26, balls: 28, fours: 4, sixes: 1, dotBalls: 19, status: "Out", opponent: "Vavuniya" },
  { id: 'jaf-3', name: "Ashmika Iddamalgoda", role: "All-Rounder", style: "Right-Hand Batter", runs: 79, balls: 81, fours: 13, sixes: 1, dotBalls: 30, status: "Out", bowling: "2.0 Overs, 1/7", opponent: "Vavuniya" },
  { id: 'jaf-4', name: "Sivaruban Sivanujan", role: "All-Rounder", style: "Right-Hand Batter", runs: 33, balls: 42, fours: 3, sixes: 2, dotBalls: 20, status: "Out", bowling: "1.0 Overs, 0/9", opponent: "Vavuniya" },
  { id: 'jaf-5', name: "Patkunam Mathushan", role: "All-Rounder", style: "Right-Hand Batter", runs: 10, balls: 17, fours: 0, sixes: 0, dotBalls: 10, status: "Out", bowling: "3.0 Overs, 1/11", opponent: "Vavuniya" },
  { id: 'jaf-6', name: "Antony Desvin", role: "Captain / All-Rounder", style: "Right-Hand Batter", runs: 23, balls: 31, fours: 1, sixes: 2, dotBalls: 15, status: "Out", bowling: "6.0 Overs, 3/8", opponent: "Vavuniya" },
  { id: 'jaf-7', name: "K Siyanujan", role: "All-Rounder", style: "Right-Hand Batter", runs: 14, balls: 11, fours: 2, sixes: 1, dotBalls: 3, status: "Out", bowling: "2.0 Overs, 0/20", opponent: "Vavuniya" },
  { id: 'jaf-8', name: "Selvanathan Niroshan", role: "Bowler", style: "Right-Hand Batter", runs: 13, balls: 6, fours: 0, sixes: 2, dotBalls: 2, status: "Out", bowling: "5.3 Overs, 4/16", opponent: "Vavuniya" },
  { id: 'jaf-9', name: "V Priyankan", role: "Batter", style: "Right-Hand Batter", runs: 20, balls: 15, fours: 0, sixes: 0, dotBalls: 5, status: "Not Out", opponent: "Vavuniya" },
  { id: 'jaf-10', name: "Chalithya Millangoda", role: "Bowler", style: "Right-Hand Batter", runs: 2, balls: 5, fours: 0, sixes: 0, dotBalls: 3, status: "Out", bowling: "3.0 Overs, 1/20", opponent: "Vavuniya" },
  { id: 'jaf-11', name: "Ebenezer Johanan", role: "Batter", style: "Right-Hand Batter", runs: 16, balls: 17, fours: 0, sixes: 1, dotBalls: 8, status: "Out", opponent: "Vavuniya" }
];
"""

# Inject array right after imports
if "const jaffnaPlayers" not in content:
    content = content.replace("export default function UOMOppositionScout() {", jaffna_players_js + "\nexport default function UOMOppositionScout() {")

# Override fetchPlayers
old_fetch_players = """    const fetchPlayers = async () => {
      setLoadingPlayers(true);
      setErrorPlayers(null);
      try {
        const res = await fetch(`${API_URL}/api/players?team=${selectedOpponentId}`);
        if (res.ok) {
          const data = await res.json();
          const plist = data.players || [];"""

new_fetch_players = """    const fetchPlayers = async () => {
      setLoadingPlayers(true);
      setErrorPlayers(null);
      try {
        if (selectedOpponentId === 'JAF' || selectedOpponentId === 'jaffna' || String(selectedOpponentId).toLowerCase().includes('jaf')) {
          setOpponentPlayers(jaffnaPlayers);
          if (jaffnaPlayers.length > 0) setSelectedPlayerId(jaffnaPlayers[0].id);
          setLoadingPlayers(false);
          return;
        }
        const res = await fetch(`${API_URL}/api/players?team=${selectedOpponentId}`);
        if (res.ok) {
          const data = await res.json();
          const plist = data.players || [];"""
          
content = content.replace(old_fetch_players, new_fetch_players)

# Override fetchPlayerForm
old_fetch_form = """    const fetchPlayerForm = async () => {
      setLoadingPlayerForm(true);
      try {
        const res = await fetch(`${API_URL}/api/players/${selectedPlayerId}/form?last_n=${lastNMatches}`);
        if (res.ok) {
          const data = await res.json();"""

new_fetch_form = """    const fetchPlayerForm = async () => {
      setLoadingPlayerForm(true);
      try {
        if (String(selectedPlayerId).startsWith('jaf-')) {
          const jp = jaffnaPlayers.find(p => p.id === selectedPlayerId);
          if (jp) {
             const mockForm = {
               player: { name: jp.name, role: jp.role, battingStyle: jp.style },
               matchesInWindow: 1,
               totalRuns: jp.runs,
               totalBalls: jp.balls,
               totalFours: jp.fours,
               totalSixes: jp.sixes,
               strikeRate: jp.balls > 0 ? ((jp.runs / jp.balls) * 100).toFixed(2) : 0,
               highestScore: jp.runs,
               notOuts: jp.status === 'Not Out' ? 1 : 0,
               primaryWeakness: 'Requires further observation',
               logsWindow: [{
                 matchDate: '2026-07-28',
                 matchId: 'm1',
                 vs: jp.opponent,
                 runs: jp.runs,
                 balls: jp.balls,
                 fours: jp.fours,
                 sixes: jp.sixes,
                 dots: jp.dotBalls,
                 isOut: jp.status === 'Out',
                 dismissalMode: jp.status,
                 bowlingFigures: jp.bowling || null,
                 tacticalNote: 'Played against Vavuniya'
               }]
             };
             setPlayerWindowStats(mockForm);
             setLoadingPlayerForm(false);
             return;
          }
        }
        const res = await fetch(`${API_URL}/api/players/${selectedPlayerId}/form?last_n=${lastNMatches}`);
        if (res.ok) {
          const data = await res.json();"""

content = content.replace(old_fetch_form, new_fetch_form)

with open('c:\\Unicric Stats\\src\\pages\\UOMOppositionScout.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated Jaffna players in UOMOppositionScout.jsx")
