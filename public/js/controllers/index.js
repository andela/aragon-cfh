angular.module('mean.system')

.controller('IndexController', ['$scope', 'Global', '$http', '$location',
  'socket', 'game', 'AvatarService', 'User', '$window',
  ($scope, Global, $http, $location, socket, game, AvatarService, User, $window) => {
    $scope.global = Global;
    $scope.errorMsg = '';
    $scope.User = User;

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
          $window.user = response.data.user;
          window.localStorage.setItem('user', JSON.stringify(window.user));
          $scope.global.update();
          $scope.User.addUser($window.user.email);
          $location.path('/');
        }
      }, (err) => {
        $scope.errorMsg = `An error occured!!! ${err.status}`;
        console.log(err);
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
          $window.user = response.data.user;
          window.localStorage.setItem('user', JSON.stringify(window.user));
          $scope.global.update();
          $scope.User.addUser($window.user.email);
          $location.path('/');
        }
      }, (err) => {
        $scope.errorMsg = `An error occured!!! ${err.status}`;
        console.log(err);
      });
    };

    $scope.logout = () => {
      $http.get('/signout').then((res) => {
        if (res.status === 200) {
          $window.localStorage.removeItem('token');
          $window.localStorage.removeItem('user');
          $scope.User.removeUser();
          $window.user = null;
          $scope.global.update();
          $scope.showOptions = true;
        }
      }, (err) => {
        console.log(err);
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

    $scope.searchUsers = (name) => {
      $scope.User.searchUsers(name)
      .then((results) => {
        $scope.userSearchResults = results;
      }, (err) => {
        console.log(err);
      });
    };

    $scope.avatars = [];
    AvatarService.getAvatars()
      .then((data) => {
        $scope.avatars = data;
      });
  }
]);
