import net from 'net';
import {Buffer} from 'buffer';
import stream from 'stream';

var port = 22112;


var socket = new net.Socket();
socket.connect(port, 'localhost');


socket.on('connect', function() {
	console.log('# socket connect')
	socket
		.pipe(new UpperCaseTransformStream())
		.pipe(new consoleLogWriteStream());
});

socket.on('data', function(data) {
	console.log('# socket data |', data.length, '|', data.toString());
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


class consoleLogWriteStream extends stream.Writable {
	_write(buffer, cb) {
		console.log(buffer.toString());
	}
}

class UpperCaseTransformStream extends stream.Transform {
	_transform(chunk, enc, cb) {
		var upperChunk = chunk.toString().toUpperCase();
		this.push(upperChunk);
		cb();
	}
}
