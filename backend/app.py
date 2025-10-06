# Simple Flask server to communicate between frontend and backend
from flask import Flask, request, jsonify
from flask_cors import CORS
from a_star import a_star
from heuristics import manhattan_distance, correct_tiles, combined_heuristic

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Path for when user only selects the manhattan distance heuristic
@app.route("/solve/manhattan", methods=["POST"])
def solve_manhattan():
    data = request.get_json()
    start = data.get("start")

    if not start:
        return jsonify({"error": "Missing start board"}), 400

    result = a_star(start, heuristic_func=manhattan_distance)
    return jsonify({
        "solution": result["path"],
        "moves": result["moves"],
        "expanded": result["expanded"]
    })

# Path for when user only selects the correct tiles heuristic
@app.route("/solve/correct_tiles", methods=["POST"])
def solve_correct_tiles():
    data = request.get_json()
    start = data.get("start")

    if not start:
        return jsonify({"error": "Missing start board"}), 400

    result = a_star(start, heuristic_func=correct_tiles)
    return jsonify({
        "solution": result["path"],
        "moves": result["moves"],
        "expanded": result["expanded"]
    })

# Path for when user selects the combined heuristic (meaning the manhattan and the correct tiles heuristic)
@app.route("/solve/combined", methods=["POST"])
def solve_combined():
    data = request.get_json()
    start = data.get("start")

    if not start:
        return jsonify({"error": "Missing start board"}), 400

    result = a_star(start, heuristic_func=combined_heuristic)
    return jsonify({
        "solution": result["path"],
        "moves": result["moves"],
        "expanded": result["expanded"]
    })

if __name__ == "__main__":
    app.run(debug=True)