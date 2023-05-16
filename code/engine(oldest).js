// computer engine***********************************************************************************************************************
// setup before game start ***********************************************************************************************************
// evaluation constant
const potFilledValues = [0, 1, 2, 7, 255];
// setup random small variables
let evaluationDepth = 0;
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
    // for some spots, certain pots aren't possible and will remain an empty object
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
  updateSpotObjPots(changesToDo(legalPots));
}

// find pots effected by last move
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

// Makes a list of post-move changes to make to the spotObj and players objects
function changesToDo(legalPots) {
  console.log('in changesToDo');
  const toChange = {
    newlyClaimedPots: [],
    addedToPots: [],
    brokenPots: []
  };
  for (let xPots in legalPots) {
    for (let pot of legalPots[xPots]) {
      switch(spotObj[pot][xPots].claimedBy) {
        // pot unclaimed
        case 0:
          toChange.newlyClaimedPots.push(`${xPots}-${pot}`);
          break;
        // pot claimed by current player
        case currPlayer:
          toChange.addedToPots.push(`${xPots}-${pot}`);
          break;
        // pot claimed by other player
        default:
          toChange.brokenPots.push(`${xPots}-${pot}`);
          break;
      }
    }
  }
  // removes redundant vertPot from newly claimed and adds to broken since it will never get fulfilled
  if (toChange.addedToPots[0] && toChange.newlyClaimedPots[0] && toChange.newlyClaimedPots[0].indexOf('v') === 0 && toChange.addedToPots[0].indexOf('v') === 0) {
    console.log('IN REMOVE REDUNDANT VERTPOTS');
    const removed = toChange.newlyClaimedPots.shift();
    toChange.brokenPots.unshift(removed);
  }
  console.log('toChange =', toChange);
  return toChange;
}

function updateSpotObjPots(toChange) {
  console.log('in updateSpotObjPots');
  for (let potInfo of toChange.newlyClaimedPots) {
    console.log('in ncp loop');
    const [ xPot, pot ] = potInfo.split('-');
    players[currPlayer - 1][xPot][pot] = 1;
    spotObj[pot][xPot].claimedBy = currPlayer;
    spotObj[pot][xPot].numClaimed++;
    const index = spotObj[pot][xPot].spotsEmpty.indexOf(pot);
    spotObj[pot][xPot].spotsEmpty.splice(index, 1);
  }
  for (let potInfo of toChange.addedToPots) {
    console.log('in atp loop');
    const [ xPot, pot ] = potInfo.split('-');
    players[currPlayer - 1][xPot][pot]++;
    spotObj[pot][xPot].numClaimed++;
    const index = spotObj[pot][xPot].spotsEmpty.indexOf(pot);
    spotObj[pot][xPot].spotsEmpty.splice(index, 1);
  }
  for (let potInfo of toChange.brokenPots) {
    console.log('in bp loop');
    const [ xPot, pot ] = potInfo.split('-');
    if (spotObj[pot][xPot].claimedBy > 0) {
      const otherPlayer = spotObj[pot][xPot].claimedBy;
      delete players[otherPlayer - 1][xPot][pot];
    }
    spotObj[pot][xPot].claimedBy = -1;
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

let evaluationObject = {};

function startEngine() {
  console.log('Engine started!!!!');

}



// function evaluation

// const compTree = 

// old*****************************************************************************************************

// updates pots in spotObj and player objects
// function updateSpotObjPots(legalPots) {
//   for (let xPots in legalPots) {
//     for (let pot of legalPots[xPots]) {
//       // if move doesn't break pot 
//       if (spotObj[pot][xPots].claimedBy === 0 || spotObj[pot][xPots].claimedBy === currPlayer) {
//         if (spotObj[pot][xPots].claimedBy === 0) {
//           players[currPlayer - 1][xPots][pot] = 1;
//         } else {
//           players[currPlayer - 1][xPots][pot]++;
//         }
//         spotObj[pot][xPots].claimedBy = currPlayer;
//         spotObj[pot][xPots].numClaimed++;
//         const index = spotObj[pot][xPots].spotsEmpty.indexOf(pot);
//         spotObj[pot][xPots].spotsEmpty.splice(index, 1);
//       } else if (spotObj[pot][xPots].claimedBy > 0) {
//         const otherPlayer = spotObj[pot][xPots].claimedBy;
//         delete players[otherPlayer - 1][xPots][pot];
//         spotObj[pot][xPots].claimedBy = -1;
//       } // else if pot is broken ^^
//     }
//   }
// }

// function removeRedudentVertPots(x) {
//   const redundantKeys = [];
//   let relevantKey;
//   // find vertPot ids in column in which last piece was added
//   for (let key of Object.keys(players[currPlayer - 1].vertPot)) {
//     if (+key - x * 10 >= 0 && +key - x * 10 < 10) {
//       redundantKeys.push(+key);
//     }
//   }
//   if (redundantKeys.length > 1) {
//     relevantKey = Math.max(...redundantKeys);
//     const index = redundantKeys.indexOf(relevantKey);
//     redundantKeys.splice(index, 1);
//     for (let key of redundantKeys) {
//       delete players[currPlayer - 1].vertPot[key];
//     }
//   }
// }