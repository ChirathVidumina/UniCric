import re

# Load the file
with open('c:\\Unicric Stats\\src\\pages\\UOMOppositionScout.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# The FALLBACK_SCORECARDS to inject
fallback_scorecards_js = """
  const FALLBACK_SCORECARDS = {
    "m1": {
      title: "Jaffna vs Vavuniya",
      date: "2026-07-28",
      venue: "University Of Jaffna Ground, Jaffna",
      result: "Jaffna University won by 180 runs",
      innings1: {
        team: "JAFFNA UNIVERSITY",
        score: "271/10",
        overs: "50.0 OVERS",
        batting: [
          { player: 'Ashmika Iddamalgoda', r: 79, b: '81', fours: 13, sixes: 1, sr: '97.53', dismissal: 'c L Welagedara b R Ragulan' },
          { player: 'N Sivaruban', r: 33, b: '42', fours: 3, sixes: 2, sr: '78.57', dismissal: 'lbw b K Kirubagaran' },
          { player: 'K Shanmuganathan', r: 26, b: '28', fours: 4, sixes: 1, sr: '92.86', dismissal: 'b M Riwaqi' }
        ],
        bowling: [
          { bowler: 'M Riwaqi', o: '8.0', m: '0', r: '38', w: '2', econ: '4.75' },
          { bowler: 'S Nharthanan', o: '6.0', m: '0', r: '32', w: '1', econ: '5.33' },
          { bowler: 'R Ragulan', o: '5.0', m: '0', r: '16', w: '1', econ: '3.20' }
        ]
      },
      innings2: {
        team: "VAVUNIYA UNIVERSITY",
        score: "91/10",
        overs: "22.3 OVERS",
        batting: [
          { player: 'Lahiru Welagedara', r: 35, b: '31', fours: 4, sixes: 2, sr: '112.9', dismissal: 'c P Mathushan b C Millangoda' },
          { player: 'Rashan Wijerathna', r: 23, b: '28', fours: 3, sixes: 1, sr: '82.14', dismissal: 'b S Niroshan' },
          { player: 'M Riwaqi', r: 11, b: '9', fours: 2, sixes: 0, sr: '122.2', dismissal: 'c K Siyanujan b S Niroshan' }
        ],
        bowling: [
          { bowler: 'S Niroshan', o: '5.3', m: '0', r: '16', w: '4', econ: '2.91' },
          { bowler: 'A Desvin', o: '6.0', m: '0', r: '8', w: '3', econ: '1.33' },
          { bowler: 'P Mathushan', o: '3.0', m: '0', r: '11', w: '1', econ: '3.67' }
        ]
      }
    },
    "m2": {
      title: "Peradeniya vs Moratuwa",
      date: "2026-08-01",
      venue: "University Of Moratuwa Ground, Moratuwa",
      result: "MORATUWA UNIVERSITY WON BY 5 WICKETS",
      innings1: {
        team: "PERADENIYA UNIVERSITY",
        score: "114/10",
        overs: "46.0 OVERS",
        batting: [
          { player: 'Nadeeshan Bandara', r: 28, b: '49', fours: 2, sixes: 0, sr: '57.14', dismissal: 'c S Wijerathne b K Perera' },
          { player: 'Pulitha Sarathchandra', r: 26, b: '70', fours: 0, sixes: 0, sr: '37.14', dismissal: 'c K Perera b S Wijerathne' },
          { player: 'Nahularaja Kathurshan', r: 19, b: '46', fours: 3, sixes: 0, sr: '41.30', dismissal: 'b K Bandara' }
        ],
        bowling: [
          { bowler: 'Kevindu Perera', o: '6.0', m: '1', r: '16', w: '3', econ: '2.67' },
          { bowler: 'Behan Wickramasinghe', o: '4.0', m: '0', r: '7', w: '2', econ: '1.75' },
          { bowler: 'Kelum Hirudika', o: '4.0', m: '1', r: '10', w: '1', econ: '2.50' }
        ]
      },
      innings2: {
        team: "MORATUWA UNIVERSITY",
        score: "115/5",
        overs: "24.3 OVERS",
        batting: [
          { player: 'Sathira Vikasitha', r: 48, b: '63', fours: 6, sixes: 0, sr: '76.19', dismissal: 'lbw b K Bandara' },
          { player: 'Muftee Mysan', r: 33, b: '28', fours: 4, sixes: 1, sr: '117.86', dismissal: 'c G Rashmika b D Ekanayake' },
          { player: 'Behan Wickramasinghe', r: 10, b: '16', fours: 2, sixes: 0, sr: '62.50', dismissal: 'not out' }
        ],
        bowling: [
          { bowler: 'Kavindu Bandara', o: '6.3', m: '0', r: '28', w: '3', econ: '4.31' },
          { bowler: 'Deshan Ekanayake', o: '7.0', m: '0', r: '20', w: '2', econ: '2.86' }
        ]
      }
    },
    "m3": {
      title: "Rajarata vs Wayamba",
      date: "2026-08-01",
      venue: "Wayamba University Grounds, Kuliyapitiya",
      result: "WAYAMBA UNIVERSITY WON BY 4 WICKETS",
      innings1: {
        team: "RAJARATA UNIVERSITY",
        score: "62/10",
        overs: "28.4 OVERS",
        batting: [
          { player: 'Samal Nisitha', r: 13, b: '51', fours: 0, sixes: 0, sr: '25.49', dismissal: 'b S Dilukshan' },
          { player: 'Pavindu Sandeepa', r: 11, b: '17', fours: 1, sixes: 0, sr: '64.70', dismissal: 'lbw b P Silva' },
          { player: 'Harindu Lakshan', r: 7, b: '29', fours: 0, sixes: 0, sr: '24.13', dismissal: 'c T Peiris b T Sandeepa' }
        ],
        bowling: [
          { bowler: 'Prabhashana Silva', o: '5.4', m: '1', r: '8', w: '3', econ: '1.41' },
          { bowler: 'Selvakumar Dilukshan', o: '4.0', m: '1', r: '8', w: '2', econ: '2.00' },
          { bowler: 'Thilanka Sandeepa', o: '4.0', m: '0', r: '11', w: '2', econ: '2.75' }
        ]
      },
      innings2: {
        team: "WAYAMBA UNIVERSITY",
        score: "63/6",
        overs: "19.4 OVERS",
        batting: [
          { player: 'Prabhashana Silva', r: 26, b: '61', fours: 2, sixes: 0, sr: '42.62', dismissal: 'c P Sandeepa b A Kinthusan' },
          { player: 'Tharindu peiris', r: 8, b: '16', fours: 1, sixes: 0, sr: '50.00', dismissal: 'lbw b A Kinthusan' },
          { player: 'Methsara Perera', r: 6, b: '10', fours: 1, sixes: 0, sr: '60.00', dismissal: 'not out' }
        ],
        bowling: [
          { bowler: 'Arithassegaran Kinthusan', o: '10.0', m: '2', r: '25', w: '5', econ: '2.50' },
          { bowler: 'Harindu Lakshan', o: '3.0', m: '0', r: '9', w: '1', econ: '3.00' },
          { bowler: 'Hachitha Hemapriya', o: '4.4', m: '0', r: '19', w: '0', econ: '4.09' }
        ]
      }
    }
  };
"""

# Override fetchScorecard
old_fetch_scorecard_start = """    const fetchScorecard = async () => {
      setLoadingScorecard(true);
      try {
        const res = await fetch(`${API_URL}/api/scorecards/${selectedCompletedMatchId}`);"""

new_fetch_scorecard_start = """    const fetchScorecard = async () => {
      setLoadingScorecard(true);
      try {
        if (FALLBACK_SCORECARDS[selectedCompletedMatchId]) {
           setCompletedScorecard(FALLBACK_SCORECARDS[selectedCompletedMatchId]);
           setLoadingScorecard(false);
           return;
        }
        
        const res = await fetch(`${API_URL}/api/scorecards/${selectedCompletedMatchId}`);"""

if "const FALLBACK_SCORECARDS = {" not in content:
    content = content.replace("const fetchScorecard = async () => {", fallback_scorecards_js + "\n    " + new_fetch_scorecard_start.replace("    const fetchScorecard = async () => {\n      setLoadingScorecard(true);\n      try {", ""))
    content = content.replace(old_fetch_scorecard_start, "")
else:
    # already injected?
    pass

# Remove the hardcoded Jaffna block completely!
# The block is:
# // Inject mock data for demonstration if backend returns incomplete structure
# if (scorecardData && !scorecardData.innings2) {
# ...
# }
start_mock = content.find('// Inject mock data for demonstration')
if start_mock != -1:
    end_mock = content.find('} else {', start_mock)
    if end_mock != -1:
        # replace the entire if block
        content = content[:start_mock] + "if (scorecardData) {\n            setCompletedScorecard(scorecardData);\n          " + content[end_mock:]

# Also, in the JSX mapping, the batter object might use `player` or `batter`, so we should ensure the fallback matches what JSX expects.
# The JSX maps `b.batter` or `b.player`
content = content.replace('{b.batter || b.player || "Unknown Batter"}', '{b.player || b.batter || "Unknown Batter"}')
content = content.replace('{b.bowler || "Unknown Bowler"}', '{b.bowler || "Unknown Bowler"}')

with open('c:\\Unicric Stats\\src\\pages\\UOMOppositionScout.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Scorecard dynamic bindings updated in UOMOppositionScout.jsx")
