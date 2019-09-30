import { Component, OnInit } from "@angular/core";
import { Cell } from "./models/Cell";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit {
  title: string = "color-game";
  boardSize: number = 6;
  currentColor: string;
  colors = [];
  board = [];
  clicks: number = 0;
  solved = false;

  constructor() {
    this.getColors();
    this.generateGameBoard();
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    console.log(this.board);
  }

  getColors() {
    this.colors = [
      {
        rgb: "rgb(255, 50, 50)" //red
      },
      {
        rgb: "rgb(24, 187, 255)" //blue
      },
      {
        rgb: "rgb(255, 224, 17)" //yellow
      },
      {
        rgb: "rgb(51, 153, 68)" //green
      }
    ];
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
}
