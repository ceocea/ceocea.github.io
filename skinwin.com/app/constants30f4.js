var STEAM_TRADE_REST_WS_URL = 'https://skinwin.com/rest';

var GAMES = {
    730 : 'CSGO',
    570 : 'DOTA2'
}

var GAMESIDS = {
    'csgo' : 730,
    'dota2' : 570,
}

var dataLayer = []
var betVALUE;

String.prototype.escapeHTML = function() {
    return this.replace(/</g, "&lt;")
               .replace(/>/g, "&gt;")
               .replace(/"/g, "&quot;")
               .replace(/'/g, "&#039;");
}