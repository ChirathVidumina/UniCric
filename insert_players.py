import sqlite3

conn = sqlite3.connect('unicric.db')
cursor = conn.cursor()

# Insert Teams
teams = [
    ('JAF', 'Jaffna University', 'Jaffna', 'Group A'),
    ('VAV', 'Vavuniya University', 'Vavuniya', 'Group A')
]
cursor.executemany('''
    INSERT INTO teams (code, name, short_name, group_name) 
    VALUES (?, ?, ?, ?)
''', teams)

# Insert Players
players = [
    # Jaffna University (All RHB based on PDF)
    ("Sivakaran Venujan", "JAF", "Wicket Keeper", "Right-Hand Batter"),
    ("Shanmuganathan Silaxan", "JAF", "Batter", "Right-Hand Batter"),
    ("Ashmika Iddamalgoda", "JAF", "Batter", "Right-Hand Batter"),
    ("Sivaruban Sivanujan", "JAF", "Batter", "Right-Hand Batter"),
    ("Patkunam Mathushan", "JAF", "Batter", "Right-Hand Batter"),
    ("Antony Desvin", "JAF", "Captain", "Right-Hand Batter"),
    ("K Siyanujan", "JAF", "Batter", "Right-Hand Batter"),
    ("Selvanathan Niroshan", "JAF", "Bowler", "Right-Hand Batter"),
    ("V Priyankan", "JAF", "Batter", "Right-Hand Batter"),
    ("Chalithya Millangoda", "JAF", "Batter", "Right-Hand Batter"),
    ("Ebenezer Johanan", "JAF", "Batter", "Right-Hand Batter"),
    
    # Vavuniya University
    ("Janith Dilshan", "VAV", "Batter", "Left-Hand Batter"),
    ("Ekjfernando", "VAV", "Batter", "Right-Hand Batter"),
    ("Lahiru Welagedara", "VAV", "Wicket Keeper", "Left-Hand Batter"),
    ("Rmid Ranaweera", "VAV", "Batter", "Left-Hand Batter"),
    ("Rashan Wijerathna", "VAV", "Batter", "Left-Hand Batter"),
    ("Sahan Siriwardana", "VAV", "Captain", "Left-Hand Batter"),
    ("Pahan Bimsara", "VAV", "Bowler", "Right-Hand Batter"),
    ("Mohammed Riwaqi", "VAV", "Bowler", "Right-Hand Batter"),
    ("Sithamparalingam Nharthanan", "VAV", "Batter", "Left-Hand Batter"),
    ("Kkirubagaran", "VAV", "Bowler", "Right-Hand Batter"),
    ("Ravichandran Ragulan", "VAV", "Bowler", "Right-Hand Batter"),
]

cursor.executemany('''
    INSERT INTO players (name, team_code, role, batting_style) 
    VALUES (?, ?, ?, ?)
''', players)

conn.commit()
conn.close()
print("Teams and players inserted successfully!")
