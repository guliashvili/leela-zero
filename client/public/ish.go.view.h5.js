// Ish.Go namespace declaration
var Ish = Ish || {};
Ish.Go = Ish.Go || {};

// begin Ish.Go.View namespace
Ish.Go.View = new function() {

	const socket = io.connect('http://localhost:3000');


	let canvas;
	let context;

	// Static object for storing constants
	const ViewConstants = new function() {
		this.boardWidth = 19;
		this.boardHeight = 19;
		this.boardPadding = 6;
		this.pieceWidth = 27;
		this.pieceHeight = 27;
		this.pixelWidth = 522;
		this.pixelHeight = 522;
		this.imgPieceBlack = "imgs/piece-black.png";
		this.imgPieceWhite = "imgs/piece-white.png";
	};

	// Object for tracking xy coords
	const Coords = function(x, y) {
		this.x = x;
		this.y = y;
	};

	// Tracks clicks on the board (canvas)
	const clickListener = function(e) {
		const point = Ish.Go.View.getPoint(e);
		if (point) {
			const isSuccess = Ish.Go.View.placePiece(point);
			if(isSuccess){
				socket.emit('new move', {x: point.row, y: point.column, isBlack: true});
			}
		}
	};

	// Tracks mouse movement over the board (canvas)
	const mouseMoveListener = function(e) {
		const coords = Ish.Go.View.getCanvasCoords(e);
		const point = Ish.Go.View.getPoint(e);
		
		$("#coords").html(`(${coords.x}, ${coords.y})`);
		
		if (point) {
			$("#point").html(`(${point.row}, ${point.column})`);
		} else {
			$("#point").html("(-, -)");
		}
	};
	
	/**
	 * Initializes a canvas and context for use in the View, but only if necessary
	 */
	const initCanvas = function() {
		if ($("#go-canvas").length == 0 || !canvas || !context) {
			canvas = document.createElement("canvas");
			canvas.id = "go-canvas";
			$("#board").append(canvas);
		
			canvas.width = ViewConstants.pixelWidth;
			canvas.height = ViewConstants.pixelHeight;
			canvas.style.background = "transparent url(imgs/board.png) no-repeat 0 0";
			
			canvas.addEventListener("click", clickListener, false);
			canvas.addEventListener("mousemove", mouseMoveListener);
			
			context = canvas.getContext("2d");
		}
	};

	// Given a mouse event, returns Coords relative to the canvas
	this.getCanvasCoords = function(e) {
		let x, y;
		
		// Get xy coords on page
		if (e.pageX != undefined && e.pageY != undefined) {
			x = e.pageX;
			y = e.pageY;
		} else {
			x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		}
		
		// Narrow xy coords to canvas
		x -= canvas.offsetLeft;
		y -= canvas.offsetTop;
		
		return new Coords(x, y);
	};

	// Returns board Point from mouse event, or null if not a valid Point
	this.getPoint = function(e) {
		let {x, y} = this.getCanvasCoords(e);
		
		// Remove padding from coords
		x -= ViewConstants.boardPadding;
		y -= ViewConstants.boardPadding;
		
		// Check if xy coords are in the padding
		if (x <= 0 || x >= ViewConstants.pixelWidth - (2 * ViewConstants.boardPadding) ||
				y <= 0 || y >= ViewConstants.pixelHeight - (2 * ViewConstants.boardPadding)) {
			return null;
		}
		
		// Get Point from xy coords on canvas
		const point = new Point(
			Math.floor(y/ViewConstants.pieceHeight),	// row
			Math.floor(x/ViewConstants.pieceWidth)	// column
		);
		return point;
	};

	// Given a Point, returns the top-left Coords on the canvas
	this.getCoordsFromPoint = function(point) {
		return new Coords(
			((point.column) * ViewConstants.pieceWidth) + ViewConstants.boardPadding,
			((point.row) * ViewConstants.pieceHeight) + ViewConstants.boardPadding
		);
	};
	socket.on('new move', (data) => {
		console.log('got', data);
		this.placePiece(new Point(data["x"], data["y"]));
	});
	// Places piece, and draws changes on the board
	this.placePiece = function(point) {
        const moveResult = Ish.Go.Logic.move(point.row, point.column);
        
        // Check for empty MoveResult (indicates invalid move)
        if (!moveResult) {
			let alertMsg = "Invalid Move";
			
			// Add specific message if present
			if (gGameState.moveError) {
				alertMsg += ":\n" + gGameState.moveError;
			}
			
			alert(alertMsg);
            return false;
        }
		
		// Redraw board changes as a result of the move
		this.update(moveResult);
        return true;
	};

	/**
	 * Draws piece on canvas
	 */
	this.drawPiece = function(point, color) {	
		const coords = this.getCoordsFromPoint(point);
		
		let piece = new Image();
		
		if (color == Constants.Color.BLACK) {
			piece.src = ViewConstants.imgPieceBlack;
		} else {
			piece.src = ViewConstants.imgPieceWhite;
		}
		
		piece.onload = function() {
			context.drawImage(piece, coords.x, coords.y);
		};
	};
    
    this.removePieces = function(points) {
        let coords;
        $.each(points, function() { 
            coords = Ish.Go.View.getCoordsFromPoint(this);
            context.clearRect(
                coords.x,
                coords.y,
                ViewConstants.pieceWidth,
                ViewConstants.pieceHeight
            );
        });
    };
    
    this.update = function(moveResult) {
        if (moveResult) {
            // Draw only board changes
            this.drawPiece(moveResult.newPoint, moveResult.player.color);
            this.removePieces(moveResult.capturedPoints);
			
			this.drawInfo();
        }
    };
    
    this.redraw = function(canvasElement) {
        // Create canvas and context if necessary
        if (!canvasElement) {
			initCanvas();
        }
        
		this.drawBoard();
		this.drawInfo();
    };
	
	this.drawBoard = function() {
        context.clearRect(0, 0, ViewConstants.pixelWidth, ViewConstants.pixelHeight);
        for (let y = 0; y < gGameState.boardHeight; y++) {
            for (let x = 0; x < gGameState.boardWidth; x++) {
                const point = new Point(y, x);
                const pState = gGameState.getPointStateAt(point);
                if (pState == Constants.PointState.BLACK) {
                    this.drawPiece(point, Constants.Color.BLACK);
                }
                else if (pState == Constants.PointState.WHITE) {
                    this.drawPiece(point, Constants.Color.WHITE);
                }
            }
        }	
	};
	
	this.drawInfo = function() {
		// Print turn
		$("#turn").html("Current Turn: " + gGameState.currentPlayer.color);
		
		// Print scores		
		// Ish.Go.Logic.setScores();
		
		const p1 = gGameState.player1;
		const p2 = gGameState.player2;
		
		$("#score").html("Score:" +
			"<br>&nbsp;&nbsp;" +
			p1.color + ": " + p1.score +
			"<br>&nbsp;&nbsp;" +
			p2.color + ": " + p2.score);		
	};
	
	/**
	 * Starts a new game.
	 */
	this.startNewGame = function() {
		Ish.Go.Logic.newGame(19, 19);
		
		this.redraw($("go-canvas"));
	};

	/**
	 * Prints code defining current game state on web page
	 */
	this.printGameState = function(aId) {
		const id = aId || 'gameState';
		let sBoard = "";

		// Initialize game state
		sBoard += "gGameState = new GameState(\n";
		sBoard += "\t" + gGameState.boardWidth + ",\n";
		sBoard += "\t" + gGameState.boardHeight + ",\n";
		sBoard += "\tnew Player(Constants.Color.BLACK, Constants.PointState.BLACK),\n";
		sBoard += "\tnew Player(Constants.Color.WHITE, Constants.PointState.WHITE)\n";
		sBoard += ");\n";
		
		// Set current player
		sBoard += "gGameState.currentPlayer = " +
			(gGameState.currentPlayer == gGameState.player1 ?
				"gGameState.player1;\n" :
				"gGameState.player2;\n");
		
		// Set board
		for (let y = 0; y < gGameState.boardHeight; y++) {
			sBoard += "gGameState.board[" + y + "] = [";
			for (let x = 0; x < gGameState.boardWidth; x++) {
				
				sBoard += "\"" + gGameState.board[y][x] + "\",";
			}
			sBoard = sBoard.substring(0, sBoard.length-1);
			sBoard += "];\n";
		}
		
		// Set previous board
		for (let y = 0; y < gGameState.boardHeight; y++) {
			sBoard += "gGameState.previousBoard[" + y + "] = [";
			for (let x = 0; x < gGameState.boardWidth; x++) {
				sBoard += "\"" + gGameState.previousBoard[y][x] + "\",";
			}
			sBoard = sBoard.substring(0, sBoard.length-1);
			sBoard += "];\n";
		}
		
		$("#" + id).html("<textarea>" + sBoard + "</textarea>");
	};
	
	this.init = function() {
		// Initialize game state
		gGameState = new GameState(
			19,
			19,
			new Player(Constants.Color.BLACK, Constants.PointState.BLACK),
			new Player(Constants.Color.WHITE, Constants.PointState.WHITE)
		);
		
		this.redraw();
	};
	
}; // end Ish.Go.View namespace