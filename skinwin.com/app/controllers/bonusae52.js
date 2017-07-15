angular.module('SkinWin.bonusController', ['ui.router'])

.controller('bonusController', ['$rootScope', '$scope', '$window', '$state', '$stateParams', '$http', '$translate', 'growl', '$cookies', '$timeout', function($rootScope, $scope, $window, $state, $stateParams, $http, $translate, growl, $cookies, $timeout) {

	$scope.nonPoints = 0;

    $scope.freeBonusrulesRead = typeof $cookies.getObject('readRules') != 'undefined' ? true : false;

	$scope.getDailyBonus = function() {
        
        $scope.closePopup();
        $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/events/gift/get'} ).
            success(function ( data, status )
            {
                $translate('BONUS_POINTS_GROWL', {points : '10'}).then(function (message) {
                    growl.success(message, {backgroundImage : 'BONUS_POINTS_GROWL', ttl: -1});
                })

                $scope.getPointsBonusInfo();

            }).
            error(function ( data, status )
            {
                $translate(data.error).then(function (message) {
                    growl.error(message, {backgroundImage : data.error});
                })
            });
    }

    $scope.getPointsBonusInfo = function() {
        $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/users/bonuses'} ).
            success(function ( data, status )
            {
                $scope.user = $rootScope.user;
                $scope.nonPoints = data.pointsBonusNonActivated;
                $scope.bonuses = data.list;
            })
    }

    $scope.getPromoPoints = function(code) {

        $scope.promoCode = '';

        $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/events/promo/use/' + code} ).
            success(function ( data, status )
            {
                $translate('BONUS_POINTS_GROWL').then(function (message) {
                    growl.success(message + ' ' + data.addPoints, {backgroundImage : 'BONUS_POINTS_GROWL'});
                })
            }).
            error(function ( data, status )
            {
                 $translate(data.error).then(function (message) {
                    growl.error(message, {backgroundImage : data.error});
                });

            })
    }

    $scope.readRules = function() {
        var expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + 360);
        $cookies.putObject('readRules', 1, {'expires': expireDate});

        $scope.freeBonusrulesRead = true;
    }

    var checkUser = function() {
        if ($rootScope.user && $rootScope.userGetSuccess) {
            $scope.getPointsBonusInfo();
        } else if (!$rootScope.userGetSuccess) {
            $timeout(checkUser, 200);
        }
    }   

    checkUser(); 

}]);