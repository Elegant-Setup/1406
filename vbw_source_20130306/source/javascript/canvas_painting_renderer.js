//-----------------------------------------------------------------------------
// Victory Boogie Woogie
// (c) 2013 Werkgroep 1406
// Apache 2.0 license (http://www.apache.org/licenses/LICENSE-2.0.html)
//-----------------------------------------------------------------------------

function CanvasPaintingRenderer(containerId) {
	this.containerId = containerId;
	this.canvasWidth = null;
	this.canvasHeight = null;
	
	this.painting = null;
	this.canvas = null;
	
	this.BLOCK_COLORS = {
		'wit' : '#F4F6EB',
		'gebrokenwit' : '#F4F6EB',
		'lichtgrijs' : '#CED2D3',
		'grijs' : '#BFC0C2',
		'geel' : '#FFF253',
		'blauw' : '#001677',
		'donkerblauw' : '#030420',
		'rood' : '#B6201F',
		'donkerrood' : '#4C1117',
		'zwart' : '#030211',
		'beige' : '#a99565',
		'donkergrijs' : '#9c987f'
	};
	
	this.createCanvas = function() {
		var canvas = $('<canvas width="' + this.canvasWidth + '" height="' + 
				this.canvasHeight + '"></canvas>');
		$('#' + containerId).append(canvas);
		this.canvas = canvas.get(0);
	}
	
	this.renderFrame = function() {
		var context = this.canvas.getContext('2d');
		context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		
		context.fillStyle = '#ffffff';
		context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		
		var blocks = this.painting.lines.concat(this.painting.blocks);
		for (var i = 0; i < blocks.length; i++) {
			this.drawBlock(context, blocks[i]);
		}
		
		this.drawPaintingFrame(context);
	}
	
	this.drawBlock = function(context, block) {
		var scaleFactorX = this.canvasWidth / this.painting.PAINTING_WIDTH;
		var scaleFactorY = this.canvasHeight / this.painting.PAINTING_HEIGHT;
		
		context.fillStyle = this.BLOCK_COLORS[block.color] || '#773EBB';
		context.fillRect(block.x * scaleFactorX, 
				block.y * scaleFactorY, 
				block.width * scaleFactorX, 
				block.height * scaleFactorY);
	}
	
	this.drawPaintingFrame = function(context) {
		var right = this.canvasWidth;
		var center = this.canvasWidth / 2;
		var bottom = this.canvasHeight;
		var middle = this.canvasHeight / 2;
		
		this.drawPolygon(context, [0, 0, center, 0, 0, middle], '#eeece9');
		this.drawPolygon(context, [center, 0, right, 0, right, middle], '#eeece9');
		this.drawPolygon(context, [right, middle, right, bottom, center, bottom], '#eeece9');
		this.drawPolygon(context, [center, bottom, 0, bottom, 0, middle], '#eeece9');
	}
	
	this.drawPolygon = function(context, points, color) {
		context.fillStyle = color;
		context.beginPath();
		context.moveTo(points[0], points[1]);
		for (var i = 2; i < points.length; i += 2) {
			context.lineTo(points[i], points[i + 1]);
		}
		context.lineTo(points[0], points[1]);
		context.fill();
		context.closePath();
	}
}
