'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.isIP = exports.isIPv6 = exports.isIPv4 = exports.createConnection = exports.connect = exports.Server = exports.Socket = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.createServer = createServer;

var _events = require('events');

var _buffer = require('buffer');

var _stream = require('stream');

var _process = require('process');

var _process2 = _interopRequireDefault(_process);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// JSPM will execute this module even when in not WinRT enviroment
// which causes troubles with flexus-net module running in Chrome Apps.
// Wrapped for interacting with WinRT APIs onlny in WinRT.
var DataWriter = void 0,
    DataReader = void 0,
    StreamSocketListener = void 0,
    StreamSocket = void 0;

if (typeof Windows != 'undefined') {
	DataWriter = Windows.Storage.Streams.DataWriter;
	DataReader = Windows.Storage.Streams.DataReader;
	StreamSocketListener = Windows.Networking.Sockets.StreamSocketListener;
	StreamSocket = Windows.Networking.Sockets.StreamSocket;
}

///////////////////////////////////////////////////////////////////////
/////////////////////////// SOCKET ////////////////////////////////////
///////////////////////////////////////////////////////////////////////

var Socket = exports.Socket = function (_Duplex) {
	_inherits(Socket, _Duplex);

	function Socket(options) {
		var _ret;

		_classCallCheck(this, Socket);

		var _this = _possibleConstructorReturn(this, (Socket.__proto__ || Object.getPrototypeOf(Socket)).call(this));
		// TODO implement options
		// TODO -- accept socket from server


		_this._connecting = false;
		_this._connected = false;
		_this.destroyed = false;
		_this._hadError = false;
		_this._handle = null;
		_this._maxChunkLength = 65536;
		_this.localAddress = undefined;
		_this.localPort = undefined;
		_this.remoteAddress = undefined;
		_this.remoteFamily = undefined;
		_this.remotePort = undefined;
		_this.bytesRead = 0;
		_this._bytesDispatched = 0;


		if (!(_this instanceof Socket)) return _ret = new Socket(options), _possibleConstructorReturn(_this, _ret);

		_this._onConnect = _this._onConnect.bind(_this);
		_this._onError = _this._onError.bind(_this);
		_this._onRead = _this._onRead.bind(_this);

		if (options === undefined) {
			options = {};
		}

		// Reserve properties
		_this.server = _this._server = null;

		if (options.handle) {
			// wrapping server connection socket
			_this._handle = options.handle; // private
			_this.readable = _this.writable = true;
			_this.server = options.server;
			_this._server = options._server;
			_this._onConnect();
		} else {
			// these will be set once there is a connection
			_this.readable = _this.writable = false;
		}

		// shut down the socket when we're finished with it.
		_this.on('finish', _this.destroy);

		_this._initSocketHandle();
		_this._initSocketHandle2();

		// default to *not* allowing half open sockets
		_this.allowHalfOpen = options && options.allowHalfOpen || false;

		// if we have a handle, then start the flow of data into the
		// buffer.  if not, then this will happen when we connect
		if (_this._handle && options.readable !== false) {
			if (options.pauseOnCreate) {
				// TODO
			} else {
				_this.read(0);
			}
		}
		return _this;
	}

	// TODO investigate - will bytesRead remain after reconneting or will it become 0?
	// can we merge these function or is only _initSocketHandle2 callable when reconnecting?
	// 64kB

	_createClass(Socket, [{
		key: '_initSocketHandle',
		value: function _initSocketHandle() {
			this.bytesRead = 0;
			this._bytesDispatched = 0;
		}
	}, {
		key: '_initSocketHandle2',
		value: function _initSocketHandle2() {
			this.destroyed = false;
			this._hadError = false;
			//this._sockname = null; // TODO
		}
	}, {
		key: 'address',
		value: function address() {
			return {
				address: this.remoteAddress,
				family: this.remoteFamily,
				port: this.remotePort
			};
		}
	}, {
		key: 'connect',
		value: function connect(options, cb) {
			var _this2 = this;

			if (options === null || (typeof options === 'undefined' ? 'undefined' : _typeof(options)) !== 'object') {
				// Old API:
				// connect(port, [host], [cb])
				// connect(path, [cb]);
				var args = normalizeConnectArgs(arguments);
				return Socket.prototype.connect.apply(this, args);
			}
			if (options.host == 'localhost') {
				// TODO, IPv6
				options.host = '127.0.0.1';
			}
			if (this._connecting || this._connected) {
				_process2.default.nextTick(connectErrorNT, this, errnoException('EISCONN', 'connect', options.host, options.port));
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
				this._sockname = null;
			}
			this._initSocketHandle2();

			if (typeof cb === 'function') {
				this.once('connect', cb);
			}

			//this._unrefTimer();

			this._connecting = true;
			this.writable = true;

			this._handle = new StreamSocket();
			//this._handle.control.keepAlive = false;
			// Microsoft desperately wants to make this more complicated than it needs to be
			var hostName = new Windows.Networking.HostName(options.host);

			this._handle.connectAsync(hostName, options.port).done(this._onConnect, function (err) {
				return _this2._onError(err, 'connect', options.host, parseInt(options.port));
			});
			return this;
		}
	}, {
		key: '_onConnect',
		value: function _onConnect() {
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
			// In other words: wont't wait for receiving all of the _maxChunkLength to call _onRead
			this._reader.inputStreamOptions = Windows.Storage.Streams.InputStreamOptions.partial;
			// emit connect, at this point everything should be ready to write
			this.emit('connect');
			// start listening only after emiting connect, 'data' event can't preceed 'connect'
			this._readChunk();
			// start the first read, or get an immediate EOF.
			// this doesn't actually consume any bytes, because len=0.
			this.read(0);
		}
	}, {
		key: '_readChunk',
		value: function _readChunk() {
			var _this3 = this;

			//if (this._connected && this.readable) {
			//if (this.readable) {
			if (!this._reader || !this.readable) return;

			// sets up data listener and calls _onRead if data is received
			var thing = this._reader.loadAsync(this._maxChunkLength);
			thing.done(this._onRead, function (err) {
				return _this3._onError(err, 'read');
			});
		}
	}, {
		key: '_onRead',
		value: function _onRead(chunkBytesRead) {
			var _this4 = this;

			if (chunkBytesRead == 0) {
				// server closed this socket, destroy this end too
				this.end();
				return;
			}

			// For some reason this._reader is null sometimes...
			// TODO: Investigate if our tcp application code is not handling reconnection correctly
			if (!this._reader || !this.readable) return;

			this.bytesRead += chunkBytesRead;

			// received some data, load the into Node-like Buffer (Uint8 typed array) and emit
			var buffer = new _buffer.Buffer(chunkBytesRead);
			this._reader.readBytes(buffer);
			this.push(buffer);
			// TODO
			// if returns false, then apply backpressure
			//if (!this.push(buffer)) {
			//	chrome.sockets.tcp.setPaused(this.id, true)
			//}
			// keep receiving next data
			setImmediate(function () {
				return _this4._readChunk();
			});
		}
	}, {
		key: '_onError',
		value: function _onError(err, syscall, address, port) {
			// TODO investigate - should multiple errors be merged into one?
			// probable case - .end() during both reading and writing will (maybe) cause two errors? just a thought thou...
			if (this.destroyed) {
				// probably just some error of not finished read/write due to calling cancelIOAsync in .end()
				return;
			}
			this._connecting = false;
			this._hadError = true;
			//this.end();

			//this._destroy();
			//this.emit('error', errnoException(err, syscall, address, port));
			_process2.default.nextTick(connectErrorNT, this, errnoException(err, syscall, address, port));
		}
	}, {
		key: 'end',
		value: function end(data, encoding) {
			var _this5 = this;

			if (!this._connecting && !this._connected) {
				// .end() was called before .connect() do nothing
				// Duplex.prototype.write has to be called to ensure throwing error (write after end)
				_stream.Duplex.prototype.end.call(this, data, encoding);
				return;
			}
			if (this._connecting) {
				this.once('connect', function () {
					return _this5.end(data, encoding);
				});
				//setImmediate(() => this.end(data, encoding))
				return;
			}
			// Duplex.prototype.write has to be called to ensure throwing error (write after end)
			// WARNING: Duplex.end() calls this.destroy
			_stream.Duplex.prototype.end.call(this, data, encoding);
			this._willEmitEnd = true;
			if (this.readable && !this._readableState.endEmitted) {
				this.read(0);
			}
		}
	}, {
		key: 'destroy',
		value: function destroy(exception) {
			this._destroy(exception);
		}
	}, {
		key: '_destroy',
		value: function _destroy(exception, cb) {
			var _this6 = this;

			if (!this._connecting && !this._connected) {
				// .destroy() called before .connect() do nothing
				return;
			}

			var fireErrorCallbacks = function fireErrorCallbacks() {
				if (cb) cb(exception);
				if (exception && !_this6._writableState.errorEmitted) {
					_process2.default.nextTick(emitErrorNT, _this6, new Error(exception));
					//setImmediate(() => this.emit('error', new Error(exception)));
					_this6._writableState.errorEmitted = true;
				}
			};

			if (this.destroyed) {
				// already destroyed, fire error callbacks
				fireErrorCallbacks();
				return;
			}

			// stream is no more readable (won't be sending anything to server)
			// but it remains readable since some data from server might be already
			// on the way or in buffer waiting to be emitted
			this.writable = false;
			// calling destroy with argument causes error and 'close' event callback argument to be true
			this._hadError = this._hadError || !!exception;
			// we set destroyed to true before firing error callbacks in order
			// to make it re-entrance safe in case Socket.prototype.destroy()
			// is called within callbacks
			this.destroyed = true;
			fireErrorCallbacks();
			this._connecting = false;
			this._connected = false;

			if (this._server) {
				this._server._connections--;
				if (this._server._emitCloseIfDrained) {
					this._server._emitCloseIfDrained();
				}
			}

			this._destroyHandle();
		}
	}, {
		key: '_destroyHandle',
		value: function _destroyHandle() {
			var _this7 = this;

			// why the setImmediate?
			// cancelIOAsync might call the callback synchronously if there's no pending read/write
			// but it needs to be async - to properly react to errors (Error: write after end).
			// Also .end() (unlike .destroy() ) gives reader/writer some head start to finish reading.
			// Writer has to stop sending whatever is in buffer and send FIN packet to gracefuly close connection. 
			setImmediate(function () {
				if (_this7._handle == null) {
					return;
				}
				// disabling readable here instead of in _destroyHandle2() to make reading safer
				// (to prevent Error reading in inappropriate time)
				_this7.readable = false;
				// CancelIOAsync cancels pending writes and reads, but if there is a write buffer pending
				// in networking drivers, it flushes the write.
				var _destroyHandle2 = _this7._destroyHandle2.bind(_this7);
				_this7._handle.cancelIOAsync().done(_destroyHandle2, _destroyHandle2);
				// TODO investigate - does this need any futher error handling?
			});
		}
	}, {
		key: '_destroyHandle2',
		value: function _destroyHandle2() {
			var _this8 = this;

			if (this._handle) {
				try {
					this._handle.close();
				} catch (e) {}
				this._handle = null;
			}
			if (this._writer) {
				// might be writing at the moment
				try {
					this._writer.detachStream();
				} catch (e) {}
				// TODO invesitagate - does this need any further error handling? Or will the writer just burn in flames on it's own?
				this._writer = null;
			}
			if (this._reader) {
				// might be reading at the moment
				try {
					this._reader.detachStream();
				} catch (e) {}
				// TODO invesitagate - does this need any further error handling? Or will the reader just burn in flames on it's own?
				this._reader = null;
			}

			if (this._willEmitEnd && !this._readableState.endEmitted) {
				// either we closed the socket or server disconnected us and WinRT didn't give us EOF
				// so we have to simulate it by pushing null to data. (in other word: this emits 'end')
				this.push(null);
				this.once('end', function () {
					return _this8.emit('close', _this8._hadError);
				});
			} else {
				this.emit('close', this._hadError);
			}
		}
	}, {
		key: '_write',
		value: function _write(chunk, encoding, done) {
			var _this9 = this;

			if (!done) done = function done() {};

			if (this._connecting) {
				this.once('connect', function () {
					return _this9._write(chunk, encoding, done);
				});
				return;
			}

			if (this._writer && this.writable) {
				this._writer.writeBytes(chunk);
				// note: don't pass callback as rference! oh boy those contexts...
				this._writer.storeAsync().done(function () {
					_this9._bytesDispatched += chunk.length;
					done();
				}, function (err) {
					return _this9._onError(err, 'write');
				});
			} else {
				done(new Error('This socket is closed'));
			}
		}
	}, {
		key: '_read',
		value: function _read(n) {}

		// No StreamSocket equivalent

	}, {
		key: 'ref',
		value: function ref() {
			console.warn('ref() not implemented. No WinRT equivalent');
			return this;
		}
	}, {
		key: 'unref',
		value: function unref() {
			console.warn('unref() not implemented. No WinRT equivalent');
			return this;
		}

		// TODO

	}, {
		key: 'setEncoding',
		value: function setEncoding() {
			console.warn('setEncoding() not implemented');
			return this;
		}

		// TODO

	}, {
		key: 'setTimeout',
		value: function setTimeout(timeout, callback) {
			console.warn('setTimeout() not implemented');
			return this;
		}

		// TODO (following code is probably not working. Copied straight outta node source)

	}, {
		key: 'setNoDelay',
		value: function setNoDelay(enable) {
			console.warn('setNoDelay() not implemented');
			/*if (!this._handle) {
   	this.once('connect',
   	enable ? this.setNoDelay : () => this.setNoDelay(enable));
   	return this;
   }
   		// backwards compatibility: assume true when `enable` is omitted
   if (this._handle.setNoDelay)
   	this._handle.setNoDelay(enable === undefined ? true : !!enable);*/
			return this;
		}

		// TODO (following code is probably not working. Copied straight outta node source)

	}, {
		key: 'setKeepAlive',
		value: function setKeepAlive(setting, msecs) {
			console.warn('setKeepAlive() not implemented');
			/*if (!this._handle) {
   	this.once('connect', () => this.setKeepAlive(setting, msecs));
   	return this;
   }
   		if (this._handle.setKeepAlive)
   	this._handle.setKeepAlive(setting, ~~(msecs / 1000));*/
			return this;
		}
	}, {
		key: '_unrefTimer',
		value: function _unrefTimer() {}
	}, {
		key: 'bufferSize',
		get: function get() {
			// returns undefined before socket.connect()
			if (this._connecting || this._connected) {
				return this._writableState.length;
			}
		}
	}, {
		key: 'bytesWritten',
		get: function get() {
			return this._bytesDispatched + (this.bufferSize || 0);
		}
	}]);

	return Socket;
}(_stream.Duplex);

///////////////////////////////////////////////////////////////////////
/////////////////////////// SERVER ////////////////////////////////////
///////////////////////////////////////////////////////////////////////

var Server = exports.Server = function (_EventEmitter) {
	_inherits(Server, _EventEmitter);

	function Server(options, connectionListener) {
		var _ret2;

		_classCallCheck(this, Server);

		var _this10 = _possibleConstructorReturn(this, (Server.__proto__ || Object.getPrototypeOf(Server)).call(this));

		_this10._host = null;
		_this10._connections = 0;


		if (!(_this10 instanceof Server)) return _ret2 = new Server(options, connectionListener), _possibleConstructorReturn(_this10, _ret2);

		_this10._onError = _this10._onError.bind(_this10);
		_this10._onListen = _this10._onListen.bind(_this10);
		_this10._onConnection = _this10._onConnection.bind(_this10);

		_events.EventEmitter.call(_this10);

		if (typeof options === 'function') {
			connectionListener = options;
			options = {};
			_this10.on('connection', connectionListener);
		} else {
			options = options || {};

			if (typeof connectionListener === 'function') {
				_this10.on('connection', connectionListener);
			}
		}

		_this10._connections = 0;

		_this10._handle = null;
		//this._unref = false;

		_this10.allowHalfOpen = options.allowHalfOpen || false;
		_this10.pauseOnConnect = !!options.pauseOnConnect;

		return _this10;
	}

	_createClass(Server, [{
		key: 'address',
		value: function address() {
			return {
				port: this._port,
				address: this._host,
				family: this._host.indexOf(':') !== -1 ? 'IPv6' : 'IPv4'
			};
		}
	}, {
		key: 'listen',
		value: function listen(port, cb) {
			var _this11 = this;

			if (typeof cb === 'function') {
				this.once('listening', cb);
			}
			if (this._handle) {
				// nodejs allows (accidentally?) calling .listen() multiple times and simply ignores it
				return false;
			}
			// TODO find local IP
			this._host = '::';
			// WinRT needs port (or rather serviceName) to be string
			this._port = port;
			port = port + '';
			this._handle = new StreamSocketListener(port);
			this._handle.addEventListener('connectionreceived', this._onConnection);
			this._handle.bindServiceNameAsync(port).done(this._onListen, function (err) {
				return _this11._onError(err, 'listen', _this11._host, port);
			});
			return this;
		}
	}, {
		key: '_onListen',
		value: function _onListen(foo) {
			//this.emit('listening');
			_process2.default.nextTick(emitListeningNT, this);
		}
	}, {
		key: '_onConnection',
		value: function _onConnection(e) {
			if (this.maxConnections && this._connections >= this.maxConnections) {
				e.socket.close();
				return;
			}

			var socket = new Socket({
				server: this,
				_server: this,
				handle: e.socket,
				allowHalfOpen: this.allowHalfOpen,
				pauseOnCreate: this.pauseOnConnect
			});
			this._connections++;
			this.emit('connection', socket);
		}
	}, {
		key: 'getConnections',
		value: function getConnections(cb) {
			_process2.default.nextTick(cb, null, this._connections);
		}
	}, {
		key: '_onError',
		value: function _onError(err, syscall, address, port) {
			// Clean up a listener if we failed to bind to a port.
			this._destroyHandle();
			// When we close a socket, outstanding async operations will be canceled and the
			// error callbacks called.  There's no point in displaying those errors.
			if (this.destroyed) {
				return;
			}
			//this.emit('error', errnoException(err, syscall, address, port));
			_process2.default.nextTick(emitErrorNT, this, errnoException(err, syscall, address, port));
		}
	}, {
		key: '_destroyHandle',
		value: function _destroyHandle() {
			if (this._handle) {
				// keep handle stored locally for referrence to it's close() when called from cancelIOAsync()
				var handle = this._handle;
				this._handle.cancelIOAsync().done(function () {
					return handle.close();
				}, function () {
					return handle.close();
				});
				this._handle = null;
			}
		}

		// No StreamSocketListener equivalent

	}, {
		key: 'ref',
		value: function ref() {}
	}, {
		key: 'unref',
		value: function unref() {}

		// Stops the server from accepting new connections and keeps existing connections.
		// The server is finally closed when all connections are ended and the server emits a 'close' event.
		// The optional callback will be called once the 'close' event occurs. Unlike that event, it will be called with an Error as its only argument if the server was not open when it was closed.

	}, {
		key: 'close',
		value: function close(cb) {
			if (typeof cb === 'function') {
				if (!this._handle) {
					this.once('close', function () {
						cb(new Error('Not running'));
					});
				} else {
					this.once('close', cb);
				}
			}

			this._destroyHandle();

			this._emitCloseIfDrained();

			return this;
		}
	}, {
		key: '_emitCloseIfDrained',
		value: function _emitCloseIfDrained() {
			if (this._handle || this._connections) {
				return;
			}
			_process2.default.nextTick(emitCloseNT, this);
		}
	}, {
		key: 'listening',
		get: function get() {
			return !!this._handle;
		}
	}]);

	return Server;
}(_events.EventEmitter);

///////////////////////////////////////////////////////////////////////
/////////////////////////// HELPER FUNCTIONS //////////////////////////
///////////////////////////////////////////////////////////////////////

function connectErrorNT(self, err) {
	self.emit('error', err);
	self._destroy();
}

function emitErrorNT(self, err) {
	self.emit('error', err);
}

function emitListeningNT(self) {
	// ensure handle hasn't closed
	if (self._handle) {
		self.emit('listening');
	}
}

function emitCloseNT(self) {
	self.emit('close');
}

var errorCodes = {
	'-2147014835': 'ECONNREFUSED',
	'-2147013895': 'ENOENT',
	'-2147014848': 'EADDRINUSE', // (Address already in use): An attempt to bind a server (net, http, or https) to a local address failed due to another server on the local system already occupying that address.
	'-2147014836': 'ETIMEDOUT',
	'?': 'ECONNREFUSED', // TODO (Connection refused): No connection could be made because the target machine actively refused it. 
	'-2147014842': 'ECONNRESET' // (Connection reset by peer): A connection was forcibly closed by a peer. 
	//EACCES (Permission denied): An attempt was made to access a file in a way forbidden by its file access permissions.
};

function errnoException(err, syscall, address, port) {
	var errname;
	var message;
	if ((typeof err === 'undefined' ? 'undefined' : _typeof(err)) == 'object') {
		errname = errorCodes[err.number] || err.number;
		message = syscall + ' ' + errname + ' ' + err.message;
	} else {
		errname = err;
		message = syscall + ' ' + errname;
	}
	var e = new Error(message);
	e.code = e.errno = errname;
	e.syscall = syscall;
	if (port) {
		e.port = port;
	}
	if (address) {
		e.address = address;
	}
	return e;
}

function createServer(options, connectionListener) {
	return new Server(options, connectionListener);
}

var connect = exports.connect = function connect() {
	for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
		args[_key] = arguments[_key];
	}

	args = normalizeConnectArgs(args);
	var s = new Socket(args[0]);
	return Socket.prototype.connect.apply(s, args);
};
var createConnection = exports.createConnection = connect;

// Returns an array [options] or [options, cb]
// It is the same as the argument of Socket.prototype.connect().
function normalizeConnectArgs(args) {
	var options = {};

	if (args[0] !== null && _typeof(args[0]) === 'object') {
		// connect(options, [cb])
		options = args[0];
	} else {
		// connect(port, [host], [cb])
		options.port = args[0];
		if (typeof args[1] === 'string') {
			options.host = args[1];
		} else {
			options.host = 'localhost';
		}
	}

	var cb = args[args.length - 1];
	return typeof cb === 'function' ? [options, cb] : [options];
}

exports.default = {
	createServer: createServer,
	createConnection: createConnection,
	connect: connect,
	Socket: Socket,
	Server: Server

	// Source: https://developers.google.com/web/fundamentals/input/form/provide-real-time-validation#use-these-attributes-to-validate-input
};
var IPv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
var IPv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;

var isIPv4 = exports.isIPv4 = function isIPv4(ip) {
	return IPv4Regex.test(ip);
};
var isIPv6 = exports.isIPv6 = function isIPv6(ip) {
	return IPv6Regex.test(ip);
};
var isIP = exports.isIP = function isIP(ip) {
	return isIPv4(ip) ? 4 : isIPv6(ip) ? 6 : 0;
};