 angular.module('SkinWin.mainController', ['ui.router', 'ngSanitize'])

.controller('mainController', ['$rootScope', '$scope', '$window', '$state', '$stateParams', '$http', '$websocket', '$timeout', 'SocketService', '$locale', 'growl', '$cookies', '$filter', '$translate', '$sce', '$sanitize', '$compile', '$location',
                       function($rootScope, $scope, $window, $state, $stateParams, $http, $websocket, $timeout, SocketService, $locale, growl, $cookies, $filter, $translate, $sce, $sanitize, $compile, $location) {

    $('body')
        .on('click', '.l-lightbox', function (event) {
            if ($(event.target).attr('class') == 'l-lightbox') {
                $rootScope.closePopup();
            }
        })

    $('.l-header-burger').click(function(){
        $('.l-header-burger-menu').slideToggle();
    })

    var chanelScroll;

    $rootScope.teamInvites = [];

    $scope.userDebug = true;
    $scope.ban = {reason: ''};

    $rootScope.$state = $state;

    $scope.languages = [
        {name: 'English', short: 'en'},
        {name: 'Русский', short: 'ru'},
        {name: 'Português', short: 'bz'},
        {name: 'Deutsch', short: 'de'},
        {name: 'Français', short: 'fr'},
        {name: 'Polski', short: 'pl'},
        {name: 'Español', short: 'es'},
        {name: 'Português', short: 'pt'},
    ]

    $.getJSON("/resources/json/weapons.json", function(data) {
       $rootScope.weapons = data;
    });

    $rootScope.pointsInventory = [];

    //must be rewrite                   
    $scope.initGame = function(code) {
        $rootScope.startGame = code;
        $rootScope.game      = GAMESIDS[code]
        $rootScope.mainGame  = GAMES[$rootScope.game];

        var expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + 30);
        $cookies.putObject('game', $rootScope.game, {'expires': expireDate});
    }
    
    $rootScope.newItems = {ids: [], items: []};
    $scope.ItemsForms = {};
    $rootScope.doubleGameOn = false;
    $rootScope.messageText = '';
    $rootScope.newTickets = false;

    $rootScope.$on('$stateChangeSuccess', function() {
        $scope.state = $state.current.name;

        $translate($state.current.title).then(function (message) {
            $rootScope.pageTitle = message;
        });

        if ($scope.state == 'jackpot_state') {
            $translate('BETS').then(function (message) {
                $rootScope.pageTitle = message + ' ' + $rootScope.mainGame;
            });
        }
    });

    $rootScope.currentLang = $translate.use();

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){

        if (toState.name == 'jackpot_state') {
            if(typeof(toParams.game) == 'undefined') {
                event.preventDefault();
                $cookies.getObject('game') ? $scope.initGame(GAMES[$cookies.getObject('game')].toLowerCase()) : $scope.initGame("csgo");
                var g = $rootScope.startGame == 'csgo' ? false : $rootScope.startGame;
                $state.go('jackpot_state', {game: g}); 
            } else if (toParams.game == 'dota2' || toParams.game == '') {
                toParams.game ? $scope.initGame(toParams.game) : $scope.initGame('csgo');
                $rootScope.getStatistic();
                $rootScope.getSettings();
            } else {
                event.preventDefault();
                var g = $cookies.getObject('game') ? GAMES[$cookies.getObject('game')].toLowerCase() : "csgo";
                $state.go('jackpot_state', {game: g}, {reload: true, inherit: false, notify: true, location : true});
            }
        } else {
            if (toParams.game) {
                $scope.initGame(toParams.game);
                /*$rootScope.getStatistic();
                $rootScope.getSettings();*/
            } else {
                $cookies.getObject('game') ? $scope.initGame(GAMES[$cookies.getObject('game')].toLowerCase()) : $scope.initGame("csgo");
                /*$rootScope.getStatistic();
                $rootScope.getSettings();*/
            }
        }
    });

    $scope.changeLanguage = function (key) {
        $translate.use(key);
        $rootScope.currentLang = key;

        $('.lang-panel-2').blur();

         $translate($state.current.title).then(function (message) {
            $rootScope.pageTitle = message;
        });

        if ($scope.state == 'jackpot_state') {
            $translate('BETS').then(function (message) {
                $rootScope.pageTitle = message + ' ' + $rootScope.mainGame;
            });
        }
    };

    var domain = location.hostname.split('.').shift();
    if (domain != 'skinwin' && domain != 'localhost') {
        $scope.changeLanguage(domain);
    }

    $rootScope.messages = [];
    $scope.glued = true;
    $rootScope.messagePage = 0;
    $scope.invLimit = 100;
    $scope.invStart = 0;
    $scope.currentInvPage = 1;
    $rootScope.timeOffset = 0;

    $rootScope.donateUsers = {
        730: {},
        570: {}        
    }

    $rootScope.donateStuff = {
        730: [],
        570: []        
    }

    $rootScope.game = $cookies.getObject('game');

    //open/close chat DEPRECATED
    /*$rootScope.chatOn = $cookies.getObject('chat');

    if (typeof $rootScope.chatOn != 'undefined') {
        if ($rootScope.chatOn == 'opened') {
            $rootScope.closechat = false;
        } else if ($rootScope.chatOn == 'closed') {
            $rootScope.closechat = true;
        }
    } else {
        $rootScope.closechat = true;
    }

    if ($window.innerWidth <= 1300) {
        $rootScope.closechat = true;
    }

    $scope.closeChat = function() {
        $rootScope.closechat = !$rootScope.closechat;
        var value = $rootScope.closechat == true ? 'closed' : 'opened';
        var expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + 30);
        $cookies.putObject('chat', value, {'expires': expireDate});
    }*/

    $scope.deleteMessage = function(id) {
        $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/admin/chat/message/delete/' + id} ).
            error(function ( data, status )
            {
                growl.error(data.error, {backgroundImage : data.error});
            })
    }

    $scope.banUserconfirm = function(chatMessage) {
        $translate('BAN_USER').then(function (message) {
            var txt = message + ":<br/><img src='" + chatMessage.user.avatar + "' title='" + chatMessage.user.nickname + "' alt='" + chatMessage.user.nickname + "'> <b>" + chatMessage.user.nickname + '</b><br/><i><b>"' + chatMessage.text + '"</b></i><hr class="darkhr"/>'
            $rootScope.openPopup('BAN USER', txt, {}, {banuser : {}});
            $rootScope.banOpen = true;
            $rootScope.criminal = chatMessage.user;
            $rootScope.criminalMessage = chatMessage;
        });
    }

    $scope.banUser = function(id, ban) {
        ban.days = !ban.days ? 0 : ban.days;
        ban.hours = !ban.hours ? 0 : ban.hours;
        ban.minutes = !ban.minutes ? 0 : ban.minutes;
        var duration = (ban.minutes * 60 * 1000) + (ban.hours * 60 * 60 * 1000) + (ban.days * 24 * 60 * 60 * 1000);

        duration = !duration ? -1 : duration;

        var name = $rootScope.criminal.nickname;
         $rootScope.criminalMessage.text = $sce.valueOf($rootScope.criminalMessage.text);

        $http( {method: 'POST', url: STEAM_TRADE_REST_WS_URL + '/admin/punish',  data: {userId: id, punishmentType: ban.reason, duration: duration, chatMessage : $rootScope.criminalMessage}} ).
            success(function ( data, status )
            {
                $translate('USER_BANNED', {username: name}).then(function (message) {
                    growl.warning(message, {backgroundImage : 'USER_BANNED'});
                    $rootScope.criminal = {};
                });
                
            }).
            error(function ( data, status )
            {
                growl.error(data.error, {backgroundImage : data.error});
                $rootScope.criminal = {};
            })

        $scope.ban = {};
    }

    $scope.itemFilters = function(item) {
        var selectedItemsType = ['AVAILABLE','IN_ESCROW','IN_BLOCK'];
        return selectedItemsType.indexOf(item.status) !== -1;
    };

    $rootScope.groupForBot = function(inventory) { 
        var arr = [];
        var j   = -1;
        var items = [];

        inventory = $filter('orderBy')(inventory, '-itemTemplate.priceUsd');

        for (var i = 0; i < inventory.length; i++) {
            if (!inventory[i].hide && $scope.itemFilters(inventory[i])) {
                items.push(inventory[i]);
            }
        }

        for (var i = 0; i < items.length; i++) {
            if(i % 3 == 0){
                j++;
                arr[j] = [];
            }
            arr[j].push(items[i]);
        }

        $rootScope.user.botGroup = arr;
    }

    $scope.getMyTeam = function() {
        $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/team/my'} ).
            success(function ( data, status )
            {
                $rootScope.myTeam = data;
                $rootScope.myTeam.game = {
                    targetUser : {bank: 0},
                    sourceUser : {bank: 0}
                }
            }).
            error(function ( data, status )
            {
                growl.error(data.error, {backgroundImage : data.error});
            })


        $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/team/invites/list'} ).
            success(function ( data, status )
            {
                $rootScope.teamInvites = data;
            }).
            error(function ( data, status )
            {
                growl.error(data.error, {backgroundImage : data.error});
            })
    }

    $scope.removeTeam = function(id) {
        $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/team/cancel'} ).
            success(function ( data, status )
            {
                $rootScope.myTeam = false;
            }).
            error(function ( data, status )
            {
                growl.error(data.error, {backgroundImage : data.error});
            })
    }

    $scope.acceptInvite = function(invite, del) {
        var type = del ? 'cancel' : 'accept';

        $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/team/invites/' + type + '/' + invite.id} ).
            success(function ( data, status )
            {
                $rootScope.teamInvites.splice($rootScope.teamInvites.indexOf(invite), 1);

                if (!del) {
                    $rootScope.myTeam = data;
                    $rootScope.myTeam.game = {
                        targetUser : {bank: 0},
                        sourceUser : {bank: 0}
                    }
                }
            }).
            error(function ( data, status )
            {
                growl.error(data.error, {backgroundImage : data.error});
            })
    }

    $scope.checkPunishments = function() {
        $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/punishment/me'} ).
            success(function ( data, status )
            {
                $rootScope.chatBlocked = {time: 0, reason: ''};

                for (var i = 0; i < data.length; i++) {
                    if (data[i].punishmentTarget == 'CHAT' && data[i].expirationTime > $rootScope.chatBlocked.time) {
                        $rootScope.chatBlocked = {time : data[i].expirationTime, reason : data[i].punishmentType};
                    }
                };
            })
    }

    $scope.checkBlock = function(item) {
        if (item.status == 'IN_BLOCK') {
            item.red = false;
            
            $translate('ITEM_BLOCKED').then(function (message) {
                growl.error(message, {backgroundImage : 'TRADE_ERROR'});
            })
        }
    }

    //Sound Initialization
    $scope.soundONfunc = function() {
        $rootScope.caseOpenAudio.volume = 1;
        $rootScope.roundBegin.volume = 1;
        $rootScope.newBet.volume = 1;
        $rootScope.doubleSound.volume = 1;
        $rootScope.soundTitle = 'TURN_OFF_SOUND';

        var expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + 30);

        $cookies.putObject('sound', 'on', {'expires': expireDate});
    }

    $scope.soundOfffunc = function() {
        $rootScope.caseOpenAudio.volume = 0;
        $rootScope.roundBegin.volume = 0;
        $rootScope.newBet.volume = 0;
        $rootScope.doubleSound.volume = 0;
        $rootScope.soundTitle = 'TURN_ON_SOUND';

        var expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + 30);

        $cookies.putObject('sound', 'off', {'expires': expireDate});
    }

    $scope.messageSound = function(volume) {
        $rootScope.ticketSound.volume = volume * 0.1;
        $scope.ticketSoundVolume = volume;
        var expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + 30);

        $cookies.putObject('ticketSound', volume * 0.1, {'expires': expireDate});
    }

    $rootScope.caseOpenAudio = document.createElement('audio');
    $rootScope.caseOpenAudio.src = "/resources/audio/click.mp3";

    $rootScope.newBet = document.createElement('audio');
    $rootScope.newBet.src = "/resources/audio/bet.mp3";

    $rootScope.roundBegin = document.createElement('audio');
    $rootScope.roundBegin.src = "/resources/audio/round_started.mp3";

    $rootScope.doubleSound = document.createElement('audio');
    $rootScope.doubleSound.src = "/resources/audio/double4.mp3";

    $rootScope.ticketSound = document.createElement('audio');
    $rootScope.ticketSound.src = "/resources/audio/message.mp3";

    $rootScope.soundCookies = $cookies.getObject('sound');
    $rootScope.ticketSound.volume = typeof ($cookies.getObject('ticketSound')) != 'undefined' && $cookies.getObject('ticketSound') <= 1 ? $cookies.getObject('ticketSound') : 1;
    $scope.ticketSoundVolume = $rootScope.ticketSound.volume * 10;

    if (typeof $rootScope.soundCookies != 'undefined') {
        if ($rootScope.soundCookies == 'on') {
            $rootScope.soundOff = false;
            $scope.soundONfunc();
        } else if ($rootScope.soundCookies == 'off') {
            $rootScope.soundOff = true;
            $scope.soundOfffunc();
        }
    } else {
        $rootScope.soundOff = false;
        $scope.soundONfunc();
    }

    //Sound off/on
    $scope.soundCheck = function() {
        $rootScope.soundOff = !$rootScope.soundOff;
        if(!$rootScope.soundOff) {
            $scope.soundONfunc();
        } else {
            $scope.soundOfffunc();
        }
    }
    
    $rootScope.openPopup = function(title, text, buttons, params) {
        
        if (typeof params == 'undefined') {
            params = {};
        }

        $rootScope.donateGroup = params.group;
        $scope.longversion = params.longversion;
        $rootScope.linkpopup = params.link;
        $rootScope.welcomePopup = params.welcome;

        $rootScope.popup = {title : title, text : text, buttons : buttons, params : params};

        $('#popup').appendTo('body').fadeIn(function () {});
    }

    $rootScope.closePopup = function(active) {

        $('.l-lightbox').fadeOut();

        $rootScope.newItems = {ids: [], items: []};

        $rootScope.popup = {};
        $scope.Ipopup    = false;
        $scope.Ipopup2   = false;
        $rootScope.banOpen = false;
        $rootScope.linkpopup = false;
        $rootScope.donateGroup = false;
        $scope.longversion = false;
        $scope.freeCode = '';
        if (active) {
            location.reload(true);
        }
    }

    $rootScope.openInventoryPopup = function(ipop2) {
        $scope.overlayed = 'overlayed';
        $rootScope.pointsInventoryType = false;
        $scope.tempDelay = true;

        if (ipop2) {
            $scope.Ipopup2 = true;
            $rootScope.updateInventory();
            $scope.invSort = 'points';
        } else {
            if ($rootScope.newItems.ids.length > 0) {
                $scope.tempDelay = false;
                $scope.changeInvtype('site', 'points');
            } else {
                $rootScope.updateInventory();
            }
            $scope.Ipopup = true;
            $('#InvPopup').appendTo('body').fadeIn(function () {});
            $scope.invSort = 'priceUsd';
        }
    }

    //DEPRECATED
    /*$scope.changeInvtype = function(type, points) {
        if (!$scope.tempDelay) {
            var game = points == 'points' ? 730 : $rootScope.game;
            if (type == "steam") {
                $rootScope.pointsInventoryType = false;
                $rootScope.pointsInventory = $rootScope.user.inventory;
            } else {
                $rootScope.pointsInventoryType = true;
                $rootScope.inventoryInUpdate = true;
                $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/users/me/items/' + game + '/' + 0} ).
                    success(function ( data, status )
                    {
                        $rootScope.inventoryInUpdate = false;
                        $rootScope.pointsInventory = $rootScope.newItems.items.concat(data.items);
                    }).
                    error(function ( data, status )
                    {
                        $rootScope.inventoryInUpdate = false;
                    });
            }
        }
    }*/

    $rootScope.inventoryPage = function(page) {
        $scope.invStart = (page-1) * $scope.invLimit;
        $scope.currentInvPage = page;
    }

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

        return array.reduce( function(a, b) {
            return +a + +b.itemTemplate[prop];
        }, 0);
    };

    //Get current statistics
    $rootScope.getSettings = function() {

        $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/game/roulette/' + $rootScope.game + '/settings'} ).
            success(function ( data, status )
            {
                $rootScope.roundLimit = data.limitGameItems;
                $rootScope.minDeposit = data.minDepositSumItems;
            })
    }

    $rootScope.getStatistic = function() {    

        //DEPRECATED
        /*$http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/game/roulette/' + $rootScope.game + '/statistic'} ).
            success(function ( data, status )
            {
                $rootScope.gamesStat = data;
            })*/
    }

    //Send items from steam inventory to skinwin bot
    $rootScope.sendInv = function(inventory, status) {

        $scope.delayStatus = status;

        if(!$rootScope.user.tradeLink) {

            $translate(['USER_TRADE_LINK_NOT_FOUND', 'ENTER_LINK_PROFILE'], {id : $rootScope.user.id}).then(function (translations) {
                $scope.openPopup(translations.USER_TRADE_LINK_NOT_FOUND, translations.ENTER_LINK_PROFILE);
            })

        } else {

            $rootScope.closePopup();
            var present = false;

            var array = [];

            for (var i = inventory.length - 1; i >= 0; i--) {

                if (inventory[i].red == true) {

                    if (inventory[i].present) {
                        present = true;
                    } else {
                        inventory[i].status = status;
                    }

                    var item = {};

                    item.item = inventory[i];
                    delete item.item.red;
                    item.status = status;

                    if(status == 'INPUT') {
                        array.push(item.item.objectId);
                    } else {
                        array.push(item.item.id);
                    }
                }
            };

            if(!present) {
                $http( {method: 'POST', url: STEAM_TRADE_REST_WS_URL + '/trade/create/' + $rootScope.game + '/' + status, data: array} ).
                    success(function ( data, status )
                    {
                        $translate('TRADE_IN_QUEUE').then(function (message) {
                            growl.success(message, {backgroundImage : 'TRADE_IN_QUEUE'});
                        })
                    }).
                    error(function ( data, status )
                    {
                        $translate(data.error).then(function (message) {
                            growl.error(message, {backgroundImage : data.error});
                        })
                    });
             } else {
                $translate('TRADE_OFFER_CANT_PRESENT_ITEMS').then(function (message) {
                    $rootScope.openPopup(message);
                })
            }
        }
    }

/*    $scope.buyPoints = function(inventory, type) {

        $scope.closePopup();

         var array = [];
         var ids = [];
         var summ = 0;

        for (var i = inventory.length - 1; i >= 0; i--) {

            if (inventory[i].red == true) {

                
                var item = {};

                item.item = inventory[i];
                delete item.item.red;

                item.status = 'INPUT';

                array.push(item.item.objectId);
                ids.push(item.item.id);
                summ += item.item.itemTemplate.points;
            }
        };
        
        $http( {method: 'POST', url: STEAM_TRADE_REST_WS_URL + '/market/sell', data: ids} ).
            success(function ( data, status )
            {
                $translate('BONUS_POINTS_ADD').then(function (message) {
                    growl.success(message + ' <img src="/resources/img/points1.png" class="point-image"> ' + summ, {backgroundImage : 'BONUS_POINTS_ADD'});
                })
                
            }).
            error(function ( data, status )
            {
                $translate(data.error).then(function (message) {
                    growl.error(message, {backgroundImage : data.error});
                })
            });
    }*/

    //Sent donate request with stuff
    $scope.donateStuffTwo = function(inventory, friend, group) {

        var array = [];
        var ItemsIDS = [];
        var err = false;

        for (var i = inventory.length - 1; i >= 0; i--) {

            if (inventory[i].red == true) {

                var item = {};

                item.item = inventory[i];
                delete item.item.red;

                array.push(item);

                inventory[i].hide = true;
                ItemsIDS.push(item.item.objectId);
            }

            $rootScope.groupForBot(inventory);
        };

        if (typeof friend != 'undefined' && !group) {
            var url = '/users/items/transfer';
            var obj = {items: array, targetUserId: friend};

        } else {
            var url = '/users/items/donation';
            var obj = {items: array, donationTag: group};
        }

        $rootScope.closePopup();

        $http( {method: 'POST', url: STEAM_TRADE_REST_WS_URL + url, data: obj} ).
            success(function ( data, status )
                {
                    if (group) {

                        var text = '<strong>Кто получил ваш подарок:</strong><br/><br/>';
                        var cssclass = data.length > 5 ? '' : 'line-style';

                        for (var i = data.length - 1; i >= 0; i--) {
                            text += '<div class="winner-tag-popup ' + cssclass + '"><a target="_blank" href="/users/' + data[i].id + '"><img src="' + $filter('imageUrl')(data[i].avatar) + '"><span>' + data[i].nickname + '</span></div>';
                        }
                        
                        $rootScope.openPopup(text, {longversion: true});
                    }
                })
            .error(function ( data, status )
                {
                    $translate(data.error).then(function (message) {
                        $rootScope.openPopup(message);
                    })
                   
                    for (var i = inventory.length - 1; i >= 0; i--) {
                        if (ItemsIDS.indexOf(inventory[i].objectId) != -1) {
                            inventory[i].hide = false;
                        }
                    };

                    inventory = inventory.concat(array);

                    $rootScope.groupForBot(inventory);
                });
    }

    // In main controller because user can use ref code from link to mainpage
    $scope.getFreeRefPoints = function(code, type) {

        $rootScope.closePopup()
        $scope.freeCode = '';
        $cookies.remove('refCode');

        $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/referrals/code/enter/' + type + '/' + code} ).
            success(function ( data, status )
            {
                $translate('BONUS_POINTS_GROWL').then(function (message) {
                    growl.success(message + ' <img src="/resources/img/points1.png" class="point-image"> ' + 10, {backgroundImage : 'BONUS_POINTS_GROWL'});
                })             
            }).
            error(function ( data, status )
            {
                 $translate(data.error).then(function (message) {
                    growl.error(message, {backgroundImage : data.error});
                });

            })
    }

    $scope.openchatRules = function() {
        $translate('CHAT_RULES_TEXT').then(function (message) {
            $rootScope.openPopup($sce.trustAsHtml(message), {longversion: true});  
        })
    }

    //Chat init
    $scope.chatLoad = function() {
        var id = $rootScope.messagePage > 0 ? $rootScope.messages[0].id : 0

        $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/chat/load/' +  id}).
            success(function ( data, status )
                {
                    for (var i = 0; i < data.length; i++) {

                        if (data[i].text != null) {
                            data[i].text = data[i].text.replace(/(<([^>]+)>)/ig,"");
                            data[i].text = data[i].text.escapeHTML();
                            //data[i].text = Autolinker.link( data[i].text, { truncate: { length: 32, location: 'middle' }, stripPrefix : false, twitter : false } );
                            data[i].text = $sce.trustAsHtml(data[i].text);
                        }

                        if(data[i].message && data[i].message != "CHAT_MESSAGE_HIDDEN") {
                            data[i].system = true;
                            data[i].user = {nickname: 'MODERATOR', avatar: '/resources/img/moder2.png', id: 0};
                        }
                    };

                    var array = data.reverse();
                    array = array.concat($rootScope.messages);
                    $rootScope.messages = array;

                    $timeout(function(){$("#messages").scrollTo('#message' + id)}, 1);

                    $timeout(function(){VScrollBox.instance('.chat-list-channel')}, 1000);
                });
    }

    $scope.changeMessage = function(message) {
            $rootScope.messageText = message;
        }

        $rootScope.$watch('messageText', function(newValue, oldValue) {
            $scope.messageText = newValue;
        })

      $( "#messages" ).scroll(function() {
          if ($("#messages").scrollTop() == 0) {
              $rootScope.messagePage++;
              $scope.chatLoad();
          };
      });

    //Chat sending messages
     $scope.sendMessage = function(message, event) {
        if (typeof event != 'undefined') {
            event.preventDefault();
        }

        message = message.escapeHTML();

        if (!$rootScope.sendMessageBlock && message && $rootScope.user) {
            $rootScope.sendMessageBlock = true;
            $http( {method: 'POST', url: STEAM_TRADE_REST_WS_URL + '/chat/send', data: {text: message}} ).
                success(function ( data, status )
                    {
                        $rootScope.sendMessageBlock = false;
                        $rootScope.messageText = '';
                    }).
                    error(function ( data, status )
                        {
                            $rootScope.sendMessageBlock = false;
                            $translate(data.error).then(function (message) {
                                growl.error(message, {backgroundImage : data.error});
                            })
                        });
        }
    }

    //Change tradeink
    $scope.changeLink = function(link, inv) {
        $http( {method: 'PUT', url: STEAM_TRADE_REST_WS_URL + '/users/me/link', data: {trade_link: link}} ).
            success(function ( data, status )
            {
                $translate('ASSOS_LINK').then(function (message) {
                    $rootScope.openPopup(message);
                })

                if (inv) {
                    $scope.sendInv($rootScope.user.inventory, $scope.delayStatus)
                }
            }).
            error(function ( data, status )
            {
                $translate(data.error).then(function (message) {
                    $rootScope.openPopup(message);
                })
            });
    }

    //Update steam inventory
    $rootScope.updateInventory = function(method) {

        var game = $rootScope.game;
        var meth = method ? 'PATCH' : 'GET';

        $rootScope.inventoryInUpdate = true;

        //if (!$scope.userDebug) {
            $http( {method: meth, url: STEAM_TRADE_REST_WS_URL + '/users/me/inventory/' + game} ).
                success(function ( data, status )
                    {
                        $rootScope.user.inventory = data.items;
                        $rootScope.invUpdate = data.lastUpdate;
                        $rootScope.pointsInventory = data.items;
                        $scope.invLastPage = Math.ceil(data.items.length / $scope.invLimit);
                        $scope.invPages = new Array($scope.invLastPage);
                        $scope.tempDelay = false;
                        $rootScope.inventoryInUpdate = false;

                        $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/game/restrict/items'} ).
                            success(function ( data2, status ) {
                                $scope.restrictItems = data2;
                            });
                    }).
                    error(function ( data, status )
                    {
                        $translate(data.error).then(function (message) {
                            $rootScope.openPopup(message);
                        })

                        $scope.tempDelay = false;
                        $rootScope.inventoryInUpdate = false;
                    });
        /*} else {
            $rootScope.user.inventory = $rootScope.user.botInventory;
            $rootScope.inventoryInUpdate = false;
        }*/
    }

    //friend autoload
    $scope.loadFriend = function(id, popup) {

        popup.friendIdObject = 'loader';

        $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/profile/' + id} ).
            success(function ( data, status )
            {
                popup.friendIdObject = data;
            }).
            error(function ( data, status )
            {
                popup.friendIdObject = 'false';
            })
    }

    $scope.getUser = function() {
        $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/users/me'} ).
            success(function ( data, status )
                {
                    $rootScope.user = data;
                    $rootScope.userGetSuccess = true;

                    if ($rootScope.user.id) {
                        $scope.checkPunishments();
                        $scope.getMyTeam();

                        var expireDate = new Date();
                        expireDate.setDate(expireDate.getDate() + 30);
                    } else {
                        $rootScope.firstTime = $cookies.getObject('firstTime');
                    }

                    if ($location.search().ref || $cookies.getObject('refCode')) {
                        if (!$rootScope.user.id) {
                            $cookies.putObject('refCode', $location.search().ref);
                        } else {
                            if (!$rootScope.user.referrerUserId) {
                                var code = $location.search().ref ? $location.search().ref : $cookies.getObject('refCode');

                                $scope.getFreeRefPoints(code, 'LINK');

                            }
                        }
                    }

                    if (!data.id && $scope.userDebug) {

                        $.getJSON("/volk.json", function(data) {
                            var arr = [];
                            var j   = -1;
                            for (var i = 0; i < data.items.length; i++) {
                                if(i % 3 == 0){
                                    j++;
                                    arr[j] = [];
                                }
                                arr[j].push(data.items[i]);
                            }

                            $rootScope.user = data.user;
                            $rootScope.user.inventory = data.items;
                            $rootScope.user.botInventory = data.items;
                            $rootScope.user.botGroup = arr;
                            $scope.invLastPage = Math.ceil(data.items.length / $scope.invLimit);
                            $scope.invPages = new Array($scope.invLastPage);
                        });
                    }

                }).
            error(function ( data, status )
                {

                });
    }
    
    $scope.getRounds = function() {
        $http( {method: 'GET', url: STEAM_TRADE_REST_WS_URL + '/game/bets'} ).
            success(function ( data, status )
            {
                $rootScope.allDouble = data.gameDouble;
                $rootScope.allDota = data.gameRouletteDOTA2;
                $rootScope.allCs = data.gameRouletteCSGO;
                $rootScope.allCoinflip = data.gameCoinFlip;
            })
    }

    //DEPRECATED
   /* ifvisible.setIdleDuration(1800);

    ifvisible.idle(function(){
        $rootScope.nonActive = true;
        $rootScope.user.id != SWITCH ? SocketService.close(false, true) : $rootScope.openPopup('ERROR');
        $translate('NON_ACTIVE').then(function (message) {
            $rootScope.openPopup(message);
        });
        
    });

    ifvisible.wakeup(function(){

    });*/

    $scope.chatLoad();
    $scope.getUser();
    $scope.getRounds();

    SocketService.onMessage(function (e) {

        var data = JSON.parse(e.data);
        
        try
        {
            // не удаляй пожалуйста (c) Ro0TT / Алексей
            if ($rootScope.user && $rootScope.user.id == 3)
                console.info(data);
        }
        catch(e)
        {
            console.info(e);
        }

        if (data.handler == 'USERS') {
            $rootScope.online = data.count;
            $rootScope.timeOffset = data.serverTime - new Date().getTime();
        }

        if (data.handler == 'USER') {
            $rootScope.user.chatEnabled = data.object.chatEnabled;
            $rootScope.user.pointsBonus = data.object.pointsBonus;
            $rootScope.user.lastDateGetGift = data.object.lastDateGetGift;

            var pointsUpdate = function(points, activatedPoints) {
                if ($rootScope.doubleGameOn == false) {       
                     $rootScope.user.points = points;
                     $rootScope.user.pointsBonusActivated = activatedPoints;
                } else {
                    $timeout(function() {pointsUpdate(points, activatedPoints)}, 500);
                }
            }

            pointsUpdate(data.object.points, data.object.pointsBonusActivated)
        }

        if (data.handler == 'FRIEND_TRANSFER') {
            $translate('FRIEND_TRANSFER').then(function (message) {

                var items = '';
                var checkids = [];

                for (var i = 0; i < $rootScope.user.botInventory.length; i++) {
                    if (data.itemsId.indexOf($rootScope.user.botInventory[i].id) != -1 && checkids.indexOf($rootScope.user.botInventory[i].id) == -1) {
                        checkids.push($rootScope.user.botInventory[i].id);
                        items = items + '<img src="' + $filter('imageUrl')($rootScope.user.botInventory[i].itemTemplate.icon) + '" title="' + $rootScope.user.botInventory[i].itemTemplate.name + '" alt="' + $rootScope.user.botInventory[i].itemTemplate.name + '" width="100" style="margin: 5px 2px;"> ';
                    }
                };

                $rootScope.openPopup('<a target="_blank" href="/users/' + data.user.id + '">' + data.user.nickname + '</a> ' + message + '.', items, false);
            })
        }

        if (data.handler == 'RELOAD_PAGE') {
            location.reload(true);
        }

        if (data.handler == 'CHAT_HIDEN_MESSAGE') {
            angular.forEach($rootScope.messages, function (value, key)
                {
                    if (data.object.indexOf(value.id) != -1)
                    {
                        $rootScope.messages[key].message = 'CHAT_MESSAGE_HIDDEN';
                    }
                });
        }

        if (data.handler == 'GAME_SETTINGS') {
            if(data.appType == $rootScope.mainGame) {
                $rootScope.roundLimit = data.object.limitGameItems;
                $rootScope.minDeposit = data.object.minDepositSumItems;
            }
        }

        if (data.handler == 'STATISTIC') {
            if(data.appType == $rootScope.mainGame) {
                $rootScope.gamesStat = data.object;
            }
        }

        if (data.handler == 'DOUBLE_DEPOSIT') {
            if ($scope.state != 'double_state' || $scope.state == 'double_state' && !$scope.reserveGame) {
                $scope.newDoubleBet = data.currentBet;

                $rootScope.allDouble += data.currentBet;
                $('#double-informer').stop();
                $('#double-informer').fadeIn();
                $('#double-informer').fadeOut( 5000 );
            }
        }

        if (data.handler == 'ROULETTE_DEPOSIT' && data.appId == 730) {

            var bank = 0;

            for (var i = data.object.items.length - 1; i >= 0; i--) {
                bank += data.object.items[i].item.itemTemplate.priceUsd;
            };

            $scope.newCsBet = bank;

            $rootScope.allCs += bank;

            $('#cs-informer').stop();
            $('#cs-informer').fadeIn();
            $('#cs-informer').fadeOut( 5000 );
        }

        if(data.handler == 'ROULETTE' && data.object.dateCompleted != null) {
            if(data.appId == 730) {$rootScope.allCs = 0;} else {
                $rootScope.allDota = 0;
            }
        }

        if (data.handler == 'ROULETTE_DEPOSIT' && data.appId == 570) {

            var bank = 0;

            for (var i = data.object.items.length - 1; i >= 0; i--) {
                bank += data.object.items[i].item.itemTemplate.priceUsd;
            };

            $rootScope.allDota += bank;

            $scope.newDotaBet = bank;
            $('#dota-informer').stop();
            $('#dota-informer').fadeIn();
            $('#dota-informer').fadeOut( 5000 );
        }

        if (data.handler == 'PUNISHMENT') {
            $rootScope.chatBlocked = {time : data.object.expirationTime, reason : data.object.punishmentType};
        }

        if (data.handler == 'TEAM_INVITE') {
            if ($rootScope.teamInvites < 1) {
                $scope.teamplayList = true;
            }
            $rootScope.teamInvites.unshift(data.object);
        }

        if (data.handler == 'TEAM_CANCEL') {
            $rootScope.myTeam = false;
        }

        if (data.handler == 'TEAM_ACCEPT') {
                $rootScope.myTeam = data.object;
                $rootScope.myTeam.game = {
                        targetUser : {bank: 0},
                        sourceUser : {bank: 0}
                    }

            $translate(['INVITE_ACCEPT', 'TEAMPLAY_TITLE'], {nickname: data.object.targetUser.nickname}).then(function (messages) {

                $rootScope.openPopup(messages.TEAMPLAY_TITLE, messages.INVITE_ACCEPT);
            })
        }

        if (data.handler == 'CHAT') {
            if (data.chatMessage) {
                $rootScope.currentChatMess = data.chatMessage.id;
                if (!data.chatMessage.message) {
                    if (data.chatMessage.text != null) {
                        data.chatMessage.text = data.chatMessage.text.replace(/(<([^>]+)>)/ig,"");
                        data.chatMessage.text = data.chatMessage.text.escapeHTML();
                        //data.chatMessage.text = Autolinker.link(data.chatMessage.text, { truncate: { length: 32, location: 'middle' }, stripPrefix : false, twitter : false } );
                        data.chatMessage.text = $sce.trustAsHtml(data.chatMessage.text);
                    }

                    $rootScope.messages.push(data.chatMessage);
                } else if (data.chatMessage.message != "CHAT_MESSAGE_HIDDEN") {
                    $translate(['USER_GET_PUNISHMENT', 'MODERATOR', data.chatMessage.message], {username: data.chatMessage.messageArgs[1], time : $filter('remainTime2')(data.chatMessage.messageArgs[0])}).then(function (messages) {

                        data.chatMessage.system = true;
                        data.chatMessage.user = {nickname: messages.MODERATOR, avatar: '/resources/img/moder.png', id: 0};
                        data.chatMessage.text = messages.USER_GET_PUNISHMENT + " " + messages[data.chatMessage.message];

                        $rootScope.messages.push(data.chatMessage);

                        chanelScroll = VScrollBox.instance('.chat-list-channel');
                    })
                }

                if ($rootScope.messages.length > 100 && $scope.glued == true) {
                    $rootScope.messages.shift();
                }

            } else {
                var deleteMessageId = data.deleteMessage;
                angular.forEach($rootScope.messages, function (value, key)
                {
                    var rem = false;
                    if (value.id == deleteMessageId) 
                    {
                        $rootScope.messages.splice(key, 1);
                        rem = true;
                    }
                });
            }
        }

        if (data.handler == 'DOUBLE_FINISH' && $scope.state != 'double_state') {
            $rootScope.allDouble = 0;
        }

        if (data.handler == 'SUPPORT') {
            if ($scope.state != 'support_state') {
                $rootScope.newTickets = true;
            }

            if ($rootScope.user.access >= 60 && data.object.messages[data.object.messages.length - 1].user.access < 60) {
                $rootScope.ticketSound.play();
            }

            if (data.object.messages.length > 1) {
                $translate('NEW_TICKET_HANDLER2').then(function (message) {
                    growl.error(message + data.object.id, {backgroundImage : 'COPY_FAILED'});
                })
            } else if ($rootScope.user.id != data.object.messages[data.object.messages.length - 1].user.id) {
                $translate('NEW_TICKET_HANDLER').then(function (message) {
                    growl.error(message + data.object.id, {backgroundImage : 'COPY_SUCCESS'});
                })
            }   
        }

        if (data.handler == 'COINFLIP') {

            if (data.object.dateStart) {
                $scope.allCoinflip--;
            } else {
                $scope.allCoinflip++;
            }

        }

        if (data.handler == 'ALERT') {
            var text = "С прошлой игры в комиссию добавилось " + data.itemsCount + " предметов на сумму (" + data.itemsSumRub / 100 + " руб / " + data.itemsSumUsd / 100 + "$).";
            growl.error(text);
        }

        if (data.handler == 'TRADES'){
            if (data.object.tradeOfferState == 'ACTIVE') {
                $translate('TRADE_SENT', {id : data.object.tradeOfferId, mess: data.object.message}).then(function (message) {
                    $rootScope.openPopup(message);
                })
            } else if (data.object.tradeOfferState == null) {               
                $translate('TRADE_IN_PROCESS', {id : data.object.id}).then(function (message) {
                    growl.success(message, {backgroundImage : 'TRADE_IN_PROCESS'});
                })
            } else if (data.object.tradeOfferState == 'INVALID' || data.object.status == 'INVALID_ITEMS') {        
                $translate('TRADE_ERROR').then(function (message) {
                    growl.success(message + data.object.id + '.', {backgroundImage : 'TRADE_ERROR'});
                })
            }
        }

    });
    

}]);
