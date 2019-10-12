function make_move(train_mode) {
    /* Execute random movement if actual cycle is less than 200 and a
    random number is less than episilon variable (defined on QLearningHelper) */ 
    if(train_mode && GamePlay.executed_cycles < 200 && Math.random() < episilon) {
        if(GamePlay.show_logs) console.log("Choosing random action");
        return Math.ceil(Math.random() * 6)
    }

    var currentState = getCurrentState();
    if(GamePlay.show_logs) console.log(getActionsArrayForState(currentState));
    var maxQ = getMaxQ(currentState);
    return maxQ.index + 1; // Actions begins on 1, and not 0
}

// Set a default board
function default_board_number() {
    return 669462;
}

