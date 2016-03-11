System.registerDynamic("github:jspm/nodelibs-stream@0.2.0-alpha.json", [], false, function() {
  return {
    "main": "./stream.js",
    "map": {
      "./stream.js": {
        "browser": "stream-browserify"
      }
    }
  };
});

System.registerDynamic("npm:readable-stream@2.0.5/readable.js", ["./lib/_stream_readable.js", "./lib/_stream_writable.js", "./lib/_stream_duplex.js", "./lib/_stream_transform.js", "./lib/_stream_passthrough.js", "process"], true, function($__require, exports, module) {
  var process = $__require("process");
  var define;
  var global = this;
  var GLOBAL = this;
  var Stream = (function() {
    try {
      return $__require('st' + 'ream');
    } catch (_) {}
  }());
  exports = module.exports = $__require('./lib/_stream_readable.js');
  exports.Stream = Stream || exports;
  exports.Readable = exports;
  exports.Writable = $__require('./lib/_stream_writable.js');
  exports.Duplex = $__require('./lib/_stream_duplex.js');
  exports.Transform = $__require('./lib/_stream_transform.js');
  exports.PassThrough = $__require('./lib/_stream_passthrough.js');
  return module.exports;
});

System.registerDynamic("npm:readable-stream@2.0.5/writable.js", ["./lib/_stream_writable.js", "process"], true, function($__require, exports, module) {
  var process = $__require("process");
  var define;
  var global = this;
  var GLOBAL = this;
  module.exports = $__require('./lib/_stream_writable.js');
  return module.exports;
});

System.registerDynamic("npm:readable-stream@2.0.5/duplex.js", ["./lib/_stream_duplex.js", "process"], true, function($__require, exports, module) {
  var process = $__require("process");
  var define;
  var global = this;
  var GLOBAL = this;
  module.exports = $__require('./lib/_stream_duplex.js');
  return module.exports;
});

System.registerDynamic("npm:readable-stream@2.0.5/transform.js", ["./lib/_stream_transform.js", "process"], true, function($__require, exports, module) {
  var process = $__require("process");
  var define;
  var global = this;
  var GLOBAL = this;
  module.exports = $__require('./lib/_stream_transform.js');
  return module.exports;
});

System.registerDynamic("npm:isarray@0.0.1.json", [], false, function() {
  return {
    "main": "index.js",
    "format": "cjs",
    "meta": {
      "*": {
        "globals": {
          "process": "process"
        }
      },
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:isarray@0.0.1/index.js", ["process"], true, function($__require, exports, module) {
  var process = $__require("process");
  var define;
  var global = this;
  var GLOBAL = this;
  module.exports = Array.isArray || function(arr) {
    return Object.prototype.toString.call(arr) == '[object Array]';
  };
  return module.exports;
});

System.registerDynamic("npm:string_decoder@0.10.31.json", [], false, function() {
  return {
    "main": "index.js",
    "format": "cjs",
    "meta": {
      "*": {
        "globals": {
          "process": "process"
        }
      },
      "*.json": {
        "format": "json"
      },
      "index.js": {
        "globals": {
          "Buffer": "buffer/global"
        }
      }
    }
  };
});

System.registerDynamic("npm:string_decoder@0.10.31/index.js", ["buffer", "process", "buffer/global"], true, function($__require, exports, module) {
  var process = $__require("process"),
      Buffer = $__require("buffer/global");
  var define;
  var global = this;
  var GLOBAL = this;
  var Buffer = $__require('buffer').Buffer;
  var isBufferEncoding = Buffer.isEncoding || function(encoding) {
    switch (encoding && encoding.toLowerCase()) {
      case 'hex':
      case 'utf8':
      case 'utf-8':
      case 'ascii':
      case 'binary':
      case 'base64':
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
      case 'raw':
        return true;
      default:
        return false;
    }
  };
  function assertEncoding(encoding) {
    if (encoding && !isBufferEncoding(encoding)) {
      throw new Error('Unknown encoding: ' + encoding);
    }
  }
  var StringDecoder = exports.StringDecoder = function(encoding) {
    this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
    assertEncoding(encoding);
    switch (this.encoding) {
      case 'utf8':
        this.surrogateSize = 3;
        break;
      case 'ucs2':
      case 'utf16le':
        this.surrogateSize = 2;
        this.detectIncompleteChar = utf16DetectIncompleteChar;
        break;
      case 'base64':
        this.surrogateSize = 3;
        this.detectIncompleteChar = base64DetectIncompleteChar;
        break;
      default:
        this.write = passThroughWrite;
        return;
    }
    this.charBuffer = new Buffer(6);
    this.charReceived = 0;
    this.charLength = 0;
  };
  StringDecoder.prototype.write = function(buffer) {
    var charStr = '';
    while (this.charLength) {
      var available = (buffer.length >= this.charLength - this.charReceived) ? this.charLength - this.charReceived : buffer.length;
      buffer.copy(this.charBuffer, this.charReceived, 0, available);
      this.charReceived += available;
      if (this.charReceived < this.charLength) {
        return '';
      }
      buffer = buffer.slice(available, buffer.length);
      charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);
      var charCode = charStr.charCodeAt(charStr.length - 1);
      if (charCode >= 0xD800 && charCode <= 0xDBFF) {
        this.charLength += this.surrogateSize;
        charStr = '';
        continue;
      }
      this.charReceived = this.charLength = 0;
      if (buffer.length === 0) {
        return charStr;
      }
      break;
    }
    this.detectIncompleteChar(buffer);
    var end = buffer.length;
    if (this.charLength) {
      buffer.copy(this.charBuffer, 0, buffer.length - this.charReceived, end);
      end -= this.charReceived;
    }
    charStr += buffer.toString(this.encoding, 0, end);
    var end = charStr.length - 1;
    var charCode = charStr.charCodeAt(end);
    if (charCode >= 0xD800 && charCode <= 0xDBFF) {
      var size = this.surrogateSize;
      this.charLength += size;
      this.charReceived += size;
      this.charBuffer.copy(this.charBuffer, size, 0, size);
      buffer.copy(this.charBuffer, 0, 0, size);
      return charStr.substring(0, end);
    }
    return charStr;
  };
  StringDecoder.prototype.detectIncompleteChar = function(buffer) {
    var i = (buffer.length >= 3) ? 3 : buffer.length;
    for (; i > 0; i--) {
      var c = buffer[buffer.length - i];
      if (i == 1 && c >> 5 == 0x06) {
        this.charLength = 2;
        break;
      }
      if (i <= 2 && c >> 4 == 0x0E) {
        this.charLength = 3;
        break;
      }
      if (i <= 3 && c >> 3 == 0x1E) {
        this.charLength = 4;
        break;
      }
    }
    this.charReceived = i;
  };
  StringDecoder.prototype.end = function(buffer) {
    var res = '';
    if (buffer && buffer.length)
      res = this.write(buffer);
    if (this.charReceived) {
      var cr = this.charReceived;
      var buf = this.charBuffer;
      var enc = this.encoding;
      res += buf.slice(0, cr).toString(enc);
    }
    return res;
  };
  function passThroughWrite(buffer) {
    return buffer.toString(this.encoding);
  }
  function utf16DetectIncompleteChar(buffer) {
    this.charReceived = buffer.length % 2;
    this.charLength = this.charReceived ? 2 : 0;
  }
  function base64DetectIncompleteChar(buffer) {
    this.charReceived = buffer.length % 3;
    this.charLength = this.charReceived ? 3 : 0;
  }
  return module.exports;
});

System.registerDynamic("npm:readable-stream@2.0.5/lib/_stream_readable.js", ["process-nextick-args", "isarray", "buffer", "events", "core-util-is", "inherits", "util", "./_stream_duplex", "string_decoder", "process", "buffer/global"], true, function($__require, exports, module) {
  "use strict";
  var process = $__require("process"),
      Buffer = $__require("buffer/global");
  var define;
  var global = this;
  var GLOBAL = this;
  module.exports = Readable;
  var processNextTick = $__require('process-nextick-args');
  var isArray = $__require('isarray');
  var Buffer = $__require('buffer').Buffer;
  Readable.ReadableState = ReadableState;
  var EE = $__require('events');
  var EElistenerCount = function(emitter, type) {
    return emitter.listeners(type).length;
  };
  var Stream;
  (function() {
    try {
      Stream = $__require('st' + 'ream');
    } catch (_) {} finally {
      if (!Stream)
        Stream = $__require('events').EventEmitter;
    }
  }());
  var Buffer = $__require('buffer').Buffer;
  var util = $__require('core-util-is');
  util.inherits = $__require('inherits');
  var debugUtil = $__require('util');
  var debug;
  if (debugUtil && debugUtil.debuglog) {
    debug = debugUtil.debuglog('stream');
  } else {
    debug = function() {};
  }
  var StringDecoder;
  util.inherits(Readable, Stream);
  var Duplex;
  function ReadableState(options, stream) {
    Duplex = Duplex || $__require('./_stream_duplex');
    options = options || {};
    this.objectMode = !!options.objectMode;
    if (stream instanceof Duplex)
      this.objectMode = this.objectMode || !!options.readableObjectMode;
    var hwm = options.highWaterMark;
    var defaultHwm = this.objectMode ? 16 : 16 * 1024;
    this.highWaterMark = (hwm || hwm === 0) ? hwm : defaultHwm;
    this.highWaterMark = ~~this.highWaterMark;
    this.buffer = [];
    this.length = 0;
    this.pipes = null;
    this.pipesCount = 0;
    this.flowing = null;
    this.ended = false;
    this.endEmitted = false;
    this.reading = false;
    this.sync = true;
    this.needReadable = false;
    this.emittedReadable = false;
    this.readableListening = false;
    this.defaultEncoding = options.defaultEncoding || 'utf8';
    this.ranOut = false;
    this.awaitDrain = 0;
    this.readingMore = false;
    this.decoder = null;
    this.encoding = null;
    if (options.encoding) {
      if (!StringDecoder)
        StringDecoder = $__require('string_decoder').StringDecoder;
      this.decoder = new StringDecoder(options.encoding);
      this.encoding = options.encoding;
    }
  }
  var Duplex;
  function Readable(options) {
    Duplex = Duplex || $__require('./_stream_duplex');
    if (!(this instanceof Readable))
      return new Readable(options);
    this._readableState = new ReadableState(options, this);
    this.readable = true;
    if (options && typeof options.read === 'function')
      this._read = options.read;
    Stream.call(this);
  }
  Readable.prototype.push = function(chunk, encoding) {
    var state = this._readableState;
    if (!state.objectMode && typeof chunk === 'string') {
      encoding = encoding || state.defaultEncoding;
      if (encoding !== state.encoding) {
        chunk = new Buffer(chunk, encoding);
        encoding = '';
      }
    }
    return readableAddChunk(this, state, chunk, encoding, false);
  };
  Readable.prototype.unshift = function(chunk) {
    var state = this._readableState;
    return readableAddChunk(this, state, chunk, '', true);
  };
  Readable.prototype.isPaused = function() {
    return this._readableState.flowing === false;
  };
  function readableAddChunk(stream, state, chunk, encoding, addToFront) {
    var er = chunkInvalid(state, chunk);
    if (er) {
      stream.emit('error', er);
    } else if (chunk === null) {
      state.reading = false;
      onEofChunk(stream, state);
    } else if (state.objectMode || chunk && chunk.length > 0) {
      if (state.ended && !addToFront) {
        var e = new Error('stream.push() after EOF');
        stream.emit('error', e);
      } else if (state.endEmitted && addToFront) {
        var e = new Error('stream.unshift() after end event');
        stream.emit('error', e);
      } else {
        if (state.decoder && !addToFront && !encoding)
          chunk = state.decoder.write(chunk);
        if (!addToFront)
          state.reading = false;
        if (state.flowing && state.length === 0 && !state.sync) {
          stream.emit('data', chunk);
          stream.read(0);
        } else {
          state.length += state.objectMode ? 1 : chunk.length;
          if (addToFront)
            state.buffer.unshift(chunk);
          else
            state.buffer.push(chunk);
          if (state.needReadable)
            emitReadable(stream);
        }
        maybeReadMore(stream, state);
      }
    } else if (!addToFront) {
      state.reading = false;
    }
    return needMoreData(state);
  }
  function needMoreData(state) {
    return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
  }
  Readable.prototype.setEncoding = function(enc) {
    if (!StringDecoder)
      StringDecoder = $__require('string_decoder').StringDecoder;
    this._readableState.decoder = new StringDecoder(enc);
    this._readableState.encoding = enc;
    return this;
  };
  var MAX_HWM = 0x800000;
  function computeNewHighWaterMark(n) {
    if (n >= MAX_HWM) {
      n = MAX_HWM;
    } else {
      n--;
      n |= n >>> 1;
      n |= n >>> 2;
      n |= n >>> 4;
      n |= n >>> 8;
      n |= n >>> 16;
      n++;
    }
    return n;
  }
  function howMuchToRead(n, state) {
    if (state.length === 0 && state.ended)
      return 0;
    if (state.objectMode)
      return n === 0 ? 0 : 1;
    if (n === null || isNaN(n)) {
      if (state.flowing && state.buffer.length)
        return state.buffer[0].length;
      else
        return state.length;
    }
    if (n <= 0)
      return 0;
    if (n > state.highWaterMark)
      state.highWaterMark = computeNewHighWaterMark(n);
    if (n > state.length) {
      if (!state.ended) {
        state.needReadable = true;
        return 0;
      } else {
        return state.length;
      }
    }
    return n;
  }
  Readable.prototype.read = function(n) {
    debug('read', n);
    var state = this._readableState;
    var nOrig = n;
    if (typeof n !== 'number' || n > 0)
      state.emittedReadable = false;
    if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
      debug('read: emitReadable', state.length, state.ended);
      if (state.length === 0 && state.ended)
        endReadable(this);
      else
        emitReadable(this);
      return null;
    }
    n = howMuchToRead(n, state);
    if (n === 0 && state.ended) {
      if (state.length === 0)
        endReadable(this);
      return null;
    }
    var doRead = state.needReadable;
    debug('need readable', doRead);
    if (state.length === 0 || state.length - n < state.highWaterMark) {
      doRead = true;
      debug('length less than watermark', doRead);
    }
    if (state.ended || state.reading) {
      doRead = false;
      debug('reading or ended', doRead);
    }
    if (doRead) {
      debug('do read');
      state.reading = true;
      state.sync = true;
      if (state.length === 0)
        state.needReadable = true;
      this._read(state.highWaterMark);
      state.sync = false;
    }
    if (doRead && !state.reading)
      n = howMuchToRead(nOrig, state);
    var ret;
    if (n > 0)
      ret = fromList(n, state);
    else
      ret = null;
    if (ret === null) {
      state.needReadable = true;
      n = 0;
    }
    state.length -= n;
    if (state.length === 0 && !state.ended)
      state.needReadable = true;
    if (nOrig !== n && state.ended && state.length === 0)
      endReadable(this);
    if (ret !== null)
      this.emit('data', ret);
    return ret;
  };
  function chunkInvalid(state, chunk) {
    var er = null;
    if (!(Buffer.isBuffer(chunk)) && typeof chunk !== 'string' && chunk !== null && chunk !== undefined && !state.objectMode) {
      er = new TypeError('Invalid non-string/buffer chunk');
    }
    return er;
  }
  function onEofChunk(stream, state) {
    if (state.ended)
      return;
    if (state.decoder) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) {
        state.buffer.push(chunk);
        state.length += state.objectMode ? 1 : chunk.length;
      }
    }
    state.ended = true;
    emitReadable(stream);
  }
  function emitReadable(stream) {
    var state = stream._readableState;
    state.needReadable = false;
    if (!state.emittedReadable) {
      debug('emitReadable', state.flowing);
      state.emittedReadable = true;
      if (state.sync)
        processNextTick(emitReadable_, stream);
      else
        emitReadable_(stream);
    }
  }
  function emitReadable_(stream) {
    debug('emit readable');
    stream.emit('readable');
    flow(stream);
  }
  function maybeReadMore(stream, state) {
    if (!state.readingMore) {
      state.readingMore = true;
      processNextTick(maybeReadMore_, stream, state);
    }
  }
  function maybeReadMore_(stream, state) {
    var len = state.length;
    while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
      debug('maybeReadMore read 0');
      stream.read(0);
      if (len === state.length)
        break;
      else
        len = state.length;
    }
    state.readingMore = false;
  }
  Readable.prototype._read = function(n) {
    this.emit('error', new Error('not implemented'));
  };
  Readable.prototype.pipe = function(dest, pipeOpts) {
    var src = this;
    var state = this._readableState;
    switch (state.pipesCount) {
      case 0:
        state.pipes = dest;
        break;
      case 1:
        state.pipes = [state.pipes, dest];
        break;
      default:
        state.pipes.push(dest);
        break;
    }
    state.pipesCount += 1;
    debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);
    var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;
    var endFn = doEnd ? onend : cleanup;
    if (state.endEmitted)
      processNextTick(endFn);
    else
      src.once('end', endFn);
    dest.on('unpipe', onunpipe);
    function onunpipe(readable) {
      debug('onunpipe');
      if (readable === src) {
        cleanup();
      }
    }
    function onend() {
      debug('onend');
      dest.end();
    }
    var ondrain = pipeOnDrain(src);
    dest.on('drain', ondrain);
    var cleanedUp = false;
    function cleanup() {
      debug('cleanup');
      dest.removeListener('close', onclose);
      dest.removeListener('finish', onfinish);
      dest.removeListener('drain', ondrain);
      dest.removeListener('error', onerror);
      dest.removeListener('unpipe', onunpipe);
      src.removeListener('end', onend);
      src.removeListener('end', cleanup);
      src.removeListener('data', ondata);
      cleanedUp = true;
      if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain))
        ondrain();
    }
    src.on('data', ondata);
    function ondata(chunk) {
      debug('ondata');
      var ret = dest.write(chunk);
      if (false === ret) {
        if (state.pipesCount === 1 && state.pipes[0] === dest && src.listenerCount('data') === 1 && !cleanedUp) {
          debug('false write response, pause', src._readableState.awaitDrain);
          src._readableState.awaitDrain++;
        }
        src.pause();
      }
    }
    function onerror(er) {
      debug('onerror', er);
      unpipe();
      dest.removeListener('error', onerror);
      if (EElistenerCount(dest, 'error') === 0)
        dest.emit('error', er);
    }
    if (!dest._events || !dest._events.error)
      dest.on('error', onerror);
    else if (isArray(dest._events.error))
      dest._events.error.unshift(onerror);
    else
      dest._events.error = [onerror, dest._events.error];
    function onclose() {
      dest.removeListener('finish', onfinish);
      unpipe();
    }
    dest.once('close', onclose);
    function onfinish() {
      debug('onfinish');
      dest.removeListener('close', onclose);
      unpipe();
    }
    dest.once('finish', onfinish);
    function unpipe() {
      debug('unpipe');
      src.unpipe(dest);
    }
    dest.emit('pipe', src);
    if (!state.flowing) {
      debug('pipe resume');
      src.resume();
    }
    return dest;
  };
  function pipeOnDrain(src) {
    return function() {
      var state = src._readableState;
      debug('pipeOnDrain', state.awaitDrain);
      if (state.awaitDrain)
        state.awaitDrain--;
      if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
        state.flowing = true;
        flow(src);
      }
    };
  }
  Readable.prototype.unpipe = function(dest) {
    var state = this._readableState;
    if (state.pipesCount === 0)
      return this;
    if (state.pipesCount === 1) {
      if (dest && dest !== state.pipes)
        return this;
      if (!dest)
        dest = state.pipes;
      state.pipes = null;
      state.pipesCount = 0;
      state.flowing = false;
      if (dest)
        dest.emit('unpipe', this);
      return this;
    }
    if (!dest) {
      var dests = state.pipes;
      var len = state.pipesCount;
      state.pipes = null;
      state.pipesCount = 0;
      state.flowing = false;
      for (var i = 0; i < len; i++)
        dests[i].emit('unpipe', this);
      return this;
    }
    var i = indexOf(state.pipes, dest);
    if (i === -1)
      return this;
    state.pipes.splice(i, 1);
    state.pipesCount -= 1;
    if (state.pipesCount === 1)
      state.pipes = state.pipes[0];
    dest.emit('unpipe', this);
    return this;
  };
  Readable.prototype.on = function(ev, fn) {
    var res = Stream.prototype.on.call(this, ev, fn);
    if (ev === 'data' && false !== this._readableState.flowing) {
      this.resume();
    }
    if (ev === 'readable' && this.readable) {
      var state = this._readableState;
      if (!state.readableListening) {
        state.readableListening = true;
        state.emittedReadable = false;
        state.needReadable = true;
        if (!state.reading) {
          processNextTick(nReadingNextTick, this);
        } else if (state.length) {
          emitReadable(this, state);
        }
      }
    }
    return res;
  };
  Readable.prototype.addListener = Readable.prototype.on;
  function nReadingNextTick(self) {
    debug('readable nexttick read 0');
    self.read(0);
  }
  Readable.prototype.resume = function() {
    var state = this._readableState;
    if (!state.flowing) {
      debug('resume');
      state.flowing = true;
      resume(this, state);
    }
    return this;
  };
  function resume(stream, state) {
    if (!state.resumeScheduled) {
      state.resumeScheduled = true;
      processNextTick(resume_, stream, state);
    }
  }
  function resume_(stream, state) {
    if (!state.reading) {
      debug('resume read 0');
      stream.read(0);
    }
    state.resumeScheduled = false;
    stream.emit('resume');
    flow(stream);
    if (state.flowing && !state.reading)
      stream.read(0);
  }
  Readable.prototype.pause = function() {
    debug('call pause flowing=%j', this._readableState.flowing);
    if (false !== this._readableState.flowing) {
      debug('pause');
      this._readableState.flowing = false;
      this.emit('pause');
    }
    return this;
  };
  function flow(stream) {
    var state = stream._readableState;
    debug('flow', state.flowing);
    if (state.flowing) {
      do {
        var chunk = stream.read();
      } while (null !== chunk && state.flowing);
    }
  }
  Readable.prototype.wrap = function(stream) {
    var state = this._readableState;
    var paused = false;
    var self = this;
    stream.on('end', function() {
      debug('wrapped end');
      if (state.decoder && !state.ended) {
        var chunk = state.decoder.end();
        if (chunk && chunk.length)
          self.push(chunk);
      }
      self.push(null);
    });
    stream.on('data', function(chunk) {
      debug('wrapped data');
      if (state.decoder)
        chunk = state.decoder.write(chunk);
      if (state.objectMode && (chunk === null || chunk === undefined))
        return;
      else if (!state.objectMode && (!chunk || !chunk.length))
        return;
      var ret = self.push(chunk);
      if (!ret) {
        paused = true;
        stream.pause();
      }
    });
    for (var i in stream) {
      if (this[i] === undefined && typeof stream[i] === 'function') {
        this[i] = function(method) {
          return function() {
            return stream[method].apply(stream, arguments);
          };
        }(i);
      }
    }
    var events = ['error', 'close', 'destroy', 'pause', 'resume'];
    forEach(events, function(ev) {
      stream.on(ev, self.emit.bind(self, ev));
    });
    self._read = function(n) {
      debug('wrapped _read', n);
      if (paused) {
        paused = false;
        stream.resume();
      }
    };
    return self;
  };
  Readable._fromList = fromList;
  function fromList(n, state) {
    var list = state.buffer;
    var length = state.length;
    var stringMode = !!state.decoder;
    var objectMode = !!state.objectMode;
    var ret;
    if (list.length === 0)
      return null;
    if (length === 0)
      ret = null;
    else if (objectMode)
      ret = list.shift();
    else if (!n || n >= length) {
      if (stringMode)
        ret = list.join('');
      else if (list.length === 1)
        ret = list[0];
      else
        ret = Buffer.concat(list, length);
      list.length = 0;
    } else {
      if (n < list[0].length) {
        var buf = list[0];
        ret = buf.slice(0, n);
        list[0] = buf.slice(n);
      } else if (n === list[0].length) {
        ret = list.shift();
      } else {
        if (stringMode)
          ret = '';
        else
          ret = new Buffer(n);
        var c = 0;
        for (var i = 0,
            l = list.length; i < l && c < n; i++) {
          var buf = list[0];
          var cpy = Math.min(n - c, buf.length);
          if (stringMode)
            ret += buf.slice(0, cpy);
          else
            buf.copy(ret, c, 0, cpy);
          if (cpy < buf.length)
            list[0] = buf.slice(cpy);
          else
            list.shift();
          c += cpy;
        }
      }
    }
    return ret;
  }
  function endReadable(stream) {
    var state = stream._readableState;
    if (state.length > 0)
      throw new Error('endReadable called on non-empty stream');
    if (!state.endEmitted) {
      state.ended = true;
      processNextTick(endReadableNT, state, stream);
    }
  }
  function endReadableNT(state, stream) {
    if (!state.endEmitted && state.length === 0) {
      state.endEmitted = true;
      stream.readable = false;
      stream.emit('end');
    }
  }
  function forEach(xs, f) {
    for (var i = 0,
        l = xs.length; i < l; i++) {
      f(xs[i], i);
    }
  }
  function indexOf(xs, x) {
    for (var i = 0,
        l = xs.length; i < l; i++) {
      if (xs[i] === x)
        return i;
    }
    return -1;
  }
  return module.exports;
});

System.registerDynamic("npm:process-nextick-args@1.0.6.json", [], false, function() {
  return {
    "main": "index.js",
    "format": "cjs",
    "meta": {
      "*": {
        "globals": {
          "process": "process"
        }
      },
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:process-nextick-args@1.0.6/index.js", ["process"], true, function($__require, exports, module) {
  "use strict";
  var process = $__require("process");
  var define;
  var global = this;
  var GLOBAL = this;
  if (!process.version || process.version.indexOf('v0.') === 0 || process.version.indexOf('v1.') === 0 && process.version.indexOf('v1.8.') !== 0) {
    module.exports = nextTick;
  } else {
    module.exports = process.nextTick;
  }
  function nextTick(fn) {
    var args = new Array(arguments.length - 1);
    var i = 0;
    while (i < args.length) {
      args[i++] = arguments[i];
    }
    process.nextTick(function afterTick() {
      fn.apply(null, args);
    });
  }
  return module.exports;
});

System.registerDynamic("npm:util-deprecate@1.0.2.json", [], false, function() {
  return {
    "main": "node.js",
    "format": "cjs",
    "meta": {
      "*": {
        "globals": {
          "process": "process"
        }
      },
      "*.json": {
        "format": "json"
      }
    },
    "map": {
      "./node.js": {
        "browser": "./browser.js"
      }
    }
  };
});

System.registerDynamic("npm:util-deprecate@1.0.2/browser.js", ["process"], true, function($__require, exports, module) {
  var process = $__require("process");
  var define;
  var global = this;
  var GLOBAL = this;
  module.exports = deprecate;
  function deprecate(fn, msg) {
    if (config('noDeprecation')) {
      return fn;
    }
    var warned = false;
    function deprecated() {
      if (!warned) {
        if (config('throwDeprecation')) {
          throw new Error(msg);
        } else if (config('traceDeprecation')) {
          console.trace(msg);
        } else {
          console.warn(msg);
        }
        warned = true;
      }
      return fn.apply(this, arguments);
    }
    return deprecated;
  }
  function config(name) {
    try {
      if (!global.localStorage)
        return false;
    } catch (_) {
      return false;
    }
    var val = global.localStorage[name];
    if (null == val)
      return false;
    return String(val).toLowerCase() === 'true';
  }
  return module.exports;
});

System.registerDynamic("github:jspm/nodelibs-events@0.2.0-alpha.json", [], false, function() {
  return {
    "main": "./events.js"
  };
});

System.registerDynamic("github:jspm/nodelibs-events@0.2.0-alpha/events.js", [], true, function($__require, exports, module) {
  ;
  var define;
  var global = this;
  var GLOBAL = this;
  function EventEmitter() {
    this._events = this._events || {};
    this._maxListeners = this._maxListeners || undefined;
  }
  module.exports = EventEmitter;
  EventEmitter.EventEmitter = EventEmitter;
  EventEmitter.prototype._events = undefined;
  EventEmitter.prototype._maxListeners = undefined;
  EventEmitter.defaultMaxListeners = 10;
  EventEmitter.prototype.setMaxListeners = function(n) {
    if (!isNumber(n) || n < 0 || isNaN(n))
      throw TypeError('n must be a positive number');
    this._maxListeners = n;
    return this;
  };
  EventEmitter.prototype.emit = function(type) {
    var er,
        handler,
        len,
        args,
        i,
        listeners;
    if (!this._events)
      this._events = {};
    if (type === 'error') {
      if (!this._events.error || (isObject(this._events.error) && !this._events.error.length)) {
        er = arguments[1];
        if (er instanceof Error) {
          throw er;
        }
        throw TypeError('Uncaught, unspecified "error" event.');
      }
    }
    handler = this._events[type];
    if (isUndefined(handler))
      return false;
    if (isFunction(handler)) {
      switch (arguments.length) {
        case 1:
          handler.call(this);
          break;
        case 2:
          handler.call(this, arguments[1]);
          break;
        case 3:
          handler.call(this, arguments[1], arguments[2]);
          break;
        default:
          args = Array.prototype.slice.call(arguments, 1);
          handler.apply(this, args);
      }
    } else if (isObject(handler)) {
      args = Array.prototype.slice.call(arguments, 1);
      listeners = handler.slice();
      len = listeners.length;
      for (i = 0; i < len; i++)
        listeners[i].apply(this, args);
    }
    return true;
  };
  EventEmitter.prototype.addListener = function(type, listener) {
    var m;
    if (!isFunction(listener))
      throw TypeError('listener must be a function');
    if (!this._events)
      this._events = {};
    if (this._events.newListener)
      this.emit('newListener', type, isFunction(listener.listener) ? listener.listener : listener);
    if (!this._events[type])
      this._events[type] = listener;
    else if (isObject(this._events[type]))
      this._events[type].push(listener);
    else
      this._events[type] = [this._events[type], listener];
    if (isObject(this._events[type]) && !this._events[type].warned) {
      if (!isUndefined(this._maxListeners)) {
        m = this._maxListeners;
      } else {
        m = EventEmitter.defaultMaxListeners;
      }
      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' + 'leak detected. %d listeners added. ' + 'Use emitter.setMaxListeners() to increase limit.', this._events[type].length);
        if (typeof console.trace === 'function') {
          console.trace();
        }
      }
    }
    return this;
  };
  EventEmitter.prototype.on = EventEmitter.prototype.addListener;
  EventEmitter.prototype.once = function(type, listener) {
    if (!isFunction(listener))
      throw TypeError('listener must be a function');
    var fired = false;
    function g() {
      this.removeListener(type, g);
      if (!fired) {
        fired = true;
        listener.apply(this, arguments);
      }
    }
    g.listener = listener;
    this.on(type, g);
    return this;
  };
  EventEmitter.prototype.removeListener = function(type, listener) {
    var list,
        position,
        length,
        i;
    if (!isFunction(listener))
      throw TypeError('listener must be a function');
    if (!this._events || !this._events[type])
      return this;
    list = this._events[type];
    length = list.length;
    position = -1;
    if (list === listener || (isFunction(list.listener) && list.listener === listener)) {
      delete this._events[type];
      if (this._events.removeListener)
        this.emit('removeListener', type, listener);
    } else if (isObject(list)) {
      for (i = length; i-- > 0; ) {
        if (list[i] === listener || (list[i].listener && list[i].listener === listener)) {
          position = i;
          break;
        }
      }
      if (position < 0)
        return this;
      if (list.length === 1) {
        list.length = 0;
        delete this._events[type];
      } else {
        list.splice(position, 1);
      }
      if (this._events.removeListener)
        this.emit('removeListener', type, listener);
    }
    return this;
  };
  EventEmitter.prototype.removeAllListeners = function(type) {
    var key,
        listeners;
    if (!this._events)
      return this;
    if (!this._events.removeListener) {
      if (arguments.length === 0)
        this._events = {};
      else if (this._events[type])
        delete this._events[type];
      return this;
    }
    if (arguments.length === 0) {
      for (key in this._events) {
        if (key === 'removeListener')
          continue;
        this.removeAllListeners(key);
      }
      this.removeAllListeners('removeListener');
      this._events = {};
      return this;
    }
    listeners = this._events[type];
    if (isFunction(listeners)) {
      this.removeListener(type, listeners);
    } else if (listeners) {
      while (listeners.length)
        this.removeListener(type, listeners[listeners.length - 1]);
    }
    delete this._events[type];
    return this;
  };
  EventEmitter.prototype.listeners = function(type) {
    var ret;
    if (!this._events || !this._events[type])
      ret = [];
    else if (isFunction(this._events[type]))
      ret = [this._events[type]];
    else
      ret = this._events[type].slice();
    return ret;
  };
  EventEmitter.prototype.listenerCount = function(type) {
    if (this._events) {
      var evlistener = this._events[type];
      if (isFunction(evlistener))
        return 1;
      else if (evlistener)
        return evlistener.length;
    }
    return 0;
  };
  EventEmitter.listenerCount = function(emitter, type) {
    return emitter.listenerCount(type);
  };
  function isFunction(arg) {
    return typeof arg === 'function';
  }
  function isNumber(arg) {
    return typeof arg === 'number';
  }
  function isObject(arg) {
    return typeof arg === 'object' && arg !== null;
  }
  function isUndefined(arg) {
    return arg === void 0;
  }
  return module.exports;
});

System.registerDynamic("npm:readable-stream@2.0.5/lib/_stream_writable.js", ["process-nextick-args", "buffer", "core-util-is", "inherits", "util-deprecate", "events", "./_stream_duplex", "process", "buffer/global"], true, function($__require, exports, module) {
  "use strict";
  var process = $__require("process"),
      Buffer = $__require("buffer/global");
  var define;
  var global = this;
  var GLOBAL = this;
  module.exports = Writable;
  var processNextTick = $__require('process-nextick-args');
  var Buffer = $__require('buffer').Buffer;
  Writable.WritableState = WritableState;
  var util = $__require('core-util-is');
  util.inherits = $__require('inherits');
  var internalUtil = {deprecate: $__require('util-deprecate')};
  var Stream;
  (function() {
    try {
      Stream = $__require('st' + 'ream');
    } catch (_) {} finally {
      if (!Stream)
        Stream = $__require('events').EventEmitter;
    }
  }());
  var Buffer = $__require('buffer').Buffer;
  util.inherits(Writable, Stream);
  function nop() {}
  function WriteReq(chunk, encoding, cb) {
    this.chunk = chunk;
    this.encoding = encoding;
    this.callback = cb;
    this.next = null;
  }
  var Duplex;
  function WritableState(options, stream) {
    Duplex = Duplex || $__require('./_stream_duplex');
    options = options || {};
    this.objectMode = !!options.objectMode;
    if (stream instanceof Duplex)
      this.objectMode = this.objectMode || !!options.writableObjectMode;
    var hwm = options.highWaterMark;
    var defaultHwm = this.objectMode ? 16 : 16 * 1024;
    this.highWaterMark = (hwm || hwm === 0) ? hwm : defaultHwm;
    this.highWaterMark = ~~this.highWaterMark;
    this.needDrain = false;
    this.ending = false;
    this.ended = false;
    this.finished = false;
    var noDecode = options.decodeStrings === false;
    this.decodeStrings = !noDecode;
    this.defaultEncoding = options.defaultEncoding || 'utf8';
    this.length = 0;
    this.writing = false;
    this.corked = 0;
    this.sync = true;
    this.bufferProcessing = false;
    this.onwrite = function(er) {
      onwrite(stream, er);
    };
    this.writecb = null;
    this.writelen = 0;
    this.bufferedRequest = null;
    this.lastBufferedRequest = null;
    this.pendingcb = 0;
    this.prefinished = false;
    this.errorEmitted = false;
  }
  WritableState.prototype.getBuffer = function writableStateGetBuffer() {
    var current = this.bufferedRequest;
    var out = [];
    while (current) {
      out.push(current);
      current = current.next;
    }
    return out;
  };
  (function() {
    try {
      Object.defineProperty(WritableState.prototype, 'buffer', {get: internalUtil.deprecate(function() {
          return this.getBuffer();
        }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.')});
    } catch (_) {}
  }());
  var Duplex;
  function Writable(options) {
    Duplex = Duplex || $__require('./_stream_duplex');
    if (!(this instanceof Writable) && !(this instanceof Duplex))
      return new Writable(options);
    this._writableState = new WritableState(options, this);
    this.writable = true;
    if (options) {
      if (typeof options.write === 'function')
        this._write = options.write;
      if (typeof options.writev === 'function')
        this._writev = options.writev;
    }
    Stream.call(this);
  }
  Writable.prototype.pipe = function() {
    this.emit('error', new Error('Cannot pipe. Not readable.'));
  };
  function writeAfterEnd(stream, cb) {
    var er = new Error('write after end');
    stream.emit('error', er);
    processNextTick(cb, er);
  }
  function validChunk(stream, state, chunk, cb) {
    var valid = true;
    if (!(Buffer.isBuffer(chunk)) && typeof chunk !== 'string' && chunk !== null && chunk !== undefined && !state.objectMode) {
      var er = new TypeError('Invalid non-string/buffer chunk');
      stream.emit('error', er);
      processNextTick(cb, er);
      valid = false;
    }
    return valid;
  }
  Writable.prototype.write = function(chunk, encoding, cb) {
    var state = this._writableState;
    var ret = false;
    if (typeof encoding === 'function') {
      cb = encoding;
      encoding = null;
    }
    if (Buffer.isBuffer(chunk))
      encoding = 'buffer';
    else if (!encoding)
      encoding = state.defaultEncoding;
    if (typeof cb !== 'function')
      cb = nop;
    if (state.ended)
      writeAfterEnd(this, cb);
    else if (validChunk(this, state, chunk, cb)) {
      state.pendingcb++;
      ret = writeOrBuffer(this, state, chunk, encoding, cb);
    }
    return ret;
  };
  Writable.prototype.cork = function() {
    var state = this._writableState;
    state.corked++;
  };
  Writable.prototype.uncork = function() {
    var state = this._writableState;
    if (state.corked) {
      state.corked--;
      if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest)
        clearBuffer(this, state);
    }
  };
  Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
    if (typeof encoding === 'string')
      encoding = encoding.toLowerCase();
    if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1))
      throw new TypeError('Unknown encoding: ' + encoding);
    this._writableState.defaultEncoding = encoding;
  };
  function decodeChunk(state, chunk, encoding) {
    if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
      chunk = new Buffer(chunk, encoding);
    }
    return chunk;
  }
  function writeOrBuffer(stream, state, chunk, encoding, cb) {
    chunk = decodeChunk(state, chunk, encoding);
    if (Buffer.isBuffer(chunk))
      encoding = 'buffer';
    var len = state.objectMode ? 1 : chunk.length;
    state.length += len;
    var ret = state.length < state.highWaterMark;
    if (!ret)
      state.needDrain = true;
    if (state.writing || state.corked) {
      var last = state.lastBufferedRequest;
      state.lastBufferedRequest = new WriteReq(chunk, encoding, cb);
      if (last) {
        last.next = state.lastBufferedRequest;
      } else {
        state.bufferedRequest = state.lastBufferedRequest;
      }
    } else {
      doWrite(stream, state, false, len, chunk, encoding, cb);
    }
    return ret;
  }
  function doWrite(stream, state, writev, len, chunk, encoding, cb) {
    state.writelen = len;
    state.writecb = cb;
    state.writing = true;
    state.sync = true;
    if (writev)
      stream._writev(chunk, state.onwrite);
    else
      stream._write(chunk, encoding, state.onwrite);
    state.sync = false;
  }
  function onwriteError(stream, state, sync, er, cb) {
    --state.pendingcb;
    if (sync)
      processNextTick(cb, er);
    else
      cb(er);
    stream._writableState.errorEmitted = true;
    stream.emit('error', er);
  }
  function onwriteStateUpdate(state) {
    state.writing = false;
    state.writecb = null;
    state.length -= state.writelen;
    state.writelen = 0;
  }
  function onwrite(stream, er) {
    var state = stream._writableState;
    var sync = state.sync;
    var cb = state.writecb;
    onwriteStateUpdate(state);
    if (er)
      onwriteError(stream, state, sync, er, cb);
    else {
      var finished = needFinish(state);
      if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
        clearBuffer(stream, state);
      }
      if (sync) {
        processNextTick(afterWrite, stream, state, finished, cb);
      } else {
        afterWrite(stream, state, finished, cb);
      }
    }
  }
  function afterWrite(stream, state, finished, cb) {
    if (!finished)
      onwriteDrain(stream, state);
    state.pendingcb--;
    cb();
    finishMaybe(stream, state);
  }
  function onwriteDrain(stream, state) {
    if (state.length === 0 && state.needDrain) {
      state.needDrain = false;
      stream.emit('drain');
    }
  }
  function clearBuffer(stream, state) {
    state.bufferProcessing = true;
    var entry = state.bufferedRequest;
    if (stream._writev && entry && entry.next) {
      var buffer = [];
      var cbs = [];
      while (entry) {
        cbs.push(entry.callback);
        buffer.push(entry);
        entry = entry.next;
      }
      state.pendingcb++;
      state.lastBufferedRequest = null;
      doWrite(stream, state, true, state.length, buffer, '', function(err) {
        for (var i = 0; i < cbs.length; i++) {
          state.pendingcb--;
          cbs[i](err);
        }
      });
    } else {
      while (entry) {
        var chunk = entry.chunk;
        var encoding = entry.encoding;
        var cb = entry.callback;
        var len = state.objectMode ? 1 : chunk.length;
        doWrite(stream, state, false, len, chunk, encoding, cb);
        entry = entry.next;
        if (state.writing) {
          break;
        }
      }
      if (entry === null)
        state.lastBufferedRequest = null;
    }
    state.bufferedRequest = entry;
    state.bufferProcessing = false;
  }
  Writable.prototype._write = function(chunk, encoding, cb) {
    cb(new Error('not implemented'));
  };
  Writable.prototype._writev = null;
  Writable.prototype.end = function(chunk, encoding, cb) {
    var state = this._writableState;
    if (typeof chunk === 'function') {
      cb = chunk;
      chunk = null;
      encoding = null;
    } else if (typeof encoding === 'function') {
      cb = encoding;
      encoding = null;
    }
    if (chunk !== null && chunk !== undefined)
      this.write(chunk, encoding);
    if (state.corked) {
      state.corked = 1;
      this.uncork();
    }
    if (!state.ending && !state.finished)
      endWritable(this, state, cb);
  };
  function needFinish(state) {
    return (state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing);
  }
  function prefinish(stream, state) {
    if (!state.prefinished) {
      state.prefinished = true;
      stream.emit('prefinish');
    }
  }
  function finishMaybe(stream, state) {
    var need = needFinish(state);
    if (need) {
      if (state.pendingcb === 0) {
        prefinish(stream, state);
        state.finished = true;
        stream.emit('finish');
      } else {
        prefinish(stream, state);
      }
    }
    return need;
  }
  function endWritable(stream, state, cb) {
    state.ending = true;
    finishMaybe(stream, state);
    if (cb) {
      if (state.finished)
        processNextTick(cb);
      else
        stream.once('finish', cb);
    }
    state.ended = true;
  }
  return module.exports;
});

System.registerDynamic("npm:readable-stream@2.0.5/lib/_stream_duplex.js", ["process-nextick-args", "core-util-is", "inherits", "./_stream_readable", "./_stream_writable", "process"], true, function($__require, exports, module) {
  "use strict";
  var process = $__require("process");
  var define;
  var global = this;
  var GLOBAL = this;
  var objectKeys = Object.keys || function(obj) {
    var keys = [];
    for (var key in obj)
      keys.push(key);
    return keys;
  };
  module.exports = Duplex;
  var processNextTick = $__require('process-nextick-args');
  var util = $__require('core-util-is');
  util.inherits = $__require('inherits');
  var Readable = $__require('./_stream_readable');
  var Writable = $__require('./_stream_writable');
  util.inherits(Duplex, Readable);
  var keys = objectKeys(Writable.prototype);
  for (var v = 0; v < keys.length; v++) {
    var method = keys[v];
    if (!Duplex.prototype[method])
      Duplex.prototype[method] = Writable.prototype[method];
  }
  function Duplex(options) {
    if (!(this instanceof Duplex))
      return new Duplex(options);
    Readable.call(this, options);
    Writable.call(this, options);
    if (options && options.readable === false)
      this.readable = false;
    if (options && options.writable === false)
      this.writable = false;
    this.allowHalfOpen = true;
    if (options && options.allowHalfOpen === false)
      this.allowHalfOpen = false;
    this.once('end', onend);
  }
  function onend() {
    if (this.allowHalfOpen || this._writableState.ended)
      return;
    processNextTick(onEndNT, this);
  }
  function onEndNT(self) {
    self.end();
  }
  function forEach(xs, f) {
    for (var i = 0,
        l = xs.length; i < l; i++) {
      f(xs[i], i);
    }
  }
  return module.exports;
});

System.registerDynamic("npm:readable-stream@2.0.5/lib/_stream_transform.js", ["./_stream_duplex", "core-util-is", "inherits", "process"], true, function($__require, exports, module) {
  "use strict";
  var process = $__require("process");
  var define;
  var global = this;
  var GLOBAL = this;
  module.exports = Transform;
  var Duplex = $__require('./_stream_duplex');
  var util = $__require('core-util-is');
  util.inherits = $__require('inherits');
  util.inherits(Transform, Duplex);
  function TransformState(stream) {
    this.afterTransform = function(er, data) {
      return afterTransform(stream, er, data);
    };
    this.needTransform = false;
    this.transforming = false;
    this.writecb = null;
    this.writechunk = null;
  }
  function afterTransform(stream, er, data) {
    var ts = stream._transformState;
    ts.transforming = false;
    var cb = ts.writecb;
    if (!cb)
      return stream.emit('error', new Error('no writecb in Transform class'));
    ts.writechunk = null;
    ts.writecb = null;
    if (data !== null && data !== undefined)
      stream.push(data);
    if (cb)
      cb(er);
    var rs = stream._readableState;
    rs.reading = false;
    if (rs.needReadable || rs.length < rs.highWaterMark) {
      stream._read(rs.highWaterMark);
    }
  }
  function Transform(options) {
    if (!(this instanceof Transform))
      return new Transform(options);
    Duplex.call(this, options);
    this._transformState = new TransformState(this);
    var stream = this;
    this._readableState.needReadable = true;
    this._readableState.sync = false;
    if (options) {
      if (typeof options.transform === 'function')
        this._transform = options.transform;
      if (typeof options.flush === 'function')
        this._flush = options.flush;
    }
    this.once('prefinish', function() {
      if (typeof this._flush === 'function')
        this._flush(function(er) {
          done(stream, er);
        });
      else
        done(stream);
    });
  }
  Transform.prototype.push = function(chunk, encoding) {
    this._transformState.needTransform = false;
    return Duplex.prototype.push.call(this, chunk, encoding);
  };
  Transform.prototype._transform = function(chunk, encoding, cb) {
    throw new Error('not implemented');
  };
  Transform.prototype._write = function(chunk, encoding, cb) {
    var ts = this._transformState;
    ts.writecb = cb;
    ts.writechunk = chunk;
    ts.writeencoding = encoding;
    if (!ts.transforming) {
      var rs = this._readableState;
      if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark)
        this._read(rs.highWaterMark);
    }
  };
  Transform.prototype._read = function(n) {
    var ts = this._transformState;
    if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
      ts.transforming = true;
      this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
    } else {
      ts.needTransform = true;
    }
  };
  function done(stream, er) {
    if (er)
      return stream.emit('error', er);
    var ws = stream._writableState;
    var ts = stream._transformState;
    if (ws.length)
      throw new Error('calling transform done when ws.length != 0');
    if (ts.transforming)
      throw new Error('calling transform done when still transforming');
    return stream.push(null);
  }
  return module.exports;
});

System.registerDynamic("npm:base64-js@1.1.1.json", [], false, function() {
  return {
    "main": "lib/b64.js",
    "format": "cjs",
    "meta": {
      "*": {
        "globals": {
          "process": "process"
        }
      },
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:base64-js@1.1.1/lib/b64.js", ["process"], true, function($__require, exports, module) {
  "use strict";
  var process = $__require("process");
  var define;
  var global = this;
  var GLOBAL = this;
  exports.toByteArray = toByteArray;
  exports.fromByteArray = fromByteArray;
  var lookup = [];
  var revLookup = [];
  var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
  function init() {
    var i;
    var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var len = code.length;
    for (i = 0; i < len; i++) {
      lookup[i] = code[i];
    }
    for (i = 0; i < len; ++i) {
      revLookup[code.charCodeAt(i)] = i;
    }
    revLookup['-'.charCodeAt(0)] = 62;
    revLookup['_'.charCodeAt(0)] = 63;
  }
  init();
  function toByteArray(b64) {
    var i,
        j,
        l,
        tmp,
        placeHolders,
        arr;
    var len = b64.length;
    if (len % 4 > 0) {
      throw new Error('Invalid string. Length must be a multiple of 4');
    }
    placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0;
    arr = new Arr(len * 3 / 4 - placeHolders);
    l = placeHolders > 0 ? len - 4 : len;
    var L = 0;
    for (i = 0, j = 0; i < l; i += 4, j += 3) {
      tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)];
      arr[L++] = (tmp & 0xFF0000) >> 16;
      arr[L++] = (tmp & 0xFF00) >> 8;
      arr[L++] = tmp & 0xFF;
    }
    if (placeHolders === 2) {
      tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4);
      arr[L++] = tmp & 0xFF;
    } else if (placeHolders === 1) {
      tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2);
      arr[L++] = (tmp >> 8) & 0xFF;
      arr[L++] = tmp & 0xFF;
    }
    return arr;
  }
  function tripletToBase64(num) {
    return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
  }
  function encodeChunk(uint8, start, end) {
    var tmp;
    var output = [];
    for (var i = start; i < end; i += 3) {
      tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
      output.push(tripletToBase64(tmp));
    }
    return output.join('');
  }
  function fromByteArray(uint8) {
    var tmp;
    var len = uint8.length;
    var extraBytes = len % 3;
    var output = '';
    var parts = [];
    var maxChunkLength = 16383;
    for (var i = 0,
        len2 = len - extraBytes; i < len2; i += maxChunkLength) {
      parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)));
    }
    if (extraBytes === 1) {
      tmp = uint8[len - 1];
      output += lookup[tmp >> 2];
      output += lookup[(tmp << 4) & 0x3F];
      output += '==';
    } else if (extraBytes === 2) {
      tmp = (uint8[len - 2] << 8) + (uint8[len - 1]);
      output += lookup[tmp >> 10];
      output += lookup[(tmp >> 4) & 0x3F];
      output += lookup[(tmp << 2) & 0x3F];
      output += '=';
    }
    parts.push(output);
    return parts.join('');
  }
  return module.exports;
});

System.registerDynamic("npm:ieee754@1.1.6.json", [], false, function() {
  return {
    "main": "index.js",
    "format": "cjs",
    "meta": {
      "*": {
        "globals": {
          "process": "process"
        }
      },
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:ieee754@1.1.6/index.js", ["process"], true, function($__require, exports, module) {
  var process = $__require("process");
  var define;
  var global = this;
  var GLOBAL = this;
  exports.read = function(buffer, offset, isLE, mLen, nBytes) {
    var e,
        m;
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var nBits = -7;
    var i = isLE ? (nBytes - 1) : 0;
    var d = isLE ? -1 : 1;
    var s = buffer[offset + i];
    i += d;
    e = s & ((1 << (-nBits)) - 1);
    s >>= (-nBits);
    nBits += eLen;
    for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}
    m = e & ((1 << (-nBits)) - 1);
    e >>= (-nBits);
    nBits += mLen;
    for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}
    if (e === 0) {
      e = 1 - eBias;
    } else if (e === eMax) {
      return m ? NaN : ((s ? -1 : 1) * Infinity);
    } else {
      m = m + Math.pow(2, mLen);
      e = e - eBias;
    }
    return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
  };
  exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
    var e,
        m,
        c;
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0);
    var i = isLE ? 0 : (nBytes - 1);
    var d = isLE ? 1 : -1;
    var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;
    value = Math.abs(value);
    if (isNaN(value) || value === Infinity) {
      m = isNaN(value) ? 1 : 0;
      e = eMax;
    } else {
      e = Math.floor(Math.log(value) / Math.LN2);
      if (value * (c = Math.pow(2, -e)) < 1) {
        e--;
        c *= 2;
      }
      if (e + eBias >= 1) {
        value += rt / c;
      } else {
        value += rt * Math.pow(2, 1 - eBias);
      }
      if (value * c >= 2) {
        e++;
        c /= 2;
      }
      if (e + eBias >= eMax) {
        m = 0;
        e = eMax;
      } else if (e + eBias >= 1) {
        m = (value * c - 1) * Math.pow(2, mLen);
        e = e + eBias;
      } else {
        m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
        e = 0;
      }
    }
    for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}
    e = (e << mLen) | m;
    eLen += mLen;
    for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}
    buffer[offset + i - d] |= s * 128;
  };
  return module.exports;
});

System.registerDynamic("npm:isarray@1.0.0.json", [], false, function() {
  return {
    "main": "index.js",
    "format": "cjs",
    "meta": {
      "*": {
        "globals": {
          "process": "process"
        }
      },
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:isarray@1.0.0/index.js", ["process"], true, function($__require, exports, module) {
  var process = $__require("process");
  var define;
  var global = this;
  var GLOBAL = this;
  var toString = {}.toString;
  module.exports = Array.isArray || function(arr) {
    return toString.call(arr) == '[object Array]';
  };
  return module.exports;
});

System.registerDynamic("npm:buffer@4.5.0.json", [], false, function() {
  return {
    "main": "index.js",
    "format": "cjs",
    "meta": {
      "*": {
        "globals": {
          "process": "process"
        }
      },
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:buffer@4.5.0/index.js", ["base64-js", "ieee754", "isarray", "process"], true, function($__require, exports, module) {
  "use strict";
  var process = $__require("process");
  var define;
  var global = this;
  var GLOBAL = this;
  var base64 = $__require('base64-js');
  var ieee754 = $__require('ieee754');
  var isArray = $__require('isarray');
  exports.Buffer = Buffer;
  exports.SlowBuffer = SlowBuffer;
  exports.INSPECT_MAX_BYTES = 50;
  Buffer.poolSize = 8192;
  var rootParent = {};
  Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined ? global.TYPED_ARRAY_SUPPORT : typedArraySupport();
  function typedArraySupport() {
    try {
      var arr = new Uint8Array(1);
      arr.foo = function() {
        return 42;
      };
      return arr.foo() === 42 && typeof arr.subarray === 'function' && arr.subarray(1, 1).byteLength === 0;
    } catch (e) {
      return false;
    }
  }
  function kMaxLength() {
    return Buffer.TYPED_ARRAY_SUPPORT ? 0x7fffffff : 0x3fffffff;
  }
  function Buffer(arg) {
    if (!(this instanceof Buffer)) {
      if (arguments.length > 1)
        return new Buffer(arg, arguments[1]);
      return new Buffer(arg);
    }
    if (!Buffer.TYPED_ARRAY_SUPPORT) {
      this.length = 0;
      this.parent = undefined;
    }
    if (typeof arg === 'number') {
      return fromNumber(this, arg);
    }
    if (typeof arg === 'string') {
      return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8');
    }
    return fromObject(this, arg);
  }
  Buffer._augment = function(arr) {
    arr.__proto__ = Buffer.prototype;
    return arr;
  };
  function fromNumber(that, length) {
    that = allocate(that, length < 0 ? 0 : checked(length) | 0);
    if (!Buffer.TYPED_ARRAY_SUPPORT) {
      for (var i = 0; i < length; i++) {
        that[i] = 0;
      }
    }
    return that;
  }
  function fromString(that, string, encoding) {
    if (typeof encoding !== 'string' || encoding === '')
      encoding = 'utf8';
    var length = byteLength(string, encoding) | 0;
    that = allocate(that, length);
    that.write(string, encoding);
    return that;
  }
  function fromObject(that, object) {
    if (Buffer.isBuffer(object))
      return fromBuffer(that, object);
    if (isArray(object))
      return fromArray(that, object);
    if (object == null) {
      throw new TypeError('must start with number, buffer, array or string');
    }
    if (typeof ArrayBuffer !== 'undefined') {
      if (object.buffer instanceof ArrayBuffer) {
        return fromTypedArray(that, object);
      }
      if (object instanceof ArrayBuffer) {
        return fromArrayBuffer(that, object);
      }
    }
    if (object.length)
      return fromArrayLike(that, object);
    return fromJsonObject(that, object);
  }
  function fromBuffer(that, buffer) {
    var length = checked(buffer.length) | 0;
    that = allocate(that, length);
    buffer.copy(that, 0, 0, length);
    return that;
  }
  function fromArray(that, array) {
    var length = checked(array.length) | 0;
    that = allocate(that, length);
    for (var i = 0; i < length; i += 1) {
      that[i] = array[i] & 255;
    }
    return that;
  }
  function fromTypedArray(that, array) {
    var length = checked(array.length) | 0;
    that = allocate(that, length);
    for (var i = 0; i < length; i += 1) {
      that[i] = array[i] & 255;
    }
    return that;
  }
  function fromArrayBuffer(that, array) {
    array.byteLength;
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      that = new Uint8Array(array);
      that.__proto__ = Buffer.prototype;
    } else {
      that = fromTypedArray(that, new Uint8Array(array));
    }
    return that;
  }
  function fromArrayLike(that, array) {
    var length = checked(array.length) | 0;
    that = allocate(that, length);
    for (var i = 0; i < length; i += 1) {
      that[i] = array[i] & 255;
    }
    return that;
  }
  function fromJsonObject(that, object) {
    var array;
    var length = 0;
    if (object.type === 'Buffer' && isArray(object.data)) {
      array = object.data;
      length = checked(array.length) | 0;
    }
    that = allocate(that, length);
    for (var i = 0; i < length; i += 1) {
      that[i] = array[i] & 255;
    }
    return that;
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    Buffer.prototype.__proto__ = Uint8Array.prototype;
    Buffer.__proto__ = Uint8Array;
    if (typeof Symbol !== 'undefined' && Symbol.species && Buffer[Symbol.species] === Buffer) {
      Object.defineProperty(Buffer, Symbol.species, {
        value: null,
        configurable: true
      });
    }
  } else {
    Buffer.prototype.length = undefined;
    Buffer.prototype.parent = undefined;
  }
  function allocate(that, length) {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      that = new Uint8Array(length);
      that.__proto__ = Buffer.prototype;
    } else {
      that.length = length;
    }
    var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1;
    if (fromPool)
      that.parent = rootParent;
    return that;
  }
  function checked(length) {
    if (length >= kMaxLength()) {
      throw new RangeError('Attempt to allocate Buffer larger than maximum ' + 'size: 0x' + kMaxLength().toString(16) + ' bytes');
    }
    return length | 0;
  }
  function SlowBuffer(subject, encoding) {
    if (!(this instanceof SlowBuffer))
      return new SlowBuffer(subject, encoding);
    var buf = new Buffer(subject, encoding);
    delete buf.parent;
    return buf;
  }
  Buffer.isBuffer = function isBuffer(b) {
    return !!(b != null && b._isBuffer);
  };
  Buffer.compare = function compare(a, b) {
    if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
      throw new TypeError('Arguments must be Buffers');
    }
    if (a === b)
      return 0;
    var x = a.length;
    var y = b.length;
    var i = 0;
    var len = Math.min(x, y);
    while (i < len) {
      if (a[i] !== b[i])
        break;
      ++i;
    }
    if (i !== len) {
      x = a[i];
      y = b[i];
    }
    if (x < y)
      return -1;
    if (y < x)
      return 1;
    return 0;
  };
  Buffer.isEncoding = function isEncoding(encoding) {
    switch (String(encoding).toLowerCase()) {
      case 'hex':
      case 'utf8':
      case 'utf-8':
      case 'ascii':
      case 'binary':
      case 'base64':
      case 'raw':
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return true;
      default:
        return false;
    }
  };
  Buffer.concat = function concat(list, length) {
    if (!isArray(list))
      throw new TypeError('list argument must be an Array of Buffers.');
    if (list.length === 0) {
      return new Buffer(0);
    }
    var i;
    if (length === undefined) {
      length = 0;
      for (i = 0; i < list.length; i++) {
        length += list[i].length;
      }
    }
    var buf = new Buffer(length);
    var pos = 0;
    for (i = 0; i < list.length; i++) {
      var item = list[i];
      item.copy(buf, pos);
      pos += item.length;
    }
    return buf;
  };
  function byteLength(string, encoding) {
    if (typeof string !== 'string')
      string = '' + string;
    var len = string.length;
    if (len === 0)
      return 0;
    var loweredCase = false;
    for (; ; ) {
      switch (encoding) {
        case 'ascii':
        case 'binary':
        case 'raw':
        case 'raws':
          return len;
        case 'utf8':
        case 'utf-8':
          return utf8ToBytes(string).length;
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return len * 2;
        case 'hex':
          return len >>> 1;
        case 'base64':
          return base64ToBytes(string).length;
        default:
          if (loweredCase)
            return utf8ToBytes(string).length;
          encoding = ('' + encoding).toLowerCase();
          loweredCase = true;
      }
    }
  }
  Buffer.byteLength = byteLength;
  function slowToString(encoding, start, end) {
    var loweredCase = false;
    start = start | 0;
    end = end === undefined || end === Infinity ? this.length : end | 0;
    if (!encoding)
      encoding = 'utf8';
    if (start < 0)
      start = 0;
    if (end > this.length)
      end = this.length;
    if (end <= start)
      return '';
    while (true) {
      switch (encoding) {
        case 'hex':
          return hexSlice(this, start, end);
        case 'utf8':
        case 'utf-8':
          return utf8Slice(this, start, end);
        case 'ascii':
          return asciiSlice(this, start, end);
        case 'binary':
          return binarySlice(this, start, end);
        case 'base64':
          return base64Slice(this, start, end);
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return utf16leSlice(this, start, end);
        default:
          if (loweredCase)
            throw new TypeError('Unknown encoding: ' + encoding);
          encoding = (encoding + '').toLowerCase();
          loweredCase = true;
      }
    }
  }
  Buffer.prototype._isBuffer = true;
  Buffer.prototype.toString = function toString() {
    var length = this.length | 0;
    if (length === 0)
      return '';
    if (arguments.length === 0)
      return utf8Slice(this, 0, length);
    return slowToString.apply(this, arguments);
  };
  Buffer.prototype.equals = function equals(b) {
    if (!Buffer.isBuffer(b))
      throw new TypeError('Argument must be a Buffer');
    if (this === b)
      return true;
    return Buffer.compare(this, b) === 0;
  };
  Buffer.prototype.inspect = function inspect() {
    var str = '';
    var max = exports.INSPECT_MAX_BYTES;
    if (this.length > 0) {
      str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');
      if (this.length > max)
        str += ' ... ';
    }
    return '<Buffer ' + str + '>';
  };
  Buffer.prototype.compare = function compare(b) {
    if (!Buffer.isBuffer(b))
      throw new TypeError('Argument must be a Buffer');
    if (this === b)
      return 0;
    return Buffer.compare(this, b);
  };
  Buffer.prototype.indexOf = function indexOf(val, byteOffset) {
    if (byteOffset > 0x7fffffff)
      byteOffset = 0x7fffffff;
    else if (byteOffset < -0x80000000)
      byteOffset = -0x80000000;
    byteOffset >>= 0;
    if (this.length === 0)
      return -1;
    if (byteOffset >= this.length)
      return -1;
    if (byteOffset < 0)
      byteOffset = Math.max(this.length + byteOffset, 0);
    if (typeof val === 'string') {
      if (val.length === 0)
        return -1;
      return String.prototype.indexOf.call(this, val, byteOffset);
    }
    if (Buffer.isBuffer(val)) {
      return arrayIndexOf(this, val, byteOffset);
    }
    if (typeof val === 'number') {
      if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
        return Uint8Array.prototype.indexOf.call(this, val, byteOffset);
      }
      return arrayIndexOf(this, [val], byteOffset);
    }
    function arrayIndexOf(arr, val, byteOffset) {
      var foundIndex = -1;
      for (var i = 0; byteOffset + i < arr.length; i++) {
        if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
          if (foundIndex === -1)
            foundIndex = i;
          if (i - foundIndex + 1 === val.length)
            return byteOffset + foundIndex;
        } else {
          foundIndex = -1;
        }
      }
      return -1;
    }
    throw new TypeError('val must be string, number or Buffer');
  };
  function hexWrite(buf, string, offset, length) {
    offset = Number(offset) || 0;
    var remaining = buf.length - offset;
    if (!length) {
      length = remaining;
    } else {
      length = Number(length);
      if (length > remaining) {
        length = remaining;
      }
    }
    var strLen = string.length;
    if (strLen % 2 !== 0)
      throw new Error('Invalid hex string');
    if (length > strLen / 2) {
      length = strLen / 2;
    }
    for (var i = 0; i < length; i++) {
      var parsed = parseInt(string.substr(i * 2, 2), 16);
      if (isNaN(parsed))
        throw new Error('Invalid hex string');
      buf[offset + i] = parsed;
    }
    return i;
  }
  function utf8Write(buf, string, offset, length) {
    return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
  }
  function asciiWrite(buf, string, offset, length) {
    return blitBuffer(asciiToBytes(string), buf, offset, length);
  }
  function binaryWrite(buf, string, offset, length) {
    return asciiWrite(buf, string, offset, length);
  }
  function base64Write(buf, string, offset, length) {
    return blitBuffer(base64ToBytes(string), buf, offset, length);
  }
  function ucs2Write(buf, string, offset, length) {
    return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
  }
  Buffer.prototype.write = function write(string, offset, length, encoding) {
    if (offset === undefined) {
      encoding = 'utf8';
      length = this.length;
      offset = 0;
    } else if (length === undefined && typeof offset === 'string') {
      encoding = offset;
      length = this.length;
      offset = 0;
    } else if (isFinite(offset)) {
      offset = offset | 0;
      if (isFinite(length)) {
        length = length | 0;
        if (encoding === undefined)
          encoding = 'utf8';
      } else {
        encoding = length;
        length = undefined;
      }
    } else {
      var swap = encoding;
      encoding = offset;
      offset = length | 0;
      length = swap;
    }
    var remaining = this.length - offset;
    if (length === undefined || length > remaining)
      length = remaining;
    if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
      throw new RangeError('attempt to write outside buffer bounds');
    }
    if (!encoding)
      encoding = 'utf8';
    var loweredCase = false;
    for (; ; ) {
      switch (encoding) {
        case 'hex':
          return hexWrite(this, string, offset, length);
        case 'utf8':
        case 'utf-8':
          return utf8Write(this, string, offset, length);
        case 'ascii':
          return asciiWrite(this, string, offset, length);
        case 'binary':
          return binaryWrite(this, string, offset, length);
        case 'base64':
          return base64Write(this, string, offset, length);
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return ucs2Write(this, string, offset, length);
        default:
          if (loweredCase)
            throw new TypeError('Unknown encoding: ' + encoding);
          encoding = ('' + encoding).toLowerCase();
          loweredCase = true;
      }
    }
  };
  Buffer.prototype.toJSON = function toJSON() {
    return {
      type: 'Buffer',
      data: Array.prototype.slice.call(this._arr || this, 0)
    };
  };
  function base64Slice(buf, start, end) {
    if (start === 0 && end === buf.length) {
      return base64.fromByteArray(buf);
    } else {
      return base64.fromByteArray(buf.slice(start, end));
    }
  }
  function utf8Slice(buf, start, end) {
    end = Math.min(buf.length, end);
    var res = [];
    var i = start;
    while (i < end) {
      var firstByte = buf[i];
      var codePoint = null;
      var bytesPerSequence = (firstByte > 0xEF) ? 4 : (firstByte > 0xDF) ? 3 : (firstByte > 0xBF) ? 2 : 1;
      if (i + bytesPerSequence <= end) {
        var secondByte,
            thirdByte,
            fourthByte,
            tempCodePoint;
        switch (bytesPerSequence) {
          case 1:
            if (firstByte < 0x80) {
              codePoint = firstByte;
            }
            break;
          case 2:
            secondByte = buf[i + 1];
            if ((secondByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
              if (tempCodePoint > 0x7F) {
                codePoint = tempCodePoint;
              }
            }
            break;
          case 3:
            secondByte = buf[i + 1];
            thirdByte = buf[i + 2];
            if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
              if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                codePoint = tempCodePoint;
              }
            }
            break;
          case 4:
            secondByte = buf[i + 1];
            thirdByte = buf[i + 2];
            fourthByte = buf[i + 3];
            if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
              if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                codePoint = tempCodePoint;
              }
            }
        }
      }
      if (codePoint === null) {
        codePoint = 0xFFFD;
        bytesPerSequence = 1;
      } else if (codePoint > 0xFFFF) {
        codePoint -= 0x10000;
        res.push(codePoint >>> 10 & 0x3FF | 0xD800);
        codePoint = 0xDC00 | codePoint & 0x3FF;
      }
      res.push(codePoint);
      i += bytesPerSequence;
    }
    return decodeCodePointsArray(res);
  }
  var MAX_ARGUMENTS_LENGTH = 0x1000;
  function decodeCodePointsArray(codePoints) {
    var len = codePoints.length;
    if (len <= MAX_ARGUMENTS_LENGTH) {
      return String.fromCharCode.apply(String, codePoints);
    }
    var res = '';
    var i = 0;
    while (i < len) {
      res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
    }
    return res;
  }
  function asciiSlice(buf, start, end) {
    var ret = '';
    end = Math.min(buf.length, end);
    for (var i = start; i < end; i++) {
      ret += String.fromCharCode(buf[i] & 0x7F);
    }
    return ret;
  }
  function binarySlice(buf, start, end) {
    var ret = '';
    end = Math.min(buf.length, end);
    for (var i = start; i < end; i++) {
      ret += String.fromCharCode(buf[i]);
    }
    return ret;
  }
  function hexSlice(buf, start, end) {
    var len = buf.length;
    if (!start || start < 0)
      start = 0;
    if (!end || end < 0 || end > len)
      end = len;
    var out = '';
    for (var i = start; i < end; i++) {
      out += toHex(buf[i]);
    }
    return out;
  }
  function utf16leSlice(buf, start, end) {
    var bytes = buf.slice(start, end);
    var res = '';
    for (var i = 0; i < bytes.length; i += 2) {
      res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
    }
    return res;
  }
  Buffer.prototype.slice = function slice(start, end) {
    var len = this.length;
    start = ~~start;
    end = end === undefined ? len : ~~end;
    if (start < 0) {
      start += len;
      if (start < 0)
        start = 0;
    } else if (start > len) {
      start = len;
    }
    if (end < 0) {
      end += len;
      if (end < 0)
        end = 0;
    } else if (end > len) {
      end = len;
    }
    if (end < start)
      end = start;
    var newBuf;
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      newBuf = this.subarray(start, end);
      newBuf.__proto__ = Buffer.prototype;
    } else {
      var sliceLen = end - start;
      newBuf = new Buffer(sliceLen, undefined);
      for (var i = 0; i < sliceLen; i++) {
        newBuf[i] = this[i + start];
      }
    }
    if (newBuf.length)
      newBuf.parent = this.parent || this;
    return newBuf;
  };
  function checkOffset(offset, ext, length) {
    if ((offset % 1) !== 0 || offset < 0)
      throw new RangeError('offset is not uint');
    if (offset + ext > length)
      throw new RangeError('Trying to access beyond buffer length');
  }
  Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert)
      checkOffset(offset, byteLength, this.length);
    var val = this[offset];
    var mul = 1;
    var i = 0;
    while (++i < byteLength && (mul *= 0x100)) {
      val += this[offset + i] * mul;
    }
    return val;
  };
  Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert) {
      checkOffset(offset, byteLength, this.length);
    }
    var val = this[offset + --byteLength];
    var mul = 1;
    while (byteLength > 0 && (mul *= 0x100)) {
      val += this[offset + --byteLength] * mul;
    }
    return val;
  };
  Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
    if (!noAssert)
      checkOffset(offset, 1, this.length);
    return this[offset];
  };
  Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
    if (!noAssert)
      checkOffset(offset, 2, this.length);
    return this[offset] | (this[offset + 1] << 8);
  };
  Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
    if (!noAssert)
      checkOffset(offset, 2, this.length);
    return (this[offset] << 8) | this[offset + 1];
  };
  Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
    if (!noAssert)
      checkOffset(offset, 4, this.length);
    return ((this[offset]) | (this[offset + 1] << 8) | (this[offset + 2] << 16)) + (this[offset + 3] * 0x1000000);
  };
  Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
    if (!noAssert)
      checkOffset(offset, 4, this.length);
    return (this[offset] * 0x1000000) + ((this[offset + 1] << 16) | (this[offset + 2] << 8) | this[offset + 3]);
  };
  Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert)
      checkOffset(offset, byteLength, this.length);
    var val = this[offset];
    var mul = 1;
    var i = 0;
    while (++i < byteLength && (mul *= 0x100)) {
      val += this[offset + i] * mul;
    }
    mul *= 0x80;
    if (val >= mul)
      val -= Math.pow(2, 8 * byteLength);
    return val;
  };
  Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert)
      checkOffset(offset, byteLength, this.length);
    var i = byteLength;
    var mul = 1;
    var val = this[offset + --i];
    while (i > 0 && (mul *= 0x100)) {
      val += this[offset + --i] * mul;
    }
    mul *= 0x80;
    if (val >= mul)
      val -= Math.pow(2, 8 * byteLength);
    return val;
  };
  Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
    if (!noAssert)
      checkOffset(offset, 1, this.length);
    if (!(this[offset] & 0x80))
      return (this[offset]);
    return ((0xff - this[offset] + 1) * -1);
  };
  Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
    if (!noAssert)
      checkOffset(offset, 2, this.length);
    var val = this[offset] | (this[offset + 1] << 8);
    return (val & 0x8000) ? val | 0xFFFF0000 : val;
  };
  Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
    if (!noAssert)
      checkOffset(offset, 2, this.length);
    var val = this[offset + 1] | (this[offset] << 8);
    return (val & 0x8000) ? val | 0xFFFF0000 : val;
  };
  Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
    if (!noAssert)
      checkOffset(offset, 4, this.length);
    return (this[offset]) | (this[offset + 1] << 8) | (this[offset + 2] << 16) | (this[offset + 3] << 24);
  };
  Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
    if (!noAssert)
      checkOffset(offset, 4, this.length);
    return (this[offset] << 24) | (this[offset + 1] << 16) | (this[offset + 2] << 8) | (this[offset + 3]);
  };
  Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
    if (!noAssert)
      checkOffset(offset, 4, this.length);
    return ieee754.read(this, offset, true, 23, 4);
  };
  Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
    if (!noAssert)
      checkOffset(offset, 4, this.length);
    return ieee754.read(this, offset, false, 23, 4);
  };
  Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
    if (!noAssert)
      checkOffset(offset, 8, this.length);
    return ieee754.read(this, offset, true, 52, 8);
  };
  Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
    if (!noAssert)
      checkOffset(offset, 8, this.length);
    return ieee754.read(this, offset, false, 52, 8);
  };
  function checkInt(buf, value, offset, ext, max, min) {
    if (!Buffer.isBuffer(buf))
      throw new TypeError('buffer must be a Buffer instance');
    if (value > max || value < min)
      throw new RangeError('value is out of bounds');
    if (offset + ext > buf.length)
      throw new RangeError('index out of range');
  }
  Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert)
      checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0);
    var mul = 1;
    var i = 0;
    this[offset] = value & 0xFF;
    while (++i < byteLength && (mul *= 0x100)) {
      this[offset + i] = (value / mul) & 0xFF;
    }
    return offset + byteLength;
  };
  Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert)
      checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0);
    var i = byteLength - 1;
    var mul = 1;
    this[offset + i] = value & 0xFF;
    while (--i >= 0 && (mul *= 0x100)) {
      this[offset + i] = (value / mul) & 0xFF;
    }
    return offset + byteLength;
  };
  Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert)
      checkInt(this, value, offset, 1, 0xff, 0);
    if (!Buffer.TYPED_ARRAY_SUPPORT)
      value = Math.floor(value);
    this[offset] = (value & 0xff);
    return offset + 1;
  };
  function objectWriteUInt16(buf, value, offset, littleEndian) {
    if (value < 0)
      value = 0xffff + value + 1;
    for (var i = 0,
        j = Math.min(buf.length - offset, 2); i < j; i++) {
      buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>> (littleEndian ? i : 1 - i) * 8;
    }
  }
  Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert)
      checkInt(this, value, offset, 2, 0xffff, 0);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value & 0xff);
      this[offset + 1] = (value >>> 8);
    } else {
      objectWriteUInt16(this, value, offset, true);
    }
    return offset + 2;
  };
  Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert)
      checkInt(this, value, offset, 2, 0xffff, 0);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value >>> 8);
      this[offset + 1] = (value & 0xff);
    } else {
      objectWriteUInt16(this, value, offset, false);
    }
    return offset + 2;
  };
  function objectWriteUInt32(buf, value, offset, littleEndian) {
    if (value < 0)
      value = 0xffffffff + value + 1;
    for (var i = 0,
        j = Math.min(buf.length - offset, 4); i < j; i++) {
      buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff;
    }
  }
  Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert)
      checkInt(this, value, offset, 4, 0xffffffff, 0);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset + 3] = (value >>> 24);
      this[offset + 2] = (value >>> 16);
      this[offset + 1] = (value >>> 8);
      this[offset] = (value & 0xff);
    } else {
      objectWriteUInt32(this, value, offset, true);
    }
    return offset + 4;
  };
  Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert)
      checkInt(this, value, offset, 4, 0xffffffff, 0);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value >>> 24);
      this[offset + 1] = (value >>> 16);
      this[offset + 2] = (value >>> 8);
      this[offset + 3] = (value & 0xff);
    } else {
      objectWriteUInt32(this, value, offset, false);
    }
    return offset + 4;
  };
  Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) {
      var limit = Math.pow(2, 8 * byteLength - 1);
      checkInt(this, value, offset, byteLength, limit - 1, -limit);
    }
    var i = 0;
    var mul = 1;
    var sub = value < 0 ? 1 : 0;
    this[offset] = value & 0xFF;
    while (++i < byteLength && (mul *= 0x100)) {
      this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
    }
    return offset + byteLength;
  };
  Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) {
      var limit = Math.pow(2, 8 * byteLength - 1);
      checkInt(this, value, offset, byteLength, limit - 1, -limit);
    }
    var i = byteLength - 1;
    var mul = 1;
    var sub = value < 0 ? 1 : 0;
    this[offset + i] = value & 0xFF;
    while (--i >= 0 && (mul *= 0x100)) {
      this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
    }
    return offset + byteLength;
  };
  Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert)
      checkInt(this, value, offset, 1, 0x7f, -0x80);
    if (!Buffer.TYPED_ARRAY_SUPPORT)
      value = Math.floor(value);
    if (value < 0)
      value = 0xff + value + 1;
    this[offset] = (value & 0xff);
    return offset + 1;
  };
  Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert)
      checkInt(this, value, offset, 2, 0x7fff, -0x8000);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value & 0xff);
      this[offset + 1] = (value >>> 8);
    } else {
      objectWriteUInt16(this, value, offset, true);
    }
    return offset + 2;
  };
  Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert)
      checkInt(this, value, offset, 2, 0x7fff, -0x8000);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value >>> 8);
      this[offset + 1] = (value & 0xff);
    } else {
      objectWriteUInt16(this, value, offset, false);
    }
    return offset + 2;
  };
  Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert)
      checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value & 0xff);
      this[offset + 1] = (value >>> 8);
      this[offset + 2] = (value >>> 16);
      this[offset + 3] = (value >>> 24);
    } else {
      objectWriteUInt32(this, value, offset, true);
    }
    return offset + 4;
  };
  Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert)
      checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
    if (value < 0)
      value = 0xffffffff + value + 1;
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value >>> 24);
      this[offset + 1] = (value >>> 16);
      this[offset + 2] = (value >>> 8);
      this[offset + 3] = (value & 0xff);
    } else {
      objectWriteUInt32(this, value, offset, false);
    }
    return offset + 4;
  };
  function checkIEEE754(buf, value, offset, ext, max, min) {
    if (offset + ext > buf.length)
      throw new RangeError('index out of range');
    if (offset < 0)
      throw new RangeError('index out of range');
  }
  function writeFloat(buf, value, offset, littleEndian, noAssert) {
    if (!noAssert) {
      checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38);
    }
    ieee754.write(buf, value, offset, littleEndian, 23, 4);
    return offset + 4;
  }
  Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
    return writeFloat(this, value, offset, true, noAssert);
  };
  Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
    return writeFloat(this, value, offset, false, noAssert);
  };
  function writeDouble(buf, value, offset, littleEndian, noAssert) {
    if (!noAssert) {
      checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308);
    }
    ieee754.write(buf, value, offset, littleEndian, 52, 8);
    return offset + 8;
  }
  Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
    return writeDouble(this, value, offset, true, noAssert);
  };
  Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
    return writeDouble(this, value, offset, false, noAssert);
  };
  Buffer.prototype.copy = function copy(target, targetStart, start, end) {
    if (!start)
      start = 0;
    if (!end && end !== 0)
      end = this.length;
    if (targetStart >= target.length)
      targetStart = target.length;
    if (!targetStart)
      targetStart = 0;
    if (end > 0 && end < start)
      end = start;
    if (end === start)
      return 0;
    if (target.length === 0 || this.length === 0)
      return 0;
    if (targetStart < 0) {
      throw new RangeError('targetStart out of bounds');
    }
    if (start < 0 || start >= this.length)
      throw new RangeError('sourceStart out of bounds');
    if (end < 0)
      throw new RangeError('sourceEnd out of bounds');
    if (end > this.length)
      end = this.length;
    if (target.length - targetStart < end - start) {
      end = target.length - targetStart + start;
    }
    var len = end - start;
    var i;
    if (this === target && start < targetStart && targetStart < end) {
      for (i = len - 1; i >= 0; i--) {
        target[i + targetStart] = this[i + start];
      }
    } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
      for (i = 0; i < len; i++) {
        target[i + targetStart] = this[i + start];
      }
    } else {
      Uint8Array.prototype.set.call(target, this.subarray(start, start + len), targetStart);
    }
    return len;
  };
  Buffer.prototype.fill = function fill(value, start, end) {
    if (!value)
      value = 0;
    if (!start)
      start = 0;
    if (!end)
      end = this.length;
    if (end < start)
      throw new RangeError('end < start');
    if (end === start)
      return;
    if (this.length === 0)
      return;
    if (start < 0 || start >= this.length)
      throw new RangeError('start out of bounds');
    if (end < 0 || end > this.length)
      throw new RangeError('end out of bounds');
    var i;
    if (typeof value === 'number') {
      for (i = start; i < end; i++) {
        this[i] = value;
      }
    } else {
      var bytes = utf8ToBytes(value.toString());
      var len = bytes.length;
      for (i = start; i < end; i++) {
        this[i] = bytes[i % len];
      }
    }
    return this;
  };
  var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;
  function base64clean(str) {
    str = stringtrim(str).replace(INVALID_BASE64_RE, '');
    if (str.length < 2)
      return '';
    while (str.length % 4 !== 0) {
      str = str + '=';
    }
    return str;
  }
  function stringtrim(str) {
    if (str.trim)
      return str.trim();
    return str.replace(/^\s+|\s+$/g, '');
  }
  function toHex(n) {
    if (n < 16)
      return '0' + n.toString(16);
    return n.toString(16);
  }
  function utf8ToBytes(string, units) {
    units = units || Infinity;
    var codePoint;
    var length = string.length;
    var leadSurrogate = null;
    var bytes = [];
    for (var i = 0; i < length; i++) {
      codePoint = string.charCodeAt(i);
      if (codePoint > 0xD7FF && codePoint < 0xE000) {
        if (!leadSurrogate) {
          if (codePoint > 0xDBFF) {
            if ((units -= 3) > -1)
              bytes.push(0xEF, 0xBF, 0xBD);
            continue;
          } else if (i + 1 === length) {
            if ((units -= 3) > -1)
              bytes.push(0xEF, 0xBF, 0xBD);
            continue;
          }
          leadSurrogate = codePoint;
          continue;
        }
        if (codePoint < 0xDC00) {
          if ((units -= 3) > -1)
            bytes.push(0xEF, 0xBF, 0xBD);
          leadSurrogate = codePoint;
          continue;
        }
        codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
      } else if (leadSurrogate) {
        if ((units -= 3) > -1)
          bytes.push(0xEF, 0xBF, 0xBD);
      }
      leadSurrogate = null;
      if (codePoint < 0x80) {
        if ((units -= 1) < 0)
          break;
        bytes.push(codePoint);
      } else if (codePoint < 0x800) {
        if ((units -= 2) < 0)
          break;
        bytes.push(codePoint >> 0x6 | 0xC0, codePoint & 0x3F | 0x80);
      } else if (codePoint < 0x10000) {
        if ((units -= 3) < 0)
          break;
        bytes.push(codePoint >> 0xC | 0xE0, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
      } else if (codePoint < 0x110000) {
        if ((units -= 4) < 0)
          break;
        bytes.push(codePoint >> 0x12 | 0xF0, codePoint >> 0xC & 0x3F | 0x80, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
      } else {
        throw new Error('Invalid code point');
      }
    }
    return bytes;
  }
  function asciiToBytes(str) {
    var byteArray = [];
    for (var i = 0; i < str.length; i++) {
      byteArray.push(str.charCodeAt(i) & 0xFF);
    }
    return byteArray;
  }
  function utf16leToBytes(str, units) {
    var c,
        hi,
        lo;
    var byteArray = [];
    for (var i = 0; i < str.length; i++) {
      if ((units -= 2) < 0)
        break;
      c = str.charCodeAt(i);
      hi = c >> 8;
      lo = c % 256;
      byteArray.push(lo);
      byteArray.push(hi);
    }
    return byteArray;
  }
  function base64ToBytes(str) {
    return base64.toByteArray(base64clean(str));
  }
  function blitBuffer(src, dst, offset, length) {
    for (var i = 0; i < length; i++) {
      if ((i + offset >= dst.length) || (i >= src.length))
        break;
      dst[i + offset] = src[i];
    }
    return i;
  }
  return module.exports;
});

System.registerDynamic("github:jspm/nodelibs-buffer@0.2.0-alpha.json", [], false, function() {
  return {
    "main": "buffer.js",
    "map": {
      "./buffer.js": {
        "browser": "buffer-browserify"
      }
    }
  };
});

System.registerDynamic("github:jspm/nodelibs-buffer@0.2.0-alpha/global.js", ["./buffer.js"], true, function($__require, exports, module) {
  ;
  var define;
  var global = this;
  var GLOBAL = this;
  module.exports = $__require('./buffer.js').Buffer;
  return module.exports;
});

System.registerDynamic("npm:core-util-is@1.0.2.json", [], false, function() {
  return {
    "main": "lib/util.js",
    "format": "cjs",
    "meta": {
      "*": {
        "globals": {
          "process": "process"
        }
      },
      "*.json": {
        "format": "json"
      },
      "lib/*": {
        "globals": {
          "Buffer": "buffer/global"
        }
      },
      "test.js": {
        "globals": {
          "Buffer": "buffer/global"
        }
      }
    }
  };
});

System.registerDynamic("npm:core-util-is@1.0.2/lib/util.js", ["process", "buffer/global"], true, function($__require, exports, module) {
  var process = $__require("process"),
      Buffer = $__require("buffer/global");
  var define;
  var global = this;
  var GLOBAL = this;
  function isArray(arg) {
    if (Array.isArray) {
      return Array.isArray(arg);
    }
    return objectToString(arg) === '[object Array]';
  }
  exports.isArray = isArray;
  function isBoolean(arg) {
    return typeof arg === 'boolean';
  }
  exports.isBoolean = isBoolean;
  function isNull(arg) {
    return arg === null;
  }
  exports.isNull = isNull;
  function isNullOrUndefined(arg) {
    return arg == null;
  }
  exports.isNullOrUndefined = isNullOrUndefined;
  function isNumber(arg) {
    return typeof arg === 'number';
  }
  exports.isNumber = isNumber;
  function isString(arg) {
    return typeof arg === 'string';
  }
  exports.isString = isString;
  function isSymbol(arg) {
    return typeof arg === 'symbol';
  }
  exports.isSymbol = isSymbol;
  function isUndefined(arg) {
    return arg === void 0;
  }
  exports.isUndefined = isUndefined;
  function isRegExp(re) {
    return objectToString(re) === '[object RegExp]';
  }
  exports.isRegExp = isRegExp;
  function isObject(arg) {
    return typeof arg === 'object' && arg !== null;
  }
  exports.isObject = isObject;
  function isDate(d) {
    return objectToString(d) === '[object Date]';
  }
  exports.isDate = isDate;
  function isError(e) {
    return (objectToString(e) === '[object Error]' || e instanceof Error);
  }
  exports.isError = isError;
  function isFunction(arg) {
    return typeof arg === 'function';
  }
  exports.isFunction = isFunction;
  function isPrimitive(arg) {
    return arg === null || typeof arg === 'boolean' || typeof arg === 'number' || typeof arg === 'string' || typeof arg === 'symbol' || typeof arg === 'undefined';
  }
  exports.isPrimitive = isPrimitive;
  exports.isBuffer = Buffer.isBuffer;
  function objectToString(o) {
    return Object.prototype.toString.call(o);
  }
  return module.exports;
});

System.registerDynamic("npm:inherits@2.0.1.json", [], false, function() {
  return {
    "main": "inherits.js",
    "format": "cjs",
    "meta": {
      "*": {
        "globals": {
          "process": "process"
        }
      },
      "*.json": {
        "format": "json"
      }
    },
    "map": {
      "./inherits.js": {
        "browser": "./inherits_browser.js"
      }
    }
  };
});

System.registerDynamic("npm:inherits@2.0.1/inherits_browser.js", ["process"], true, function($__require, exports, module) {
  var process = $__require("process");
  var define;
  var global = this;
  var GLOBAL = this;
  if (typeof Object.create === 'function') {
    module.exports = function inherits(ctor, superCtor) {
      ctor.super_ = superCtor;
      ctor.prototype = Object.create(superCtor.prototype, {constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }});
    };
  } else {
    module.exports = function inherits(ctor, superCtor) {
      ctor.super_ = superCtor;
      var TempCtor = function() {};
      TempCtor.prototype = superCtor.prototype;
      ctor.prototype = new TempCtor();
      ctor.prototype.constructor = ctor;
    };
  }
  return module.exports;
});

System.registerDynamic("npm:readable-stream@2.0.5/lib/_stream_passthrough.js", ["./_stream_transform", "core-util-is", "inherits", "process"], true, function($__require, exports, module) {
  "use strict";
  var process = $__require("process");
  var define;
  var global = this;
  var GLOBAL = this;
  module.exports = PassThrough;
  var Transform = $__require('./_stream_transform');
  var util = $__require('core-util-is');
  util.inherits = $__require('inherits');
  util.inherits(PassThrough, Transform);
  function PassThrough(options) {
    if (!(this instanceof PassThrough))
      return new PassThrough(options);
    Transform.call(this, options);
  }
  PassThrough.prototype._transform = function(chunk, encoding, cb) {
    cb(null, chunk);
  };
  return module.exports;
});

System.registerDynamic("npm:readable-stream@2.0.5.json", [], false, function() {
  return {
    "main": "readable.js",
    "format": "cjs",
    "meta": {
      "*": {
        "globals": {
          "process": "process"
        }
      },
      "*.json": {
        "format": "json"
      },
      "lib/_stream_readable.js": {
        "globals": {
          "Buffer": "buffer/global"
        }
      },
      "lib/_stream_writable.js": {
        "globals": {
          "Buffer": "buffer/global"
        }
      }
    },
    "map": {
      "util": {
        "browser": "@empty"
      }
    }
  };
});

System.registerDynamic("npm:readable-stream@2.0.5/passthrough.js", ["./lib/_stream_passthrough.js", "process"], true, function($__require, exports, module) {
  var process = $__require("process");
  var define;
  var global = this;
  var GLOBAL = this;
  module.exports = $__require('./lib/_stream_passthrough.js');
  return module.exports;
});

System.registerDynamic("github:jspm/nodelibs-process@0.2.0-alpha.json", [], false, function() {
  return {
    "main": "./process.js"
  };
});

System.registerDynamic("github:jspm/nodelibs-process@0.2.0-alpha/process.js", ["@system-env"], true, function($__require, exports, module) {
  ;
  var define;
  var global = this;
  var GLOBAL = this;
  var productionEnv = $__require('@system-env').production;
  var process = module.exports = {};
  var queue = [];
  var draining = false;
  var currentQueue;
  var queueIndex = -1;
  function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
      queue = currentQueue.concat(queue);
    } else {
      queueIndex = -1;
    }
    if (queue.length) {
      drainQueue();
    }
  }
  function drainQueue() {
    if (draining) {
      return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;
    var len = queue.length;
    while (len) {
      currentQueue = queue;
      queue = [];
      while (++queueIndex < len) {
        if (currentQueue) {
          currentQueue[queueIndex].run();
        }
      }
      queueIndex = -1;
      len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
  }
  process.nextTick = function(fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
      for (var i = 1; i < arguments.length; i++) {
        args[i - 1] = arguments[i];
      }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
      setTimeout(drainQueue, 0);
    }
  };
  function Item(fun, array) {
    this.fun = fun;
    this.array = array;
  }
  Item.prototype.run = function() {
    this.fun.apply(null, this.array);
  };
  process.title = 'browser';
  process.browser = true;
  process.env = {NODE_ENV: productionEnv ? 'production' : 'development'};
  process.argv = [];
  process.version = '';
  process.versions = {};
  function noop() {}
  process.on = noop;
  process.addListener = noop;
  process.once = noop;
  process.off = noop;
  process.removeListener = noop;
  process.removeAllListeners = noop;
  process.emit = noop;
  process.binding = function(name) {
    throw new Error('process.binding is not supported');
  };
  process.cwd = function() {
    return '/';
  };
  process.chdir = function(dir) {
    throw new Error('process.chdir is not supported');
  };
  process.umask = function() {
    return 0;
  };
  return module.exports;
});

System.registerDynamic("npm:stream-browserify@2.0.1.json", [], false, function() {
  return {
    "main": "index.js",
    "format": "cjs",
    "meta": {
      "*": {
        "globals": {
          "process": "process"
        }
      },
      "*.json": {
        "format": "json"
      }
    }
  };
});

System.registerDynamic("npm:stream-browserify@2.0.1/index.js", ["events", "inherits", "readable-stream/readable.js", "readable-stream/writable.js", "readable-stream/duplex.js", "readable-stream/transform.js", "readable-stream/passthrough.js", "process"], true, function($__require, exports, module) {
  var process = $__require("process");
  var define;
  var global = this;
  var GLOBAL = this;
  module.exports = Stream;
  var EE = $__require('events').EventEmitter;
  var inherits = $__require('inherits');
  inherits(Stream, EE);
  Stream.Readable = $__require('readable-stream/readable.js');
  Stream.Writable = $__require('readable-stream/writable.js');
  Stream.Duplex = $__require('readable-stream/duplex.js');
  Stream.Transform = $__require('readable-stream/transform.js');
  Stream.PassThrough = $__require('readable-stream/passthrough.js');
  Stream.Stream = Stream;
  function Stream() {
    EE.call(this);
  }
  Stream.prototype.pipe = function(dest, options) {
    var source = this;
    function ondata(chunk) {
      if (dest.writable) {
        if (false === dest.write(chunk) && source.pause) {
          source.pause();
        }
      }
    }
    source.on('data', ondata);
    function ondrain() {
      if (source.readable && source.resume) {
        source.resume();
      }
    }
    dest.on('drain', ondrain);
    if (!dest._isStdio && (!options || options.end !== false)) {
      source.on('end', onend);
      source.on('close', onclose);
    }
    var didOnEnd = false;
    function onend() {
      if (didOnEnd)
        return;
      didOnEnd = true;
      dest.end();
    }
    function onclose() {
      if (didOnEnd)
        return;
      didOnEnd = true;
      if (typeof dest.destroy === 'function')
        dest.destroy();
    }
    function onerror(er) {
      cleanup();
      if (EE.listenerCount(this, 'error') === 0) {
        throw er;
      }
    }
    source.on('error', onerror);
    dest.on('error', onerror);
    function cleanup() {
      source.removeListener('data', ondata);
      dest.removeListener('drain', ondrain);
      source.removeListener('end', onend);
      source.removeListener('close', onclose);
      source.removeListener('error', onerror);
      dest.removeListener('error', onerror);
      source.removeListener('end', cleanup);
      source.removeListener('close', cleanup);
      dest.removeListener('close', cleanup);
    }
    source.on('end', cleanup);
    source.on('close', cleanup);
    dest.on('close', cleanup);
    dest.emit('pipe', source);
    return dest;
  };
  return module.exports;
});

//# sourceMappingURL=demo-bundle-dependencies.js.map