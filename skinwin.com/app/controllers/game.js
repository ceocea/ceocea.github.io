angular.module('SkinWin.gameController', ['ui.router'])

.controller('gameJackpotController', ['$rootScope', '$scope', '$window', '$state', '$stateParams', '$http', function($rootScope, $scope, $window, $state, $stateParams, $http) {

    $scope.user = $rootScope.user;
    $scope.chanses = {};
    $scope.gameUsers = {};

    $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/game/roulette/' + $stateParams.gameId } ).
        success(function ( data, status )
        {
            $scope.gameDetail = data;

            $scope.alltickets = 0;

            $scope.gameDetail.verify = JSON.parse($scope.gameDetail.resultJson);
            $scope.gameDetail.winTicket = JSON.parse($scope.gameDetail.resultJson).random.data[0];
            $scope.gameDetail.winner.tickets = 0;

            for (var j = 0; j < $scope.gameDetail.deposits.length; j++) {

                if (typeof $scope.chanses[$scope.gameDetail.deposits[j].user.id] == 'undefined') {
                    $scope.chanses[$scope.gameDetail.deposits[j].user.id] = 0;
                }

                alltickets = $scope.gameDetail.deposits[j].ticketLast;
                var tickets = $scope.gameDetail.deposits[j].ticketLast - $scope.gameDetail.deposits[j].ticketFirst + 1;

                $scope.gameDetail.deposits[j].tickets = tickets;

                if ($scope.gameDetail.winner.id == $scope.gameDetail.deposits[j].user.id) {
                    $scope.gameDetail.winner.tickets += $scope.gameDetail.deposits[j].tickets;
                }

                $scope.chanses[$scope.gameDetail.deposits[j].user.id] = $scope.chanses[$scope.gameDetail.deposits[j].user.id] + tickets;

                var bank = 0;

                for (var i = $scope.gameDetail.deposits[j].items.length - 1; i >= 0; i--) {
                    bank = bank + $scope.gameDetail.deposits[j].items[i].item.itemTemplate.priceUsd;
                };

                $scope.gameDetail.deposits[j].bank = bank;

                if(typeof $scope.gameUsers[$scope.gameDetail.deposits[j].user.id] == 'undefined') {
                    $scope.gameUsers[$scope.gameDetail.deposits[j].user.id] = {tickets : 0};
                }

                $scope.gameUsers[$scope.gameDetail.deposits[j].user.id].id       = $scope.gameDetail.deposits[j].user.id;
                $scope.gameUsers[$scope.gameDetail.deposits[j].user.id].nickname = $scope.gameDetail.deposits[j].user.nickname;
                $scope.gameUsers[$scope.gameDetail.deposits[j].user.id].avatar   = $scope.gameDetail.deposits[j].user.avatar;
                $scope.gameUsers[$scope.gameDetail.deposits[j].user.id].tickets  = $scope.gameDetail.deposits[j].tickets + $scope.gameUsers[$scope.gameDetail.deposits[j].user.id].tickets;
            };

            $scope.alltickets = alltickets;

        }).
        error(function ( data, status )
        {
            $rootScope.openPopup(data.error_description);
        });

}])

.controller('gameDoubleController', ['$rootScope', '$scope', '$window', '$state', '$stateParams', '$http', function($rootScope, $scope, $window, $state, $stateParams, $http) {

    $scope.allBets = {
        red: [],
        green: [],
        black: [],
        blue: [],
    }

    $scope.summDeposits = function(array) {
        var prop = 'points';

        if (typeof array == 'undefined') {  
            array = [];
        } else {
            array2 = Object.keys(array).map(function (key) { return array[key]; });
        }

        return array2.reduce( function(a, b){
            return +a + +b[prop];
        }, 0);

    }

   $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/game/double/' + $stateParams.gameId } ).
        success(function ( data, status )
        {
            $scope.gameDetail = data;

            $scope.gameDetail.gameVerify = JSON.parse($scope.gameDetail.resultJson);

            for (var i = 0; i < data.deposits.length; i++) {
                $scope.allBets[data.deposits[i].type.toLowerCase()].push({
                    betId : data.deposits[i].id,
                    id : data.deposits[i].user.id,
                    nickname : data.deposits[i].user.nickname,
                    avatar : data.deposits[i].user.avatar,
                    points: data.deposits[i].pointsBonus ? data.deposits[i].points + data.deposits[i].pointsBonus : data.deposits[i].points,
                })
            }
        }).
        error(function ( data, status )
        {
            $rootScope.openPopup(data.error_description);
        });

}]);