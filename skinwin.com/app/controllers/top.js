angular.module('SkinWin.topController', ['ui.router'])

.controller('topController', ['$rootScope', '$scope', '$window', '$state', '$stateParams', '$http', function($rootScope, $scope, $window, $state, $stateParams, $http) {

    $scope.user = $rootScope.user;

    $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/game/roulette/' + $rootScope.game + '/top_players'} ).
        success(function ( data, status )
        {
            $scope.top = data;
        }).
        error(function ( data, status )
        {
            $rootScope.openPopup(data.error_description);
        });

}]);