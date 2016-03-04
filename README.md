![](http://i.imgur.com/3lFs20I.png)  
# Breadboard

Breadboard is an Inversion of Control container for Node.js applications.

Breadboard will load all your application's dependencies, all Node library code
and all of your application's modules into a `dependencies` object. The object is
exposed to your application's modules by calling the modules as functions, passing the
dependencies as an argument.

## Install

```
npm install breadboard
```

## Template for a module in your application

```js

//startServer.js

// wrap module in factory function
module.exports = (dependencies) => {

  // collect third party dependencies for this module in the factory scope
  const debug = dependencies['debug'];

  // collect application module dependencies for this module. Keys are relative to `containerRoot`
  const createServer = dependencies['/lib/createServer'];

  // return the core functionality of the module
  return () => {
    const server = createServer();

    server.listen(80, () => {
      debug('Server listening on port 80');
    });
  };

};
```

The IoC should be initialised when your application is started:

```js

const breadboard = require('breadboard');

breadboard({
  entry: '/index',
  containerRoot: 'app'
}).then(() => {
  console.log('Application started');
});

```

This returns a promise.

### `entry`

Module key for the entry point of the application. Will be executed after dependency injection has finished.

### `containerRoot`

root directory of the application from which all module keys will be resolved
