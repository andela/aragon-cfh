angular.module('mean.system')
.factory('socket', ['$rootScope', function appSocket($rootScope) {
  const socket = io.connect();
  return {
    on: (eventName, callback) => {
      socket.on(eventName, (...args) => {
        // const args = arguments;
        $rootScope.safeApply(() => {
          callback.apply(socket, args);
        });
      });
    },
    emit: (eventName, data, callback) => {
      socket.emit(eventName, data, (...args) => {
        // const args = arguments;
        $rootScope.safeApply(() => {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });
    },
    removeAllListeners: (eventName, callback) => {
      socket.removeAllListeners(eventName, (...args) => {
        // const args = arguments;
        $rootScope.safeApply(() => {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });
    }
  };
}]);
