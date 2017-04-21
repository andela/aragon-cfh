angular.module('mean.system')
.controller('ReportController', ['$scope', '$http', function ($scope, $http) {
$scope.getGameLogs = () => {
    const userName = window.user.name;
    $http.get('/api/games/history', { params: { name: userName } })
        .success((response) => {
          const userGameLog = response.filter((gameResult) => {
            if (gameResult.players.indexOf(window.user.name) !== -1) {
              return gameResult;
            }
          });
          $scope.logs = userGameLog;
        }, err => console.log(err));
  };

  $scope.getLeaderBoard = () => {
    const userName = window.user.name;
    $http.get('/api/games/leaderboard', { params: { name: userName } })
        .success((response) => {
          $scope.boards = response;
        }, err => console.log(err));
  };

  $scope.getdonations = () => {
    const userName = window.user.name;
    $http.get('/api/games/donations', { params: { name: userName } })
        .success((response) => {
          $scope.test = response[0].name;
          $scope.amount = response[0].donations.length;
          $scope.donations = response;
        }, err => console.log(err));
  };
  $scope.getGameLogs();
  $scope.getLeaderBoard();
  $scope.getdonations();
}]);
