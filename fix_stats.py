import re

with open('c:\\Unicric Stats\\src\\pages\\Tournaments.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update topBatters
old_batters = """  const topBatters = [
    { name: 'Ashmika Iddamalgoda', team: 'JAF', runs: 79, hs: 79, sr: '97.53', fours: 13, sixes: 1 },
    { name: 'Sathira Vikasitha', team: 'MOR', runs: 48, hs: 48, sr: '76.19', fours: 6, sixes: 0 },
    { name: 'Lahiru Welagedara', team: 'VAV', runs: 35, hs: 35, sr: '112.90', fours: 4, sixes: 2 },
    { name: 'Sivaruban Sivanujan', team: 'JAF', runs: 33, hs: 33, sr: '78.57', fours: 3, sixes: 2 },
    { name: 'Muftee Mysan', team: 'MOR', runs: 33, hs: 33, sr: '117.86', fours: 4, sixes: 1 },
    { name: 'Nadeeshan Bandara', team: 'PER', runs: 28, hs: 28, sr: '57.14', fours: 2, sixes: 0 },
    { name: 'Shanmuganathan Silaxan', team: 'JAF', runs: 26, hs: 26, sr: '92.86', fours: 4, sixes: 1 },
    { name: 'Pulitha Sarathchandra', team: 'PER', runs: 26, hs: 26, sr: '37.14', fours: 0, sixes: 0 },
    { name: 'Antony Desvin', team: 'JAF', runs: 23, hs: 23, sr: '74.19', fours: 1, sixes: 2 },
    { name: 'Rashan Wijerathna', team: 'VAV', runs: 23, hs: 23, sr: '82.14', fours: 3, sixes: 1 }
  ];"""

new_batters = """  const topBatters = [
    { name: 'Ashmika Iddamalgoda', team: 'JAF', runs: 79, hs: 79, sr: '97.53', fours: 13, sixes: 1 },
    { name: 'Sathira Vikasitha', team: 'MOR', runs: 48, hs: 48, sr: '76.19', fours: 6, sixes: 0 },
    { name: 'Lahiru Welagedara', team: 'VAV', runs: 35, hs: 35, sr: '112.90', fours: 4, sixes: 2 },
    { name: 'Sivaruban Sivanujan', team: 'JAF', runs: 33, hs: 33, sr: '78.57', fours: 3, sixes: 2 },
    { name: 'Muftee Mysan', team: 'MOR', runs: 33, hs: 33, sr: '117.86', fours: 4, sixes: 1 },
    { name: 'Nadeeshan Bandara', team: 'PER', runs: 28, hs: 28, sr: '57.14', fours: 2, sixes: 0 },
    { name: 'Shanmuganathan Silaxan', team: 'JAF', runs: 26, hs: 26, sr: '92.86', fours: 4, sixes: 1 },
    { name: 'Prabhashana Silva', team: 'WAY', runs: 26, hs: 26, sr: '42.62', fours: 2, sixes: 0 },
    { name: 'Pulitha Sarathchandra', team: 'PER', runs: 26, hs: 26, sr: '37.14', fours: 0, sixes: 0 },
    { name: 'Antony Desvin', team: 'JAF', runs: 23, hs: 23, sr: '74.19', fours: 1, sixes: 2 }
  ];"""
content = content.replace(old_batters, new_batters)

# 2. Update topBowlers
old_bowlers = """  const topBowlers = [
    { name: 'Selvanathan Niroshan', team: 'JAF', wickets: 4, bb: '4/16', econ: '2.91', overs: '5.3' },
    { name: 'Antony Desvin', team: 'JAF', wickets: 3, bb: '3/8', econ: '1.33', overs: '6.0' },
    { name: 'Kevindu Perera', team: 'MOR', wickets: 3, bb: '3/16', econ: '2.67', overs: '6.0' },
    { name: 'Kavindu Bandara', team: 'PER', wickets: 3, bb: '3/28', econ: '4.31', overs: '6.3' },
    { name: 'Behan Wickramasinghe', team: 'MOR', wickets: 2, bb: '2/7', econ: '1.75', overs: '4.0' },
    { name: 'Deshan Ekanayake', team: 'PER', wickets: 2, bb: '2/20', econ: '2.86', overs: '7.0' },
    { name: 'Mohammed Riwaqi', team: 'VAV', wickets: 2, bb: '2/38', econ: '4.75', overs: '8.0' },
    { name: 'Sanithu Wijerathne', team: 'MOR', wickets: 1, bb: '1/15', econ: '1.88', overs: '8.0' },
    { name: 'Kelum Hirudika', team: 'MOR', wickets: 1, bb: '1/10', econ: '2.50', overs: '4.0' },
    { name: 'Lahiru Amarasekara', team: 'MOR', wickets: 1, bb: '1/20', econ: '2.50', overs: '8.0' }
  ];"""
  
new_bowlers = """  const topBowlers = [
    { name: 'Arithassegaran Kinthusan', team: 'RAJ', wickets: 5, bb: '5/25', econ: '2.50', overs: '10.0' },
    { name: 'Selvanathan Niroshan', team: 'JAF', wickets: 4, bb: '4/16', econ: '2.91', overs: '5.3' },
    { name: 'Prabhashana Silva', team: 'WAY', wickets: 3, bb: '3/8', econ: '1.41', overs: '5.4' },
    { name: 'Antony Desvin', team: 'JAF', wickets: 3, bb: '3/8', econ: '1.33', overs: '6.0' },
    { name: 'Kevindu Perera', team: 'MOR', wickets: 3, bb: '3/16', econ: '2.67', overs: '6.0' },
    { name: 'Kavindu Bandara', team: 'PER', wickets: 3, bb: '3/28', econ: '4.31', overs: '6.3' },
    { name: 'Behan Wickramasinghe', team: 'MOR', wickets: 2, bb: '2/7', econ: '1.75', overs: '4.0' },
    { name: 'Deshan Ekanayake', team: 'PER', wickets: 2, bb: '2/20', econ: '2.86', overs: '7.0' },
    { name: 'Mohammed Riwaqi', team: 'VAV', wickets: 2, bb: '2/38', econ: '4.75', overs: '8.0' },
    { name: 'Sanithu Wijerathne', team: 'MOR', wickets: 1, bb: '1/15', econ: '1.88', overs: '8.0' }
  ];"""
content = content.replace(old_bowlers, new_bowlers)

# 3. Update Tournament Stats
old_stats = """        const totalRuns = tournament.totalRuns || 591;
        const totalWickets = tournament.totalWickets || 35;
        const totalBalls = tournament.totalBalls || 858;
        const totalExtras = tournament.totalExtras || 45;
        const totalFours = tournament.totalFours || 54;
        const totalSixes = tournament.totalSixes || 15;
        const totalFifties = 2; // Assuming static for now
        const totalHundreds = 0; // Assuming static for now
        const fiftyPartnerships = 3; // Assuming static for now
        const hundredPartnerships = 1; // Assuming static for now
        const totalMaidens = tournament.totalMaidens || 7;
        const totalDotBalls = tournament.totalDotBalls || 555;
        const totalCatches = tournament.totalCatches || 22;
        const totalStumpings = tournament.totalStumpings || 1;
        const bdryPct = tournament.bdryPct || "51.78";
        const bdryFreq = tournament.bdryFreq || "12.43";
        const dbFreq = tournament.dbFreq || "1.55";"""

new_stats = """        const totalRuns = tournament.totalRuns || 716;
        const totalWickets = tournament.totalWickets || 51;
        const totalBalls = tournament.totalBalls || 1148;
        const totalExtras = tournament.totalExtras || 60;
        const totalFours = tournament.totalFours || 64;
        const totalSixes = tournament.totalSixes || 17;
        const totalFifties = 2; // Assuming static for now
        const totalHundreds = 0; // Assuming static for now
        const fiftyPartnerships = 3; // Assuming static for now
        const hundredPartnerships = 1; // Assuming static for now
        const totalMaidens = tournament.totalMaidens || 9;
        const totalDotBalls = tournament.totalDotBalls || 705;
        const totalCatches = tournament.totalCatches || 28;
        const totalStumpings = tournament.totalStumpings || 1;
        const bdryPct = tournament.bdryPct || "50.00";
        const bdryFreq = tournament.bdryFreq || "14.17";
        const dbFreq = tournament.dbFreq || "1.62";"""
content = content.replace(old_stats, new_stats)

# Ensure "4 Innings" is updated to "6 Innings"
content = re.sub(r'(\d+|\{tournament\.totalInnings\s*\|\|\s*\d+\})\s*Innings', r'6 Innings', content)

with open('c:\\Unicric Stats\\src\\pages\\Tournaments.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Tournaments.jsx perfectly.")
