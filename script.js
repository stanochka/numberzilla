const body = document.querySelector('body');
const container = document.querySelector('#container');
const mode = document.querySelector('#mode')
const startButton = document.querySelector('#start');
const points = document.querySelector('#points>.pointCounter')
const add = document.querySelector('#add');
const hint = document.querySelector('#hint');
const undo = document.querySelector('#undo');
var matrix = [];
var chosen = [];
var pointCounter = 0;
const gridSizeLimit = 45;

//initial grid IIFE
const makeGrid = (() => {
  let divIDs = [];
  for (let r=0; r<9; r++) {
    for (let c=0; c<9; c++) {
      divIDs.push(`${r}-${c}`);
    };
  };
  for (let i = 0; i < 81; i++) {
    let el = document.createElement('div');
    el.style.border = '1px solid #FFF';
    el.id = divIDs[i];
    container.appendChild(el);
  };
})()

const fillGrid = () => {
  const divs = document.querySelectorAll('#container>div');
  divs.forEach((div, i) => div.textContent = matrix.flat()[i]);
}

//initial numbers upon starting game
const startGame = () => {
  startButton.removeEventListener('click', startGame);
  let array = [...Array(54)].map(_ => Math.ceil(Math.random() * 9));
  while (array.length) matrix.push(array.splice(0, 9));
  fillGrid();
  trackTime();
  trackProgress();
}

const changeMode = () => {
  if (mode.value === 'light') {
    body.style.background = '#D9CEED';
    body.style.color = '#000';
    mode.value = 'dark';
    mode.innerHTML = '<span class="material-icons">dark_mode</span>';
    mode.style.color = '#000';
  } else {
    body.style.background = '#3D0E79';
    body.style.color = '#FFF';
    mode.value = 'light';
    mode.innerHTML = '<span class="material-icons">light_mode</span>';
    mode.style.color = '#FFF';
  }
}

const trackTime = () => {
  function timeToString(time) {
    let diffInHrs = time / 3600000;
    let hh = Math.floor(diffInHrs);

    let diffInMin = (diffInHrs - hh) * 60;
    let mm = Math.floor(diffInMin);

    let diffInSec = (diffInMin - mm) * 60;
    let ss = Math.floor(diffInSec);

    let formattedHH = hh.toString().padStart(2, "0");
    let formattedMM = mm.toString().padStart(2, "0");
    let formattedSS = ss.toString().padStart(2, "0");

    return `${formattedHH}:${formattedMM}:${formattedSS}`;
  }
  let startTime;
  let elapsedTime = 0;
  let timerInterval;

  function start() {
    startTime = Date.now() - elapsedTime;
    timerInterval = setInterval(function printTime() {
      elapsedTime = Date.now() - startTime;
      timer.textContent = timeToString(elapsedTime);
    }, 10);
    showButton("PAUSE");
    doStep();
  }

  function pause() {
    clearInterval(timerInterval);
    showButton("PLAY");
    pauseStep();
  }

  function stop() {
    confirm('Are you sure? All progress will be lost');
    clearInterval(timerInterval);
    timer.textContent = '00:00:00';
    elapsedTime = 0;
    showButton("PLAY");
    resetAll();
  }

  function showButton(buttonKey) {
    const buttonToShow = buttonKey === "PLAY" ? startButton : pauseButton;
    const buttonToHide = buttonKey === "PLAY" ? pauseButton : startButton;
    buttonToShow.style.display = "block";
    buttonToHide.style.display = "none";
  }

  const startButton = document.querySelector('#start');
  const pauseButton = document.querySelector('#pause');
  const stopButton = document.querySelector('#stop');
  const timer = document.querySelector('#time>.timer');

  startButton.addEventListener("click", start);
  pauseButton.addEventListener("click", pause);
  stopButton.addEventListener("click", stop);

  start();
}

const trackProgress = () => {
  if (pointCounter < 0) {
    //TODO: add condition if gridSize exceeded
    alert('Game over!');
    resetAll();
  };
  if (pointCounter > 0 && matrix.flat().filter(el => el > 0).length === 0) {
    alert(`You won with score: ${pointCounter}`)
  }
}

const resetAll = () => {
  pointCounter = 0;
  points.textContent = pointCounter;
  matrix.length = 0;
  chosen.length = 0;
  const divs = document.querySelectorAll('#container>div');
  divs.forEach(div => div.textContent = '');
  startButton.addEventListener('click', startGame);
}

const checkChosen = () => {
  let x = chosen[0][0];
  let y = chosen[1][0];
  if (+x + +y === 10 || x === y) {
    return checkPosition();
  } else return false;
}

const checkPosition = () => {
  let posX = [+chosen[0][1].match(/^\d+/)[0], +chosen[0][1].match(/\d+$/)[0]];
  let posY = [+chosen[1][1].match(/^\d+/)[0], +chosen[1][1].match(/\d+$/)[0]];
  //same row
  if (posX[0] === posY[0] &&
      matrix[posX[0]].slice(posX[1]+1, posY[1])
                     .filter(el => el !== null)
                     .length === 0) return true;
  //same column
  else if (posX[1] === posY[1]) {
    let toCheck = [];
    let start, end;
    posX[0] < posY[0] ? (start = posX[0], end = posY[0]) : (start = posY[0], end = posX[0]);
    for (let i=start+1; i<end; i++) { toCheck.push(matrix[i][posX[1]]); }
    if (toCheck.filter(el => el !== null).length === 0) return true;
    else return false;
  }
  //next element
  else if (posX[0]+1 === posY[0] || posX[0] === posY[0]+1) {
    let toCheck = [];
    let startRow, startCol, endRow, endCol;
    posX[0] < posY[0] ?
    (startRow = posX[0], startCol = posX[1], endRow = posY[0], endCol = posY[1]) :
    (startRow = posY[0], startCol = posY[1], endRow = posX[0], endCol = posX[1]);
    if (startCol < 8) toCheck = toCheck.concat(matrix[startRow].slice(startCol+1));
    if (endCol > 0) toCheck = toCheck.concat(matrix[endRow].slice(0, endCol));
    if (toCheck.filter(el => el !== null).length === 0) return true;
    else return false;
  }
  else return false;
}

const removeItems = () => {
  const divs = document.querySelectorAll('#container>div');
  setTimeout(() => {
    divs.forEach(div => {
      if (div.id ===chosen[0][1] || div.id ===chosen[1][1]) {
        div.textContent = '';
        div.style.background = '';
        div.style.cursor = '';
      }
    });
    let posX = [+chosen[0][1].match(/^\d+/)[0], +chosen[0][1].match(/\d+$/)[0]];
    let posY = [+chosen[1][1].match(/^\d+/)[0], +chosen[1][1].match(/\d+$/)[0]];
    matrix[posX[0]].splice(posX[1], 1, null);
    matrix[posY[0]].splice(posY[1], 1, null);
    chosen.length = 0;
    checkEmptyRows();
  }, 500);
}

const checkEmptyRows = () => {
  let emptyRowsN = matrix.map(row => row.every(el => el == null))
                         .filter(row => row === true).length;
  if (emptyRowsN === 1) {
    for (let row in matrix) {
      if (matrix[row].every(el => el === null)) {
        matrix.splice(row, 1);
        //delete 1 empty row and move up
        const divs = document.querySelectorAll('#container>div');
        for (let i=0; i<matrix.flat().length; i++) {
          divs[i].textContent = matrix.flat()[i];
        }
        //clean last row
        for (let i=0; i<9; i++) {
          divs[matrix.flat().length + i].textContent = null;
        }
      }
    }
  } else if (emptyRowsN === 2) {
    for (let row in matrix) {
      if (matrix[row].every(el => el === null)) {
        matrix.splice(row, 2);
        //delete 2 empty rows and move up
        const divs = document.querySelectorAll('#container>div');
        for (let i=0; i<matrix.flat().length; i++) {
          divs[i].textContent = matrix.flat()[i];
        }
        //clean 2 last rows
        for (let i=0; i<18; i++) {
          divs[matrix.flat().length + i].textContent = null;
        }
      }
    }
  }
}

const addPoints = () => {
    pointCounter += 5;
    points.textContent = pointCounter;
}

function stepListener() {
  let div = this;
  if (div.textContent) {
    div.style.background = '#B98EFF';
    if (chosen.length < 2) {
      chosen.push([div.textContent, div.id]);
      if (chosen.length === 2) {
        if (checkChosen() && chosen[0][1] !== chosen[1][1]) {
          removeItems();
          addPoints();
        } else {
          const divs = document.querySelectorAll('#container>div');
          setTimeout(() => {
            divs.forEach(div => div.style.background = '');
            }, 500);
          chosen.length = 0;
        }
      }
    } else {
      const divs = document.querySelectorAll('#container>div');
      divs.forEach(div => div.style.background = '');
      chosen.length = 0;
    }
  }
}

const doStep = () => {
  const divs = document.querySelectorAll('#container>div');
  divs.forEach(div => {
    if (div.textContent) {
      div.style.cursor = 'pointer';
      div.addEventListener('click', stepListener);
    }
  })
}

const pauseStep = () => {
  const divs = document.querySelectorAll('#container>div');
  divs.forEach(div => {
    div.style.cursor = '';
    div.removeEventListener('click', stepListener) ;
  });
}

const expandGrid = () => {
  //add existing numbers to matrix ignoring empty cells
  const limit = matrix.flat().filter(el => el !== null).length/9;
  const toFill = matrix.flat().filter(el => el !== null);
  for (let i=0; i<limit; i++) {
    matrix.push(toFill.splice(0, 9));
  };
  //expand grid to accomodate added numbers
  //TODO: fix bug with last row not 9 cols
  const newRowsN = (matrix.flat().length - container.childElementCount)/9 + 1;
  const existRowsN = container.childElementCount/9;
  let divIDs = [];
  for (let r=existRowsN; r<existRowsN+newRowsN; r++) {
    for (let c=0; c<9; c++) {
      divIDs.push(`${r}-${c}`);
    };
  };
  for (let i = 0; i < newRowsN*9; i++) {
    let el = document.createElement('div');
    el.style.border = '1px solid #FFF';
    el.id = divIDs[i];
    container.appendChild(el);
  };
  fillGrid();
  doStep();
}

const undoStep = () => {
  //TODO: restore deleted divs (add to matrix and render again)
  //pointCounter -= 8;
  //points.textContent = pointCounter;
}

mode.addEventListener('click', changeMode);
startButton.addEventListener('click', startGame);
add.addEventListener('click', expandGrid);
//hint.addEventListener('click', getHint);
//undo.addEventListener('click', undoStep);
