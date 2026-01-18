from fastapi import FastAPI
from app.core.config import settings
# Import models to ensure they are registered (for alembic/creation)
from app.models import all_models

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS (Optional but good for React if not proxied, though Docker network handles it differently, browser needs it)
from fastapi.middleware.cors import CORSMiddleware
origins = ["http://localhost:3000", "http://localhost:5173", "*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.v1 import auth, accounts, transactions, credit, loans, cards
from app.core.database import Base, engine

# Create tables on startup - SAFELY
if engine is not None:
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Error creating tables on startup: {e}")

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(accounts.router, prefix=f"{settings.API_V1_STR}/accounts", tags=["accounts"])
app.include_router(transactions.router, prefix=f"{settings.API_V1_STR}/transactions", tags=["transactions"])
app.include_router(credit.router, prefix=f"{settings.API_V1_STR}/credit", tags=["credit"])
app.include_router(loans.router, prefix=f"{settings.API_V1_STR}/loans", tags=["loans"])
app.include_router(cards.router, prefix=f"{settings.API_V1_STR}/cards", tags=["cards"])

@app.get("/api/v1/setup-db")
def setup_database():
    """
    Endpoint utilitário para criar as tabelas no banco de dados
    quando rodando em ambientes serverless (como Vercel) onde
    não temos acesso direto ao shell.
    """
    try:
        from app.core.database import engine, Base
        from app.models import all_models # Import models to register them
        Base.metadata.create_all(bind=engine)
        return {"status": "ok", "message": "Tabelas criadas com sucesso!"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/")
def read_root():
    return {"message": "Bem-vindo ao Bankofthe API - Vercel Edition 🚀"}
