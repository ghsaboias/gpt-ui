import os

import tiktoken
from dotenv import load_dotenv
from flask import Flask, Response, jsonify, request
from flask_cors import CORS
from openai import OpenAI

load_dotenv()

app = Flask(__name__)

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
openai_client = OpenAI(api_key=OPENAI_API_KEY)

# handle cors
CORS(app)

@app.route('/')
def index():
    return 'Hello World!'

@app.route('/api/prompt', methods=['GET', 'POST'])
def prompt():
    if request.method == 'POST':
        prompt_text = request.json['prompt']
        model = request.json['model']

        # Encoding used later for counting tokens
        encoding = tiktoken.encoding_for_model(model)
        
        def generate():
            openai_response = openai_client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "user", "content": prompt_text}
                ],
                stream=True
            )
            
            total_token_count = 0
            for chunk in openai_response:
                if chunk.choices[0].delta.content is not None:
                    tokens = encoding.encode(chunk.choices[0].delta.content)
                    token_count = len(tokens)
                    total_token_count += token_count
                    content = chunk.choices[0].delta.content
                    yield content
            
            # After the stream ends, send the total token count
            yield f"token_count: {total_token_count}"

        response = Response(generate(), content_type='text/event-stream')
        return response

if __name__ == '__main__':
    app.run(debug=True)
