import net from 'net';
import {Buffer} from 'buffer';
import stream from 'stream';

var port = 22112;


var socket = new net.Socket();
socket.connect(port, 'localhost');


socket.on('connect', function() {
	console.log('# socket connect')
	socket.pipe(socket);
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


