import os
import requests
import base64
import json
from io import BytesIO
from PIL import Image
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

def test_model(model_id):
    print(f"Testing {model_id}...")
    img = Image.new('RGB', (100, 100), color = (73, 109, 137))
    buffered = BytesIO()
    img.save(buffered, format="JPEG")
    img_str = base64.b64encode(buffered.getvalue()).decode()

    prompt = "Test. Réponds OK."

    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
            },
            data=json.dumps({
                "model": model_id,
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{img_str}"
                                }
                            }
                        ]
                    }
                ]
            })
        )
        print(f"Status: {response.status_code}")
        if response.status_code != 200:
            print(f"Error: {response.text}")
        else:
            print("Success!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    models = ["google/gemini-flash-1.5", "google/gemini-pro-1.5", "openai/gpt-4o-mini"]
    for m in models:
        test_model(m)
