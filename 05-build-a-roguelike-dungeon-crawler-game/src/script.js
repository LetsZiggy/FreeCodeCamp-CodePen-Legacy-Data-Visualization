let playerLightTiles = [
                       [ 6,3],[ 6,2],[ 6,1],[ 6,0],[ 6,-1],[ 6,-2],[ 6,-3],
                [ 5,4],[ 5,3],[ 5,2],[ 5,1],[ 5,0],[ 5,-1],[ 5,-2],[ 5,-3],[ 5,-4],
         [ 4,5],[ 4,4],[ 4,3],[ 4,2],[ 4,1],[ 4,0],[ 4,-1],[ 4,-2],[ 4,-3],[ 4,-4],[ 4,-5],
  [ 3,6],[ 3,5],[ 3,4],[ 3,3],[ 3,2],[ 3,1],[ 3,0],[ 3,-1],[ 3,-2],[ 3,-3],[ 3,-4],[ 3,-5],[ 3,-6],
  [ 2,6],[ 2,5],[ 2,4],[ 2,3],[ 2,2],[ 2,1],[ 2,0],[ 2,-1],[ 2,-2],[ 2,-3],[ 2,-4],[ 2,-5],[ 2,-6],
  [ 1,6],[ 1,5],[ 1,4],[ 1,3],[ 1,2],[ 1,1],[ 1,0],[ 1,-1],[ 1,-2],[ 1,-3],[ 1,-4],[ 1,-5],[ 1,-6],
  [ 0,6],[ 0,5],[ 0,4],[ 0,3],[ 0,2],[ 0,1],[ 0,0],[ 0,-1],[ 0,-2],[ 0,-3],[ 0,-4],[ 0,-5],[ 0,-6],
  [-1,6],[-1,5],[-1,4],[-1,3],[-1,2],[-1,1],[-1,0],[-1,-1],[-1,-2],[-1,-3],[-1,-4],[-1,-5],[-1,-6],
  [-2,6],[-2,5],[-2,4],[-2,3],[-2,2],[-2,1],[-2,0],[-2,-1],[-2,-2],[-2,-3],[-2,-4],[-2,-5],[-2,-6],
  [-3,6],[-3,5],[-3,4],[-3,3],[-3,2],[-3,1],[-3,0],[-3,-1],[-3,-2],[-3,-3],[-3,-4],[-3,-5],[-3,-6],
         [-4,5],[-4,4],[-4,3],[-4,2],[-4,1],[-4,0],[-4,-1],[-4,-2],[-4,-3],[-4,-4],[-4,-5],
                [-5,4],[-5,3],[-5,2],[-5,1],[-5,0],[-5,-1],[-5,-2],[-5,-3],[-5,-4],
                       [-6,3],[-6,2],[-6,1],[-6,0],[-6,-1],[-6,-2],[-6,-3],
];

function randomNumber(max, min, padding, inclusive) {
  return(Math.floor((Math.random() * (max - min - padding + inclusive)) + min));
}

function isLocationOk(rooms, taken, size=1) {
  let ok = false;
  let tempY0 = null;
  let tempX0 = null;
  let tempY1 = null;
  let tempX1 = null;

  while(!ok) {
    tempY0 = randomNumber(64, 6, 0, 1);
    tempX0 = randomNumber(64, 6, 0, 1);
    if(size > 1) {
      tempY1 = tempY0 + size - 1;
      tempX1 = tempX0 + size - 1;
    }

    let isClash = 0;
    taken.forEach(v => {
      if(tempY0 === v[0] && tempX0 === v[1]) {
        isClash++;
      }
      if(size > 1) {
        if((tempY0 === v[0] && tempX1 === v[1]) ||
           (tempY1 === v[0] && tempX0 === v[1]) ||
           (tempY1 === v[0] && tempX1 === v[1])) {
          isClash++;
        }
      }
    });

    if(isClash === 0) {
      let isIn = 0;
      rooms.forEach(v => {
        if(tempY0 >= v[0] && tempY0 <= v[2] && tempX0 >= v[1] && tempX0 <= v[3]) {
          isIn++;

          if(size > 1) {
            if(!(tempY1 >= v[0] && tempY1 <= v[2] && tempX1 >= v[1] && tempX1 <= v[3])) {
              isIn--;
            }
          }
        }
      });

      if(isIn > 0) {
        ok = true;
      }
    }
  }
  
  return([tempY0, tempX0]);
}

/*
** Not breaking App up into different components
** as I don't know how to import
** multiple components in CodePen
*/
class App {
  /*
  ** 0:wall; 1:room; 2:route; 3:health; 4:weapon; 5:enemy; 6:boss; 7:stairs; 8:player
  */
  constructor() {
    this.gamestatus = {
                         healthItems: [],
                         weaponItem: [],
                         enemyLocations: [],
                         bossLocation: [],
                         stairLocation: [],
                         playerLocation: [],
                         playerHealth: 100,
                         playerWeapon: 'Hands',
                         playerAtt: 5,
                         playerLvl: 1,
                         playerExp: 0,
                         playerKills: 0,
                         currentDungeon: 1,
                         lights: false,
                         run: false
                      };
    this.weapons = { 1: 'Hands', 2: 'Knife', 3: 'Club', 4: 'Longsword' };
    this.enemies = null;
    this.table = [];
    this.rooms = [];
    this.routes = [];
    this.taken = [];
    this.initial = true;
    this.moveCallback = this.move.bind(this);
    this.resizeCallback = this.resize.bind(this);
    this.unloadCallback = this.unload.bind(this);

    /*
    ** Complete component lifecycle not available
    ** due to using Aurelia's basicConfiguration
    ** thus fetching data in constructor method
    **
    ** Unable to get Aurelia's standardConfiguration
    ** running in CodePen
    */
    setTimeout(() => {
      // Just In Case Padding
      setTimeout(() => {
        this.createBoard();
        window.addEventListener('keydown', this.moveCallback, false);
        window.addEventListener('resize', this.resizeCallback, false);
        window.addEventListener('unload', this.unloadCallback, false);
        setTimeout(() => {
          this.boardElem = document.getElementById('board');
          this.tableElem = document.getElementById('table');
          this.modalElem = document.getElementById('modal');
          this.centerBoard();
        }, 250);
      }, 250);
    }, 250);
  }

  unload(e) {
    window.removeEventListener('keydown', this.moveCallback);
    window.removeEventListener('resize', this.resizeCallback);
  }

  createBoard() {
    this.enemies = {};
    this.table.length = 0;
    this.routes.length = 0;
    this.rooms.length = 0;
    this.taken.length = 0;
    this.gamestatus.stairLocation.length = 0;
    this.gamestatus.healthItems.length = 0;
    this.gamestatus.weaponItem.length = 0;
    this.gamestatus.enemyLocations.length = 0;
    this.gamestatus.bossLocation.length = 0;
    this.gamestatus.playerLocation.length = 0;

    // generate rooms
    let numOfRooms = randomNumber(12, 8, 0, 0);
    for(let room = 0; room <= numOfRooms; room++) {
      if(room === 0) {
        this.rooms.push([33, 33, 37, 37]); // [ y0, x0, y1, x1 ]
      }
      else {
        let height = randomNumber(10, 3, 0, 1);
        let width = randomNumber(10, 3, 0, 1);
        if((height % 2) !== 0) { height++; }
        if((width % 2) !== 0) { width++; }
        
        // get room coords
        let placement = false;
        do {
          let y0 = randomNumber(64, 6, height, 1);
          let y1 = y0 + height;
          let x0 = randomNumber(64, 6, width, 1);
          let x1 = x0 + width;

          // check if coords is within previous rooms
          let isIn = 0;
          this.rooms.forEach(v => {
            if((y0 >= (v[0] - 3) && y0 <= (v[2] + 3) && x0 >= (v[1] - 3) && x0 <= (v[3] + 3)) ||
               (y0 >= (v[0] - 3) && y0 <= (v[2] + 3) && x1 >= (v[1] - 3) && x1 <= (v[3] + 3)) ||
               (y1 >= (v[0] - 3) && y1 <= (v[2] + 3) && x1 >= (v[1] - 3) && x1 <= (v[3] + 3)) ||
               (y1 >= (v[0] - 3) && y1 <= (v[2] + 3) && x0 >= (v[1] - 3) && x0 <= (v[3] + 3)) ||
               (y0 <  (v[0] - 3) && y1 >  (v[2] + 3) && x0 >= (v[1] - 3) && x0 <= (v[3] + 3)) ||
               (y0 <  (v[0] - 3) && y1 >  (v[2] + 3) && x1 >= (v[1] - 3) && x1 <= (v[3] + 3)) ||
               (x0 <  (v[1] - 3) && x1 >  (v[3] + 3) && y0 >= (v[0] - 3) && y0 <= (v[2] + 3)) ||
               (x0 <  (v[1] - 3) && x1 >  (v[3] + 3) && y1 >= (v[0] - 3) && y1 <= (v[2] + 3)) ||
               (y0 < (v[0] - 3) && y1 > (v[2] + 3) && x0 < (v[1] - 3) && x1 > (v[3] + 3))) {
              isIn++;
            }
          });

          // coords not within previous rooms
          if(isIn === 0) {
            placement = true;
            this.rooms.push([y0, x0, y1, x1]);
            
            // generate connections between previous room and current room
            let pR = this.rooms[room - 1];
            let cR = this.rooms[room];
            let pY = ((pR[2] - pR[0]) / 2) + pR[0];
            let pX = ((pR[3] - pR[1]) / 2) + pR[1];
            let cY = ((cR[2] - cR[0]) / 2) + cR[0];
            let cX = ((cR[3] - cR[1]) / 2) + cR[1];
            this.connectRooms(pR, cR, pY, pX, cY, cX);

            // last room connects to first room
            if(room === numOfRooms) {
              let pR = this.rooms[room];
              let cR = this.rooms[0];
              let pY = ((pR[2] - pR[0]) / 2) + pR[0];
              let pX = ((pR[3] - pR[1]) / 2) + pR[1];
              let cY = ((cR[2] - cR[0]) / 2) + cR[0];
              let cX = ((cR[3] - cR[1]) / 2) + cR[1];
              this.connectRooms(pR, cR, pY, pX, cY, cX);
            }
          }
        } while(!placement);
      }
    }

    // generate healths
    for(let index = 0; index < (2 + (this.gamestatus.currentDungeon * 3)); index++) {
      this.gamestatus.healthItems.push(isLocationOk(this.rooms, this.taken));
    }
    this.taken.push(...this.gamestatus.healthItems);

    // generate weapon
    this.gamestatus.weaponItem.push(...isLocationOk(this.rooms, this.taken));
    this.taken.push(this.gamestatus.weaponItem);

    // generate enemies
    for(let index = 0; index < (3 + (this.gamestatus.currentDungeon * 2)); index++) {
      let loc = isLocationOk(this.rooms, this.taken);
      this.gamestatus.enemyLocations.push(loc);
      this.enemies[`${loc[0]}-${loc[1]}`] = randomNumber((this.gamestatus.currentDungeon * 15), (this.gamestatus.currentDungeon * 5), 0, 1);
    }
    this.taken.push(...this.gamestatus.enemyLocations);

    // generate boss
    if(this.gamestatus.currentDungeon === 3) {
      let loc = isLocationOk(this.rooms, this.taken, 2);
      this.gamestatus.bossLocation.push(...loc);
      this.enemies['boss'] = randomNumber(125, 100, 0, 1);
      this.taken.push(this.gamestatus.bossLocation);
    }
    // generate stairs
    else {
      this.gamestatus.stairLocation.push(...isLocationOk(this.rooms, this.taken));
      this.taken.push(this.gamestatus.stairLocation);
    }

    // generate player
    this.gamestatus.playerLocation.push(...isLocationOk(this.rooms, this.taken));
    this.taken.push(this.gamestatus.playerLocation);

    // create board
    for(let row = 0; row <= 70; row++) {
      this.table.push([]);
      for(let column = 0; column <= 70; column++) {
        this.table[row].push(0);
      }
    }

    // place routes
    this.routes.forEach(v => {
      this.table[v[0]][v[1]] = 2;
    });

    // place rooms
    this.rooms.forEach(v => { // [ y0, x0, y1, x1 ]
      let rows = v[2] - v[0];
      let tempY = v[0];
      
      while(rows >= 0) {
        let columns = v[3] - v[1];
        let tempX = v[1];

        while(columns >= 0) {
          this.table[tempY][tempX] = 1;
          tempX++;
          columns--;
        }
        tempY++;
        rows--;
      }
    });

    // place healths
    this.gamestatus.healthItems.forEach(v => {
      this.table[v[0]][v[1]] = 3;
    });

    // place weapon
    this.table[this.gamestatus.weaponItem[0]][this.gamestatus.weaponItem[1]] = 4;

    // place enemies
    this.gamestatus.enemyLocations.forEach(v => {
      this.table[v[0]][v[1]] = 5;
    });

    // place boss
    if(this.gamestatus.currentDungeon === 3) {
      this.table[this.gamestatus.bossLocation[0]][this.gamestatus.bossLocation[1]] = 6;
      this.table[this.gamestatus.bossLocation[0]][this.gamestatus.bossLocation[1] + 1] = 6;
      this.table[this.gamestatus.bossLocation[0] + 1][this.gamestatus.bossLocation[1]] = 6;
      this.table[this.gamestatus.bossLocation[0] + 1][this.gamestatus.bossLocation[1] + 1] = 6;
    }
    // place stairs
    else {
      this.table[this.gamestatus.stairLocation[0]][this.gamestatus.stairLocation[1]] = 7; 
    }

    // place player
    this.table[this.gamestatus.playerLocation[0]][this.gamestatus.playerLocation[1]] = 8;
    
    // run game
    this.gamestatus.run = true;
  }

  connectRooms(pR, cR, pY, pX, cY, cX) {
    let diffY = pY - cY;
    let diffX = pX - cX;

    if(Math.round(Math.random()) === 0) { // sideways first
      if(diffX < 0) { // go rightward
        while(diffX < 0) { // moving right
          this.routes.push([pY, pX]);
          diffX++;
          pX++;
        }
      }
      else { // go leftward
        while(diffX > 0) { // moving left
          this.routes.push([pY, pX]);
          diffX--;
          pX--;
        }
      }
      if(diffY < 0) { // go downward
        while(diffY < 0) { // moving down
          this.routes.push([pY, pX]);
          diffY++;
          pY++;
        }
      }
      else { // go upward
        while(diffY > 0) { // moving up
          this.routes.push([pY, pX]);
          diffY--;
          pY--;
        }
      }
    }
    else { // topdown first
      if(diffY < 0) { // go downward
        while(diffY < 0) { // moving down
          this.routes.push([pY, pX]);
          diffY++;
          pY++;
        }
      }
      else { // go upward
        while(diffY > 0) { // moving up
          this.routes.push([pY, pX]);
          diffY--;
          pY--;
        }
      }
      if(diffX < 0) { // go rightward
        while(diffX < 0) { // moving right
          this.routes.push([pY, pX]);
          diffX++;
          pX++;
        }
      }
      else { // go leftward
        while(diffX > 0) { // moving left
          this.routes.push([pY, pX]);
          diffX--;
          pX--;
        }
      }
    }
  }
  
  resize(e) {
    this.centerBoard();
  }

  checkTile(tile, y1, x1) {
    if(tile === 0) { // wall
      return(false);
    }
    else if(tile === 1 || tile === 2) { // room || route
      return(true);
    }
    else if(tile === 3) { // health
      this.gamestatus.playerHealth += 10;
      return(true);
    }
    else if(tile === 4) { // weapon
      this.gamestatus.playerWeapon = this.weapons[(this.gamestatus.currentDungeon + 1)];
      this.gamestatus.playerAtt = this.gamestatus.playerLvl * 5;
      if(this.gamestatus.playerWeapon === 'Knife') { this.gamestatus.playerAtt += 5; }
      else if(this.gamestatus.playerWeapon === 'Club') { this.gamestatus.playerAtt += 10; }
      else if(this.gamestatus.playerWeapon === 'Longsword') { this.gamestatus.playerAtt += 15; }
      return(true);
    }
    else if(tile === 5) { // enemy
      let enemy = `${y1}-${x1}`;
      this.gamestatus.playerHealth -= randomNumber(10 + (this.gamestatus.currentDungeon * 5), 5, 0, 1);
      this.enemies[enemy] -= this.gamestatus.playerAtt;
      if(this.gamestatus.playerHealth <= 0) {
        this.gamestatus.playerHealth = 0;
        this.modalElem.style.display = 'flex';
        this.modalElem.style.backgroundColor = 'crimson';
        this.modalElem.children[0].innerText = `You've died!`;
        this.modalElem.children[1].innerText = `Click to restart`;
        this.gamestatus.run = false;
      }
      else if(this.enemies[enemy] <= 0) {
        this.gamestatus.playerKills++;
        this.gamestatus.playerExp += 25;
        if(this.gamestatus.playerExp >= 100) {
          this.gamestatus.playerExp -= 100;
          this.gamestatus.playerLvl++;
          this.gamestatus.playerHealth += 20;
          this.gamestatus.playerAtt = this.gamestatus.playerLvl * 5;
          if(this.gamestatus.playerWeapon === 'Knife') { this.gamestatus.playerAtt += 5; }
          else if(this.gamestatus.playerWeapon === 'Club') { this.gamestatus.playerAtt += 10; }
          else if(this.gamestatus.playerWeapon === 'Longsword') { this.gamestatus.playerAtt += 15; }
        }
        return(true);
      }
      else { return(false); }
    }
    else if(tile === 6) { // boss
      this.gamestatus.playerHealth -= randomNumber(15 + (this.gamestatus.currentDungeon * 5), 10, 0, 1);
      this.enemies['boss'] -= this.gamestatus.playerAtt;
      if(this.gamestatus.playerHealth <= 0) {
        this.gamestatus.playerHealth = 0;
        this.modalElem.style.display = 'flex';
        this.modalElem.style.backgroundColor = 'crimson';
        this.modalElem.children[0].innerText = `You've died!`;
        this.modalElem.children[1].innerText = `Click to restart`;
        this.gamestatus.run = false;
      }
      else if(this.enemies['boss'] <= 0) {
        this.modalElem.style.display = 'flex';
        this.modalElem.style.backgroundColor = 'steelblue';
        this.modalElem.children[0].innerText = `You've defeated the boss!`;
        this.modalElem.children[1].innerText = `Click to replay`;
        this.gamestatus.run = false;
      }
      return(false);
    }
    else if(tile === 7) { // stairs
      this.gamestatus.currentDungeon++;
      this.createBoard();
      setTimeout(() => { this.centerBoard(); }, 100);
      return(false);
    }
  }
  
  move(e) {
    let player = null;
    let tile = null;
    let y0 = this.gamestatus.playerLocation[0];
    let x0 = this.gamestatus.playerLocation[1];
    let y1 = null;
    let x1 = null;

    if(!this.gamestatus.run || !(e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      return(false);
    }
    else if(e.key === 'ArrowUp') {
      y1 = y0 - 1;
      x1 = x0;
      player = document.getElementById(`${y0}-${x0}`);
      tile = document.getElementById(`${y1}-${x1}`);
      if(this.checkTile(Number(tile.dataset.tile), y1, x1)) {
        this.gamestatus.playerLocation[0] = y1;
        this.gamestatus.playerLocation[1] = x1;
        player.dataset.tile = '1';
        tile.dataset.tile = '8';
        this.centerBoard(e.key);
        
      }
    }
    else if(e.key === 'ArrowDown') {
      y1 = y0 + 1;
      x1 = x0;
      player = document.getElementById(`${y0}-${x0}`);
      tile = document.getElementById(`${y1}-${x1}`);
      if(this.checkTile(Number(tile.dataset.tile), y1, x1)) {
        this.gamestatus.playerLocation[0] = y1;
        this.gamestatus.playerLocation[1] = x1;
        player.dataset.tile = '1';
        tile.dataset.tile = '8';
        this.centerBoard(e.key);
        
      }
    }
    else if(e.key === 'ArrowLeft') {
      y1 = y0;
      x1 = x0 - 1;
      player = document.getElementById(`${y0}-${x0}`);
      tile = document.getElementById(`${y1}-${x1}`);
      if(this.checkTile(Number(tile.dataset.tile), y1, x1)) {
        this.gamestatus.playerLocation[0] = y1;
        this.gamestatus.playerLocation[1] = x1;
        player.dataset.tile = '1';
        tile.dataset.tile = '8';
        this.centerBoard(e.key);
        
      }
    }
    else if(e.key === 'ArrowRight') {
      y1 = y0;
      x1 = x0 + 1;
      player = document.getElementById(`${y0}-${x0}`);
      tile = document.getElementById(`${y1}-${x1}`);
      if(this.checkTile(Number(tile.dataset.tile), y1, x1)) {
        this.gamestatus.playerLocation[0] = y1;
        this.gamestatus.playerLocation[1] = x1;
        player.dataset.tile = '1';
        tile.dataset.tile = '8';
        this.centerBoard(e.key);
        
      }
    }

    return(true);
  }
  
  centerBoard(type=null) {
    let rect = this.boardElem.getBoundingClientRect();
    let yVal = parseInt(this.tableElem.style.top.slice(0, this.tableElem.style.top.length - 2));
    let xVal = parseInt(this.tableElem.style.left.slice(0, this.tableElem.style.left.length - 2));
    if(type === 'ArrowUp') {
      this.tableElem.style.top = `${yVal + 10}px`;
      this.setPlayerSight(type);
    }
    else if(type === 'ArrowDown') {
      this.tableElem.style.top = `${yVal - 10}px`;
      this.setPlayerSight(type);
    }
    else if(type === 'ArrowLeft') {
      this.tableElem.style.left = `${xVal + 10}px`;
      this.setPlayerSight(type);
    }
    else if(type === 'ArrowRight') {
      this.tableElem.style.left = `${xVal - 10}px`;
      this.setPlayerSight(type);
    }
    else if(type === null) {
      this.tableElem.style.top = `${(this.gamestatus.playerLocation[0] * -10) + (rect.height / 2)}px`;
      this.tableElem.style.left = `${(this.gamestatus.playerLocation[1] * -10) + (rect.width / 2)}px`;
      this.setPlayerSight();
    }
  }
  
  setPlayerSight(type=null) {
    if(!this.gamestatus.lights) {
      let oldY = null;
      let oldX = null;
      let newY = this.gamestatus.playerLocation[0];
      let newX = this.gamestatus.playerLocation[1];
      let tiles = playerLightTiles;

      if(type === 'ArrowUp') {
        oldY = this.gamestatus.playerLocation[0] + 1;
        oldX = this.gamestatus.playerLocation[1];
      }
      else if(type === 'ArrowDown') {
        oldY = this.gamestatus.playerLocation[0] - 1;
        oldX = this.gamestatus.playerLocation[1];
      }
      else if(type === 'ArrowLeft') {
        oldY = this.gamestatus.playerLocation[0];
        oldX = this.gamestatus.playerLocation[1] + 1;
      }
      else if(type === 'ArrowRight') {
        oldY = this.gamestatus.playerLocation[0];
        oldX = this.gamestatus.playerLocation[1] - 1;
      }

      if(type !== null) {
        tiles.forEach(v => {
          document.getElementById(`${oldY + v[0]}-${oldX + v[1]}`).setAttribute('data-light', 'false');
        });
      }

      tiles.forEach(v => {
        document.getElementById(`${newY + v[0]}-${newX + v[1]}`).setAttribute('data-light', 'true');
      });
    }
  }
  
  toggleLight(event) {
    if(this.gamestatus.lights) {
      event.srcElement.parentElement.classList.remove('on');
      this.gamestatus.lights = false;
      setTimeout(() => { this.setPlayerSight(); }, 100);
    }
    else {
      event.srcElement.parentElement.classList.add('on');
      this.gamestatus.lights = true;
    }
  }
  
  replay() {
    this.gamestatus.playerHealth = 100;
    this.gamestatus.playerWeapon = 'Hands';
    this.gamestatus.playerAtt = 5;
    this.gamestatus.playerLvl = 1;
    this.gamestatus.playerExp = 0;
    this.gamestatus.playerKills = 0;
    this.gamestatus.currentDungeon = 1;
    this.createBoard();
    setTimeout(() => {
      this.centerBoard();
      this.modalElem.style.display = 'none';
    }, 250);
  }
}

const app = new App();

// To allow user to use keyboard
// from the start without having
// to click on the screen first
document.getElementById('for-focus').focus();
document.getElementById('for-focus').blur();



/*
** Aurelia Bootstrap Codes
*/

require.config({
  paths: { 'text': 'https://cdnjs.cloudflare.com/ajax/libs/require-text/2.0.12/text.min' }
});

require(['aurelia-bootstrapper'], boot => {
  boot.bootstrap(aurelia => {
    aurelia.use
    .basicConfiguration();
    
    aurelia.start().then(() => {
      aurelia.enhance(app, document.getElementById('wrapper'));
    });
  });
});

/*
** Aurelia Bootstrap Codes
*/