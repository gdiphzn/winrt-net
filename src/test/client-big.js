import net from 'net';

var port = 22112;

var socket = new net.Socket();
socket.connect(port, 'localhost', function() {
	console.log('# connected to server!, sending big message');
	socket.write(''.padLeft(1000000,'-'));
});

socket.on('connect', function() {
	console.log('# socket connect')
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

String.prototype.padLeft = function(l,c) {return Array(l-this.length+1).join(c||" ")+this}
