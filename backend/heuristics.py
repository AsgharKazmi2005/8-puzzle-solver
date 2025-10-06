goal = [1, 2, 3, 4, 5, 6, 7, 8, None]


"""
In class we used the euclidean distance, but we have more experience with manhattan distance on leetcode and saw that either could be used so we went with Manhattan.
The general consensus online (sources in report) is that manhattan distance is better when dealing with grids and so we chose it.

So this function is our heuristic part of A*. It was designed to tell us how far we are from the goal state using simple math.
We basically calculate how far each tile is from where it should be on the grid, and that gives us a good idea of how close we are to the goal state.

Mathematically, for each tile, we find its current position (row, col) and its target position (goal_row, goal_col). Then
we derive the distance by calculating the absolute differences in their rows and columns, and summing these differences up for all tiles.
"""
def manhattan_distance(board):
    total = 0
    for i, val in enumerate(board):
        if val is None:
            continue
        goal_r, goal_c = divmod(goal.index(val), 3)
        cur_r, cur_c = divmod(i, 3)
        total += abs(goal_r - cur_r) + abs(goal_c - cur_c)
    return total


def correct_tiles(board):
    count = 0
    for i, val in enumerate(board):
        if val is not None and val == goal[i]:
            count += 1
    # We subtract count from 8 to turn it into a cost as having more correct is better
    return 8 - count


def combined_heuristic(board):
    return manhattan_distance(board) + correct_tiles(board)
