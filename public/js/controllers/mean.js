angular.module('mean.system')
.controller('MeanController', ['socket', 'User', '$scope', '$window', '$timeout', function meanController(socket, User, $scope, $window, $timeout) {
  $scope.hasInvites = false;
  if ($window.localStorage.getItem('user')) {
    $window.user = JSON.parse($window.localStorage.getItem('user'));
    $timeout(() => {
      User.getInvites()
      .then((res) => {
        if (res.success) {
          $scope.invites = res.invites;
          $scope.hasInvites = true;
        }
      });
    }, 200);
  }
  socket.init();
  socket.on('receiveInvite', (data) => {
    $scope.invites = data;
    $scope.hasInvites = true;
  });
  $scope.readInvites = () => {
    User.readInvites();
    $scope.hasInvites = false;
  };
  $scope.acceptInvite = (index) => {
    $scope.invites.splice(index, 1);
  };
}]);
