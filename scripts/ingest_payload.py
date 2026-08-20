import json
import sys
import os

# Adjust path so we can import from backend
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from backend.database import SessionLocal, TeamModel, MatchModel, PlayerModel, PlayerStatModel

def main():
    payload_path = os.path.join(os.path.dirname(__file__), '..', 'tournament_payload.json')
    with open(payload_path, 'r') as f:
        data = json.load(f)

    db = SessionLocal()
    
    # 1. Upsert Teams
    print("Ingesting teams...")
    for t in data.get("teams", []):
        team = db.query(TeamModel).filter(TeamModel.code == t["team_id"]).first()
        if not team:
            team = TeamModel(code=t["team_id"])
            db.add(team)
        
        team.name = t["name"]
        team.short_name = t["name"]
        team.group_name = "Group " + t["group"]
        team.played = t["matches"]
        team.won = t["won"]
        team.lost = t["lost"]
        team.points = t["pts"]
        team.nrr = t["nrr"]
    
    db.commit()

    # 2. Ingest Matches & Player Stats
    print("Ingesting matches...")
    for m in data.get("matches_ingested", []):
        match_id = f"m{m['match_id']}"
        match = db.query(MatchModel).filter(MatchModel.id == match_id).first()
        if not match:
            match = MatchModel(id=match_id)
            db.add(match)
        
        match.title = f"{m['team_a']} vs {m['team_b']}"
        match.date_label = m["date"]
        match.venue = m["ground"]
        match.status = "COMPLETED"
        match.result = m["result"]
        
        team_a_score = f"{m['team_a_innings']['total_runs']}/{m['team_a_innings']['wickets']} ({m['team_a_innings']['overs']})"
        team_b_score = f"{m['team_b_innings']['total_runs']}/{m['team_b_innings']['wickets']} ({m['team_b_innings']['overs']})"
        match.score_summary = f"{m['team_a']} {team_a_score} | {m['team_b']} {team_b_score}"
        
        # We need a quick way to resolve team codes from names
        team_name_to_code = {t.name: t.code for t in db.query(TeamModel).all()}

        # Process innings (batting and bowling)
        # Clear existing player stats for this match to avoid duplicates on re-run
        db.query(PlayerStatModel).filter(PlayerStatModel.match_id == match_id).delete()
        db.commit()

        # A helper dictionary to aggregate stats for each player in this match
        player_match_stats = {}
        
        def init_player(name, team_name):
            if name not in player_match_stats:
                player_match_stats[name] = {
                    "team_code": team_name_to_code.get(team_name, ""),
                    "runs": 0, "balls": 0, "fours": 0, "sixes": 0,
                    "wickets": 0, "overs": 0.0, "runs_conceded": 0,
                    "economy": 0.0, "strike_rate": 0.0, "dismissal": "Not Out", "is_out": False
                }

        # Team A Batting
        for b in m['team_a_innings']['batting']:
            init_player(b['name'], m['team_a'])
            st = player_match_stats[b['name']]
            st['runs'] = b.get('runs') or 0
            st['balls'] = b.get('balls') or 0
            st['fours'] = b.get('fours') or 0
            st['sixes'] = b.get('sixes') or 0
            st['strike_rate'] = b.get('sr') or 0.0
            st['is_out'] = b.get('status') == 'out'
            st['dismissal'] = 'Out' if b.get('status') == 'out' else 'Not Out'

        # Team A Bowling (Bowled by Team B)
        for bw in m['team_a_innings']['bowling']:
            init_player(bw['name'], m['team_b'])
            st = player_match_stats[bw['name']]
            st['overs'] = bw.get('overs') or 0.0
            st['runs_conceded'] = bw.get('runs') or 0
            st['wickets'] = bw.get('wickets') or 0
            st['economy'] = bw.get('eco') or 0.0

        # Team B Batting
        for b in m['team_b_innings']['batting']:
            init_player(b['name'], m['team_b'])
            st = player_match_stats[b['name']]
            st['runs'] = b.get('runs') or 0
            st['balls'] = b.get('balls') or 0
            st['fours'] = b.get('fours') or 0
            st['sixes'] = b.get('sixes') or 0
            st['strike_rate'] = b.get('sr') or 0.0
            st['is_out'] = b.get('status') == 'out'
            st['dismissal'] = 'Out' if b.get('status') == 'out' else 'Not Out'

        # Team B Bowling (Bowled by Team A)
        for bw in m['team_b_innings']['bowling']:
            init_player(bw['name'], m['team_a'])
            st = player_match_stats[bw['name']]
            st['overs'] = bw.get('overs') or 0.0
            st['runs_conceded'] = bw.get('runs') or 0
            st['wickets'] = bw.get('wickets') or 0
            st['economy'] = bw.get('eco') or 0.0
            
        # Insert all aggregated match stats
        for p_name, st in player_match_stats.items():
            psm = PlayerStatModel(
                match_id=match_id,
                player_name=p_name,
                team_code=st['team_code'],
                runs=st['runs'],
                balls=st['balls'],
                fours=st['fours'],
                sixes=st['sixes'],
                wickets=st['wickets'],
                overs=st['overs'],
                runs_conceded=st['runs_conceded'],
                economy=st['economy'],
                strike_rate=st['strike_rate'],
                dismissal=st['dismissal'],
                is_out=st['is_out']
            )
            db.add(psm)
            
            # Upsert into Players table
            player = db.query(PlayerModel).filter(PlayerModel.name == p_name).first()
            if not player:
                player = PlayerModel(
                    name=p_name, 
                    team_code=st['team_code'],
                    role="All-Rounder",  # Defaulting
                    matches=0,
                    total_runs=0, total_balls=0, total_fours=0, total_sixes=0, total_wickets=0
                )
                db.add(player)
            
    db.commit()
    
    # 3. Update Player Aggregates
    print("Updating player aggregates...")
    players = db.query(PlayerModel).all()
    for p in players:
        stats = db.query(PlayerStatModel).filter(PlayerStatModel.player_name == p.name).all()
        p.matches = len(set(s.match_id for s in stats))
        p.total_runs = sum((s.runs or 0) for s in stats)
        p.total_balls = sum((s.balls or 0) for s in stats)
        p.total_fours = sum((s.fours or 0) for s in stats)
        p.total_sixes = sum((s.sixes or 0) for s in stats)
        p.total_wickets = sum((s.wickets or 0) for s in stats)
        
        runs_conc = sum((s.runs_conceded or 0) for s in stats)
        overs = sum((s.overs or 0.0) for s in stats)
        
        p.strike_rate = round((p.total_runs / p.total_balls * 100), 2) if p.total_balls > 0 else 0.0
        p.economy_rate = round((runs_conc / overs), 2) if overs > 0 else 0.0
        
        # Check captains
        captains = data.get("captains", {})
        for team_name, capt_name in captains.items():
            if p.name == capt_name:
                p.role = "Captain (All-Rounder)"
                
    db.commit()
    db.close()
    print("Ingestion complete!")

if __name__ == '__main__':
    main()
