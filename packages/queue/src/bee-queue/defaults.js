/*!-----------------------------------------------------------
* Original work Copyright (c) 2015 Lewis J Ellis
* Subsequent revisions Copyright (c) 2017 Mixmax, Inc and Lewis J Ellis
* Released under MIT license
* https://github.com/bee-queue/bee-queue/blob/master/LICENSE
*-----------------------------------------------------------*/

//https://github.com/bee-queue/bee-queue/blob/1c2fb849708881408fe22c6527e3f62c33a58755/lib/defaults.js
module.exports = {
    stallInterval: 5000,
    // Avoid scheduling timers for further out than this period of time. The workers will all poll on
    // this interval, at minimum, to find new delayed jobs.
    nearTermWindow: 20 * 60 * 1000,
    // Avoids rapid churn during processing of nearly-concurrent events.
    delayedDebounce: 1000,
    prefix: 'bq',
    isWorker: true,
    getEvents: true,
    ensureScripts: true,
    processDelayed: false,
    sendEvents: true,
    storeJobs: true,
    removeOnSuccess: false,
    removeOnFailure: false,
    catchExceptions: false,
  
    // Method-specific defaults.
    '#close': {
      timeout: 5000
    },
  
    '#process': {
      concurrency: 1
    }
  };