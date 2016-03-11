import net from 'net';
import {Buffer} from 'buffer';
import stream from 'stream';

var port = 22112;


var socket = new net.Socket();
socket.connect(port, 'localhost');

socket.on('connect', function() {
	console.log('# socket connect')

	fsCreateReadStream('ms-appx:///demo/sampletext1.txt')
		.pipe(new UpperCaseTransformStream())
		.pipe(socket);
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


function fsCreateReadStream(path) {
	var theStream = new stream.PassThrough();
	fsReadFile(path, (err, buffer) => {
		theStream.write(buffer);
	});
	return theStream;
}

function readableStreamBuffer(buffer) {
	var theStream = new stream.PassThrough();
	theStream.write(buffer);
	return theStream;
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


function fsReadFile(path, callback) {
	var FileIO = Windows.Storage.FileIO;
	var url = new Windows.Foundation.Uri(path);
	Windows.Storage.StorageFile.getFileFromApplicationUriAsync(url).then(file => {
		FileIO.readBufferAsync(file).then(winBuffer => {
			var buffer = winBufferToBuffer(winBuffer);
			callback(null, buffer);
		})
	});
}