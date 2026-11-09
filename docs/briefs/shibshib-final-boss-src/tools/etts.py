# edge-tts wrapper that trusts the session proxy CA bundle (verification stays on).
import sys, certifi
certifi.where = lambda: "/root/.ccr/ca-bundle.crt"
from edge_tts.util import main
sys.exit(main())
