// Ish.Go namespace declaration
var Ish = Ish || {};
Ish.Go = Ish.Go || {};

// begin Ish.Go.Logic namespace
Ish.Go.Logic = new function() {
	/**
	 * Helper function which returns true or false if the given point
	 * is in the bounds of the game state's board.
	 */
	this.isPointInBounds = function(point) {
		return (
			point &&
			point.row < gGameState.boardHeight && point.row >= 0 &&
			point.column < gGameState.boardWidth && point.column >= 0
		);
	};
		
	/**
	 * Returns an array of points which are in the chain that "point" belongs to.
	 *
	 * A typical call passes only "point".
	 */
	this.getChainPoints = function(point, chainPoints) {
		const pState = gGameState.getPointStateAt(point);
		
		// TODO: is this necessary?
		if (pState == Constants.PointState.EMPTY) {
			return new Array();
		}
		
		// If chainPoints is null, make it an empty array
		chainPoints = chainPoints || new Array();
		
		// Add the current piece to the chain
		chainPoints.push(point);
		
		// Check for rest of chain in every direction
		for (const side of  Constants.Direction.ALL) {
			const nPoint = point.getNeighborAt(side);
			
			// Check for chain at neighboring point (nPoint)
			if (this.isPointInBounds(nPoint)) {
				const nState = gGameState.getPointStateAt(nPoint);
				if (pState == nState) {
					// Same piece. Add that piece's chain points to this chain.
					if (!nPoint.isInArray(chainPoints)) {
						// TODO: find out why this works
						this.getChainPoints(nPoint, chainPoints);
					}
				}
			}
		}
		return chainPoints;
	};

	/**
	 * Returns an array of points which are captured by the piece at "point".
	 */
	this.getCapturedPoints = function(point) {	
		let capPoints = new Array();
		
		// Check for captures in every direction
		for (const side of Constants.Direction.ALL) {
			const nPoint = point.getNeighborAt(side);
			
			// Check for captures at neighboring point (nPoint)
			if (this.isPointInBounds(nPoint)) {
				const pState = gGameState.getPointStateAt(point);
				const nState = gGameState.getPointStateAt(nPoint);
				if (nState != pState && nState != Constants.PointState.EMPTY) {
					// Opponent piece. Check for captures (if it's new).
					if (!nPoint.isInArray(capPoints) &&
							this.getLibertyPoints(nPoint).length == 0) {
						capPoints = capPoints.concat(this.getChainPoints(nPoint));
					}
				}
			}
		}
		return capPoints;
	};

	/**
	 * Returns an array of points which identify liberties of the
	 * chain that the piece at "point" belongs to.
	 *
	 * A typical call passes only "point".
	 */
	this.getLibertyPoints = function(point, chainPoints, libPoints) {	
		// If chainPoints or libPoints are null, make them empty arrays
		chainPoints = chainPoints || new Array();
		libPoints = libPoints || new Array();
		
		// Check for liberties in every direction
		for (const side of Constants.Direction.ALL) {
			const nPoint = point.getNeighborAt(side);
			
			// Check for liberties at neighboring point (nPoint)
			if (this.isPointInBounds(nPoint)) {
				const pState = gGameState.getPointStateAt(point);
				const nState = gGameState.getPointStateAt(nPoint);
				if (pState == nState) {
					// Same piece. Add that piece's liberties to this chain's liberties.
					chainPoints.push(point);
					if (!nPoint.isInArray(chainPoints)) {
						// TODO: find out why this works
						this.getLibertyPoints(nPoint, chainPoints, libPoints);
					}
				}
				else if (nState == Constants.PointState.EMPTY) {
					// Empty. Add one liberty (if it's new).
					if (!nPoint.isInArray(libPoints)) {
						libPoints.push(nPoint);
					}
				}
			}
		}
		return libPoints;
	};

	/**
	 * Validates move, returning true or false.
	 * Also populates gGameState.moveError if move is invalid.
	 */
	this.isValidMove = function(point, player) {
		// Check if point is empty
		if (gGameState.getPointStateAt(point) != Constants.PointState.EMPTY) {
			gGameState.moveError = Constants.MoveError.OCCUPIED;
			return false;
		}
		
		let isValid = true;
		
		// Backup our board
		const backupBoard = gGameState.getBoardCopy();
		
		// Place piece
		gGameState.setPointStateAt(point, player.pointState);
		
		// Check for captured pieces
		const captures = this.getCapturedPoints(point);
		if (captures.length > 0) {
			// Remove captured pieces
			$.each(captures, function() {
				gGameState.setPointStateAt(this, Constants.PointState.EMPTY);
			});
			
			// Check for repeating board state
			if (!gGameState.isUniqueBoard()) {
				gGameState.moveError = Constants.MoveError.REPEAT;
				isValid = false;
			}
		}
		
		// Check for liberties
		else if (this.getLibertyPoints(point).length == 0) {
			gGameState.moveError = Constants.MoveError.SUICIDE;
			isValid = false;
		}
		
		// Restore our board
		gGameState.setBoardCopy(backupBoard);
		
		return isValid;
	};

	/**
	 * Validates and makes move by current player at the given point.
	 * Returns a MoveResult with the board changes.
	 */

	this.move = function(y, x) {	
		const point = new Point(y, x);
		const player = gGameState.currentPlayer;
        
        // Clear previous move errors
        gGameState.moveError = "";

		// Validate move
		if (!this.isValidMove(point, player)) {
			return null;
		}
		
		// Store previous board
		gGameState.previousBoard = gGameState.getBoardCopy();
		
		// Place piece
		gGameState.setPointStateAt(point, player.pointState);
		
		// Remove captured pieces (if any)
        const capturedPoints = this.getCapturedPoints(point);
		$.each(capturedPoints, function() {
			gGameState.setPointStateAt(this, Constants.PointState.EMPTY);
		});
		
		// Change turn
		gGameState.currentPlayer = (player == gGameState.player1) ?
			gGameState.player2 : gGameState.player1;

        return new MoveResult(
            player,
            point,
            capturedPoints
        );
	};
	
	/**
	 * Creates a new game, with the given board size
	 */
	this.newGame = function(width, height) {
		gGameState = new GameState(
			width,
			height,
			new Player(Constants.Color.BLACK, Constants.PointState.BLACK),
			new Player(Constants.Color.WHITE, Constants.PointState.WHITE)
		);
	}
	
}; // end Ish.Go.Logic namespace