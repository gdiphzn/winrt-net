import net from 'net';

var socket = new net.Socket();

logSocket()

socket.on('close', had_error => {
	console.log('--------- close --', had_error, '-----------')
	logSocket()
})

socket.on('connect', data => {
	console.log('--------- connect ------------------')
	logSocket()
})
String.prototype.padLeft = function(l,c) {return Array(l-this.length+1).join(c||" ")+this}

socket.on('data', data => {
	console.log('--------- data --', data.length, '---------------')
	logSocket()
})

socket.on('drain', data => {
	console.log('--------- drain --------------------')
	logSocket()
})

socket.on('end', data => {
	console.log('--------- end ----------------------')
	logSocket()
})

socket.on('error', data => {
	console.log('--------- error --------------------', data)
	logSocket()
})
/*
socket.on('lookup', data => {
	console.log('--------- lookup --------------------')
	logSocket()
})
*/
socket.on('timeout', data => {
	console.log('--------- timeout --------------------')
	logSocket()
})

socket.destroy('wow');
socket.connect(22112, 'localhost');

function logSocket() {
	/*console.log('bufferSize', socket.bufferSize)
	console.log('bytesRead', socket.bytesRead)
	console.log('bytesWritten', socket.bytesWritten)
	//console.log('localAddress', socket.localAddress)
	//console.log('localPort', socket.localPort)
	//console.log('remoteAddress', socket.remoteAddress)
	//console.log('remoteFamily', socket.remoteFamily)
	//console.log('remotePort', socket.remotePort)
	console.log('readable', socket.readable)
	console.log('writable', socket.writable)*/
}