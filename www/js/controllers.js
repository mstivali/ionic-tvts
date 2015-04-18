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

  // $http.get('cars/cars.json').success(function(data) {
  //     $scope.models = data;
  //   });

  $http({
    url: 'http://tvts.azurewebsites.net/api/cars', 
    method: "GET",
  }).success(function(data){
     $scope.models = data;
  })

})

.controller('StylesController', function($scope, $http, $stateParams) {

  $scope.modelId = $stateParams.modelId;

  $http({
    url: 'http://tvts.azurewebsites.net/api/styles', 
    method: "GET",
    params: {modelId: $stateParams.modelId}
  }).success(function(data){
      // alert(JSON.stringify(data));
     $scope.styles = data.Styles;
  })

})

.controller("StyleDetailController", 
  function($scope, $http, $stateParams, $state, $ionicPopover, $ionicPopup, VehiclePurchase) {
    
    var modelId = $stateParams.modelId;
    $scope.styleId = $stateParams.styleId;
    $scope.styleTrim = $stateParams.styleTrim;
    $scope.modelName = $stateParams.modelName;

    $scope.imageUrl = "img/cars/" + modelId + ".jpg";

    $http({
        url: 'http://tvts.azurewebsites.net/api/specs', 
        method: "GET",
        params: {styleId: $stateParams.styleId}
      }).success(function(data){
         $scope.engines = data.EngineDetail.Engines;
         $scope.transmissions = data.TransmissionDetail.Transmissions;
         $scope.equipmentArray = data.EquipmentDetail.Equipment;
      });

    $http({
      url:'https://api.edmunds.com/api/vehicle/v2/styles/' 
          + $scope.styleId + '/options',
      method: "GET",
      params: {fmt:'json', api_key:'27ggjjd3tthkmwh72tjgm52f'}
      }).success(function(data) {
      // $scope.options = data.options;
      var options = data.options;

      var optionsData = []
      for(var index in options)
      {
          var temp = {"id":options[index].id,"name":options[index].name, "selected":false};
          // alert(JSON.stringify(temp));
          optionsData.push(temp);
      }

      $scope.optionsData = optionsData;
     
    });

    $http({
      url:'https://api.edmunds.com/api/vehicle/v2/styles/' 
          + $scope.styleId + '/colors',
      method: "GET",
      params: {fmt:'json', api_key:'27ggjjd3tthkmwh72tjgm52f', category:'Exterior'}
    }).success(function(data) {
      // $scope.options = data.options;
      var colors = data.colors;

      var colorsData = []
      for(var index in colors)
      {
          var temp = {"id":colors[index].id,"name":colors[index].name, "selected":false};
          colorsData.push(temp);
      }

      $scope.colorsData = colorsData;

    });

    $ionicPopover.fromTemplateUrl('templates/options-popover.html', {
      scope: $scope,
    }).then(function(popover) {
      $scope.popover = popover;
    });

    $scope.openPopover = function($event) {
      $scope.popover.show($event);
    };
    $scope.closePopover = function() {
      $scope.popover.hide();
    };

    $ionicPopover.fromTemplateUrl('templates/colors-popover.html', {
      scope: $scope,
    }).then(function(popover) {
      $scope.colorPopover = popover;
    })

    $scope.openColorsPopover = function($event) {
      $scope.colorPopover.show($event);
    };
    $scope.closeColorsPopover = function() {
      $scope.colorPopover.hide();
    };

    //Cleanup the popover when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.popover.remove();
    });
    // Execute action on hide popover
    $scope.$on('popover.hidden', function() {
      VehiclePurchase.setVehicleColors($scope.colorsData);
      VehiclePurchase.setVehicleOptions($scope.optionsData);

    });
    // Execute action on remove popover
    $scope.$on('popover.removed', function() {
      // Execute action
    });

    $scope.viewSpecs = function() {
      $state.go("app.vehicle-specs", 
        {
          "modelName": $stateParams.modelName, 
          "styleTrim": $stateParams.styleName, 
          "styleId": $stateParams.styleId, 
        });
    }

    $scope.viewSummary = function() {

      var colors = VehiclePurchase.getVehicleColors();

      var colorWasSelected = function(colors) {

        var selected = false;

        if(colors === "NONE")
        {
          return selected;
        }
        else if(colors != "NONE")
        {
          for(var index in colors)
          {
            if(colors[index].selected == "true")
            {
              selected = true;
              break;
            }
          }
        }

        return selected;

      }

      if(!colorWasSelected(colors))
      {
         var alertPopup = $ionicPopup.alert({
           title: 'Vehicle Color Not Selected',
           subTitle: 'Please Select A Color',
            scope: $scope,
            buttons: [
             {
               text: '<b>Ok</b>',
               type: 'button-assertive',
               onTap: function() { console.log('User forgot to select a color.') }
             }
            ]
           });
      }
      else
      {
         $state.go("app.confirm-purchase", {
            "modelId" : modelId,
            "modelName" : $scope.modelName,
            "styleTrim" : $scope.styleTrim,
            "styleId" : $scope.styleId,
          });
      }

    }
})

.controller("PurchaseSummaryController", function($scope, $http, $state, $ionicPopup, $stateParams, VehiclePurchase) {

      var modelId = $stateParams.modelId;

      $scope.modelName = $stateParams.modelName;
      $scope.styleTrim = $stateParams.styleTrim;
      $scope.styleId = $stateParams.styleId;

      var options = VehiclePurchase.getVehicleOptions();
      var colors = VehiclePurchase.getVehicleColors();

      var processOptions = function(options) {

        var selectedOptions = [];
        var selectedOptionsObject;

        for(var index in options)
        {
          if(options[index].selected == true)
          {
            // alert(JSON.stringify(options[index]));
            selectedOptions.push(options[index]);
          }
        }

        return selectedOptions;
      }

      var processColors = function(colors) {
        var selectedColor;

        for(var index in colors)
        {
          if(colors[index].selected == "true")
          {
            // alert(JSON.stringify(colors[index]));
            selectedColor = colors[index];
          }
        }

        return selectedColor;
      }

      $scope.selectedOptions = processOptions(options);
      $scope.chosenColor = processColors(colors);


      // var colorObject = {"Id":$scope.chosenColor.id,"Name": $scope.chosenColor.name};
      // colorObjectString = JSON.stringify(colorObject);
      // alert(colorObjectString);


      $scope.confirmPurchase = function() {

        $http({
          url: 'http://tvts.azurewebsites.net/api/vehicle/save',
          method: "POST",
          data: {
            "ModelIdName":modelId,
            "ModelName":$scope.modelName, 
            "StyleTrim":$scope.styleTrim, 
            "StyleId":$scope.styleId, 
            "Color":$scope.chosenColor.name
            },
          headers: {'Content-Type': 'application/json'},
        }).then(onSuccess, onError);

        function onSuccess(data) {
         var alertPopup = $ionicPopup.alert({
           title: 'Success',
           subTitle: 'Vehicle added to inventory',
            scope: $scope,
            buttons: [
             {
               text: '<b>Ok</b>',
               type: 'button-assertive',
               onTap: function() { $state.go("app.inventory"); }
             }
            ]
           });

          
        }

        function onError(data) {
          var alertPopup = $ionicPopup.alert({
           title: 'Failure',
           subTitle: 'An error occurred',
            scope: $scope,
            buttons: [
             {
               text: '<b>Ok</b>',
               type: 'button-assertive',
               onTap: function() { console.log('User forgot to select a color.') }
             }
            ]
           });
        }

      }
      
})

.controller("VehicleSpecsController", function($scope, $http, $stateParams) {

      $scope.modelName = $stateParams.ModelName;
      $scope.styleTrim = $stateParams.StyleTrim;
      
      $http({
        url: 'http://tvts.azurewebsites.net/api/specs', 
        method: "GET",
        params: {styleId: $stateParams.StyleId}
      }).success(function(data){
         $scope.engines = data.EngineDetail.Engines;
         $scope.transmissions = data.TransmissionDetail.Transmissions;
         $scope.equipmentArray = data.EquipmentDetail.Equipment;
      });

})

.controller("InventoryController", 
  function($scope, $http, $ionicPopover, $ionicModal, $ionicPopup, $timeout) {

      $http({
        url: 'http://tvts.azurewebsites.net/api/vehicles', 
        method: "GET",
      }).success(function(data){
         $scope.vehicles = data;
         // alert(JSON.stringify(data));
      });
})

.controller("SalesController",  function($scope, $http, $stateParams) {

  

})

.controller("CustomerRegistration",  function($scope, $state, $http, $ionicPopup, $stateParams) {
    
    $scope.master = {};

      $scope.register = function(user) {
        $scope.master = angular.copy(user);

      };

      $scope.reset = function() {
        $scope.user = {};
        $scope.master = {};
      };

      $scope.reset();

      $scope.submitForm = function(user) {
         $scope.master = angular.copy(user);

        $http({
          url: 'http://tvts.azurewebsites.net/api/customer/save',
          method: "POST",
          data: {
            "Firstname":$scope.master.firstName,
            "Lastname":$scope.master.lastName, 
            "Phone":$scope.master.phone, 
            "Email":$scope.master.email
            },
          headers: {'Content-Type': 'application/json'},
        }).then(onSuccess, onError);

        function onSuccess(data) {
         var alertPopup = $ionicPopup.alert({
           title: 'Success',
           subTitle: 'Customer Registered',
            scope: $scope,
            buttons: [
             {
               text: '<b>Ok</b>',
               type: 'button-assertive',
               onTap: function() { $state.go("app.customers-list"); }
             }
            ]
           }); 
        }

        function onError(data) {
          var alertPopup = $ionicPopup.alert({
           title: 'Failure',
           subTitle: 'An error occurred',
            scope: $scope,
            buttons: [
             {
               text: '<b>Ok</b>',
               type: 'button-assertive',
               onTap: function() { }
             }
            ]
           });
        }

      };

})

.controller("CustomersController",  function($scope, $http, $ionicPopup, $stateParams) {

    $scope.mode = $stateParams.mode;

    $http({
        url: 'http://tvts.azurewebsites.net/api/customers', 
        method: "GET",
      }).success(function(data){
         $scope.customers = data;
      });

})

.controller("CustomerDetailController",  function($scope, $http, $ionicPopup, $ionicPopover, $stateParams) {

    var customerId = $stateParams.customerId;
    $scope.firstname  = $stateParams.firstname;
    $scope.lastname = $stateParams.lastname;
    $scope.phone = $stateParams.phone;
    $scope.email = $stateParams.email;
    
    if($stateParams.mode == "master")
    {
      $scope.puchasingState = false;
      $scope.masterState = true;

      $http({
        url: 'http://tvts.azurewebsites.net/api/customer/purchase-records', 
        method: "GET",
        params: {customerId: customerId}
      }).success(function(data){
          $scope.purchases = data;

          if($scope.purchases.length == 0)
          {
            $scope.title = "No Vehicle Purchases On File";
          }
          else
          {
            $scope.title = "Purchased Vehicles";
          }
         
      })
    }
    else
    {
      $scope.purchasingState = true;
      $scope.masterState = false;
      $scope.showPurchases = false;

      $http({
        url: 'http://tvts.azurewebsites.net/api/vehicles', 
        method: "GET",
      }).success(function(data){
         var vehicles = data;
         
         var vehiclesData = []
        for(var index in vehicles)
        {
            var temp = {
                          "Selected":false,
                          "Id":vehicles[index].Id,
                          "ModelName":vehicles[index].ModelName, 
                          "StyleTrim":vehicles[index].StyleTrim,
                          "Color":vehicles[index].Color
                       };

            vehiclesData.push(temp);
        }

        alert(JSON.stringify(vehiclesData));
        $scope.vehiclesData = vehiclesData;

      });
    }

    

    $scope.purchaseVehicle = function() {

      var processVehicles = function(vehicles) {


        var selectedVehicle;

        for(var index in vehicles)
        {
          if(vehicles[index].Selected == "true")
          {
            // alert(JSON.stringify(colors[index]));
            selectedVehicle = vehicles[index];
          }
        }

        return selectedVehicle;

       }

       var selectedVehicle = processVehicles($scope.vehiclesData);

       alert(customerId);
       alert(selectedVehicle.Id);

      $http({
          url: 'http://tvts.azurewebsites.net/api/vehicle/purchase',
          method: "PUT",
          data: {
            "CustomerId":customerId,
            "InventoryId":selectedVehicle.Id
            },
          headers: {'Content-Type': 'application/json'},
        }).then(onSuccess, onError);

        function onSuccess(data) {
         var alertPopup = $ionicPopup.alert({
           title: 'Success',
           subTitle: 'Purchase has been processed',
            scope: $scope,
            buttons: [
             {
               text: '<b>Ok</b>',
               type: 'button-assertive',
               onTap: function() { }
             }
            ]
           }); 
        }

        function onError(data) {
          var alertPopup = $ionicPopup.alert({
           title: 'Failure',
           subTitle: 'An error occurred',
            scope: $scope,
            buttons: [
             {
               text: '<b>Ok</b>',
               type: 'button-assertive',
               onTap: function() { }
             }
            ]
           });
        }
       
    }



    $ionicPopover.fromTemplateUrl('templates/vehicles-popover.html', {
      scope: $scope,
    }).then(function(popover) {
      $scope.popover = popover;
    });

    $scope.openPopover = function($event) {
      $scope.popover.show($event);
    };
    $scope.closePopover = function() {
      $scope.popover.hide();
    };
//Cleanup the popover when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.popover.remove();
    });
    // Execute action on hide popover
    $scope.$on('popover.hidden', function() {
      // alert(JSON.stringify($scope.vehiclesData));
      // VehiclePurchase.setVehicleColors($scope.colorsData);
      // VehiclePurchase.setVehicleOptions($scope.optionsData);

    });
    // Execute action on remove popover
    $scope.$on('popover.removed', function() {
      // Execute action
    });
});







