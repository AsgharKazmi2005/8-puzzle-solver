# Simple flash server to communication between frontend and backend
from flask import Flask, request, jsonify
from flask_cors import CORS
from a_star import a_star

app = Flask(__name__)

# Allow requests from any origin
CORS(app, resources={r"/*": {"origins": "*"}})

# Endpoint to call our a_star function with the provided board state from the frontend
@app.route("/solve", methods=["POST"])
def solve():
    data = request.get_json()
    start = data.get("start")

    if not start:
        return jsonify({"error": "Missing start board"}), 400

    path = a_star(start)
    return jsonify({"solution": path})

if __name__ == "__main__":
    app.run(debug=True)
