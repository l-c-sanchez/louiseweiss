# How to build and run this project

### Prerequisite

You'll need to have [Typescript installed](https://www.npmjs.com/package/typescript).

### Building the project

Run these commands in project root.

```bash
npm install
tsc
```

### Generating the optimal directions for Pacman

One of the games is a Pacman game. For this game, we generated a json file containing the shortest paths from a point of the map to another in order to move the boss character cleverly. To regenerate this file, you should run these command from the root of the project:

```bash
python3 scripts/shortest_path.py assets/tilesets/ClaraPacman.json assets/data/directions.json
```

### Running the project

Run this command in project root.

```bash
http-server
```
# Coding conventions

### Naming convention and style

Class, enum and interfaces names must be written in Pascal case, which means in mixed case and begin with an upper-case letter.

Member variables names must be written in Pascal case, which means in mixed case and begin with an upper-case letter.

Methods names must be written in camelCase, which means in mixed case and begin with a lower-case letter.

Local variables must be written in camelCase, which means in mixed case and begin with a lower-case letter.

(Always prefix private member variables with an m.) ?
```js
private mSomeNumber: number;
```

(Consider prefixing private static variables with an s.) ?
```js
private static sSomeNumber: number;
```

Name methods using verb-object pairs where possible. E.g. showDialog() .

Indentation must be of 4 spaces true tabs and be incremented by one per control structure.

The opening bracket must be on the same line as the control instruction.

The closing bracket must be on a new line.

### Coding Practices

Avoid putting multiple classes in a single file.

Avoid long methods.

Line lengths should be kept short. 80 characters is desirable, 100 is acceptable, 120 should never be reached.

Avoid comments that explain the obvious, comments should explain intent.

Never hard code a numeric value, always declare a constant or readonly field instead.

All methods and variables should be marked with an explicit access modifier, i.e. public, protected or private.

Avoid using the ternary operator ?: where it makes code difficult to follow.

Never use goto other than as part of a switch statement to move to another case within that statement.

It is a good idea to have a default case in a switch statement that asserts where you expect to have handled all cases.
