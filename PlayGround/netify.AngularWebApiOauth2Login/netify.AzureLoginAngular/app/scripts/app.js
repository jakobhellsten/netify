'use strict';

/**
 * @ngdoc overview
 * @name netifyazureLoginAngularApp
 * @description
 * # netifyazureLoginAngularApp
 *
 * Main module of the application.
 */
angular
  .module('netifyazureLoginAngularApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'AdalAngular'
  ])
  .config(['$routeProvider', '$httpProvider', 'adalAuthenticationServiceProvider', function ($routeProvider, $httpProvider, adalProvider) {

    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main',
        requireADLogin: true,
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about',
        requireADLogin: true,
      })
      .when('/user', {
        templateUrl: 'views/user.html',
        controller: 'UserCtrl',
        controllerAs: 'user',
        requireADLogin: true,
      })
      .otherwise({
        redirectTo: '/'
      });

    var endpoints = {

        // Map the location of a request to an API to a the identifier of the associated resource
        "https://jakobhellstengmail.onmicrosoft.com":
        "https://jakobhellstengmail.onmicrosoft.com/netify.AzureLoginWebApi",

    };

    adalProvider.init(
        {
            instance: 'https://login.microsoftonline.com/',
            tenant: 'jakobhellstengmail.onmicrosoft.com',
            clientId: 'd8ba5d89-2e0c-40c9-a2e9-4d6bd5369d21',
            extraQueryParameter: 'nux=1',
            endpoints: endpoints,
            //cacheLocation: 'localStorage', // enable this for IE, as sessionStorage does not work for localhost.  
            // Also, token acquisition for the To Go API will fail in IE when running on localhost, due to IE security restrictions.
        },
        $httpProvider
        );

 }]);
