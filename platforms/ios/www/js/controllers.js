angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('ModelsController', function($scope, $http) {

  $http.get('cars/cars.json').success(function(data) {
      $scope.models = data;
    });
})

.controller('StylesController', function($scope, $http, $stateParams) {

  $scope.modelId = $stateParams.modelId;

  $http({
    url: 'http://tvts-api.azurewebsites.net/api/styles', 
    method: "GET",
    params: {modelId: $stateParams.modelId}
  }).success(function(data){
     $scope.styles = data.Styles;
  })

})

.controller("StyleDetailController", function($scope, $http, $stateParams) {
  
});

