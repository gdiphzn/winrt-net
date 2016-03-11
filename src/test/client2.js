import net from 'net';

var port = 22112;

var socket = new net.Socket();
socket.connect(port, 'localhost', function() {
	console.log('# connected to server!');
	socket.write('Hello server! This is me, client!');
	setTimeout(() => {
		console.log('ending');
		socket.end();
	}, 500)
});

socket.on('connect', function() {
	console.log('# socket connect')
});

socket.on('data', function(data) {
	console.log('# socket data |', data.length, '|', data.toString());
});

socket.on('end', function() {
	console.log('# socket end')
});

socket.on('finish', function() {
	console.log('# socket finish')
});

socket.on('error', function(err) {
	console.log('# socket ERROR', JSON.stringify(err))
});
