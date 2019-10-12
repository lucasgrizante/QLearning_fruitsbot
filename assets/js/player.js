var GamePlay = {
    init: function () {
        GamePlay.canvas = document.getElementById('game_view');
        $('.pause').bind('click', function () { GamePlay.mode = "pause"; });
        $('.play').bind('click', function () { GamePlay.mode = "play"; Board.processMove(); GamePlay.draw(); });
        $('.forward').bind('click', function () { Board.processMove(); GamePlay.draw(); });
        $('.newgame').bind('click', function () { GamePlay.setupNewGame(); });
        $('.reset').bind('click', function () { Board.reset(); });
        $('#set_board').bind('click', function () { GamePlay.setBoardNumber(); });
        $('#set_train_cycles').bind('click', function () { GamePlay.setTrainCycles(); });
        $('#board_number').bind('keyup', function (e) { if (e.keyCode == 13) { GamePlay.setBoardNumber(); } });
        $('#train_total_cycles').bind('keyup', function (e) { if (e.keyCode == 13) { GamePlay.setTrainCycles(); } });
        $('#train_total_cycles').val(1000);
        $('.resetQTable').bind('click', function () { GamePlay.resetQTable(); });
        $('#check_breadcrumbs').click(function (evt) {
            if (evt.srcElement.checked) {
                GamePlay.show_breadcrumbs = true;
            } else {
                GamePlay.show_breadcrumbs = false;
            }
        });
        $('#check_trainmode').click(function (evt) {
            if (evt.srcElement.checked) {
                GamePlay.train_mode = true;
            } else {
                GamePlay.train_mode = false;
            }
            //Board.reset();
        });
        $('#check_logs').click(function (evt) {
            if (evt.srcElement.checked) {
                GamePlay.show_logs = true;
            } else {
                GamePlay.show_logs = false;
            }
        });

        GamePlay.show_breadcrumbs = false;
        GamePlay.train_mode = true;
        GamePlay.show_logs = true;
        GamePlay.train_cycles = 1000;
        GamePlay.executed_cycles = 0;
        GamePlay.number_of_steps = [];
        var itemImageUrls = ["assets/images/FruitApple.png", "assets/images/FruitBanana.png", "assets/images/FruitCherry.png", "assets/images/FruitMelon.png", "assets/images/FruitOrange.png"];
        GamePlay.itemImages = new Array();
        for (var i = 0; i < itemImageUrls.length; i++) {
            var img = new Image();
            img.src = itemImageUrls[i];
            GamePlay.itemImages[i] = img;
        }
        GamePlay.player_one_image = new Image();
        GamePlay.player_one_image.src = "assets/images/FruitBlueBot.png";
        GamePlay.player_two_image = new Image();
        GamePlay.player_two_image.src = "assets/images/FruitPurpleBot.png";
        GamePlay.visitedImg = new Image();
        GamePlay.visitedImg.src = "assets/images/FruitCellVisited.png";
        GamePlay.bothVisitedImg = new Image();
        GamePlay.bothVisitedImg.src = "assets/images/FruitCellVisitedBoth.png";
        GamePlay.oppVisitedImg = new Image();
        GamePlay.oppVisitedImg.src = "assets/images/FruitCellOppVisited.png";
        GamePlay.itemImages[itemImageUrls.length - 1].onload = function () {
            GamePlay.setupNewGame();
        };

    },
    setupNewGame: function (boardNumber) {
        // Create a new board setup according to the following priority:
        // 
        // 1. If a board number is passed in, use that.
        // 2. If the bot has default_board_number() defined, use that.
        // 3. Generate a random board number.
        var nextBoardNum;

        if (boardNumber === undefined) {
            if (typeof default_board_number == 'function' && !isNaN(parseInt(default_board_number()))) {
                nextBoardNum = default_board_number()
            } else {
                Math.seedrandom();
                nextBoardNum = Math.min(Math.floor(Math.random() * 999999), 999999);
            }
        } else {
            nextBoardNum = boardNumber;
        }

        $('#board_number').val(nextBoardNum);

        Board.init(nextBoardNum);

        Board.newGame();
        GamePlay.itemTypeCount = get_number_of_item_types();
        document.getElementById('grid').width = GamePlay.itemTypeCount * 50 + WIDTH * 50;
        document.getElementById('grid').height = HEIGHT * 50;
        document.getElementById('game_view').width = GamePlay.itemTypeCount * 50 + WIDTH * 50;
        document.getElementById('game_view').height = HEIGHT * 50;
        $('#buttons').css('padding-left', GamePlay.itemTypeCount * 50);
        $('#buttons').css('padding-top', HEIGHT * 50);
        Grid.draw();
        GamePlay.start();
    },
    start: function () {
        GamePlay.mode = "pause";
        GamePlay.draw();
    },
    draw: function () {
        var ctx = GamePlay.canvas.getContext('2d');
        ctx.clearRect(0, 0, GamePlay.canvas.width, GamePlay.canvas.height);
        GamePlay.drawItems(ctx, Board.board, Board.history);
        GamePlay.drawPlayerTwo(ctx, Board.board);
        GamePlay.drawPlayerOne(ctx, Board.board);
        GamePlay.displayScore(ctx, Board.board);
        GamePlay.displayQLearning(ctx, Board.board);
        if (GamePlay.mode == "play") {
            var score = Board.checkGameOver();
            if (score !== undefined) {
                if (score > 0) {
                    ctx.font = "30px Arial";
                    ctx.fillStyle = "#000";
                    ctx.fillText("You win!", 0, 300);
                }
                if (score < 0) {
                    ctx.font = "30px Arial";
                    ctx.fillStyle = "#000";
                    ctx.fillText("You lose!", 0, 300);
                }
                if (score == 0) {
                    ctx.font = "30px Arial";
                    ctx.fillStyle = "#000";
                    ctx.fillText("You tie!", 0, 300);
                }
                GamePlay.mode = "pause";

                if (GamePlay.train_mode) {
                    GamePlay.executed_cycles++;
                    GamePlay.number_of_steps.push(Board.move_num);
                    console.log(GamePlay.number_of_steps);
                    if (GamePlay.executed_cycles < GamePlay.train_cycles) {
                        Board.reset();
                        GamePlay.mode = "play"; Board.processMove(); GamePlay.draw();
                    }
                }
                return;
            }
            Board.processMove();
            setTimeout(function () { GamePlay.draw(); }, GamePlay.train_mode ? 0 : 400);
        } else {
            GamePlay.mode = "pause";
        }
    },
    displayScore: function (ctx, state) {
        ctx.font = "30px Arial";
        ctx.fillStyle = "#366B76";
        ctx.fillText("My Bot", 0, 50);
        ctx.font = "15px Arial";
        ctx.fillStyle = "#000";
        for (var i = 0; i < GamePlay.itemTypeCount; i++) {
            ctx.fillText(Board.myBotCollected[i].toFixed(1), 50 * i, 75);
            ctx.drawImage(GamePlay.itemImages[i], 52 * i + 15, 55, 25, 25);
        }
        /*
        ctx.font = "30px Arial";
        ctx.fillStyle = "#82298E";
        ctx.fillText("Simple Bot", 0, 125);
        ctx.font = "15px Arial";
        ctx.fillStyle = "#000";
        for (var i=0; i<GamePlay.itemTypeCount; i++) {
            ctx.fillText(Board.simpleBotCollected[i].toFixed(1), 50*i, 150);
            ctx.drawImage(GamePlay.itemImages[i], 52*i+15, 130, 25, 25);
        }
        */
        ctx.font = "30px Arial";
        ctx.fillStyle = "#F00";
        ctx.fillText("items left", 0, 125);
        ctx.font = "15px Arial";
        ctx.fillStyle = "#000";
        for (var i = 0; i < GamePlay.itemTypeCount; i++) {
            ctx.fillText((Board.totalItems[i] - Board.myBotCollected[i] - Board.simpleBotCollected[i]).toFixed(1), 50 * i, 150);
            ctx.drawImage(GamePlay.itemImages[i], 52 * i + 15, 130, 25, 25);
        }
    },
    displayQLearning: function (ctx, state) {
        ctx.font = "30px Arial";
        ctx.fillStyle = "#000000";
        ctx.fillText("QLearning", 0, 205);
        ctx.font = "20px Arial";
        ctx.fillStyle = "#366B76";
        ctx.fillText("Cycles: " + GamePlay.executed_cycles, 0, 235);
        ctx.font = "20px Arial";
        ctx.fillStyle = "#366B76";
        ctx.fillText("Total Cycles: " + GamePlay.train_cycles, 0, 265);
    },
    drawPlayerOne: function (ctx, state) {
        ctx.drawImage(GamePlay.player_one_image, GamePlay.itemTypeCount * 50 + Board.myX * 50 + 2, Board.myY * 50 + 2);
    },
    drawPlayerTwo: function (ctx, state) {
        ctx.drawImage(GamePlay.player_two_image, GamePlay.itemTypeCount * 50 + Board.oppX * 50 - 2, Board.oppY * 50 - 2);
    },
    drawItems: function (ctx, state, history) {
        for (var i = 0; i < WIDTH; i++) {
            for (var j = 0; j < HEIGHT; j++) {
                if (state[i][j] !== 0) {
                    ctx.drawImage(GamePlay.itemImages[state[i][j] - 1], GamePlay.itemTypeCount * 50 + i * 50, j * 50);
                } else if (GamePlay.show_breadcrumbs && history[i][j] == 1) {
                    ctx.drawImage(GamePlay.visitedImg, GamePlay.itemTypeCount * 50 + i * 50, j * 50);
                } else if (GamePlay.show_breadcrumbs && history[i][j] == 2) {
                    ctx.drawImage(GamePlay.oppVisitedImg, GamePlay.itemTypeCount * 50 + i * 50, j * 50);
                } else if (GamePlay.show_breadcrumbs && history[i][j] == 3) {
                    ctx.drawImage(GamePlay.bothVisitedImg, GamePlay.itemTypeCount * 50 + i * 50, j * 50);
                }
            }
        }
    },
    setBoardNumber: function () {
        var boardNumber;

        boardNumber = parseInt($('#board_number').val());
        if (!isNaN(boardNumber)) {
            GamePlay.setupNewGame(boardNumber);
        } else {
            GamePlay.setupNewGame();
        }
    },
    setTrainCycles: function () {
        var trainCycles = parseInt($('#train_total_cycles').val());
        if (!isNaN(trainCycles)) {
            GamePlay.train_cycles = Math.abs(trainCycles);
        } else {
            GamePlay.train_cycles = 1000;
        }
        $('#train_total_cycles').val(GamePlay.train_cycles);
        GamePlay.draw();
    },
    resetQTable: function () {
        QTable = new Map();
        GamePlay.executed_cycles = 0;
        Board.reset();

    }
}
