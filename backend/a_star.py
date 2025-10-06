import heapq
import itertools

# Our final goal state is to have the numbers 1-8 in order and then the blank space.
goal_state = [1, 2, 3, 4, 5, 6, 7, 8, None]

# Ran into an issue when comparing exactly equal tuples, so we found a solution where we insert a unique tuple index so python doesn't try to compare the boards directly which threw an error
unique_counter = itertools.count()

"""
Immediately we knew that this puzzle involved going down different routes and following the ones that had the lowest heuristic distance to goal_state and 
the cheapest cost (or moves) to get there. It felt similar to what we did in class with the map of Romanian cities.

So we made this function to get all the possible moves in a board state. Luckily it was simple as we can just find the empty space and know that
the adjacent tiles can swap with it. It took a lot of trial and error but it works and returns all the possible moves in the possible_moves array.
"""
def get_possible_moves(board):
    # arr to store the possible moves
    possible_moves = []
    # Get the index and coords of the empty space which is None (null in JS, this caused some issues)
    empty_index = board.index(None)
    empty_row, empty_col = divmod(empty_index, 3)

    # Go in all possible directions from here
    for row_offset, col_offset in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
        new_row, new_col = empty_row + row_offset, empty_col + col_offset
        # make sure we don't go out of bounds
        if 0 <= new_row < 3 and 0 <= new_col < 3:
            # Create a copy of the current board so we can apply changes, then find the actual index to swap with
            new_board = board[:]
            swap_index = new_row * 3 + new_col
            # Swap the empty space with the adjacent tile and save this as a possible move
            new_board[empty_index], new_board[swap_index] = new_board[swap_index], new_board[empty_index]
            possible_moves.append(new_board)
    return possible_moves

"""
Main A* Function

We also added a path_taken list so we can display the amount of moves it took as we thought that would be a cool stat to have.
"""
def a_star(start_board, heuristic_func):
    # Edge case where we already are at the goal state (impossible with the way we implemented the frontend, but put it anyways)
    if start_board == goal_state:
        return {
            "path": [start_board],
            "moves": 0,
            "expanded": 0
        }

    # Priority queue containing tuples of (f_score, unique_counter, g_score, current_board, path_taken)
    """
    Here, f_score is the combination of the cost function g(n) and the heuristic function h(n). The minheap automatically sorts all
    additions to the pq based on which one has the lowest f_score value (and then by a unique counter just in case we have two exactly
    equal f_score values, which we ran into an issue with). This way we explore the best routes first.
    """
    pq = []
    initial_h = heuristic_func(start_board)
    heapq.heappush(pq, (initial_h, next(unique_counter), 0, start_board, [start_board]))

    # Visited set to make sure we go down only new paths 
    visited_states = set() 

    while pq:
        f_score, _, g_score, current_board, path_taken = heapq.heappop(pq)

        # Skip the already visited states
        if tuple(current_board) in visited_states:
            continue
        visited_states.add(tuple(current_board))

        # Goal check every time we pop, whenever this is true, we return as this is our most optimal solution
        if current_board == goal_state:
            print(f"Puzzle solved in {len(path_taken)-1} moves")
            print(f"Search expanded {len(visited_states)} states")
            return {
                "path": path_taken,
                "moves": len(path_taken) - 1,
                "expanded": len(visited_states)
            }

        # Explore all possibe board states from the current board state
        for possible_boards in get_possible_moves(current_board):
            # Skip already visited states
            if tuple(possible_boards) in visited_states:
                continue
            # COST IS ADDED HERE
            g_new = g_score + 1
            # HEURISTIC FUNCTION USED HERE (now dynamic)
            h_new = heuristic_func(possible_boards)
            # This is the formula shown in class, so cool to see it here. It combines cost and heuristic to give us the best next move.
            f_new = g_new + h_new
            # Throw this path or node back into the pq with its new f value.
            heapq.heappush(pq, (f_new, next(unique_counter), g_new, possible_boards, path_taken + [possible_boards]))

    # We found out that theoretically some boards are unsolvable, so we added this. However, in the frontend we researched and made it so that the board is always solvable using math.
    print("Board is unsolvable")
    return {
        "path": [start_board],
        "moves": 0,
        "expanded": len(visited_states)
    }
