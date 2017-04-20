angular.module('mean.system')
.controller('TourController', ['$scope', '$timeout', '$location', '$http', function tourCtrl($scope, $timeout, $location, $http) {
  $scope.showStartGame = true;
  $scope.question = 'What am I giving up for Lent?';
  $scope.showQuestion = false;
  $scope.showInfo = true;
  $scope.isCzar = false;
  $scope.showCards = false;
  $scope.showAnswers = false;
  $scope.timeLeft = 0;
  $scope.gameEnded = false;
  $scope.gameWon = false;

  $scope.endTour = () => {
    $('#tour').remove();
    $('#game-loading').css({ display: 'block' });
    if (window.user) {
      $http.post('/api/disabletour', {
        _id: window.user._id
      }).then((res) => {
        if (res.status === 200) {
          window.user.hideTour = true;
          $scope.$parent.goToGame().then(() => {
            $('#game-loading').remove();
            $scope.$parent.locateRegion();
          });
        }
      }, (err) => {
        console.log(err);
      });
    } else {
      $scope.$parent.hideTour = true;
      $scope.$parent.goToGame().then(() => {
        $('#game-loading').remove();
        $scope.$parent.locateRegion();
      });
    }
  };

  $scope.tour = new Tour({
    name: 'gameTour',
    backdrop: true,
    delay: 300,
    onEnd: () => {
      $scope.endTour();
    },
    template: `<div class='popover tour center-block'>
      <div class='arrow'></div>
      <h3 id='finding-players' class='popover-title'></h3>
      <div class='popover-content'></div>
      <div id='tour-btn'>
        <button class='btn btn-default' data-role='prev'>« Prev</button>
        <button class='btn btn-default' data-role='next'>Next »</button>
        <button class='btn btn-default' data-role='end'>End tour</button>
      </div>
    </div>`,
    steps: [
      {
        orphan: true,
        title: 'Welcome to Cards for Humanity!',
        content: 'We put together a little tour to introduce you to the game.'
      },
      {
        placement: 'bottom',
        element: '#social-bar-container',
        content: "Here is the list of players in the game. If you're the Card Czar (more on that later) you'll have a 'CZAR' label under your name.",
        onNext: () => {
          $scope.showStartGame = false;
          $scope.showQuestion = true;
          $scope.isCzar = true;
          $scope.showInfo = false;
        }
      },
      {
        onPrev: () => {
          $scope.showStartGame = true;
          $scope.showQuestion = false;
          $scope.isCzar = false;
          $scope.showInfo = true;
        },
        placement: 'bottom',
        element: '#question-container-outer',
        content: 'When the game starts, a Card Czar will be picked by the app. The Card Czar plays a black card (which has a question or statement with blanks on it) that appears here.',
        onNext: () => {
          $scope.showCards = true;
          $scope.isCzar = false;
        }
      },
      {
        onPrev: () => {
          $scope.showCards = false;
          $scope.showAnswers = false;
          $scope.isCzar = true;
          $('#answers').css({ background: '#f9f9f9' });
          $timeout.cancel($scope.selectCard);
          $timeout.cancel($scope.showAnswerPanel);
          $timeout.cancel($scope.pickCards);
          $scope.answers = [];
        },
        orphan: true,
        element: '#white-card-container',
        content: 'The other players have a hand of white cards displayed, from which they can pick the one they feel best answers or completes the statement on the black card.',
        onShown: () => {
          $scope.answerIndex = 0;
          const onPickCards = () => {
            if ($scope.answerIndex < $scope.answerStore.length) {
              $scope.answers.push($scope.answerStore[$scope.answerIndex]);
              $scope.answerIndex += 1;
              $scope.pickCards = $timeout(onPickCards, 1000);
            }
          };
          $scope.selectCard = $timeout(() => {
            $('#answers').css({ background: 'grey' });
          }, 500)
          .then(
            $scope.showAnswerPanel = $timeout(() => {
              $scope.showCards = false;
              $scope.showAnswers = true;
            }, 1000)
            .then(
              $scope.pickCards = $timeout(onPickCards, 500)
            )
          );
        },
        onNext: () => {
          $('#answers').css({ background: '#f9f9f9' });
          $timeout.cancel($scope.selectCard);
          $timeout.cancel($scope.showAnswerPanel);
          $timeout.cancel($scope.pickCards);
          $scope.showCards = false;
          $scope.showAnswers = true;
          $scope.answers = $scope.answerStore;
        }
      },
      {
        onPrev: () => {
          $scope.timeLeft = 0;
          $timeout.cancel($scope.tourCountDown);
          $scope.answers = [];
          $scope.showCards = true;
          $scope.showAnswers = false;
        },
        element: '#inner-timer-container',
        content: 'Cards for Humanity is pretty fast-paced. This timer will show the seconds you have left to perform game actions like picking a card.',
        onShown: () => {
          $scope.timeLeft = 20;
          const onCountDown = () => {
            if ($scope.timeLeft > 0) {
              $scope.timeLeft -= 1;
              $scope.countDown = $timeout(onCountDown, 1000);
            }
          };
          $scope.countDown = $timeout(onCountDown, 1000);
        },
        onNext: () => {
          $scope.timeLeft = 0;
          $timeout.cancel($scope.countDown);
          $scope.showCards = false;
          $scope.isCzar = true;
        }
      },
      {
        onPrev: () => {
          $scope.isCzar = false;
        },
        element: '#tour-answers-container',
        content: 'The Card Czar picks the answer they like the most from the cards the other players have played.',
        onNext: () => {
          $scope.showAnswers = false;
          $scope.players[1].score = 1;
          $scope.players[1].czar = true;
          $scope.players[0].czar = false;
          $scope.question = 'What does Dick Cheney prefer?';
        }
      },
      {
        onPrev: () => {
          $scope.showAnswers = true;
          $scope.players[1].score = 0;
          $scope.players[1].czar = false;
          $scope.players[0].czar = true;
          $scope.question = 'What does Dick Cheney prefer?';
        },
        placement: 'bottom',
        element: '#player-1',
        content: 'The person who played the winning card gains a point, and a new round with a new Czar begins.'
      },
      {
        placement: 'bottom',
        element: '#abandon-game-button',
        content: 'At any time you can choose to leave the game by clicking this button, which will take you back to the lobby.',
        onNext: () => {
          $scope.showQuestion = false;
          $scope.gameEnded = true;
          $scope.isCzar = false;
        }
      },
      {
        onPrev: () => {
          $scope.isCzar = true;
          $scope.showQuestion = true;
          $scope.gameEnded = false;
        },
        placement: 'bottom',
        element: '#question-container-outer',
        content: 'But if too many people leave the game (and there are only two players left) the game will end.',
        onNext: () => {
          $scope.gameEnded = false;
          $scope.gameWon = true;
          $scope.players[0].score = 3;
          $scope.players[1].score = 2;
          $scope.players[2].score = 5;
        }
      },
      {
        onPrev: () => {
          $scope.gameEnded = true;
          $scope.gameWon = false;
          $scope.players[0].score = 0;
          $scope.players[1].score = 1;
          $scope.players[2].score = 0;
        },
        placement: 'bottom',
        element: '#player-2',
        content: 'Otherwise the first player to gain 5 points wins, and the game ends.'
      },
      {
        element: '#game-end-container',
        content: 'You can join a new game, or return to the lobby. Please consider making a donation to charity!'
      },
      {
        orphan: true,
        title: "That's it!",
        content: 'Have fun with the game!'
      }
    ]
  });
  if (!$scope.$parent.hideTour) {
    $scope.tour.init();
    $scope.tour.start(true);
    $scope.tour.goTo(0);
  }

  $scope.cards = [
    {
      text: 'Justin Bieber.'
    },
    {
      text: 'Women in yogurt commercials.'
    },
    {
      text: 'Shutting the fuck up.'
    },
    {
      text: 'Keanu Reeves.'
    },
    {
      text: 'All of this blood.'
    },
    {
      text: 'Passive-aggressive Post-it notes.'
    },
    {
      text: 'Edible underpants.'
    },
    {
      text: 'Genetically engineered super-soldiers'
    },
    {
      text: 'Waterboarding.'
    },
    {
      text: 'A vagina that leads to another dimension.'
    }
  ];

  $scope.answerStore = [
    {
      text: 'Justin Bieber.'
    },
    {
      text: 'Feeding Christians to the lions.'
    }
  ];

  $scope.answers = [];

  $scope.players = [
    {
      avatar: '../img/chosen/E01.png',
      name: 'Disco Potato',
      score: 0,
      color: 0,
      czar: true
    },
    {
      avatar: '../img/chosen/F01.png',
      name: 'Silver Blister',
      score: 0,
      color: 1,
      czar: false
    },
    {
      avatar: '../img/chosen/FA04.png',
      name: 'Insulated Mustard',
      score: 0,
      color: 2,
      czar: false
    }
  ];
}]);
