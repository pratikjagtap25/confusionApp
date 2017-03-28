angular.module('confusionApp.controllers', [])
  .constant("baseURL","http://localhost:3000/")
  .controller('AppCtrl', function($scope, $ionicModal, $timeout) {

      // With the new view caching in Ionic, Controllers are only called
      // when they are recreated or on app start, instead of every page change.
      // To listen for when this page is active (for example, to refresh data),
      // listen for the $ionicView.enter event:
      //$scope.$on('$ionicView.enter', function(e) {
      //});

      // Form data for the login modal
      $scope.loginData = {};
      $scope.reservation={};

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

      $ionicModal.fromTemplateUrl('templates/reserveTable.html',{
        scope:$scope
      }).then(function(modal){
        $scope.reserveModal=modal;
      });

      $scope.closeReserve=function(){
        $scope.reserveModal.hide();
      };

      $scope.reserve=function(){
        $scope.reserveModal.show();
      };

      $scope.doReserve=function(){
        console.log($scope.reservation);

        $timeout(function(){
          $scope.closeReserve();
        }, 1000);  
      };
  })

  .controller('MenuController', ['$scope', 'menuFactory','favoriteFactory','baseURL','$ionicListDelegate','$ionicPopup',
      function($scope, menuFactory,favoriteFactory,baseURL,$ionicListDelegate,$ionicPopup) {
      
      $scope.baseURL=baseURL;
      $scope.tab = 1;
      $scope.filtText = '';
      $scope.showDetails = false;
      $scope.showMenu = false;
      $scope.message = "Loading ...";

      
      menuFactory.query(
          function(response) {
              $scope.dishes = response;
              $scope.showMenu = true;
          },
          function(response) {
              $scope.message = "Error: "+response.status + " " + response.statusText;
          });

                  
      $scope.select = function(setTab) {
          $scope.tab = setTab;
          
          if (setTab === 2) {
              $scope.filtText = "appetizer";
          }
          else if (setTab === 3) {
              $scope.filtText = "mains";
          }
          else if (setTab === 4) {
              $scope.filtText = "dessert";
          }
          else {
              $scope.filtText = "";
          }
      };

      $scope.isSelected = function (checkTab) {
          return ($scope.tab === checkTab);
      };

      $scope.toggleDetails = function() {
          $scope.showDetails = !$scope.showDetails;
      };

      $scope.addFavorite=function(dish_id){
        favoriteFactory.addToFavorite(dish_id);
        $ionicPopup.alert({
          title: "Success",
          template:"Whoa !! Dish added to favorites.",
        });
        $ionicListDelegate.closeOptionButtons();
      };

      $scope.deleteFavorite=function(dish_id){
        favoriteFactory.deleteFromFavorites(dish_id);
        $ionicListDelegate.closeOptionButtons();
      };

  }])

  .controller('ContactController', ['$scope', function($scope) {

      $scope.feedback = {mychannel:"", firstName:"", lastName:"", agree:false, email:"" };
      
      var channels = [{value:"tel", label:"Tel."}, {value:"Email",label:"Email"}];
      
      $scope.channels = channels;
      $scope.invalidChannelSelection = false;
                  
  }])

  .controller('FeedbackController', ['$scope', 'feedbackFactory', function($scope,feedbackFactory) {
      
      $scope.sendFeedback = function() {
          
          console.log($scope.feedback);
          
          if ($scope.feedback.agree && ($scope.feedback.mychannel == "")) {
              $scope.invalidChannelSelection = true;
              console.log('incorrect');
          }
          else {
              $scope.invalidChannelSelection = false;
              feedbackFactory.save($scope.feedback);
              $scope.feedback = {mychannel:"", firstName:"", lastName:"", agree:false, email:"" };
              $scope.feedback.mychannel="";
              $scope.feedbackForm.$setPristine();
              console.log($scope.feedback);
          }
      };
  }])

  .controller('DishDetailController', ['$scope', '$stateParams', 'dish','favoriteFactory','baseURL','$ionicPopover', '$ionicPopup','$ionicModal','$ionicListDelegate','$timeout',
      function($scope, $stateParams, dish,favoriteFactory,baseURL,$ionicPopover, $ionicPopup,$ionicModal,$ionicListDelegate,$timeout) {
      
      $scope.baseURL=baseURL;
      $scope.dish = {};
      $scope.showDish = false;
      $scope.message="Loading ...";
      $scope.mycomment = {rating:5, comment:"", author:"", date:""};
      $scope.dish = dish;
    
     $ionicPopover.fromTemplateUrl('templates/moreMenu.html', {
        scope: $scope,
      }).then(function(popover) {
        $scope.moreMenu = popover;
      });

      $scope.showMoreMenu=function($event){
        $scope.moreMenu.show($event);
      };

      $scope.hideMoreMenu=function(){
        if($scope.moreMenu === null)
          return;
        $scope.moreMenu.hide();
      };

       $scope.addFavorite=function(){
        favoriteFactory.addToFavorite(parseInt($stateParams.id,10));
        $scope.hideMoreMenu();
        $ionicPopup.alert({
          title: "Success",
          template:"Whoa !! Dish added to favorites.",
        });
      };

      $ionicModal.fromTemplateUrl('templates/addComment.html',{
        scope:$scope
      }).then(function(modal){
        $scope.commentModal=modal;
      });
      

      $scope.addComment=function(){
        $scope.hideMoreMenu();

        $scope.commentModal.show();
        
      };

      $scope.closeComment=function(){
        $scope.commentModal.hide();
        $scope.hideMoreMenu();
      }

     
      $scope.saveComment=function()
      {
        $scope.mycomment.date=new Date().toISOString();

        $scope.dish.comments.push($scope.mycomment);

        menuFactory.update({id:$scope.dish.id},$scope.dish);

        $scope.mycomment = {rating:5, comment:"", author:"", date:""};

        $ionicPopup.alert({title: "Success",template:"Whoa !! Comment added."});

        $scope.closeComment();
      }
  }])

  .controller('DishCommentController', ['$scope', 'menuFactory', function($scope,menuFactory) {
      
      $scope.mycomment = {rating:5, comment:"", author:"", date:""};
      
      $scope.submitComment = function () {
          
          $scope.mycomment.date = new Date().toISOString();
          console.log($scope.mycomment);
          
          $scope.dish.comments.push($scope.mycomment);
          menuFactory.update({id:$scope.dish.id},$scope.dish);
          
          $scope.commentForm.$setPristine();
          
          $scope.mycomment = {rating:5, comment:"", author:"", date:""};
      }
  }])

  // implement the IndexController and About Controller here

  .controller('IndexController', ['$scope', 'menuFactory', 'corporateFactory','promotionFactory', 'baseURL', function($scope, menuFactory, corporateFactory,promotionFactory, baseURL) {

      $scope.baseURL = baseURL;
      $scope.leader = corporateFactory.get({id:3});
      $scope.showDish = false;
      $scope.message="Loading ...";
      $scope.dish = menuFactory.get({id:0})
      .$promise.then(
          function(response){
              $scope.dish = response;
              $scope.showDish = true;
          },
          function(response) {
              $scope.message = "Error: "+response.status + " " + response.statusText;
          }
      );
      $scope.promotion = promotionFactory.get({id:0});
  }])
  .controller('AboutController', ['$scope', 'corporateFactory','baseURL', function($scope, corporateFactory,baseURL) {
              
              $scope.baseURL=baseURL;
              $scope.leaders = corporateFactory.query();
              console.log($scope.leaders);
      
  }])
  .controller('FavoritesController',['$scope','dishes','favorites','favoriteFactory','baseURL','$ionicListDelegate', '$ionicPopup', '$ionicLoading', '$timeout',
      function($scope,dishes,favorites,favoriteFactory,baseURL,ionicListDelegate,$ionicPopup, $ionicLoading, $timeout){

        $scope.baseURL=baseURL;

        $scope.shouldShowDelete=false;

        $scope.favorites=favorites;

        $scope.dishes = dishes;


        $scope.deleteFavorite=function(index){
          var confirmPopup=$ionicPopup.confirm({
            title: 'Confirm Delete ',
            template: 'Are you sure you want to delete this item?'
          });

          confirmPopup.then(function(res){
              if(res){
               favoriteFactory.deleteFromFavorites(index);
              }
              else
              {

              }
          });
          $scope.shouldShowDelete=false;
        };

        $scope.toggleDelete=function(){
          $scope.shouldShowDelete=!$scope.shouldShowDelete;
        };


  }])
  .filter('favoriteFilter',function(){

      return function(dishes,favorites){
          var output=[];

          for(var i=0;i<favorites.length;i++){
            for(var j=0;j<dishes.length;j++){
              if(favorites[i].id === dishes[j].id)
              {
                output.push(dishes[j]);
              }
            }
          }
          return output;
      };

  });
