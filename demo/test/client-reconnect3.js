'use strict';

System.register(['net'], function (_export, _context) {
	var net, port, socket;
	return {
		setters: [function (_net) {
			net = _net.default;
		}],
		execute: function () {
			port = 22112;
			socket = net.connect(port);


			socket.on('connect', function () {
				console.log('###############################################');
				console.log('# socket connect');
				console.log('# disconnecting');
				console.log('# readable', socket.readable, 'writable', socket.writable);
				console.log('# before');
				socket.end();
				console.log('# after');
				console.log('# readable', socket.readable, 'writable', socket.writable);
			});

			socket.on('data', function (data) {
				console.log('# readable', socket.readable, 'writable', socket.writable);
				console.log('# socket data |', data.length, '|', data.toString());
				console.log('# readable', socket.readable, 'writable', socket.writable);
			});

			socket.on('end', function () {
				console.log('# socket end');
			});

			socket.on('close', function () {
				console.log('# socket close');
			});

			socket.on('error', function (err) {
				console.log('# socket ERROR', JSON.stringify(err));
			});
		}
	};
});