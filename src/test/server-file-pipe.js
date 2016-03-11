import net from 'net';
import fs from 'fs';


var port = 22112;

var server = net.createServer(function(socket) {

	console.log('user connected: ' + socket.remoteAddress + ":" + socket.remotePort);

	var basepath = 'images/';
	var filename = basepath + 'Square44x44Logo.scale-200.png';
	//var filename = basepath + 'Square150x150Logo.scale-200.png';
	//var filename = basepath + 'Square44x44Logo.targetsize-24_altform-unplated.png';
	//var filename = basepath + 'foo.png';

	var fileReadStream = fs.createReadStream(filename);
	fileReadStream.pipe(socket)
	.on('close', () => {
		console.log('stream close');
	})
	.on('data', () => {
		console.log('stream data');
	})
	.on('end', () => {
		console.log('stream end');
	})
	.on('error', () => {
		console.log('stream error');
	})
	.on('readable', () => {
		console.log('stream readable');
	})
	.on('drain', () => {
		console.log('stream drain');
	})
	//.on('finish', function(){
	//	fileReadStream.close();
	//	console.log('stream finished');
	//})


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
