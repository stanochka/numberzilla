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

//initial grid IIFE
const makeGrid = (() => {
  for (let i = 0; i < 81; i++) {
    let el = document.createElement('div');
    el.style.border = '1px solid #FFF';
    container.appendChild(el);
  };
})()

//initial numbers upon starting game
const fillGrid = () => {
  startButton.removeEventListener('click', fillGrid);
  const divs = document.querySelectorAll('#container>div');
  const array = [...Array(54)].map(_ => Math.ceil(Math.random() * 9));
  array.forEach((_, i) => { divs[i].textContent = array[i]; });
  while (array.length) matrix.push(array.splice(0, 9));
  let divIDs = [];
  for (let r=0; r<matrix.length; r++) {
    for (let c=0; c<matrix[r].length; c++) {
      divIDs.push(`${r}-${c}`);
    };
  };
  divIDs.forEach((_, i) => { divs[i].id = divIDs[i];});
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
    confirm('Are you sure?');
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
  if (pointCounter > 0 && matrix.flat().filter(_ => i > 0).length === 0) {
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
  startButton.addEventListener('click', fillGrid);
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
    console.log([startRow, startCol]);
    console.log([endRow, endCol]);
    if (startCol < 8) toCheck = toCheck.concat(matrix[startRow].slice(startCol+1));
    if (endCol > 0) toCheck = toCheck.concat(matrix[endRow].slice(0, endCol));
    console.log(toCheck);
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
    //add deleting row if empty
  }, 500);
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
    if (div.textContent) div.style.cursor = 'pointer';
    div.addEventListener('click', stepListener);
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
  //TODO: add rows for (let i=0; i<matrix.flat().length/9; i++);
  //TODO: fill new rows with matrix.flat()
}

const undoStep = () => {
  //TODO: restore deleted divs (add to matrix and render again)
  //pointCounter -= 8;
  //points.textContent = pointCounter;
}

mode.addEventListener('click', changeMode);
startButton.addEventListener('click', fillGrid);
//add.addEventListener('click', expandGrid);
//hint.addEventListener('click', getHint);
//undo.addEventListener('click', undoStep);
