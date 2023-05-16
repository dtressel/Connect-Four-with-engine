// on branch function list changes

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