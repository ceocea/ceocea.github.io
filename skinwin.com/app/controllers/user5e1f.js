angular.module('SkinWin.userController', ['ui.router'])

.controller('userController', ['$rootScope', '$scope', '$window', '$state', '$stateParams', '$http', '$timeout', '$translate', 'growl', function($rootScope, $scope, $window, $state, $stateParams, $http, $timeout, $translate, growl) {

    $scope.getPerson = function() {
        $scope.userId = $stateParams.profile;

        if ($rootScope.user && $scope.userId == $rootScope.user.id) {
            $scope.myPerson = true;
        };

        $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/profile/' + $scope.userId} ).
            success(function ( data, status )
            {
                $scope.profile = data;
                $scope.getGames('ROULETTE_CSGO');
            })
    }

    $scope.getGames = function(type) {

        $scope.gameHistory = type;
        $scope.tabSelect = 'history';

        $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/profile/game/' + type + '/user/' + $scope.userId} ).
            success(function ( data, status )
            {
                $scope.history = data.games;                
            })
    }

    $scope.sendInvite = function(user) {

        $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/team/invites/send/' + user.id} ).
            success(function ( data, status )
            {
                $translate('INVITE_SEND', {nickname: user.nickname}).then(function (message) {
                    growl.success(message);
                });
            })
    }

    $scope.getTrades = function() {

        $scope.tabSelect = 'trades';

        $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/users/me/trades'} ).
            success(function ( data, status )
            {
                $scope.trades = data;
            })
    }

    $scope.copyToClipboard = function(id) {
        var text = document.querySelector('#'+id);  
        var range = document.createRange();  
        range.selectNode(text);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);  

        try {  
        var successful = document.execCommand('copy');  
        var msg = successful ? 'successful' : 'unsuccessful';  
            $translate('COPY_SUCCESS').then(function (message) {
                growl.success(message, {backgroundImage : 'COPY_SUCCESS'});
            });
        } catch(err) {  
            $translate('COPY_FAILED').then(function (message) {
                growl.error(message, {backgroundImage : 'COPY_FAILED'});
            });
        }  
        window.getSelection().removeAllRanges();  
    }

    var checkUser = function() {
        if ($rootScope.userGetSuccess) {
            $scope.getPerson();
        } else if (!$rootScope.userGetSuccess) {
            $timeout(checkUser, 200);
        }
    }   

    checkUser(); 

}]);