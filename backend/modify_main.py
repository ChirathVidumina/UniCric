import os
import re

file_path = r'c:\Unicric Stats\backend\main.py'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update completed_scorecards
old_scorecards = '''        if m.status == "COMPLETED":
            completed_scorecards[m.id] = {"innings1": {"team": "Data", "score": m.score_summary}}'''
new_scorecards = '''        if m.status == "COMPLETED":
            import json
            if m.scorecard_json:
                completed_scorecards[m.id] = json.loads(m.scorecard_json)
            else:
                completed_scorecards[m.id] = {"title": m.title, "result": m.result, "date": m.date_label, "venue": m.venue}'''
content = content.replace(old_scorecards, new_scorecards)

# 2. Update groups
old_groups = '''    groups = [{
        "code": "GROUP_C",
        "name": "Group C",
        "isOurGroup": True,
        "teams": sorted(t_list, key=lambda x: x["points"], reverse=True)
    }]'''
new_groups = '''    from collections import defaultdict
    group_map = defaultdict(list)
    for t in t_list:
        # Find group name from original teams list
        t_obj = next((x for x in teams if x.code == t["code"]), None)
        g_name = t_obj.group_name if t_obj and t_obj.group_name else "Group C"
        group_map[g_name].append(t)
        
    groups = []
    for g_name, g_teams in group_map.items():
        groups.append({
            "code": g_name.replace(" ", "_").upper(),
            "name": g_name,
            "isOurGroup": g_name == "Group C",
            "teams": sorted(g_teams, key=lambda x: (x["points"], float(x["nrr"].replace("+", ""))), reverse=True)
        })
    groups.sort(key=lambda x: x["name"])'''
content = content.replace(old_groups, new_groups)

# 3. Update Metrics (t_maidens, t_fifties, t_centuries)
old_metrics_sum = '''    t_runs = sum(s.runs for s in all_stats)
    t_wickets = sum(s.wickets for s in all_stats)
    t_balls = sum(s.balls for s in all_stats)
    t_fours = sum(s.fours for s in all_stats)
    t_sixes = sum(s.sixes for s in all_stats)
    t_overs = sum(s.overs for s in all_stats)'''
new_metrics_sum = '''    t_runs = sum(s.runs for s in all_stats)
    t_wickets = sum(s.wickets for s in all_stats)
    t_balls = sum(s.balls for s in all_stats)
    t_fours = sum(s.fours for s in all_stats)
    t_sixes = sum(s.sixes for s in all_stats)
    t_overs = sum(s.overs for s in all_stats)
    
    t_maidens = sum(getattr(s, 'maidens', 0) for s in all_stats)
    t_fifties = sum(getattr(s, 'fifties', 0) for s in all_stats)
    t_centuries = sum(getattr(s, 'centuries', 0) for s in all_stats)'''
content = content.replace(old_metrics_sum, new_metrics_sum)

old_tournament_dict = '''            "totalFours": t_fours,
            "totalSixes": t_sixes,
            "totalMaidens": 0,
            "totalDotBalls": t_estimated_dot_balls,
            "totalCatches": t_catches,
            "totalStumpings": t_stumpings,
            "bdryPct": bdry_pct,
            "bdryFreq": bdry_freq,
            "dbPct": db_pct,
            "dbFreq": db_freq'''
new_tournament_dict = '''            "totalFours": t_fours,
            "totalSixes": t_sixes,
            "totalFifties": t_fifties,
            "totalCenturies": t_centuries,
            "totalMaidens": t_maidens,
            "totalDotBalls": t_estimated_dot_balls,
            "totalCatches": t_catches,
            "totalStumpings": t_stumpings,
            "bdryPct": bdry_pct,
            "bdryFreq": bdry_freq,
            "dbPct": db_pct,
            "dbFreq": db_freq'''
content = content.replace(old_tournament_dict, new_tournament_dict)

# 4. Update /api/analytics with Leaderboards & Venues
old_analytics = '''@app.get("/api/analytics")
def get_analytics(db: Session = Depends(get_db)):
    players_query = db.query(
        PlayerModel,
        func.sum(PlayerStatModel.runs).label("runs"),
        func.sum(PlayerStatModel.balls).label("balls"),
        func.sum(PlayerStatModel.wickets).label("wickets"),
        func.sum(PlayerStatModel.overs).label("overs"),
        func.sum(PlayerStatModel.runs_conceded).label("runs_conceded")
    ).outerjoin(PlayerStatModel, PlayerStatModel.player_name == PlayerModel.name).group_by(PlayerModel.id).all()'''
new_analytics = '''@app.get("/api/analytics")
def get_analytics(db: Session = Depends(get_db)):
    # Re-calculate leaderboards dynamically
    all_players = db.query(PlayerModel).all()
    all_stats = db.query(PlayerStatModel).all()
    
    p_stats = {}
    for p in all_players:
        p_stats[p.name] = {"team": p.team_code, "runs": 0, "balls": 0, "wickets": 0, "overs": 0.0, "runs_conceded": 0, "catches": 0, "stumpings": 0, "highest_score": 0}
        
    for s in all_stats:
        if s.player_name not in p_stats:
            continue
        p = p_stats[s.player_name]
        p["runs"] += s.runs
        p["balls"] += s.balls
        p["wickets"] += s.wickets
        p["overs"] += s.overs
        p["runs_conceded"] += s.runs_conceded
        if s.runs > p["highest_score"]:
            p["highest_score"] = s.runs
        if s.is_out and s.dismissal:
            d = s.dismissal.lower()
            if "c " in d and s.player_name.lower() in d.split(" b ")[0]:
                p["catches"] += 1
            if "st " in d and s.player_name.lower() in d.split(" b ")[0]:
                p["stumpings"] += 1

    for name, st in p_stats.items():
        st["name"] = name
        st["sr"] = round((st["runs"] / st["balls"]) * 100, 2) if st["balls"] > 0 else 0.0
        st["econ"] = round(st["runs_conceded"] / st["overs"], 2) if st["overs"] > 0 else 0.0

    players_list = list(p_stats.values())
    orange_cap = sorted(players_list, key=lambda x: (x["runs"], x["highest_score"], x["sr"]), reverse=True)[:10]
    purple_cap = sorted([p for p in players_list if p["wickets"] > 0], key=lambda x: (x["wickets"], -x["econ"]), reverse=True)[:10]
    silver_glove = sorted([p for p in players_list if (p["catches"] + p["stumpings"]) > 0], key=lambda x: (x["catches"] + x["stumpings"]), reverse=True)[:10]

    # Venue Insights
    matches = db.query(MatchModel).filter(MatchModel.status == "COMPLETED").all()
    venues = {}
    for m in matches:
        v = m.venue or "Unknown"
        if v not in venues:
            venues[v] = {"matches": 0, "bat_first_wins": 0, "bowl_first_wins": 0, "first_innings_scores": []}
        venues[v]["matches"] += 1
        
        import json
        if m.scorecard_json:
            try:
                sc = json.loads(m.scorecard_json)
                venues[v]["first_innings_scores"].append(sc["team_a_innings"]["total_runs"])
                if sc["team_a"] == sc["winner"]:
                    venues[v]["bat_first_wins"] += 1
                else:
                    venues[v]["bowl_first_wins"] += 1
            except Exception:
                pass
                
    venue_insights = []
    for v, data in venues.items():
        avg_score = sum(data["first_innings_scores"]) // len(data["first_innings_scores"]) if data["first_innings_scores"] else 0
        bat1_pct = (data["bat_first_wins"] / data["matches"]) * 100 if data["matches"] > 0 else 0
        venue_insights.append({
            "name": v,
            "matches": data["matches"],
            "par_score": avg_score,
            "bat1_win_pct": f"{bat1_pct:.1f}%",
            "toss_decision": "BAT FIRST" if bat1_pct >= 50 else "BOWL FIRST"
        })

    players_query = db.query(
        PlayerModel,
        func.sum(PlayerStatModel.runs).label("runs"),
        func.sum(PlayerStatModel.balls).label("balls"),
        func.sum(PlayerStatModel.wickets).label("wickets"),
        func.sum(PlayerStatModel.overs).label("overs"),
        func.sum(PlayerStatModel.runs_conceded).label("runs_conceded")
    ).outerjoin(PlayerStatModel, PlayerStatModel.player_name == PlayerModel.name).group_by(PlayerModel.id).all()'''
content = content.replace(old_analytics, new_analytics)

old_return = '''        "kpi": {
            "top_scorer": top_scorer if max_runs >= 0 else None,
            "top_bowler": top_bowler if max_wickets >= 0 else None,
            "avg_run_rate": f"{avg_run_rate:.2f}",
            "total_tournament_runs": int(total_runs),
            "total_boundaries": {
                "fours": int(total_fours),
                "sixes": int(total_sixes)
            }
        }
    }'''
new_return = '''        "kpi": {
            "top_scorer": top_scorer if max_runs >= 0 else None,
            "top_bowler": top_bowler if max_wickets >= 0 else None,
            "avg_run_rate": f"{avg_run_rate:.2f}",
            "total_tournament_runs": int(total_runs),
            "total_boundaries": {
                "fours": int(total_fours),
                "sixes": int(total_sixes)
            }
        },
        "leaderboards": {
            "orange_cap": orange_cap,
            "purple_cap": purple_cap,
            "silver_glove": silver_glove
        },
        "venue_insights": venue_insights
    }'''
content = content.replace(old_return, new_return)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated backend/main.py!")
