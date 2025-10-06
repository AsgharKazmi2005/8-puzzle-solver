goal = [1, 2, 3, 4, 5, 6, 7, 8, None]



def manhattan_distance(board):
    total = 0
    for i, val in enumerate(board):
        if val is None:
            continue
        # Because the frontend sends a flat list and our goal state is also a flat list, we need to use remainder math to convert it to coordinates
        goal_r, goal_c = divmod(goal.index(val), 3)
        cur_r, cur_c = divmod(i, 3)
        total += abs(goal_r - cur_r) + abs(goal_c - cur_c)
    return total

# Interchangable with incorrect tiles heuristic, we named it to be consistent with the frontend
def correct_tiles(board):
    count = 0
    for i, val in enumerate(board):
        if val is not None and val == goal[i]:
            count += 1
    # We subtract count from 8 to turn it into a cost as having more correct is better or less costly
    return 8 - count


def combined_heuristic(board):
    return manhattan_distance(board) + correct_tiles(board)
