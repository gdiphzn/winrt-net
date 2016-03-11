'use strict';

System.register(['net'], function (_export, _context) {
	var net, port, reconnectCount, socket;
	return {
		setters: [function (_net) {
			net = _net.default;
		}],
		execute: function () {
			port = 22112;
			reconnectCount = 0;
			socket = net.connect(port);


			socket.on('connect', function () {
				console.log('###############################################');
				console.log('# socket connect');
				reconnectCount++;
				if (reconnectCount < 3) {
					console.log('# disconnecting');
					//console.log('# readable', socket.readable, 'writable', socket.writable)
					//console.log('# before')
					socket.end();
					//console.log('# after')
					//console.log('# readable', socket.readable, 'writable', socket.writable)
				}
			});

			socket.on('data', function (data) {
				//console.log('# readable', socket.readable, 'writable', socket.writable)
				console.log('# socket data |', data.length, '|', data.toString());
				//console.log('# readable', socket.readable, 'writable', socket.writable)
			});

			socket.on('end', function () {
				console.log('# socket end');
			});

			socket.on('close', function () {
				console.log('# socket close');
				console.log('# reconnecting');
				setTimeout(function () {
					socket.connect(port);
				}, 500);
			});

			socket.on('error', function (err) {
				console.log('# socket ERROR', JSON.stringify(err));
			});
		}
	};
});