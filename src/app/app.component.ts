import { Component, OnInit } from "@angular/core";
import { Cell } from "./models/Cell";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit {
  title: string = "color-game";
  size: number = 5;
  boardSize: number = 6;
  startCoordinates: any;
  activeColor: string;
  currentColor: string;
  colors = [
    {
      rgb: "rgb(255, 50, 50)", //red
      symbol: "❤️"
    },
    {
      rgb: "rgb(24, 187, 255)", //blue
      symbol: "🔷"
    },
    {
      rgb: "rgb(255, 224, 17)", //yellow
      symbol: "⭐️"
    },
    {
      rgb: "rgb(51, 153, 68)", //green
      symbol: "🍀"
    }
  ];
  queue = [];
  board = [];
  clicks: number = 0;
  testBoard = [];
  solved = false;

  constructor() {
    this.startCoordinates = [0, 0];
    this.generateGameBoard();
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    console.log(this.board);
  }

  generateGameBoard() {
    const x = this.boardSize;
    const board = [];
    let key = 1;
    for (let i = 0; i < x * x; i++) {
      const randomColor = Math.floor(Math.random() * this.colors.length);
      board.push({
        color: this.colors[randomColor],
        key: key,
        absorbed: false
      });
      key++;
    }

    this.board = board;
    this.currentColor = board[0].color.rgb;
    this.clicks = 0;

    console.log(this.board);
  }

  getTheAbsorbed = () => {
    const size = this.boardSize;
    let currentPool = [];
    const roundup = () => {
      this.board.forEach((tile, i) => {
        if (
          ((tile.color.rgb == this.currentColor &&
            ((i % size != 0 && currentPool.includes(this.board[i - 1])) ||
              ((i + 1) % size != 0 &&
                currentPool.includes(this.board[i + 1])) ||
              (this.board[i + size] &&
                currentPool.includes(this.board[i + size])) ||
              (this.board[i - size] &&
                currentPool.includes(this.board[i - size])))) ||
            i === 0) &&
          !currentPool.includes(tile)
        ) {
          currentPool.push(tile);
          roundup();
        }
      });
    };
    roundup();
    return currentPool;
  };

  handleClick = e => {
    const clicked = e ? e.target.style.backgroundColor : this.currentColor;
    console.log(clicked);

    const size = this.boardSize;
    if (clicked != this.currentColor || !e) {
      const prevPool = this.getTheAbsorbed();
      const currentPool = this.propagate(e, prevPool);

      const newBoard = this.board.map((tile, i) => {
        if (currentPool.includes(tile)) {
          return {
            color: { rgb: clicked, symbol: this.returnSymbol(clicked) },
            key: tile.key,
            absorbed: true
          };
        } else {
          return tile;
        }
      });
      this.board = newBoard;
      this.currentColor = clicked;
      this.clicks = e ? this.clicks + 1 : this.clicks;

      this.endgameCheck();
    } else {
      console.log("The corner is already the clicked color. Choose another.");
    }
  };

  setGameBoardStyle() {
    return {
      "grid-template-columns": `repeat(${this.boardSize}, 1fr)`,
      "grid-template-rows": `repeat(${this.boardSize}, 1fr)`
    };
  }
  endgameCheck() {
    const size = this.boardSize;
    setTimeout(() => {
      const absorbed = this.board.filter(tile => {
        if (tile.color.rgb == this.currentColor) {
          return tile.color.rgb;
        } else {
          return;
        }
      });
      if (absorbed.length === size * size) {
        alert(
          `You won a ${size}x${size} board in ${this.clicks} clicks! (Hint: refresh to start a new game, or change the "size" constant at the top of the JS window to a different number!)`
        );
      }
    }, 200);
  }

  returnSymbol = match => {
    let symbol;
    this.colors.filter(color => {
      color.rgb == match ? (symbol = color.symbol) : null;
    });
    return symbol;
  };

  propagate = (e, arr) => {
    const size = this.boardSize;
    const color = e ? e.target.style.backgroundColor : this.currentColor;
    const roundup = () => {
      this.board.forEach((tile, i) => {
        if (
          ((tile.color.rgb == color &&
            ((i % size != 0 && arr.includes(this.board[i - 1])) ||
              ((i + 1) % size != 0 && arr.includes(this.board[i + 1])) ||
              (this.board[i + size] && arr.includes(this.board[i + size])) ||
              (this.board[i - size] && arr.includes(this.board[i - size])))) ||
            i === 0) &&
          !arr.includes(tile)
        ) {
          arr.push(tile);
          roundup();
        }
      });
    };
    roundup();
    return arr;
  };

  randomColor() {
    return this.colors[Math.floor(Math.random() * this.colors.length)];
  }

  onClickHandler(cell) {
    console.log(cell);
    this.board[0][0].color = cell.color;
    this.queue.map(e => {
      this.board[e.cell.x][e.cell.y].color = cell.color;
    });
    this.board[cell.x][cell.y].value = "Goal";
    this.activeColor = this.board[cell.x][cell.y].color;
    let path = this.findShortestPath(cell);

    setTimeout(() => {
      this.board[cell.x][cell.y].value = "Empty";
    }, 200);

    console.log("Queue", this.queue);
    console.log("Path", path);
  }

  findShortestPath(cell) {
    let distanceFromTop = this.startCoordinates[0];
    let distanceFromLeft = this.startCoordinates[1];
    let location = {
      distanceFromTop: distanceFromTop,
      distanceFromLeft: distanceFromLeft,
      path: [],
      status: "Start"
    };

    let queue = [location];

    // Loop through the grid searching for the goal
    while (queue.length > 0) {
      // Take the first location off the queue
      let currentLocation = queue.shift();

      // Explore North
      let newLocation = this.exploreInDirection(currentLocation, "North", cell);

      if (newLocation.status === "Goal") {
        return newLocation.path;
      } else if (newLocation.status === "Valid") {
        queue.push(newLocation);
      }

      // Explore East
      newLocation = this.exploreInDirection(currentLocation, "East", cell);

      if (newLocation.status === "Goal") {
        this.queue.push(newLocation);
        return newLocation.path;
      } else if (newLocation.status === "Valid") {
        this.queue.push(newLocation);
        queue.push(newLocation);
      }

      // Explore South
      newLocation = this.exploreInDirection(currentLocation, "South", cell);
      if (newLocation.status === "Goal") {
        this.queue.push(newLocation);
        return newLocation.path;
      } else if (newLocation.status === "Valid") {
        this.queue.push(newLocation);
        queue.push(newLocation);
      }

      // Explore West
      newLocation = this.exploreInDirection(currentLocation, "West", cell);
      if (newLocation.status === "Goal") {
        this.queue.push(newLocation);
        return newLocation.path;
      } else if (newLocation.status === "Valid") {
        this.queue.push(newLocation);
        queue.push(newLocation);
      }
    }

    console.log("Queue:", queue);
    // No valid path found
    return false;
  }

  exploreInDirection(currentLocation, direction, cell) {
    var newPath = currentLocation.path.slice();
    newPath.push(direction);

    var dft = currentLocation.distanceFromTop;
    var dfl = currentLocation.distanceFromLeft;

    if (direction === "North") {
      dft -= 1;
    } else if (direction === "East") {
      dfl += 1;
    } else if (direction === "South") {
      dft += 1;
    } else if (direction === "West") {
      dfl -= 1;
    }

    var newLocation = {
      distanceFromTop: dft,
      distanceFromLeft: dfl,
      path: newPath,
      cell: cell,
      status: "Unknown"
    };
    newLocation.status = this.locationStatus(newLocation);

    // If this new location is valid, mark it as 'Visited'
    if (newLocation.status === "Valid") {
      this.board[newLocation.distanceFromTop][
        newLocation.distanceFromLeft
      ].value = "Visited";
      this.board[newLocation.distanceFromTop][
        newLocation.distanceFromLeft
      ].color = this.activeColor;
    }

    return newLocation;
  }

  // This function will check a location's status
  // (a location is "valid" if it is on the grid, is not an "obstacle",
  // and has not yet been visited by our algorithm)
  // Returns "Valid", "Invalid", "Blocked", or "Goal"
  locationStatus = function(location) {
    var gridSize = this.board.length;
    var dft = location.distanceFromTop;
    var dfl = location.distanceFromLeft;

    if (
      location.distanceFromLeft < 0 ||
      location.distanceFromLeft >= gridSize ||
      location.distanceFromTop < 0 ||
      location.distanceFromTop >= gridSize
    ) {
      // location is not on the grid--return false
      return "Invalid";
    } else if (this.board[dft][dfl].value === "Goal") {
      return "Goal";
    } else if (this.board[dft][dfl].color === this.activeColor) {
      // location is either an obstacle or has been visited
      return "Valid";
    } else if (this.board[dft][dfl].value !== "Empty") {
      // location is either an obstacle or has been visited
      return "Blocked";
    } else {
      return "Valid";
    }
  };
}
