class Evaluation {
    constructor(x, pathOfParent, xOfPreviousMove, player) {
        this.x = x;
        this.y = this.availSpotArray()[x] + 1;
        this.spot = this.x * 10 + this.y;
        this.player = player;
        this.pathOfParent = pathOfParent;
        this.floating3s = [];
        this.p1ClaimedPots = [];
        this.p2ClaimedPots = [];
        this.parentRef = this.findParentRef();
        this.extension = 0;
        this.localEval = 0;
        this.inheritedEval = 0;
        this.endPoint = false; // (p1Wins, p2Wins, draw, compForcedMove)
        this.availColumns = null;
        this.CheckForDraw();
        moveCounter: null; // ??
        brokenPotArray: null;
    }
    // local evaluation
    // pots broken on this move
    // create broken pot array
    // column full: true or false
    // board object
    // relevant pots
    // array of path?

    findParentRef() {
        let parent = evalTree;
        for (key of this.pathOfParent) {
            parent = parent[key];
        }
        return parent;
    }

    // Creates the new avail spot array created after move
    availSpotArray() {
        if (this.availSpotHard) {
            return this.availSpotHard;
        }
        let parentAS = this.parentRef.availSpot;
        let newAvailSpot = parentAS.slice();
        newAvailSpot[this.x]--;
        return newAvailSpot;
    }

    // Array list of broken pots (merging arrays using spread operator fastest)
    brokenPots() {
        if (this.brokenPotsHard) {
            return this.brokenPotsHard;
        }
        let parentBrokenPot = this.parentRef.brokenPots;
        let newBrokenPot = parentBrokenPot.slice();
        // ************************** loop over newly broken pots and add to newBrokenPot
    }

    findRelevantPots() {
        const relevantPots = {vertPot: [], horPot: [], diagUpPot: [], diagDnPot: []};
        // vertPot
        if (this.y < (height - 3)) {relevantPots.vertPot.push(this.spot)};
        if (this.y > 0 && this.y < (height - 2)) {relevantPots.vertPot.push(this.spot - 1)};
        if (this.y > 1 && this.y < (height - 1)) {relevantPots.vertPot.push(this.spot - 2)};
        if (this.y > 2) {relevantPots.vertPot.push(this.spot - 3)};
        // horPot
        if (this.x < (width - 3)) {relevantPots.horPot.push(this.spot)};
        if (this.x > 0 && this.x < (width - 2)) {relevantPots.horPot.push(this.spot - 10)};
        if (this.x > 1 && this.x < (width - 1)) {relevantPots.horPot.push(this.spot - 20)};
        if (this.x > 2) {relevantPots.horPot.push(this.spot - 30)};
        // diagUpPot
        if (this.y > 2 && this.x < width - 3) {relevantPots.diagUpPot.push(this.spot)};
        if (this.y > 1 && this.y < height - 1 && this.x < width - 2 && this.x > 0) {relevantPots.diagUpPot.push(this.spot - 9)};
        if (this.y > 0 && this.y < height - 2 && this.x < width - 1 && this.x > 1) {relevantPots.diagUpPot.push(this.spot - 18)};
        if (this.y < height - 3 && this.x > 2) {relevantPots.diagUpPot.push(this.spot - 27)};
        // diagDnPot
        if (this.y < height - 3 && this.x < width - 3) {relevantPots.diagDnPot.push(this.spot)};
        if (this.y < height - 2 && this.y > 0 && this.x < width - 2 && this.x > 0) {relevantPots.diagDnPot.push(this.spot - 11)};
        if (this.y < height - 1 && this.y > 1 && this.x < width - 1 && this.x > 1) {relevantPots.diagDnPot.push(this.spot - 22)};
        if (this.y > 2 && this.x > 2) {relevantPots.diagDnPot.push(this.spot - 33)};
        return relevantPots;
    }

    createBoardObject() {
        if (this.boardObjectHard) {
            return this.boardObjectHard;
        }
        // let parentBoardObject 
    }

    checkForDraw() {
        if (this.y = 0) {
            for (availSpot of this.availSpotArray()) {
                if (availSpot > -1) {
                    return;
                }
            }
            this.endPoint = draw;
        }
    }


}