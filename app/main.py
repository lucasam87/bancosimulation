from fastapi import FastAPI
from app.core.config import settings
# from app.models import all_models # Removed for NoSQL
# from app.core.database import Base, engine # Removed for NoSQL

# Routers - Updated for Firebase (Assuming they are refactored or will be)
# If routers still import SQL stuff they will break.
# We will need to go through them. For now let's keep the imports but comment them out if they break 
# or assume we fix them next.

# Let's keep the router imports active to surface errors we need to fix.
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
# app.include_router(accounts.router, prefix=f"{settings.API_V1_STR}/accounts", tags=["accounts"])
# app.include_router(transactions.router, prefix=f"{settings.API_V1_STR}/transactions", tags=["transactions"])
# app.include_router(credit.router, prefix=f"{settings.API_V1_STR}/credit", tags=["credit"])
# app.include_router(loans.router, prefix=f"{settings.API_V1_STR}/loans", tags=["loans"])
# app.include_router(cards.router, prefix=f"{settings.API_V1_STR}/cards", tags=["cards"])

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

# Serve static files (React build)
# We assume the build output is in a 'dist' folder in the root or same dir
static_dir = os.path.join(os.path.dirname(__file__), "..", "dist")

if os.path.exists(static_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(static_dir, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        # API routes are already handled above because they are included first
        # Check if file exists in dist
        file_path = os.path.join(static_dir, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        
        # Otherwise serve index.html for client-side routing
        return FileResponse(os.path.join(static_dir, "index.html"))
else:
    @app.get("/")
    def read_root():
        return {"message": "Bem-vindo ao Bankofthe API (Frontend not built/found) 🚀"}
