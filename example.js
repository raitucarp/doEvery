var doEvery = require('./index'); /* you can replace with require('doEvery') */

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