angular.module('SkinWin.coinflipController', ['ui.router'])

.controller('coinflipController', ['$rootScope', '$scope', '$window', '$state', '$stateParams', '$http', '$timeout', 'filterFilter', 'SocketService', '$translate', function($rootScope, $scope, $window, $state, $stateParams, $http, $timeout, filterFilter, SocketService, $translate) {

    $rootScope.mainGame  = GAMES[730];
    $rootScope.game = 730;

    $scope.coinflipGame = {};

    $timeout(function() {

        if ($state.current.name == 'coinflip_state') {
            var $wrap = $('#coinflip-games-box');

            $(window).resize(function () {
                $wrap.height($(window).height() - 220 - 250)
            }).trigger('resize');

            VScrollBox.instance('.v-scroll-box');
        } else {
            HScrollBox.instance('#sbx1', 1, false, true);
            HScrollBox.instance('#sbx3', 1);
        }

    }, 500);

    $scope.coinflipGo = function() {

        var $coin = $('.coinflip');
        $scope.gameOn = true;

        setTimeout(function () {
            $coin.addClass('coinflip-animate-flipping');
            $scope.gameForward = true;
        }, 100);
        setTimeout(function () {
            $scope.gameForward = false;
        }, 5000);
    }

    $scope.coinflipFinish = function(winner, object) {
        var $coin = $('.coinflip');
        $coin.removeClass('coinflip-animate-flipping');
        $coin.addClass('coinflip-animate-flipping-' + winner);

        $scope.coinflipGame.winner = object;

        $timeout(function(){
            $scope.gameOn = false;
            $scope.finishGame = true
        }, 5000);
    }

    $scope.getGames = function(sort) {
        $scope.topBets = sort;
        $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/game/coinflip/list/' + 0 + '/' + sort} ).
                success(function ( data, status )
                {
                    $scope.flipGames = data.result;
                }).
                error(function(data,status) 
                {

                })
    }

    $scope.getGame = function(id) {
        $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/game/coinflip/game/' + id} ).
                success(function ( data, status )
                {

                    if (data.deposits[0].user.id == $rootScope.user.id) {
                        $scope.myGame = true;
                        $scope.gamer = data.deposits[1] ? data.deposits[1].user : {};
                    } else if (data.dateStart) {
                        $scope.gamer = data.deposits[1].user;
                    } else {
                        $scope.gamer = $rootScope.user;
                    }

                    $scope.coinflipGame = data;
                    $scope.maker = data.deposits[0].user;
                    $scope.maker.botInventory = [];
                    $scope.gamer.botInventory = [];

                    for (var i = 0; i < data.deposits[0].items.length; i++) {
                        data.deposits[0].items[i].item.coinflipReserve = true;
                        $scope.maker.botInventory.push(data.deposits[0].items[i].item);
                    }
                     
                    var arr = [];
                    var j   = -1;
                    for (var i = 0; i < $scope.maker.botInventory.length; i++) {
                        if(i % 2 == 0){
                            j++;
                            arr[j] = [];
                        }
                        arr[j].push($scope.maker.botInventory[i]);
                    }

                    if (data.dateCompleted) {
                        $scope.finishGame = true;
                    }

                    if (data.dateCompleted || data.dateStart) {
                        for (var i = 0; i < data.deposits[1].items.length; i++) {
                            data.deposits[1].items[i].item.coinflipReserve = true;
                            $scope.gamer.botInventory.push(data.deposits[1].items[i].item);
                        }
                         
                        var arr2 = [];
                        var j   = -1;
                        for (var i = 0; i < $scope.gamer.botInventory.length; i++) {
                            if(i % 2 == 0){
                                j++;
                                arr2[j] = [];
                            }
                            arr2[j].push($scope.gamer.botInventory[i]);
                        }
                    $scope.seCoinflipBet = arr2;
                    }

                    $scope.myCoinflipBet = arr;
                    
                    HScrollBox.instance('#sbx1', 1, false, true);
                    HScrollBox.instance('#sbx2', 1, false, true);
                }).
                error(function(data,status) 
                {

                })
    }

    $scope.updateItems = function(page) {

        if ($state.current.name == 'game_coinflip_create_state') {
            $scope.maker = $rootScope.user;
        }

        if (typeof page != 'undefined') {
            $scope.currentPageItems = page
        }

        if ($rootScope.user) {
            $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/users/me/items/' + 730 + '/' + $scope.currentPageItems} ).
                success(function ( data, status )
                {
                    var arr = [];
                    var j   = -1;
                    var items = [];

                    if ($scope.coinflipGame.maxBet) {
                        for (var i = 0; i < data.items.length; i++) {
                            if (data.items[i].itemTemplate.priceUsd <= $scope.coinflipGame.maxBet) {
                                items.push(data.items[i]);
                            }
                        }
                    } else {
                        items = data.items;
                    }

                    for (var i = 0; i < items.length; i++) {
                        if(i % 3 == 0){
                            j++;
                            arr[j] = [];
                        }
                        arr[j].push(items[i]);
                    }

                    $rootScope.user.botInventory = data.items;
                    $rootScope.user.botGroup = arr;
                    $scope.allitems = data.allSize;
                    $scope.lastPage = Math.ceil(data.allSize / 100);

                    $scope.pages = new Array($scope.lastPage);

                    HScrollBox.instance('#sbx3', 1);
                }).
                error(function ( data, status )
                {

                });
        } else {
            $timeout(function(){$scope.updateItems(0)}, 100);
        }
    }

    $scope.createGame = function(inventory) {
        var array = [];

        for (var i = inventory.length - 1; i >= 0; i--) {

            if (inventory[i].coinflipReserve == true) {

                var item = {};

                item.item = inventory[i];
                delete item.item.coinflipReserve;

                array.push(item.item.id);

                inventory[i].hide = true;
            }

        };

        $http( {method: 'POST', url: STEAM_TRADE_REST_WS_URL + '/game/coinflip/create/' + 730, data : array} ).
                success(function ( data, status )
                {
                    $state.go('game_coinflip_state', {gameId : data.gameId}, {reload: true});
                }).
                error(function(data,status)
                {

                })
    }

    $scope.joinGame = function(inventory) {
        var array = [];

        for (var i = inventory.length - 1; i >= 0; i--) {

            if (inventory[i].coinflipReserve == true) {

                var item = {};

                item.item = inventory[i];
                delete item.item.coinflipReserve;

                array.push(item.item.id);

                inventory[i].hide = true;
            }

        };

        $http( {method: 'POST', url: STEAM_TRADE_REST_WS_URL + '/game/coinflip/enter/' + $scope.coinflipGame.id, data : array} ).
                success(function ( data, status )
                {
                    //$state.go('game_coinflip_state', {gameId : data.gameId});
                }).
                error(function(data,status) 
                {

                })
    }

    $scope.groupArray = function(array, group) {
        if (array) {
            var groupArray = [];
            var j   = -1;
            for (var i = 0; i < array.length; i++) {
                if(i % group == 0){
                    j++;
                    groupArray[j] = [];
                }
                groupArray[j].push(array[i]);
            }

            return groupArray;
        }
    }

    $scope.checkBlock = function(item) {
        var status = item.status == 'IN_BLOCK';

        if (status) {
            item.coinflipReserve = false;
            
            $translate('ITEM_BLOCKED').then(function (message) {
                growl.error(message, {backgroundImage : 'TRADE_ERROR'});
            })
        }

        return status;
    }

    $scope.sum = function(items, prop, result){

        var array = [];

        if (typeof items == 'undefined') {
            items = [];
        }

        for (var i = items.length - 1; i >= 0; i--) {

            if (items[i].coinflipReserve == true) {
                array.push(items[i])
            }
        };

        return array.reduce( function(a, b){
            return +a + +b.itemTemplate[prop];
        }, 0);
    };

    $scope.addToGame = function(item) {
        if ($state.current.name == 'game_coinflip_state' && $scope.maker.id != $rootScope.user.id && !$scope.coinflipGame.dateCompleted) {
            $scope.seCoinflipBet = $scope.groupArray(filterFilter($rootScope.user.botInventory, {coinflipReserve:true}), 2);
        } else if (!$scope.coinflipGame.id) {
            $scope.myCoinflipBet = $scope.groupArray(filterFilter($rootScope.user.botInventory, {coinflipReserve:true}), 2);
        }
        HScrollBox.instance('#sbx1', 1, false, true);
    }

    //init

    if ($state.current.name == 'coinflip_state') {
        $scope.getGames(false); 
    } else {
        if ($state.current.name == 'game_coinflip_state') {
            $scope.getGame($stateParams.gameId);
        }
        $scope.updateItems(0);

        $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/game/coinflip/settings'} ).
                success(function ( data, status )
                {
                    $scope.minCreateBet = data.coinflipMinDepositSumItems;
                    $scope.roundLimit   = data.limitDepositItems;
                }).
                error(function(data,status)
                {

                })
    }

    $scope.$on('socketMessage', function(event, data) {

        if (data.handler == 'COINFLIP') {

            if ($state.current.name == 'coinflip_state') {
                if (data.object.dateStart) {
                    for (var i = 0; i < $scope.flipGames.length; i++) {
                        if ($scope.flipGames[i].id == data.object.id) {
                            $scope.flipGames.splice($scope.flipGames[$scope.flipGames.indexOf(i)], 1);
                        }
                    }
                } else {
                    $scope.flipGames.unshift(data.object);
                }

            } else {
                if (!$scope.coinflipGame.dateCompleted && $state.current.name == 'game_coinflip_state' && $scope.coinflipGame.id == data.object.id) {
                    if (data.object.deposits[0].user.id == $rootScope.user.id || data.object.deposits[1].user.id == $rootScope.user.id) {
                        $scope.getGame(data.object.id);
                        $scope.coinflipGo();
                    } else {
                        $scope.getGame(data.object.id);
                        $translate(['GAME_UNAVAILABLE', 'GAME_UNAVAILABLE2']).then(function (translations) {
                            $rootScope.openPopup(
                                translations.GAME_UNAVAILABLE,
                                translations.GAME_UNAVAILABLE2 + '<br/><br/>',
                                [{
                                    text : 'OK',
                                    func: function(){$state.go('coinflip_state', {}, {reload: true}); $rootScope.closePopup();}
                                }],
                                {onlyButtons : true}
                            )
                        })
                    }
                }
            }
        }

        if (data.handler == 'COINFLIP_FINISH') {

            if ($state.current.name == 'game_coinflip_state' && $scope.coinflipGame.id == data.gameId) {
                var checkFlip = function() {
                    if ($scope.gameForward) {
                        $timeout(checkFlip, 1000);
                    } else {
                        var winner = data.winner.id == $rootScope.user.id ? 1 : 2;
                        $scope.coinflipFinish(winner, data.winner);
                        $scope.coinflipGame.dateCompleted = data.dateCompleted;
                    }
                }

                checkFlip();
            }
        }

    });

}]);