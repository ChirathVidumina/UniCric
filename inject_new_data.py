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
        
    for t in data1['teams']:
        team = TeamModel(
            code=t['team_id'],
            name=t['name'],
            short_name=t['name'],
            group_name=f"Group {t['group']}"
        )
        db.add(team)
    db.commit()
    
    # Process matches
    player_team_map = {}
    captains = data1['captains']
    
    # Map team names to codes
    team_name_to_code = {t['name']: t['team_id'] for t in data1['teams']}
    
    for i in range(2, 5):
        with open(f'data{i}.json', 'r') as f:
            match_data = json.load(f)
            
        m_id = str(match_data['match_id'])
        match = MatchModel(
            id=m_id,
            title=f"{match_data['team_a']} vs {match_data['team_b']}",
            date_label=match_data['date'],
            venue=match_data['ground'],
            status="COMPLETED",
            result=match_data['result'],
            score_summary=f"{match_data['team_a']} {match_data['team_a_innings']['total_runs']}/{match_data['team_a_innings']['wickets']} ({match_data['team_a_innings']['overs']}) - {match_data['team_b']} {match_data['team_b_innings']['total_runs']}/{match_data['team_b_innings']['wickets']} ({match_data['team_b_innings']['overs']})"
        )
        db.add(match)
        
        # Innings
        for innings_key in ['team_a_innings', 'team_b_innings']:
            innings = match_data[innings_key]
            team_code = team_name_to_code[innings['team']]
            
            for batter in innings['batting']:
                p_name = batter['name']
                player_team_map[p_name] = team_code
                
                # We can also add PlayerStatModel for batting
                is_out = batter['status'] == 'out'
                stat = PlayerStatModel(
                    match_id=m_id,
                    player_name=p_name,
                    team_code=team_code,
                    runs=batter['runs'],
                    balls=batter['balls'],
                    fours=batter['fours'],
                    sixes=batter['sixes'],
                    strike_rate=batter['sr'],
                    dismissal=batter['status'],
                    is_out=is_out
                )
                db.add(stat)
                
            # The bowling stats are for the OPPOSITE team, so we need to know the opposite team code
            opp_team_name = match_data['team_b'] if innings_key == 'team_a_innings' else match_data['team_a']
            opp_team_code = team_name_to_code[opp_team_name]
            
            for bowler in innings['bowling']:
                p_name = bowler['name']
                player_team_map[p_name] = opp_team_code
                
                # Check if this player already has a PlayerStatModel in this match (from batting in the other innings)
                # We can do this by querying or just handling it in memory. Let's merge them properly.
                
    db.commit()
    
    # We need to merge batting and bowling stats per player per match
    # Since we might have added them separately, it's better to process stats per player per match
    db.close()

if __name__ == '__main__':
    main()
