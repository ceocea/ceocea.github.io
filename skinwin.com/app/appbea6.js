'use strict';

var app = angular.module('SkinWin', [
    'SkinWin.mainController',
    'SkinWin.jackpotController',
    'SkinWin.doubleController',
    'SkinWin.coinflipController',
    'SkinWin.crashController',
    'SkinWin.historyController',
    'SkinWin.topController',
    'SkinWin.referralController',
    'SkinWin.bonusController',
    'SkinWin.marketController',
    'SkinWin.userController',
    'SkinWin.gameController',
    'SkinWin.supportController',
    'SkinWin.faqController',

    'SkinWin.chatDirective',

    'SkinWin.SocketService',

    'pascalprecht.translate',
    'ui.router',
    'ngWebSocket',
    'angular-growl',
    'ngCookies',
    'luegg.directives'
]);

app.config(function($urlRouterProvider, $stateProvider, $locationProvider, $translateProvider) {
    
    $stateProvider

        .state('admin_state', {
            url: '/users/admin',
            templateUrl: 'app/views/admin.html?v=2',
            controller: '',
            title: 'ADMIN_SKINWIN',
        })

        .state('user_state', {
            url: '/users/{profile}',
            templateUrl: 'app/views/user.html?v=2',
            controller: 'userController',
            title: 'USER_PROFILE',
            resolve: {
                currentPage: function($stateParams){
                    var currentPage = {profile: $stateParams.profile};
                    return currentPage;
                }
            },
        })

        .state('game_state', {
            url: '/games/jackpot/{gameId}',
            templateUrl: 'app/views/gamejackpot.html?v=2',
            controller: 'gameJackpotController',
            title: 'GAME_INFO',
            resolve: {
                currentPage: function($stateParams){
                    var currentPage = {gameId: $stateParams.gameId};
                    return currentPage;
                }
            },
        })

        .state('game_double_state', {
            url: '/games/double/{gameId}',
            templateUrl: 'app/views/gamedouble.html?v=2',
            controller: 'gameDoubleController',
            title: 'GAME_INFO',
            resolve: {
                currentPage: function($stateParams){
                    var currentPage = {gameId: $stateParams.gameId};
                    return currentPage;
                }
            },
        })

        .state('game_coinflip_create_state', {
            url: '/games/coinflip/create',
            templateUrl: 'app/views/gamecoinflip.html?v=2',
            controller: 'coinflipController',
            title: 'GAME_INFO',
        })

        .state('game_coinflip_state', {
            url: '/games/coinflip/{gameId}',
            templateUrl: 'app/views/gamecoinflip.html?v=2',
            controller: 'coinflipController',
            title: 'GAME_INFO',
        })

        .state('contacts_state', {
            url: '/contacts',
            templateUrl: 'app/views/contacts.html?v=2',
            controller: '',
            title: 'CONTACTS',
        })

        .state('faq_state', {
            url: '/faq',
            templateUrl: 'app/views/faq.html?v=2',
            controller: 'faqController',
            title: 'FAQ',
        })

        .state('referral_state', {
            url: '/ref',
            templateUrl: 'app/views/referral.html?v=2',
            controller: 'referralController',
            title: 'REFERRAL_PROGRAM',
        })

        .state('bonus_state', {
            url: '/free',
            templateUrl: 'app/views/bonus.html?v=2',
            controller: 'bonusController',
            title: 'FREE_POINTS',
        })

        .state('market_state', {
            url: '/market',
            templateUrl: 'app/views/market.html?v=2',
            controller: 'marketController',
            title: 'MARKET',
        })

        .state('agreement_state', {
            url: '/agreement',
            templateUrl: 'app/views/agreement.html?v=2',
            controller: '',
            title: 'AGREEMENT',
        })

        .state('double_state', {
            url: '/double',
            templateUrl: 'app/views/double.html?v=2',
            controller: 'doubleController',
            title: 'DOUBLE_TITLE',
        })

        .state('coinflip_state', {
            url: '/coinflip',
            templateUrl: 'app/views/coinflip.html?v=2',
            controller: 'coinflipController',
            title: 'COINFLIP_TITLE',
        })

        .state('crash_state', {
            url: '/crash',
            templateUrl: 'app/views/crash.html?v=2',
            controller: 'crashController',
            title: 'CRASH_TITLE',
        })

        .state('support_state', {
            url: '/support',
            templateUrl: 'app/views/support.html?v=2',
            controller: 'supportController',
            title: 'SUPPORT_TITLE',
        })

        .state('login', {
            url: '/login',
            external: true,
        })

        .state('logout', {
            url: '/logout',
            external: true,
        })
        
        .state('jackpot_state', {
            url: '/{game}?lang',
            templateUrl: 'app/views/jackpot.html?v=2',
            controller: 'jackpotController',
            title: '',
            resolve: {
                currentPage: function($stateParams){
                    var currentPage = {game: $stateParams.game.toLowerCase()};
                    return currentPage;
                }
            }
        })

        .state('history_state', {
            url: '/history/{game}',
            templateUrl: 'app/views/history.html?v=2',
            controller: 'historyController',
            title: 'GAMES_HISTORY',
        })

        .state('top_state', {
            url: '/top/{game}',
            templateUrl: 'app/views/top.html?v=2',
            controller: 'topController',
            title: 'TOP_TWENTY',
        })
    
    $urlRouterProvider.otherwise('/');

    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    });

    $locationProvider.hashPrefix('!');

    $translateProvider
        .translations('en', translations.english)
        .translations('ru', translations.russian)
        .translations('es', translations.spanish)
        .translations('pt', translations.portuguese)
        .translations('fr', translations.french)
        .translations('de', translations.german)
        .translations('bz', translations.portuguese)
        .translations('pl', translations.polish)
        .translations('dev', translations.russian)

        .registerAvailableLanguageKeys(['en', 'ru', 'es', 'pt', 'fr', 'de', 'bz', 'pl'], {
            'en_*': 'en',
            'ru_*': 'ru',
            'uk_*': 'ru',
            'be_*': 'ru',
            'kk_*': 'ru',
            'es_*': 'es',
            'fr_*': 'fr',
            'pt_*': 'pt',
            'de_*': 'de',
            'pl_*': 'pl',
        })
        .useCookieStorage()
        .useSanitizeValueStrategy(null)
        .determinePreferredLanguage(false, 'en')
        
});

app.config(['growlProvider', function(growlProvider) {
    growlProvider.globalTimeToLive(5000);
    growlProvider.globalDisableCountDown(true);
    growlProvider.onlyUniqueMessages(false);
}]);

app.run(function($rootScope, $window) {
  $rootScope.$on('$stateChangeStart',
    function(event, toState, toParams, fromState, fromParams) {
      if (toState.external) {
        event.preventDefault();
        $window.open(toState.url, '_self');
      }
    });
});

app.filter('imageUrl', function() {

    var size = '120x120';

    return function (item) {
        return item ? 'https://' + item.substr(item.indexOf('://')+3) + '/' + size : '';
    };
});

app.filter('pluralize', function() {
    return function (number) {
        var result;

        switch (true) {
           case number == 1:
              result = 'ONE_ITEM'
              break
           case number == 2:
              result = 'OTHER_ITEMS'
              break
           default:
              result = 'MANY_ITEMS';
              break
        }

        return result;
    };
});

app.filter('humanTime', function() {

    return function (time, offset) {
        var date = time - new Date().getTime() + offset;
        date = new Date(time);

        return date.getDate() + '.' + (date.getMonth()+1) + '.' + date.getFullYear() + ' ' + date.getHours() + ':' + (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();
    };

});

app.filter('comission', function() {

    return function (points, count) {

        var result;

        switch (true) {
            case count == 0:
                result = points * 0;
                break;
            case (count > 0 && count < 5):
                result = points * 0.001;
                break;
            case (count >= 5 && count < 10):
                result = points * 0.0015;
                break
            case (count >= 10 && count < 15):
                result = points * 0.002;
                break;
            case (count >= 15):
                result = points * 0.0025;
                break;
        }

        return result;
    };

});

app.filter('replaceId', function() {

    var result;

    return function (id) {
        switch (id) {
           case 50229:
              result = 'bot'
              break
           case 0:
              result = 'admin'
              break
           default:
              result = id;
              break
        }

        return result;
    };

});

app.filter('timer24', function() {

    return function (time, offset) {

        var countdown = function(time, offset) {

            time = +time;

            var now = new Date().getTime() + + offset;

            var dateX =  new Date(now - time);

            var minHour = 0;
            var minMinu = 0;
            var plus    = '';

            /* Seconds */

            var s = (60 - dateX.getSeconds());
            
            if (s == 60) {
                s = 0;
                minMinu = 1;
            }

            plus = s < 10 ? '0' : '';
            var seconds = plus + s;

            /* minutes */

            var m = ((59 + minMinu) - dateX.getMinutes());

            if (m == 60) {
                m = 0;
                minHour = 1;
            }

            plus = m < 10 ? '0' : '';
            var minutes = plus + m;

            /* hours */

            var h = ((23 + minHour) - dateX.getUTCHours());
            plus = h < 10 ? '0' : '';
            var hours = plus + h;

            var result = hours + ':' +  minutes + ':' + seconds;

            if (now - time < 24 * 60 * 60 * 1000) {
                return result;
            } else {
                return false;
            }

        }

        return countdown(time, offset);
    };
});

app.directive('time', 
  [
    '$timeout',
    '$filter',
    '$translate',
    function($timeout, $filter, $translate) {

      return function(scope, element, attrs) {
        var timeoutId;
        var time = attrs.time;
        var offset = attrs.offset;
        var intervalLength = 1000;
        var filter = $filter('timer24');

        element.click(function() {
            time = attrs.time;
        })

        function updateTime() {
            if (!time) time = attrs.time;
            var val = filter(time, offset);

            if (val != false) {
                element.attr({'disabled' : true});
                element.text(val);
            } else {
                $translate('GET_PROFIT').then(function (message) {
                    element.attr({'disabled' : false});
                    element.text(message);
                })
            }
        }

        function updateLater() {
          timeoutId = $timeout(function() {
            updateTime();
            updateLater();
          }, intervalLength);
        }

        element.bind('$destroy', function() {
          $timeout.cancel(timeoutId);
        });

        updateTime();
        updateLater();
      };

    }  
  ]
);

app.filter('remainTime', function() {

    return function (time, offset, startTime) {

        var countdown = function(time, offset, startTime) {
            var now = new Date().getTime();

            var today = startTime ? startTime : now;
            var end = offset ? new Date(time + offset).getTime() : new Date(time).getTime() ;
            var dateX = new Date(end-today);
            var perDays = 60*60*1000*24;

            var result =  '';


            result = Math.floor(dateX/perDays) > 0 ? result + Math.floor(dateX/perDays) + ' д. ' : result;
            result = dateX.getUTCHours() > 0 ? result + dateX.getUTCHours() + ' ч. ' : result;

            var minutes = dateX.getMinutes() > 0 || result != '' ? dateX.getMinutes() : 1;

            result = minutes > 0 ? result + minutes + ' мин. ' : result;

            return time > now ? result : false;
        }

        return countdown(time, offset, startTime);
    };

});

app.filter('remainTime2', function() {

    return function (time) {

        var countdown = function(time) {

            var dateX = new Date(time);
            var perDays = 60*60*1000*24;

            var result =  '';

            result = Math.floor(dateX/perDays) > 0 ? result + Math.floor(dateX/perDays) + ' д. ' : result;
            result = dateX.getUTCHours() > 0 ? result + dateX.getUTCHours() + ' ч. ' : result;

            var minutes = dateX.getMinutes() > 0 || result != '' ? dateX.getMinutes() : 1;

            result = minutes > 0 ? result + minutes + ' мин. ' : result;

            return result;
        }

        return countdown(time);
    };

});

app.filter('remainTime3', function() {

    return function (time, offset, startTime) {

        var countdown = function(time, offset, startTime) {
            var now = new Date().getTime();

            var today = startTime ? startTime : now;
            var end = offset ? new Date(time + offset).getTime() : new Date(time).getTime() ;
            var dateX = new Date(end-today);
            var perDays = 60*60*1000*24;

            var result =  '';

            result = Math.floor(dateX/perDays) > 0 ? result + Math.floor(dateX/perDays) + ':' : result;

            var plus = dateX.getUTCHours() < 10 ? '0' : '';
            result = dateX.getUTCHours() > -1 ? result + plus + dateX.getUTCHours() + ':' : result;

            plus = dateX.getMinutes() < 10 ? '0' : '';
            var minutes = dateX.getMinutes() > -1 || result != '' ? plus + dateX.getMinutes() : '01';

            result = minutes > 0 ? result + minutes : result;

            return time > now ? result : false;
        }

        return countdown(time, offset, startTime);
    };

});