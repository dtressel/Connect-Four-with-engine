/*
ids for 3-groups:
a(97): 000
b(98): 100
c(99): 200
d(100): 110
e(101): 210
f(102): 120
g(103): 220
h(104): 111
i(105): 211
j(106): 121
k(107): 221
l(108): 112
m(109): 212 switched
n(110): 122 switched
o(111): 222

Tests:
1st empty - if (str[x] = 'a');
1st 1 - if set(bdfhjlm)
1st 2 - if set(cegikno)
2nd empty - if (str[x] < 'd')
2nd 1 - let nd1 = new Set();
        nd1.add('d').add('e').add('h').add('i').add('l').add('n');
        if (nd1.has(str[x]))

2nd 2 - let nd1 = new Set();
        nd1.add('f').add('g').add('j').add('k').add('m').add('o');
        if (nd1.has(str[x]))
3rd empty - if (str[x] < 'h');
3rd 1 - if (str[x] > 'g' && str[x] < 'l')
3rd 2 - if (str[x] > 'k')
*/

// first set of letters represent the bottom 3 spaces in each column
const startPosId = 'aaaaaaaaaaaaaa';

const rows = 6;
const columns = 7;

// translates old position character to new position character
// example: for "a1", the old position character was "a" and player 1 put a piece in that column
const posIdKey = {
  a1: 'b',
  a2: 'c',
  b1: 'd',
  b2: 'f', 
  c1: 'e',
  c2: 'g',
  d1: 'h',
  d2: 'l',
  e1: 'i',
  e2: 'm',
  f1: 'j',
  f2: 'n',
  g1: 'k',
  g2: 'o'
};

// various line possibilities and their scores and flags
// Flags:
// 1: the player has no threat, or the opponent will be able to make a threat on the next move
// 2: the player is making a threat, or the opponent will be able to win on next move
// 3: the player is winning with this move, or error if in opponent's list
const lineScoreKey = {
  _1c: {score: 1.5},
  _1o2: {score: 2},
  _1o3: {score: 2.5},
  _1o4: {score: 3},
  _2c: {score: 3},
  _2o2: {score: 4.5},
  _2o2a: {score: 4.5, flag: 1},
  _2o3: {score: 6},
  _2o3a: {score: 6, flag: 1},
  _3ca: {score: 6, flag: 2, three: true}, /* same as 3v */
  _3cu: {score: 9, three: true}, /* half as 3oa0 */
  _3oa0: {score: 18, three: true}, /* twice as 3cu */
  _3oa1: {score: 15, flag: 2, three: true},
  _3oa2: {score: 54, flag: 2, three: true},
  _4: {score: 255, flag: 3},
  _0v: {score: 0},
  _1v: {score: 1},
  _2v: {score: 2},
  _3v: {score: 6, flag: 2, three: true} /* same as 3ca */
};

class idToPatterns {
  static findBottomSpace(char) {
    if (char === 'a') {
      return 0;
    }
    // else if char code is odd
    if (char.charCodeAt() % 2) {
      return 2;
    }
    return 1;
  }

  static findMiddleSpace(char) {
    if (char < 'd') {
      return 0;
    }
    // else if char code is divisble by 4 or has remainder of 1
    if (char.charCodeAt() % 4 < 2) {
      return 1;
    }
    return 2;
  }

  static findTopSpace(char) {
    if (char < 'h') {
      return 0;
    }
    if (char > 'k') {
      return 2;
    }
    return 1;
  }

  static isBottomSpaceEmpty(char) {
    return char === 'a';
  }
  static isBottomSpace1(char) {
    return !(char.charCodeAt() % 2);
  }
  static isBottomSpace2(char) {
    return !!(char.charCodeAt() % 2) && char !== 'a';
  }
  static isMiddleSpaceEmpty(char) {
    return char < 'd';
  }
  static isMiddleSpace1(char) {
    return char > 'c' && !!(char.charCodeAt() % 4 < 2);
  }
  static isMiddleSpace2(char) {
    return char > 'c' && !(char.charCodeAt() % 4 < 2);
  }
  static isTopSpaceEmpty(char) {
    return char < 'h';
  }
  static isTopSpace1(char) {
    return char > 'g' && char < 'l';
  }
  static isTopSpace2(char) {
    return char > 'k';
  }
}

class verticalEval {
  /* creates an array
      [
        {(player 1 object)
          scoreTotal: <num>, 
          threes: [<type>, <score>, <CompletionSpot>], 
          completionSpots: [<spot1>, <spot2>...]
        },
        {(player 2 object)
          scoreTotal: <num>, 
          threes: [<type>, <score>, <CompletionSpot>], 
          completionSpots: [<spot1>, <spot2>...]
        }
      ]
  */
  constructor(posId) {
    this.posId = posId;
    // this.columnIds = this.getColumnsIds();
    this.columnEvals = this.getcolumnEvals();
  }

  EvaluateAll() {
    // create a column posId for each column
    let columnIds = this.getColumnsIds();
    // get an Evaluation object from each vertical
    for (let i = 0; i < columnIds.length; i++) {
      let columnEval = EvaluateOne(columnIds[i], i);
    }

  }

  getColumnIds(posId) {
    let columnIds = [];
    for (let i = 0; i < columns; i++) {
      let columnId = '';
      // get id letters from first through last corresponding index
      for (let j = i; j < posId.length; j += columns) {
        columnId += posId[j];
      }
      columnIds.push(columnId);
    }
    return columnIds;
  }

  EvaluateOne(columnId, xPos) {
    let topMostChain = {player: 0, yPosOfTopPiece: rows - 1};
    for (i = columnId.length - 1; i >= 0; i--) {
      // check top space
      if (columnId[i] < 'h') {
        topMostChain.yPosOfTopPiece--;
      } else {
        const player = idToPatterns.findTopSpace(columnId[i]);
        if (!topMostChain.player) {
          topMostChain.player = player;
          topMostChain.numInARow = 1;
        } else if (topMostChain.player === player) {
          topMostChain.numInARow++;
        } else {
          break;
        }
      }
      // check middle space
      if (columnId[i] < 'd') {
        topMostChain.yPosOfTopPiece--;  
      } else {
        const player = idToPatterns.findMiddleSpace(columnId[i]);
        if (!topMostChain.player) {
          topMostChain.player = player;
          topMostChain.numInARow = 1;
        } else if (topMostChain.player === player) {
          topMostChain.numInARow++;
        } else {
          break;
        }
      }
      // check bottom space
      if (columnId[i] === 'a') {
        topMostChain.yPosOfTopPiece--;  
      } else {
        const player = idToPatterns.findBottomSpace(columnId[i]);
        if (!topMostChain.player) {
          topMostChain.player = player;
          topMostChain.numInARow = 1;
        } else if (topMostChain.player === player) {
          topMostChain.numInARow++;
        } else {
          break;
        }
      }
    }
    // check if completion possible
    if ((4 - topMostChain.numInARow + topMostChain.yPosOfTopPiece) >= rows) {
      // 'player: 0' will indicate a column with no score for either players
      // either because of an empty column or a column with no potential win
      return {player: 0};
    }
    // Build Return Object
    let returnObj;
    if (topMostChain.numInARow === 4) {
      returnObj = {...lineScoreKey._4};
    } else {
      returnObj = {...lineScoreKey[`_${topMostChain.numInARow}v`]};
    }
    returnObj.player = topMostChain.player;
    if (returnObj.three) {
      returnObj.completionSpot = `${xPos}${topMostChain.yPosOfTopPiece + 1}`;
    } else {
      // find required spots and change in score if one is another's completion spot
      for (let i = 1; i <= 4 - topMostChain.numInARow; i++) {
        returnObj[`_${xPos}${topMostChain.yPosOfTopPiece + i}`] = -returnObj.score;
      }
    }
    return returnObj;
  }
}

class GameInstance {
  constructor(rows, columns) {
    this.rows;
    this.columns;
    this.startingPosition = this.getStartingPosition();
    this.currentPosition = this.startingPosition;
    this.firstPlayersTurn = true;
  }

  getStartingPosition() {
    const positionIdLength = Math.ceiling(this.rows / 3) * this.columns;
    return 'a'.repeat(positionIdLength);
  }
}

class EvalTree {
  constructor(head, numberOfColumns) {
    this.head = head;
    this.evalOrder = createEvalOrder(numberOfColumns);
    // Also store evaluation depth and play depth
  }

  createEvalOrder(numberOfColumns) {
    // below first
    let testColumn = Math.floor(numberOfColumns / 2);
    const evalOrder = [];
    for (let i = 1; i <= numberOfColumns; i++) {
      evalOrder.push(testColumn);
      if (i % 2) {
        testColumn -= i;
      } else {
        testColumn += i;
      }
    }
    return evalOrder;
  }

}

class EvalTreeNode {
  constructor(x, player, depth, parent, neighborNext, neighborPrev) {
    this.x = x;
    this.depth = depth;
    this.parent = parent;
    this.neighborNext = neighborNext;
    this.neighborPrev = neighborPrev;
    this.positionId = this.findPositionId(x, player, parent.positionId);
    this.searchList();
    this.checkForWin(x);
    this.prospectiveChildren = listProspectiveChildren();
  }

  // method that creates the correct position id ***fastest
  findPositionId(x, player, parPosId) {
    let idx = x;
    while (parPosId[x] > 'g') {
      idx += columns;
    }
    // if (parPosId[x] < 'h') {
    //   idx = x;
    // } else{
    //   idx = x + 7;
    // }
    const newChar = posIdKey[`${parPosId[idx]}${player}`];
    return parPosId.substring(0, idx) + newChar + parPosId.substring(idx + 1);
  }

  // Search the linked list that stores the position ids and references
  // if value is found in linked list, store reference to evaluation
  // if value isn't found, trigger the evaluation method and store , id and reference in linked list
  searchList() {

  }

  checkForWin(x) {

  }

  // Evaluates the position using the positionId
  evaluatePosition() {
    // step 1: create array of non-empty vertical lines
    const verticalLines = [];
    // find non-empty vertical lines
    for (let i = 0; i < columns; i++) {
      if (this.positionId[i] > 'a') {

      }
    }
  }

  // Creates a list of what x-value children to create
  // weeds out full columns and is null if game won
  listProspectiveChildren() {

  }
}

class LinkedListNode {

}