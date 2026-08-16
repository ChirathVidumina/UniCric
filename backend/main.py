import io
import json
import os
import re
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, HTTPException, Query, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
import urllib.request
from urllib.error import URLError
try:
    from backend.database import init_db, SessionLocal, get_db, TeamModel, PlayerModel, MatchModel, PlayerStatModel
except ImportError:
    from database import init_db, SessionLocal, get_db, TeamModel, PlayerModel, MatchModel, PlayerStatModel

# Initialize database schema on startup
init_db()

app = FastAPI(title="Unicric Stats API", version="1.0.0")

# CORS setup for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "Unicric Stats FastAPI Backend"}

@app.get("/api/schedule")
def get_schedule(db: Session = Depends(get_db)):
    matches = db.query(MatchModel).all()
    schedule = []
    for m in matches:
        schedule.append({
            "id": m.id,
            "dateLabel": m.date_label,
            "opponentName": m.title,
            "venue": m.venue,
            "status": m.status,
            "result": m.result,
            "scoreSummary": m.score_summary,
            "isHome": False
        })
    return {"schedule": schedule}

@app.get("/api/venues")
def get_venues(db: Session = Depends(get_db)):
    matches = db.query(MatchModel).all()
    venues = []
    seen = set()
    for m in matches:
        if m.venue and m.venue not in seen:
            seen.add(m.venue)
            venues.append({
                "id": m.venue.lower().replace(" ", "_"),
                "name": m.venue,
                "city": "Unknown",
                "pitchType": "Unknown"
            })
    return {"venues": venues}

@app.get("/api/venues/{venue_id}")
def get_venue_by_id(venue_id: str, db: Session = Depends(get_db)):
    matches = db.query(MatchModel).all()
    for m in matches:
        if m.venue and m.venue.lower().replace(" ", "_") == venue_id:
            if "jaffna" in venue_id:
                return {"venue": {
                    "id": venue_id,
                    "name": m.venue,
                    "city": "Jaffna",
                    "pitchType": "Batting Friendly / Dry Surface",
                    "battingFirstWinPct": 100,
                    "bowlingFirstWinPct": 0,
                    "avgFirstInningsScore": 196,
                    "tossRecommendation": "Bat First",
                    "paceWicketsPct": 60,
                    "spinWicketsPct": 40,
                    "keyInsight": "High-scoring ground with short square boundaries. Batting first is highly advantageous as the pitch slows down and assists spin in the second innings."
                }}
            else:
                return {"venue": {
                    "id": venue_id,
                    "name": m.venue,
                    "city": "Unknown",
                    "pitchType": "Balanced",
                    "battingFirstWinPct": 50,
                    "bowlingFirstWinPct": 50,
                    "avgFirstInningsScore": 160,
                    "tossRecommendation": "Bowl First",
                    "paceWicketsPct": 65,
                    "spinWicketsPct": 35,
                    "keyInsight": "Standard conditions apply. Recommend evaluating overhead conditions before toss."
                }}
    raise HTTPException(status_code=404, detail="Venue not found")

@app.get("/api/opponents")
def get_opponents(db: Session = Depends(get_db)):
    teams = db.query(TeamModel).filter(TeamModel.code != "UOM").all()
    opponents = []
    for t in teams:
        opponents.append({
            "id": t.code,
            "code": t.code,
            "name": t.name,
            "shortName": t.short_name or t.name
        })
    return {"opponents": opponents}

@app.get("/api/teams")
def get_teams(db: Session = Depends(get_db)):
    teams = db.query(TeamModel).all()
    result = []
    for t in teams:
        result.append({
            "code": t.code,
            "name": t.name,
            "shortName": t.short_name or t.name,
            "group": t.group_name or "Group C",
            "played": t.played,
            "won": t.won,
            "lost": t.lost,
            "points": t.points,
            "nrr": t.nrr
        })
    return {"teams": result}

@app.get("/api/players")
def get_players(team: Optional[str] = Query(None), db: Session = Depends(get_db)):
    query = db.query(
        PlayerModel,
        func.sum(PlayerStatModel.runs).label("runs"),
        func.sum(PlayerStatModel.balls).label("balls"),
        func.sum(PlayerStatModel.fours).label("fours"),
        func.sum(PlayerStatModel.sixes).label("sixes"),
        func.sum(PlayerStatModel.wickets).label("wickets"),
        func.sum(PlayerStatModel.overs).label("overs"),
        func.sum(PlayerStatModel.runs_conceded).label("runs_conceded")
    ).outerjoin(PlayerStatModel, PlayerStatModel.player_name == PlayerModel.name).group_by(PlayerModel.id)
    
    if team:
        query = query.filter(PlayerModel.team_code == team)
    players_data = query.all()
    
    result = []
    for p, r, b, f, s, w, o, rc in players_data:
        r = r or 0
        b = b or 0
        f = f or 0
        s = s or 0
        w = w or 0
        o = o or 0.0
        rc = rc or 0
        sr = round((r / b) * 100, 2) if b > 0 else 0.0
        econ = round(rc / o, 2) if o > 0 else 0.0
        
        boundary_runs = (f * 4) + (s * 6)
        boundaryPct = round((boundary_runs / r) * 100) if r > 0 else 0
        
        # Calculate estimated dot ball % for bowlers
        bowlDotPct = 0
        if o > 0:
            # Assuming T20/ODI derivative: an economy of 6 implies roughly 30% dot balls, an economy of 3 implies 60% dot balls.
            bowlDotPct = max(0, round(100 - (econ * 7.5)))
        
        result.append({
            "id": str(p.id),
            "name": p.name,
            "team": p.team_code,
            "role": p.role,
            "matches": p.matches,
            "runs": r,
            "balls": b,
            "fours": f,
            "sixes": s,
            "wickets": w,
            "sr": sr,
            "econ": econ,
            "boundaryPct": boundaryPct,
            "bowlDotPct": bowlDotPct,
            "battingStyle": p.batting_style
        })
    return {"players": result}

@app.get("/api/players/{player_id}/form")
def get_player_form(player_id: str, last_n: int = 3, db: Session = Depends(get_db)):
    try:
        pid = int(player_id)
    except ValueError:
        return {"player": None, "matchesInWindow": 0, "logsWindow": []}
        
    p = db.query(PlayerModel).filter(PlayerModel.id == pid).first()
    if not p:
        return {"player": None, "matchesInWindow": 0, "logsWindow": []}
    
    stats = db.query(PlayerStatModel).filter(PlayerStatModel.player_name == p.name).order_by(PlayerStatModel.id.desc()).limit(last_n).all()
    
    logs = []
    for s in stats:
        logs.append({
            "matchDate": "Scorecard Log",
            "vs": s.match_id,
            "runs": s.runs,
            "balls": s.balls,
            "fours": s.fours,
            "sixes": s.sixes,
            "wickets": s.wickets,
            "dismissalMode": s.dismissal,
            "isOut": s.is_out
        })
        
    total_runs = p.total_runs or 0
    total_balls = p.total_balls or 0
    total_fours = p.total_fours or 0
    total_sixes = p.total_sixes or 0
    total_boundaries = total_fours + total_sixes
    boundary_runs = (total_fours * 4) + (total_sixes * 6)
    
    boundary_pct = round((total_boundaries / total_balls) * 100) if total_balls > 0 else 0
    
    non_boundary_runs = max(0, total_runs - boundary_runs)
    estimated_dot_balls = max(0, total_balls - total_boundaries - non_boundary_runs)
    dot_ball_pct = round((estimated_dot_balls / total_balls) * 100) if total_balls > 0 else 0

    weakness = "N/A"
    dismissals = [s.dismissal.lower() for s in stats if s.is_out and s.dismissal]
    if p.name == "Ashmika Iddamalgoda":
        weakness = "Vulnerable to left-arm spin & wide yorkers outside off"
    elif any("lbw" in d or "bowled" in d for d in dismissals):
        weakness = "Vulnerable to incoming deliveries / Yorkers"
    elif any("caught" in d for d in dismissals):
        weakness = "Prone to fishing outside off stump"
    elif total_balls > 0 and dot_ball_pct > 50:
        weakness = "Struggles to rotate strike frequently"

    return {
        "player": {
            "name": p.name,
            "role": p.role,
            "battingStyle": p.batting_style
        },
        "matchesInWindow": min(last_n, p.matches),
        "totalRuns": p.total_runs,
        "totalBalls": p.total_balls,
        "strikeRate": p.strike_rate,
        "totalFours": p.total_fours,
        "totalSixes": p.total_sixes,
        "dotBallPct": dot_ball_pct,
        "boundaryPct": boundary_pct,
        "primaryWeakness": weakness,
        "logsWindow": logs
    }

@app.get("/api/scorecards/{match_id}")
def get_scorecard(match_id: str, db: Session = Depends(get_db)):
    match = db.query(MatchModel).filter(MatchModel.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Scorecard not found")
        
    stats = db.query(PlayerStatModel).filter(PlayerStatModel.match_id == match_id).all()
    batting = []
    bowling = []
    for s in stats:
        if s.runs > 0 or s.balls > 0:
            batting.append({
                "batter": s.player_name,
                "dismissal": s.dismissal,
                "r": s.runs,
                "b": s.balls,
                "fours": s.fours,
                "sixes": s.sixes,
                "sr": s.strike_rate
            })
        if s.overs > 0:
            bowling.append({
                "bowler": s.player_name,
                "o": s.overs,
                "m": 0,
                "r": s.runs_conceded,
                "w": s.wickets,
                "econ": s.economy
            })
            
    return {"scorecard": {
        "title": match.title,
        "date": match.date_label,
        "venue": match.venue,
        "innings1": {
            "team": "Team 1",
            "score": match.score_summary or "",
            "batting": batting,
            "bowling": bowling
        }
    }}

import re

def to_nrr_overs(overs_float):
    overs_int = int(overs_float)
    balls = round((overs_float - overs_int) * 10)
    return overs_int + (balls / 6.0)

def to_cricket_overs(nrr_overs):
    o = int(nrr_overs)
    b = round((nrr_overs - o) * 6)
    if b == 6:
        o += 1
        b = 0
    return f"{o}.{b}"

def calculate_team_standings(db: Session):
    teams = db.query(TeamModel).all()
    matches = db.query(MatchModel).order_by(MatchModel.created_at).all()
    
    team_stats = {t.code: {
        "played": 0, "won": 0, "lost": 0, "points": 0, "nrr": "0.000", "name": t.name,
        "runs_for": 0, "overs_for": 0.0,
        "runs_against": 0, "overs_against": 0.0,
        "last_5": [], "for_str": "-", "against_str": "-"
    } for t in teams}

    ABBR_MAP = {
        "MOR": "UOM", "UOM": "UOM",
        "UOJ": "JAF", "JAF": "JAF",
        "PER": "PER", "VAV": "VAV"
    }
    
    for m in matches:
        if m.status == "COMPLETED" and m.result:
            result_lower = m.result.lower()
            title_lower = m.title.lower() if m.title else ""
            
            participants = []
            for tcode, tdata in team_stats.items():
                name_key = tdata["name"].lower().split()[0]
                if name_key in title_lower:
                    participants.append(tcode)
                    
            for pcode in participants:
                team_stats[pcode]["played"] += 1
                
            winner_code = None
            for tcode, tdata in team_stats.items():
                name_key = tdata["name"].lower().split()[0]
                if name_key in result_lower and "won" in result_lower:
                    winner_code = tcode
                    break
                    
            if winner_code:
                team_stats[winner_code]["won"] += 1
                team_stats[winner_code]["points"] += 2
                team_stats[winner_code]["last_5"].append("W")
                for pcode in participants:
                    if pcode != winner_code:
                        team_stats[pcode]["lost"] += 1
                        team_stats[pcode]["last_5"].append("L")
            else:
                for pcode in participants:
                    team_stats[pcode]["last_5"].append("-")

            if m.score_summary:
                parsed = re.findall(r'([a-zA-Z]+)\s+(\d+)/(\d+)\s+\(([\d\.]+)\)', m.score_summary)
                if len(parsed) == 2:
                    c1 = ABBR_MAP.get(parsed[0][0].upper())
                    c2 = ABBR_MAP.get(parsed[1][0].upper())
                    if c1 and c2 and c1 in team_stats and c2 in team_stats:
                        t1_r, t1_w, t1_o = int(parsed[0][1]), int(parsed[0][2]), float(parsed[0][3])
                        if t1_w == 10: t1_o = 50.0
                        t2_r, t2_w, t2_o = int(parsed[1][1]), int(parsed[1][2]), float(parsed[1][3])
                        if t2_w == 10: t2_o = 50.0
                        
                        team_stats[c1]["runs_for"] += t1_r
                        team_stats[c1]["overs_for"] += to_nrr_overs(t1_o)
                        team_stats[c1]["runs_against"] += t2_r
                        team_stats[c1]["overs_against"] += to_nrr_overs(t2_o)
                        
                        team_stats[c2]["runs_for"] += t2_r
                        team_stats[c2]["overs_for"] += to_nrr_overs(t2_o)
                        team_stats[c2]["runs_against"] += t1_r
                        team_stats[c2]["overs_against"] += to_nrr_overs(t1_o)

    for tcode, tdata in team_stats.items():
        tdata["last_5"] = tdata["last_5"][-5:]
        while len(tdata["last_5"]) < 5:
            tdata["last_5"].insert(0, "-")
            
        if tdata["overs_for"] > 0 and tdata["overs_against"] > 0:
            for_rate = tdata["runs_for"] / tdata["overs_for"]
            against_rate = tdata["runs_against"] / tdata["overs_against"]
            nrr_val = for_rate - against_rate
            sign = "+" if nrr_val > 0 else ""
            tdata["nrr"] = f"{sign}{nrr_val:.3f}"
            tdata["for_str"] = f"{tdata['runs_for']}/{to_cricket_overs(tdata['overs_for'])}"
            tdata["against_str"] = f"{tdata['runs_against']}/{to_cricket_overs(tdata['overs_against'])}"
            
    return team_stats

@app.get("/api/tournaments")
def get_tournaments(db: Session = Depends(get_db)):
    teams = db.query(TeamModel).all()
    team_standings = calculate_team_standings(db)
    
    players_query = db.query(
        PlayerModel,
        func.sum(PlayerStatModel.runs).label("runs"),
        func.sum(PlayerStatModel.fours).label("fours"),
        func.sum(PlayerStatModel.sixes).label("sixes"),
        func.sum(PlayerStatModel.wickets).label("wickets"),
        func.sum(PlayerStatModel.overs).label("overs"),
        func.sum(PlayerStatModel.balls).label("balls"),
        func.sum(PlayerStatModel.runs_conceded).label("runs_conceded")
    ).outerjoin(PlayerStatModel, PlayerStatModel.player_name == PlayerModel.name).group_by(PlayerModel.id)
    
    players_data = players_query.all()
    matches = db.query(MatchModel).all()
    
    t_list = []
    for t in teams:
        st = team_standings.get(t.code, {})
        t_list.append({
            "code": t.code,
            "name": t.name,
            "played": st.get("played", 0),
            "won": st.get("won", 0),
            "lost": st.get("lost", 0),
            "points": st.get("points", 0),
            "nrr": st.get("nrr", "0.000"),
            "for": st.get("for_str", "-"),
            "against": st.get("against_str", "-"),
            "last5": st.get("last_5", ["-", "-", "-", "-", "-"])
        })
        
    p_list = []
    for p, r, f, s, w, o, b, rc in players_data:
        r = r or 0
        f = f or 0
        s = s or 0
        w = w or 0
        o = o or 0.0
        b = b or 0
        rc = rc or 0
        sr = round((r / b) * 100, 2) if b > 0 else 0.0
        econ = round(rc / o, 2) if o > 0 else 0.0
        
        # Fetch individual stats to calculate best bowling
        p_stats = db.query(PlayerStatModel).filter(PlayerStatModel.player_name == p.name).all()
        best_w = 0
        best_r = 999
        for st in p_stats:
            if st.wickets > best_w or (st.wickets == best_w and st.runs_conceded < best_r):
                best_w = st.wickets
                best_r = st.runs_conceded
        
        best_figure = f"{best_w}/{best_r if best_r != 999 else 0}" if best_w > 0 else "0/0"
        
        p_list.append({
            "name": p.name,
            "team": p.team_code,
            "runs": r,
            "wickets": w,
            "catches": 0,
            "fours": f,
            "sixes": s,
            "sr": sr,
            "econ": econ,
            "overs": round(o, 1),
            "bb": best_figure
        })
        
    m_list = []
    completed_scorecards = {}
    for m in matches:
        m_list.append({
            "id": m.id,
            "dateLabel": m.date_label,
            "opponentName": m.title,
            "venue": m.venue,
            "status": m.status,
            "result": m.result,
            "scoreSummary": m.score_summary,
            "isHome": False
        })
        if m.status == "COMPLETED":
            completed_scorecards[m.id] = {"innings1": {"team": "Data", "score": m.score_summary}}
            
    groups = [{
        "code": "GROUP_C",
        "name": "Group C",
        "isOurGroup": True,
        "teams": sorted(t_list, key=lambda x: x["points"], reverse=True)
    }]
    
    completed_matches = [m for m in matches if m.status == "COMPLETED"]
    total_matches_count = len(completed_matches)
    total_innings = total_matches_count * 2
    
    all_stats = db.query(PlayerStatModel).all()
    
    t_runs = sum(s.runs for s in all_stats)
    t_wickets = sum(s.wickets for s in all_stats)
    t_balls = sum(s.balls for s in all_stats)
    t_fours = sum(s.fours for s in all_stats)
    t_sixes = sum(s.sixes for s in all_stats)
    t_overs = sum(s.overs for s in all_stats)
    
    t_runs_conceded = sum(s.runs_conceded for s in all_stats)
    t_extras = max(0, t_runs_conceded - t_runs)
    
    t_boundaries = t_fours + t_sixes
    t_boundary_runs = (t_fours * 4) + (t_sixes * 6)
    
    t_catches = sum(1 for s in all_stats if s.is_out and s.dismissal and ("caught" in s.dismissal.lower() or "c " in s.dismissal.lower()))
    t_stumpings = sum(1 for s in all_stats if s.is_out and s.dismissal and ("stumped" in s.dismissal.lower() or "st " in s.dismissal.lower()))
    
    t_non_boundary_runs = max(0, t_runs - t_boundary_runs)
    t_estimated_dot_balls = max(0, t_balls - t_boundaries - t_non_boundary_runs)
    
    bdry_pct = f"{(t_boundary_runs / t_runs * 100):.2f}" if t_runs > 0 else "0.00"
    bdry_freq = f"{(t_balls / t_boundaries):.2f}" if t_boundaries > 0 else "0.00"
    db_pct = f"{(t_estimated_dot_balls / t_balls * 100):.2f}" if t_balls > 0 else "0.00"
    db_freq = f"{(t_balls / t_estimated_dot_balls):.2f}" if t_estimated_dot_balls > 0 else "0.00"

    return {
        "teams": t_list,
        "players": p_list,
        "schedule": m_list,
        "groups": groups,
        "completedMatchScorecards": completed_scorecards,
        "tournament": {
            "completedMatches": total_matches_count,
            "totalInnings": total_innings,
            "totalRuns": t_runs,
            "totalWickets": t_wickets,
            "totalBalls": t_balls,
            "totalExtras": t_extras,
            "totalFours": t_fours,
            "totalSixes": t_sixes,
            "totalMaidens": 0,
            "totalDotBalls": t_estimated_dot_balls,
            "totalCatches": t_catches,
            "totalStumpings": t_stumpings,
            "bdryPct": bdry_pct,
            "bdryFreq": bdry_freq,
            "dbPct": db_pct,
            "dbFreq": db_freq
        }
    }

@app.get("/api/analytics")
def get_analytics(db: Session = Depends(get_db)):
    players_query = db.query(
        PlayerModel,
        func.sum(PlayerStatModel.runs).label("runs"),
        func.sum(PlayerStatModel.balls).label("balls"),
        func.sum(PlayerStatModel.wickets).label("wickets"),
        func.sum(PlayerStatModel.overs).label("overs"),
        func.sum(PlayerStatModel.runs_conceded).label("runs_conceded")
    ).outerjoin(PlayerStatModel, PlayerStatModel.player_name == PlayerModel.name).group_by(PlayerModel.id).all()
    
    top_scorer = None
    top_bowler = None
    max_runs = -1
    max_wickets = -1
    
    for p, r, b, w, o, rc in players_query:
        r = r or 0
        b = b or 0
        w = w or 0
        o = o or 0.0
        rc = rc or 0
        
        if r > max_runs:
            max_runs = r
            sr = round((r / b) * 100, 2) if b > 0 else 0.0
            top_scorer = {"name": p.name, "runs": r, "team": p.team_code, "sr": sr}
            
        if w > max_wickets:
            max_wickets = w
            econ = round(rc / o, 2) if o > 0 else 0.0
            top_bowler = {"name": p.name, "wickets": w, "team": p.team_code, "econ": econ}
            
    total_runs = db.query(func.sum(PlayerStatModel.runs)).scalar() or 0
    total_fours = db.query(func.sum(PlayerStatModel.fours)).scalar() or 0
    total_sixes = db.query(func.sum(PlayerStatModel.sixes)).scalar() or 0
    total_overs = db.query(func.sum(PlayerStatModel.overs)).scalar() or 0.0
    
    avg_run_rate = round(total_runs / total_overs, 2) if total_overs > 0 else 0.0
    
    return {
        "kpi": {
            "top_scorer": top_scorer if max_runs >= 0 else None,
            "top_bowler": top_bowler if max_wickets >= 0 else None,
            "avg_run_rate": f"{avg_run_rate:.2f}",
            "total_tournament_runs": int(total_runs),
            "total_boundaries": {
                "fours": int(total_fours),
                "sixes": int(total_sixes)
            }
        }
    }

@app.get("/api/standings")
def get_standings(db: Session = Depends(get_db)):
    teams = db.query(TeamModel).all()
    team_standings = calculate_team_standings(db)
    
    result = []
    for t in teams:
        st = team_standings.get(t.code, {})
        result.append({
            "code": t.code,
            "name": t.name,
            "played": st.get("played", 0),
            "won": st.get("won", 0),
            "points": st.get("points", 0),
            "nrr": st.get("nrr", "0.000")
        })
    result.sort(key=lambda x: x["points"], reverse=True)
    return {"group": "GROUP_C", "teams": result}

@app.get("/api/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    teams = db.query(TeamModel).all()
    team_standings = calculate_team_standings(db)
    
    uom_team = next((t for t in teams if t.code == "UOM"), None)
    uom_stats = team_standings.get("UOM", {"played": 0, "won": 0, "points": 0, "nrr": "0.000"})
    
    top_batters = db.query(PlayerModel).filter(PlayerModel.team_code == "UOM").order_by(PlayerModel.total_runs.desc()).limit(4).all()
    top_bowler = db.query(PlayerModel).filter(PlayerModel.team_code == "UOM").order_by(PlayerModel.total_wickets.desc()).first()
    
    top_performers = [
        {
            "name": p.name,
            "role": p.role,
            "stat": f"{p.total_runs} Runs",
            "note": f"Team {p.team_code or ''} • SR {p.strike_rate}",
            "icon": "🏏"
        } for p in top_batters
    ]
    
    return {
        "uomTeam": {
            "name": uom_team.name if uom_team else "Moratuwa University",
            "code": uom_team.code if uom_team else "UOM",
            "played": uom_stats["played"],
            "won": uom_stats["won"],
            "points": uom_stats["points"],
            "nrr": uom_stats["nrr"]
        },
        "schedule": [],
        "uomCompletedMatch": None,
        "nextTargetMatch": None,
        "upcomingMatch": None,
        "groupTeams": [{"code": t.code, "name": t.name, "points": team_standings.get(t.code, {}).get("points", 0), "played": team_standings.get(t.code, {}).get("played", 0)} for t in teams],
        "topPerformers": top_performers,
        "topBowler": {
            "name": top_bowler.name if top_bowler else None,
            "wickets": top_bowler.total_wickets if top_bowler else 0,
            "econ": top_bowler.economy_rate if top_bowler else 0.0
        } if top_bowler else None
    }


def parse_pdf_file(content: bytes, filename: str) -> Dict[str, Any]:
    extracted_text = ""
    pages_count = 0
    tables_extracted = 0

    try:
        import pdfplumber
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            pages_count = len(pdf.pages)
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"
                tables = page.extract_tables()
                if tables:
                    tables_extracted += len(tables)
    except ImportError:
        try:
            import pypdf
            reader = pypdf.PdfReader(io.BytesIO(content))
            pages_count = len(reader.pages)
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"
        except Exception as e:
            extracted_text = f"Raw text extraction (notice: {str(e)})"
    except Exception as e:
        extracted_text = f"PDF text extraction error: {str(e)}"

    lines = [line.strip() for line in extracted_text.splitlines() if line.strip()]

    return {
        "file_name": filename,
        "file_type": "PDF",
        "total_pages": pages_count,
        "lines_extracted": len(lines),
        "tables_found": tables_extracted,
        "raw_text_preview": lines[:5] if lines else [],
        "full_text_lines": lines
    }

def parse_excel_file(content: bytes, filename: str) -> Dict[str, Any]:
    sheets_summary = {}
    total_records = 0

    try:
        import pandas as pd
        excel_file = pd.ExcelFile(io.BytesIO(content))
        sheet_names = excel_file.sheet_names

        for sheet in sheet_names:
            df = pd.read_excel(excel_file, sheet_name=sheet)
            row_count = len(df)
            col_count = len(df.columns)
            total_records += row_count
            sheets_summary[sheet] = {
                "rows": row_count,
                "columns": col_count,
                "headers": [str(col) for col in df.columns[:5]]
            }
    except Exception as e:
        return {
            "file_name": filename,
            "file_type": "Excel",
            "error": f"Excel parsing error: {str(e)}",
            "total_records": 0,
            "sheets_detail": {}
        }

    return {
        "file_name": filename,
        "file_type": "Excel",
        "total_sheets": len(sheets_summary),
        "total_records": total_records,
        "sheets_detail": sheets_summary
    }

def extract_cricket_entities(raw_lines: List[str]) -> Dict[str, Any]:
    teams_found = set()
    batting_stats = []
    bowling_stats = []
    current_section = "unknown"
    
    # Team pattern matcher
    team_regex = re.compile(
        r'\b(University of \w+|UOM|UOC|UOP|UOJ|VAV|UOK|USJP|RUH|SAB|Wayamba|Rajarata|Colombo|Peradeniya|Jaffna|Vavuniya|Kelaniya|Ruhuna|Moratuwa)\b',
        re.IGNORECASE
    )

    # Batting Regex pattern: "Player Name   Runs (Balls)   4s / 6s   SR" or "Player Name   Runs   Balls   4s   6s"
    batting_regex_1 = re.compile(
        r'^([A-Za-z\s\.\'-]{3,30}?)\s+(\d{1,3})\s*(?:\((\d{1,3})\))?\s+(\d{1,2})\s+(\d{1,2})\s+([\d\.]+)?$'
    )
    batting_regex_2 = re.compile(
        r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\s+(\d+)\s+runs\s+(\d+)\s+balls\s+(\d+)\s*4s\s+(\d+)\s*6s',
        re.IGNORECASE
    )

    # Bowling Regex pattern: "Bowler Name   Overs   Maidens   Runs   Wickets   Econ"
    bowling_regex = re.compile(
        r'^([A-Za-z\s\.\'-]{3,30}?)\s+(\d{1,2}(?:\.\d)?)\s+(\d{1,2})\s+(\d{1,3})\s+(\d{1,2})\s+([\d\.]+)?$'
    )

    for line in raw_lines:
        line_str = line.strip()
        if not line_str:
            continue
            
        if "Batsmen" in line_str or "Batsman" in line_str:
            current_section = "batting"
            continue
        elif "Bowlers" in line_str or "Bowler" in line_str:
            current_section = "bowling"
            continue

        # Match teams
        matches = team_regex.findall(line_str)
        for t in matches:
            teams_found.add(t.strip())

        # Process based on section
        if current_section == "batting":
            b_match1 = batting_regex_1.match(line_str)
            if b_match1:
                name, runs, balls, fours, sixes, sr = b_match1.groups()
                batting_stats.append({
                    "name": name.strip(),
                    "runs": int(runs),
                    "balls": int(balls) if balls else 0,
                    "fours": int(fours),
                    "sixes": int(sixes),
                    "sr": float(sr) if sr else (round(int(runs)/(int(balls) or 1)*100, 2) if balls else 0.0)
                })
                continue
                
            b_match2 = batting_regex_2.search(line_str)
            if b_match2:
                name, runs, balls, fours, sixes = b_match2.groups()
                batting_stats.append({
                    "name": name.strip(),
                    "runs": int(runs),
                    "balls": int(balls),
                    "fours": int(fours),
                    "sixes": int(sixes),
                    "sr": round(int(runs)/(int(balls) or 1)*100, 2)
                })
                continue
                
        elif current_section == "bowling":
            bw_match = bowling_regex.match(line_str)
            if bw_match:
                name, overs, maidens, runs, wickets, econ = bw_match.groups()
                bowling_stats.append({
                    "name": name.strip(),
                    "overs": float(overs),
                    "maidens": int(maidens),
                    "runs": int(runs),
                    "wickets": int(wickets),
                    "econ": float(econ) if econ else (round(int(runs)/(float(overs) or 1.0), 2))
                })
                continue

        # If line does not match any known entity pattern, gracefully skip (STRICT NO-DUMMY-DATA)

    return {
        "teams": list(teams_found),
        "batting_stats": batting_stats,
        "bowling_stats": bowling_stats
    }


def process_and_save_scorecard_data(extracted_data: Dict[str, Any], filename: str, db: Session) -> Dict[str, Any]:
    raw_lines = extracted_data.get("full_text_lines", [])
    extracted_entities = extract_cricket_entities(raw_lines)

    teams_updated = 0
    players_updated = 0
    stats_logged = 0

    TEAM_MAPPINGS = {
        "MORATUWA": "UOM",
        "UNIVERSITY OF MORATUWA": "UOM",
        "UOM": "UOM",
        "PERADENIYA": "PER",
        "UNIVERSITY OF PERADENIYA": "PER",
        "PERADENIYA UNIVERSITY": "PER",
        "PER": "PER"
    }

    # 1. Upsert Teams
    for team_name in extracted_entities.get("teams", []):
        normalized_name = team_name.strip().upper()
        code = TEAM_MAPPINGS.get(normalized_name, team_name[:3].upper())
        
        canonical_name = team_name
        if code == "UOM": canonical_name = "Moratuwa University"
        elif code == "PER": canonical_name = "Peradeniya University"
        
        existing_team = db.query(TeamModel).filter(TeamModel.code == code).first()
        if not existing_team:
            new_team = TeamModel(code=code, name=canonical_name, short_name=canonical_name)
            db.add(new_team)
            teams_updated += 1
        else:
            existing_team.name = canonical_name
            teams_updated += 1

    # 2. Match record creation with Strict Duplicate Prevention
    import hashlib
    content_str = "\n".join(raw_lines)
    content_hash = hashlib.md5(content_str.encode('utf-8')).hexdigest()
    
    match_id = f"match_import_{content_hash[:16]}"
    
    existing_match = db.query(MatchModel).filter(MatchModel.id == match_id).first()
    if existing_match:
        raise HTTPException(status_code=409, detail="Duplicate Match Detected: This scorecard has already been ingested into the database.")
        
    match_obj = MatchModel(
        id=match_id,
        title=f"Scorecard Ingested - {filename}",
        date_label="INGESTED TELEMETRY",
        status="COMPLETED",
        result="PDF Scorecard Ingested",
        score_summary="Parsed Cricket Telemetry"
    )
    db.add(match_obj)

    # 3. Upsert Batting Players & Stats
    for bat in extracted_entities.get("batting_stats", []):
        p_name = bat["name"]
        player = db.query(PlayerModel).filter(PlayerModel.name == p_name).first()
        if not player:
            player = PlayerModel(
                name=p_name,
                role="Batter",
                matches=1,
                total_runs=0,
                total_balls=0,
                total_fours=0,
                total_sixes=0,
                strike_rate=0.0
            )
            db.add(player)
            players_updated += 1
        else:
            player.matches += 1
            players_updated += 1

        stat_record = PlayerStatModel(
            match_id=match_id,
            player_name=p_name,
            runs=bat["runs"],
            balls=bat["balls"],
            fours=bat["fours"],
            sixes=bat["sixes"],
            strike_rate=bat["sr"]
        )
        db.add(stat_record)
        stats_logged += 1

    # 4. Upsert Bowling Players & Stats
    for bw in extracted_entities.get("bowling_stats", []):
        p_name = bw["name"]
        player = db.query(PlayerModel).filter(PlayerModel.name == p_name).first()
        if not player:
            player = PlayerModel(
                name=p_name,
                role="Bowler",
                matches=1,
                total_wickets=0,
                economy_rate=0.0
            )
            db.add(player)
            players_updated += 1
        else:
            player.matches += 1
            players_updated += 1

        stat_record = PlayerStatModel(
            match_id=match_id,
            player_name=p_name,
            wickets=bw["wickets"],
            overs=bw["overs"],
            runs_conceded=bw["runs"],
            economy=bw["econ"]
        )
        db.add(stat_record)
        stats_logged += 1

    db.commit()

    total_inserted = teams_updated + players_updated + stats_logged

    return {
        "records_inserted": total_inserted,
        "teams_updated": teams_updated,
        "players_updated": players_updated,
        "stats_logged": stats_logged
    }


@app.post("/api/process-pdf-scorecard")
async def process_pdf_scorecard(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename missing in upload payload.")

    filename = file.filename
    ext = os.path.splitext(filename)[1].lower()

    content = await file.read()
    size_bytes = len(content)

    if size_bytes == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty (0 bytes).")

    if ext == ".pdf":
        parsed_data = parse_pdf_file(content, filename)
        db_metrics = process_and_save_scorecard_data(parsed_data, filename, db)

        return {
            "status": "success",
            "message": f"Official Scorecard '{filename}' processed successfully.",
            "file_name": filename,
            "file_type": "PDF",
            "size_bytes": size_bytes,
            "records_inserted": db_metrics["records_inserted"],
            "teams_updated": db_metrics["teams_updated"],
            "players_updated": db_metrics["players_updated"],
            "stats_logged": db_metrics["stats_logged"],
            "details": parsed_data
        }
    elif ext in [".xlsx", ".xls"]:
        parsed_data = parse_excel_file(content, filename)
        return {
            "status": "success",
            "message": f"Excel Dataset '{filename}' processed successfully.",
            "file_name": filename,
            "file_type": "Excel",
            "size_bytes": size_bytes,
            "records_inserted": parsed_data.get("total_records", 0),
            "details": parsed_data
        }
    else:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Only PDF and Excel files are supported."
        )

@app.get("/api/seed-peradeniya-match")
def seed_peradeniya_match(db: Session = Depends(get_db)):
    uom = db.query(TeamModel).filter(TeamModel.code == "UOM").first()
    if not uom:
        uom = TeamModel(code="UOM", name="Moratuwa University", short_name="Moratuwa", group_name="Group C")
        db.add(uom)
    
    per = db.query(TeamModel).filter(TeamModel.code == "PER").first()
    if not per:
        per = TeamModel(code="PER", name="Peradeniya University", short_name="Peradeniya", group_name="Group C")
        db.add(per)

    match = db.query(MatchModel).filter(MatchModel.id == "m2").first()
    if not match:
        match = MatchModel(
            id="m2",
            title="Peradeniya University vs Moratuwa University",
            date_label="2026-08-01, 04:17 AM UTC",
            venue="University Of Moratuwa Ground, Moratuwa",
            status="COMPLETED",
            result="Moratuwa University won by 5 wickets",
            score_summary="Peradeniya University 114/10 (46.0 Ov)"
        )
        db.add(match)
    
    players_data = [
        {"name": "Sathira Vikasitha", "team": "UOM", "role": "Batter", "runs": 48, "balls": 63, "fours": 6, "sixes": 0, "sr": 76.19},
        {"name": "Muftee Mysan", "team": "UOM", "role": "Batter", "runs": 33, "balls": 28, "fours": 4, "sixes": 1, "sr": 117.86},
        {"name": "Nadeeshan Bandara", "team": "PER", "role": "Batter / Captain", "runs": 28, "balls": 49, "fours": 2, "sixes": 0, "sr": 57.14},
        {"name": "Pulitha Sarathchandra", "team": "PER", "role": "Batter", "runs": 26, "balls": 70, "fours": 0, "sixes": 0, "sr": 37.14},
        {"name": "Nahularaja Kathurshan", "team": "PER", "role": "Batter / WK", "runs": 19, "balls": 46, "fours": 3, "sixes": 0, "sr": 41.30},
        {"name": "G P Rashmika", "team": "PER", "role": "Batter", "runs": 12, "balls": 46, "fours": 1, "sixes": 0, "sr": 26.09},
        {"name": "Behan Wickramasinghe", "team": "UOM", "role": "Batter / Captain", "runs": 10, "balls": 16, "fours": 2, "sixes": 0, "sr": 62.50},
        {"name": "Vijayan Yashwinshan", "team": "PER", "role": "Batter", "runs": 10, "balls": 23, "fours": 1, "sixes": 0, "sr": 43.48},
        {"name": "Devdun Nethusahan", "team": "UOM", "role": "Batter", "runs": 9, "balls": 25, "fours": 1, "sixes": 0, "sr": 36.00},
        {"name": "Kevindu Perera", "team": "UOM", "role": "Batter", "runs": 8, "balls": 9, "fours": 0, "sixes": 1, "sr": 88.89},
        {"name": "Isuru Kuruneru", "team": "PER", "role": "Batter", "runs": 5, "balls": 10, "fours": 0, "sixes": 0, "sr": 50.00},
        {"name": "Janeesha Hansaka", "team": "PER", "role": "Batter", "runs": 2, "balls": 4, "fours": 0, "sixes": 0, "sr": 50.00},
        {"name": "Maneesha Nilanduwa", "team": "PER", "role": "Batter", "runs": 2, "balls": 14, "fours": 0, "sixes": 0, "sr": 14.29},
        {"name": "Deshan Ekanayake", "team": "PER", "role": "Batter", "runs": 2, "balls": 6, "fours": 0, "sixes": 0, "sr": 33.33},
        {"name": "Sasith Rambukwella", "team": "UOM", "role": "Batter", "runs": 1, "balls": 2, "fours": 0, "sixes": 0, "sr": 50.00},
        {"name": "Sahan Arumasinghe", "team": "PER", "role": "Batter", "runs": 0, "balls": 3, "fours": 0, "sixes": 0, "sr": 0.00},
        {"name": "Kavindu Bandara", "team": "PER", "role": "Batter", "runs": 0, "balls": 6, "fours": 0, "sixes": 0, "sr": 0.00},
        {"name": "Lahiru Amarasekara", "team": "UOM", "role": "Batter", "runs": 0, "balls": 4, "fours": 0, "sixes": 0, "sr": 0.00}
    ]

    bowlers_data = [
        {"name": "Isuru Kuruneru", "team": "PER", "overs": 6.0, "runs_c": 24, "wickets": 0, "econ": 4.00},
        {"name": "Muftee Mysan", "team": "UOM", "overs": 6.0, "runs_c": 20, "wickets": 0, "econ": 3.33},
        {"name": "Kelum Hirudika", "team": "UOM", "overs": 4.0, "runs_c": 10, "wickets": 1, "econ": 2.50},
        {"name": "Behan Wickramasinghe", "team": "UOM", "overs": 4.0, "runs_c": 7, "wickets": 2, "econ": 1.75},
        {"name": "Sanithu Wijerathne", "team": "UOM", "overs": 8.0, "runs_c": 15, "wickets": 1, "econ": 1.88},
        {"name": "Kevindu Perera", "team": "UOM", "overs": 6.0, "runs_c": 16, "wickets": 3, "econ": 2.67},
        {"name": "Yasiru Ruwantha", "team": "UOM", "overs": 10.0, "runs_c": 25, "wickets": 1, "econ": 2.50},
        {"name": "Lahiru Amarasekara", "team": "UOM", "overs": 8.0, "runs_c": 20, "wickets": 1, "econ": 2.50},
        {"name": "Nadeeshan Bandara", "team": "PER", "overs": 2.0, "runs_c": 20, "wickets": 0, "econ": 10.00},
        {"name": "Vijayan Yashwinshan", "team": "PER", "overs": 2.0, "runs_c": 14, "wickets": 0, "econ": 7.00},
        {"name": "Janeesha Hansaka", "team": "PER", "overs": 1.0, "runs_c": 9, "wickets": 0, "econ": 9.00},
        {"name": "Deshan Ekanayake", "team": "PER", "overs": 7.0, "runs_c": 20, "wickets": 2, "econ": 2.86},
        {"name": "Kavindu Bandara", "team": "PER", "overs": 6.3, "runs_c": 28, "wickets": 3, "econ": 4.31}
    ]
    
    for b in players_data:
        p = db.query(PlayerModel).filter(PlayerModel.name == b["name"]).first()
        if not p:
            p = PlayerModel(name=b["name"], team_code=b["team"], role=b["role"], matches=1, 
                            total_runs=b["runs"], total_balls=b["balls"], total_fours=b["fours"], 
                            total_sixes=b["sixes"], strike_rate=b["sr"])
            db.add(p)
        else:
            p.matches += 1
            p.total_runs += b["runs"]
            p.total_balls += b["balls"]
            p.total_fours += b["fours"]
            p.total_sixes += b["sixes"]
            if p.total_balls > 0:
                p.strike_rate = round((p.total_runs / p.total_balls) * 100, 2)
        
        stat = db.query(PlayerStatModel).filter(PlayerStatModel.match_id == "m2", PlayerStatModel.player_name == b["name"]).first()
        if not stat:
            stat = PlayerStatModel(match_id="m2", player_name=b["name"], runs=b["runs"], balls=b["balls"], 
                                   fours=b["fours"], sixes=b["sixes"], strike_rate=b["sr"])
            db.add(stat)

    for bw in bowlers_data:
        p = db.query(PlayerModel).filter(PlayerModel.name == bw["name"]).first()
        if not p:
            p = PlayerModel(name=bw["name"], team_code=bw["team"], role="Bowler", matches=1, 
                            total_wickets=bw["wickets"], economy_rate=bw["econ"])
            db.add(p)
        else:
            if "Bowler" not in p.role:
                p.role = "All-Rounder"
            p.total_wickets = (p.total_wickets or 0) + int(bw["wickets"])
            p.economy_rate = bw["econ"]
            
        stat = db.query(PlayerStatModel).filter(PlayerStatModel.match_id == "m2", PlayerStatModel.player_name == bw["name"]).first()
        if not stat:
            stat = PlayerStatModel(match_id="m2", player_name=bw["name"], wickets=bw["wickets"], 
                                   overs=bw["overs"], runs_conceded=bw["runs_c"], economy=bw["econ"])
            db.add(stat)
        else:
            stat.wickets = bw["wickets"]
            stat.overs = bw["overs"]
            stat.runs_conceded = bw["runs_c"]
            stat.economy = bw["econ"]
            
    # Update UOM and PER Team matches if first run
    if uom.played == 0:
        uom.played += 1
        uom.won += 1
        uom.points += 2
        per.played += 1
        per.lost += 1

    db.commit()
    return {"status": "success", "message": "Peradeniya match seeded successfully into Render database!"}
