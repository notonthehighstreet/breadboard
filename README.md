![](http://i.imgur.com/3lFs20I.png)

# Breadboard
[![Code Climate](https://codeclimate.com/github/notonthehighstreet/breadboard/badges/gpa.svg)](https://codeclimate.com/github/notonthehighstreet/breadboard)
[![Test Coverage](https://codeclimate.com/github/notonthehighstreet/breadboard/badges/coverage.svg)](https://codeclimate.com/github/notonthehighstreet/breadboard/coverage)
[![Build Status](https://travis-ci.org/notonthehighstreet/breadboard.svg?branch=master)](https://travis-ci.org/notonthehighstreet/breadboard)

Breadboard is an opinionated inversion of control container for Node.js applications.

## Motivation
* Working with `require` is less than ideal.
  * The same module will have a different key depending on the path of the requiring module.
  * Testing a module in isolation, ie. mocking its dependencies, requires hacky solutions that hijack `require` calls. This approach is indeterministic, depending on various seemingly unrelated conditions around how the the module you want to mock was defined.
* Discouraging managing state of the app through side effects when `require`ing.
* Single function call to auto-mock a module's dependencies in your tests.

Breadboard will lazily require all your application's dependencies defined in `package.json`, all Node native modules and all of your application's modules and store them in a `dependencies` object. The object is exposed to your application's modules by calling the modules as functions, passing the dependencies as an argument. As such, your modules are expected to be wrapped in an extra function returning the desired export value, which Breadboard then calls on application start.

## Install
```
npm install breadboard
```

## Example of a module in your application

Consider this CommonJS module:
```js
//startServer.js

const d = require('debug')('myApp');
const createServer = require('./lib/createServer');

module.exports = () => {
  const server = createServer();

  server.listen(80, () => {
    d('Server listening on port 80');
  });

  return server;
};
```

The Breadboard equivalent would be:
```js
//startServer.js

// wrap module in factory function
module.exports = ({ // destructure dependencies to get the modules needed
    debug,
    '/lib/createServer': createServer
  }) => {
  // return the core functionality of the module as a function
  return () => {
    const server = createServer();
    const d = debug('myApp');

    server.listen(80, () => {
      d('Server listening on port 80');
    });

    return server;
  };
};
```

To start your application:
```js

const breadboard = require('breadboard');

breadboard({
  entry: '/index',
  containerRoot: 'app',
  initialState: {
    arbitrary: 'state data'
  },
  blacklist: ['newrelic']
}).then(({deps, entryResolveValue}) => {
  console.log('Application started', deps, entryResolveValue);
});
```

## Further examples

Take a look at `examples/kitchen`. To run, `npm install` then `npm start`.

## Module keys
Module keys in a Breadboard app are static, ie. are always relative to the container's root folder, starting with `/`, and always using `/` as path separators, no matter the platform. Consider these example module keys:
```
/lib/getUser
/middleware/getUser
/logger
```
Keys for native Node.js modules and 3rd party modules remain the same as if you were using `require`.
Breadboard also loads all JSON files. To access them, append `.json` to the end of the key, eg. `/data/userPasswords.json`.

## Prerequisites
Node.js ~4.4

## API
`breadboard(options)`

Returns a promise chained to the return value of your application's entry point, which might be another promise or a concrete value.
### `options`
#### `options.entry` (String | Function&lt;Object&gt;)
##### String
Module key for the entry point of the application.
##### Function&lt;Object&gt;
Will be called as the entry point module, with resolved dependencies as the argument.
#### `options.containerRoot` (String)
Path relative to the current working directory, from which all module keys will be resolved
#### `options.initialState` (Object)
The argument the `entry` function will be called with.
#### `options.blacklist` (Array&lt;String&gt;)
List of modules from your `package.json` which you wish Breadboard not to load. If you want to defer a `require` call to a 3rd party module, put it in the `blacklist` and `require` manually in your code.
#### `options.substitutes` (Object)
A Breadboard module-key to module mapping to indicate which modules you want to substitute across the whole application with your custom implementation. Useful when testing integration of multiple modules. You could substitute eg. a database connector with a stub to remove a running database as a dependency of your tests.

## Testing
In tests require your Breadboard modules as if they were CommonJS modules. You can then supply your own stubs and spies as test doubles. Consider the following example:
### Test subject module `/index`
```js
module.exports = (deps) => {
  return () => {
    const {
      '/widgets/createDough': createDough,
      '/pasta/createPapardelle': createPapardelle,
      'debug': debug
    } = deps;
    const d = debug('pasta');

    d(createPapardelle(createDough()));
  };
};
```
### Test for `/index`
```js
import { expect } from 'chai';
import mainFactory from '../../app/index';
import sinon from 'sinon';

describe('Main', () => {
  const sandbox = sinon.sandbox.create();
  const debugSpy = sandbox.spy();
  const mockDough = 'dough';
  const mockDependencies = {
    debug: sandbox.stub().returns(debugSpy),
    '/widgets/createDough': sandbox.stub().returns(mockDough),
    '/pasta/createPapardelle': sandbox.spy()
  };
  let main;

  beforeEach(() => {
    main = mainFactory(mockDependencies);
  });
  afterEach(() => {
    sandbox.reset();
  });
  it('calls debug', () => {
    main();
    expect(mockDependencies.debug.calledOnce).to.be.true;
  });
  it('calls createDough', () => {
    main();
    expect(mockDependencies['/widgets/createDough'].calledOnce).to.be.true;
  });
  it('calls createPapardelle with createDough return value', () => {
    main();
    expect(mockDependencies['/pasta/createPapardelle'].calledWith(mockDough)).to.be.true;
  });
});
```

### `autoMock`
`autoMock` automatically replaces every dependency of a given Breadboard module with a [Sinon.JS stub](http://sinonjs.org/docs/#stubs).

### `autoMock` API

`autoMock(factory, options)`
#### `factory` (Function)
The Breadboard factory function to build the subject to test.
#### `options` (Object)
##### `options.mocks` (Object)
A Breadboard module-key to module mapping to indicate which modules you want to mock manually.
#### returns Object&lt;subject, deps, sandbox&gt;
##### `subject`
The module returned by `factory`.
##### `deps`
The mock dependencies injected into `subject`.
##### `sandbox`
Instance of a [Sinon.JS sandbox](http://sinonjs.org/docs/#sandbox).

### `autoMock` example
#### Test subject module `/index`
```js
module.exports = (deps) => {
  return function main() {
    const {
      '/widgets/createDough': createDough,
      '/pasta/createPapardelle': createPapardelle,
      'debug': debug
    } = deps;
    const d = debug('pasta');

    d(createPapardelle(createDough()));
  };
};
```
#### Test for module `/index`
```js
import { expect } from 'chai';
import mainFactory from '../../app/index';
import autoMock from 'breadboard/lib/autoMock';

const mockDough = 'dough';
const {subject: main, sandbox, deps} = autoMock(mainFactory);
const debugSpy = sandbox.spy();

deps.debug.returns(debugSpy);
deps['/widgets/createDough'].returns(mockDough);
describe('Main', () => {
  afterEach(() => {
    sandbox.reset();
  });
  it('calls debug', () => {
    main();
    expect(deps.debug.calledOnce).to.be.true;
  });
  it('calls createDough', () => {
    main();
    expect(deps['/widgets/createDough'].calledOnce).to.be.true;
  });
  it('calls createPapardelle with createDough return value', () => {
    main();
    expect(deps['/pasta/createPapardelle'].calledWith(mockDough)).to.be.true;
  });
});
```
