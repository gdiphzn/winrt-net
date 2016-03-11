'use strict';

System.register(['net'], function (_export, _context) {
	var net, port, socket;
	return {
		setters: [function (_net) {
			net = _net.default;
		}],
		execute: function () {
			port = 22112;
			socket = net.connect(1234);

			socket.connect(port);

			socket.on('connect', function () {
				console.log('# socket connect', this.localPort, this.remotePort);
				socket.write('Hello server! This is me, client!');
			});

			socket.on('data', function (data) {
				console.log('# socket data |', data.length, '|', data.toString());
			});

			socket.on('end', function () {
				console.log('# socket end');
			});

			socket.on('error', function (err) {
				console.log('# socket ERROR', JSON.stringify(err));
			});
		}
	};
});