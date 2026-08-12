import os
from datetime import datetime, timezone
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker

# Load environment variables from .env file if present
load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///unicric.db")

# Automatically fix legacy 'postgres://' URI compatibility (SQLAlchemy 1.4+ / 2.0+)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class TeamModel(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    short_name = Column(String(50))
    group_name = Column(String(20), default="Group C")
    played = Column(Integer, default=0)
    won = Column(Integer, default=0)
    lost = Column(Integer, default=0)
    points = Column(Integer, default=0)
    nrr = Column(String(20), default="0.000")

class PlayerModel(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True, nullable=False)
    team_code = Column(String(20), ForeignKey("teams.code"), nullable=True)
    role = Column(String(50), default="Batter")
    batting_style = Column(String(50), default="Right-Hand Batter")
    matches = Column(Integer, default=0)
    total_runs = Column(Integer, default=0)
    total_balls = Column(Integer, default=0)
    total_fours = Column(Integer, default=0)
    total_sixes = Column(Integer, default=0)
    total_wickets = Column(Integer, default=0)
    strike_rate = Column(Float, default=0.0)
    economy_rate = Column(Float, default=0.0)

class MatchModel(Base):
    __tablename__ = "matches"

    id = Column(String(50), primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    date_label = Column(String(50))
    venue = Column(String(150))
    status = Column(String(30), default="COMPLETED")  # COMPLETED, NEXT_TARGET, UPCOMING
    result = Column(String(200))
    score_summary = Column(String(200))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class PlayerStatModel(Base):
    __tablename__ = "player_stats"

    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(String(50), ForeignKey("matches.id"), nullable=True)
    player_name = Column(String(100), index=True, nullable=False)
    team_code = Column(String(20), nullable=True)
    runs = Column(Integer, default=0)
    balls = Column(Integer, default=0)
    fours = Column(Integer, default=0)
    sixes = Column(Integer, default=0)
    wickets = Column(Integer, default=0)
    overs = Column(Float, default=0.0)
    runs_conceded = Column(Integer, default=0)
    economy = Column(Float, default=0.0)
    strike_rate = Column(Float, default=0.0)
    dismissal = Column(String(150), default="Not Out")
    is_out = Column(Boolean, default=False)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
