//-----------------------------------------------------------------------------
// Victory Boogie Woogie
// (c) 2013 Werkgroep 1406
// Apache 2.0 license (http://www.apache.org/licenses/LICENSE-2.0.html)
//-----------------------------------------------------------------------------

function VictoryBoogieWoogie(containerId) {
	this.painting = new PaintingStructure();
	this.paintingRenderer = new CanvasPaintingRenderer(containerId);
	
	this.cameraEnabled = false;
	this.headTrackingEnabled = true;
	this.mouseEnabled = true;
	
	this.movementDetectorCallbacks = [];
	
	this.CANVAS_WIDTH = 510;
	this.CANVAS_HEIGHT = 510;
	this.FRAME_TIME = 1.0 / 20;
	this.MOVEMENT_POLL_TIME = 250;
	
	this.showPainting = function(blockDataUrl, lineDataUrl) {
		var self = this;
		var paintingLoader = new PaintingLoader();
		
		paintingLoader.loadData(blockDataUrl, function(data) {
			paintingLoader.parseBlockData(self.painting, data);
			paintingLoader.loadData(lineDataUrl, function(data) {
				paintingLoader.parseLineData(self.painting, data);
				self.startAnimationLoop();
			});
		});
	}
	
	this.startAnimationLoop = function() {
		// Scale the canvas so that it fills most of the viewport regardless
		// of the screen resoution.
		var canvasSize = Math.round(0.7 * $(window).height());
		
		this.paintingRenderer.painting = this.painting;
		this.paintingRenderer.canvasWidth = canvasSize;
		this.paintingRenderer.canvasHeight = canvasSize;
		this.paintingRenderer.createCanvas();
		
		this.startMovementDetection();

		this.onFrame();
	}
	
	this.startMovementDetection = function() {
		var self = this;
		var callback = function(x, y) {
			self.requestMove(x, y);
		};
	
		if (this.cameraEnabled) {
			var cameraMovementDetector = new MovementDetector();
			cameraMovementDetector.init();
			cameraMovementDetector.processStream(this.MOVEMENT_POLL_TIME);
			this.movementDetectorCallbacks.push(function() {
				var movementVector = cameraMovementDetector.createVector();
				self.requestMove(movementVector.x, movementVector.y);
			});
		}
		
		if (this.headTrackingEnabled) {
			var headMovementDetector = new HeadMovementDetector(callback);
			headMovementDetector.startTracking();
		}
		
		if (this.mouseEnabled) {
			var mouseMovementDetector = new MouseMovementDetector(callback);
			mouseMovementDetector.listenTo(this.paintingRenderer.containerId);
		}
	}
	
	this.onFrame = function() {
		this.paintingRenderer.renderFrame();
		
		for (var i = 0; i < this.movementDetectorCallbacks.length; i++) {
			var callback = this.movementDetectorCallbacks[i];
			callback();
		}
		
		this.painting.moveBackToInitialState();
		
		var self = this;
		var requestAnimFrame = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
		requestAnimFrame(function() { 
			self.onFrame();
		});
	}
	
	this.requestMove = function(movementVectorX, movementVectorY) {
		this.painting.applyMovement(movementVectorX, movementVectorY);	
	}
}
