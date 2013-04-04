//-----------------------------------------------------------------------------
// Victory Boogie Woogie
// (c) 2013 Werkgroep 1406
// Apache 2.0 license (http://www.apache.org/licenses/LICENSE-2.0.html)
//-----------------------------------------------------------------------------

function MouseMovementDetector(callback) {
	this.callback = callback;
	this.lastX = 0.0;
	this.lastY = 0.0;
	
	this.NORMALIZED_SPEED_FACTOR = 30.0;
	
	this.listenTo = function(containerId) {
		var self = this;
		$('#' + containerId).mousemove(function(e) {
			var vectorX = (e.screenX - self.lastX) / self.NORMALIZED_SPEED_FACTOR;
			var vectorY = (e.screenY - self.lastY) / self.NORMALIZED_SPEED_FACTOR;
			self.lastX = e.screenX;
			self.lastY = e.screenY;
			self.callback(vectorX, vectorY);
		});
	}
}
