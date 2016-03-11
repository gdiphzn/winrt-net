import {EventEmitter} from 'events';
import {Buffer} from 'buffer';
import {Duplex} from 'stream';


try {
var DataWriter = Windows.Storage.Streams.DataWriter;
var DataReader = Windows.Storage.Streams.DataReader;
var StreamSocketListener = Windows.Networking.Sockets.StreamSocketListener;
var StreamSocket = Windows.Networking.Sockets.StreamSocket;
} catch(e) {}



//export class Socket extends EventEmitter {
export class Socket extends Duplex {

	_connecting = false;
	_connected = false;
	_closing = false;
	destroyed = false;
	_hadError = false;
	_handle = null;
	// 35536 is max size of data the chunk could read from stream at once
	// (it's not just a random value. Was measured with Node.js)
	_maxChunkLength = 65536; // 64kB

	constructor(options) {
		// TODO implement options
		// TODO -- accept socket from server
		super();

		if (!(this instanceof Socket)) return new Socket(options);

		if (options === undefined) {
			options = {};
		}


		if (options.handle) {
			// wrapping server connection socket
			this._handle = options.handle; // private
			this.readable = this.writable = true;
			this._onConnect();
		} else {
			// these will be set once there is a connection
			this.readable = this.writable = false;
		}

		// shut down the socket when we're finished with it.
		this.on('finish', this.destroy)
		//this.on('finish', onSocketFinish);
		//this.on('_socketEnd', onSocketEnd);

		this._initSocketHandle(this);

		// default to *not* allowing half open sockets
		this.allowHalfOpen = options && options.allowHalfOpen || false;

		// if we have a handle, then start the flow of data into the
		// buffer.  if not, then this will happen when we connect
		if (this._handle && options.readable !== false) {
			if (options.pauseOnCreate) {
				// TODO
			} else {
				this.read(0);
			}
		}

		// Reserve properties
		this.server = null;

		this._onConnect = this._onConnect.bind(this);
		this._onError = this._onError.bind(this);
		this._onReceive = this._onReceive.bind(this);
		this._end = this._end.bind(this);
		this._onEnd = this._onEnd.bind(this);
	}

	_initSocketHandle() {
		this.destroyed = false;
		this.bytesRead = 0;
		this._bytesDispatched = 0;
		this._sockname = null;
	}

	localAddress = undefined;
	localPort = undefined;
	remoteAddress = undefined;
	remoteFamily = undefined;
	remotePort = undefined;
	
	address() {
		return {
			address: this.remoteAddress,
			family: this.remoteFamily,
			port: this.remotePort
		}
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

		if (options.host == 'localhost') {
			options.host = '127.0.0.1';
		}

		// emiting 'close' event right after 'end'
		this.once('end', this._onEnd);

		this._handle = new StreamSocket();
		//this._handle.control.keepAlive = false;
		// Microsoft desperately wants to make this more complicated than it needs to be
		var hostName = new Windows.Networking.HostName(options.host);

		this._connecting = true;
		this._handle.connectAsync(hostName, options.port)
					.done(this._onConnect, err => this._onError(err, 'connect', options.host, parseInt(options.port)));
	}

	_onConnect() {
		if (this.destroyed) {
			// .destroy() might have been called in meantime (right after .connect() but before connection was established)
			return;
		}
		this.localPort = this._handle.information.localPort;
		this.localAddress = this._handle.information.localAddress.canonicalName;
		this.remotePort = this._handle.information.remotePort;
		this.remoteAddress = this._handle.information.remoteAddress.canonicalName;
		this.remoteFamily = this.remoteAddress.includes(':') ? 'IPv6' : 'IPv4';
		this._connecting = false;
		this._connected = true;
		// setup writer and writer. it needs to be ready to use in connect callback
		this._writer = new DataWriter(this._handle.outputStream);
		this.writable = true;
		this._reader = new DataReader(this._handle.inputStream);
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
		//console.log('################################# _readChunk ####################################')
		//if (this._connected && this.readable) {
		if (this.readable) {
			// sets up data listener and calls _onReceive if (what a surprise) data is received
			var thing = this._reader.loadAsync(this._maxChunkLength)
			//console.log('operation | status', thing.operation.status, '| errorCode', thing.operation.errorCode, '| id', thing.operation.id, '| completed', thing.operation.completed)
			thing.done(this._onReceive, err => this._onError(err, 'read'));
			//console.log('operation | status', thing.operation.status, '| errorCode', thing.operation.errorCode, '| id', thing.operation.id, '| completed', thing.operation.completed)
		}
	}
	_onReceive(chunkBytesRead) {
		if (this.destroyed) {
			// this happens once in 10 tries so don't delete it. It could happen. safety measures...
			return false;
		}
		if (chunkBytesRead == 0) {
			this.end();
			return;
		}
		this.bytesRead += chunkBytesRead;
		// received some data, load the into Node-like Buffer (Uint8 typed array) and emit
		var buffer = new Buffer(chunkBytesRead);
		this._reader.readBytes(buffer);
		// if returns false, then apply backpressure
		var pushed = this.push(buffer);
		if (!pushed) {
			//chrome.sockets.tcp.setPaused(this.id, true) // TODO
		}
		// keep receiving next data
		setImmediate(() => this._readChunk());
	}

	_hadError = false;
	_onError(err, syscall, address, port) {
		console.log('### _onError', err, syscall);
		// TODO investigate - should multiple errors be merged into one?
		// probable case - .end() during both reading and writing will (maybe) cause two errors? just a thought thou...
		if (this._closing || this.destroyed) {
			// probably just some error of not finished read/write due to calling cancelIOAsync in .end()
			return;
		}
		this._connecting = false;
		this._hadError = true;
		this._end();
		this.emit('error', errnoException(err, syscall, address, port));
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
		if (this._closing || this.destroyed) {
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
			if (this.destroyed) {
				// .destroy() might have been called in meantime
				return;
			}
			// CancelIOAsync cancels pending writes and reads, but if there is a write buffer pending
			// in networking drivers, it flushes the write.
			this._handle.cancelIOAsync().done(this._end, this._end);
			// TODO investigate - does this need any futher error handling?
		});
	}
	_end() {
		if (this.destroyed) {
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
		if (this.destroyed) {
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
		this._connecting = false;
		this._connected = false;
		this._closing = false;
		this.destroyed = true;

		this.writable = this.readable = false;
		if (this._writer) {
			// might be writing at the moment
			try {
				this._writer.detachStream();
			} catch(e) {}
			// TODO invesitagate - does this need any further error handling? Or will the writer just burn in flames on it's own?
			this._writer = null;
		}
		if (this._reader) {
			// might be reading at the moment
			try {
				this._reader.detachStream();
			} catch(e) {}
			// TODO invesitagate - does this need any further error handling? Or will the reader just burn in flames on it's own?
			this._reader = null;
		}
		if (this._handle) {
			this._handle.close();
			this._handle = null;
		}
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

	bytesRead = 0;

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
		if (this.destroyed) {
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
			}, err => this._onError(err, 'write'));
		} else {
			callback(new Error('This socket is closed'))
		}
	}


	_read(n) {
		/*if (this._connecting || !this._handle) {
			debug('_read wait for connection');
			this.once('connect', () => this._read(n));
		} else if (!this._handle.reading) {
			// not already reading, start the flow
			debug('Socket._read readStart');
			this._handle.reading = true;
			var err = this._handle.readStart();
			if (err)
				this._destroy(errnoException(err, 'read'));
		}*/
	}

	/*read(n) {
		if (n === 0)
			return stream.Readable.prototype.read.call(this, n);

		this.read = stream.Readable.prototype.read;
		this._consuming = true;
		return this.read(n);
	};*/

	setTimeout(timeout, callback) {
		/*if (timeout === 0) {
			timers.unenroll(this)
			if (callback) {
				this.removeListener('timeout', callback)
			}
		} else {
			timers.enroll(this, timeout)
			timers._unrefActive(this)
			if (callback) {
				this.once('timeout', callback)
			}
		}

		return this*/
	}

	_onTimeout() {
		this.emit('timeout')
	}

	setNoDelay(enable) {
		if (!this._handle) {
			this.once('connect',
			enable ? this.setNoDelay : () => this.setNoDelay(enable));
			return this;
		}

		// backwards compatibility: assume true when `enable` is omitted
		if (this._handle.setNoDelay)
			this._handle.setNoDelay(enable === undefined ? true : !!enable);

		return this;
	}


	setKeepAlive(setting, msecs) {
		if (!this._handle) {
			this.once('connect', () => this.setKeepAlive(setting, msecs));
			return this;
		}

		if (this._handle.setKeepAlive)
			this._handle.setKeepAlive(setting, ~~(msecs / 1000));

		return this;
	}

	_unrefTimer() {
		/*for (var s = this; s !== null; s = s._parent) {
			timers._unrefActive(s)
		}*/
	}



}



// the user has called .end(), and all the bytes have been sent out to the other side.
// If allowHalfOpen is false, or if the readable side has ended already, then destroy.
// If allowHalfOpen is true, then we need to do a shutdown,
// so that only the writable side will be cleaned up.
function onSocketFinish() {
  // If still connecting - defer handling 'finish' until 'connect' will happen
  if (this._connecting) {
    return this.once('connect', onSocketFinish);
  }

  if (!this.readable || this._readableState.ended) {
    return this.destroy();
  }

//????????????????????????????
  // otherwise, just destroy()
  if (!this._handle)
    return this.destroy();
}


function afterShutdown(status, handle, req) {
  // callback may come after call to destroy.
  if (this.destroyed)
    return;

  if (this._readableState.ended) {
    this.destroy();
  } else {
    this.once('_socketEnd', this.destroy);
  }
}

// the EOF has been received, and no more bytes are coming.
// if the writable side has ended already, then clean everything up.
function onSocketEnd() {
  // XXX Should not have to do as much crap in this function.
  // ended should already be true, since this is called *after* the EOF errno and onread has eof'ed
  this._readableState.ended = true;
  if (this._readableState.endEmitted) {
    this.readable = false;
    maybeDestroy(this);
  } else {
    this.once('end', function() {
      this.readable = false;
      maybeDestroy(this);
    });
    this.read(0);
  }

  if (!this.allowHalfOpen) {
    this.write = writeAfterFIN;
    this.destroySoon();
  }
}

// Provide a better error message when we call end() as a result
// of the other side sending a FIN.  The standard 'write after end'
// is overly vague, and makes it seem like the user's code is to blame.
function writeAfterFIN(chunk, encoding, cb) {
  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  var er = new Error('This socket has been ended by the other party');
  er.code = 'EPIPE';
  this.emit('error', er);
  if (typeof cb === 'function') {
    process.nextTick(cb, er);
  }
}




























export class Server extends EventEmitter {

	_host = null;

	constructor(options, connectionListener) {
		super();

		this._onError = this._onError.bind(this);
		this._onListen = this._onListen.bind(this);
		this._onConnection = this._onConnection.bind(this);

		if (!(this instanceof Server)) {
			return new Server(options, connectionListener);
		}

		EventEmitter.call(this);

		if (typeof options === 'function') {
			connectionListener = options;
			options = {};
			this.on('connection', connectionListener);
		} else {
			options = options || {};

			if (typeof connectionListener === 'function') {
				this.on('connection', connectionListener);
			}
		}

		this._connections = 0;

		this._handle = null;
		//this._unref = false;

		this.allowHalfOpen = options.allowHalfOpen || false;
		this.pauseOnConnect = !!options.pauseOnConnect;
	}

	address() {
		return {
			port: this._port,
			address: this._host,
			family: this._host.indexOf(':') !== -1 ? 'IPv6' : 'IPv4',
		}
	}

	listen(port, callback) {
		this._closing = false;
		this.once('listening', callback);
		if (self._handle) {
			if (port == this._port) {
				// nodejs allows (accidentally?) calling .listen() multiple times and simply ignores it
				return false;
			} else {
				// TODO
				// destroy original server and start listening on new port
			}
		}
		// TODO find local IP
		this._host = '::';
		// WinRT needs port (or rather serviceName) to be string
		this._port = port;
		port = port + '';
		this._handle = new StreamSocketListener(port);
		this._handle.addEventListener('connectionreceived', this._onConnection);
		this._handle.bindServiceNameAsync(port)
					.done(this._onListen, err => this._onError(err, 'listen', this._host, port));
	}

	get listening() {
		return !!this._handle;
	}

	_onListen(foo) {
		console.log('onlisten', this._handle);
		this.emit('listening');
	}

	_onConnection(e) {
		if (this.maxConnections && this._connections >= this.maxConnections) {
			e.socket.close();
			return;
		}

		var socket = new Socket({
			server: this,
			handle: e.socket,
			allowHalfOpen: this.allowHalfOpen,
			pauseOnCreate: this.pauseOnConnect
		});
		this._connections++;
		this.emit('connection', socket);
	}

	_connections = 0;
	getConnections(cb) {
		process.nextTick(cb, null, this._connections);
	}


	_onError(err, syscall, address, port) {
		// Clean up a listener if we failed to bind to a port.
		try {
			this._handle.cancelIOAsync();
			this._handle.close();
		} catch (e) {}
		this._handle = null;

		// When we close a socket, outstanding async operations will be canceled and the
		// error callbacks called.  There's no point in displaying those errors.
		if (this._closing || this.destroyed) {
			return;
		}
		this.emit('error', errnoException(err, syscall, address, port));
	}

	// No StreamSocketListener equivalent
	ref() {}
	unref() {}
	
}





















/*

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
function isPipeName(s) {
  return typeof s === 'string' && toNumber(s) === false;
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
console.log('this.destroyed', this.destroyed);/

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
		if (this._closing || this.destroyed) {
			return;
		}
		this._closing = true;
		this.writable = false;
		// CancelIOAsync cancels pending writes and reads, but if there is a write buffer pending
		// in networking drivers, it flushes the write.
		this._handle.cancelIOAsync().done(() => {
			// cancelIOAsync might call the callback synchronously if there's no pending read/write
			// but it needs to be async - to properly react to errors (Error: write after end)
			setImmediate(this._end);
		}, () => {
			// TODO investigate - does this need any futher handling?
			setImmediate(this._end);
		});
	}*/



/*
ERRORS

EACCES (Permission denied): An attempt was made to access a file in a way forbidden by its file access permissions.
EADDRINUSE (Address already in use): An attempt to bind a server (net, http, or https) to a local address failed due to another server on the local system already occupying that address.
ECONNREFUSED (Connection refused): No connection could be made because the target machine actively refused it. 
ECONNRESET (Connection reset by peer): A connection was forcibly closed by a peer. 

*/

// this is (modified) code from module 'util' but there's no point to have it as dependecy because of one function
// https://github.com/nodejs/node/blob/master/lib/util.js
var errorCodes = {
	'-2147014848': 'EADDRINUSE',
	'-2147014836': 'ETIMEDOUT',
	'?': 'ECONNREFUSED',
	'-2147014842': 'ECONNRESET'
}
function errnoException(err, syscall, address, port) {
	var errname = errorCodes[err.number] || err.number;
	var message = syscall + ' ' + errname;
	var e = new Error(message);
	e.code = e.errno = errname;
	e.syscall = syscall;
	e.message = err.message;
	if (port) {
		e.port = port;
	}
	if (address) {
		e.address = address;
	}
	return e;
};