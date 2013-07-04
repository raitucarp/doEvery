var exec =  require('child_process').exec,
  wtn  =  require('wtn'),
  events = require('events'),
  util = require("util");

var EveryException = function (message, name) {
    this.message = message;
    this.name = name;
  };

function bash() {
  'use strict';
  var arg = [], i;
  for (i = 0; i < arguments.length; i++) {
    arg.push(arguments[i]);
  }
  arg = arg.join(' && ');
  exec(arg, function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  });
}

var doEvery = function (timing, sh) {
  this.option = {};
  this._pause = false;
  this._resume = false;
  this._done  = false;
  this._tick  = 0;
  this.tickTask = [];
  this.data   = {
    hits: 0,
    isPause: false,
    hitTask: []
  };
  this.bashCommand = null;
  this._v = 1;

  var interval = 0, i;
  var
    ms      = 1000,
    second  = ms, seconds = second,
    minute  = 60 * seconds, minutes = minute,
    hour    = 60 * minutes, hours   = hour,
    day     = 24 * hours,   days    = day,
    week    = 7 * days,     weeks   = week,
    month   = 30 * days,    months  = month,
    year    = 365 * days,   years   = year;

  events.EventEmitter.call(this);
  var timeType = parseInt(timing, 10) || undefined;
  if (timeType === undefined) {
    var timingSplit = timing.split(',');
    for (i = 0; i < timingSplit.length; i++) {
      if (!!timingSplit[i].match(/(second|minute|hour|day|week|month|year)s?/g) === true) {
        var
          time = timingSplit[i].replace(/^\s+|\s+$/g, '').split(' '),
          timeUnit = time[time.length - 1];

        time.pop();
        time = time.join(' ');

        timeUnit = timeUnit
                  .replace(/\b(seconds?)\b/g, seconds)
                  .replace(/\b(minutes?)\b/g, minutes)
                  .replace(/\b(hours?)\b/g, hours)
                  .replace(/\b(days?)\b/g, days)
                  .replace(/\b(weeks?)\b/g, weeks)
                  .replace(/\b(months?)\b/g, months)
                  .replace(/\b(years?)\b/g, years);

        interval += parseInt(wtn.convert(time), 10) * timeUnit;
      } else {
        throw new EveryException("InvalidFormat", "There is one invalid Interval format");
      }
    }
  } else {
    interval = timing * seconds;
  }
  this.interval = interval;

  if (typeof sh === 'string') {
    this.bashCommand = sh;
  }
};

doEvery.prototype.getInterval = function () {
  return this.interval;
};

doEvery.prototype.start = function () {
  this._pause = false;
  this._resume = false;
  this._done  = false;
  this._tick  = 0;
  this.data.hits = 0;
  this.data.isPause = 0;
  this.bashCommand = null;
  this.tickStartTime = Date.now();
  this.tickPreviousTime = 0;
  this.tickEndTime = 0;
  this.startTime = Date.now();
  this.previousTime = 0;
  this.endTime = 0;

  var
    self     = this,
    tick     = this._tick,
    interval = this.getInterval(),
    bash     = false;

  this.data.isPause = false;
  this.data.intervalId = setInterval(function () {
    if (tick === 0) {
      self.emit('start');
    }
    tick++;
    if (self.tickTask[tick] !== undefined) {
      self.tickTask[tick]();
    }

    var tickEndTime = Date.now(),
      elapsedTime,
      tickPreviousTime = self.tickPreviousTime;

    if (tick === 1) {
      elapsedTime = tickEndTime - self.tickStartTime;
    } else {
      elapsedTime = tickEndTime - tickPreviousTime;
    }
    self.tickPreviousTime = tickEndTime;
    self.emit('tick', tick, elapsedTime);
    if (self.data.isPause === false) {
      if (self.bashCommand !== null) {
        bash = true;
      }
      self.runJob(bash);
    }
  }, interval);
};

doEvery.prototype.runJob = function (isBash) {
  var
    intervalId = this.data.intervalId,
    elapsedTime;
  this.data.hits++;
  if (isBash === true) {
    bash(this.data.bashCommand);
  }
  if (this.data.hitTask[this.data.hits] !== undefined) {
    this.data.hitTask[this.data.hits](intervalId);
  }
  var endTime = Date.now();
  if (this.data.hits === 1) {
    elapsedTime = endTime - this.startTime;
  } else {
    elapsedTime = endTime - this.previousTime;
  }
  this.previousTime = endTime;
  this.emit('hit', this.data.hits, elapsedTime);
  if (this.data.hits === this.option.limit) {
    this.stop();
  }
};

doEvery.prototype.hit = function (n, fn) {
  this.data.hitTask[n] = fn;
};

doEvery.prototype.tick = function (n, fn) {
  this.tickTask[n] = fn;
};

doEvery.prototype.stop = function (fn) {
  var self = this;
  this.emit('end');
  process.nextTick(function () {
    clearInterval(self.data.intervalId);
    if (fn !== undefined) {
      fn();
    }
  });
};

doEvery.prototype.pause = function () {
  var self = this;
  process.nextTick(function () {
    self.emit('pause');
    self.data.isPause = true;
  });
};

doEvery.prototype.resume = function () {
  var self = this;
  process.nextTick(function () {
    self.emit('resume');
    self.data.isPause = false;
  });
};

doEvery.prototype.restart = function () {
  var self = this;
  process.nextTick(function () {
    self.stop(function () {
      self._v++;
      self.emit('restart');
      self.start();
    });
  });
};

doEvery.prototype.set = function (name, value) {
  var
    i,
    self = this;
  self.option[name] = value;
};

doEvery.prototype.getVersion = function () {
  return this._v;
};

doEvery.prototype.__proto__ = events.EventEmitter.prototype;
module.exports = doEvery;