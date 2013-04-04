//-----------------------------------------------------------------------------
// Victory Boogie Woogie
// (c) 2013 Werkgroep 1406
// Apache 2.0 license (http://www.apache.org/licenses/LICENSE-2.0.html)
//-----------------------------------------------------------------------------

function PaintingLoader() {

	this.loadData = function(url, callback) {
		$.ajax(url, {
			'type' : 'GET',
			'dataType' : 'text',
			'success' : function(data, textStatus, jqXHR) {
				callback(data);
			},
			'error' : function(jqXHR, textStatus, errorThrown) {
				console.log('Error while loading painting data: ' + errorThrown);
			}
		});
	}
	
	this.parseBlockData = function(painting, data) {
		var entries = this.parseDataFile(data);
		for (var i = 0; i < entries.length; i++) {
			painting.addBlock(entries[i]);
		}
	}
	
	this.parseLineData = function(painting, data) {
		var entries = this.parseDataFile(data);
		for (var i = 0; i < entries.length; i++) {
			painting.addLine(entries[i]);
		}
	}
	
	this.parseDataFile = function(data) {
		var result = [];
		var lines = data.split('\n');
		for (var i = 0; i < lines.length; i++) {
			if (lines[i].length == 0 || lines[i].indexOf('#') == 0) {
				continue;
			}
			
			var fields = lines[i].split(',');
			if (fields.length != 5 && fields.length != 3) {
				throw 'Invalid line at index ' + i + ': ' + lines[i];
			}
			
			if (fields.length == 3) {
				fields = [fields[0], fields[1], fields[0], fields[1], fields[2]];
			}
			
			result.push({
				'x0' : parseInt(fields[0]),
				'y0' : parseInt(fields[1]),
				'x1' : parseInt(fields[2]),
				'y1' : parseInt(fields[3]),
				'color' : fields[4]
			});
		}
		return result;
	}
}
