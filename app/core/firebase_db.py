import firebase_admin
from firebase_admin import credentials, firestore
import os
import json
from app.core.config import settings

# Initialize Firebase Admin
# We expect FIREBASE_CREDENTIALS env var to be a JSON string or path
# For simplicity in Vercel, passing the raw JSON in an env var is common

cred = None
if os.environ.get("FIREBASE_CREDENTIALS"):
    try:
        # Try to parse as JSON string
        cred_info = json.loads(os.environ.get("FIREBASE_CREDENTIALS"))
        cred = credentials.Certificate(cred_info)
    except:
        # Fallback to path
        cred = credentials.Certificate(os.environ.get("FIREBASE_CREDENTIALS"))
else:
    # Development fallback or separate file
    # Ensure you have 'firebase-key.json' locally for dev
    if os.path.exists("firebase-key.json"):
        cred = credentials.Certificate("firebase-key.json")

if cred:
    try:
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        print("Firebase initialized successfully.")
    except ValueError:
        # Already initialized
        db = firestore.client()
else:
    print("Warning: Firebase credentials not found. DB will not work.")
    db = None
