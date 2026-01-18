from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# SQLAlchemy uses 'postgresql' dialect, but the URL provided might be 'postgresql://...'
# which works. Docker compose provides the URL.
# SQLAlchemy uses 'postgresql' dialect
try:
    SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL
    # Create engine only if URL is real
    if "postgresql" in SQLALCHEMY_DATABASE_URL:
        engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    else:
        # Fallback or invalid URL
        engine = None
        SessionLocal = None
except Exception as e:
    print(f"Database connection error: {e}")
    SessionLocal = None

Base = declarative_base()

def get_db():
    if SessionLocal is None:
        raise Exception("Database not configured. Check DATABASE_URL env var.")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
