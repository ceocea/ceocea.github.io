angular.module('SkinWin.faqController', ['ui.router'])

.controller('faqController', ['$rootScope', '$scope', '$window', '$state', '$stateParams', '$http', function($rootScope, $scope, $window, $state, $stateParams, $http) {

	$scope.faq = {};

    $.getJSON("/resources/json/faq.json", function(data) {
        $scope.faq.ru = data;
    });

    $.getJSON("/resources/json/faq_en.json", function(data) {
        $scope.faq.en = data;
    });

    $scope.openSection = function($event) {
        $($event.currentTarget).next('.question-answer').slideToggle();
        $($event.currentTarget).parent().toggleClass('is-question-open');
    }

    $scope.faqLang = function(lang) {
    	return lang == 'ru' ? $scope.faq.ru : $scope.faq.en;
    }

}]);