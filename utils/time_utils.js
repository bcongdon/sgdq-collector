var exports = module.exports;

exports.getTimeStamp = function(time){
  time = time || new Date();
  time.setSeconds(0);
  time.setMilliseconds(0);
  return time.getTime();
}