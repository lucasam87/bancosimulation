import sys
import os

# Add the 'backend' folder to the python path
# This ensures that 'from app...' imports work correctly
sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))

from app.main import app
