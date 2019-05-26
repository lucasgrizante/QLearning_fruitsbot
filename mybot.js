var QTable = new Map();
var alpha = 0.7;
var gamma = 0.4;
var epsilon = 1;
var epsilonDecrement = 0.0005;

function getMyPosition() {
    return { x: get_my_x(), y: get_my_y() };
}

function getCurrentState() {
    return {
        board: get_board(),
        myPos: getMyPosition()
    };
}

function getQTableKeyForState(state) {
    var s = "board: ";
    for (var x = 0; x < state.board.length; x++) {
        s = s + "{";
        for (var y = 0; y < state.board[x].length; y++) {
            s = s + "[x=" + x + ", y=" + y + ",v=" + state.board[x][y] + "]" + (y === state.board[x].length - 1 ? "," : "");
        }
        s = s + "}" + (x === state.board.length - 1 ? ";" : ",");
    }
    s = s + "player: {x=" + state.myPos.x + ", y=" + state.myPos.y + "};"
    return s;
}

function getActionsArrayForState(state) {
    return QTable.get(getQTableKeyForState(state));
}

// 4 = melancia
// 3 = cereja
// 2 = banana
// 1 = maça

function getRewardForAction(choose_action) {
    var board = get_board();
    var R;
    if (choose_action === TAKE) {
        switch (board[getMyPosition().x][getMyPosition().y]) {
            case 0:
                R = -30;
                break;
            case 1:
                R = 300;
                break;
            case 2:
                R = 210;
                break;
            case 3:
                R = 150;
                break;
            case 4:
                R = 90;
                break;
            default:
                R = -400;
        }
    } else if (choose_action === PASS) {
        R = -100;
    } else if (choose_action === WEST) {
        if (getMyPosition().x === 0)
            R = -1000;
        else if (board[getMyPosition().x - 1][getMyPosition().y] > 0)
            R = -3;
        else
            R = -10;
    } else if (choose_action === EAST) {
        if (getMyPosition().x === board.length - 1)
            R = -1000;
        else if (board[getMyPosition().x + 1][getMyPosition().y] > 0)
            R = -3;
        else
            R = -10;
    } else if (choose_action === NORTH) {
        if (getMyPosition().y === 0)
            R = -1000;
        else if (board[getMyPosition().x][getMyPosition().y - 1] > 0)
            R = -3;
        else
            R = -10;
    } else if (choose_action === SOUTH) {
        if (getMyPosition().y === board[0].length - 1)
            R = -1000;
        else if (board[getMyPosition().x][getMyPosition().y + 1] > 0)
            R = -3;
        else
            R = -10;
    }

    return R;
}

function getMaxQ() {
    var state = getCurrentState();
    var QTableLine = getActionsArrayForState(state);
    var higherValue = QTableLine[0];
    var higherIndex = 0;
    for (var i = 1; i < QTableLine.length; i++) {
        if (QTableLine[i] > higherValue) {
            higherValue = QTableLine[i];
            higherIndex = i;
        }
    }
    return { value: higherValue, index: higherIndex };
}

/*
var EAST = 1;
var NORTH = 2;
var WEST = 3;
var SOUTH = 4;
var TAKE = 5;
var PASS = 6;
*/
function make_move() {
    //console.log("******************************************");

    var choose_action = PASS;
    var oldQValues = getActionsArrayForState(getCurrentState());
    if (oldQValues === undefined) {
        QTable.set(getQTableKeyForState(getCurrentState()), [0, 0, 0, 0, 0, 0]); // 6 possible actions
        oldQValues = getActionsArrayForState(getCurrentState());
    }

    // Update QTable


    /**
     * TODO:
     * Use episilon to randomly explorate
    */

    var maxQ = getMaxQ();
    choose_action = maxQ.index + 1;

    var newQValues = oldQValues;
    newQValues[choose_action - 1] = oldQValues[choose_action - 1]
        + alpha * (getRewardForAction(choose_action) + gamma * maxQ.value - oldQValues[choose_action - 1]);
    // set values for current state, based on choose action:
    QTable.set(
        getQTableKeyForState(getCurrentState()),
        newQValues
    );
    // end Update QTable
    return choose_action;
}

// Optionally include this function if you'd like to always reset to a 
// certain board number/layout. This is useful for repeatedly testing your
// bot(s) against known positions.
//
function default_board_number() {
    return 669462;
}
