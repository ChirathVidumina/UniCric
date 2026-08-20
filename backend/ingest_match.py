import os
import sys
import json
import argparse
from sqlalchemy.orm import Session

# Add the parent directory to sys.path so we can import backend.database
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.database import SessionLocal, TeamModel, PlayerModel, MatchModel, PlayerStatModel, engine, Base

def get_or_create_team(db: Session, team_name: str, team_code: str = None) -> TeamModel:
    team = db.query(TeamModel).filter(TeamModel.name == team_name).first()
    if not team:
        if not team_code:
            team_code = team_name[:3].upper()
        team = TeamModel(code=team_code, name=team_name, short_name=team_name, group_name="Group A")
        db.add(team)
        db.commit()
        db.refresh(team)
    return team

def get_or_create_player(db: Session, name: str, team_code: str) -> PlayerModel:
    player = db.query(PlayerModel).filter(PlayerModel.name == name).first()
    if not player:
        player = PlayerModel(name=name, team_code=team_code, role="Batter")
        db.add(player)
        db.commit()
        db.refresh(player)
    return player

def ingest_json(file_path: str):
    with open(file_path, 'r', encoding='utf-8') as f:
        match_data = json.load(f)

    db = SessionLocal()
    try:
        # 1. Ensure teams exist
        # We try to infer a 3-letter code if the team is completely new
        team_a = get_or_create_team(db, match_data['team_a'])
        team_b = get_or_create_team(db, match_data['team_b'])
        
        # 2. Insert Match
        m_id = str(match_data['match_id'])
        
        # check if match already exists
        existing_match = db.query(MatchModel).filter(MatchModel.id == m_id).first()
        if existing_match:
            print(f"Match {m_id} already exists. Deleting its old stats to overwrite...")
            db.query(PlayerStatModel).filter(PlayerStatModel.match_id == m_id).delete()
            db.delete(existing_match)
            db.commit()
            
        summary = f"{match_data['team_a']} {match_data['team_a_innings']['total_runs']}/{match_data['team_a_innings']['wickets']} ({match_data['team_a_innings']['overs']}) - {match_data['team_b']} {match_data['team_b_innings']['total_runs']}/{match_data['team_b_innings']['wickets']} ({match_data['team_b_innings']['overs']})"

        new_match = MatchModel(
            id=m_id,
            title=f"{match_data['team_a']} vs {match_data['team_b']}",
            date_label=match_data['date'],
            venue=match_data['ground'],
            status="COMPLETED",
            result=match_data['result'],
            score_summary=summary,
            scorecard_json=json.dumps(match_data)
        )
        db.add(new_match)
        
        # 3. Insert Player Stats & Evolve Roles
        for innings_key in ['team_a_innings', 'team_b_innings']:
            innings = match_data[innings_key]
            team_name = innings['team']
            team_obj = get_or_create_team(db, team_name)
            
            # process batting
            for batter in innings.get('batting', []):
                p_name = batter['name']
                player = get_or_create_player(db, p_name, team_obj.code)
                player.matches += 1
                
                fifties = 1 if 50 <= batter['runs'] < 100 else 0
                centuries = 1 if batter['runs'] >= 100 else 0
                
                stat = db.query(PlayerStatModel).filter(PlayerStatModel.match_id == m_id, PlayerStatModel.player_name == p_name).first()
                if not stat:
                    stat = PlayerStatModel(match_id=m_id, player_name=p_name, team_code=team_obj.code)
                    db.add(stat)
                
                stat.runs = batter['runs']
                stat.balls = batter['balls']
                stat.fours = batter['fours']
                stat.sixes = batter['sixes']
                stat.strike_rate = batter['sr']
                stat.fifties = fifties
                stat.centuries = centuries
                stat.dismissal = batter['status']
                stat.is_out = batter['status'].lower() not in ['not out', 'did not bat']
                
            # process bowling
            opp_team_name = match_data['team_b'] if innings_key == 'team_a_innings' else match_data['team_a']
            opp_team_obj = get_or_create_team(db, opp_team_name)
            
            for bowler in innings.get('bowling', []):
                p_name = bowler['name']
                # The bowler is on the OPPOSITE team!
                player = get_or_create_player(db, p_name, opp_team_obj.code)
                
                # Dynamic Role Evolution
                if player.role == 'Batter' and (bowler['overs'] > 0 or bowler['wickets'] > 0):
                    player.role = 'All-Rounder'
                    print(f"[Role Evolved] {p_name} is now an All-Rounder")

                stat = db.query(PlayerStatModel).filter(PlayerStatModel.match_id == m_id, PlayerStatModel.player_name == p_name).first()
                if not stat:
                    stat = PlayerStatModel(match_id=m_id, player_name=p_name, team_code=opp_team_obj.code)
                    db.add(stat)
                    
                stat.wickets = bowler['wickets']
                stat.overs = bowler['overs']
                stat.maidens = bowler.get('maidens', 0)
                stat.runs_conceded = bowler['runs']
                stat.economy = bowler['eco']
                
        db.commit()
        print(f"Successfully ingested match {m_id}: {match_data['team_a']} vs {match_data['team_b']}")
        
    except Exception as e:
        db.rollback()
        print(f"Error during ingestion: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest a Match JSON file")
    parser.add_argument("file", help="Path to the Match JSON file")
    args = parser.parse_args()
    
    # Need to make sure DB is updated if columns missing (SQLAlchemy drop/create doesn't do migrations easily, but we used base earlier)
    # The safest way is to just let SQLAlchemy run (it doesn't alter tables though). 
    # Since we added new columns manually to declarative base, we might need a quick SQL ALTER if sqlite complains.
    
    ingest_json(args.file)
