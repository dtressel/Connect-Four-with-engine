// evaluation constant
const potFilledValues = [0, 1, 2, 7, 255];
// setup variables

let playFirst = false;
// monitoring variables

let evaluationDepth = 0;
let availColumns = width;
const availSpot = [];
for (let i = 0; i < width; i++) {
  availSpot.push(height);
}


let evalTree = {};

// on Start Game build start of evalTree
function startEvalTree() {
    for (let i = 0; i < width; i++) {
        // setup first level of Eval Tree (different since first move)
        for (let j = 0; j < width; i++) {
        // setup second level of Eval Tree (typical using class)
        }
    }
}