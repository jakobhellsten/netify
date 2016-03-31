'use strict';

/**
 * @ngdoc function
 * @name netifyazureLoginAngularApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the netifyazureLoginAngularApp
 */
angular.module('netifyazureLoginAngularApp')
  .controller('MainCtrl', [ ['$scope', 'adalAuthenticationService','$location', function ($scope, adalService, $location) {

      $scope.login = function () {
          adalService.login();
      };
      $scope.logout = function () {
          adalService.logOut();
      };
      $scope.isActive = function (viewLocation) {        
          return viewLocation === $location.path();
      };

    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  }]);
