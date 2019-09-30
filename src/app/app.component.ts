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
  startCoordinates: any;
  activeColor: string;
  colors = ["red", "orange", "blue"];
  queue = [];
  board = [];
  testBoard = [];

  constructor() {
    this.startCoordinates = [0, 0];
    this.board = this.initBoard(this.size);
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    console.log(this.board);
  }

  initBoard(size) {
    let result = [];
    for (let i = 0; i < size; i++) {
      result[i] = [];
      for (let j = 0; j < size; j++) {
        result[i][j] = {
          x: i,
          y: j,
          color: this.randomColor(),
          value: "Empty"
        };
      }
    }
    result[0][0].value = "Start";
    this.activeColor = result[0][0].color;
    return result;
  }

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
