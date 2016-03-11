//System.import('demo/demo.js');
//System.import('demo/test/client1.js');
//System.import('demo/test/client2.js');
//System.import('demo/test/client3.js');
//System.import('demo/test/client-connect3.js');
//System.import('demo/test/client-buffer1.js');
//System.import('demo/test/client-buffer-pipefile2.js');
//System.import('demo/test/client-buffer-pipefile3.js');
//System.import('demo/test/client-end1.js');
//System.import('demo/test/client-end2.js');
//System.import('demo/test/client-end3.js');
//System.import('demo/test/client-end5.js');
//System.import('demo/test/client-end6.js');
//System.import('demo/test/client-end7.js');
//System.import('demo/test/client-destroy1.js');
//System.import('demo/test/client-destroy2.js');
//System.import('demo/test/client-destroy3.js');
//System.import('demo/test/client-destroy4.js');
//System.import('demo/test/client-destroy5.js');
//System.import('demo/test/client-destroy6.js');
//System.import('demo/test/client-destroy7.js');
//System.import('demo/test/client-reconnect1.js');
System.import('demo/test/client-reconnect2.js');
//System.import('demo/test/client-reconnect3.js');
//System.import('demo/test/server1.js');
//System.import('demo/test/server-big.js');
//System.import('demo/test/server-echo-pipe.js');
//System.import('demo/test/server-close.js');
//System.import('demo/test/server-reconnect.js');

if (typeof navigator == 'object') {
	// logs console.log calls into Apps DOM
	var $pre = document.querySelector('pre');
	var _log = console.log;
	console.log = function() {
		var args = Array.from(arguments);
		$pre.textContent += '\n' + args.join(' ');
		// note: this only works when app is connected to a Visual Studio Debbugers, otherwise crashes the App
		//_log.apply(null, args);
	}
}
