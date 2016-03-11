import net from 'net';
import fs from 'fs';


var port = 22112;

var server = net.createServer(function(socket) {

	console.log('user connected: ' + socket.remoteAddress + ":" + socket.remotePort);


	var fileWriteStream = fs.createWriteStream(basepath + 'received.png');
	socket.on('data', function(data) {
		console.log('# socket data |', data.length);
		fileWriteStream.write(data);
		fileWriteStream.end();
	});

	socket.on('drain', () => {
		console.log('socket drain');
	})

	socket.on('end', function () {
		console.log('socket end');
	});

	socket.on('close', function() {
		console.log('socket close');
	});

	socket.on('error', function(err) {
		console.log('socket ERROR', err.code, err.syscall);
	});

});

server.on('listening', function() {
	console.log('server listening');
});

server.on('connection', function(socket) {
	console.log('server connection', socket.remoteAddress + ":" + socket.remotePort);
});

server.on('close', function() {
	console.log('server close');
});

server.on('error', function(err) {
	console.log('server ERROR', err.code, err.syscall);
});

server.listen(port, function() {
	console.log('server.listen callback')
});
