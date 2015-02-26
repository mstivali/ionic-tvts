'use strict';

/* Services */

var module = angular.module('testService', []);

module.factory('VehiclePurchase', function() {
    
    var vehicleOptions;
    var vehicleColors = "NONE";

    return {
        setVehicleOptions: function(options) {
            vehicleOptions = options;
        },
        getVehicleOptions: function() {
            return vehicleOptions;
        },
        setVehicleColors: function(colors) {
            vehicleColors = colors;
        },
        getVehicleColors: function() {
            return vehicleColors;
        }
    };

});