angular.module('minesweeper', ['TableCreate','ui.grid'])

.controller('initializeGame', ['$scope', 'ModelCreate', function initializeGame($scope, ModelCreate){
  
  function GameModel(gridSize, numBombs){
    this.gridModel = new ModelCreate.GridModel(gridSize, numBombs);
    this.secondsElapsed = 0;
    this.timerId;
    this.flagCounter = numBombs;
    this.gameStatus = 'notStarted'// won/lost/playing/notStarted
  }

  GameModel.prototype = {
    incrementTimer: function incrementTimer(){
      this.secondsElapsed++;
    },
    startGame: function startGame(){ // First exposed space after init starts the game
      this.gridModel.gameInit();
      this.timerId = setInterval(this.incrementTimer.bind(this), 1000)
      this.gameStatus = 'playing';
    },
    endGame: function endGame(){
      clearInterval(this.timerId);
    },
    exposeSpace: function exposeSpace(row, col){
      if(this.gridModel.grid[row][col].isBomb){
        this.gridModel.grid[row][col].exposeSpace()
        this.gameStatus = 'lost';
        this.endGame();
      } else{
        this.gridModel.exposeZeroAdjacent(row, col)
      }

      if(this.gridModel.winCheck()){ //all bombs flagged & all non bombs are exposed
        this.gameStatus = 'won';
        this.endGame();
      }
      console.log(this.gameStatus)
      if(this.gameStatus === 'won' || this.gameStatus === 'lost') alert(this.gameStatus);
      console.log(this.secondsElapsed)
      console.table(this.gridModel.renderGrid())  // for rendering a tabular grid in Chrome console
    },
    flagSpace: function flagSpace(row, col){
      this.flagCounter--;
      this.gridModel.grid[row][col].flagSpace();
      console.log(this.gameStatus)
      console.log(this.secondsElapsed)
      console.table(this.gridModel.renderGrid())  // for rendering a tabular grid in Chrome console
    },
  };

  var testGame;

  $scope.startGame = function(){
    if($scope.size === undefined){
      $scope.size = 10;
    }
    if($scope.bomb === undefined){
      $scope.bomb = 10;
    }
    testGame = new GameModel($scope.size, $scope.bomb)
    testGame.startGame();
    $scope.myData = gridData();
    console.table(testGame.gridModel.renderGrid());
  }

  gridData = function (){
    var grid =[];
    var originalGrid = testGame.gridModel.renderGrid();
    var counter = 1;
    originalGrid.forEach(function(array){
      var gridObject = {}
      gridObject[0] = counter+')';
      counter++;
      for(var i = 0; i < array.length; i++){
        gridObject[i+1+')'] = array[i];
      }
      grid.push(gridObject);
    });
    return grid;
  }
  
  $scope.exposeSpace = function(){
    testGame.exposeSpace($scope.row-1,$scope.col-1);
    $scope.myData = gridData();
  }
  $scope.flagSpace = function(){
    testGame.flagSpace($scope.row2-1,$scope.col2-1);
    $scope.myData = gridData();
  }

}]);