# What is doevery?
**doevery** is node.js module that extends setInterval, create more powerful task management (worker, jobs) with custom interval

# Installation

	npm install doevery

# Example
    var doEvery = require('doevery');
    
    var task = new doEvery('two seconds'); /* You can pass integer as first argument */
    
    /* set the limit, you can set other option by using .set(name, value) */
    task.set('limit', 30);
    
    /* start task */
    task.start();
    
    /* listen on hit event */
    task.on('hit', function (n, elapsedTime) {
      console.log('hit: ' + n + ', elapsedTime: ' + elapsedTime);
    });
    
    /* run special task when hit n */
    task.hit(2, function () {
      var version = task.getVersion();
      /* check whether task version is 3 or not, after restart, task version do increment its value automatically  */
      if (version === 3) {
    console.log("Task version is 3, I should stop these processes");
    /* or you can run your code here */
    task.stop();
      } else {
    console.log('because task version < 3. this is subtask of 2nd hit');
    task.pause();
      }
    });
    
    task.hit(5, function (intervalId) {
      console.log('this is subtask of 5th hit');
    });
    
    task.hit(10, function (intervalId) {
      console.log('Restart task. After restart, task version will be v' + parseInt(task.getVersion() + 1, 10));
      task.restart();
    });
    
    /* run code when tick reach 10 */
    task.tick(10, function () {
      console.log('his is 10th tick, and ....');
      task.resume();
    });
    
    /* listen on tick event */
    task.on('tick', function (n, elapsedTime) {
      console.log('tick: ' + n + ', elapsedTime: ' + elapsedTime);
    });
    
    /* Start, restart, end event */
    
    task.on('start', function () {
      console.log("START");
      console.log("task version: v" + task.getVersion());
    });
    
    task.on('pause', function () {
      console.log('pause task');
    });
    
    task.on('resume', function () {
      console.log('resume the process');
    });
    
    task.on('restart', function () {
      console.log('please wait restart process');
    });
    
    task.on('end', function () {
      console.log('task end');
    });

# Documentation

## Initialization ##
### var task = new doevery(timing, [shellCommand]) ###

You can create new task with very simple init script: 

    var doEvery = require('doevery');
    var task = new doEvery('two seconds');

doevery takes two arguments, first argument is timing options in string (because I use wtn module to parse words to number, you can read the topic [http://github.com/raitucarp/wtn](http://github.com/raitucarp/wtn)), but you can also pass integer to it. Second argument is shellCommand, if you want run shell command.

If you pass string as first argument, you can additional time separate by comma:

    var task = new doevery('two weeks, three days, eight hours');

## Method list #Task ##

### task.pause() ###

Pause current repeating task. However tick still running

### task.resume() ###

Resume current task, after you pause the task.

### task.restart() ####

Restart task, it will increase version number of current task.

### task.getVersion() ###

Get version of your current task. Version number is task version based on how much you restarting the task. It automatically will increase its value after you restart the task. [task.restart()] 

### task.hit(n, callback) ###

You can create subtask when hit reach **n** number. Example:

    task.hit(19, function(){
        /* this code will be running on 19th tick, 
           if your task is run every three seconds, 
           this code run after 19 x 3 = 57 seconds,
           However, when you pause the task before it hits 19
           this code will not run, unless you resume it 
        */
        console.log('19th hit cool');
    });

Note that, hit is the main process of your task. You can pause, and resume it. It's differ with tick (which is always running, you can't pause nor resume it) 

### task.tick(n, callback) ###

Tick is a special. Tick always running, you can't pause it, resume it. But when you restart your task, the counter will be restart as normal as hit

    task.tick(30, function(){
      /* if your task is every two seconds, tick always running every two seconds, and when it reach 30 tick (60 seconds), this code will running */
      console.log('awesome 30th tick');
    });

## Event Listener ##
### task.on(type, callback) ###


There are basic type of event listener, callback has no returns data : 

#### start ####
Listening when task is starting

    task.on('start', function(){
      /* your code here  */ 
    });

    
#### pause ####
Listening when pause the task:

    task.hit(5, function(){
      task.pause();
    });

    task.on('pause', function(){
       /* your code here */
    });


#### resume ####

Listening when  resume the task;

    task.tick(10, function(){
      task.resume();
    });
    
    task.on('resume', function(){
       console.log('resume the process');
    });

#### stop ####

Listening when you stop your task:

    task.hit(10, function(){
      task.stop();
    });
    
    task.on('stop', function(){
      console.log('STOP NOW!!!');
    });

#### restart ####

Listening when you restarting your task:

    task.hit(16, function(){
      task.restart();
    });
    
    task.on('restart', function(){
      console.log('restarting the task');
    });
    

**Special listeners**

#### hit ####
Run your code when interval hit your task. Suppose you have two seconds of task. You can run task every two seconds.

Callback returning two data, first it's n hits, second: elapsed time in ms, it will tell you the benchmark when you run sub task, and previous task

    task.hit(20, function(){
      /* do heavy code here */
    });
    
    task.on('hit', function(n, elapsedTime){
       console.log('this is ' + n + 'th hit, and take: ' + elapsedTime + 'ms');
    });
    
Notice that if you pause your task, hit listener will not run the callback. Unless you resume it. 

#### tick ####
Listening every tick. Suppose you have task that runs every 30 minutes. Every 30 minutes. You can't pause this listener.

    task.on('tick', function(n, elapsedTime){
      console.log('awesome tick : ' + n + ', elapsedTime: '+ elapsedTime);
    });


## License ##
The MIT License (MIT)

Copyright (c) 2013 <ribhararnus.pracutiar@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. 