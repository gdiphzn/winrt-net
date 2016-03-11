import net from 'net';

var port = 22112;

var socket = new net.Socket();
socket.connect(port, 'localhost', function() {
	console.log('# connected to server!');
	socket.write('Hello server! This is me, client!');
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

socket.on('error', function(err) {
	console.log('# socket ERROR', JSON.stringify(err))
});
