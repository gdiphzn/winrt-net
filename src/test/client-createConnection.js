import net from 'net';

var client = net.createConnection({
	port: 22112,
	host: '127.0.0.1'
})

client.write('Wow, very message, so string, wow! Doge')

client.on('data', function (data) {
	console.log('# socket data |', data.length, '|', data.toString());
})
