angular.module('SkinWin.doubleController', ['ui.router'])

.controller('doubleController', ['$rootScope', '$scope', '$window', '$state', '$stateParams', '$http', '$timeout', 'SocketService', '$translate', 'growl', '$timeout', function($rootScope, $scope, $window, $state, $stateParams, $http, $timeout, SocketService, $translate, growl, $timeout) {

    $scope.position = 0;
    $scope.lastNumbers = [];
    $scope.doubleBet = 0;
    $scope.oldDoubleBet = 0;
    $scope.timer = 20;
    $scope.enable = true;
    $rootScope.reserveGame = false;
    $rootScope.mainGame  = GAMES[730];
    $scope.betDelay = false;
    $scope.leftTabSelector = 'stats';

    $rootScope.game = 730;

    $scope.historyGamesDouble = [];

    $scope.sectors = {
        0 : 8,
        1 : 7,
        2 : 5,
        3 : 3,
        4 : 1,
        5 : 14,
        6 : 12,
        7 : 10,
        8 : 6,
        9 : 4,
        10 : 2,
        11 : 15,
        12 : 13,
        13 : 11,
        14 : 9,
        15: 0,
    }

    $scope.allBets = {
      red: [],
      green: [],
      black: [],
      blue: [],
    }

    $scope.reserveBets = {
      red: [],
      green: [],
      black: [],
      blue: [],
    }

    $scope.myBets = {
      red: 0,
      green: 0,
      black: 0,
      blue: 0,
    }

    $scope.initCircle = function() {
        var scrollHistory;

        var $betVal = $('#bet_val');
        var rangeCallback = function (proc) {
            $betVal.val( parseInt(proc * ($rootScope.user.pointsBonus + $rootScope.user.points)/100) );
        };

        $(document).ready(function () {
            VScrollBox.instance('.v-scroll-box');
        });
    }

    $scope.getCurrentGame = function() {

        $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/game/double/numbers/last'} ).
            success(function ( data, status )
            {
                $scope.lastNumbers = data;
            }).
            error(function(data,status) 
            {

            })

        $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/game/double/current'} ).
            success(function ( data, status )
            {
              if (data) {
                  var timerForStart = function(finishTime) {
                      if (typeof $rootScope.online != 'undefined') {
                          var countTime = new Date().getTime();
                          $scope.timer = Math.ceil((finishTime - (countTime + $rootScope.timeOffset))/1000);
                          $scope.timerF();
                      } else {
                          $timeout(function(){
                              timerForStart(finishTime);
                          }, 500);
                      }
                  }

                  if (data.dateStart && !data.dateFinished) {
                      timerForStart(data.dateStart + 20 * 1000);
                  } else if (data.dateFinished) {
                    $scope.timer = 0;                 
                    $scope.startDouble(data);
                  }

                  $scope.allBets = {
                    red: [],
                    green: [],
                    black: [],
                    blue: [],
                  }

                  for (var i = 0; i < data.deposits.length; i++) {
                    $scope.allBets[data.deposits[i].type.toLowerCase()].push({
                        betId : data.deposits[i].id,
                        id : data.deposits[i].user.id,
                        nickname : data.deposits[i].user.nickname,
                        avatar : data.deposits[i].user.avatar,
                        points: data.deposits[i].pointsBonus ? data.deposits[i].points + data.deposits[i].pointsBonus : data.deposits[i].points,
                    })

                    if (data.deposits[i].user.id == $rootScope.user.id) {
                        $scope.myBets[data.deposits[i].type.toLowerCase()] += data.deposits[i].pointsBonus ? data.deposits[i].points + data.deposits[i].pointsBonus : data.deposits[i].points;
                    }
                  }
              }

            }).
            error(function(data,status) 
            {

            })
    }

    $scope.getDoubleHistory = function() {
      if ($scope.historyGamesDouble.length == 0) {
        $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/game/double/history'} ).
            success(function ( data, status )
            {

              for (var i = 0; i < data.length; i++) {

                if (!$rootScope.doubleGameOn || $rootScope.doubleGameOn && i != 0) {
                  data[i].gameVerify = JSON.parse(data[i].resultJson);
              }

                $scope.historyGamesDouble.push(data[i]);
              }
              setTimeout(function () {
                  scrollHistory = CvScrollBox.instance( '#rbox1', [8, 277, 0, 207, 67, 0], 7, 55, '#18140a', '#ff9600');
              });
            }).
            error(function(data,status) 
            {

            })
      }
    }

    $scope.doDoubleBet = function(field) {
      $scope.betDelay = true;
      $rootScope.doubleSound.play();
      $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/game/double/enter/' + field.toUpperCase() +'/' + $scope.doubleBet} ).
            success(function ( data, status )
            {
                $scope.myBets[field] += $scope.doubleBet;
                $scope.betDelay = false;
                $translate(['TO_BET', 'BET_' + field.toUpperCase()]).then(function (messages) {
                    growl.error('<span class="icon icon-s-green-coins"></span> ' + $scope.doubleBet + ' ' + messages.TO_BET + ' ' + messages['BET_' + field.toUpperCase()], {backgroundImage : field.toUpperCase()});
                })
            }).
            error(function(data,status) 
            {
                $scope.betDelay = false;
                $translate(data.error).then(function (message) {
                    growl.error(message, {backgroundImage : data.error});
                })
            })
    }

    $scope.allDoubleSumm = function(array) {
        return $scope.summDeposits(array.red) + $scope.summDeposits(array.black) + $scope.summDeposits(array.green) + $scope.summDeposits(array.blue);
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

    $scope.updateItems = function(page) {
        if (typeof page != 'undefined') {
            $scope.currentPageItems = page
        }

        if ($rootScope.user) {
            $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/users/me/items/' + 730 + '/' + $scope.currentPageItems} ).
                success(function ( data, status )
                {
                    var arr = [];
                    var j   = -1;
                    var items = []

                    for (var i = 0; i < data.items.length; i++) {
                      if (data.items[i].itemTemplate.points != 0) {
                          items.push(data.items[i]);
                        }
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

                    console.log($rootScope.user.botGroup)

                    $scope.pages = new Array($scope.lastPage);
                }).
                error(function ( data, status )
                {

                });
        } else {
            $timeout($scope.updateItems, 100);
        }
    }

    $scope.toggleInventory = function() {
        $scope.toggled = true;
        $timeout(function(){
          $scope.toggled = false;
          HScrollBox.instance('#sbx3', 1, true);
        }, 550)
        $scope.depositItems = !$scope.depositItems;

        $( "#doublePanel2" ).css('position', 'absolute');
        $( "#doublePanel2" ).css('top', '30px');
        $( "#doublePanel2" ).css('width', '700px');
        $( "#doublePanel2" ).css('height', '470px');
        $( "#doublePanel1" ).css('height', '470px');

        $( "#doublePanel1" ).toggle( "slide", { direction: "right"} , 500);
        $( "#doublePanel2" ).toggle( "slide", { direction: "right"} , 500);

        $scope.updateItems(0);
    }

    $scope.buyPoints = function(inventory) {
         var array = [];
         var ids = [];
         var summ = 0;
         var text  = '';

        for (var i = inventory.length - 1; i >= 0; i--) {

            if (inventory[i].red == true) {

                var item = {};

                item.item = inventory[i];
                delete item.item.red;

                text += '<img width="100" alt="' + item.item.itemTemplate.name + '" title="' + item.item.itemTemplate.name + '" src="' + item.item.itemTemplate.icon + '"> ';

                item.status = 'INPUT';

                array.push(item.item.objectId);
                ids.push(item.item.id);
                summ += item.item.itemTemplate.points;
            }
        };

        var title = 'Пополнение баланса';
        text  += '<br/><br/>Вы уверены что хотите обменять эти предметы на поинты (' + summ + ')?<br/><br/>';

        var buttons = [{
          text : 'Обменять',
          func : $scope.buyPoints2,
          args : ids
        }]

        $rootScope.openPopup(title, text, buttons);
    }

    $scope.buyPoints2 = function (ids) {
      $rootScope.closePopup();
      
      $http( {method: 'POST', url: STEAM_TRADE_REST_WS_URL + '/market/sell', data: ids} ).
            success(function ( data, status )
            {
                $translate('BONUS_POINTS_ADD').then(function (message) {
                    growl.success(message + ' <span class="icon icon-s-green-coins"></span> ' + summ, {backgroundImage : 'BONUS_POINTS_ADD'});
                })
                
            }).
            error(function ( data, status )
            {
                $translate(data.error).then(function (message) {
                    growl.error(message, {backgroundImage : data.error});
                })
            });

    }

  $scope.startDouble = function(data) {

     var timetoFinish = data.dateFinished - (new Date().getTime() + $rootScope.timeOffset);

     var obj = {};

     obj.goSpin      = timetoFinish > 9000 ? 1000 : 1;
     obj.firstSpin   = timetoFinish > 9000 ? 360 : 1;

     obj.duration    = timetoFinish > 2000 ? timetoFinish - (2000 + obj.goSpin) : 0;
     obj.spins       = obj.duration > 2501 ? Math.round((obj.duration/1000)-2) * 360 : 0;

     var number      = data.rndNumber;
     var numberAngle = 360/16;

     $rootScope.doubleGameOn = true;
     $scope.enable = false;
     var max = 5, min = -5;
     var offset = Math.floor(Math.random() * (max - min + 1)) + min;
     var position = numberAngle * $scope.sectors[number] + offset;

     var arr = [numberAngle/2];

     for (i=1; i<16; i++) {
         arr.push(arr[i-1] + numberAngle);
     }

     arr.push(12)

     for (i=16; i<17+16*6; i++) {
         arr.push(arr[i-1] + numberAngle);
     }

     var target = 0;

     $("#doubleRound").rotate({
          angle: $scope.position,
          animateTo: obj.firstSpin + $scope.position,
          duration: obj.goSpin,
          easing: $.easing.easeInSine,
          callback: function(){
                    $("#doubleRound").rotate({
                          angle: $scope.position,
                          animateTo: obj.spins + position,
                          duration: obj.duration,
                          easing: $.easing.easeOutCubic,
                          callback: function(){

                              $scope.position = position;
                              $scope.lastNumbers.push(number);
                              $scope.winColor = data.object ? data.object.toLowerCase() : data.winner.toLowerCase();

                              if ($scope.historyGamesDouble.length > 0) {
                                  $scope.historyGamesDouble[0].rndNumber = number;
                                  $scope.historyGamesDouble[0].gameVerify = JSON.parse(data.resultJson);
                              }

                              $rootScope.doubleGameOn = false;

                              $scope.commonBets = {
                                  red : $scope.summDeposits($scope.allBets.red),
                                  green: $scope.summDeposits($scope.allBets.green),
                                  black: $scope.summDeposits($scope.allBets.black),
                                  blue: $scope.summDeposits($scope.allBets.blue)
                              }

                              var resultNumbers = function(value, goal, stepv, color) {
                                if (value < goal && stepv > 0 || value > goal && stepv < 0) {
                                    $scope.commonBets[color] += stepv;
                                    $timeout(function(){resultNumbers($scope.commonBets[color], goal, stepv, color)}, 100);
                                } else {
                                    $scope.commonBets[color] = goal;
                                }
                              }

                              for (color in $scope.commonBets) {
                                  var coefficient = $scope.winColor == color ? 2 : 0; 
                                  var a           = $scope.winColor == color ? 14 : -14;
                                  var b           = 1;
                                  if ($scope.winColor == 'green' && color == 'green' || $scope.winColor == 'blue' && color == 'blue') {
                                      coefficient = 14;
                                      b           = 13;
                                  }

                                  var stepv       = Math.round(($scope.commonBets[color]*b)/a);
                                  var goal        = $scope.commonBets[color]*coefficient;

                                  resultNumbers($scope.commonBets[color], goal, stepv, color);
                              }

                              $timeout(function(){
                                  $scope.enable = true;

                                  $scope.allBets = $rootScope.reserveGame ? $scope.reserveBets : {
                                    red: [],
                                    green: [],
                                    black: [],
                                    blue: [],
                                  }

                                  $scope.myBets = {
                                    red: 0,
                                    green: 0,
                                    black: 0,
                                    blue: 0,
                                   }

                                  $scope.timer = $rootScope.reserveGame ? $scope.reserveTimer : 20;

                                  $rootScope.allDouble = $rootScope.reserveGame ? $scope.allDoubleSumm($scope.reserveBets) : 0;

                                  $rootScope.reserveGame = false;
                                  $scope.reserveTimer = 0;
                                  $scope.reserveBets = {
                                    red: [],
                                    green: [],
                                    black: [],
                                    blue: [],
                                  }

                                  $scope.$apply();

                              }, timetoFinish - obj.duration)

                              $scope.$apply();
                          }
                     });
         },
         step : function(angle) {
            if (Math.round(angle) > arr[target] && $rootScope.doubleGameOn) {
                target++;
                $rootScope.doubleSound.currentTime = 0;
                //$rootScope.doubleSound.play();
            }
         }
     });
  }

  $scope.timerF = function() {

    if ($scope.timer == 0 || $rootScope.doubleGameOn) {
        $scope.timer = 0;

        if ($rootScope.reserveGame == true) {
            $scope.reserveTimer--;
            $timeout($scope.timerF, 1000);
        }

    } else {
        $scope.timer--;
        $timeout($scope.timerF, 1000);
    }
  }

    $scope.getLastWinner = function() {
        $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/game/double/largerst_jackpot'} ).
            success(function ( data, status )
                {
                    $rootScope.bestWinner = data;
                });
        $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/game/double/largerst_winning_streak'} ).
            success(function ( data, status )
                {
                    $rootScope.vanga = data;
                });
    }

  $scope.getCurrentGame();
  $scope.getLastWinner();
  $scope.initCircle();

  SocketService.onMessage(function (e) {

    var data = JSON.parse(e.data);

    if (data.handler == 'DOUBLE') {

        $rootScope.reserveGame = $scope.enable ? false : true;
        $scope.reserveTimer = 20;

        if (data.object.dateStart) {
            $timeout($scope.timerF, 10);

            if ($scope.historyGamesDouble.legth > 0) {
              $scope.historyGamesDouble.push(data.object);
              $scope.getLastWinner();
            }
        }
    }

    if (data.handler == 'DOUBLE_FINISH') {
        $scope.startDouble(data);
    }

    if (data.handler == 'DOUBLE_DEPOSIT') {
        var oldUserBet = false;

        if ($rootScope.reserveGame == true) {
            var currentBetsObject = $scope.reserveBets;
        } else {
            var currentBetsObject = $scope.allBets;
        }

        var betToAdd = {
            betId : data.object.id,
            id : data.object.user.id,
            nickname : data.object.user.nickname,
            avatar : data.object.user.avatar,
            points: data.object.pointsBonus ? data.object.points + data.object.pointsBonus : data.object.points,
        }

        for (var i = 0; i < currentBetsObject[data.object.type.toLowerCase()].length; i++) {
            if (currentBetsObject[data.object.type.toLowerCase()][i].betId == data.object.id) {

                currentBetsObject[data.object.type.toLowerCase()][i] = betToAdd;

                oldUserBet = true;
            }
        }

        if (oldUserBet == false) {
            currentBetsObject[data.object.type.toLowerCase()].push(betToAdd)
        }
    }

  });

}]);