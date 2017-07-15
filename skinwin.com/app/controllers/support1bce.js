angular.module('SkinWin.supportController', ['ui.router'])

.controller('supportController', ['$rootScope', '$scope', '$window', '$state', '$stateParams', '$http', 'SocketService', '$timeout', '$translate', 'growl', function($rootScope, $scope, $window, $state, $stateParams, $http, SocketService, $timeout, $translate, growl) {

    $rootScope.newTickets  = false;
    $scope.newTicket       = {};
    $scope.currentPage     = 1;
    $scope.currentOldPage  = 1;
    $scope.checkOldTickets = false;
    $scope.timerForTickets = 0;
    $scope.transferTarget  = '';

    $scope.reasons = ['LOCKED_ITEMS', 'GAME_ROULETTE', 'GAME_DOUBLE', 'TRADES', 'MARKET', 'UNKNOWN_CATEGORY'];

    $scope.getPhrases = function() {
        
        $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/support/templates/list'} ).
            success(function ( data, status )
            {
                $scope.phrases = data;

                $('.select').click(function () {
                    var $s = $(this);
                    
                        $s.toggleClass('is-select-open');
                    
                });

                $('.select-list div').click(function () {
                        $('.select').removeClass('is-select-open');
                        return false;
                    });
            }).
            error(function ( data, status )
            {

            });
    }

    $scope.getTickets = function(page) {
        $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/support/requests/list/' + page + '/false'} ).
            success(function ( data, status )
            {
                $scope.tickets     = data.result;
                $scope.allPages    = data.totalPages;
                $scope.currentPage = page + 1;
            }).
            error(function ( data, status )
            {
                $translate(data.error).then(function (message) {
                    growl.error(message, {backgroundImage : data.error});
                })
            });
    }

    $scope.newMessage = function(ticket, obj) {
        $http( {method: 'POST', url: STEAM_TRADE_REST_WS_URL + '/support/request/create', data: ticket} ).
            success(function ( data, status )
            {
                $scope.newTicket = {};
                if (obj) {
                    obj.newMessage = '';
                }
            }).
            error(function ( data, status )
            {
                $translate(data.error).then(function (message) {
                    growl.error(message, {backgroundImage : data.error});
                })
            });
    }

    $scope.deleteMessage = function(id) {
        $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/support/request/message/delete/' + id} ).
            success(function ( data, status )
            {
                
            }).
            error(function ( data, status )
            {
                $translate(data.error).then(function (message) {
                    growl.error(message, {backgroundImage : data.error});
                })
            });
    }

    $scope.closeTicket = function(id) {
        $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/support/request/closed/' + id} ).
            success(function ( data, status )
            {
                
            }).
            error(function ( data, status )
            {
                $translate(data.error).then(function (message) {
                    growl.error(message, {backgroundImage : data.error});
                })
            });
    }

    $scope.getOldTickets = function(page) {
        $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/support/requests/list/' + page + '/true'} ).
            success(function ( data, status )
            {
                $scope.checkOldTickets = true;
                $scope.oldTickets      = data.result;
                $scope.allOldPages     = data.totalPages;
                $scope.currentOldPage  = page + 1;
                $scope.timerForTickets = 10;
                $timeout($scope.timerFn, 1000);
            }).
            error(function ( data, status )
            {
                $translate(data.error).then(function (message) {
                    growl.error(message, {backgroundImage : data.error});
                })
            });
    }

    $scope.timerFn = function() {
        if ($scope.timerForTickets > 0) {
            $scope.timerForTickets--;
            $timeout($scope.timerFn, 1000);
        }
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
                growl.error(messag, {backgroundImage : 'COPY_FAILED'});
            });
        }  
        window.getSelection().removeAllRanges();  
    }

    var checkUser = function() {
        if ($rootScope.user && $rootScope.userGetSuccess) {
            $scope.getPhrases();
            $scope.getTickets(0);
        } else if (!$rootScope.userGetSuccess) {
            $timeout(checkUser, 200);
        }
    }   

    checkUser(); 

    SocketService.onMessage(function (e) {

        var data = JSON.parse(e.data);

        if (data.handler == 'SUPPORT') {
            var newticket = true;

            for (var i = 0; i < $scope.tickets.length; i++) {
                if ($scope.tickets[i].id == data.object.id) {
                    $scope.tickets[i].messages = data.object.messages;
                    $scope.tickets[i].status = data.object.status;
                    $scope.tickets[i].new = 1;

                    newticket = false;
                }
            }

            if (newticket) {
                $scope.tickets.unshift(data.object);
            }
        }

        if (data.handler == 'SUPPORT_CLOSED') {
            for (var i = 0; i < $scope.tickets.length; i++) {
                if ($scope.tickets[i].id == data.object) {
                    $scope.tickets[i].dateClosed = true;
                }
            }
        }

        if (data.handler == 'SUPPORT_MESSAGE_DELETE') {
            for (var i = 0; i < $scope.tickets.length; i++) {
                for (var j = 0; j < $scope.tickets[i].messages.length; j++) {
                    if ($scope.tickets[i].messages[j].id == data.object) {
                        $scope.tickets[i].messages.splice(j, 1);
                    }
                }  
            }
        }
        
    })


}]);