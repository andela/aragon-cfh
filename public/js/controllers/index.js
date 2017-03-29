angular.module('mean.system')

.controller('IndexController', ['$scope', 'Global', '$http', '$location',
  'socket', 'game', 'AvatarService', '$window',
  ($scope, Global, $http, $location, socket, game, AvatarService, $window) => {
    $scope.global = Global;
    $scope.errorMsg = '';

    $scope.signup = () => {
      const newUser = {
        name: $scope.fullname,
        email: $scope.email,
        password: $scope.password
      };
      $http.post('api/auth/signup', newUser).then((response) => {
        if (!response.data.success) {
          $scope.errorMsg = response.data.message;
        } else {
          $window.location = '/';
        }
      }, (err) => {
        $scope.errorMsg = err.status.concat(': An error occured!!!');
      });
    };

    $scope.login = () => {
      const newUser = {
        email: $scope.email,
        password: $scope.password
      };
      $http.post('api/auth/login', newUser).then((response) => {
        if (!response.data.success) {
          $scope.showError = () => 'invalid';
        } else {
          $window.location = '/';
        }
      }, (err) => {
        $scope.errorMsg = err.status.concat(': An error occured!!!');
      });
    };

    $scope.playAsGuest = () => {
      game.joinGame();
      $location.path('/app');
    };

    $scope.showError = () => {
      if ($location.search().error) {
        return $location.search().error;
      }
      return false;
    };

    $scope.avatars = [];
    AvatarService.getAvatars()
      .then((data) => {
        $scope.avatars = data;
      });
  }
]);
