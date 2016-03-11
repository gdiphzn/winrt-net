import {EventEmitter} from 'events';
import {Buffer} from 'buffer';
import {Duplex} from 'stream';


try {
var DataWriter = Windows.Storage.Streams.DataWriter;
var DataReader = Windows.Storage.Streams.DataReader;
var StreamSocketListener = Windows.Networking.Sockets.StreamSocketListener;
var StreamSocket = Windows.Networking.Sockets.StreamSocket;
} catch(e) {}

export class Server extends EventEmitter {

	constructor(options, connectionListener) {
		super();
		if (!(this instanceof Server)) {
			return new Server(options, connectionListener);
		}
		/*
		{
			allowHalfOpen: false,
			pauseOnConnect: false
		}
		*/
		this._onError = this._onError.bind(this);
		this._onListen = this._onListen.bind(this);
		this._onConnection = this._onConnection.bind(this);
	}

	listen(port, callback) {
		console.log('listen');
		// WinRT needs port (or rathe serviceName) to be string
		this.once('listening', callback);
		port = port + '';
		this._closing = false;
		this._listener = new StreamSocketListener(port);
		this._listener.addEventListener('connectionreceived', this._onConnection);
		this._listener.bindServiceNameAsync(port).done(this._onListen, this._onError);

	}
	_onListen() {
		console.log('on listen');
		this.emit('listening');
	}

	_onConnection(eventArgument) {
		var socket = eventArgument.socket;
		this.emit('connection', socket);
	}

	_onError(reason) {
		// Clean up a listener if we failed to bind to a port.
		this._listener = null;

		// When we close a socket, outstanding async operations will be canceled and the
		// error callbacks called.  There's no point in displaying those errors.
		if (this._closing || this._destroyed) {
			return;
		}
	}

	// No StreamSocketListener equivalent
	ref() {}
	unref() {}
	
}




//export class Socket extends EventEmitter {
export class Socket extends Duplex {

	_connecting = false;
	_connected = false;
	_closing = false;
	_destroyed = false;
	// 35536 is max size of data the chunk could read from stream at once
	// (it's not just a random value. Was measured with Node.js)
	_maxChunkLength = 65536; // 64kB

	localAddress = undefined;
	localPort = undefined;
	remoteAddress = undefined;
	remoteFamily = undefined;
	remotePort = undefined;

	readable = false;
	writable = false;

	constructor(options) {
		// TODO implement options
		// TODO -- accept socket from server
		super();
		if (!(this instanceof Socket)) return new Socket(options);
		/*
		{
			fd: null,
			allowHalfOpen: false,
			readable: false,
			writable: false
		}
		*/
		if (options === undefined) {
			options = {};
		}

		this._onConnect = this._onConnect.bind(this);
		this._onError = this._onError.bind(this);
		this._onReceive = this._onReceive.bind(this);
		this._end = this._end.bind(this);
		this._onEnd = this._onEnd.bind(this);
	}

	connect(options, cb) {
		if (options === null || typeof options !== 'object') {
			// Old API:
			// connect(port, [host], [cb])
			// connect(path, [cb]);
			var args = normalizeConnectArgs(arguments);
			return Socket.prototype.connect.apply(this, args);
		}

		if (this.destroyed) {
			this._readableState.reading = false;
			this._readableState.ended = false;
			this._readableState.endEmitted = false;
			this._writableState.ended = false;
			this._writableState.ending = false;
			this._writableState.finished = false;
			this._writableState.errorEmitted = false;
			this.destroyed = false;
			this._handle = null;
			this._peername = null;
			this._sockname = null;
		}

		if (typeof cb === 'function') {
			this.once('connect', cb);
		}

		//this._unrefTimer();

		this._connecting = true;
		this.writable = true;

		if (this._host == 'localhost') {
			this._host = '127.0.0.1';
		}

		// emiting 'close' event right after 'end'
		this.once('end', this._onEnd);

		this._socket = new StreamSocket();
		//this._socket.control.keepAlive = false;
		// Microsoft desperately wants to make this more complicated than it needs to be
		var hostName = new Windows.Networking.HostName(this._host);

		this._connecting = true;
		this._socket.connectAsync(hostName, this._port).done(this._onConnect, this._onError);
	}
/*
	connect(...args) {
		if (this._connected || this._connecting) {
			// TODO - investigate
			//return false;
			// already connected, destroy and connect again
			//this.destroy()
		}
		var connectCallback;
		// todo instead of host+port could be also used unix socket path
		// https://nodejs.org/api/net.html#net_socket_connect_path_connectlistener
		if (args.length == 2) {
			this._port = args[0];
			if (typeof args[1] == 'function') {
				this._host = '127.0.0.1';
				connectCallback = args[1];
			} else {
				this._host = args[1];
			}
		}
		if (args.length == 3) {
			this._port = args[0];
			this._host = args[1];
			connectCallback = args[2];
		}

		if (this._host == 'localhost') {
			this._host = '127.0.0.1';
		}

		if (typeof connectCallback === 'function') {
			this.once('connect', connectCallback)
		}
		// emiting 'close' event right after 'end'
		this.once('end', this._onEnd);

		this._reset();

		this._socket = new StreamSocket();
		//this._socket.control.keepAlive = false;
		// Microsoft desperately wants to make this more complicated than it needs to be
		var hostName = new Windows.Networking.HostName(this._host);

		this._connecting = true;
		this._socket.connectAsync(hostName, this._port).done(this._onConnect, this._onError);
	}
	_reset() {
		if (this._destroyed) {
			this._readableState.reading = false
			this._readableState.ended = false
			this._readableState.endEmitted = false
			this._writableState.ended = false
			this._writableState.ending = false
			this._writableState.finished = false
			this._writableState.errorEmitted = false
			this._writableState.length = 0
			this._destroyed = false
		}
	}
*/
	_onConnect() {
		if (this._destroyed) {
			// .destroy() might have been called in meantime (right after .connect() but before connection was established)
			return;
		}
		this.localPort = this._socket.information.localPort;
		this.localAddress = this._socket.information.localAddress.canonicalName;
		this.remotePort = this._socket.information.remotePort;
		this.remoteAddress = this._socket.information.remoteAddress.canonicalName;
		this.remoteFamily = this.remoteAddress.includes(':') ? 'IPv6' : 'IPv4';
		this._connecting = false;
		this._connected = true;
		// setup writer and writer. it needs to be ready to use in connect callback
		this._writer = new DataWriter(this._socket.outputStream);
		this.writable = true;
		this._reader = new DataReader(this._socket.inputStream);
		this.readable = true;
		// Make _reader.loadAsync read any ammount of bytes (basically right when any data arrive)
		// In other words: wont't wait for receiving all of the _maxChunkLength to call _onReceive
		this._reader.inputStreamOptions = Windows.Storage.Streams.InputStreamOptions.partial;
		// emit connect, at this point everything should be ready to write
		this.emit('connect')
		// start listening only after emiting connect, 'data' event can't preceed 'connect'
		this._readChunk();
	}
	_readChunk() {
		console.log('################################# _readChunk ####################################')
		if (this._connected && this.readable) {
			// sets up data listener and calls _onReceive if (what a surprise) data is received
			if (this.operation) {
				this.operation.cancel();
				this.operation.close();
			}
			var thing = this._reader.loadAsync(this._maxChunkLength)
			this.operation = thing.operation;
			console.log('operation | status', thing.operation.status, '| errorCode', thing.operation.errorCode, '| id', thing.operation.id, '| completed', thing.operation.completed)
			thing.done(this._onReceive, this._onError);
			console.log('operation | status', thing.operation.status, '| errorCode', thing.operation.errorCode, '| id', thing.operation.id, '| completed', thing.operation.completed)
		}
	}
	_onReceive(chunkBytesRead) {
		console.log('### _onReceive')
		console.log('chunkBytesRead', chunkBytesRead)
		console.log('unconsumedBufferLength', this._reader.unconsumedBufferLength)
		if (this._destroyed) {
			// this happens once in 10 tries so don't delete it. It could happen. safety measures...
			return false;
		}
		if (chunkBytesRead == 0) {
			console.log('READ 0, keep reading');
			//this._readChunk();
			//this._reader.detachStream();
			//this._reader = new DataReader(this._socket.inputStream);
			setTimeout(() => this._readChunk(), 1000);
			return;
		}
		this.bytesRead += chunkBytesRead;
		// received some data, load the into Node-like Buffer (Uint8 typed array) and emit
		var buffer = new Buffer(chunkBytesRead);
		this._reader.readBytes(buffer);
		console.log('buffer', buffer.length)
		console.log('unconsumedBufferLength', this._reader.unconsumedBufferLength)
		// if returns false, then apply backpressure
		var pushed = this.push(buffer);
		if (!pushed) {
			//chrome.sockets.tcp.setPaused(this.id, true) // TODO
		}
		// keep receiving next data
		//this._readChunk();
		setTimeout(() => this._readChunk(), 1000);
	}
/*
	startServerRead() {
		this._reader.loadAsync(4).done(sizeBytesRead => {
			// Make sure 4 bytes were read.
			if (sizeBytesRead !== 4) {
				// The underlying socket was closed before we were able to read the whole data.
				return;
			}

			// Read in the 4 bytes count and then read in that many bytes.
			var count = this._reader.readInt32();
			return this._reader.loadAsync(count).then(stringBytesRead => {
				// Make sure the whole string was read.
				if (stringBytesRead !== count) {
					// The underlying socket was closed before we were able to read the whole data.
					return;
				}
				// Read in the string.
				var string = this._reader.readString(count);
				WinJS.log && WinJS.log("Received data: \"" + string + "\"", "", "status");

				// Restart the read for more bytes. We could just call this.startServerRead() but in
				// the case subsequent read operations complete synchronously we start building
				// up the stack and potentially crash. We use WinJS.Promise.timeout() to invoke
				// this function after the stack for the current call unwinds.
				WinJS.Promise.timeout().done(function () { return this.startServerRead(); });
			}); // End of "read in rest of string" function.
		//}, this._onError);
		}, error => {
			//console.log('### ERROR .startServerRead(), loadAsync')
			this._onError(error);
		});
	}
*/
	_read(bufferSize) {}

	_hadError = false;
	_onError(reason) {
		console.log('### _onError', reason);
		// TODO investigate - should multiple errors be merged into one?
		// probable case - .end() during both reading and writing will (maybe) cause two errors? just a thought thou...
		if (this._closing || this._destroyed) {
			// probably just some error of not finished read/write due to calling cancelIOAsync in .end()
			return;
		}
		//console.log('############# NOW I WOULD EMIT ERROR ####################')
		this._connecting = false;
		this._hadError = true;
		this._end();
	}

	end(data, encoding) {
		// Duplex.prototype.end has to be called everytime to ensure proper reaction (calling .write(), ._write()
		// and throwing Error: write after end) if there are any data (first argument of this method)
		// to be sent before closing socket
		Duplex.prototype.end.call(this, data, encoding)
		//if (!this._connected) {
		if (!this._connecting && !this._connected) {
			// .end() was called before .connect() do nothing
			return;
		}
		if (this._closing || this._destroyed) {
			return;
		}
		// why the setImmediate?
		// cancelIOAsync might call the callback synchronously if there's no pending read/write
		// but it needs to be async - to properly react to errors (Error: write after end).
		// Also .end() (unlike .destroy() ) gives reader/writer some head start to finish reading.
		// Writer has to stop sending whatever is in buffer and send FIN packet to gracefuly close connection. 
		// Unfortunately WinRT has no gentle way to stop writer separately from reader.
		// This should not be that big of a deal but we have to at least fake it by setting this.writable right away
		// (in node, callback of 'end' event the writable==false and readable==true)
		this.writable = false;
		this._closing = true;
		setImmediate(() => {
			if (this._destroyed) {
				// .destroy() might have been called in meantime
				return;
			}
			// CancelIOAsync cancels pending writes and reads, but if there is a write buffer pending
			// in networking drivers, it flushes the write.
			this._socket.cancelIOAsync().done(this._end, this._end);
			// TODO investigate - does this need any futher error handling?
		});
	}
	_end() {
		if (this._destroyed) {
			// .destroy() might have been called in meantime
			return;
		}
		// close all of the reader/writer/socket and set connecting/connected/etc...
		this._destroy();
		// pushing null means zero terminated EOF which emits 'end' event
		this.push(null);
		// 'close' has to be fired after 'end' which is being listened to in .connect()
	}
	_onEnd() {
		// 'close' has to be fired after 'end' which is being listened to in .connect()
		this.emit('close', this._hadError);
		this._hadError = false;
	}

	destroy(exception) {
		if (this._destroyed) {
			return;
		}
		if (exception) {
			// calling destroy with any argument throws it as error
			this.emit('error', new Error(exception));
			//setImmediate(() => this.emit('error', new Error(exception)));
			// note: error seems to be emitted synchronous when calling .destroy('exception') before .connect()
			// but asynchronously after being connected... but meh, this shouldn't be a problem
		}
		if (!this._connecting && !this._connected) {
			// .destroy() called before .connect() do nothing
			return;
		}
		// close all of the reader/writer/socket and set connecting/connected/etc...
		this._destroy();
		// destroy does not call 'end', on 'close'
		setImmediate(() => this.emit('close', this._hadError || !!exception));
	}
	_destroy() {
		this.writable = false;
		if (this._writer) {
			try {
				// might be writing at the moment
				this._writer.detachStream();
				this._writer = null;
			} catch(e) {
				// TODO invesitagate - does this need any further handling? Or will the writer just burn in flames on it's own?
				this._writer = null;
			}
		}
		this.readable = false;
		if (this._reader) {
			try {
				// might be reading at the moment
				this._reader.detachStream();
				this._reader = null;
			} catch(e) {
				// TODO invesitagate - does this need any further handling? Or will the reader just burn in flames on it's own?
				this._reader = null;
			}
		}
		if (this._socket) {
			this._socket.close();
			this._socket = null;
		}

		this._connecting = false;
		this._connected = false;
		this._closing = false;
		this._destroyed = true;
	}

	pause() {
	}

	// No StreamSocket equivalent
	ref() {}
	unref() {}

	// implemented by stream
	//resume() {}

	setEncoding() {
	}

	setKeepAlive() {
	}

	setNoDelay() {
	}

	setTimeout() {
	}



	get bufferSize() {
		// tested in node: returns undefined before socket.connect()
		//if (this._closing) {
		//	// TODO investigate more
		//	return 0;
		//} else if (this._connecting || this._connected) {
		if (this._connecting || this._connected) {
			return this._writableState.length;
		}
	}

	bytesRead = 0; // TODO

	_bytesDispatched = 0;
	get bytesWritten() {
		return this._bytesDispatched + (this.bufferSize || 0);
	}

	_pendingData = [];
	_write(chunk, encoding, callback) {
		if (!callback) callback = () => {}

		if (this._connecting) {
			this._pendingData.push(chunk);
			this.once('connect', () => {
				removeFromArray(this._pendingData, chunk);
				this._write(chunk, encoding, callback)
			});
			return;
		}
/*
		if (this._destroyed) {
			callback(new Error('This socket is closed'))
			return;
		}
*/
		//if (this._connected) {
		if (this.writable) {
			this._writer.writeBytes(chunk);
			// note: don't pass callback as rference! oh boy those contexts...
			this._writer.storeAsync().done(() => {
				this._bytesDispatched += chunk.length;
				callback()
			}, this._onError);
			//}, error => {
			//	//console.log('### ERROR ._write(), storeAsync')
			//	this._onError(error);
			//});
		} else {
			callback(new Error('This socket is closed'))
		}
	}
}


/*
// called when creating new Socket, or when re-using a closed Socket
Socket.prototype._init = function () {
  // The amount of received bytes.
  this.bytesRead = 0

  this._bytesDispatched = 0
}

// called when creating new Socket, or when closing a Socket
Socket.prototype._reset = function () {
  this.remoteAddress = this.remotePort =
      this.localAddress = this.localPort = null
  this.remoteFamily = 'IPv4'
  this.readable = this.writable = false
  this._connecting = false
}
*/	



export function createServer(options, connectionListener) {
  return new Server(options, connectionListener);
}

export var connect = function(...args) {
  args = normalizeConnectArgs(args);
  var s = new Socket(args[0]);
  return Socket.prototype.connect.apply(s, args);
};
export var createConnection = connect;

// Returns an array [options] or [options, cb]
// It is the same as the argument of Socket.prototype.connect().
function normalizeConnectArgs(args) {
	var options = {};

	if (args[0] !== null && typeof args[0] === 'object') {
		// connect(options, [cb])
		options = args[0];
	} else if (isPipeName(args[0])) {
		// connect(path, [cb]);
		options.path = args[0];
	} else {
		// connect(port, [host], [cb])
		options.port = args[0];
		if (typeof args[1] === 'string') {
			options.host = args[1];
		}
	}

	var cb = args[args.length - 1];
	return typeof cb === 'function' ? [options, cb] : [options];
}
/*
function _connect(options, ...args) {
	// first argument could be options object that goes to constructor.
	// all other arguments are passed into connect method
	var clientSocket;
	if (options.constructor == Object) {
		clientSocket = new Socket(options);
	} else {
		args.unshift(options);
		clientSocket = new Socket();
	}
	clientSocket.connect(...args);
	return clientSocket;
}
export var connect = _connect;
export var createConnection = _connect;
*/

export default {
	createServer,
	createConnection,
	connect,
	Socket,
	Server
}


function removeFromArray(array, item) {
	var index = array.indexOf(item);
	if (index > -1) {
		array.splice(index, 1);
	}
}
/*

//
// EXPORTED HELPERS
//

// Source: https://developers.google.com/web/fundamentals/input/form/provide-real-time-validation#use-these-attributes-to-validate-input
var IPv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
var IPv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/

exports.isIPv4 = IPv4Regex.test.bind(IPv4Regex)
exports.isIPv6 = IPv6Regex.test.bind(IPv6Regex)

exports.isIP = function (ip) {
  return exports.isIPv4(ip) ? 4 : exports.isIPv6(ip) ? 6 : 0
}
*/


/*
console.log('this._connecting', this._connecting);
console.log('this._connected', this._connected);
console.log('this._closing', this._closing);
console.log('this._destroyed', this._destroyed);/

	/*end(data, encoding) {
		// Duplex.prototype.end has to be called everytime to ensure proper reaction (calling .write(), ._write()
		// and throwing Error: write after end) if there are any data (first argument of this method)
		// to be sent before closing socket
		Duplex.prototype.end.call(this, data, encoding)
		//if (!this._connected) {
		if (!this._connecting && !this._connected) {
			// .end() was called before .connect() do nothing
			return;
		}
		if (this._closing || this._destroyed) {
			return;
		}
		this._closing = true;
		this.writable = false;
		// CancelIOAsync cancels pending writes and reads, but if there is a write buffer pending
		// in networking drivers, it flushes the write.
		this._socket.cancelIOAsync().done(() => {
			// cancelIOAsync might call the callback synchronously if there's no pending read/write
			// but it needs to be async - to properly react to errors (Error: write after end)
			setImmediate(this._end);
		}, () => {
			// TODO investigate - does this need any futher handling?
			setImmediate(this._end);
		});
	}*/