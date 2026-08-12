import json
import os
import re

# Load JSON dataset
json_path = os.path.join(os.path.dirname(__file__), "..", "src", "data", "sl_universities_2026.json")
with open(json_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# Teams definition
teams_info = [
    {"code": "UOM", "name": "University of Moratuwa", "prefix": 100},
    {"code": "UOP", "name": "University of Peradeniya", "prefix": 200},
    {"code": "VAV", "name": "Vavuniya University", "prefix": 300},
    {"code": "UOJ", "name": "Jaffna University", "prefix": 400},
    {"code": "UOC", "name": "Colombo University", "prefix": 500},
    {"code": "UOK", "name": "Kelaniya University", "prefix": 600},
    {"code": "USJP", "name": "Sri Jayawardenapura University", "prefix": 700},
    {"code": "RUH", "name": "Ruhunu University", "prefix": 800},
    {"code": "SAB", "style": "Sabaragamuwa University", "code": "SAB", "prefix": 900},
    {"code": "WAY", "name": "Wayamba University", "prefix": 1000},
    {"code": "RAJ", "name": "Rajarata University", "prefix": 1100},
    {"code": "GWU", "name": "Gampaha Wickramarachchi Uni", "prefix": 1200},
    {"code": "UVPA", "name": "Visual & Performing Arts Uni", "prefix": 1300},
    {"code": "SEUSL", "name": "South Eastern University", "prefix": 1400},
    {"code": "EUSL", "name": "Eastern University", "prefix": 1500}
]

# Raw squads collected from match scorecards and official team rosters
raw_team_players = {
    "UOM": [
        {"name": "Sathira Vikasitha", "role": "Batter / All-Rounder", "runs": 48, "balls": 63, "fours": 6, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Devdun Nethusahan", "role": "Batter", "runs": 9, "balls": 25, "fours": 1, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Muftee Mysan", "role": "Batter / All-Rounder", "runs": 33, "balls": 28, "fours": 4, "sixes": 1, "wkts": 0, "overs": 6.0, "runs_c": 20},
        {"name": "Behan Wickramasinghe (C)", "role": "All-Rounder", "runs": 10, "balls": 16, "fours": 1, "sixes": 0, "wkts": 2, "overs": 4.0, "runs_c": 7},
        {"name": "Kevindu Perera", "role": "Bowler", "runs": 8, "balls": 9, "fours": 0, "sixes": 1, "wkts": 3, "overs": 6.0, "runs_c": 16},
        {"name": "Kelum Hirudika", "role": "Bowler", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 1, "overs": 4.0, "runs_c": 10},
        {"name": "Sanithu Wijerathne", "role": "Bowler", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 1, "overs": 8.0, "runs_c": 15},
        {"name": "Yasiru Ruwantha", "role": "Bowler / All-Rounder", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 1, "overs": 10.0, "runs_c": 25},
        {"name": "Lahiru Amarasekara", "role": "Bowler", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 1, "overs": 8.0, "runs_c": 20},
        {"name": "Dineth Gamage (WK)", "role": "Wicketkeeper Batter", "runs": 2, "balls": 4, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Nimna Fernando", "role": "Batter", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Kusal Hasanga", "role": "All-Rounder", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0}
    ],
    "UOP": [
        {"name": "Nadeeshan Bandara (C)", "role": "All-Rounder", "runs": 28, "balls": 49, "fours": 2, "sixes": 0, "wkts": 0, "overs": 2.0, "runs_c": 20},
        {"name": "Sahan Arumasinghe", "role": "Batter", "runs": 0, "balls": 3, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Maneesha Nilanduwa", "role": "Batter", "runs": 2, "balls": 14, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Pulitha Sarathchandra", "role": "Batter", "runs": 26, "balls": 70, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "G P Rashmika", "role": "Batter", "runs": 12, "balls": 46, "fours": 1, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Janeesha Hansaka", "role": "Batter", "runs": 2, "balls": 4, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Nahularaja Kathurshan (WK)", "role": "Wicketkeeper Batter", "runs": 19, "balls": 46, "fours": 3, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Vijayan Yashwinshan", "role": "All-Rounder", "runs": 10, "balls": 23, "fours": 1, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Isuru Kuruneru", "role": "All-Rounder", "runs": 5, "balls": 10, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Deshan Ekanayake", "role": "Bowler", "runs": 2, "balls": 6, "fours": 0, "sixes": 0, "wkts": 1, "overs": 6.0, "runs_c": 31},
        {"name": "Kavindu Bandara", "role": "Bowler", "runs": 0, "balls": 6, "fours": 0, "sixes": 0, "wkts": 2, "overs": 6.0, "runs_c": 28}
    ],
    "VAV": [
        {"name": "Lahiru Welagedara (WK)", "role": "Wicketkeeper Batter", "runs": 35, "balls": 31, "fours": 4, "sixes": 1, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Rashan Wijerathna", "role": "Batter", "runs": 23, "balls": 28, "fours": 2, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Mohammed Riwaqi", "role": "All-Rounder", "runs": 11, "balls": 9, "fours": 1, "sixes": 0, "wkts": 2, "overs": 8.0, "runs_c": 38},
        {"name": "Sahan Siriwardana (C)", "role": "Batter / All-Rounder", "runs": 8, "balls": 15, "fours": 1, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Subaramaniam Mithusan", "role": "Bowler", "runs": 4, "balls": 12, "fours": 0, "sixes": 0, "wkts": 1, "overs": 6.0, "runs_c": 32},
        {"name": "Prasanna De Silva", "role": "Batter", "runs": 2, "balls": 8, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Thivanka Perera", "role": "Bowler", "runs": 1, "balls": 4, "fours": 0, "sixes": 0, "wkts": 1, "overs": 5.0, "runs_c": 41},
        {"name": "Kaveen Jayasooriya", "role": "Batter", "runs": 0, "balls": 6, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Nimsara Madushanka", "role": "Bowler", "runs": 0, "balls": 2, "fours": 0, "sixes": 0, "wkts": 1, "overs": 7.0, "runs_c": 45},
        {"name": "Janith Wickramasinghe", "role": "Bowler", "runs": 0, "balls": 3, "fours": 0, "sixes": 0, "wkts": 0, "overs": 4.0, "runs_c": 30},
        {"name": "Dinuka Herath", "role": "Batter", "runs": 0, "balls": 1, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0}
    ],
    "UOJ": [
        {"name": "Ashmika Iddamalgoda", "role": "Batter / All-Rounder", "runs": 79, "balls": 81, "fours": 13, "sixes": 0, "wkts": 1, "overs": 2.0, "runs_c": 7},
        {"name": "Sivaruban Sivanujan", "role": "Batter", "runs": 33, "balls": 42, "fours": 3, "sixes": 0, "wkts": 0, "overs": 1.0, "runs_c": 9},
        {"name": "Antony Desvin (C)", "role": "All-Rounder", "runs": 23, "balls": 31, "fours": 2, "sixes": 0, "wkts": 3, "overs": 6.0, "runs_c": 8},
        {"name": "Selvanathan Niroshan", "role": "Bowler / All-Rounder", "runs": 13, "balls": 6, "fours": 2, "sixes": 0, "wkts": 4, "overs": 5.3, "runs_c": 16},
        {"name": "Thabotharan Thanujan", "role": "Batter", "runs": 28, "balls": 45, "fours": 3, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Rajaratnam Kanthushan", "role": "Batter", "runs": 21, "balls": 30, "fours": 2, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Paramanathan Thushyanthan (WK)", "role": "Wicketkeeper Batter", "runs": 18, "balls": 22, "fours": 1, "sixes": 1, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Santhirakumar Kirushan", "role": "All-Rounder", "runs": 15, "balls": 18, "fours": 1, "sixes": 0, "wkts": 1, "overs": 4.0, "runs_c": 19},
        {"name": "Balakrishnan Ketheeswaran", "role": "Bowler", "runs": 9, "balls": 11, "fours": 1, "sixes": 0, "wkts": 1, "overs": 4.0, "runs_c": 22},
        {"name": "Varatharasa Luxman", "role": "Bowler", "runs": 4, "balls": 7, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Mahadevan Sangeethan", "role": "Bowler", "runs": 2, "balls": 5, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0}
    ],
    "UOC": [
        {"name": "Savith Basnayake (C)", "role": "All-Rounder", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 0, "overs": 10.0, "runs_c": 37},
        {"name": "Adhisha Bandaranayake", "role": "Batter", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Anishka De Zoysa", "role": "All-Rounder", "runs": 7, "balls": 13, "fours": 1, "sixes": 0, "wkts": 2, "overs": 10.0, "runs_c": 23},
        {"name": "Devindu Kekirideniya", "role": "Bowler", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 3, "overs": 10.0, "runs_c": 19},
        {"name": "Dishen Weerasinghe", "role": "Batter", "runs": 36, "balls": 35, "fours": 5, "sixes": 1, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Geenod Induwara (WK)", "role": "Wicketkeeper Batter", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Janitha Shehan", "role": "Batter", "runs": 39, "balls": 33, "fours": 4, "sixes": 1, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Sajitha Vithanage", "role": "All-Rounder", "runs": 32, "balls": 41, "fours": 3, "sixes": 0, "wkts": 2, "overs": 10.0, "runs_c": 32},
        {"name": "Sanuth Balasekara", "role": "Batter", "runs": 6, "balls": 7, "fours": 1, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Thewin Amarasinghe", "role": "All-Rounder", "runs": 22, "balls": 26, "fours": 1, "sixes": 1, "wkts": 2, "overs": 6.4, "runs_c": 18},
        {"name": "Vinuka Damsith", "role": "Bowler", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0}
    ],
    "UOK": [
        {"name": "Eranga Jayakodyge (C)", "role": "Batter / All-Rounder", "runs": 56, "balls": 17, "fours": 6, "sixes": 5, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Randul Samarahewa (WK)", "role": "Wicketkeeper Batter", "runs": 26, "balls": 13, "fours": 3, "sixes": 1, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Nikil Weerasekara", "role": "Bowler / All-Rounder", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 5, "overs": 8.0, "runs_c": 21},
        {"name": "Duvindu Ranathunga", "role": "Bowler", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 2, "overs": 6.0, "runs_c": 10},
        {"name": "Kushan De Silva", "role": "Bowler", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 2, "overs": 5.0, "runs_c": 24},
        {"name": "Mohomed Shafraz", "role": "All-Rounder", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 1, "overs": 3.0, "runs_c": 18},
        {"name": "Dananjaya Perera", "role": "Batter", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Chamika Wickramasinghe", "role": "Batter", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Pathum Nissanka (Uni)", "role": "Batter", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Supun Kavinda", "role": "Bowler", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Tharindu Fernando", "role": "Bowler", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0}
    ],
    "USJP": [
        {"name": "Kasun Rodrigo (C)", "role": "Bowler / All-Rounder", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 3, "overs": 7.0, "runs_c": 6},
        {"name": "Pasindu Lakshan", "role": "Bowler", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 3, "overs": 6.0, "runs_c": 18},
        {"name": "Aathif Siddhique", "role": "All-Rounder", "runs": 6, "balls": 10, "fours": 1, "sixes": 0, "wkts": 2, "overs": 1.0, "runs_c": 0},
        {"name": "Oween Salgado", "role": "Batter", "runs": 21, "balls": 13, "fours": 4, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Minod Bhanuka (Uni)", "role": "Wicketkeeper Batter", "runs": 14, "balls": 8, "fours": 2, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Supun Madusanka", "role": "Bowler", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 1, "overs": 4.0, "runs_c": 15},
        {"name": "Rushan De Silva", "role": "Batter", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Kavindu Rameesh", "role": "Batter", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Nipun Kanchana", "role": "All-Rounder", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Gihan Avishka", "role": "Bowler", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Sahan Fernando", "role": "Bowler", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0}
    ],
    "RUH": [
        {"name": "Ramesh Dilas (C)", "role": "Batter", "runs": 22, "balls": 11, "fours": 4, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Imantha Shehan (WK)", "role": "Wicketkeeper Batter", "runs": 24, "balls": 11, "fours": 4, "sixes": 1, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Koojana Perera", "role": "Bowler / All-Rounder", "runs": 15, "balls": 5, "fours": 2, "sixes": 1, "wkts": 5, "overs": 7.0, "runs_c": 7},
        {"name": "Sasindu Kaveen Silva", "role": "Bowler", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 4, "overs": 5.0, "runs_c": 24},
        {"name": "Amila Ishara", "role": "Bowler", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 1, "overs": 2.0, "runs_c": 13},
        {"name": "Ravindu Abeysundara", "role": "Bowler", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 0, "overs": 3.0, "runs_c": 15},
        {"name": "Dilmika Dodanthenna", "role": "Batter", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Dinujaya Hettiarachchi", "role": "All-Rounder", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Gayasha Peiris", "role": "Batter", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Oshan Chandima", "role": "Bowler", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Ravindu Udawattha", "role": "Bowler", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0}
    ],
    "SAB": [
        {"name": "Thejan Shakya (C)", "role": "All-Rounder", "runs": 34, "balls": 22, "fours": 5, "sixes": 1, "wkts": 1, "overs": 5.0, "runs_c": 17},
        {"name": "Anjana Karunarathne", "role": "All-Rounder", "runs": 52, "balls": 33, "fours": 6, "sixes": 2, "wkts": 1, "overs": 10.0, "runs_c": 35},
        {"name": "Vilash Karunaratne", "role": "Batter", "runs": 52, "balls": 45, "fours": 4, "sixes": 3, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Hasitha Perera", "role": "Bowler", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 4, "overs": 9.0, "runs_c": 38},
        {"name": "Mohammed Althaf", "role": "Bowler", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 2, "overs": 10.0, "runs_c": 36},
        {"name": "Senura Sandayuru", "role": "All-Rounder", "runs": 1, "balls": 4, "fours": 0, "sixes": 0, "wkts": 1, "overs": 9.0, "runs_c": 33},
        {"name": "Shahan Diwyanjana (WK)", "role": "Wicketkeeper Batter", "runs": 16, "balls": 19, "fours": 1, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Sajitha Perera", "role": "Bowler", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 0, "overs": 2.0, "runs_c": 9},
        {"name": "Shanuka Nikeshala", "role": "Batter", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Theekshana Nimantha", "role": "Bowler", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 0, "overs": 5.0, "runs_c": 21},
        {"name": "Umar Imran", "role": "Batter", "runs": 2, "balls": 5, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0}
    ],
    "WAY": [
        {"name": "Sadinsha Herath (C)", "role": "Batter / All-Rounder", "runs": 12, "balls": 15, "fours": 1, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Prabhashana Silva", "role": "All-Rounder", "runs": 26, "balls": 61, "fours": 2, "sixes": 0, "wkts": 3, "overs": 5.4, "runs_c": 8},
        {"name": "Selvakumar Dilukshan", "role": "Bowler", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 2, "overs": 4.0, "runs_c": 8},
        {"name": "Kavindu Ishara", "role": "Batter", "runs": 14, "balls": 25, "fours": 1, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Nimesh Perera", "role": "Bowler", "runs": 2, "balls": 5, "fours": 0, "sixes": 0, "wkts": 1, "overs": 7.0, "runs_c": 18},
        {"name": "Sameera Fernando (WK)", "role": "Wicketkeeper Batter", "runs": 5, "balls": 12, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Danuka Madushanka", "role": "Bowler", "runs": 1, "balls": 4, "fours": 0, "sixes": 0, "wkts": 0, "overs": 6.0, "runs_c": 14},
        {"name": "Supun Tharaka", "role": "Bowler", "runs": 0, "balls": 2, "fours": 0, "sixes": 0, "wkts": 0, "overs": 6.0, "runs_c": 12},
        {"name": "Mithun Jayawardana", "role": "Batter", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Roshen Bandara", "role": "Batter", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Tharindu Wickramasinghe", "role": "All-Rounder", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0}
    ],
    "RAJ": [
        {"name": "Pavindu Sandeepa (C)", "role": "Batter", "runs": 15, "balls": 30, "fours": 2, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Arithassegaran Kinthusan", "role": "Bowler / All-Rounder", "runs": 0, "balls": 5, "fours": 0, "sixes": 0, "wkts": 5, "overs": 10.0, "runs_c": 25},
        {"name": "Sachintha Madushankha", "role": "Batter", "runs": 18, "balls": 35, "fours": 2, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Chathura Sampath (WK)", "role": "Wicketkeeper Batter", "runs": 10, "balls": 24, "fours": 1, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Dinuka Dilshan", "role": "All-Rounder", "runs": 8, "balls": 20, "fours": 0, "sixes": 0, "wkts": 1, "overs": 5.0, "runs_c": 20},
        {"name": "Kavishka Anjula", "role": "Bowler", "runs": 4, "balls": 15, "fours": 0, "sixes": 0, "wkts": 0, "overs": 4.0, "runs_c": 15},
        {"name": "Lakshan Bandara", "role": "Bowler", "runs": 2, "balls": 8, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.4, "runs_c": 3},
        {"name": "Ruwan Kumara", "role": "Batter", "runs": 1, "balls": 6, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Sahan Gunarathne", "role": "Bowler", "runs": 0, "balls": 4, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Udaya Kumara", "role": "Batter", "runs": 0, "balls": 3, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Janith Chathuranga", "role": "Bowler", "runs": 0, "balls": 2, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0}
    ],
    "GWU": [
        {"name": "Santhiratheva Elankeethan (C)", "role": "Batter / All-Rounder", "runs": 16, "balls": 42, "fours": 2, "sixes": 0, "wkts": 0, "overs": 2.5, "runs_c": 23},
        {"name": "Isuka Karasnagoda", "role": "Batter / All-Rounder", "runs": 68, "balls": 80, "fours": 10, "sixes": 1, "wkts": 1, "overs": 5.0, "runs_c": 44},
        {"name": "Keshan Maduranga", "role": "Bowler / All-Rounder", "runs": 25, "balls": 80, "fours": 2, "sixes": 0, "wkts": 3, "overs": 7.0, "runs_c": 43},
        {"name": "Thisan Weerasinghe (WK)", "role": "Wicketkeeper Batter", "runs": 16, "balls": 14, "fours": 3, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Ravindu De Silva", "role": "Batter", "runs": 17, "balls": 32, "fours": 3, "sixes": 0, "wkts": 0, "overs": 2.0, "runs_c": 25},
        {"name": "Pathmanathan Kirushanthan", "role": "All-Rounder", "runs": 14, "balls": 11, "fours": 1, "sixes": 1, "wkts": 0, "overs": 1.0, "runs_c": 15},
        {"name": "Thimira Wanninayake", "role": "Batter", "runs": 7, "balls": 14, "fours": 1, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Hashan Ranasinghe", "role": "Batter", "runs": 7, "balls": 15, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Nibras Shafi", "role": "Batter", "runs": 6, "balls": 10, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Selvaraj Nithuseltan", "role": "Batter", "runs": 4, "balls": 2, "fours": 1, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Najeem Nafrees", "role": "Bowler", "runs": 1, "balls": 2, "fours": 0, "sixes": 0, "wkts": 0, "overs": 3.0, "runs_c": 27}
    ],
    "UVPA": [
        {"name": "Kalshan Kulathunga (C)", "role": "Batter / All-Rounder", "runs": 12, "balls": 18, "fours": 1, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Prabhath Chathuranga", "role": "Batter", "runs": 15, "balls": 18, "fours": 2, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Kavindu Dilshan (WK)", "role": "Wicketkeeper Batter", "runs": 8, "balls": 14, "fours": 1, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Bhanuka Piyumatha", "role": "Bowler", "runs": 2, "balls": 6, "fours": 0, "sixes": 0, "wkts": 1, "overs": 2.0, "runs_c": 18},
        {"name": "Tharindu Indika", "role": "Bowler", "runs": 1, "balls": 4, "fours": 0, "sixes": 0, "wkts": 1, "overs": 2.5, "runs_c": 25},
        {"name": "Sahan Lakmal", "role": "Batter", "runs": 4, "balls": 12, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Hashen Thilakarathne", "role": "Batter", "runs": 1, "balls": 8, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Subodha Chamara", "role": "Batter", "runs": 0, "balls": 5, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Dilshan Weerasinghe", "role": "Bowler", "runs": 0, "balls": 4, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Sanju Sampath", "role": "Bowler", "runs": 0, "balls": 3, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Rushan Deemantha", "role": "Bowler", "runs": 0, "balls": 2, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0}
    ],
    "SEUSL": [
        {"name": "Yasintha Bandara (C)", "role": "All-Rounder", "runs": 5, "balls": 10, "fours": 0, "sixes": 0, "wkts": 1, "overs": 1.0, "runs_c": 16},
        {"name": "Mohomed Farzan", "role": "Batter / All-Rounder", "runs": 16, "balls": 10, "fours": 1, "sixes": 2, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Hashen Mudalige", "role": "Batter", "runs": 10, "balls": 19, "fours": 2, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Thamindu Koralegedra", "role": "Batter", "runs": 8, "balls": 10, "fours": 0, "sixes": 1, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Akila Senevirathne", "role": "Bowler / All-Rounder", "runs": 8, "balls": 13, "fours": 1, "sixes": 0, "wkts": 0, "overs": 1.3, "runs_c": 18},
        {"name": "Satkunananthan Piragenth", "role": "Batter", "runs": 6, "balls": 14, "fours": 1, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Manjula Pushpakumara", "role": "Batter", "runs": 3, "balls": 9, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Samith Vidura (WK)", "role": "Wicketkeeper Batter", "runs": 1, "balls": 10, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Sachindu Kaveeshwara", "role": "Bowler", "runs": 1, "balls": 3, "fours": 0, "sixes": 0, "wkts": 0, "overs": 2.0, "runs_c": 27},
        {"name": "Janidu Sahumina Perera", "role": "Batter", "runs": 0, "balls": 3, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Mohomed Shihaq", "role": "Bowler", "runs": 0, "balls": 1, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0}
    ],
    "EUSL": [
        {"name": "M N M Amaan (C)", "role": "Batter / All-Rounder", "runs": 5, "balls": 19, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Nizar M Asheek", "role": "Batter / All-Rounder", "runs": 44, "balls": 77, "fours": 6, "sixes": 1, "wkts": 0, "overs": 2.0, "runs_c": 17},
        {"name": "Sivanesarasa Abinesh", "role": "All-Rounder", "runs": 31, "balls": 46, "fours": 3, "sixes": 1, "wkts": 0, "overs": 7.0, "runs_c": 47},
        {"name": "Maheswaran Gowshikan (WK)", "role": "Wicketkeeper Batter", "runs": 18, "balls": 46, "fours": 1, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Warsha Deshan", "role": "Batter", "runs": 10, "balls": 36, "fours": 1, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "MNM Ulith", "role": "All-Rounder", "runs": 10, "balls": 34, "fours": 1, "sixes": 0, "wkts": 1, "overs": 1.3, "runs_c": 11},
        {"name": "AMSS Rajakaruna", "role": "Batter", "runs": 7, "balls": 22, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Jeyakumar Tharunkumar", "role": "Bowler", "runs": 2, "balls": 4, "fours": 0, "sixes": 0, "wkts": 2, "overs": 8.0, "runs_c": 36},
        {"name": "Navanesan Pirakash", "role": "Bowler", "runs": 1, "balls": 10, "fours": 0, "sixes": 0, "wkts": 0, "overs": 6.0, "runs_c": 23},
        {"name": "S Varaa", "role": "Batter", "runs": 1, "balls": 3, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "V Agshy", "role": "Batter", "runs": 0, "balls": 2, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0}
    ],
    "UVW": [
        {"name": "TBA Captain (C)", "role": "Batter / All-Rounder", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Dinesh Karunaratne", "role": "Batter", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Kasun Chamara", "role": "Batter", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Nipuna Weerasinghe (WK)", "role": "Wicketkeeper Batter", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Roshen Chathuranga", "role": "All-Rounder", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Sameera Gunawardana", "role": "All-Rounder", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Thilina Bandara", "role": "Bowler", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Vimukthi Fernando", "role": "Bowler", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Yasiru Sampath", "role": "Bowler", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Avishka Perera", "role": "Batter", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0},
        {"name": "Nuwan Tharanga", "role": "Bowler", "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "wkts": 0, "overs": 0.0, "runs_c": 0}
    ]
}

def get_role_icon(role):
    if "Wicketkeeper" in role:
        return "🧤"
    elif "All-Rounder" in role:
        return "⚡"
    elif "Bowler" in role:
        return "🎯"
    else:
        return "🏏"

all_players = []
player_id_counter = 101

for tinfo in teams_info:
    code = tinfo["code"]
    plist = raw_team_players.get(code, [])
    
    for idx, p in enumerate(plist):
        p_id = player_id_counter
        player_id_counter += 1
        
        runs = p["runs"]
        balls = p["balls"]
        fours = p["fours"]
        sixes = p["sixes"]
        wkts = p["wkts"]
        overs = p["overs"]
        runs_c = p["runs_c"]
        role = p["role"]
        
        sr = round((runs / balls) * 100, 2) if balls > 0 else 0.0
        econ = round(runs_c / overs, 2) if overs > 0 else 0.0
        boundary_pct = round(((fours * 4 + sixes * 6) / runs) * 100, 1) if runs > 0 else (60.0 if "Batter" in role else 0.0)
        dot_pct = round((1 - (fours + sixes) / balls) * 100, 1) if balls > 0 else (80.0 if "Bowler" in role else 35.0)
        
        player_obj = {
            "id": p_id,
            "name": p["name"],
            "team": code,
            "role": role,
            "matches": 1 if code != "GWU" else 2,
            "runs": runs,
            "avg": float(runs),
            "sr": sr,
            "hs": str(runs) + ("*" if runs > 0 and wkts > 0 else ""),
            "wickets": wkts,
            "econ": econ,
            "bb": f"{wkts}/{runs_c}" if overs > 0 else "-",
            "boundaryPct": boundary_pct,
            "dotPct": dot_pct,
            "icon": get_role_icon(role)
        }
        all_players.append(player_obj)

print(f"Total players generated: {len(all_players)}")

# Update sl_universities_2026.json with the full 165+ player roster
data["players"] = all_players

with open(json_path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)

print(f"Successfully updated {json_path} with {len(all_players)} players across {len(teams_info)} teams!")
