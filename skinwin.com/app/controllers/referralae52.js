angular.module('SkinWin.referralController', ['ui.router'])

.controller('referralController', ['$rootScope', '$scope', '$window', '$state', '$stateParams', '$http', '$translate', 'growl', '$timeout', function($rootScope, $scope, $window, $state, $stateParams, $http, $translate, growl, $timeout) {

    $scope.closePopup();

    if ($rootScope.user && !$rootScope.user.referralCode) {
        $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/referrals/code/generate'} ).
            success(function ( data, status )
            {
                $rootScope.user.referralCode = data.referralCode;
            })
    }

    $scope.getInfo = function(page) {
        $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/referrals/info'} ).
            success(function ( data, status )
            {
                $scope.referralsActivated = data.referralsActivated;
                $scope.levels = data.rewardMap;
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

    $scope.getReward = function() {
        $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/referrals/take/reward'} ).
            success(function ( data, status )
            {
                
            })
    }

    var checkUser = function() {
        if ($rootScope.user && $rootScope.userGetSuccess) {
            $scope.getInfo();
        } else if (!$rootScope.userGetSuccess) {
            $timeout(checkUser, 200);
        }
    }   

    checkUser(); 

}]);