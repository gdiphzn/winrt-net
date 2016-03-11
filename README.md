# winrt-net
### Use the Node `net` API in Windows Apps (WinRT)
This module lets you use the Node.js [net](https://nodejs.org/api/net.html) (TCP) API in [Windows Universal Apps](https://msdn.microsoft.com/en-us/windows/uwp/get-started/whats-a-uwp) (WinRT).

Instead of learning the quirks of WinRT's [`StreamSocket`](https://msdn.microsoft.com/library/windows/apps/br226882) and [`StreamSocketListener`](https://msdn.microsoft.com/en-us/library/windows/apps/windows.networking.sockets.streamsocketlistener.aspx) APIs for networking in Windows Apps just **use the higher-level node API you're familiar with**. ~~Then, compile your code with [browserify](https://github.com/substack/node-browserify) and you're all set!~~ Then install this module through [JSPM](http://jspm.io/), rename it in your config file and you're all set!

## Installation & Usage
### 1) Install the module through JSPM
```
jspm install npm:winrt-net
```
### 2) Rename `winrt-net` to `net` in your SystemJS/JSPM config file
#### Why?
JSPM has it's own module that get's installed whenever you or your dependecy uses `net` module. And it does next to nothing because browsers don't do TCP.
#### how?
In JSPM config file there is property `map` with names and mappings of all modules. This is an example of JSPM 0.17 `jspm.config.js`

```js
map: {
  "winrt-net": "npm:winrt-net@1.0.0",
  "events": "github:jspm/nodelibs-events@0.2.0-alpha",
  "process": "github:jspm/nodelibs-process@0.2.0-alpha",
  ...
```

you change the name like so

```js
map: {
  "net": "npm:winrt-net@1.0.0",
  ...
```

and that forces JSPM to load this module whenever there is `require('net')` or `import net from 'net'` in your code or dependencies. It also uses the original Node `net` if you run your code in Node through `jspm run`. (more on that in chapter Building & Testing)

## Keep in mind
### supporting other platforms
If you write Chrome Packaged App you are probbably looking or similar module [`chrome-net`](https://github.com/feross/chrome-net).

If you however support both WinRT and Chrome you should instead install module [`flexus-net`](https://www.npmjs.com/package/flexus-net) which wraps both `winrt-net` and `chome-net` and is used the same way (JSPM, renaming in config file, etc...) as this module.

### WinRT quirks
WinRT won't let your server receive localhost connections from other apps or programs.
```
Network communications using an IP loopback address cannot be used for interprocess communication (between two different apps) in a Windows Runtime app since this is restricted by network isolation. Network communication using an IP loopback address is allowed within an app within the same process for communication purposes.
```
For more info see this article
[How to enable loopback and troubleshoot network isolation](https://msdn.microsoft.com/en-us/library/windows/apps/hh780593.aspx)

### implementation
Some things are not (yet) implemented. Namelly
- Socket.ref();
- Socket.unref();
- Socket._unrefTimer();
- Socket.setEncoding();
- Socket.setTimeout();
- Socket.setNoDelay();
- Socket.setKeepAlive();

## Contribution

I'll be using this module in my projects and fixing bugs along the way but I'd really appreciate  your help and will gladly accept issues, pull requests or even full blown contributor

## JSPM & Browserify
This project was built for and tested using JSPM.

I'm not using browserify nor do I know how to set up a project for it and currently I don't have enough time to look into it now. But again I'll be more than happy to accept pull requests


## Building & Testing

The `net` module and all test files are written in ES6 modules using the `import net from 'net';` syntax and has to be transpiled
```
gulp dev
```
This transpiles `src/net.js` to CommonJS format to `lib/net.js` but also into `demo/net.js` in SystemJS format (with all of the tes files in `src/test/`) for testing using JSPM.

Testing a WinRT app is a bit trickier since it's not that simple to run batch of automated test like Mocha. And the nature of sockets and networking throws unpredictability into the mix, making it even worse. I'm open to advices but for now testing looks like this.
1) Pick a script file to run and define it in `demo/run.js` like so `System.import('demo/test/client1.js');`
2) Run the demo app through Visual Studio
3) Compare results with the real Node.JS by running 
```
jspm run demo/run.js
```
Note: this runs the same script file you defined in `demo/run.js` but JSPM handles the `System.import()` module loading syntax and uses real Node `net` module whereas in the WinRT App the `demo/net.js` is loaded in place of the `net`.

Or you can simply run the file directly.
```
jspm run demo/test/server1.js
```

## license

MIT. Copyright (c) Mike Kovařík
