/*!-----------------------------------------------------------
* Original work Copyright (c) 2015 Lewis J Ellis
* Subsequent revisions Copyright (c) 2017 Mixmax, Inc and Lewis J Ellis
* Released under MIT license
* https://github.com/bee-queue/bee-queue/blob/master/LICENSE
*-----------------------------------------------------------*/

//https://github.com/bee-queue/bee-queue/blob/1c2fb849708881408fe22c6527e3f62c33a58755/lib/helpers.js
const arraySlice = Array.prototype.slice;

function toArray(arrayLike) {
  return arraySlice.call(arrayLike);
}

/*!-----------------------------------------------------------
* Copyright (c) 2017 Mixmax, Inc
* Released under MIT license
* https://github.com/mixmaxhq/promise-callbacks/blob/master/LICENSE
*-----------------------------------------------------------*/
var tick = typeof process === 'object' ? process.nextTick : function (fn) {
  return setTimeout(function () {
    return fn();
  }, 0);
};
var sentinel = Object.create(null);
function callbackBuilder(resolve, reject, options) {
  var variadic;

  if (options) {
    variadic = options.variadic;
  }

  var called = false;
  return function callback(err, value) {
    if (called) {
      throw new Error('the deferred callback has already been called');
    }

    called = true;

    if (err) {
      reject(err);
    } else if (Array.isArray(variadic)) {
      var obj = {};

      for (var i = 0; i < variadic.length; i++) {
        obj[variadic[i]] = arguments[i + 1];
      }

      resolve(obj);
    } else if (variadic) {
      var args = new Array(arguments.length - 1);

      for (var _i = 0; _i < args.length; ++_i) {
        args[_i] = arguments[_i + 1];
      }

      resolve(args);
    } else {
      resolve(value);
    }
  };
};
function asCallback(promise, cb) {
  if (typeof cb !== 'function') {
    throw new TypeError('callback must be a function');
  }

  var callback = function callback() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return tick(function () {
      return cb.apply(void 0, args);
    });
  };

  promise.then(function (res) {
    return callback(null, res);
  }, callback);
};
function deferred(options) {
  var args = null;
  var promise = new Promise(function (resolve, reject) {
    return args = [resolve, reject, options];
  });

  promise.defer = function defer() {
    if (!args) throw new Error('defer has already been called');
    var callback = callbackBuilder.apply(undefined, args);
    args = null;
    return callback;
  };

  return promise;
};
function delay(time, value) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, time, value);
  });
};
function waitOn(emitter, event, waitError) {
  if (waitError) {
    return new Promise(function (resolve, reject) {
      function unbind() {
        emitter.removeListener('error', onError);
        emitter.removeListener(event, onEvent);
      }

      function onEvent(value) {
        unbind();
        resolve(value);
      }

      function onError(err) {
        unbind();
        reject(err);
      }

      emitter.on('error', onError);
      emitter.on(event, onEvent);
    });
  }

  return new Promise(function (resolve) {
    return emitter.once(event, resolve);
  });
};
class TimeoutError extends Error {};
function withTimeout(promise, delay, message) {
  var timeout;
  var timeoutPromise = new Promise(function (resolve, reject) {
    // Instantiate the error here to capture a more useful stack trace.
    var error = message instanceof Error ? message : new TimeoutError(message || 'Operation timed out.');
    timeout = setTimeout(reject, delay, error);
  });
  return Promise.race([promise, timeoutPromise]).then(function (value) {
    clearTimeout(timeout);
    return value;
  }, function (err) {
    clearTimeout(timeout);
    throw err;
  });
};
function wrapAsync(fn, options) {
  var catchExceptions = options && options.catchExceptions;

  if (typeof catchExceptions !== 'boolean') {
    catchExceptions = true;
  }
  return function asyncWrapper() {
    var _arguments = arguments,
        _this = this;

    var syncErr = sentinel;
    var promise = new Promise(function (resolve, reject) {
      var cb = callbackBuilder(resolve, reject, options),
          args = Array.from(_arguments);
      args.push(cb);
      var res;

      try {
        res = fn.apply(_this, args);
      } catch (e) {
        if (catchExceptions) {
          reject(e);
        } else {
          syncErr = e; // Resolve to avoid an unhandled rejection if the function called the callback before
          // throwing the synchronous exception.

          resolve();
        }

        return;
      }

      if (res && typeof res.then === 'function') {
        resolve(res);
      }
    }); // Throw the synchronous error here instead of inside the Promise callback so that it actually
    // throws outside.

    if (syncErr !== sentinel) throw syncErr;
    return promise;
  };
};
module.exports = {
  asCallback,
  deferred,
  delay,
  waitOn,
  withTimeout,
  wrapAsync,
  toArray,
};