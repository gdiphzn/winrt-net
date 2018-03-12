'use strict';

System.register(['net'], function (_export, _context) {
	"use strict";

	var net, client;
	return {
		setters: [function (_net) {
			net = _net.default;
		}],
		execute: function () {
			client = net.connect(22112, function () {
				console.log('# connected to server');
			});


			client.write('Wow, very message, so string, wow! Doge');

			client.on('data', function (data) {
				console.log('# socket data |', data.length, '|', data.toString());
			});
		}
	};
});