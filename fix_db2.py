import sys
sys.path.append('backend')
from database import SessionLocal, TeamModel, PlayerModel, MatchModel, PlayerStatModel

db = SessionLocal()
db.query(PlayerStatModel).delete()
db.query(PlayerModel).delete()
db.query(TeamModel).delete()
db.query(MatchModel).delete()
db.commit()
db.close()
print("Tables cleared.")

import os
os.system("python scripts/ingest_payload.py")
print("Done!")
