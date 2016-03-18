angular.module('app.services', ['ngResource','LocalStorageModule','ngLodash'])


.factory('PriceAPI',function($resource,$rootScope,$http,lodash,Favs,$window) {

    return {
        item: $resource('http://staging12.getpriceapp.com' + '/item-details/:id/'),
        items: items,
        suggestions: $resource('http://staging12.getpriceapp.com' + '/item/similar-category/:id/'),
        suggestionstoo: function(id) { $http.get('http://staging12.getpriceapp.com' + '/item/similar-category/' + id + '/')
        },
        categories: categories,
        auth: auth,
        loadPage: loadPage
    }
    
    function categories() {
	    var gender = $rootScope.currentGender ? $rootScope.currentGender : $rootScope.user.gender ? $rootScope.user.gender : 'male';
		var catImg = [];
		for(i = 0; i < 6; i++)
        	catImg.push('img/cats/' + gender + '/img' + (i+1).toString() + '.svg');
         return {
            female: [
                {
                    name: 'bags',
                    img: catImg[0]
                },{
                    name: 'clothing',
                    img: catImg[1]
                },{
                    name: 'watches',
                    img: catImg[2]
                },{
                    name: 'shoes',
                    img: catImg[3]
                },{
                    name: 'jewelry',
                    img: catImg[4]
                },{
                    name: 'sunglasses',
                    img: catImg[5]
                }],
            male: [
                {
                    name: 'gadgets',
                    img: catImg[0]
                },{
                    name: 'clothing',
                    img: catImg[1]
                },{
                    name: 'watches',
                    img: catImg[2]
                },{
                    name: 'shoes',
                    img: catImg[3]
                },{
                    name: 'outdoor',
                    img: catImg[4]
                },{
                    name: 'sunglasses',
                    img: catImg[5]
                }]
        }
    }
    
    function loadPage(page) {
        $.ajax({
            method: 'GET',
            url: 'http://staging12.getpriceapp.com' + '/item/list/',
            params: {
                'price_min' : 0,
                'price_max' : '',
                'category' : '', //$rootScope.category
                'page': page,
                'show_by': '20',
                'type' : 'male',
                'sort' : ''
            },
            success: function(res) {
               
//               $rootScope.resData = angular.toJson(res);
                $window.alert('got response...');
                $rootScope.leftVal = 100;
                if(page == 1)
                    $rootScope.products = [];
                var pageProds = lodash.map(res.data[0].products,function(product) {
                    $rootSCope.leftVal = 98;
                    product.fields.isFavorite = Favs.contains(product.fields.itemID);        
                    return product.fields; // hardcoded to remove the first element to prevent bug
                });

                $rootScope.products = lodash.concat($rootScope.products,pageProds);
                $rootScope.$broadcast('scroll.refreshComplete');
                $rootScope.$broadcast('scroll.infiniteScrollComplete');
                        $ionicLoading.hide();


            },
            error: function(xhr, status, error) {
                $rootScope.incVal = 88;                
            }
            
        });
    }

    
    function items(page) {
        console.log('refresh products');
        var request = $http( {
            method: 'GET',
            url: 'http://staging12.getpriceapp.com' + '/item/list/',
            params: {
                'price_min' : $rootScope.min_price ? $rootScope.min_price : 0,
                'price_max' : $rootScope.max_price ? $rootScope.max_price : '',
                'category' : $rootScope.currentCategory ? $rootScope.currentCategory : '', //$rootScope.category
                'page': $rootScope.page_no ? $rootScope.page_no : 1,
                'show_by': '20',
                'type' : $rootScope.currentGender ? $rootScope.currentGender : 'male',
                'sort' : $rootScope.sortBy ? $rootScope.sortBy : '',
                'colors':['blue']
                 //defaults to recently added

            }
        });

        return request.then( function(data) {
            console.log('got list data...');
            console.log(data);
            return lodash.map(data.data[0].products,function(product) {
                product.fields.isFavorite = Favs.contains(product.fields.itemID);        
                return product.fields; // hardcoded to remove the first element to prevent bug
            });

            console.log($rootScope.products);
            $rootScope.$broadcast('scroll.refreshComplete');

            },
            function(e) {
                return e;
                console.log('error getting items...');
                console.log(e);
            });

    }
    
    function auth(user) {
	     //user auth call
             $.ajax({
            url: "http://staging12.getpriceapp.com/klutter/ajax-auth/facebook/",
            type: "POST",
            dataType: "json",
            data: user,
            success: function(data) {
	            localStorageService.set('priceId',data.id);
	            localStorageService.set('priceToken',data.token);
	            $window.alert(data.id);
                console.log('got data...');
                var getitemdata = JSON.stringify(data);
                //alert(JSON.stringify(data))




            },

            error: function(xhr, status, error) {
                console.log(status);
                // alert(xhr.status);
                //alert(error);
                //alert(xhr.responseText);
            }


        }); //end of ajax call
    }

})
.service('Favs', function($http,$rootScope,lodash) {
    return {
      add: add,
      list: list,
      remove: remove,
      getList: getList,
      contains:contains
    }
    
    function contains(item_id) {
        return lodash.some($rootScope.favs,function(fav) {
            return fav.itemID == item_id;
        });
    }

    function add(item_id) {
      var config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
        }
      }
      var data = $.param({
        user: '76',
        item: item_id
      });
      var request = $http.post('http://staging12.getpriceapp.com' + '/favourites/add', data, config);
      return (request.then(function(res) {
        console.log(res);
        getList();
        return res.data;
      }, function(err) {
        return err;
      }));

    }

    function getList() {
      $http.get('http://staging12.getpriceapp.com' + '/favourites/list?user=76').then(function(res) {
          console.log('got favs...');
          
          $rootScope.favs = res.data;
          for(item in $rootScope.favs){
            item.isFavorite = true; // ideally it can be set at server side
          }
      },function(err) {
          console.log(err);
      });
    }
    
    function list() {
      var request = $http.get('http://staging12.getpriceapp.com' + '/favourites/list?user=76');
      return (request.then(function(res) {
          console.log('fetched favs...');
        console.log(res);
        return res.data;
      }, function(err) {
        return err;
      }));

    }
    
    function remove(item_id) {
        $.ajax({
            url: "http://staging12.getpriceapp.com/favourites/delete/",
            data: {
                'user': 76,
                'id': item_id
            },
            type: "POST",
            dataType: "json",
            success: function(data){
                console.log(data);
                getList();
                },
            error: function(data){
                console.log(data)
                }
        })
    }
});