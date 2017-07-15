
angular.module('SkinWin.jackpotController', ['ui.router', 'ngSanitize'])

.controller('jackpotController', ['$rootScope', '$scope', '$window', '$state', '$stateParams', '$http', '$websocket', '$timeout', 'SocketService', '$locale', 'growl', '$cookies', '$translate', '$filter',
                       function($rootScope, $scope, $window, $state, $stateParams, $http, $websocket, $timeout, SocketService, $locale, growl, $cookies, $translate, $filter) {

    $scope.currentPageItems = 0;
    $scope.leftTabSelector = 'stats';
    $scope.historyGamesJackpot = [];
    $scope.topJackpot = [];
    $scope.gamePaused = false;
    $scope.gameWinner = {};
    $scope.teamColors = {};
    $scope.newReality = false;

    $scope.colors = ['#afca05', '#e5007d', '#ffcc00', '#008bd2', '#00fe2a', '#df090a', '#11bfae', '#11bf6f', '#fff', '#df73ff']

    var cnvCircleStat1 = new CnvCircleStat(document.getElementById('canvas1'));

    //array shuffle function
    $scope.arrayForRoullete = function (array, num) {

        num = (num * num).toString() + num + num;

        var merge = function(array) {
            var result = [];

            for (var i = 0; i < array.length; i++) {
                result = result.concat(array[i]);
            };

            return result;
        }

        var array_chunk = function( input, size ) {

            for(var x, i = 0, c = -1, l = input.length, n = []; i < l; i++){
                (x = i % size) ? n[c][x] = input[i] : n[++c] = [input[i]];
            }

            return merge(n.reverse());
        }

        for (var i = 0; i < num.length; i++) {
            array = array_chunk(array, +num[i]*((i % 5) + 1));
        };

        return array
    }

    //random number from..to
    function rand(min, max) {
        if( max ) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        } else {
            return Math.floor(Math.random() * (min + 1));
        }
    }

    //Summ function for inventory
    $scope.sum = function(items, prop, result){

        var array = [];

        if (typeof items == 'undefined') {
            items = [];
        }

        for (var i = items.length - 1; i >= 0; i--) {

            if (items[i].red == true) {
                array.push(items[i])
            }
        };

        return array.reduce( function(a, b){
            return +a + +b.itemTemplate[prop];
        }, 0);
    };

    $scope.summForGA = function(summ){
        betVALUE = summ;
    };

    //Get games history for load in chat zone
    $scope.getJackpotHistory = function() {
        if ($scope.historyGamesJackpot.length == 0) {
            $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/game/roulette/' + $rootScope.game + '/history'} ).
                success(function ( data, status )
                {
                    $scope.historyGamesJackpot = data;
                    setTimeout(function () {
                        scrollHistory = CvScrollBox.instance( '#rbox1', [8, 277, 0, 207, 67, 0], 7, 55,  '#18140a', '#ff9600');
                    }, 100);
                }).
                error(function(data,status) 
                {

                })
       }
    }

    //Get games top for load in chat zone
    $scope.getJackpotTop = function() {
        if ($scope.topJackpot.length == 0) {
            $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/game/roulette/' + $rootScope.game + '/top_players'} ).
                success(function ( data, status )
                {
                    $scope.topJackpot = data;
                    setTimeout(function () {
                        scrollTopList = CvScrollBox.instance( '#rbox2', [8, 277, 0, 207, 67, 0], 7, 55, '#18140a', '#de00ff' );
                    }, 100);
                }).
                error(function(data,status) 
                {

                })
       }
    }

    $scope.checkBlock = function(item) {
        if (item.status == 'IN_BLOCK') {
            item.red = false;
            
            $translate('ITEM_BLOCKED').then(function (message) {
                growl.error(message, {backgroundImage : 'TRADE_ERROR'});
            })
        }
    }

    //Show stuff with right statuses
    $scope.itemFilters = function(item) {
        var selectedItemsType = ['AVAILABLE','IN_ESCROW','IN_BLOCK'];
        return selectedItemsType.indexOf(item.status) !== -1;
    };

    //Get current game
    $scope.getCurrentGame = function() {
        $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/game/roulette/' + $rootScope.game + '/current'} ).
            success(function ( data, status )
            {
                var gameId;

                if (typeof $scope.currentGame != 'undefined') {
                    gameId = $scope.currentGame.id;
                }

                if (data && !data.error && gameId != data.gameRoulette.id) {

                    $scope.bets = data.gameRoulette.deposits;
                    $scope.currentGame = data.gameRoulette;

                    //If game on, start countdown
                    if (data.finishTime != -1) {

                        $scope.overTime = false;
                        $scope.finishTime = data.finishTime;

                        var timerForStart = function(finishTime) {
                            if (typeof $rootScope.online != 'undefined') {
                                var countTime = new Date().getTime();
                                $scope.setTimer(finishTime - (countTime + $rootScope.timeOffset));
                            } else {
                                $timeout(function(){
                                    timerForStart(finishTime);
                                }, 500);
                            }
                        }

                        timerForStart(data.finishTime);
                    }

                    $scope.gameBank = 0;
                    $scope.roundItems = 0;

                    var alltickets;

                    $scope.roundPlayers = [];
                    $scope.teamColors = {};

                    //Init bets
                    for (var j = 0; j < $scope.bets.length; j++) {

                        alltickets = $scope.bets[j].ticketLast;
                        var tickets = $scope.bets[j].ticketLast - $scope.bets[j].ticketFirst + 1;

                        $scope.bets[j].tickets = tickets;

                        var bank = 0;

                        for (var i = $scope.bets[j].items.length - 1; i >= 0; i--) {
                            bank = bank + $scope.bets[j].items[i].item.itemTemplate.priceUsd;
                        };

                        $scope.bets[j].bank = bank;

                        $scope.gameBank = $scope.gameBank + bank;
                        $scope.roundItems = $scope.roundItems + $scope.bets[j].items.length;

                        if(typeof $scope.roundPlayers['id' + $scope.bets[j].user.id] == 'undefined') {
                            $scope.roundPlayers['id' + $scope.bets[j].user.id] = {tickets : 0};
                        }

                        $scope.roundPlayers['id' + $scope.bets[j].user.id].id       = $scope.bets[j].user.id;
                        $scope.roundPlayers['id' + $scope.bets[j].user.id].nickname = $scope.bets[j].user.nickname;
                        $scope.roundPlayers['id' + $scope.bets[j].user.id].avatar   = $scope.bets[j].user.avatar;
                        $scope.roundPlayers['id' + $scope.bets[j].user.id].tickets  = $scope.bets[j].tickets + $scope.roundPlayers['id' + $scope.bets[j].user.id].tickets;
                        
                        if (!$scope.teamColors[$scope.bets[j].user.teamId]) {
                            if ($scope.bets[j].user.teamId) $scope.teamColors[$scope.bets[j].user.teamId] = $scope.colors[j];
                            $scope.roundPlayers['id' + $scope.bets[j].user.id].color = $scope.colors[j];
                        } else {
                            $scope.roundPlayers['id' + $scope.bets[j].user.id].color = $scope.teamColors[$scope.bets[j].user.teamId];
                        }

                        if (typeof $rootScope.myTeam != 'undefined' && $rootScope.myTeam) {
                            if ($scope.bets[j].user.id == $rootScope.myTeam.targetUser.id) {
                                $rootScope.myTeam.game.targetUser.bank += $scope.bets[j].bank;
                            }

                            if ($scope.bets[j].user.id == $rootScope.myTeam.sourceUser.id) {
                                $rootScope.myTeam.game.sourceUser.bank += $scope.bets[j].bank;
                            }
                        }
                    }

                    $scope.changeVal(Math.round(($scope.roundItems / $rootScope.roundLimit) * 100), true);

                    $scope.roundTickets = alltickets;

                    for (m in $scope.roundPlayers) {
                        $scope.roundPlayers[m].chance = +(($scope.roundPlayers[m].tickets / $scope.roundTickets) * 100).toFixed(2)

                        if (typeof $rootScope.myTeam != 'undefined' && $rootScope.myTeam) {
                            if ($scope.roundPlayers[m].id == $rootScope.myTeam.targetUser.id) {
                                $rootScope.myTeam.game.targetUser.chance = $scope.roundPlayers[m].chance;
                            }

                            if ($scope.roundPlayers[m].id == $rootScope.myTeam.sourceUser.id) {
                                $rootScope.myTeam.game.sourceUser.chance = $scope.roundPlayers[m].chance;
                            }
                        }
                    };

                    $scope.roundPlayers = Object.keys($scope.roundPlayers).map(function(k) {
                        return $scope.roundPlayers[k]
                    });

                    cnvCircleStat1.init( $scope.roundPlayers );                
                };

            })
    }

    $scope.rouletteGo = function(game) {
        $scope.roundTime = {
            min: '00',
            sec: '00',
        };

        var arr = [-45];

            for (i=1; i<60; i++) {
                arr.push(arr[i-1]-90);
            }

        var target = 0;
        var offset = 3420;

        if ($state.current.name == 'jackpot_state') {   
            $rootScope.caseOpenAudio.play();
        }

        $('#carousel').animate({ marginLeft: -offset}, {
            duration: 8000,
            easing: "easeOutCubic",
            step: function(now, fx) {

                if (Math.round(now) < arr[target]) {
                    target++;
                    $rootScope.caseOpenAudio.currentTime = 0;
                    if($state.current.name == 'jackpot_state') {
                        $rootScope.caseOpenAudio.play();
                    }
                }

                if (Math.round(now) == -offset) $('#carousel').finish();
            }, 
            complete: function() {
                if($rootScope.user.id == 1) console.log('finish!')
                $timeout(function() {
                    $scope.gameOn = false;
                    $scope.gamePaused = false;
                    $('#carousel').animate({ marginLeft: 0},0);
                }, 3000);
                $scope.gamePaused = true;
                $scope.getLastWinner();

                for (var i = 0; i < $rootScope.user.botInventory.length; i++) {
                    delete $rootScope.user.botInventory[i].hideForGame;
                };

                $rootScope.groupForBot($rootScope.user.botInventory);
            }
        });
    }

    //Countdown function for roulette start
    $scope.setTimer = function(start) {

        var timer = new Date(start);

        $scope.roundTime = {
            min: '0' + timer.getMinutes(),
            sec: String(timer.getSeconds()).length == 2 ? timer.getSeconds() : '0' + timer.getSeconds(),
        };

        if (start >= 1000 && $scope.overTime == false) {
            $scope.currTimeout = $timeout(function() {
                $scope.setTimer(start-1000);
            }, 1000);
        }
    }

    //Send stuff from skinwinbot to game or steam inventory
    $scope.doBet = function(inventory) {
            var array = [];
            var ItemsIDS = [];

            for (var i = inventory.length - 1; i >= 0; i--) {

                if (inventory[i].red == true) {

                    var item = {};

                    item.item = inventory[i];
                    delete item.item.red;

                    array.push(item.item.id);

                    inventory[i].hide = true;
                    ItemsIDS.push(item.item.objectId);
                }
            };

             $rootScope.groupForBot(inventory);

            $http( {method: 'POST', url: STEAM_TRADE_REST_WS_URL + '/game/roulette/enter/' + $rootScope.game + '/', data: array} ).
                error(function ( data, status )
                    {
                        $translate(data.error).then(function (message) {
                            $rootScope.openPopup(message);
                        })

                       for (var i = inventory.length - 1; i >= 0; i--) {
                            if (ItemsIDS.indexOf(inventory[i].objectId) != -1) {
                                inventory[i].hide = false;
                            }
                        };
                        $rootScope.groupForBot(inventory);
                    });

    }

    //Open popup about donation
    $scope.donateStuffOne = function(param) {
        if (param) {
            $translate(['WANT_PASS', 'DONATE_FRIEND']).then(function (translations) {
                $rootScope.openPopup(translations.WANT_PASS, translations.DONATE_FRIEND, {}, {friend: true});
            });
        } else if (!param) {
            $translate(['WANT_PASS_GROUP', 'PASS_GROUP_TAG']).then(function (translations) {
                $rootScope.openPopup(translations.WANT_PASS_GROUP, translations.PASS_GROUP_TAG, {}, {group:true});
            });      
        }
    }

    //Get last winner information
    $scope.getLastWinner = function() {
        $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/game/roulette/' + $rootScope.game + '/last_winner'} ).
            success(function ( data, status )
                {
                    $rootScope.lastWinner = data;
                    if ($scope.historyGamesJackpot.length > 0) {
                        $scope.historyGamesJackpot.push(data);
                    }
                });
        $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/game/roulette/' + $rootScope.game + '/most_lucky'} ).
            success(function ( data, status )
                {
                    $rootScope.mostLucky = data;
                });
    }

    //Get skinwin bot stuff
    $scope.updateItems = function(page) {
        if (typeof page != 'undefined') {
            $scope.currentPageItems = page
        }

        if ($rootScope.user) {
            $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/users/me/items/' + $rootScope.game + '/' + $scope.currentPageItems} ).
                success(function ( data, status )
                {
                    $rootScope.groupForBot(data.items);

                    $rootScope.user.botInventory = data.items;
                    $scope.allitems = data.allSize;
                    $scope.lastPage = Math.ceil(data.allSize / 100);

                    $scope.pages = new Array($scope.lastPage);
                }).
                error(function ( data, status )
                {

                });
        } else {
            $timeout($scope.updateItems, 100);
        }
    }

    $scope.initCircle = function() {
        $timeout(function() {(function () {
                var scrollHistory, scrollTopList;
                
                $('.sandwich').click(function () {
                    $(this).toggleClass('is-sandwich-open');
                });

                /* кастомные горизонтальные скроллы для блоков */
                HScrollBox.instance('#sbx1', 1);
                //HScrollBox.instance('#sbx2', 0.5);
                HScrollBox.instance('#sbx3', 1, true);
                
                if($scope.roundItems > 0) {
                    $scope.changeVal(Math.round(($scope.roundItems / $rootScope.roundLimit) * 100), true);
                }
                
            })();
        }, 500);
    }

    //Toggle circle background
    $scope.changeVal = function(val, moment) {
        /*var van = 100 - $('.dial').val();
        var res = moment ? val : van + 0.5;

        var newDial = function(number) {
            var offset = number * 3.6;

            $(".dial").trigger(
            'configure',
                {
                    angleOffset: offset,
                }
            );

            $('.dial').val(100 - number).trigger('change');

            if (number <= val) {
                setTimeout(function(){
                    newDial(number + 0.5);
                }, 5)
            }
        }

        newDial(res);*/
    }

    //Change tab handler
    ifvisible.on('statusChanged', function(e){
        if (e.status == 'active') {
            $rootScope.userHide = false;
            $scope.newReality = false;
            if($scope.roundItems > 0) {
                /*$(".dial").trigger(
                'configure',
                    {
                        angleOffset: (Math.round(($scope.roundItems / $rootScope.roundLimit) * 100) + 0.5) * 3.6,
                    }
                );

                $('.dial').val(99.5 - Math.round(($scope.roundItems / $rootScope.roundLimit) * 100)).trigger('change');*/
                if ($scope.roundPlayers.length > 0 && !$scope.newReality) {
                    cnvCircleStat1.update( $scope.roundPlayers );
                } else {
                    cnvCircleStat1 = new CnvCircleStat(document.getElementById('canvas1'));
                    cnvCircleStat1.init($scope.roundPlayers);

                }
            } else {
                //$('.dial').val(100).trigger('change');
                cnvCircleStat1 = new CnvCircleStat(document.getElementById('canvas1'));
                cnvCircleStat1.init($scope.roundPlayers);
            }
            
            if ($scope.finishTime) {
                $timeout.cancel($scope.currTimeout);
                var countTime = new Date().getTime();
                $scope.setTimer($scope.finishTime - (countTime + $rootScope.timeOffset));
            }

        } else {
            $rootScope.userHide = true;
            $timeout.cancel($scope.currTimeout);
        }
    });

    $scope.init = function() {
        $scope.overTime = true;
        $scope.roundItems = 0;
        $scope.gameBank = 0;
        $scope.roundTickets = 0;
        $scope.bets = [];
        $scope.roundTime = {
            min: '00',
            sec: '00',
        };
        $scope.roundPlayers = [];

        $scope.updateItems();
        $scope.initCircle();
        $scope.getCurrentGame();
        $scope.getLastWinner();
    }

    $scope.init();

    SocketService.onOpen(function () {
        $scope.getCurrentGame();
    });

    SocketService.onClose(function (e) {
        $scope.getCurrentGame();
        $scope.updateItems();
    });

    SocketService.onMessage(function (e) {

        var data = JSON.parse(e.data);

        /*if (data.handler == 'USERS') {
            console.log(data);
        }*/

        if (data.handler == 'ITEMS' && data.appId == $rootScope.game) {

            var itemsIDS = [];
            var itemsArr = {};

            for (var i = 0; i < data.object.length; i++) {
                
                if ($scope.gameOn) {
                    data.object[i].hideForGame = true;
                }

                itemsIDS.push(data.object[i].id);
                itemsArr[data.object[i].id] = data.object[i];

                if ($rootScope.donateStuff[data.appId].indexOf(data.object[i].id) != -1) {
                    var donatId = $rootScope.donateUsers[data.appId].id != 50229 ? $rootScope.donateUsers[data.appId].id : 'bot';
                    var itemPict = '<img src="' + $filter('imageUrl')(data.object[i].itemTemplate.icon) + '" title="' + data.object[i].itemTemplate.name + '" alt="' + data.object[i].itemTemplate.name + '" width="100" style="margin: 5px 2px;"> ';

                    $translate('GET_PRESENT').then(function (message) {
                        $rootScope.openPopup(message + ' <a target="_blank" href="/users/' + donatId + '">' + $rootScope.donateUsers[data.appId].nickname + '</a><br/>' + itemPict);
                    })

                }
            };

            for (var i = 0; i < $rootScope.user.botInventory.length; i++) {
                if (itemsIDS.indexOf($rootScope.user.botInventory[i].id) != -1 && !$rootScope.user.botInventory[i].hide) {
                    $rootScope.user.botInventory[i] = itemsArr[$rootScope.user.botInventory[i].id];
                    delete itemsArr[$rootScope.user.botInventory[i].id];
                }
            };

            for(var item in itemsArr) {
                itemsArr[item].new = true;
                $rootScope.user.botInventory.push(itemsArr[item]);
            };

            if (!$scope.gameOn) {
                $rootScope.groupForBot($rootScope.user.botInventory);
            }

        }

        if (data.handler == 'START_TIMER' && data.appId == $rootScope.game) {
            $scope.overTime = false;
            $scope.finishTime = data.finishTime;
            var countTime = new Date().getTime();
            $scope.setTimer(data.finishTime - (countTime + $rootScope.timeOffset));
        }

        if (data.handler == 'ERROR') {
            $scope.getCurrentGame();
            $scope.updateItems();
        }

        if (data.handler == 'DONATION') {
            if ($rootScope.user.nickname.toLowerCase().indexOf(data.donationTag.toLowerCase()) != -1 || data.donationTag == 'skinwin.com') {
                if (data.appId == 730) {
                    $timeout.cancel($scope.donateTimeout730);

                    $scope.donateTimeout730 = $timeout(function() {
                       $rootScope.donateUsers[data.appId] = {};
                       $rootScope.donateStuff[data.appId] = [];
                    }, 10000);
                } else {
                    $timeout.cancel($scope.donateTimeout570);

                    $scope.donateTimeout570 = $timeout(function() {
                       $rootScope.donateUsers[data.appId] = {};
                       $rootScope.donateStuff[data.appId] = [];
                    }, 10000);
                }
            }

            if ($rootScope.user.nickname.toLowerCase().indexOf(data.donationTag.toLowerCase()) != -1 || data.donationTag == 'skinwin.com') {
                $rootScope.donateUsers[data.appId] = data.user;
                $rootScope.donateStuff[data.appId] = data.itemIds;
            }
        }

        if (data.handler == 'ROULETTE' && data.object.dateCompleted != null && data.appId == $rootScope.game) {

            if ($rootScope.userHide) $scope.newReality = true;

            $scope.winnerID = data.object.winner.id;

            $scope.roundBegin = false;
            $scope.finishTime = false;

            if($state.current.name == 'jackpot_state') {
                $rootScope.roundBegin.play();
            }

            $scope.gameOn = true;
            $scope.overTime = true;

            if($scope.roundItems >= $rootScope.roundLimit) {
                $timeout(function() {
                    if (!$scope.roundBegin) {
                        $('.dial').val(100).trigger('change');
                        $scope.gameBank = 0;
                        $scope.roundItems = 0;
                    }
                }, 4000)
            } else {
                $timeout(function() {
                    if (!$scope.roundBegin) {
                        $('.dial').val(100).trigger('change');
                        $scope.gameBank = 0;
                        $scope.roundItems = 0;
                    }
                }, 2000)
            }

            $scope.roundTime = {
                min: '00',
                sec: '00',
            };

            var alltickets;

            $scope.bets = [];
            $scope.roundPlayers2 = []
            var winner;

            var counter = 0;

            for(i in $scope.roundPlayers) {
                   var count = Math.ceil($scope.roundPlayers[i].chance / 2);

                    if ($scope.roundPlayers[i].id == data.object.winner.id) {
                        winner = $scope.roundPlayers[i];
                        winner.id = 'w' + winner.id;
                        winner.winner = true;
                    }

                    for (var j = count - 1; j >= 0; j--) {
                        $scope.roundPlayers2.push($scope.roundPlayers[i]);
                    };
            }; 

            $scope.roundPlayers2 = $scope.arrayForRoullete($scope.roundPlayers2, data.object.dateCompleted);
            $scope.roundPlayers2[43] = winner;

            $scope.gameWinner = data.object.winner;
            $scope.gameWinner.ticket = JSON.parse(data.object.resultJson).random.data[0];

            //Обнуляем круг
            $scope.roundPlayers = [];
            $scope.teamColors = {};

            if($rootScope.myTeam) {
                $rootScope.myTeam.game = {
                            targetUser : {bank: 0},
                            sourceUser : {bank: 0}
                        }
            }

            cnvCircleStat1 = new CnvCircleStat(document.getElementById('canvas1'));
            cnvCircleStat1.init($scope.roundPlayers);

            $timeout(function() {$scope.rouletteGo(data.object)}, 1000);
        }

        if (data.handler == 'ROULETTE_DEPOSIT' && data.appId == $rootScope.game) {
           
            if ($rootScope.userHide) $scope.newReality = true;

            if ($scope.gameOn && !$scope.roundBegin) {
                $('.dial').val(100).trigger('change');
            }

           $scope.roundBegin = true;

           $scope.bets.push(data.object);

           if($state.current.name == 'jackpot_state') {
               $rootScope.newBet.play();
            }

           $scope.gameBank = 0;
           $scope.roundItems = 0;

           var alltickets;

           $scope.roundPlayers = [];

           for (var j = 0; j < $scope.bets.length; j++) {

                alltickets = $scope.bets[j].ticketLast;
                var tickets = $scope.bets[j].ticketLast - $scope.bets[j].ticketFirst + 1;

                $scope.bets[j].tickets = tickets;

                var bank = 0;

                for (var i = $scope.bets[j].items.length - 1; i >= 0; i--) {
                    bank = bank + $scope.bets[j].items[i].item.itemTemplate.priceUsd;
                };

                $scope.bets[j].bank = bank;

                $scope.gameBank = $scope.gameBank + bank;
                $scope.roundItems  = $scope.roundItems + $scope.bets[j].items.length;

                if(typeof $scope.roundPlayers['id' + $scope.bets[j].user.id] == 'undefined') {
                    $scope.roundPlayers['id' + $scope.bets[j].user.id] = {tickets : 0};
                }

                if (typeof $rootScope.myTeam != 'undefined' && $rootScope.myTeam) {
                    if ($scope.bets[j].user.id == $rootScope.myTeam.targetUser.id) {
                        $rootScope.myTeam.game.targetUser.bank += $scope.bets[j].bank;
                    }

                    if ($scope.bets[j].user.id == $rootScope.myTeam.sourceUser.id) {
                        $rootScope.myTeam.game.sourceUser.bank += $scope.bets[j].bank;
                    }
                }

                $scope.roundPlayers['id' + $scope.bets[j].user.id].id = $scope.bets[j].user.id;
                $scope.roundPlayers['id' + $scope.bets[j].user.id].nickname = $scope.bets[j].user.nickname;
                $scope.roundPlayers['id' + $scope.bets[j].user.id].avatar   = $scope.bets[j].user.avatar;
                $scope.roundPlayers['id' + $scope.bets[j].user.id].tickets  = $scope.bets[j].tickets + $scope.roundPlayers['id' + $scope.bets[j].user.id].tickets;
                
                if (!$scope.teamColors[$scope.bets[j].user.teamId]) {
                    if ($scope.bets[j].user.teamId) $scope.teamColors[$scope.bets[j].user.teamId] = $scope.colors[j];
                    $scope.roundPlayers['id' + $scope.bets[j].user.id].color = $scope.colors[j];
                } else {
                    $scope.roundPlayers['id' + $scope.bets[j].user.id].color = $scope.teamColors[$scope.bets[j].user.teamId];
                }

            };

            //$scope.changeVal(Math.round(($scope.roundItems / $rootScope.roundLimit) * 100), $rootScope.userHide)

            $scope.roundTickets = alltickets;

            for(m in $scope.roundPlayers) {
                $scope.roundPlayers[m].chance = +(($scope.roundPlayers[m].tickets / $scope.roundTickets) * 100).toFixed(2);

                if (typeof $rootScope.myTeam != 'undefined' && $rootScope.myTeam) {
                    if ($scope.roundPlayers[m].id == $rootScope.myTeam.targetUser.id) {
                        $rootScope.myTeam.game.targetUser.chance = $scope.roundPlayers[m].chance;
                    }

                    if ($scope.roundPlayers[m].id == $rootScope.myTeam.sourceUser.id) {
                        $rootScope.myTeam.game.sourceUser.chance = $scope.roundPlayers[m].chance;
                    }
                }
            }; 

            $scope.roundPlayers = Object.keys($scope.roundPlayers).map(function(k) {
                return $scope.roundPlayers[k]
            });

            if (!$rootScope.userHide) {
                cnvCircleStat1.update( $scope.roundPlayers );
            }

        }

    });

}]);