from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests

from resume_parser import extract_resume_text

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/upload', methods=['POST'])
def upload_resume():

    if 'resume' not in request.files:
        return jsonify({"error": "No resume uploaded"})

    file = request.files['resume']

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    resume_text = extract_resume_text(filepath)

    prompt = f"""
    You are an AI technical interviewer.

    Analyze the following resume and generate 5 interview questions.

    RULES:
    1. Generate ONLY interview questions.
    2. Do NOT generate a resume.
    3. Do NOT generate candidate details.
    4. Do NOT generate explanations.
    5. Do NOT generate answers.
    6. Questions must be based on:
        - Skills
        - Projects
        - Education
        - Work Experience
    7. Mix technical and HR questions.
    8. Ask exactly 5 questions.
    9. Number questions from 1 to 5.
    10. Keep questions professional and relevant.
    11. Do not repeat questions.
    12. Output plain text only.
    Resume:
    {resume_text}

    Output only the questions.
    """

    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "tinyllama",
            "prompt": prompt,
            "stream": False
        }
    )

    questions_text = response.json()["response"]

    questions = [
        q.strip()
        for q in questions_text.split("\n")
        if q.strip()
    ]

    return jsonify({
        "success": True,
        "questions": questions
    })
@app.route('/evaluate_answer', methods=['POST'])
def evaluate_answer():
    data = request.json

    question = data['question']
    answer = data['answer']

    prompt = f"""
You are an AI Interview Evaluator.

Question:
{question}

Candidate Answer:
{answer}

RULES:
1. Evaluate only the given answer.
2. Score from 0 to 10.
3. Consider:
   - Technical knowledge
   - Communication
   - Clarity
   - Confidence
4. Give short feedback.
5. Give improvement suggestions.
6. Be objective and professional.

Output Format:

Score: X/10

Feedback:
...

Suggestions:
...
"""

    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "tinyllama",
            "prompt": prompt,
            "stream": False
        }
    )

    result = response.json()["response"]

    return jsonify({
        "evaluation": result
    })

if __name__ == '__main__':
    app.run(debug=True)