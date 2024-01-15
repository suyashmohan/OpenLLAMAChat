import json
import requests
import sys

url = "http://127.0.0.1:8000/api/chat"
message = "Hello, can you write a python script to print hello world using oop?"
data = { "content": message }
headers = { "Content-Type": "application/json" }

with requests.post(url, data=json.dumps(data), headers=headers, stream=True) as r:
    for chunk in r.iter_content(1024):
        sys.stdout.write(chunk.decode())
        sys.stdout.flush()