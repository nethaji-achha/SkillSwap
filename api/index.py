import sys
from pathlib import Path

# Add project root and backend to sys.path so modules can be imported
ROOT_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = ROOT_DIR / "backend"

for p in (str(ROOT_DIR), str(BACKEND_DIR)):
    if p not in sys.path:
        sys.path.insert(0, p)

from backend.main import app
