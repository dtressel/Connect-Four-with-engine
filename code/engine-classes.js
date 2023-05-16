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
  _1c: {score: 1.5, flag: null},
  _1o2: {score: 2, flag: null},
  _1o3: {score: 2.5, flag: null},
  _1o4: {score: 3, flag: null},
  _2c: {score: 3, flag: null},
  _2o2: {score: 4.5, flag: null},
  _2o2a: {score: 4.5, flag: 1},
  _2o3: {score: 6, flag: null},
  _2o3a: {score: 6, flag: 1},
  _3ca: {score: 6, flag: 2}, /* same as 3v */
  _3cu: {score: 9, flag: null}, /* half as 3oa0 */
  _3oa0: {score: 18, flag: null}, /* twice as 3cu */
  _3oa1: {score: 15, flag: 2},
  _3oa2: {score: 54, flag: 2},
  _4: {score: 255, flag: 3},
  _1v: {score: 1, flag: null},
  _2v: {score: 2, flag: null},
  _3v: {score: 6, flag: 2} /* same as 3ca */
};

class idToPatterns {
  findBottomSpace(char) {
    if (char === 'a') {
      return 0;
    }
    // else if char code is odd
    if (char.charCodeAt() % 2) {
      return 2;
    }
    return 1;
  }

  findMiddleSpace(char) {
    if (char < 'd') {
      return 0;
    }
    // else if char code is divisble by 4 or has remainder of 1
    if (char.charCodeAt() % 4 < 2) {
      return 1;
    }
    return 2;
  }

  findTopSpace(char) {
    if (char < 'h') {
      return 0;
    }
    if (char > 'k') {
      return 2;
    }
    return 1;
  }

  isBottomSpaceEmpty(char) {
    return char === 'a';
  }
  isBottomSpace1(char) {
    return !(char.charCodeAt() % 2);
  }
  isBottomSpace2(char) {
    return !!(char.charCodeAt() % 2) && char !== 'a';
  }
  isMiddleSpaceEmpty(char) {
    return char < 'd';
  }
  isMiddleSpace1(char) {
    return char > 'c' && !!(char.charCodeAt() % 4 < 2);
  }
  isMiddleSpace2(char) {
    return char > 'c' && !(char.charCodeAt() % 4 < 2);
  }
  isTopSpaceEmpty(char) {
    return char < 'h';
  }
  isTopSpace1(char) {
    return char > 'g' && char < 'l';
  }
  isTopSpace2(char) {
    return char > 'k';
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