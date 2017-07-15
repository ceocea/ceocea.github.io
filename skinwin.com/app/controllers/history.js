angular.module('SkinWin.historyController', ['ui.router'])

.controller('historyController', ['$rootScope', '$scope', '$window', '$state', '$stateParams', '$http', function($rootScope, $scope, $window, $state, $stateParams, $http) {

    $scope.user = $rootScope.user;

    $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/game/roulette/' + $rootScope.game + '/history'} ).
        success(function ( data, status )
        {
            $scope.history = data;
        }).
        error(function ( data, status )
        {
            $rootScope.openPopup(data.error_description);
        });

}]);