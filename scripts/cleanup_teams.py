import sqlite3
import os

dbs = [
    r"c:\Unicric Stats\unicric.db",
    r"c:\Unicric Stats\backend\unicric.db"
]

for db_path in dbs:
    if not os.path.exists(db_path):
        continue
    print(f"Cleaning {db_path}...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        teams = cursor.execute('SELECT code, name FROM teams').fetchall()
        for code, name in teams:
            canon_code = code
            name_lower = name.lower()
            if "moratuwa" in name_lower:
                canon_code = "UOM"
            elif "peradeniya" in name_lower:
                canon_code = "PER"
                
            if canon_code != code:
                cursor.execute('UPDATE player_stats SET team_code = ? WHERE team_code = ?', (canon_code, code))
                cursor.execute('UPDATE players SET team_code = ? WHERE team_code = ?', (canon_code, code))
                cursor.execute('UPDATE player_stats SET team_code = ? WHERE team_code = ?', (canon_code, name))
                cursor.execute('UPDATE players SET team_code = ? WHERE team_code = ?', (canon_code, name))
                cursor.execute('DELETE FROM teams WHERE code = ?', (code,))
        
        cursor.execute('INSERT OR IGNORE INTO teams (code, name, short_name, group_name) VALUES (?, ?, ?, ?)', ("UOM", "Moratuwa University", "Moratuwa", "Group C"))
        cursor.execute('INSERT OR IGNORE INTO teams (code, name, short_name, group_name) VALUES (?, ?, ?, ?)', ("PER", "Peradeniya University", "Peradeniya", "Group C"))
        conn.commit()
    except Exception as e:
        print(f"Error on {db_path}: {e}")
    finally:
        conn.close()

print("Done.")
