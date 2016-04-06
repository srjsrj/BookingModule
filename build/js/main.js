'use strict';

(function() {
    var bookingApp = angular.module('bookingApp', ['datePicker']);

    bookingApp.controller('hotelCardController', function($scope, $timeout) {
        $scope.disabledForm = false;

        $scope.processForm = function() {
            $scope.disabledForm = true;

            $timeout(function() {
                alert('Thanks for looking my app! Waiting for a feedback. Best, Sergey');
                $scope.disabledForm = false;
            }, 1500);
        };
    });

}());