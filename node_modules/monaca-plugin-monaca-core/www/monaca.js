/**
 *
 * Copyright (c) 2014, Asial Corporation
 */

	var monaca = function() {};
	
    monaca.prototype.getDeviceId = function(callback) {
               return cordova.exec(function(result) {
                       callback(result.deviceId);
                       },
                        null, 'Monaca', 'getRuntimeConfiguration', []);
    };
    module.exports = new monaca();