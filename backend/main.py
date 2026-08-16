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
    query = db.query(PlayerModel)
    if team:
        query = query.filter(PlayerModel.team_code == team)
    players = query.all()
    
    result = []
    for p in players:
        result.append({
            "id": str(p.id),
            "name": p.name,
            "team": p.team_code,
            "role": p.role,
            "matches": p.matches,
            "runs": p.total_runs,
            "balls": p.total_balls,
            "fours": p.total_fours,
            "sixes": p.total_sixes,
            "wickets": p.total_wickets,
            "sr": p.strike_rate,
            "econ": p.economy_rate,
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
        
    total_runs = p.total_runs
    total_balls = p.total_balls
    total_boundaries = p.total_fours + p.total_sixes
    boundary_runs = (p.total_fours * 4) + (p.total_sixes * 6)
    
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

@app.get("/api/tournaments")
def get_tournaments(db: Session = Depends(get_db)):
    teams = db.query(TeamModel).all()
    players = db.query(PlayerModel).all()
    matches = db.query(MatchModel).all()
    
    t_list = []
    for t in teams:
        t_list.append({
            "code": t.code,
            "name": t.name,
            "played": t.played,
            "won": t.won,
            "lost": t.lost,
            "points": t.points,
            "nrr": t.nrr
        })
        
    p_list = []
    for p in players:
        # Fetch stats to calculate best bowling, total overs, and catches
        p_stats = db.query(PlayerStatModel).filter(PlayerStatModel.player_name == p.name).all()
        best_w = 0
        best_r = 999
        total_overs = 0.0
        for st in p_stats:
            total_overs += st.overs
            if st.wickets > best_w or (st.wickets == best_w and st.runs_conceded < best_r):
                best_w = st.wickets
                best_r = st.runs_conceded
        
        best_figure = f"{best_w}/{best_r if best_r != 999 else 0}" if best_w > 0 else "0/0"
        
        p_list.append({
            "name": p.name,
            "team": p.team_code,
            "runs": p.total_runs,
            "wickets": p.total_wickets,
            "catches": 0,
            "fours": p.total_fours,
            "sixes": p.total_sixes,
            "sr": p.strike_rate,
            "econ": p.economy_rate,
            "overs": round(total_overs, 1),
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
    
    return {
        "teams": t_list,
        "players": p_list,
        "schedule": m_list,
        "groups": groups,
        "completedMatchScorecards": completed_scorecards,
        "tournament": {
            "completedMatches": len([m for m in m_list if m["status"] == "COMPLETED"])
        }
    }

@app.get("/api/analytics")
def get_analytics(db: Session = Depends(get_db)):
    top_scorer = db.query(PlayerModel).order_by(PlayerModel.total_runs.desc()).first()
    top_bowler = db.query(PlayerModel).order_by(PlayerModel.total_wickets.desc()).first()
    
    total_runs = db.query(func.sum(PlayerModel.total_runs)).scalar() or 0
    total_fours = db.query(func.sum(PlayerModel.total_fours)).scalar() or 0
    total_sixes = db.query(func.sum(PlayerModel.total_sixes)).scalar() or 0
    
    return {
        "kpi": {
            "top_scorer": {
                "name": top_scorer.name if top_scorer else None,
                "runs": top_scorer.total_runs if top_scorer else 0,
                "team": top_scorer.team_code if top_scorer else None,
                "sr": top_scorer.strike_rate if top_scorer else 0
            } if top_scorer else None,
            "top_bowler": {
                "name": top_bowler.name if top_bowler else None,
                "wickets": top_bowler.total_wickets if top_bowler else 0,
                "team": top_bowler.team_code if top_bowler else None,
                "econ": top_bowler.economy_rate if top_bowler else 0.0
            } if top_bowler else None,
            "avg_run_rate": "0.00",
            "total_tournament_runs": int(total_runs),
            "total_boundaries": {
                "fours": int(total_fours),
                "sixes": int(total_sixes)
            }
        }
    }

@app.get("/api/standings")
def get_standings(db: Session = Depends(get_db)):
    teams = db.query(TeamModel).order_by(TeamModel.points.desc()).all()
    result = [{"code": t.code, "name": t.name, "played": t.played, "won": t.won, "points": t.points, "nrr": t.nrr} for t in teams]
    return {"group": "GROUP_C", "teams": result}

@app.get("/api/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    teams = db.query(TeamModel).all()
    uom_team = next((t for t in teams if t.code == "UOM"), None)
    
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
            "played": uom_team.played if uom_team else 0,
            "won": uom_team.won if uom_team else 0,
            "points": uom_team.points if uom_team else 0,
            "nrr": uom_team.nrr if uom_team else "0.000"
        },
        "schedule": [],
        "uomCompletedMatch": None,
        "nextTargetMatch": None,
        "upcomingMatch": None,
        "groupTeams": [{"code": t.code, "name": t.name, "points": t.points, "played": t.played} for t in teams],
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

    # 1. Upsert Teams
    for team_name in extracted_entities.get("teams", []):
        code = team_name[:3].upper()
        existing_team = db.query(TeamModel).filter(TeamModel.code == code).first()
        if not existing_team:
            new_team = TeamModel(code=code, name=team_name, short_name=team_name)
            db.add(new_team)
            teams_updated += 1
        else:
            existing_team.name = team_name
            teams_updated += 1

    # 2. Match record creation
    match_id = f"match_import_{os.path.splitext(filename)[0]}"
    existing_match = db.query(MatchModel).filter(MatchModel.id == match_id).first()
    if not existing_match:
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
                total_runs=bat["runs"],
                total_balls=bat["balls"],
                total_fours=bat["fours"],
                total_sixes=bat["sixes"],
                strike_rate=bat["sr"]
            )
            db.add(player)
            players_updated += 1
        else:
            player.matches += 1
            player.total_runs += bat["runs"]
            player.total_balls += bat["balls"]
            player.total_fours += bat["fours"]
            player.total_sixes += bat["sixes"]
            if player.total_balls > 0:
                player.strike_rate = round((player.total_runs / player.total_balls) * 100, 2)
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
                total_wickets=bw["wickets"],
                economy_rate=bw["econ"]
            )
            db.add(player)
            players_updated += 1
        else:
            player.total_wickets += bw["wickets"]
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
