class App {
  constructor() {
    this.board = [];
    this.rows = 25; // 25, 50, 75
    this.columns = 25; // 25, 50, 75
    this.speed = 75; // 300, 150, 75
    this.generation = 0;
    this.count = 0;
    this.running = false;
    this.interval = null;

    /*
    ** Using timeout instead of attached()
    ** due to using Aurelia's basicConfiguration
    **
    ** Unable to get Aurelia's standardConfiguration
    ** running in CodePen
    */
    setTimeout(() => {
      // Just In Case Padding
      setTimeout(() => {
        this.createBoard();
        setTimeout(() => {
          this.generateRandom();
          setTimeout(() => {
            document.getElementById('pause').classList.remove('selected');
            document.getElementById('play').classList.add('selected');
            this.runBoard();
          }, 100);
        }, 100);
      }, 100);
    }, 100);
  }

  createBoard() {
    while (this.board.length) {
      while (this.board[this.board.length - 1].length) {
        this.board[this.board.length - 1].pop();
      }
      this.board.pop();
    }

    for (let y = 0; y < this.rows; y++) {
      this.board.push([]);

      for (let x = 0; x < this.columns; x++) {
        this.board[y].push(0);
      }
    }
  }

  generateRandom() {
    let tableElem = document.getElementById('table').children[0];
    for (let row = 0; row < this.board.length; row++) {
      for (let column = 0; column < this.board[row].length; column++) {
        let rand = Math.random();
        if (rand >= 0.65) {
          tableElem.children[row].children[column].setAttribute('data-alive', 2);
          this.board[row][column] = 1;
          this.count++;
        }
      }
    }
  }

  runBoard() {
    let tableElem = document.getElementById('table').children[0];
    this.running = true;
    this.interval = setInterval(() => {
      if (this.count <= 0) {
        document.getElementById('play').classList.remove('selected');
        document.getElementById('pause').classList.add('selected');
        this.pauseBoard();
      } else
      {
        let nextArr = JSON.parse(JSON.stringify(this.board));
        for (let row = 0; row < this.board.length; row++) {
          for (let column = 0; column < this.board[row].length; column++) {
            let neighbours = 0;

            if (this.board[row][column] === 0) {
              for (let r = row - 1; r <= row + 1; r++) {
                if (neighbours > 3) {break;}
                for (let c = column - 1; c <= column + 1; c++) {
                  if (r === row && c === column) {continue;} else
                  if (r === -1 || c === -1 || r >= this.rows || c >= this.columns) {continue;} else
                  {
                    if (this.board[r][c] !== 0) {
                      neighbours++;
                    }
                  }
                }
              }
              if (neighbours === 3) {
                tableElem.children[row].children[column].setAttribute('data-alive', 1);
                nextArr[row][column] = 1;
                this.count++;
              }
            } else
            {
              for (let r = row - 1; r <= row + 1; r++) {
                if (neighbours > 3) {break;}
                for (let c = column - 1; c <= column + 1; c++) {
                  if (r === row && c === column) {continue;} else
                  if (r === -1 || c === -1 || r >= this.rows || c >= this.columns) {continue;} else
                  {
                    if (this.board[r][c] !== 0) {
                      neighbours++;
                    }
                  }
                }
              }
              if (neighbours < 2 || neighbours > 3) {
                tableElem.children[row].children[column].setAttribute('data-alive', 0);
                nextArr[row][column] = 0;
                this.count--;
              } else
              {
                tableElem.children[row].children[column].setAttribute('data-alive', 2);
              }
            }
          }
        }
        this.generation++;
        this.board = JSON.parse(JSON.stringify(nextArr));
      }
    }, this.speed);
  }

  pauseBoard() {
    this.running = false;
    clearInterval(this.interval);
  }

  resetBoard() {
    let tableElem = document.getElementById('table').children[0];
    for (let row = 0; row < this.board.length; row++) {
      for (let column = 0; column < this.board[row].length; column++) {
        tableElem.children[row].children[column].setAttribute('data-alive', 0);
        this.board[row][column] = 0;
      }
    }
  }

  control(event, choice) {
    event.stopPropagation();
    let parent = event.path[2];
    let elem = event.path[1];

    if (elem.classList.contains('selected')) {return false;} else
    {
      for (let i = 0; i < parent.children.length; i++) {
        parent.children[i].classList.remove('selected');
      }
      switch (choice) {
        case 'play':
          elem.classList.add('selected');
          this.runBoard();
          break;
        case 'pause':
          elem.classList.add('selected');
          this.pauseBoard();
          break;
        case 'clear':
          parent.children[1].classList.add('selected');
          this.pauseBoard();
          this.count = 0;
          this.generation = 0;
          this.resetBoard();
          break;
        case 'random':
          parent.children[1].classList.remove('selected');
          parent.children[0].classList.add('selected');
          this.pauseBoard();
          this.count = 0;
          this.generation = 0;
          this.resetBoard();
          setTimeout(() => {this.generateRandom();}, 100);
          setTimeout(() => {this.runBoard();}, 200);
          break;
        case 'slow':
          elem.classList.add('selected');
          this.pauseBoard();
          this.speed = 300;
          document.getElementById('pause').classList.remove('selected');
          document.getElementById('play').classList.add('selected');
          this.runBoard();
          break;
        case 'mediumspeed':
          elem.classList.add('selected');
          this.pauseBoard();
          this.speed = 150;
          document.getElementById('pause').classList.remove('selected');
          document.getElementById('play').classList.add('selected');
          this.runBoard();
          break;
        case 'fast':
          elem.classList.add('selected');
          this.pauseBoard();
          this.speed = 75;
          document.getElementById('pause').classList.remove('selected');
          document.getElementById('play').classList.add('selected');
          this.runBoard();
          break;
        case 'small':
          elem.classList.add('selected');
          this.pauseBoard();
          this.rows = 25;
          this.columns = 25;
          this.count = 0;
          this.generation = 0;
          this.resetBoard();
          this.createBoard();
          document.getElementById('pause').classList.remove('selected');
          document.getElementById('play').classList.add('selected');
          setTimeout(() => {this.generateRandom();}, 100);
          setTimeout(() => {this.runBoard();}, 200);
          break;
        case 'mediumsize':
          elem.classList.add('selected');
          this.pauseBoard();
          this.rows = 50;
          this.columns = 50;
          this.count = 0;
          this.generation = 0;
          this.resetBoard();
          this.createBoard();
          document.getElementById('pause').classList.remove('selected');
          document.getElementById('play').classList.add('selected');
          setTimeout(() => {this.generateRandom();}, 100);
          setTimeout(() => {this.runBoard();}, 200);
          break;
        case 'large':
          elem.classList.add('selected');
          this.pauseBoard();
          this.rows = 75;
          this.columns = 75;
          this.count = 0;
          this.generation = 0;
          this.resetBoard();
          this.createBoard();
          document.getElementById('pause').classList.remove('selected');
          document.getElementById('play').classList.add('selected');
          setTimeout(() => {this.generateRandom();}, 100);
          setTimeout(() => {this.runBoard();}, 200);
          break;}


      return true;
    }
  }

  selectTile(event) {
    event.stopPropagation();
    if (this.running) {return false;} else
    {
      let alive = event.srcElement.dataset.alive;
      let column = event.srcElement.dataset.column;
      let row = event.srcElement.dataset.row;

      if (alive === '0') {
        event.srcElement.dataset.alive = '2';
        this.board[row][column] = 1;
        this.count++;
      } else
      {
        event.srcElement.dataset.alive = '0';
        this.board[row][column] = 0;
        this.count--;
      }

      return true;
    }
  }}


const app = new App();



/*
** Aurelia Bootstrap Codes
*/

require.config({
  paths: { 'text': 'https://cdnjs.cloudflare.com/ajax/libs/require-text/2.0.12/text.min' } });


require(['aurelia-bootstrapper'], boot => {
  boot.bootstrap(aurelia => {
    aurelia.use.
    basicConfiguration();

    aurelia.start().then(() => {
      aurelia.enhance(app, document.getElementById('wrapper'));
    });
  });
});

/*
** Aurelia Bootstrap Codes
*/