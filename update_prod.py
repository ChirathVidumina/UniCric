import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from database import SessionLocal, TeamModel, PlayerModel

def update_db():
    db = SessionLocal()
    
    try:
        # Insert Teams
        teams = [
            {'code': 'JAF', 'name': 'Jaffna University', 'short_name': 'Jaffna', 'group_name': 'Group A'},
            {'code': 'VAV', 'name': 'Vavuniya University', 'short_name': 'Vavuniya', 'group_name': 'Group A'}
        ]
        
        for t in teams:
            team = db.query(TeamModel).filter(TeamModel.code == t['code']).first()
            if not team:
                new_team = TeamModel(**t)
                db.add(new_team)
        
        db.commit()

        # Insert/Update Players
        players = [
            # Jaffna Batsmen
            {"name": "Sivakaran Venujan", "team_code": "JAF", "role": "Wicket Keeper", "batting_style": "Right-Hand Batter", "matches": 1, "total_runs": 11, "total_balls": 47, "total_fours": 1, "total_sixes": 0, "strike_rate": 23.40, "total_wickets": 0, "economy_rate": 0.0},
            {"name": "Shanmuganathan Silaxan", "team_code": "JAF", "role": "Batter", "batting_style": "Right-Hand Batter", "matches": 1, "total_runs": 26, "total_balls": 28, "total_fours": 4, "total_sixes": 1, "strike_rate": 92.86, "total_wickets": 0, "economy_rate": 0.0},
            {"name": "Ashmika Iddamalgoda", "team_code": "JAF", "role": "Batter", "batting_style": "Right-Hand Batter", "matches": 1, "total_runs": 79, "total_balls": 81, "total_fours": 13, "total_sixes": 1, "strike_rate": 97.53, "total_wickets": 1, "economy_rate": 3.50},
            {"name": "Sivaruban Sivanujan", "team_code": "JAF", "role": "Batter", "batting_style": "Right-Hand Batter", "matches": 1, "total_runs": 33, "total_balls": 42, "total_fours": 3, "total_sixes": 2, "strike_rate": 78.57, "total_wickets": 0, "economy_rate": 9.00},
            {"name": "Patkunam Mathushan", "team_code": "JAF", "role": "Batter", "batting_style": "Right-Hand Batter", "matches": 1, "total_runs": 10, "total_balls": 17, "total_fours": 0, "total_sixes": 0, "strike_rate": 58.82, "total_wickets": 1, "economy_rate": 3.67},
            {"name": "Antony Desvin", "team_code": "JAF", "role": "Captain", "batting_style": "Right-Hand Batter", "matches": 1, "total_runs": 23, "total_balls": 31, "total_fours": 1, "total_sixes": 2, "strike_rate": 74.19, "total_wickets": 3, "economy_rate": 1.33},
            {"name": "K Siyanujan", "team_code": "JAF", "role": "Batter", "batting_style": "Right-Hand Batter", "matches": 1, "total_runs": 14, "total_balls": 11, "total_fours": 2, "total_sixes": 1, "strike_rate": 127.27, "total_wickets": 0, "economy_rate": 10.00},
            {"name": "Selvanathan Niroshan", "team_code": "JAF", "role": "Bowler", "batting_style": "Right-Hand Batter", "matches": 1, "total_runs": 13, "total_balls": 6, "total_fours": 0, "total_sixes": 2, "strike_rate": 216.67, "total_wickets": 4, "economy_rate": 2.91},
            {"name": "V Priyankan", "team_code": "JAF", "role": "Batter", "batting_style": "Right-Hand Batter", "matches": 1, "total_runs": 20, "total_balls": 15, "total_fours": 0, "total_sixes": 0, "strike_rate": 133.33, "total_wickets": 0, "economy_rate": 0.0},
            {"name": "Chalithya Millangoda", "team_code": "JAF", "role": "Batter", "batting_style": "Right-Hand Batter", "matches": 1, "total_runs": 2, "total_balls": 5, "total_fours": 0, "total_sixes": 0, "strike_rate": 40.00, "total_wickets": 1, "economy_rate": 6.67},
            {"name": "Ebenezer Johanan", "team_code": "JAF", "role": "Batter", "batting_style": "Right-Hand Batter", "matches": 1, "total_runs": 16, "total_balls": 17, "total_fours": 0, "total_sixes": 1, "strike_rate": 94.12, "total_wickets": 0, "economy_rate": 0.0},

            # Vavuniya Batsmen/Bowlers
            {"name": "Janith Dilshan", "team_code": "VAV", "role": "Batter", "batting_style": "Left-Hand Batter", "matches": 1, "total_runs": 1, "total_balls": 10, "total_fours": 0, "total_sixes": 0, "strike_rate": 10.00, "total_wickets": 1, "economy_rate": 5.40},
            {"name": "Ekjfernando", "team_code": "VAV", "role": "Batter", "batting_style": "Right-Hand Batter", "matches": 1, "total_runs": 3, "total_balls": 15, "total_fours": 0, "total_sixes": 0, "strike_rate": 20.00, "total_wickets": 0, "economy_rate": 0.0},
            {"name": "Lahiru Welagedara", "team_code": "VAV", "role": "Wicket Keeper", "batting_style": "Left-Hand Batter", "matches": 1, "total_runs": 35, "total_balls": 31, "total_fours": 4, "total_sixes": 2, "strike_rate": 112.90, "total_wickets": 0, "economy_rate": 0.0},
            {"name": "Rmid Ranaweera", "team_code": "VAV", "role": "Batter", "batting_style": "Left-Hand Batter", "matches": 1, "total_runs": 1, "total_balls": 6, "total_fours": 0, "total_sixes": 0, "strike_rate": 16.67, "total_wickets": 0, "economy_rate": 0.0},
            {"name": "Rashan Wijerathna", "team_code": "VAV", "role": "Batter", "batting_style": "Left-Hand Batter", "matches": 1, "total_runs": 23, "total_balls": 28, "total_fours": 3, "total_sixes": 1, "strike_rate": 82.14, "total_wickets": 0, "economy_rate": 0.0},
            {"name": "Sahan Siriwardana", "team_code": "VAV", "role": "Captain", "batting_style": "Left-Hand Batter", "matches": 1, "total_runs": 3, "total_balls": 13, "total_fours": 0, "total_sixes": 0, "strike_rate": 23.08, "total_wickets": 1, "economy_rate": 5.60},
            {"name": "Pahan Bimsara", "team_code": "VAV", "role": "Bowler", "batting_style": "Right-Hand Batter", "matches": 1, "total_runs": 0, "total_balls": 2, "total_fours": 0, "total_sixes": 0, "strike_rate": 0.0, "total_wickets": 0, "economy_rate": 9.75},
            {"name": "Mohammed Riwaqi", "team_code": "VAV", "role": "Bowler", "batting_style": "Right-Hand Batter", "matches": 1, "total_runs": 11, "total_balls": 9, "total_fours": 2, "total_sixes": 0, "strike_rate": 122.22, "total_wickets": 2, "economy_rate": 4.75},
            {"name": "Sithamparalingam Nharthanan", "team_code": "VAV", "role": "Batter", "batting_style": "Left-Hand Batter", "matches": 1, "total_runs": 6, "total_balls": 8, "total_fours": 1, "total_sixes": 0, "strike_rate": 75.00, "total_wickets": 1, "economy_rate": 5.33},
            {"name": "Kkirubagaran", "team_code": "VAV", "role": "Bowler", "batting_style": "Right-Hand Batter", "matches": 1, "total_runs": 1, "total_balls": 14, "total_fours": 0, "total_sixes": 0, "strike_rate": 7.14, "total_wickets": 1, "economy_rate": 4.71},
            {"name": "Ravichandran Ragulan", "team_code": "VAV", "role": "Bowler", "batting_style": "Right-Hand Batter", "matches": 1, "total_runs": 0, "total_balls": 1, "total_fours": 0, "total_sixes": 0, "strike_rate": 0.0, "total_wickets": 1, "economy_rate": 3.20},
        ]

        for p_data in players:
            player = db.query(PlayerModel).filter(PlayerModel.name == p_data["name"]).first()
            if not player:
                new_player = PlayerModel(**p_data)
                db.add(new_player)
            else:
                for k, v in p_data.items():
                    setattr(player, k, v)
        
        db.commit()
        print("Successfully updated production DB!")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == '__main__':
    update_db()
