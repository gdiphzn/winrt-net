'use strict';

System.register(['net', 'buffer', 'stream'], function (_export, _context) {
	"use strict";

	var net, Buffer, stream, _createClass, port, socket, UpperCaseTransformStream, BufferStream;

	function _classCallCheck(instance, Constructor) {
		if (!(instance instanceof Constructor)) {
			throw new TypeError("Cannot call a class as a function");
		}
	}

	function _possibleConstructorReturn(self, call) {
		if (!self) {
			throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
		}

		return call && (typeof call === "object" || typeof call === "function") ? call : self;
	}

	function _inherits(subClass, superClass) {
		if (typeof superClass !== "function" && superClass !== null) {
			throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
		}

		subClass.prototype = Object.create(superClass && superClass.prototype, {
			constructor: {
				value: subClass,
				enumerable: false,
				writable: true,
				configurable: true
			}
		});
		if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
	}

	function readableStreamBuffer(buffer) {
		var theStream = new stream.PassThrough();
		theStream.write(buffer);
		return theStream;
	}

	function winBufferToBuffer(winBuffer) {
		var dataReader = Windows.Storage.Streams.DataReader.fromBuffer(winBuffer);
		var buffer = new Buffer(winBuffer.length);
		dataReader.readBytes(buffer);
		return buffer;
	}

	function fsReadFile(path, callback) {
		var FileIO = Windows.Storage.FileIO;
		var url = new Windows.Foundation.Uri(path);
		Windows.Storage.StorageFile.getFileFromApplicationUriAsync(url).then(function (file) {
			FileIO.readBufferAsync(file).then(function (winBuffer) {
				var buffer = winBufferToBuffer(winBuffer);
				callback(null, buffer);
			});
		});
	}
	return {
		setters: [function (_net) {
			net = _net.default;
		}, function (_buffer) {
			Buffer = _buffer.Buffer;
		}, function (_stream) {
			stream = _stream.default;
		}],
		execute: function () {
			_createClass = function () {
				function defineProperties(target, props) {
					for (var i = 0; i < props.length; i++) {
						var descriptor = props[i];
						descriptor.enumerable = descriptor.enumerable || false;
						descriptor.configurable = true;
						if ("value" in descriptor) descriptor.writable = true;
						Object.defineProperty(target, descriptor.key, descriptor);
					}
				}

				return function (Constructor, protoProps, staticProps) {
					if (protoProps) defineProperties(Constructor.prototype, protoProps);
					if (staticProps) defineProperties(Constructor, staticProps);
					return Constructor;
				};
			}();

			port = 22112;
			socket = new net.Socket();

			socket.connect(port, 'localhost');

			socket.on('connect', function () {
				console.log('# socket connect');
				/*
    	var upper = new Upper();
    	var buffer = new Buffer('hello world, this is test');
    	var bufferStream = new BufferStream(buffer);
    	bufferStream.pipe(upper);
    	upper.pipe(socket);
    */

				fsReadFile('ms-appx:///demo/sampletext1.txt', function (err, buffer) {
					console.log('buffer', buffer);
					socket.write(buffer);
					readableStreamBuffer(buffer).pipe(new UpperCaseTransformStream()).pipe(socket);
					new BufferStream(buffer).pipe(socket);
				});

				/*
    	var theStream = new stream.PassThrough();
    	theStream.pipe(upper);
    	upper.pipe(socket);
    	theStream.push(new Buffer('this is the buffer'));
    	setTimeout(() => {
    		theStream.push('hello world, this is test');
    	}, 10)
    	setTimeout(() => {
    		theStream.push('second message');
    		theStream.push(null);
    	}, 100)
    */
				//upper.pipe(process.stdout);
			});

			socket.on('data', function (data) {
				console.log('# socket data |', data.length);
			});

			socket.on('end', function () {
				console.log('# socket end');
			});

			socket.on('error', function (err) {
				console.log('# socket ERROR');
			});

			socket.on('close', function (err) {
				console.log('# socket close');
			});
			UpperCaseTransformStream = function (_stream$Transform) {
				_inherits(UpperCaseTransformStream, _stream$Transform);

				function UpperCaseTransformStream() {
					_classCallCheck(this, UpperCaseTransformStream);

					return _possibleConstructorReturn(this, (UpperCaseTransformStream.__proto__ || Object.getPrototypeOf(UpperCaseTransformStream)).apply(this, arguments));
				}

				_createClass(UpperCaseTransformStream, [{
					key: '_transform',
					value: function _transform(chunk, enc, cb) {
						var upperChunk = chunk.toString().toUpperCase();
						this.push(upperChunk);
						cb();
					}
				}]);

				return UpperCaseTransformStream;
			}(stream.Transform);

			BufferStream = function (_stream$Readable) {
				_inherits(BufferStream, _stream$Readable);

				function BufferStream(source) {
					_classCallCheck(this, BufferStream);

					var _this2 = _possibleConstructorReturn(this, (BufferStream.__proto__ || Object.getPrototypeOf(BufferStream)).call(this));

					if (!Buffer.isBuffer(source)) {
						throw new Error('Source must be a buffer.');
					}
					_this2._source = source;
					// I keep track of which portion of the source buffer is currently being pushed
					// onto the internal stream buffer during read actions.
					_this2._offset = 0;
					_this2._length = source.length;
					// When the stream has ended, try to clean up the memory references.
					_this2.on('end', _this2._destroy);
					return _this2;
				}

				// I attempt to clean up variable references once the stream has been ended.
				// --
				// NOTE: I am not sure this is necessary. But, I'm trying to be more cognizant of memory
				// usage since my Node.js apps will (eventually) never restart.


				_createClass(BufferStream, [{
					key: '_destroy',
					value: function _destroy() {
						this._source = null;
						this._offset = null;
						this._length = null;
					}
				}, {
					key: '_read',
					value: function _read(size) {
						// If we haven't reached the end of the source buffer, push the next chunk onto
						// the internal stream buffer.
						if (this._offset < this._length) {
							this.push(this._source.slice(this._offset, this._offset + size));
							this._offset += size;
						}
						// If we've consumed the entire source buffer, close the readable stream.
						if (this._offset >= this._length) {
							this.push(null);
						}
					}
				}]);

				return BufferStream;
			}(stream.Readable);
		}
	};
});