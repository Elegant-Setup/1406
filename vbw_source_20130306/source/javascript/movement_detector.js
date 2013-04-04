//-----------------------------------------------------------------------------
// Victory Boogie Woogie
// (c) 2013 Werkgroep 1406
// Apache 2.0 license (http://www.apache.org/licenses/LICENSE-2.0.html)
//-----------------------------------------------------------------------------

function MovementDetector() {
	
	var video;
	var inputSource;
	var contextSource;
	var inputBlend;
	var contextBlend;
	var bufferLoader;
	var lastImageData;
	var lastArea;
	var areaSizeW;
	var areaSizeH;
	var options;
	var self;
	var sectorsWithMovement = {};
	var sectorAverageThreshold = 10000;
	
	self = this;
	options = {
		audio: false,
		video: true
	};
	
	this.init = function() {
		if (self.checkUMAPI()) {
			self.video = $("#webcam").get(0);
			
			self.inputSource = $("#inputSource").get(0);
			self.contextSource = self.inputSource.getContext('2d');

			self.inputBlend = $("#inputBlend").get(0);
			self.contextBlended = self.inputBlend.getContext('2d');
			
			self.contextSource.translate(self.inputSource.width, 0);
			self.contextSource.scale(-1, 1);
						
			self.captureStream();
			
			areaSizeW = self.video.width / 3;
			areaSizeH = self.video.height / 3;
		} else {
			console.log('Browser does not support UM API, webcam movement detection will not work');
		}
	}
	
 	this.checkUMAPI = function() {
		return !!(navigator.getUserMedia || navigator.webkitGetUserMedia);
	}
	
	this.captureStream = function() {		
		if (navigator.getUserMedia) {
			navigator.getUserMedia(options, self.assignStream, self.throwException);
		} else if (navigator.webkitGetUserMedia) {
        	navigator.webkitGetUserMedia(options, self.assignStream, self.throwException);
		}
	}
	
	this.assignStream = function(stream) {
		var streamURL = window.webkitURL.createObjectURL(stream);
		self.video.src = streamURL;
	}
	
	this.processStream = function(timeOutLength) {
		if (self.contextSource) {
			self.contextSource.drawImage(self.video, 0, 0, self.video.width, self.video.height);
			self.blendStream();
			self.checkAreas();
			
			setTimeout(function() {
				self.processStream(timeOutLength);
			}, timeOutLength);
		}
	}
	
	this.blendStream = function() {
		var width = self.inputSource.width;
		var height = self.inputSource.height;
	
		var sourceData = self.contextSource.getImageData(0, 0, width, height);
		if (!lastImageData) { 
			lastImageData = self.contextSource.getImageData(0, 0, width, height);
		}
		var blendedData = self.contextSource.createImageData(width, height);
		self.differenceAccuracy(blendedData.data, sourceData.data, lastImageData.data);
		self.contextBlended.putImageData(blendedData, 0, 0);
		lastImageData = sourceData;
	}
	
	this.differenceAccuracy = function(target, data1, data2) {
		if (data1.length != data2.length) {
			return null;
		}
		
		var i = 0;
		
		while (i < (data1.length * 0.25)) {
			var average1 = (data1[4*i] + data1[4*i+1] + data1[4*i+2]) / 3;
			var average2 = (data2[4*i] + data2[4*i+1] + data2[4*i+2]) / 3;
			var diff = self.threshold(Math.abs(average1 - average2));
			target[4*i] = diff;
			target[4*i+1] = diff;
			target[4*i+2] = diff;
			target[4*i+3] = 0xFF;
			++i;
		}
	}
	
	this.checkAreas = function() {
		var numHorizontalAreas = Math.floor(self.video.width / areaSizeW);
		var numVerticalAreas = Math.floor(self.video.height / areaSizeH);
		var numAreas = numHorizontalAreas * numVerticalAreas;
		var column = 0;
		var row = 0;
		var averagesPerSector = {};
						
		while (true) {
			var x = column * areaSizeW;
			var y = row * areaSizeH;
										
			var blendedData = self.contextBlended.getImageData(x, y, areaSizeW, areaSizeH);
			var i = 0;
			var average = 0;
			while (i < (blendedData.data.length * 0.25)) {
				average += (blendedData.data[i*4] + blendedData.data[i*4+1] + blendedData.data[i*4+2]) / 3;
				++i;
			}
			averagesPerSector[column + ',' + row] = average;
			
			column++;
			if (column >= numHorizontalAreas) {
				column = 0;
				row++;				
				if (row >= numVerticalAreas) {
					break;
				}
			}
		}
		
		sectorsWithMovement = {};
		sectorsWithMovement[this.determineSectorWithMostMovement(averagesPerSector)] = true;
	}
	
	this.determineSectorWithMostMovement = function(averagesPerSector) {
		var highestKey = null;
		var highestValue = 0;
		for (sector in averagesPerSector) {
			if (averagesPerSector[sector] >= highestValue) {
				highestKey = sector;
				highestValue = averagesPerSector[sector];
			}
		}
		if (highestValue < sectorAverageThreshold) {
			return '1,1';
		}
		return highestKey;
	}

	this.threshold = function(value) {
		return (value > 0x15) ? 0xFF : 0;
	}
	
	this.createVector = function() {
		for (var x = 0; x < 3; x++) {
			for (var y = 0; y < 3; y++) {
				var middle = this.areaSignum(x) == 0 && this.areaSignum(y) == 0;
				if (!middle && sectorsWithMovement[x + ',' + y]) {
					return {'x' : this.areaSignum(x), 'y' : this.areaSignum(y)};
				}
			}
		}	
		return {'x' : 0, 'y' : 0};
	}
	
	this.areaSignum = function(value) {
		switch (value) {
			case 0 : return -1;
			case 1 : return 0;
			case 2 : return 1;
			default : throw 'Unknown sector; ' + value;
		}
	}
	
	this.throwException = function(e) {
		console.log("ERROR! " + e);
	}	
}
