import json
import os
import re

json_path = os.path.join(os.path.dirname(__file__), "..", "src", "data", "sl_universities_2026.json")
with open(json_path, "r", encoding="utf-8") as f:
    data = json.load(f)

scorecards = data.get("completedMatchScorecards", {})

verified_players_map = {}

team_code_map = {
    "moratuwa": "UOM",
    "peradeniya": "UOP",
    "vavuniya": "VAV",
    "jaffna": "UOJ",
    "colombo": "UOC",
    "kelaniya": "UOK",
    "jayawardenapura": "USJP",
    "sri jayawardenapura": "USJP",
    "ruhunu": "RUH",
    "sabaragamuwa": "SAB",
    "wayamba": "WAY",
    "rajarata": "RAJ",
    "gampaha": "GWU",
    "visual": "UVPA",
    "south eastern": "SEUSL",
    "eastern": "EUSL"
}

def resolve_code(tname):
    low = tname.lower()
    for k, code in team_code_map.items():
        if k in low:
            return code
    return None

def clean_pname(raw):
    name = re.sub(r"\s*\((?:c|C|wk|WK|LHB|RHB|sub|\†|wk/c|c/wk).*?\)", "", raw).strip()
    name = re.sub(r"^\†\s*", "", name).strip()
    return name

def detect_role(is_wk, runs, overs, wkts):
    if is_wk:
        return "Wicketkeeper Batter"
    elif overs > 0 and runs >= 10:
        return "All-Rounder"
    elif overs > 0:
        return "Bowler"
    else:
        return "Batter"

def detect_icon(role):
    if "Wicketkeeper" in role:
        return "🧤"
    elif "All-Rounder" in role:
        return "⚡"
    elif "Bowler" in role:
        return "🎯"
    else:
        return "🏏"

for sc_id, sc in scorecards.items():
    for inn_key in ["innings1", "innings2"]:
        inn = sc.get(inn_key, {})
        if not inn: continue
        tcode = resolve_code(inn.get("team", ""))
        if not tcode: continue
        
        # Batting
        for b in inn.get("batting", []):
            raw_p = b.get("player") or b.get("player_name") or ""
            if not raw_p or "extras" in raw_p.lower(): continue
            pname = clean_pname(raw_p)
            if not pname: continue
            
            pkey = f"{tcode}_{pname.lower()}"
            is_c = "(c)" in raw_p.lower() or "(c)" in b.get("dismissal", "").lower()
            is_wk = "(wk)" in raw_p.lower() or "†" in raw_p or "(wk)" in b.get("dismissal", "").lower() or "†" in b.get("dismissal", "")
            
            runs = int(b.get("runs", 0))
            balls = int(b.get("balls", 0))
            fours = int(b.get("fours", 0))
            sixes = int(b.get("sixes", 0))
            sr = float(b.get("sr", b.get("strike_rate", 0)))
            
            if pkey not in verified_players_map:
                verified_players_map[pkey] = {
                    "name": pname + (" (C)" if is_c else ""),
                    "team": tcode,
                    "runs": runs,
                    "balls": balls,
                    "fours": fours,
                    "sixes": sixes,
                    "sr": sr,
                    "hs": str(runs) + ("*" if "not out" in b.get("dismissal", "").lower() else ""),
                    "wickets": 0,
                    "overs": 0.0,
                    "runs_c": 0,
                    "econ": 0.0,
                    "matches": 1,
                    "is_wk": is_wk
                }
            else:
                p = verified_players_map[pkey]
                p["runs"] = max(p["runs"], runs)
                p["balls"] += balls
                p["fours"] += fours
                p["sixes"] += sixes
                if sr > p["sr"]: p["sr"] = sr
                if is_wk: p["is_wk"] = True
                
        # Bowling
        for bw in inn.get("bowling", []):
            raw_p = bw.get("bowler") or bw.get("player_name") or ""
            if not raw_p: continue
            pname = clean_pname(raw_p)
            if not pname: continue
            
            pkey = f"{tcode}_{pname.lower()}"
            is_c = "(c)" in raw_p.lower()
            overs = float(bw.get("overs", 0))
            wkts = int(bw.get("wickets", 0))
            runs_c = int(bw.get("runs", bw.get("runs_conceded", 0)))
            econ = float(bw.get("econ", bw.get("economy", 0)))
            
            if pkey not in verified_players_map:
                verified_players_map[pkey] = {
                    "name": pname + (" (C)" if is_c else ""),
                    "team": tcode,
                    "runs": 0,
                    "balls": 0,
                    "fours": 0,
                    "sixes": 0,
                    "sr": 0.0,
                    "hs": "0*",
                    "wickets": wkts,
                    "overs": overs,
                    "runs_c": runs_c,
                    "econ": econ,
                    "matches": 1,
                    "is_wk": False
                }
            else:
                p = verified_players_map[pkey]
                p["wickets"] += wkts
                p["overs"] += overs
                p["runs_c"] += runs_c
                p["econ"] = econ

final_players = []
pid = 101

for pkey, p in verified_players_map.items():
    role = detect_role(p["is_wk"], p["runs"], p["overs"], p["wickets"])
    icon = detect_icon(role)
    
    sr = p["sr"]
    if sr == 0.0 and p["balls"] > 0:
        sr = round((p["runs"] / p["balls"]) * 100, 2)
        
    econ = p["econ"]
    if econ == 0.0 and p["overs"] > 0:
        econ = round(p["runs_c"] / p["overs"], 2)
        
    b_pct = round(((p["fours"] * 4 + p["sixes"] * 6) / p["runs"]) * 100, 1) if p["runs"] > 0 else (50.0 if role == "Batter" else 0.0)
    d_pct = round((1 - (p["fours"] + p["sixes"]) / p["balls"]) * 100, 1) if p["balls"] > 0 else (75.0 if role == "Bowler" else 40.0)
    
    bb = f"{p['wickets']}/{p['runs_c']}" if p["overs"] > 0 else "-"
    
    final_players.append({
        "id": pid,
        "name": p["name"],
        "team": p["team"],
        "role": role,
        "matches": p["matches"],
        "runs": p["runs"],
        "avg": float(p["runs"]),
        "sr": sr,
        "hs": p["hs"],
        "wickets": p["wickets"],
        "econ": econ,
        "bb": bb,
        "boundaryPct": b_pct,
        "dotPct": d_pct,
        "icon": icon
    })
    pid += 1

print(f"Strict Scorecard-Only Count: {len(final_players)}")
team_counts = {}
for fp in final_players:
    team_counts[fp["team"]] = team_counts.get(fp["team"], 0) + 1

for tc, cnt in sorted(team_counts.items()):
    print(f"  {tc}: {cnt} players")

data["players"] = final_players
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)

print("Saved cleaned 100% scorecard-only players dataset to sl_universities_2026.json!")
