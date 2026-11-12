# Minimal Kaggle API client through www.kaggle.com (the proxy injects the user's token as Authorization: Bearer)
import json, sys, urllib.request
BASE = 'https://www.kaggle.com/api/v1/'
def call(service, method, body):
    req = urllib.request.Request(BASE + f'{service}/{method}', data=json.dumps(body).encode(),
                                 headers={'Content-Type': 'application/json', 'Authorization': 'Bearer proxy-injected'})
    try:
        with urllib.request.urlopen(req, timeout=120) as r: return json.load(r)
    except urllib.error.HTTPError as e: return {'http_error': e.code, 'body': e.read()[:500].decode('utf8', 'ignore')}
if __name__ == '__main__':
    print(json.dumps(call(sys.argv[1], sys.argv[2], json.loads(sys.argv[3])), indent=1)[:3000])
