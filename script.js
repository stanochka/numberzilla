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
const gridRowLimit = 60;
// lastStep = [removedItemsArray, deletedRowsIndex, deletedRowsN]
// removedItemsArray = [[value1, row1-col1],[value2, row2-col2]]
var lastStep = [null, null, 0];

const makeGrid = (newRowsN, existRowsN) => {
  let divIDs = [];
  for (let r=existRowsN; r<existRowsN+newRowsN; r++) {
    for (let c=0; c<9; c++) {
      divIDs.push(`${r}-${c}`);
    };
  };
  for (let i = 0; i < divIDs.length; i++) {
    let el = document.createElement('div');
    el.style.border = '1px solid #FFF';
    el.id = divIDs[i];
    container.appendChild(el);
  };
}

makeGrid(9, 0); //default 9 rows

const fillGrid = () => {
  const divs = document.querySelectorAll('#container>div');
  divs.forEach((div, i) => div.textContent = matrix.flat()[i]);
}

const startGame = () => {
  startButton.removeEventListener('click', startGame);
  let array = [...Array(54)].map(_ => Math.ceil(Math.random() * 9));
  while (array.length) matrix.push(array.splice(0, 9));
  fillGrid();
  trackTime();
}

const changeMode = () => {
  if (mode.value === 'light') {
    body.style.background = '#D0C7FF';
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
    timerInterval = setInterval(() => {
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
    document.location.reload();
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

const checkProgress = () => {
  if (pointCounter < 0) {
    alert('Game over!');
    document.location.reload();
  };
  if (pointCounter > 0 && matrix.flat().filter(el => el > 0).length === 0) {
    alert(`You won with score: ${pointCounter}`)
  }
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
  let removedItemsArray = chosen.slice(0);
  lastStep.splice(0, 1, removedItemsArray);
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
    checkProgress();
  }, 500);
}

const checkEmptyRows = () => {
  let emptyRowsN = matrix.map(row => row.every(el => el == null))
                         .filter(row => row === true).length;
  if (emptyRowsN === 1) {
    for (let row in matrix) {
      if (matrix[row].every(el => el === null)) {
        lastStep.splice(1, 2, row, 1);
        //delete 1 empty row and move up
        matrix.splice(row, 1);
      }
    }
  } else if (emptyRowsN === 2) {
    for (let row in matrix) {
      if (matrix[row].every(el => el === null)) {
        lastStep.splice(1, 2, row, 2);
        //delete 2 empty rows and move up
        matrix.splice(row, 2);
      }
    }
  } else lastStep.splice(1, 2, null, 0);
  //clean empty rows at the end of grid
  if (container.childElementCount/9 > 9) {
    while (container.childElementCount/9 > matrix.length+1) {
      el = container.lastElementChild;
      el.remove();
    };
  }
  fillGrid();
  doStep();
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
  const existRowsN = container.childElementCount/9;
  const limit = matrix.flat().filter(el => el !== null).length/9;
  if (existRowsN+limit < gridRowLimit) {
    const toFill = matrix.flat().filter(el => el !== null);
    lastRow = matrix.slice(-1).flat();
    if (lastRow.length < 9) {
      lastRow = lastRow.concat(Array(9-lastRow.length).fill(null));
      matrix.splice(-1, 1, lastRow);
    }
    for (let i=0; i<limit; i++) {
      matrix.push(toFill.splice(0, 9));
    };
    makeGrid(limit + 1, existRowsN);
    fillGrid();
    checkEmptyRows();
  //TODO: add changing button to shuffle
  } else alert('Grid size limit reached!');
}

const undoStep = () => {
  if (lastStep[0] !== null) {
    confirm("Are you sure? You'll lose 8 points");
    //restore removed empty rows if any
    if (lastStep[2] === 1) matrix.splice(lastStep[1], 0, Array(9).fill(null));
    else if (lastStep[2] === 2) matrix.splice(lastStep[1], 0, Array(9).fill(null), Array(9).fill(null));
    //restore removed items
    let posX = [+lastStep[0][0][1].match(/^\d+/)[0], +lastStep[0][0][1].match(/\d+$/)[0]];
    let posY = [+lastStep[0][1][1].match(/^\d+/)[0], +lastStep[0][1][1].match(/\d+$/)[0]];
    matrix[posX[0]].splice(posX[1], 1, +lastStep[0][0][0]);
    matrix[posY[0]].splice(posY[1], 1, +lastStep[0][1][0]);
    fillGrid();
    lastStep = [null, null, 0];
    pointCounter -= 8;
    points.textContent = pointCounter;
  } else alert('Cannot use this option!');
}

mode.addEventListener('click', changeMode);
startButton.addEventListener('click', startGame);
add.addEventListener('click', expandGrid);
//hint.addEventListener('click', getHint);
undo.addEventListener('click', undoStep);

//not move window on mobile
function BlockMove(event) {
  event.preventDefault() ;
 }
