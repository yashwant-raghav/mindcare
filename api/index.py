import os
import sys

# Add root directory to sys.path to enable imports of app.py and database.py
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app
