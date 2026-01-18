from sqlalchemy import text
from app.core.database import engine
from app.models.all_models import Base

def update_schema():
    print("Atualizando esquema do banco...")
    with engine.connect() as conn:
        # Add credit_limit to accounts if not exists
        try:
            conn.execute(text("ALTER TABLE accounts ADD COLUMN IF NOT EXISTS credit_limit NUMERIC(10, 2) DEFAULT 0.00"))
            conn.commit()
            print("Coluna credit_limit adicionada ou já existente.")
        except Exception as e:
            print(f"Erro ao adicionar credit_limit: {e}")

        # Add columns for Score and Cards if not exists
        try:
            conn.execute(text("ALTER TABLE credit_analyses ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0"))
            conn.commit()
            print("Coluna score adicionada.")
        except Exception as e:
            print(f"Erro ao adicionar score: {e}")

    # Create new tables (like credit_analyses, loans, credit_cards)
    Base.metadata.create_all(bind=engine)
    print("Novas tabelas (credit_analyses, loans, credit_cards) criadas se não existiam.")

if __name__ == "__main__":
    update_schema()
