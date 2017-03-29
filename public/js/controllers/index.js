angular.module('mean.system')

.controller('IndexController', ['$scope', 'Global', '$http', '$location',
  'socket', 'game', 'AvatarService', '$window',
  ($scope, Global, $http, $location, socket, game, AvatarService, $window) => {
    $scope.global = Global;
    $scope.errorMsg = '';

    if ($window.localStorage.getItem('token')) {
      $scope.global.authenticated = true;
    } else {
      $scope.global.authenticated = false;
    }

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
          $window.localStorage.setItem('token', response.data.token);
          $location.path('/');
        }
      }, (err) => {
        $scope.errorMsg = err.status.concat(': An error occured!!!');
      });
    };

    $scope.login = () => {
      const user = {
        email: $scope.email,
        password: $scope.password
      };
      $http.post('api/auth/login', user).then((response) => {
        if (!response.data.success) {
          $scope.showError = () => 'invalid';
        } else {
          $window.localStorage.setItem('token', response.data.token);
          $location.path('/');
        }
      }, (err) => {
        $scope.errorMsg = err.status.concat(': An error occured!!!');
      });
    };

    $scope.logout = () => {
      $window.localStorage.removeItem('token');
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
