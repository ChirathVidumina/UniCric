import re

with open('c:\\Unicric Stats\\src\\pages\\Tournaments.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# The user might have a broken m3 or an m3 that is a copy of m1.
# We will find the "m3": { ... } block inside FALLBACK_SCORECARDS and replace it.

new_m3 = """    "m3": {
      title: "Rajarata vs Wayamba",
      date: "2026-08-01",
      venue: "Wayamba University Grounds, Kuliyapitiya",
      result: "WAYAMBA UNIVERSITY WON BY 4 WICKETS",
      innings1: {
        team: "RAJARATA UNIVERSITY",
        score: "62/10",
        overs: "28.4 OVERS",
        batting: [
          { player: 'Samal Nisitha', runs: 13, balls: '51', fours: 0, sixes: 0, sr: '25.49', dismissal: 'b S Dilukshan' },
          { player: 'Pavindu Sandeepa', runs: 11, balls: '17', fours: 1, sixes: 0, sr: '64.70', dismissal: 'lbw b P Silva' },
          { player: 'Harindu Lakshan', runs: 7, balls: '29', fours: 0, sixes: 0, sr: '24.13', dismissal: 'c T Peiris b T Sandeepa' }
        ],
        bowling: [
          { bowler: 'Prabhashana Silva', overs: '5.4', maidens: '1', runs: '8', wickets: '3', econ: '1.41' },
          { bowler: 'Selvakumar Dilukshan', overs: '4.0', maidens: '1', runs: '8', wickets: '2', econ: '2.00' },
          { bowler: 'Thilanka Sandeepa', overs: '4.0', maidens: '0', runs: '11', wickets: '2', econ: '2.75' }
        ]
      },
      innings2: {
        team: "WAYAMBA UNIVERSITY",
        score: "63/6",
        overs: "19.4 OVERS",
        batting: [
          { player: 'Prabhashana Silva', runs: 26, balls: '61', fours: 2, sixes: 0, sr: '42.62', dismissal: 'c P Sandeepa b A Kinthusan' },
          { player: 'Tharindu peiris', runs: 8, balls: '16', fours: 1, sixes: 0, sr: '50.00', dismissal: 'lbw b A Kinthusan' },
          { player: 'Methsara Perera', runs: 6, balls: '10', fours: 1, sixes: 0, sr: '60.00', dismissal: 'not out' }
        ],
        bowling: [
          { bowler: 'Arithassegaran Kinthusan', overs: '10.0', maidens: '2', runs: '25', wickets: '5', econ: '2.50' },
          { bowler: 'Harindu Lakshan', overs: '3.0', maidens: '0', runs: '9', wickets: '1', econ: '3.00' },
          { bowler: 'Hachitha Hemapriya', overs: '4.4', maidens: '0', runs: '19', wickets: '0', econ: '4.09' }
        ]
      }
    }"""

m3_regex = re.compile(r'"m3":\s*\{.*?\}(?=\s*};|\s*,\s*"m4")', re.DOTALL)

# Let's see if m3 exists in the file and replace it.
if m3_regex.search(content):
    content = m3_regex.sub(new_m3, content)
else:
    # If it doesn't exist, append it before the end of FALLBACK_SCORECARDS
    # Look for the last } inside FALLBACK_SCORECARDS
    # We can just replace '  };' at the end of FALLBACK_SCORECARDS with ',\n' + new_m3 + '\n  };'
    fallback_regex = re.compile(r'(const FALLBACK_SCORECARDS = \{.*?)(\n\s*\};\s*const completedMatchScorecards)', re.DOTALL)
    content = fallback_regex.sub(lambda m: m.group(1) + ",\n" + new_m3 + m.group(2), content)

with open('c:\\Unicric Stats\\src\\pages\\Tournaments.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Match #3 scorecard.")
