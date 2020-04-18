cordova.define("org.africalib.finance.ad.Ad", function(require, exports, module) {
var exec = require('cordova/exec');

function plugin() {

}

plugin.prototype.pop = function() {
    exec(function(res){}, function(err){}, "Ad", "pop", []);
}

module.exports = new plugin();
});
