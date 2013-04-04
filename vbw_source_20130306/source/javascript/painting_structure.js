//-----------------------------------------------------------------------------
// Victory Boogie Woogie
// (c) 2013 Werkgroep 1406
// Apache 2.0 license (http://www.apache.org/licenses/LICENSE-2.0.html)
//-----------------------------------------------------------------------------

function PaintingStructure() {
	this.blocks = [];
	this.initialBlockStates = {};
	this.lines = [];

	this.lastMovementTimer = 0;
	this.moveBackDelta = 0.0;
	this.blockTimelines = {};
	
	this.PAINTING_WIDTH = 51;
	this.PAINTING_HEIGHT = 51;
	
	this.MOVE_THRESHOLD = 0.1;
	this.MOVEMENT_MULTIPLIER = 5.0;
	this.WEIGHT_SMOOTH_FACTOR = 8.0;
	this.MOVE_BACK_THRESHOLD = 6;
	this.MOVE_BACK_TIMELINE = 40;
	
	this.addBlock = function(fields) {
		var block = this.toBlock(fields);
		block['id'] = 'block_' + this.blocks.length;
		this.blocks.push(block);
		
		// Make a clone of the block to remember it's initial state
		this.initialBlockStates[block.id] = JSON.parse(JSON.stringify(block));
	}
	
	this.toBlock = function(fields) {
		var width = (fields.x1 - fields.x0) + 1;
		var height = (fields.y1 - fields.y0) + 1;
		if (width <= 0 || height <= 0) {
			throw 'Invalid size: ' + width + 'x' + height;
		}
		
		var result = {
			'x' : fields.x0,
			'y' : fields.y0,
			'width' : width,
			'height' : height,
			'color' : fields.color
		};
		return result;
	}
	
	this.addLine = function(fields) {
		var line = this.toBlock(fields);
		line['id'] = 'line_' + this.lines.length;
		this.lines.push(line);
	}
	
	this.applyMovement = function(vectorX, vectorY) {
		if (Math.abs(vectorX) < this.MOVE_THRESHOLD && Math.abs(vectorY) < this.MOVE_THRESHOLD) {
			return;
		}
		
		for (var i = 0; i < this.blocks.length; i++) {
			this.applyMovementToBlock(this.blocks[i], vectorX, vectorY);
		}
	}
	
	this.applyMovementToBlock = function(block, movementVectorX, movementVectorY) {
		var weight = block.width * block.height;
		var smoothedWeight = Math.max(1.0, (weight * this.WEIGHT_SMOOTH_FACTOR));
		var randomFactor = 0.5 + Math.random();
		block.x += ((movementVectorX * this.MOVEMENT_MULTIPLIER) / smoothedWeight) * randomFactor;
		block.y += ((movementVectorY * this.MOVEMENT_MULTIPLIER) / smoothedWeight) * randomFactor;
		
		this.lastMovementTimer = 0;
		this.moveBackDelta = 0;
	}
	
	this.moveBackToInitialState = function() {
		this.lastMovementTimer++;
		if (this.lastMovementTimer >= this.MOVE_BACK_THRESHOLD) {
			if (this.moveBackDelta == 0) {
				this.calculateMoveBackAnimations();
			}
			
			if (this.moveBackDelta <= this.MOVE_BACK_TIMELINE) {
				this.moveBackDelta++;
				var fraction = this.moveBackDelta / this.MOVE_BACK_TIMELINE;
				for (var i = 0; i < this.blocks.length; i++) {
					this.interpolateBlockPosition(this.blocks[i], this.blockTimelines[this.blocks[i].id], fraction);
				}
			}
		}
	}
	
	this.calculateMoveBackAnimations = function() {
		this.blockTimelines = {};
		for (var i = 0; i < this.blocks.length; i++) {
			var initialPosition = this.initialBlockStates[this.blocks[i].id];
			this.blockTimelines[this.blocks[i].id] = {
				'startX' : this.blocks[i].x,
				'startY' : this.blocks[i].y,
				'endX' : initialPosition.x,
				'endY' : initialPosition.y
			};
		}
	}
	
	this.interpolateBlockPosition = function(block, timeline, fraction) {
		block.x = this.interpolate(timeline.startX, timeline.endX, fraction);
		block.y = this.interpolate(timeline.startY, timeline.endY, fraction);
	}
	
	this.interpolate = function(x0, x1, delta) {
		var delta2 = 3.0 - delta * 2.0;
		return x0 + (delta * delta * delta2) * (x1 - x0);
	}
}
