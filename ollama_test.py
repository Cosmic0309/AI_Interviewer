import requests

response = requests.post(
    "http://localhost:11434/api/generate",
    json={
        "model": "tinyllama",
        "prompt": "Generate 3 Python interview questions",
        "stream": False
    }
)

print(response.json()["response"])