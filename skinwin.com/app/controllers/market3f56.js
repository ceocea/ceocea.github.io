angular.module('SkinWin.marketController', ['ui.router'])

.controller('marketController', ['$rootScope', '$scope', '$window', '$state', '$stateParams', '$http', '$translate', 'growl', 'SocketService', '$timeout', function($rootScope, $scope, $window, $state, $stateParams, $http, $translate, growl, SocketService, $timeout) {

    var $wrap = $('.l-market-left-items');

	$scope.Math = window.Math;

    $rootScope.game = 730;
    $rootScope.mainGame  = GAMES[730];

    $scope.cartItems = [];
    $scope.cartIds = [];
    $scope.summCart = 0;
    $scope.currentPage = 1;

    $scope.sort = {
    	type : 'price',
    	string : 'sort=BY_PRICE_DESC'
    }

    $scope.getWeapons = function(game, page) {

    	$scope.marketUpdate = true;

    	game = game ? game : 730;
    	page = page ? page-1 : 0;

    	var name = $scope.searchName ? '&likeName=' + $scope.searchName : '';
        var type = $scope.searchType ? '&type=' + $scope.searchType : '';
        var weapon = $scope.searchWeapon ? '&weapon=' + $scope.searchWeapon : '';

    	params = '?' + $scope.sort.string + name + type + weapon;

        $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/market/list/' + game + '/' + page + params} ).
            success(function ( data, status )
            {
                $scope.items = data.result;
                $scope.marketUpdate = false;
                $scope.allPages = data.totalPages;
                $scope.totalSize = data.totalSize;
                $scope.currentPage = page+1;

                $timeout(function() {
                    $(window).resize(function () {
                        //$wrap.height($(window).height() - 220 - 170 - 130);
                        $('.l-market-right').height($(window).height() - 220 - 120);
                        $('.l-market-right-items2').height($(window).height() - 220 - 220);
                        $wrap.height(900)
                    }).trigger('resize');

                    VScrollBox.instance('.v-scroll-box');

                }, 500);
            }).
            error(function ( data, status )
            {
                $scope.marketUpdate = false;
            })
    }

    $scope.buyItems = function(balance1, balance2) {

         $scope.buyingProcess = true;

         $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/market/buy/' + $scope.cartIds.join()} ).
            success(function ( data, status )
            {

                for (var i = 0; i < $scope.cartItems.length; i++) {
                    if (data[$scope.cartItems[i].id]) {
                        $scope.cartItems[i].error = data[$scope.cartItems[i].id];
                    } else {
                        $scope.cartItems[i].success = true;
                        $rootScope.newItems.ids.push($scope.cartItems[i].id);
                        $rootScope.newItems.items.push($scope.cartItems[i]);
                    }
                }

                $scope.buyingProcess = false;
                $scope.buyIsOver = true;
            }).
            error(function ( data, status )
            {
                $scope.buyingProcess = false;
            })
    }

    $scope.cleanCart = function() {
        $scope.cartIds = [];
        $scope.cartItems = [];
        $scope.buyIsOver = false;
        $scope.summCart = 0;
    }

    $scope.sortMarket = function(sort, desc) {

    	var desc = desc ? '_ASC' : '_DESC';

    	$scope.sort = {
    		string :'sort=BY_' + sort.toUpperCase() + desc,
	    	type: sort
	    }	

    	$scope.getWeapons(730, 1);
    }

    $scope.addToCart = function(item) {
        var index = $scope.cartIds.indexOf(item.id);

        VScrollBox.instance('.l-market-right-items');

        if (!$scope.buyIsOver) {
            if (index == -1) {
                if (!item.stop) {
                    $scope.cartIds.push(item.id);
                    $scope.cartItems.push(item);
                    $scope.summCart += item.itemTemplate.pointsBuyout;
                }
            } else {
                $scope.cartIds.splice(index,1)
                $scope.cartItems.splice(index,1)
                $scope.summCart -= item.itemTemplate.pointsBuyout;
            }
        }
    }

    $scope.getWeapons(730,1);

    SocketService.onMessage(function (e) {

        var data = JSON.parse(e.data);

        if (data.handler == 'MARKET_BUYOUT') {
            for (var i = 0; i < $scope.items.length; i++) {
                if (data.object.indexOf($scope.items[i].id) != -1) {
                    $scope.items[i].stop = true;
                }
            }
        }

    })

}]);