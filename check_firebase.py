import firebase_admin
from firebase_admin import credentials, firestore
import os

print("--- Firebase Connection Diagnostic ---")

key_path = "firebase-key.json"

if os.path.exists(key_path):
    print(f"[OK] Found {key_path}")
    try:
        cred = credentials.Certificate(key_path)
        print("[OK] Certificate loaded from file")
        
        try:
            firebase_admin.initialize_app(cred)
            print("[OK] Firebase Admin initialized")
            
            db = firestore.client()
            print("[OK] Firestore client created")
            
            # Test Write
            print("Attempting to write test document...")
            doc_ref = db.collection("diagnostics").document("test_connection")
            doc_ref.set({"status": "connected", "timestamp": firestore.SERVER_TIMESTAMP})
            print("[SUCCESS] Successfully wrote to Firestore!")
            
            # Test Read
            print("Attempting to read test document...")
            doc = doc_ref.get()
            if doc.exists:
                print(f"[SUCCESS] Read document: {doc.to_dict()}")
            else:
                print("[ERROR] Document written but not found?")
                
        except Exception as e:
            print(f"[ERROR] Failed to connect/write to Firebase: {e}")
            
    except Exception as e:
        print(f"[ERROR] Failed to load certificate: {e}")
else:
    print(f"[ERROR] {key_path} NOT FOUND in current directory.")
    print("Please place the JSON key file in the root directory.")

print("--- End Diagnostic ---")
