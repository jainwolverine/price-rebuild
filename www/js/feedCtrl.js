angular.module('app.feedCtrl',['app.services','ngLodash','ngCordova'])
.controller('feedCtrl',function($scope,$rootScope,$state,$ionicModal,$q,$filter,lodash,$ionicPlatform,PriceAPI,$ionicActionSheet,$ionicScrollDelegate,$http,localStorageService,$timeout,$ionicLoading,Favs) {

	 console.log('loaded feed controller...');
    $scope.$on('$ionicView.beforeEnter',function() {
        console.log('before enter...');
				// if(true){
        if(localStorageService.get('accessToken')) {
	        //should already be signed in
        } else if(ionic.Platform.isIOS() || ionic.Platform.isAndroid())  {
//        $state.go('signin'); //this is commented out to support web dev
        }
        if(!$rootScope.user) {
            $rootScope.user = {};
        }

        
        $scope.canReload = true;
        $rootScope.products = [];
        var gender = localStorageService.get('gender');
        $rootScope.currentGender = gender ? gender : 'male';
        $rootScope.page_no = 0;
		$scope.getCats();
		
		
/*
  $rootScope.$watch('favs', function(newVal, oldVal){

        if (newVal !== oldVal) {
            if($scope.shouldRefresh){
                console.log('trying to refresh again');
              $scope.shouldRefresh = false;
            }
          }
      });
*/
      $scope.loadModals();
      $scope.loadNextPage();
    });

	$scope.getCats = function() {
        var gender = 'male'; //var gender = $rootScope.currentGender ? $rootScope.currentGender : $rootScope.user.gender ? $rootScope.user.gender : 'male'; 
		$scope.categories = PriceAPI.categories();
		$scope.catNames = $scope.categories[gender];
		$scope.catNames.splice(0,0,{'name':'all','img':'img/cats/all.svg'});
    }

    $rootScope.refresh = function()  {
	  if($scope.canReload) {
		  $rootScope.page_no = 0;
	      $scope.loadNextPage();
		  $scope.canReload = false;
		  $timeout(function() {
          	$scope.canReload = true;
		  },1000);
		}

    };
       $scope.loadNextPage = function() {
        console.log('should load next page');
            $rootScope.rightVal = 2;
            $rootScope.page_no = 1;
        if($rootScope.favs) {
            $scope.loadPage($rootScope.page_no);
        } else {
            $rootScope.rightVal = 3;
            $.ajax({
                   method:'GET',
                   url: 'http://staging12.getpriceapp.com' + '/favourites/list?user=76',
                   success: function(res) {

                        $rootScope.favs = angular.fromJson(res);
                        console.log($rootScope.favs);
                        for(var item in $rootScope.favs){
                            item.isFavorite = true; // ideally it can be set at server side
                        }
                        $rootScope.leftVal = 2;
                        $scope.loadPage($rootScope.page_no);

                   }
                   });
            $rootScope.rightVal = 4;
            }
        }    
    $scope.loadPage = function(page) {
        PriceAPI.loadPage(page);
    }

    var filterButtons = [
        { text: 'Most Expensive', value: 'expensive' },
        { text: 'Least Expensive', value: 'inexpensive' },
        { text: 'Most Popular', value: 'popular' },
        { text: 'Biggest Savings', value: 'discount'},
        { text: 'Most Recent', value: ''}];

    $scope.openSortActionSheet = function() { //this needs to be refactored
        $ionicActionSheet.show({
        buttons: filterButtons,
        buttonClicked: function(index) {
            console.log('clicked button');
            $rootScope.sortBy = filterButtons[index].value;
            $rootScope.refresh();
            return true;
        }
    })};

    $scope.openFilters = function() {
	    $rootScope.previousState = $state.current.name;
	    $state.go('filters.menu');
    };

    $scope.loadModals = function() {
        $ionicModal.fromTemplateUrl('templates/share.html', function($ionicModal) {
            $rootScope.shareModal = $ionicModal;
        }, {
            scope: $scope,
            animation: 'slide-in-up'
        });
    };

    $scope.setCategory = function(cat) {
        if(cat === 'all') cat = '';
        $rootScope.products = [];
        $rootScope.currentCategory = cat;
        $ionicLoading.show();
        $rootScope.refresh();
    };

    $scope.selectedCategory = function(idx) {
        console.log('selected category: ' + $scope.catNames[idx].name);
        $scope.setCategory($scope.catNames[idx].name);
    };

    $scope.cancelFilter = function(){
        $state.go('tabs.feed')
    }
});