var alpha = 0.5;
var gama = 0.8;
var episilon = 0.1;

var QTable = new Map();

/**
 * @return object {x, y};   
 */
function getMyPosition() {
    return { x: get_my_x(), y: get_my_y() };
}

/**
 * @return object {board, myPos};
 */
function getCurrentState() {
    return {
        board: get_board(),
        myPos: getMyPosition()
    };
}

/**
 * @return String StringBit to represent a object key;
 */
function getQTableKeyForState(state) {
    var s = "";
    for (var y = 0; y < state.board.length; y++) {
        for (var x = 0; x < state.board.length; x++) {
            s += (state.myPos.x === x && state.myPos.y === y) ? state.board[x][y] + 5 : state.board[x][y];
        }
    }
    return s;
}

/**
 * @return array with points for each action in current state
 */
function getActionsArrayForState(state) {
    var array = QTable.get(getQTableKeyForState(state));
    if (!array) {
        array = [0, 0, 0, 0, 0, 0];
        QTable.set(getQTableKeyForState(state), array);
    }
    return array;
}

/**
 * Check if fruit is needed based on it's ID and amount on map
 */
function isFruitNeeded(fruit) {
    var myCount = get_my_item_count(fruit);
    var totalCount = get_total_item_count(fruit);
    return !(myCount > totalCount/2)
}


function getRewardForAction(choose_action, state) {
    if(GamePlay.show_logs) console.log("call getRewardForAction");
    var R = 0;
    var board = state.board;
    var fruit = board[state.myPos.x][state.myPos.y];
    if(GamePlay.show_logs) console.log("state:");
    if(GamePlay.show_logs) console.log(state);
    if(GamePlay.show_logs) console.log("fruit = " +fruit);
    if(GamePlay.show_logs) console.log("choose action = " +choose_action);
    if(
        (choose_action === WEST && state.myPos.x === 0) || 
        (choose_action === EAST && state.myPos.x === board.length -1) ||
        (choose_action === NORTH && state.myPos.y === 0) || 
        (choose_action === SOUTH && state.myPos.y === board.length -1) || 
        (choose_action === PASS)
    ) { // Walking outside the board or choosing PASS action
        R = -1000;
    } else
    if(choose_action === TAKE) {
        if(GamePlay.show_logs) console.log("isFruitNeeded: " + isFruitNeeded(fruit));
        if(fruit === 0 || (fruit && !isFruitNeeded(fruit))) {
            R = -30;
            if(GamePlay.show_logs) console.log("nao devia pegar fruta");
        } else {
            R = 300 * (1/get_total_item_count(fruit));
        }
    } else 
    if (choose_action === WEST || choose_action === EAST || choose_action === NORTH || choose_action === SOUTH) {
        if(fruit && (isFruitNeeded(fruit))) {
            R = -30;
        } else {
            R = -15;
        }
    }
    if(GamePlay.show_logs) console.log("end getRewardForActions");
    return R;
}


function getMaxQ(state) {
    var QTableLine = getActionsArrayForState(state);
    var highestValue = QTableLine[0];
    // find highest value/index
    for (var i = 1; i < QTableLine.length; i++) {
        if (QTableLine[i] > highestValue) {
            highestValue = QTableLine[i];
        }
    }
    // random between indexes that contains highest value
    var indexes = [];
    for (var i = 0; i < QTableLine.length; i++) {
        if (QTableLine[i] === highestValue) {
            indexes.push(i);
        }
    }
    var highestIndex = indexes[Math.floor(Math.random() * (indexes.length))];
    return { value: highestValue, index: highestIndex };
}