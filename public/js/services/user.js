angular.module('mean.system')
  .factory('User', ['socket', '$http', '$window', function userService(socket, $http, $window) {
    const User = {
      addUser: (email) => {
        socket.emit('login', { email });
      },
      removeUser: () => {
        socket.emit('logout');
      },
      searchUsers: name => (
        new Promise((resolve, reject) => {
          $http.get(`/api/search/users?name=${name}`)
          .then((res) => {
            if (res.status === 200) {
              const results = res.data;
              const emails = results.map(user => (user.email));
              socket.emit('getStatuses', emails, (statuses) => {
                results.forEach((user) => {
                  user.status = statuses[user.email];
                });
                resolve(res.data);
              });
            }
          }, (err) => {
            reject(err);
          });
        })
      ),
      addFriend: (email, name) => {
        console.log(name, email);
        $http.post('/api/user/addfriend', {
          userId: $window.user._id,
          friendEmail: email,
          friendName: name
        }).then((res) => {
          if (res.status === 201) {
            window.user = res.data;
            window.localStorage.setItem('user', JSON.stringify(window.user));
            console.log('Friend Added');
          } else if (res.status === 204) {
            console.log('Friend Already Exists');
          }
        }, (err) => {
          console.log(err);
        });
      },
      removeFriend: (email) => {
        console.log(email);
        $http.post('/api/user/removefriend', {
          userId: $window.user._id,
          friendEmail: email
        }).then((res) => {
          if (res.status === 201) {
            window.user = res.data;
            window.localStorage.setItem('user', JSON.stringify(window.user));
            console.log('Friend removed');
          } else if (res.status === 204) {
            console.log('Friend does not exist');
          }
        }, (err) => {
          console.log(err);
        });
      },
      hasFriends: () => (!(!$window.user.friends || $.isEmptyObject($window.user.friends))),
      getFriends: () => {
        if ($window.user.friends) {
          const friends = {};
          Object.keys($window.user.friends).forEach((email) => {
            friends[email.replace(/\\u002e/g, '.')] = $window.user.friends[email];
          });
          return $.extend({}, friends);
        }
        return {};
      },
      isFriend: (email) => {
        let status;
        if (User.getFriends()) {
          if (User.getFriends()[email]) {
            status = true;
          } else {
            status = false;
          }
        } else {
          status = false;
        }
        return status;
      },
      getUserStatus: email => (
        new Promise((resolve) => {
          console.log('Function called');
          socket.emit('getStatus', { email }, (status) => {
            console.log(status);
            resolve(status);
          });
        })
      ),
      appInvite: inviteData => (
        new Promise((resolve) => {
          socket.emit('sendInvite', inviteData, (res) => {
            resolve(res.success);
          });
        })
      ),
      emailInvite: messageData => (
        new Promise((resolve, reject) => {
          $http.post('/api/invite/email', messageData)
          .then((res) => {
            if (res.data.success) {
              resolve(res.data.message);
            } else {
              reject(res.data.message);
            }
          }, (err) => {
            console.log(err);
            reject(`Error sending email to ${messageData.inviteeName}`);
          });
        })
      ),
      getInvites: () => (
        new Promise((resolve) => {
          socket.emit('getInvites', { email: $window.user.email }, (res) => {
            resolve(res);
          });
        })
      ),
      readInvites: () => {
        socket.emit('readInvites', { email: $window.user.email });
      },
      isValidEmail: email => (
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)
      )
    };

    return User;
  }]);
