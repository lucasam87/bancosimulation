from sqlalchemy import text
from app.core.database import engine

def check_db():
    print("Checking DB consistency...")
    with engine.connect() as conn:
        users = conn.execute(text("SELECT id, email, name FROM users")).fetchall()
        print(f"Users found: {len(users)}")
        for u in users:
            print(f"User: {u.email} (ID: {u.id})")
            acc = conn.execute(text(f"SELECT id, number, balance FROM accounts WHERE user_id = {u.id}")).fetchone()
            if acc:
                print(f"  Account: {acc.number} (Balance: {acc.balance})")
            else:
                print(f"  NO ACCOUNT FOUND for user {u.id}")

if __name__ == "__main__":
    check_db()
