angular.module('SkinWin.SocketService', ['angular-websocket'])
    .factory('SocketService', function ($rootScope, $websocket, $timeout) {

        var time = new Date().getTime();
        var link = '';
        if (location.protocol === 'https:')
            link = "wss://" + 'skinwin.com' + '/wsn/websocket';
        else
            link = "wss://" + 'skinwin.com' + '/wsn/websocket';

        wsconnect = $websocket(link);

        wsconnect.reconnectIfNotNormalClose = true;

        wsconnect.onOpen(function () {
            if (typeof $rootScope.user != 'undefined' && $rootScope.user.access > 0) {
                console.info('The websocket now is open');
            }
        });

        wsconnect.onMessage(function (e) {
            var data = JSON.parse(e.data);
            time =  new Date().getTime();
            $rootScope.$broadcast('socketMessage', data);
        });

        // событие при закрытие сокета.
        wsconnect.onClose(function (e) {
            wsconnect._reconnectAttempts = 0;

            if (typeof $rootScope.user != 'undefined' && $rootScope.user.access > 0) {
                console.info("Socket: close connect. " + (new Date().getTime() - time)/1000 + " sec. from last message.");
            }
        });

        // событие при закрытие сокета.
        wsconnect.onError(function (e) {
            if (typeof $rootScope.user != 'undefined' && $rootScope.user.access > 0) {
                console.info("on error.", e);
            }
        });

        return wsconnect;
    });