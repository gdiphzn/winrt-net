import net from 'net';

var client = net.connect(22112, 'localhost', function() {
	console.log('# connected to server')
})

console.log('# bufferSize, bytesWritten', client.bufferSize, ',', client.bytesWritten)
client.write('abcd');
console.log('# bufferSize, bytesWritten', client.bufferSize, ',', client.bytesWritten)
client.write('Wow, very message, so string, wow! Doge', function() {
	console.log('# message sent')
	console.log('# bufferSize, bytesWritten', client.bufferSize, ',', client.bytesWritten)
})
console.log('# bufferSize, bytesWritten', client.bufferSize, ',', client.bytesWritten)
client.write('1234567');
console.log('# bufferSize, bytesWritten', client.bufferSize, ',', client.bytesWritten)

client.on('data', function (data) {
	console.log('# socket data |', data.length, '|', data.toString());
})