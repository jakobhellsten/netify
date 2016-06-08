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
        "https://jakobhellstengmail.onmicrosoft.com/netify.AngularAdalAzureLogin",

    };

    adalProvider.init(
        {
            instance: 'https://login.microsoftonline.com/',
            tenant: 'jakobhellstengmail.onmicrosoft.com',
            clientId: '2165365b-2528-4ac3-88b6-4eb6c9c3f0c3',
            extraQueryParameter: 'nux=1',
            endpoints: endpoints,
            //cacheLocation: 'localStorage', // enablehttp://localhost:4844/../styles/main.css this for IE, as sessionStorage does not work for localhost.  
            // Also, token acquisition for the API will fail in IE when running on localhost, due to IE security restrictions.
        },
        $httpProvider
        );

 }]);
