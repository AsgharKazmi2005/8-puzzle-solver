# A*-based 8-Puzzle Solver

The AI-gen free A* Algorithm is located in /backend/a_star.py or via this link: https://github.com/AsgharKazmi2005/8-puzzle-solver/blob/main/backend/a_star.py

The heuristic functions are located seperately in /backend/heuristics.py or via this link: https://github.com/AsgharKazmi2005/8-puzzle-solver/blob/main/backend/heuristics.py

To get it to work on your system locally, clone this repository. Once cloned, run the app.py file in the backend folder
to create the endpoint to which the A* algorithm will respond with the solution.

```
python backend/app.py
```

Then run the frontend with 

```
npm run dev
```

Now you should be able to both play the game as a user or click the A* Solve button to see A* solve the puzzle.

