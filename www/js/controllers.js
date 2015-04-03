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

.controller("PurchaseSummaryController", function($scope, $http, $stateParams, VehiclePurchase) {

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
          alert(JSON.stringify(data));
        }

        function onError(data) {
          alert(JSON.stringify(data));
        }

      }
      
})

.controller("VehicleSpecsController", function($scope, $http, $stateParams) {

      $scope.modelName = $stateParams.modelName;
      $scope.styleTrim = $stateParams.styleTrim;
      
      $http({
        url: 'http://tvts.azurewebsites.net/api/specs', 
        method: "GET",
        params: {styleId: $stateParams.styleId}
      }).success(function(data){
         $scope.engines = data.EngineDetail.Engines;
         $scope.transmissions = data.TransmissionDetail.Transmissions;
         $scope.equipmentArray = data.EquipmentDetail.Equipment;
      });

})

.controller("InventoryController", 
  function($scope, $ionicPopover, $ionicModal, $ionicPopup, $timeout) {

  // .fromTemplateUrl() method
  $ionicPopover.fromTemplateUrl('templates/popover-template.html', {
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
    // Execute action
  });
  // Execute action on remove popover
  $scope.$on('popover.removed', function() {
    // Execute action
  });

  //modal
  $ionicModal.fromTemplateUrl('templates/modal-template.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.openTestModal = function() {
    $scope.modal.show();
  };
  $scope.closeTestModal = function() {
    $scope.modal.hide();
  };
  //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
    // Execute action
  });


  //popup
  $scope.showConfirm = function() {
   var confirmPopup = $ionicPopup.confirm({
     title: 'Consume Ice Cream',
     template: 'Are you sure you want to eat this ice cream?'
   });
   confirmPopup.then(function(res) {
     if(res) {
       console.log('You are sure');
     } else {
       console.log('You are not sure');
     }
   });
 };

  $scope.showAlert = function() {
   var alertPopup = $ionicPopup.alert({
     title: 'Don\'t eat that!',
     template: 'It might taste good'
   });
   alertPopup.then(function(res) {
     console.log('Thank you for not eating my delicious ice cream cone');
   });
 };

});




