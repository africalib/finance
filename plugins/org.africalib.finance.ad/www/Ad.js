var exec = require('cordova/exec');

function plugin() {

}

plugin.prototype.pop = function() {
    exec(function(res){}, function(err){}, "Ad", "pop", []);
}

module.exports = new plugin();