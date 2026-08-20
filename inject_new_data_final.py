import os
import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

try:
    from backend.database import Base, engine, SessionLocal, TeamModel, PlayerModel, MatchModel, PlayerStatModel
except ImportError:
    from database import Base, engine, SessionLocal, TeamModel, PlayerModel, MatchModel, PlayerStatModel

def init_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

def main():
    init_db()
    db = SessionLocal()
    
    with open('data1.json', 'r') as f:
        data1 = json.load(f)
        
    team_name_to_code = {}
    
    # 1. Insert Teams
    for t in data1['teams']:
        team_name_to_code[t['name']] = t['team_id']
        team = TeamModel(
            code=t['team_id'],
            name=t['name'],
            short_name=t['name'],
            group_name=f"Group {t['group']}"
        )
        db.add(team)
    
    # Keep track of player stats across the tournament to update PlayerModel
    player_data = {}
    captains = data1.get('captains', {})
    
    def get_player(name, team_code):
        if name not in player_data:
            player_data[name] = {
                'team_code': team_code,
                'role': 'Captain' if name in captains.values() else 'Batter',
                'matches': 0,
                'total_runs': 0,
                'total_balls': 0,
                'total_fours': 0,
                'total_sixes': 0,
                'total_wickets': 0,
                'runs_conceded': 0,
                'overs': 0.0
            }
        return player_data[name]

    # 2. Process Matches
    for i in range(2, 6):
        with open(f'data{i}.json', 'r') as f:
            match_data = json.load(f)
            
        m_id = str(match_data['match_id'])
        
        # Summary format: "Jaffna 271/10 (50.0) - Vavuniya 91/10 (22.3)"
        summary = f"{match_data['team_a']} {match_data['team_a_innings']['total_runs']}/{match_data['team_a_innings']['wickets']} ({match_data['team_a_innings']['overs']}) - {match_data['team_b']} {match_data['team_b_innings']['total_runs']}/{match_data['team_b_innings']['wickets']} ({match_data['team_b_innings']['overs']})"
        
        match = MatchModel(
            id=m_id,
            title=f"{match_data['team_a']} vs {match_data['team_b']}",
            date_label=match_data['date'],
            venue=match_data['ground'],
            status="COMPLETED",
            result=match_data['result'],
            score_summary=summary
        )
        db.add(match)
        
        # Track stats for this specific match
        match_stats = {}
        
        def get_match_stat(p_name, t_code):
            if p_name not in match_stats:
                match_stats[p_name] = {
                    'team_code': t_code,
                    'runs': 0, 'balls': 0, 'fours': 0, 'sixes': 0,
                    'wickets': 0, 'overs': 0.0, 'runs_conceded': 0,
                    'dismissal': 'Not Out', 'is_out': False
                }
            return match_stats[p_name]
        
        for innings_key in ['team_a_innings', 'team_b_innings']:
            innings = match_data[innings_key]
            team_name = innings['team']
            if team_name not in team_name_to_code:
                code = team_name[:3].upper()
                team_name_to_code[team_name] = code
                db.add(TeamModel(code=code, name=team_name, short_name=team_name, group_name="Group C"))
            team_code = team_name_to_code[team_name]
            opp_team_name = match_data['team_b'] if innings_key == 'team_a_innings' else match_data['team_a']
            if opp_team_name not in team_name_to_code:
                code = opp_team_name[:3].upper()
                team_name_to_code[opp_team_name] = code
                db.add(TeamModel(code=code, name=opp_team_name, short_name=opp_team_name, group_name="Group C"))
            opp_team_code = team_name_to_code[opp_team_name]
            
            # Batting
            for batter in innings.get('batting', []):
                p_name = batter['name']
                st = get_match_stat(p_name, team_code)
                st['runs'] = batter['runs']
                st['balls'] = batter['balls']
                st['fours'] = batter['fours']
                st['sixes'] = batter['sixes']
                st['dismissal'] = batter['status']
                st['is_out'] = batter['status'] == 'out'
                
                # Update global player stats
                pd = get_player(p_name, team_code)
                pd['total_runs'] += batter['runs']
                pd['total_balls'] += batter['balls']
                pd['total_fours'] += batter['fours']
                pd['total_sixes'] += batter['sixes']
                
            # Bowling
            for bowler in innings.get('bowling', []):
                p_name = bowler['name']
                st = get_match_stat(p_name, opp_team_code)
                st['overs'] = bowler['overs']
                st['runs_conceded'] = bowler['runs']
                st['wickets'] = bowler['wickets']
                
                pd = get_player(p_name, opp_team_code)
                pd['total_wickets'] += bowler['wickets']
                pd['runs_conceded'] += bowler['runs']
                pd['overs'] += bowler['overs']
                
        # Save MatchStats and increment player matches
        for p_name, st in match_stats.items():
            db.add(PlayerStatModel(
                match_id=m_id,
                player_name=p_name,
                team_code=st['team_code'],
                runs=st['runs'],
                balls=st['balls'],
                fours=st['fours'],
                sixes=st['sixes'],
                wickets=st['wickets'],
                overs=st['overs'],
                runs_conceded=st['runs_conceded'],
                strike_rate=round(st['runs'] / st['balls'] * 100, 2) if st['balls'] > 0 else 0.0,
                economy=round(st['runs_conceded'] / st['overs'], 2) if st['overs'] > 0 else 0.0,
                dismissal=st['dismissal'],
                is_out=st['is_out']
            ))
            player_data[p_name]['matches'] += 1

    # 3. Create PlayerModels
    for p_name, pd in player_data.items():
        sr = round(pd['total_runs'] / pd['total_balls'] * 100, 2) if pd['total_balls'] > 0 else 0.0
        econ = round(pd['runs_conceded'] / pd['overs'], 2) if pd['overs'] > 0 else 0.0
        
        # determine role simply
        role = 'Batter'
        if pd['total_wickets'] > 0 and pd['total_runs'] > 20:
            role = 'All-Rounder'
        elif pd['overs'] > 5:
            role = 'Bowler'
            
        # check if captain
        is_cap = p_name in captains.values()
        if is_cap:
            # Maybe append (C) or leave it
            pass
            
        p = PlayerModel(
            name=p_name,
            team_code=pd['team_code'],
            role=role,
            batting_style='Right-Hand Batter',
            matches=pd['matches'],
            total_runs=pd['total_runs'],
            total_balls=pd['total_balls'],
            total_fours=pd['total_fours'],
            total_sixes=pd['total_sixes'],
            total_wickets=pd['total_wickets'],
            strike_rate=sr,
            economy_rate=econ
        )
        db.add(p)

    db.commit()
    db.close()
    print("Database cleared and injected with new data successfully.")

if __name__ == '__main__':
    main()
