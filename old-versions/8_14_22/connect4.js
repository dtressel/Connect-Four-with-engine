/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */

let width = 7;
let height = 6;

let currPlayer = 1; // active player: 1 or 2
let board = []; // array of rows, each row is array of cells  (board[y][x])
let stillHovering = []; // array to determine if the mouse is still hovering over a particular top td cell
const p1Properties = {kind: 'human'};
const p2Properties = {kind: 'computer'};
const playerProperties = [p1Properties, p2Properties];

// audio samples for piece drops - 0 (for all filled except top) to 5 (for empty column)
// two copies of each sample so that there are always sounds even when user rapidly places pieces
audioArray = [
  [new Audio('audio/Sound0.mp3'), new Audio('audio/Sound0b.mp3')], 
  [new Audio('audio/Sound1.mp3'), new Audio('audio/Sound1b.mp3')], 
  [new Audio('audio/Sound2.mp3'), new Audio('audio/Sound2b.mp3')], 
  [new Audio('audio/Sound3.mp3'), new Audio('audio/Sound3b.mp3')], 
  [new Audio('audio/Sound4.mp3'), new Audio('audio/Sound4b.mp3')], 
  [new Audio('audio/Sound5.mp3'), new Audio('audio/Sound5b.mp3')]
];

/** makeBoard: create in-JS board structure:
 *    board = array of rows, each row is array of cells  (board[y][x])
 */

function makeBoard() {
  // sets "board" to empty height x width matrix array
  for (let y = 0; y < height; y++) {
    board[y] = [];
    for (let x = 0; x < width; x++)
      board[y][x] = null;
  }
}

/** makeHtmlBoard: make HTML table and row of column tops. */

function makeHtmlBoard() {
  const htmlBoard = document.getElementById('board');
  //creates Top row of board with classes for top row styles:
  const top = document.createElement("tr");
  top.setAttribute("id", "column-top");
  //adds event listener to top row:
  top.addEventListener("click", handleClick);
  //creates individual cells for top row:
  for (let x = 0; x < width; x++) {
    const headCell = document.createElement("td");
    headCell.setAttribute("id", x);
    //adds event listeners for show piece on hover:
    headCell.addEventListener("mouseover", showHoverPiece);
    headCell.addEventListener("mouseleave", removeHoverPiece);
    top.append(headCell);
  }
  htmlBoard.append(top);

  // creates rows and cells for main board and naming cells with id of "y-x":
  // empty divs are created to contain the blue board styling and to hide blue board overflow
  // Pieces will be placed directly in the td cells but z-index in CSS puts Pieces behind blue board
  for (let y = 0; y < height; y++) {
    const row = document.createElement("tr");
    for (let x = 0; x < width; x++) {
      const blueDiv = document.createElement("div");
      blueDiv.classList.add("game-board-div");
      const emptyDiv = document.createElement("div");
      emptyDiv.classList.add("empty-div");
      emptyDiv.append(blueDiv);
      const cell = document.createElement("td");
      cell.setAttribute("id", `${y}-${x}`);
      cell.append(emptyDiv);
      row.append(cell);
    }
    htmlBoard.append(row);
  }
}

// sets inital stillHovering values for all top td cells to false
function setStillHovering() {
  for (let x = 0; x < width; x++) {
    stillHovering[x] = false;
  }
}

/** findSpotForCol: given column x, return top empty y (null if filled) */

function findSpotForCol(x) {
  let ySpot;
  for (let y = 5; y >= 0; y--) {
    if (!board[y][x]) {
      ySpot = y;
      break;
    }
    if (y === 0) {
      ySpot = null;
    }
  }
  return ySpot;
}

/** placeInTable: update DOM to place piece into HTML table of board */

function placeInTable(y, x) {
  const newPiece = document.createElement('div');
  newPiece.classList.add('piece', `p${currPlayer}`, `fall${y}`);
  document.getElementById(`${y}-${x}`).append(newPiece);
  audioArray[y][currPlayer - 1].play();
}

/** endGame: announce game end */

function endGame(msg) {
  // remove event listeners and reset stillHovering
  document.getElementById('column-top').removeEventListener("click", handleClick,);
  for (let x = 0; x < width; x++) {
    document.getElementById(x).removeEventListener("mouseover", showHoverPiece);
    document.getElementById(x).removeEventListener("mouseleave", removeHoverPiece);
    stillHovering[x] = false;
  }

  // pop up alert message after animation completes
  setTimeout(() => alert(msg + " Refresh page to play again!"), 700);
}

// adds the hover piece
function showHoverPiece(evt) {
  stillHovering[evt.target.id] = false; // shouldn't be necessary but a fail-safe
  const hoverPiece = document.createElement('div');
  hoverPiece.classList.add('piece', `p${currPlayer}`);
  evt.target.append(hoverPiece);
}

// removes the hover piece after mouse leaves cell
function removeHoverPiece(evt) {
  stillHovering[evt.target.id] = false;
  if (evt.target.firstChild) {
    evt.target.firstChild.remove();
  }
}

/** handleClick: handle click of column top to play piece */

function handleClick(evt) {
  // get x from ID of clicked cell
  const x = +evt.target.id;

  // get next spot in column (if none, ignore click)
  const y = findSpotForCol(x);
  if (availSpot[x] === 0) {
    return;
  }

  updateState(x);

  // remove event listener to avoid accidental double clicks
  document.getElementById("column-top").removeEventListener("click", handleClick)

  // place piece in board and add to HTML table
  placeInTable(y, x);

  // remove hover piece
  if (evt.target.firstChild) {
    evt.target.firstChild.remove();
  }

  // sets still hovering to true for clicked cell
  stillHovering[evt.target.id] = true;

  // updates in-memory board
  board[y][x] = currPlayer;

  // check for win
  if (checkForWin()) {
    return endGame(`Player ${currPlayer} won!`);
  }

  // check for tie
  // check if all top cells in board are filled; if so call, call endGame
  if (board[0].every(value => value)) {
    endGame('The game ended in a draw!');
  }

  // switch players
  currPlayer === 1 ? currPlayer = 2 : currPlayer = 1;

  // re-add event listener after brief timeout
  setTimeout(() => {
    document.getElementById("column-top").addEventListener("click", handleClick);}, 
    300);

  // if mouse is still hovering on same cell, replace hover piece after timeout
  setTimeout(() => {if (stillHovering[evt.target.id]) {showHoverPiece(evt)}}, 700);

  // start Evaluation for computer move
  if (playerProperties[currPlayer - 1].kind === 'computer') {
    startEngine();
  }
}

/** checkForWin: check board cell-by-cell for "does a win start here?" */

function checkForWin() {
  function _win(cells) {
    // Check four cells to see if they're all color of current player
    //  - cells: list of four (y, x) cells
    //  - returns true if all are legal coordinates & all match currPlayer

    return cells.every(
      ([y, x]) =>
        y >= 0 &&
        y < height &&
        x >= 0 &&
        x < width &&
        board[y][x] === currPlayer
    );
  }

  // For each coordinate on the board, this checks whether it is the start of a horizontal,
  // vertical, down-right diagonal, or down-left diagonal connect 4

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
      let vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
      let diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
      let diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];

      if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
        return true;
      }
    }
  }
}

makeBoard();
makeHtmlBoard();
setStillHovering();

// computer engine***********************************************************************************************************************
// setup before game start ***********************************************************************************************************
// evaluation parameters
const potFilledValues = [0, 1, 2, 7, 255];
// setup random small variables
const potArray = ['vertPot', 'horPot', 'diagUpPot', 'diagDnPot'];
let playFirst = false;
let availColumns = width;
const availSpot = [];
for (let i = 0; i < width; i++) {
  availSpot.push(height);
}

// setup spot object, which contains detailed info about each spot on the board
const spotObj = {};
for (let x = 0; x < width; x++) {
  for (let y = 0; y < height; y++) {
    spotObj[x * 10 + y] = {
      occupiedBy: 0,
      accessible: false,
      vertPot: {},
      horPot: {},
      diagUpPot: {},
      diagDnPot: {}
    };
    if (y === height - 1) {
      spotObj[x * 10 + y].accessible = true;
    }
    if (y < height - 3) {
      spotObj[x * 10 + y].vertPot = {
        claimedBy: 0,
        numClaimed: 0,
        spotsEmpty: [x * 10 + y, x * 10 + y + 1, x * 10 + y + 2, x * 10 + y + 3]
      }
    }
    if (x < width - 3) {
      spotObj[x * 10 + y].horPot = {
        claimedBy: 0,
        numClaimed: 0,
        spotsEmpty: [x * 10 + y, (x + 1) * 10 + y, (x + 2) * 10 + y, (x + 3) * 10 + y]
      }
    }
    if (x < width - 3 && y > 2) {
      spotObj[x * 10 + y].diagUpPot = {
        claimedBy: 0,
        numClaimed: 0,
        spotsEmpty: [x * 10 + y, (x + 1) * 10 + y - 1, (x + 2) * 10 + y - 2, (x + 3) * 10 + y - 3]
      }
    }
    if (x < width - 3 && y < height - 3) {
      spotObj[x * 10 + y].diagDnPot = {
        claimedBy: 0,
        numClaimed: 0,
        spotsEmpty: [x * 10 + y, (x + 1) * 10 + y + 1, (x + 2) * 10 + y + 2, (x + 3) * 10 + y + 3]
      }
    }
  }
}

// creates player objects that stores info about the players evaluation info and pots
const p1 = {
  vertPot: {},
  horPot: {},
  diagUpPot: {},
  diagDnPot: {},
  double3: false,
};

const p2 = {
  vertPot: {},
  horPot: {},
  diagUpPot: {},
  diagDnPot: {},
  double3: false,
};

const players = [p1, p2];

// after move *********************************************************************************
function updateState(x) {
  const y = availSpot[x] - 1;
  const spot = x * 10 + y;
  availSpot[x]--;
  if (availSpot[x] === 0) {
    availColumns--;
    if (availColumns === 0) {
      // check for win and if not then end game tie
    }
  } else {
    spotObj[spot - 1].accessible = true;
  }
  spotObj[spot].occupiedBy = currPlayer;
  spotObj[spot].accessible = false;
  updatePotInfo(x, y, spot);
  evaluatePosition(players);
}

function updatePotInfo(x, y, spot) {
  const legalPots = findLegalPots(x, y, spot);
  updateSpotObjPots(legalPots);
  removeRedudentVertPots(x);
}

function findLegalPots(x, y, spot) {
  const legalPots = {vertPot: [], horPot: [], diagUpPot: [], diagDnPot: []};
  // vertPot
  if (y < (height - 3)) {legalPots.vertPot.push(spot)};
  if (y > 0 && y < (height - 2)) {legalPots.vertPot.push(spot - 1)};
  if (y > 1 && y < (height - 1)) {legalPots.vertPot.push(spot - 2)};
  if (y > 2) {legalPots.vertPot.push(spot - 3)};
  // horPot
  if (x < (width - 3)) {legalPots.horPot.push(spot)};
  if (x > 0 && x < (width - 2)) {legalPots.horPot.push(spot - 10)};
  if (x > 1 && x < (width - 1)) {legalPots.horPot.push(spot - 20)};
  if (x > 2) {legalPots.horPot.push(spot - 30)};
  // diagUpPot
  if (y > 2 && x < width - 3) {legalPots.diagUpPot.push(spot)};
  if (y > 1 && y < height - 1 && x < width - 2 && x > 0) {legalPots.diagUpPot.push(spot - 9)};
  if (y > 0 && y < height - 2 && x < width - 1 && x > 1) {legalPots.diagUpPot.push(spot - 18)};
  if (y < height - 3 && x > 2) {legalPots.diagUpPot.push(spot - 27)};
  // diagDnPot
  if (y < height - 3 && x < width - 3) {legalPots.diagDnPot.push(spot)};
  if (y < height - 2 && y > 0 && x < width - 2 && x > 0) {legalPots.diagDnPot.push(spot - 11)};
  if (y < height - 1 && y > 1 && x < width - 1 && x > 1) {legalPots.diagDnPot.push(spot - 22)};
  if (y > 2 && x > 2) {legalPots.diagDnPot.push(spot - 33)};
  return legalPots;
}

// updates pots in spotObj and player objects
function updateSpotObjPots(legalPots) {
  for (let xPots in legalPots) {
    for (let pot of legalPots[xPots]) {
      // if move doesn't break pot 
      if (spotObj[pot][xPots].claimedBy === 0 || spotObj[pot][xPots].claimedBy === currPlayer) {
        if (spotObj[pot][xPots].claimedBy === 0) {
          players[currPlayer - 1][xPots][pot] = 1;
        } else {
          players[currPlayer - 1][xPots][pot]++;
        }
        spotObj[pot][xPots].claimedBy = currPlayer;
        spotObj[pot][xPots].numClaimed++;
        const index = spotObj[pot][xPots].spotsEmpty.indexOf(pot);
        spotObj[pot][xPots].spotsEmpty.splice(index, 1);
      } else if (spotObj[pot][xPots].claimedBy > 0) {
        const otherPlayer = spotObj[pot][xPots].claimedBy;
        delete players[otherPlayer - 1][xPots][pot];
        spotObj[pot][xPots].claimedBy = -1;
      } // else if pot is broken ^^
    }
  }
}

function removeRedudentVertPots(x) {
  const redundantKeys = [];
  let relevantKey;
  // find vertPot ids in column in which last piece was added
  for (let key of Object.keys(players[currPlayer - 1].vertPot)) {
    if (+key - x * 10 >= 0 && +key - x * 10 < 10) {
      redundantKeys.push(+key);
    }
  }
  if (redundantKeys.length > 1) {
    relevantKey = Math.max(...redundantKeys);
    const index = redundantKeys.indexOf(relevantKey);
    redundantKeys.splice(index, 1);
    for (let key of redundantKeys) {
      delete players[currPlayer - 1].vertPot[key];
    }
  }
}

function evaluatePosition(playersArray) {
  const playersScore = [];
  for (let i = 0; i < 2; i++) {
    let score = 0;
    for (let potObjId of potArray) {
      let arrayOfValues = Object.values(playersArray[i][potObjId]);
      for (let value of arrayOfValues) {
        score += potFilledValues[value]; 
      }
    }
    playersScore.push(score);
  }
  console.log(playersScore);
  let evaluation = playersScore[0] - playersScore[1];
  console.log(evaluation);
}

function startEngine() {
  console.log('Engine started!!!!');
}

// function evaluation

// const compTree = 

// old*****************************************************************************************************

// function evaluatePosition(playersArray) {
//   const playersScore = [];
//   for (let i = 0; i < 2; i++) {
//     let score = 0;
//     for (let potObjId of potArray) {
//       let baseScore = Object.keys(playersArray[i][potObjId]).length;
//       score += baseScore;
//       let arrayOfValues = Object.values(playersArray[i][potObjId]);
//       let sumOfArrayOfValues = 0;
//       for (let value of arrayOfValues) {
//         sumOfArrayOfValues += value;
//       }
//       let bonus = (sumOfArrayOfValues - baseScore) * .5;
//       score += bonus;
//     }
//     playersScore.push(score);
//   }
//   console.log(playersScore);
//   let evaluation = playersScore[0] - playersScore[1];
//   console.log(evaluation);
// }