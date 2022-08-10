/*!-----------------------------------------------------------
* Original work Copyright (c) 2015 Lewis J Ellis
* Subsequent revisions Copyright (c) 2017 Mixmax, Inc and Lewis J Ellis
* Released under MIT license
* https://github.com/bee-queue/bee-queue/blob/master/LICENSE
*-----------------------------------------------------------*/

//https://github.com/bee-queue/bee-queue/blob/1c2fb849708881408fe22c6527e3f62c33a58755/lib/backoff.js
const strategies = new Map();

strategies.set('immediate', () => 0);

strategies.set('fixed', (job) => job.options.backoff.delay);

strategies.set('exponential', (job) => {
  const backoff = job.options.backoff, delay = backoff.delay;
  backoff.delay *= 2;
  return delay;
});

module.exports = strategies;