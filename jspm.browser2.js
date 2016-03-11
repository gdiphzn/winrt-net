// This is just a desperate hack to make JSPM load custom js file where 'net' is imported
// but when loaded in Node using 'jspm run' is loads the built in 'net' module
// I hoped there would be simpler way to config what to load in different enviroments
// but it is unfortunately only possible (at the time of writing this - JSPM 0.17 beta)
// in package.json and it only works during installation of the module.
SystemJS.config({
  map: {
    "net": "demo/net.js"
  }
});
