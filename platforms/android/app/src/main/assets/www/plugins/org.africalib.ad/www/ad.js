cordova.define("org.africalib.ad.ad", function(require, exports, module) {
var exec = require('cordova/exec');

function plugin() {

}

plugin.prototype.new_activity = function() {
    exec(function(res){}, function(err){}, "Ad", "new_activity", []);
}

module.exports = new plugin();
});
