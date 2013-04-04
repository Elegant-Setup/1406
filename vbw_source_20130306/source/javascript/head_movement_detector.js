//-----------------------------------------------------------------------------
// Victory Boogie Woogie
// (c) 2013 Werkgroep 1406
// Apache 2.0 license (http://www.apache.org/licenses/LICENSE-2.0.html)
//-----------------------------------------------------------------------------

function HeadMovementDetector(callback) {
	this.callback = callback;
	
	this.LEFT_BOUNDARY = 15;
	this.RIGHT_BOUNDARY = 150;
	this.DEAD_ZONE = 0.2;
	
	this.startTracking = function() {
		var headTracker = new headtrackr.Tracker();
		headTracker.init($('#webcam').get(0), $('#inputSource').get(0));
		headTracker.start();

		this.listenForHeadTrackerEvents();
	}
	
	this.listenForHeadTrackerEvents = function() {
		var self = this;
		document.addEventListener('facetrackingEvent', function(e) {
			var vector = self.toMovementVector(e.x, e.y);
			self.callback(vector.x, vector.y);
		});
	}
	
	this.toMovementVector = function(headX, headY) {
		var range = this.RIGHT_BOUNDARY - this.LEFT_BOUNDARY;
		var center = this.LEFT_BOUNDARY + range / 2;
		var vectorX = (headX - center) / (range / 2);
		if (Math.abs(vectorX) < this.DEAD_ZONE) {
			vectorX = 0.0;
		}
		return {'x' : -vectorX, 'y' : 0.0};
	}
}
