import net from 'net';
import {Buffer} from 'buffer';
import stream from 'stream';

var port = 22112;


/*
class WinFileWritableStream extends stream.Writable {

	constructor(path, append) {
		super();
		this._fileLoaded = false;
		this._fileClosed = false;
		this._seekLocation = 0;
		this._append = append ? true : false;
		var folder = Windows.Storage.ApplicationData.current.localFolder;
		var collisionReplace = Windows.Storage.CreationCollisionOption.replaceExisting;
		folder
		.createFileAsync(path, collisionReplace)
		.then(file => file.openAsync(Windows.Storage.FileAccessMode.readWrite))
		.then(randomStream => {
			this.winOutputStream = randomStream.getOutputStreamAt(0);
			this.dataWriter = new Windows.Storage.Streams.DataWriter(this.winOutputStream);
			this._fileLoaded = true;
			randomStream = null;
			this.emit('_fileLoaded');
		})
	}
	_write(chunk, enc, done) {
		if (!this._fileLoaded) {
			// received data before the file is open. Wait for it to become writable by delaying the _write()
			this.once('_fileLoaded', () => this._write(chunk, enc, done));
			return;
		}
		var isLastChunk = this._writableState.ending && (chunk.length == this._writableState.length);
		//this.dataWriter.writeBytes(chunk);
		this.dataWriter.writeString(chunk.toString());
		this.dataWriter.storeAsync()
		.then(this.winOutputStream.flushAsync())
		.then(() => {
			done();
			//this._seekLocation += chunk.length;
			if (isLastChunk) {
				// this is last chunk
				this._closeFile();
			}
		})
	}
	end(data, enc) {
		// this internally destroys writable stream (this._writableState)
		// and pushes the last data to the buffer to be written to file
		// If buffer is not empty the closing of file and windows file stream
		// happens after writing the last chunk in _write()
		stream.Writable.prototype.end.call(this, data, enc);
		if (this._writableState.length == 0) {
			// Buffer was already empty and this chunk was written immediately.
			// Nothing is left and we can safely close the file
			this._closeFile();
		}
	}
	_closeFile() {
		if (this._fileClosed) {
			// just in case;
			return false;
		}
		console.log('_closeFile()');
		this.dataWriter.detachStream();
		this.winOutputStream.flushAsync().then(result => {
			console.log('result', result);
			this.dataWriter.close();
			this._fileClosed = true;
			// seems file normal garbage collection but this is criticall!
			// Without this WinRT won't release the file and it remains unwritable
			this.dataWriter = null;
			this.winOutputStream = null;
			console.log('---------------------------');
		})
	}

}

function fsCreateWriteStream(path) {
	return new WinFileWritableStream(path);
}


//var writeStream = fsCreateWriteStream('output.png');

var writeStream = fsCreateWriteStream('sampletext3.txt', true);
writeStream.write('\n');
writeStream.write('FOO');
writeStream.write('A');
writeStream.write('B');
writeStream.write('C');
writeStream.write('D');
writeStream.write('E');
setTimeout(() => writeStream.write('F'))
setTimeout(() => writeStream.write('G'))
setTimeout(() => writeStream.write('H'),10)
setTimeout(() => writeStream.write('I'),20)
setTimeout(() => writeStream.write('J'),30)
setTimeout(() => writeStream.write('K'),40)
setTimeout(() => writeStream.write('L'),50)
setTimeout(() => writeStream.write('M'),60)
setTimeout(() => writeStream.write('N'),70)
setTimeout(() => writeStream.write('O'),80)
setTimeout(() => writeStream.write('P'),90)
setTimeout(() => writeStream.write('Q'),100)
setTimeout(() => writeStream.write('R'),200)
setTimeout(() => writeStream.write('ST'),300)
setTimeout(() => writeStream.write('UVW'),400)
setTimeout(() => writeStream.write('XYZ'),500)
setTimeout(() => writeStream.end('!END!'), 600)
*/


//var folder = Windows.Storage.KnownFolders.videosLibrary;
var folder = Windows.Storage.ApplicationData.current.localFolder;
try {
	folder.createFileAsync('sampletext3.txt', Windows.Storage.CreationCollisionOption.replaceExisting)
	.done(file => {
		file.openAsync(Windows.Storage.FileAccessMode.readWrite).done(randomStream => {
			console.log('FILE LOADED');
			randomStream.close();
			/*var outStream = randomStream.getOutputStreamAt(0);
			var dataWriter = new Windows.Storage.Streams.DataWriter(outStream)
			dataWriter.writeString('FOO!');
			dataWriter.storeAsync().done(() => {
				//outStream.flushAsync().done(() => {
					console.log('flushed');

					dataWriter.writeString('BAR!');
					dataWriter.storeAsync().done(() => {
						outStream.flushAsync().done(() => {
							console.log('flushed');
						})
					})

				//})
			})*/
		}, function(e) {
			console.log('error 1');
			console.log(e);
		})
	}, function(e) {
		console.log('error 2');
		console.log(e);
	});
} catch (e) {
	console.log('catch fooo')
}






/*
setTimeout(() => {

var socket = new net.Socket();
socket.connect(port, 'localhost');


socket.on('connect', function() {
	console.log('# socket connect')
	socket
		//.pipe(new UpperCaseTransformStream())
		.pipe(writeStream);
});

socket.on('data', function(data) {
	console.log('# socket data |', data.length);
});

socket.on('end', function() {
	console.log('# socket end')
});

socket.on('error', function(err) {
	console.log('# socket ERROR')
});

socket.on('close', function(err) {
	console.log('# socket close')
});

}, 300)
*/

function fsCreateReadStream(path) {
	var theStream = new stream.PassThrough();
	fsReadFile(path, (err, buffer) => {
		theStream.write(buffer);
	});
	return theStream;
}

class CustomWritable extends stream.Writable {
	_write(chunk, cb) {
		console.log('_write', chunk);
	}
}


class UpperCaseTransformStream extends stream.Transform {
	_transform(chunk, enc, cb) {
		var upperChunk = chunk.toString().toUpperCase();
		this.push(upperChunk);
		cb();
	}
}

function winBufferToBuffer(winBuffer) {
	var dataReader = Windows.Storage.Streams.DataReader.fromBuffer(winBuffer);
	var buffer = new Buffer(winBuffer.length);
	dataReader.readBytes(buffer);
	return buffer;
}


function fsWriteFile(path, data, callback) {
	var FileIO = Windows.Storage.FileIO;
	var localFolder = Windows.Storage.ApplicationData.current.localFolder;
	localFolder.createFileAsync(path, Windows.Storage.CreationCollisionOption.replaceExisting)
	.then(file => {
		console.log('file', file);
		FileIO.writeBytesAsync(file, data).then(() => {
	    	callback(null);
	    }, function (error) {
	    	callback(error);
	    });
	});
}





/*
var writeStream = fsCreateWriteStream('sampletext3.txt');
setTimeout(() => {
	writeStream.write('wow ');
	writeStream.write('this is');
}, 20)
setTimeout(() => {
	writeStream.write(' working');
}, 100)
*/
/*
fsWriteFile('sampletext3.txt', new Buffer('wow, very text!'), err => {
	if (err) {
		console.log('error saving file', err);
	} else {
		console.log('file saved at', Windows.Storage.ApplicationData.current.localFolder.path);
	}
})
*/
