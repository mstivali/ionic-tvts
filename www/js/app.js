// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', [
  'ionic', 
  'starter.controllers', 
  'akoenig.deckgrid',
  'testService'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'AppCtrl'
  })

  .state('app.dashboard', {
    url: "/dashboard",
    views: {
      'menuContent': {
        templateUrl: "templates/dashboard.html"
      }
    }
  })

  .state('app.inventory', {
    url: "/inventory",
    views: {
      'menuContent': {
        templateUrl: "templates/inventory.html",
        controller : 'InventoryController'
      }
    }
  })
    .state('app.models', {
      url: "/models",
      views: {
        'menuContent': {
          templateUrl: "templates/models.html",
          controller: 'ModelsController'
        }
      }
    })

  .state('app.styles', {
    url: "/models/:modelId",
    views: {
      'menuContent': {
        templateUrl: "templates/styles.html",
        controller: 'StylesController'
      }
    }
  })

  .state('app.style-details', {
    url: "/styles/:modelName/:modelId/:styleTrim/:styleId",
    views: {
      'menuContent' : {
        templateUrl : "templates/style-details.html",
        controller : "StyleDetailController"
      }
    }
  })

  .state('app.vehicle-specs', {
    url: "/specs/:ModelName/:StyleTrim/:StyleId",
    views: {
      'menuContent' : {
        templateUrl : "templates/vehicle-specs.html",
        controller : "VehicleSpecsController"
      }
    }
  })

  .state('app.confirm-purchase', {
    url:"/purchase/:modelId/:modelName/:styleTrim/:styleId",
    views: {
      'menuContent' : {
        templateUrl : "templates/purchase-summary.html",
        controller : "PurchaseSummaryController"
      }
    }
  })

  .state('app.sales', {
    url:"/sales",
    views: {
      'menuContent' : {
        templateUrl : "templates/sales.html",
        controller : "SalesController"
      }
    }
  })

  .state('app.customer-registration', {
    url:"/registration",
    views: {
      'menuContent' : {
        templateUrl : "templates/customer-registration.html",
        controller : "CustomerRegistration"
      }
    }
  })

  .state('app.customers-list', {
    url:"/customers",
    views: {
      'menuContent' : {
        templateUrl : "templates/customers.html",
        controller : "CustomersController"
      }
    }
  })

  .state('app.customers-purchase', {
    url:"/customers/:customerId/:firstname/:lastname/:phone/:email",
    views: {
      'menuContent' : {
        templateUrl : "templates/customer-purchase.html",
        controller : "CustomerPurchaseController"
      }
    }
  });



  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/models');
});
