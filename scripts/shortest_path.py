"""
This script read a Tilemap from a json file and transform it in a map 
with boolean values: True if the player can go on the specific case.
"""

import base64
import json
import struct
import sys

from enum import Enum


def map_from_json_tilemap(fname):
    """
    :param fname: name of the json file containing the tilemap
    :return: A array of boolean representing the tilemap. True values are the ones where the player can
    move.
    """
    # Read the tilemap
    with open(fname, 'r') as f:
        tilemap = json.load(f)

    # Building a dict with tile_id -> collides
    tiles = tilemap["tilesets"][0]["tiles"]
    collides = {}
    for tile in tiles:
        for p in tile["properties"]:
            if p["name"] == "collides":
                collides[tile["id"]] = p["value"]


    data = tilemap["layers"][0]["data"]
    bytes = base64.b64decode(data)
    b_format = '<' + 'I' * int(len(bytes) / 4)
    ids = struct.unpack(b_format, bytes)
    ids = [i-1 for i in ids]  # encoded indices are in range(1, 51) so we need to remove 1

    height = tilemap["height"]
    width = tilemap["width"]

    map = [[False for _ in range(width)] for _ in range(height)]
    for row in range(height):
        for col in range(width):
            map[row][col] = not collides[ids[row * width + col]]

    return map


def print_map(map):
    for row in map:
        print(''.join('.' if elem else '#' for elem in row))


def print_path(map, positions):
    positions = set(tuple(elem) for elem in positions)
    nrow = len(map)
    ncol = len(map[0])
    for i in range(nrow):
        row = []
        for j in range(ncol):
            if (i, j) in positions:
                row.append('x')
            elif map[i][j]:
                row.append('.')
            else:
                row.append('#')
        print(''.join(row))


def neighbours(map, point):
    """
    Returns an array of positions (tuples) around point,
    excluding point
    """
    row, col = point
    deltas = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    results = []
    for drow, dcol in deltas:
        new_row = row + drow
        new_col = col + dcol
        try:
            if map[new_row][new_col]:
                results.append((new_row, new_col))
        except IndexError:
            # new point was outside the map
            pass
    return results


def shortest_path(map, origin, dest, visited=None):
    """
    Finds shortest path from origin to dest in map. Available cases are case with the value True. 
    Returns a tuple (path_length, path) where path is the list of cases to go from origin to dest (both included).
    """
    if visited:
        visited = set(visited)
    else:
        visited = set()
    origin, dest = tuple(origin), tuple(dest)
    if origin == dest:
        return (0, [origin])
    if not map[origin[0]][origin[1]] or not map[dest[0]][dest[1]]:
        return None

    visited.add(origin)
    paths = []
    for neighbour in neighbours(map, origin):
        if neighbour not in visited:
            path = shortest_path(map, neighbour, dest, visited)
            if path is not None:
                paths.append(path)
    if not paths:
        return None
    length, positions = min(paths, key=lambda x: x[0])
    return (length + 1, [origin] + positions)


class Direction(Enum):
    LEFT = "L"
    RIGHT = "R"
    UP = "U"
    DOWN = "D"
    NONE = "N"


def path_to_direction(positions):
    if not positions or len(positions) < 2:
        return Direction.NONE
    row1, col1 = positions[0]
    row2, col2 = positions[1]
    if row2 > row1:
        return Direction.DOWN
    elif row2 < row1:
        return Direction.UP
    elif col2 > col1:
        return Direction.RIGHT
    else:
        return Direction.LEFT


def get_direction(map, origin, dest):
    result = shortest_path(map, origin, dest)
    if result:
        length, positions = result
        return path_to_direction(positions)
    else:
        return Direction.NONE


if __name__ == "__main__":

    print(sys.argv)
    if len(sys.argv) != 3:
        print("Usage: python shortest_path.py path/to/map.json path/to/output.json")
        exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]

    print(f"Reading map from file: {input_path}")
    map = map_from_json_tilemap(input_path)
    print("Printing the map:")
    print_map(map)
    print()

    nrow = len(map)
    ncol = len(map[0])

    n = 0
    directions = {}
    for i in range(nrow):
        for j in range(ncol):
            for k in range(nrow):
                for l in range(ncol):
                    directions[(i, j, k, l)] = get_direction(map, (i, j), (k, l))
                    n += 1
                    if n % 1000 == 0:
                        print(n)

    # Only keep non-none directions and put in json compatible format
    directions = {','.join(str(i) for i in indices): direction.value
                  for indices, direction in directions.items()
                  if direction != Direction.NONE}

    print(f"Writing optimal directions to file: {output_path}")
    with open(output_path, 'w') as f:
        json.dump(directions, f)

