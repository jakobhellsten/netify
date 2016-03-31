'use strict';

/**
 * @ngdoc function
 * @name netifyazureLoginAngularApp.controller:UserCtrl
 * @description
 * # UserCtrl
 * Controller of the netifyazureLoginAngularApp
 */

angular.module('netifyazureLoginAngularApp')
.controller('UserCtrl', ['$scope', 'adalAuthenticationService', function ($scope, adalService) {
    
    $scope.claims = [];

    for (var property in adalService.userInfo.profile) {
        if (adalService.userInfo.profile.hasOwnProperty(property)) {
            $scope.claims.push({
                key: property,
                value: adalService.userInfo.profile[property],
            });
        }
    }
}]);