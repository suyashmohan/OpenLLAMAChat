import json
import requests

url = "http://127.0.0.1:8000/api/chat"
message = "Hello, how are you?"
data = { "content": message }
headers = { "Content-Type": "application/json" }

with requests.post(url, data=json.dumps(data), headers=headers, stream=True) as r:
    for chunk in r.iter_content(1024):
        print(chunk)