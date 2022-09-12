const body = document.querySelector('body');
const container = document.querySelector('#container');
const mode = document.querySelector('#mode');
const highscoreList = document.querySelector('#highscoreList')
const startButton = document.querySelector('#start');
const pauseButton = document.querySelector('#pause');
const pauseMessage = document.querySelector('#pauseMessage');
const stopButton = document.querySelector('#stop');
const timer = document.querySelector('#time>.timer');
const points = document.querySelector('#points>.pointCounter')
const add = document.querySelector('#add');
const shuffle = document.querySelector('#shuffle')
const hint = document.querySelector('#hint');
const undo = document.querySelector('#undo');

var matrix = [];
var chosen = [];
var pointCounter = 0;
const gridRowLimit = 60;
const NUMBER_LIMIT = 500;
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
  if (mode.value === 'dark') {
    body.style.background = '#D0C7FF';
    body.style.color = '#000';
    mode.value = 'light';
    mode.innerHTML = '<span class="material-icons">dark_mode</span>';
    mode.style.color = '#000';
    document.querySelectorAll('a').forEach(item => item.style.color = '#000');

  } else {
    body.style.background = '#3D0E79';
    body.style.color = '#FFF';
    mode.value = 'dark';
    mode.innerHTML = '<span class="material-icons">light_mode</span>';
    mode.style.color = '#FFF';
    document.querySelectorAll('#topWrapper>a').forEach(item => item.style.color = '#FFF');
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
    pauseMessage.style.display = "none";
    doStep();
  }

  function pause() {
    clearInterval(timerInterval);
    showButton("PLAY");
    pauseMessage.style.display = "block";
    pauseStep();
  }

  function stop() {
    if (confirm('Вы уверены, что хотите завершить игру?')) {
      clearInterval(timerInterval);
      alert(Игра окончена! Ваш результат: ${pointCounter}. Время: ${timeToString(elapsedTime)}.`);
      saveScore();
      startButton.addEventListener('click', startGame);
      showButton("PLAY");
      clearAll();
    }
  }

  function showButton(buttonKey) {
    const buttonToShow = buttonKey === "PLAY" ? startButton : pauseButton;
    const buttonToHide = buttonKey === "PLAY" ? pauseButton : startButton;
    buttonToShow.style.display = "block";
    buttonToHide.style.display = "none";
  }

  startButton.addEventListener("click", start);
  pauseButton.addEventListener("click", pause);
  stopButton.addEventListener("click", stop);

  start();
}

const clearAll = () => {
  matrix = [];
  chosen = [];
  pointCounter = 0;
  points.textContent = pointCounter;
  lastStep = [null, null, 0];
  elapsedTime = 0;
  timer.textContent = '00:00:00';
  while (container.childElementCount > 0) container.lastElementChild.remove();
  makeGrid(9, 0);
  pauseStep();
}

const checkProgress = () => {
  if (pointCounter < 0) {
    alert('Game over! You lost all the points');
    document.location.reload();
  };
  if (pointCounter > 0 && matrix.flat().filter(el => el !== null).length === 0) {
    alert(`Поздравляем! Вы выиграли с результатом: ${pointCounter}!`)
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
      };
      div.style.boxShadow = '';
    });
    let posX = [+chosen[0][1].match(/^\d+/)[0], +chosen[0][1].match(/\d+$/)[0]];
    let posY = [+chosen[1][1].match(/^\d+/)[0], +chosen[1][1].match(/\d+$/)[0]];
    matrix[posX[0]].splice(posX[1], 1, null);
    matrix[posY[0]].splice(posY[1], 1, null);
    chosen.length = 0;
    checkEmptyRows();
    checkNumberLimit();
    checkProgress();
  }, 400);
}

const checkEmptyRows = () => {
  let emptyRowsN = matrix.map(row => row.every(el => el == null))
                         .filter(row => row === true).length;
  if (emptyRowsN === 1) {
    for (let row in matrix) {
      if (matrix[row].every(el => el === null)) {
        lastStep.splice(1, 2, row, 1);
        matrix.splice(row, 1);
      }
    }
  } else if (emptyRowsN === 2) {
    for (let row in matrix) {
      if (matrix[row].every(el => el === null)) {
        lastStep.splice(1, 2, row, 2);
        matrix.splice(row, 2);
      }
    }
  } else lastStep.splice(1, 2, null, 0);
  //clean empty rows at the end of grid
  if (container.childElementCount/9 > 9) {
    let toDelete;
    matrix.length > 9 ? toDelete = matrix.length : toDelete = 9;
    while (container.childElementCount/9 > toDelete) container.lastElementChild.remove();
  }
  fillGrid();
  doStep();
}

const addPoints = () => {
    pointCounter += 5;
    setTimeout(() => { points.textContent = pointCounter; }, 400);
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
            divs.forEach(div => {
              div.style.background = '' ;
              div.style.boxShadow = '';
            });
          }, 400);
          chosen.length = 0;
        }
      }
    } else {
      const divs = document.querySelectorAll('#container>div');
      divs.forEach(div => { div.style.background = ''; div.style.boxShadow = ''; });
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
  add.addEventListener('click', expandGrid);
  shuffle.addEventListener('click', shuffleGrid);
  hint.addEventListener('click', getHint);
  undo.addEventListener('click', undoStep);
}

const pauseStep = () => {
  const divs = document.querySelectorAll('#container>div');
  divs.forEach(div => {
    div.style.cursor = '';
    div.removeEventListener('click', stepListener) ;
  });
  add.removeEventListener('click', expandGrid);
  shuffle.addEventListener('click', shuffleGrid);
  hint.removeEventListener('click', getHint);
  undo.removeEventListener('click', undoStep);
}

const expandGrid = () => {
  lastStep = [null, null, 0];
  const existRowsN = container.childElementCount/9;
  const limit = matrix.flat().filter(el => el !== null).length/9;
  const toFill = matrix.flat().filter(el => el !== null);
  let lastRow = matrix.slice(-1).flat();
  if (lastRow[lastRow.length - 1] === null) {
    let i = lastRow.reverse().findIndex(el => el !== null);
    lastRow.splice(0, i);
    lastRow.reverse();
    toFill.unshift(...lastRow);
    matrix.splice(-1, 1);
  } else if (lastRow.length < 9) {
    toFill.unshift(...lastRow);
    matrix.splice(-1, 1);
  }
  while (toFill.length) matrix.push(toFill.splice(0, 9));
  makeGrid(limit, existRowsN);
  fillGrid();
  checkEmptyRows();
  checkNumberLimit();
}

const shuffleGrid = () => {
  lastStep = [null, null, 0];
  let shuffled = matrix.flat().filter(el => el !== null)
                              .map((el) => ({sortkey: Math.random(), value: el}))
                              .sort((a, b) => a.sortkey - b.sortkey)
                              .map((el) => el.value);
  matrix.length = 0;
  while (shuffled.length) matrix.push(shuffled.splice(0, 9));
  while (container.childElementCount > 0) container.lastElementChild.remove();
  makeGrid(matrix.length, 0);
  fillGrid();
  checkEmptyRows();
  checkNumberLimit();
  doStep();
}

const showButton = (buttonKey) => {
  const buttonToShow = buttonKey === "ADD" ? add : shuffle;
  const buttonToHide = buttonKey === "SHUFFLE" ? add : shuffle;
  buttonToShow.style.display = "block";
  buttonToHide.style.display = "none";
}

const checkNumberLimit = () => {
  matrix.flat().filter(el => el !== null).length < NUMBER_LIMIT ?
  showButton('ADD') : showButton('SHUFFLE');
}

const getHint = () => {
  let matchIndH = [];
  let matchIndV = [];
  //horisontal check (+next in line)
  let offset = 1;
  for (let i=0; i+offset<matrix.flat().length; i++) {
    if (matrix.flat()[i+offset] === null) {
    	do {
        offset = offset + 1;
  		} while (matrix.flat()[i+offset] === null);
    }
    if ( matrix.flat()[i]+matrix.flat()[i+offset] === 10
      || matrix.flat()[i]===matrix.flat()[i+offset] ) {
      matchIndH = [i, i+offset];
      break;
    }
    offset = 1;
  }
  //vertical check
  let temp = [];
  for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[0].length; c++) {
          if (temp[c] === undefined) temp[c] = [];
          temp[c][r] = matrix[r][c];
      }
  }
  offset = 1;
  for (let c=0; c<matrix[0].length; c++) {
    for (let r=0; r+offset<matrix.length; r++) {
      if (temp[c][r+offset] === null) {
        do {
          offset = offset + 1;
        } while (temp[c][r+offset] === null);
      }
      if (temp[c][r]+temp[c][r+offset] === 10 || temp[c][r]===temp[c][r+offset]) {
        matchIndV = [[r, c], [r+offset, c]].map(el => el[0]*matrix[0].length+el[1]);
        break;
      }
      offset = 1;
    }
    if (matchIndV.length > 0) break;
  }
  let hintItems;
  //which hint to show
  if (matchIndH.length>0 && matchIndV.length>0) {
    hintItems = matchIndH[0] <= matchIndV[0] ? matchIndH : matchIndV;
  }
  else if (matchIndH.length !== 0) hintItems = matchIndH;
  else if (matchIndV.length !== 0) hintItems = matchIndV;
  else hintItems = null;
  //show hint
  if (hintItems !== null) {
    showHint();
    pointCounter -= 8;
    setTimeout(() => { points.textContent = pointCounter; }, 400);
    checkProgress();
  }
  else alert('No possible matches! Add more numbers or shuffle')

  function showHint() {
    const divs = document.querySelectorAll('#container>div');
    hintItems.forEach(i => divs[i].style.boxShadow = '0 0 0 3px rgb(28, 246, 200) inset')
    divs[hintItems[0]].scrollIntoView({ behavior: 'smooth' });
  }
}

const undoStep = () => {
  if (lastStep[0] !== null) {
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
    setTimeout(() => { points.textContent = pointCounter; }, 400);
    checkProgress();
    doStep();
  } else alert('You cannot undo!')
}

mode.addEventListener('click', changeMode);
startButton.addEventListener('click', startGame);

document.addEventListener("visibilitychange", function() {
  if (document.visibilityState === 'hidden') {
    pauseButton.click();
  }
});

const saveScore = () => {
  const savedScores = localStorage.getItem('highscore') || '[]';
  const highscores = [...JSON.parse(savedScores), pointCounter]
      .sort((a, b) => b-a)
      .slice(0, 5);
  localStorage.setItem('highscore', JSON.stringify(highscores));
  while (highscoreList.childElementCount > 0) highscoreList.lastElementChild.remove();
  showScores();
}

const showScores = () => {
  if (localStorage.getItem('highscore')) {
    const savedScores = localStorage.getItem('highscore');
    JSON.parse(savedScores).forEach(score => {
      let li = document.createElement("li");
      li.appendChild(document.createTextNode(`-${score}-`));
      highscoreList.appendChild(li);
    });
  } else {
    let li = document.createElement("li");
    li.appendChild(document.createTextNode('no records yet'));
    highscoreList.appendChild(li);
  }
}

showScores();
