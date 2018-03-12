'use strict';

System.register(['net', 'buffer', 'stream'], function (_export, _context) {
	"use strict";

	var net, Buffer, stream, _createClass, port, socket, UpperCaseTransformStream;

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

				fsReadFile('ms-appx:///demo/sampletext1.txt', function (err, buffer) {
					console.log('buffer', buffer);
					socket.write(buffer);
					readableStreamBuffer(buffer).pipe(new UpperCaseTransformStream()).pipe(socket);
				});
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
		}
	};
});