import sys
import os

# Add the project root to the python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.main import app
