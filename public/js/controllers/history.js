angular.module('mean.system')
  .controller('HistoryController', function (HistoryService, $scope, game) {
    $scope.start = () => {
      HistoryService.startGame();
      game.startGame();
      angular.element('#modalShow').modal('hide');
    };
  });
