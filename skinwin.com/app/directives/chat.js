angular.module('SkinWin.chatDirective', [])

.directive('chatDirective', function() {
  return {
  	controller: function($scope, $rootScope) {
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
  	},
  	restrict: 'A',
  	scope: true,
    templateUrl: '/app/views/chat.html',
  };
});