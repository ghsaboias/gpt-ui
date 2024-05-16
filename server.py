import os

from dotenv import load_dotenv
from flask import Flask, Response, request
from flask_cors import CORS
from openai import OpenAI

load_dotenv()

app = Flask(__name__)

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
openai_client = OpenAI()

# handle cors
CORS(app)

@app.route('/')
def index():
    return 'Hello World!'

@app.route('/api/prompt', methods=['GET', 'POST'])
def prompt():
    if request.method == 'POST':
        prompt = request.json['prompt']
        model = request.json['model']
    
        def generate():
            openai_response = openai_client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "user", "content": prompt}
                ],
                stream=True
            )
            
            for chunk in openai_response:
                if chunk.choices[0].delta.content is not None:
                    content = chunk.choices[0].delta.content
                    yield content

        return Response(generate(), content_type='text/event-stream')

if __name__ == '__main__':
    app.run(debug=True)