import sqlite3

conn = sqlite3.connect('unicric.db')
cursor = conn.cursor()

# Update script to populate player stats
stats = {
    # Jaffna Batsmen
    "Sivakaran Venujan": {"runs": 11, "balls": 47, "fours": 1, "sixes": 0, "sr": 23.40, "w": 0, "econ": 0.0},
    "Shanmuganathan Silaxan": {"runs": 26, "balls": 28, "fours": 4, "sixes": 1, "sr": 92.86, "w": 0, "econ": 0.0},
    "Ashmika Iddamalgoda": {"runs": 79, "balls": 81, "fours": 13, "sixes": 1, "sr": 97.53, "w": 1, "econ": 3.50},
    "Sivaruban Sivanujan": {"runs": 33, "balls": 42, "fours": 3, "sixes": 2, "sr": 78.57, "w": 0, "econ": 9.00},
    "Patkunam Mathushan": {"runs": 10, "balls": 17, "fours": 0, "sixes": 0, "sr": 58.82, "w": 1, "econ": 3.67},
    "Antony Desvin": {"runs": 23, "balls": 31, "fours": 1, "sixes": 2, "sr": 74.19, "w": 3, "econ": 1.33},
    "K Siyanujan": {"runs": 14, "balls": 11, "fours": 2, "sixes": 1, "sr": 127.27, "w": 0, "econ": 10.00},
    "Selvanathan Niroshan": {"runs": 13, "balls": 6, "fours": 0, "sixes": 2, "sr": 216.67, "w": 4, "econ": 2.91},
    "V Priyankan": {"runs": 20, "balls": 15, "fours": 0, "sixes": 0, "sr": 133.33, "w": 0, "econ": 0.0},
    "Chalithya Millangoda": {"runs": 2, "balls": 5, "fours": 0, "sixes": 0, "sr": 40.00, "w": 1, "econ": 6.67},
    "Ebenezer Johanan": {"runs": 16, "balls": 17, "fours": 0, "sixes": 1, "sr": 94.12, "w": 0, "econ": 0.0},

    # Vavuniya Batsmen/Bowlers
    "Janith Dilshan": {"runs": 1, "balls": 10, "fours": 0, "sixes": 0, "sr": 10.00, "w": 1, "econ": 5.40},
    "Ekjfernando": {"runs": 3, "balls": 15, "fours": 0, "sixes": 0, "sr": 20.00, "w": 0, "econ": 0.0},
    "Lahiru Welagedara": {"runs": 35, "balls": 31, "fours": 4, "sixes": 2, "sr": 112.90, "w": 0, "econ": 0.0},
    "Rmid Ranaweera": {"runs": 1, "balls": 6, "fours": 0, "sixes": 0, "sr": 16.67, "w": 0, "econ": 0.0},
    "Rashan Wijerathna": {"runs": 23, "balls": 28, "fours": 3, "sixes": 1, "sr": 82.14, "w": 0, "econ": 0.0},
    "Sahan Siriwardana": {"runs": 3, "balls": 13, "fours": 0, "sixes": 0, "sr": 23.08, "w": 1, "econ": 5.60},
    "Pahan Bimsara": {"runs": 0, "balls": 2, "fours": 0, "sixes": 0, "sr": 0.0, "w": 0, "econ": 9.75},
    "Mohammed Riwaqi": {"runs": 11, "balls": 9, "fours": 2, "sixes": 0, "sr": 122.22, "w": 2, "econ": 4.75},
    "Sithamparalingam Nharthanan": {"runs": 6, "balls": 8, "fours": 1, "sixes": 0, "sr": 75.00, "w": 1, "econ": 5.33},
    "Kkirubagaran": {"runs": 1, "balls": 14, "fours": 0, "sixes": 0, "sr": 7.14, "w": 1, "econ": 4.71},
    "Ravichandran Ragulan": {"runs": 0, "balls": 1, "fours": 0, "sixes": 0, "sr": 0.0, "w": 1, "econ": 3.20},
}

for name, s in stats.items():
    cursor.execute('''
        UPDATE players 
        SET matches = 1,
            total_runs = ?,
            total_balls = ?,
            total_fours = ?,
            total_sixes = ?,
            strike_rate = ?,
            total_wickets = ?,
            economy_rate = ?
        WHERE name = ?
    ''', (s["runs"], s["balls"], s["fours"], s["sixes"], s["sr"], s["w"], s["econ"], name))

conn.commit()
conn.close()
print("Stats updated!")
