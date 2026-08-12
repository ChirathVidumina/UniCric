import urllib.request
import json

url = "http://localhost:5000/api/reset-database"
try:
    req = urllib.request.Request(url, method="POST")
    with urllib.request.urlopen(req) as response:
        res = json.loads(response.read().decode())
        print("Reset Database Response:", res)
except Exception as e:
    print("Error invoking reset endpoint:", e)
