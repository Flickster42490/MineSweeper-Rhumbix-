angular.module('TableCreate',[])

.factory('ModelCreate', function(){
  
    function SpaceModel (row, col){
      this.isBomb = false;
      this.isExposed = false;
      this.isFlagged = false;
      this.numAdjacent = 0; // 0-8
      this.coordinates = {row: row, col: col};
      this.clearMine = function clearMine(){
        this.isBomb = false;
      };
      this.placeMine = function placeMine(){
        this.isBomb = true;
      };
      this.exposeSpace = function exposeSpace(){
        this.isExposed = true;
      };
      this.hideSpace = function hideSpace(){
        this.isExposed = false;
      };
      this.flagSpace = function flagSpace(){
        this.isFlagged = true;
      };
      this.unflagSpace = function unflagSpace(){
        this.isFlagged = false;
      };
      this.setNumAdjacent = function setNumAdjacent(num){
        this.numAdjacent = num;
      };
    };

    return {

    GridModel: function (gridSize, numBombs){
      this.grid = [
        // [{}, {}, {}],
        // [{}, {}, {}],
        // [{}, {}, {}],
      ];
      // create an array of all grid positions for random mine placement
      this.coordinates = [
        // {row: , col: }
        // {row: , col: }...
      ];
      this.gridSize = gridSize;
      this.numBombs = numBombs;

      this.renderGrid = function renderGrid(){  // Output grid for debugging
        return this.grid.map(function convertRows(rows){
          return rows.map(function convertSpaces(spaceModel){
            if(spaceModel.isExposed){
              if(spaceModel.isBomb){
                return '****';
              } else{
                return spaceModel.numAdjacent;
              }
            } else if(spaceModel.isFlagged) {
              return '!!!!'
            } else{
              return '#'
            }
          })
        })
      };
      this.exposeAll = function exposeAll(){  // for debugging
        this.traverseGrid(function renderSpace (spaceModel){
          spaceModel.exposeSpace();
        })
      };
      this.hideAll = function hideAll(){  // for debugging
        this.traverseGrid(function renderSpace (spaceModel){
          spaceModel.hideSpace();
        })
      };
      this.createGrid = function createGrid(gridSize){
        if(isNaN(gridSize)){
          gridSize = this.gridSize;
        }
        for(var row = 0; row < gridSize; row++){
          this.grid.push([])
          for(var col = 0; col < gridSize; col++){
            var spaceModel = new SpaceModel(row, col)
            this.grid[row][col] = spaceModel;
            this.coordinates.push({row: row, col: col});
          }
        }
      };
      this.createGrid(this.gridSize);

      this.gameInit = function gameInit(){
        this.clearAllMines();
        this.clearAllFlags();
        this.placeAllMines(this.numBombs);
        this.setNumAdjacentAll();
        this.hideAllSpaces();
      };
      this.traverseGrid = function traverseGrid(callback){
        this.grid.forEach(function traverseRows(row){
          row.forEach(function traverseCols(spaceModel){
            callback(spaceModel);
          })
        })
      };
      this.clearAllMines = function clearAllMines(){
        this.traverseGrid(function(spaceModel){
          spaceModel.clearMine();
        });
      };
      this.placeAllMines = function placeAllMines(numBombs){
        // perform a fisher-yates shuffle on all the grid positions to randomly assign mines
        (function fyShuffle(array){
          var unshuffledNum = array.length;
          var tempValue;
          var i;

          while(unshuffledNum) {
            i = Math.floor(Math.random() * unshuffledNum--);
            tempValue = array[unshuffledNum];
            array[unshuffledNum] = array[i];
            array[i] = tempValue;
          }
        })(this.coordinates)
        // select first numBombs worth of bombs to place at random unique coordinates
        for(var i = 0; i < numBombs; i++){
          var row = this.coordinates[i].row;
          var col = this.coordinates[i].col;
          this.grid[row][col].placeMine();
        }
      };
      this.clearAllFlags = function clearAllFlags(){
        this.traverseGrid(function hideSpace(spaceModel){
          spaceModel.unflagSpace();
        })
      };
      this.hideAllSpaces = function hideAllSpaces(){
        this.traverseGrid(function hideSpace(spaceModel){
          spaceModel.hideSpace();
        })
      };
      this.isInGrid = function isInGrid(row, col){
        if(row >= 0 && row < this.gridSize &&
           col >= 0 && col < this.gridSize){
          return true;
        }
        return false;
      };
      this.adjacentSpaces = function adjacentSpaces(row, col){
        return {
          upLeft: {
            row: row - 1,
            col: col - 1,
          },
          up: {
            row: row - 1,
            col: col,
          },
          upRight: {
            row: row - 1,
            col: col + 1,
          },
          right: {
            row: row,
            col: col + 1,
          },
          downRight: {
            row: row + 1,
            col: col + 1,
          },
          down: {
            row: row + 1,
            col: col,
          },
          downLeft: {
            row: row + 1,
            col: col - 1,
          },
          left: {
            row: row,
            col: col - 1,
          },
        }
      };
      this.setNumAdjacentAll = function setNumAdjacentAll(){
        // for every space check every surrounding space for bombs and increment count
        var gridContext = this;
        this.traverseGrid(function(spaceModel){
          var numAdjacent = 0;
          var row = spaceModel.coordinates.row
          var col = spaceModel.coordinates.col

          var adjacentSpacesObj = gridContext.adjacentSpaces(row, col)
          Object.keys(adjacentSpacesObj).forEach(function countAdjacentMines(adjacentSpaceKey){
            var row = adjacentSpacesObj[adjacentSpaceKey].row;
            var col = adjacentSpacesObj[adjacentSpaceKey].col;

            if(gridContext.isInGrid.call(gridContext, row, col)){
              if(gridContext.grid[row][col].isBomb){
                numAdjacent++;
              }
            }
          })
          spaceModel.setNumAdjacent(numAdjacent);
        })
      };
      this.exposeZeroAdjacent = function exposeZeroAdjacent(row, col){
        var gridContext = this;
        var spacesVisitedArr = [];
        (function recurse(row, col){
          var adjacentSpacesObj = gridContext.adjacentSpaces(row, col);
          var currentSpaceModel = gridContext.grid[row][col];
          currentSpaceModel.isExposed = true;
          spacesVisitedArr.push(row + '-' + col);
          if(currentSpaceModel.numAdjacent > 0){
            return;
          }
          Object.keys(adjacentSpacesObj).forEach(function exposeAdjacent(adjacentSpaceKey){
            var row = adjacentSpacesObj[adjacentSpaceKey].row;
            var col = adjacentSpacesObj[adjacentSpaceKey].col;

            if(gridContext.isInGrid.call(gridContext, row, col)){
              if(spacesVisitedArr.indexOf(row + '-' + col) === -1)
              recurse(row, col);
            }
          })
        })(row, col)
      };
      this.winCheck = function winCheck(){ //all bombs flagged & all non bombs are exposed
        var won = true;
        this.traverseGrid(function checkSpace(spaceModel){
          if(spaceModel.isBomb){
            if(!spaceModel.isFlagged){
              won = false;
            }
          } else {  // non bombs
            if(!spaceModel.isExposed){
              won = false;
            }
          }
        })
        return won;
      };
    }
  }
});