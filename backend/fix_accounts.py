from sqlalchemy import text
from app.core.database import engine
import random

def fix_missing_accounts():
    print("Corrigindo usuários sem conta...")
    with engine.connect() as conn:
        # Get users without accounts
        users_without_acc = conn.execute(text("SELECT id, email FROM users WHERE id NOT IN (SELECT user_id FROM accounts)")).fetchall()
        print(f"Encontrados {len(users_without_acc)} usuários sem conta.")
        
        for u in users_without_acc:
            while True:
                number = str(random.randint(10000, 99999))
                # Check if exists
                exists = conn.execute(text(f"SELECT id FROM accounts WHERE number = '{number}'")).fetchone()
                if not exists:
                    break
            
            conn.execute(text(f"INSERT INTO accounts (user_id, number, balance, credit_limit) VALUES ({u.id}, '{number}', 0.00, 0.00)"))
            conn.commit()
            print(f"  Conta {number} criada para o usuário {u.email}")

if __name__ == "__main__":
    fix_missing_accounts()
