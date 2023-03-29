import logo from './logo.svg';
import 'chessboard-element';
import './App.css';
import React, { Component } from 'react';
import $ from 'jquery';
import { createMoveTree, makeMove, getMove } from './stringParser';
import { Chess } from 'chess.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faToggleOff, faToggleOn } from "@fortawesome/free-solid-svg-icons";
import { Helmet } from 'react-helmet';

// create moveTree nested dictionary and current branch var (shallow copy)
// play the first (few?) move(s) without input for white
// on input from user:
//   if input was not a valid option on current branch, throw error
//   if there are no more moves on branch, recurse to last point at which branch has 1 path and delete that branch you just went down
//   choose random move from branch and change current branch

// if you can fill the textarea with a value from localStorage, do it and call setUpBoard();
// either way, set up an event listener: on textarea input, save the value to localStorage and reload the page
setTimeout(() => {
  let textarea = document.getElementById('notationArea');
  if (textarea.value == '' && localStorage['notation'] != undefined) {
    textarea.value = localStorage['notation'];
    setUpBoard();
  }

  // set event listener
  textarea.addEventListener('input', () => {
    console.log('textarea value is', textarea.value);
    localStorage['notation'] = textarea.value;
    console.log('now localStorage notation is', localStorage['notation']);
    window.location.reload();
  });

}, 100);

// set up color
if (localStorage.getItem('playAs') == null) {
  localStorage.setItem('playAs', 'white');
}
setTimeout(() => {
  if (localStorage.getItem('playAs') == 'white') playAsColor('white');
  else playAsColor('black');
  board = document.getElementById('board');
}, 100);

function playAsColor(color) { // 'white' or 'black'
  if (color != 'white' && color != 'black') throw new Error('color must be "white" or "black"');
  if (localStorage['playAs'] != color) {
    window.location.reload();
  };
  localStorage.setItem('playAs', color);
  document.getElementById(color).checked = true;
  document.getElementById('board').orientation = color;
}

// set toggle state
if (localStorage['skipMoves'] == null) {
  localStorage.setItem('skipMoves', 'false');
}
// setTimeout(() => {
//   toggleSkipMoves(localStorage['skipMoves']);
// }, 100);

function setSkipMoves(desiredState) {
  localStorage['skipMoves'] = desiredState;
}

// create moveTree nested dictionary and current branch
let game = new Chess();
let board;
let moveTree;
let currBranch; // shallow copy
let lastBranchingDict;
let previousBranchingDict = {};
let lastBranchingKey = '';
let gameOver = false;
let leftCounter = 0;
let move = '';
let numLeaves = 0;
let numLeavesVisited = 0;

document.onkeydown = function (e) {
  e = e || window.event;
  if (e.keyCode == '37') { // left arrow
    if (gameOver) return;
    leftCounter++;
    let gameLen = game.history({ verbose: true }).length;
    if (leftCounter > gameLen - 1) leftCounter = gameLen - 1;
    console.log('leftCounter', leftCounter);
    setPastPosition();
  } else if (e.keyCode == '39') { // right arrow
    if (gameOver) return;
    leftCounter--;
    if (leftCounter < 0) leftCounter = 0;
    setPastPosition();
  } else if (e.keyCode == '13') { // enter
    // enter
  }
}

function setPastPosition() {
  let gameHistory = game.history({ verbose: true });
  let relevantFen = game.history({ verbose: true })[gameHistory.length - 1 - leftCounter].after;
  console.log('relevantFen', relevantFen);
  document.querySelector('chess-board').setPosition(relevantFen);
  console.log(game.history({ verbose: true }));
}

// called when user goes through all branches successfully
function roundComplete() {
  console.log('round complete');
  game = new Chess();
  document.querySelector('chess-board').setPosition(game.fen());

  // find .info-bar and add replace the class 'regularText' with the class 'roundComplete'
  let infoText = document.querySelector('.info-bar');
  infoText.classList.remove('regularText');
  infoText.classList.add('roundComplete');
  gameOver = true;

  // find the .hint and add the gameOver class
  let hintButton = document.querySelector('.hint');
  hintButton.classList.add('gameOver');
}

function wrongMove() {
  console.log('wrong move');
  let infoText = document.querySelector('.info-bar');
  infoText.classList.remove('regularText');
  infoText.classList.add('displayWrongMove');
  setTimeout(() => {
    infoText.classList.remove('displayWrongMove');
    infoText.classList.add('regularText');
  }, 500);
}

function hint() {
  if (gameOver) return;
  let correctMove = makeMove(currBranch);
  let originalPosition = game.fen();
  game.move(correctMove);
  board.setPosition(game.fen());
  setTimeout(() => {
    game.load(originalPosition);
    board.setPosition(game.fen());
  }, 300);

}

async function computerMove() {
  await delay(100);
  // check if there are any moves left
  if (Object.keys(currBranch).length == 0) {
    roundComplete();
    return;
  }
  move = makeMove(currBranch);
  if (lastBranchingKey == '') lastBranchingKey = move;
  console.log('telling computer to play', move);
  game.move(move);
  board.setPosition(game.fen());
  if (Object.keys(currBranch).length > 1) {
    lastBranchingDict = currBranch;
    previousBranchingDict = currBranch;
    lastBranchingKey = move;
  }
  currBranch = currBranch[move];
  await delay(100);
}

async function playFirstMoves() {

  if (currBranch == undefined) {
    console.log('ERROR: currBranch is undefined');
    return;
  }

  // play all the moves with no alternatives
  while (Object.keys(currBranch).length == 1 && currBranch != previousBranchingDict) {
    await computerMove();
  }

  // update branching vars
  if (Object.keys(currBranch).length > 1) {
    lastBranchingDict = currBranch;
    previousBranchingDict = currBranch;
    lastBranchingKey = move;
  }

  // if it's the computer's move, make the branching move
  let whosMove = game.turn() == 'w' ? 'white' : 'black';
  if (localStorage.getItem('playAs') != whosMove) {
    await delay(500); // wait extra long before making branching move
    await computerMove();
    await delay(500);
  }
}

async function validateUserMove(userMove) {
  if (currBranch[userMove + '+'] != undefined) userMove += '+';
  if (currBranch[userMove + '#'] != undefined) userMove += '#';

  // check for moves like Nfd2 and Nfd2+ and Nfd2#
  let moveKeys = Object.keys(currBranch);
  for (let i = 0; i < moveKeys.length; i++) {
    if (moveKeys[i].length >= 4 && (moveKeys[i][0] + moveKeys[i].slice(2) == userMove || moveKeys[i][0] + moveKeys[i].slice(2, -1) == userMove)) {
      userMove = moveKeys[i];
      break;
      // check if contains '='
    } else if (moveKeys[i].includes('=') && moveKeys[i].slice(0, moveKeys[i].indexOf('=')) == userMove) {
      userMove = moveKeys[i];
      break;
    } else if (moveKeys[i].slice(0, 3) == 'O-O' && (userMove == 'Kg8' || userMove == 'Kg1')) {
      userMove = moveKeys[i];
      break;
    } else if (moveKeys[i].slice(0, 5) == 'O-O-O' && (userMove == 'Kc8' || userMove == 'Kc1')) {
      userMove = moveKeys[i];
      break;
    }
  } 

  // console.log('event called on userMove', userMove, 'with event object', e.detail);
  if (currBranch[userMove] == undefined) {
    console.log('invalid b/c', userMove, 'is not in currBranch, ', Object.keys(currBranch));
    wrongMove();
    leftCounter = 0;
    await delay(200);
    board.setPosition(game.fen());
    return '-';
  }
  if (lastBranchingKey == '') lastBranchingKey = userMove;
  if (Object.keys(currBranch).length > 1) {
    lastBranchingDict = currBranch;
    previousBranchingDict = currBranch;
    lastBranchingKey = userMove;
    console.log('lastBranchingDict set 5', lastBranchingDict)
  }
  console.log('now lastBranchingDict is', lastBranchingDict, 'and lastBranchingKey is', lastBranchingKey);
  return userMove;
}

function pruneMoveTree() {
  console.log('pruning', lastBranchingKey, 'from', lastBranchingDict)
  delete lastBranchingDict[lastBranchingKey];
  lastBranchingDict = moveTree;
  lastBranchingKey = '';
  currBranch = moveTree;
}

async function restartIfLeafIsReached() {
  if (Object.keys(currBranch).length != 0) return false;
  while (Object.keys(currBranch).length == 0) {
    numLeavesVisited++;
    let progressBar = document.getElementsByClassName('progress')[0];
    if (progressBar != undefined) {
      progressBar.style.width = '' + Math.ceil(numLeavesVisited / numLeaves * 100) + '%';
    }
    game = new Chess();
    board.setPosition(game.fen());
    currBranch = moveTree;

    // prune moveTree
    pruneMoveTree();

    // check if all branches have been played
    if (Object.keys(currBranch).length == 0) {
      roundComplete();
      return;
    }

    // let computer play first move(s) maybe
    if (localStorage['skipMoves'] == 'true') {
      await playFirstMoves();
    } else if (localStorage.getItem('playAs') == 'black') {
      console.log('about to play the only first move');
      await computerMove();
    }
  }
  return true;
}

const delay = ms => new Promise(res => setTimeout(res, ms));
async function setUpBoard() {
  console.log('calling setUpBoard w/ localstorage', localStorage['notation']);
  [moveTree, numLeaves] = createMoveTree();
  currBranch = moveTree; // shallow copy
  lastBranchingDict = moveTree;
  console.log('moveTree initially set to', moveTree);

  // load board
  await delay(100);
  const board = document.querySelector('chess-board');
  board.start();

  // let computer play the first move(s) maybe
  if (localStorage['skipMoves'] == 'true') {
    await playFirstMoves();
  } else if (localStorage.getItem('playAs') == 'black') {
    await computerMove();
  }

  // edge case where first branching move played by computer was the last move in the line
  await restartIfLeafIsReached();

  board.addEventListener('drop', async (e) => {
    // validate users move
    move = getMove(e.detail.newPosition, e.detail.oldPosition);
    try {
      move = await validateUserMove(move);
      if (move == '-') return;
    } catch(e) { console.log('error', e); }
    
    // play users move
    console.log('user move validated', move, 'currBranch is now', currBranch);
    game.move(move);
    currBranch = currBranch[move];

    // check if you've reached a leaf after the initial moves, after user's move, and after computer's response.
    if (!(await restartIfLeafIsReached())) {
      await computerMove();
    };
    await restartIfLeafIsReached();
  });
  
}
// setUpBoard(); // don't actually call until you've loaded moveTree.

class Toggle extends Component {
  constructor(props) {
    super(props);
    this.state = {
      toggle: this.props.toggle
    };
    this.toggleSelf = this.toggleSelf.bind(this);
  }

  toggleSelf() {
    this.setState({
      toggle: this.state.toggle == 'true' ? 'false' : 'true'
    }, () => {
      setSkipMoves(this.state.toggle);
    });
  }

  render() {
    return (
      <button className="skipMoves" onClick={this.toggleSelf}>
        Skip to first branch
        <FontAwesomeIcon className="toggle-icon" icon={this.state.toggle == 'true' ? faToggleOn : faToggleOff} />
      </button>
    );
  }
}


class ProgressBar extends Component {
  constructor(props) {
    super(props);
    console.log('progress bar props percentage:', this.props.percentage);
  }
  render() {
    return (
      <div className="progress-bar">
        <div className="progress"></div>
      </div>
    );
  }
}

class Sidebar extends Component {
  render() {
    return (
      <div className="sidebar">
        <h3>Theory Training!</h3>
        <div className="info-bar regularText"></div>
        <button className="hint" onClick={hint}>Hint</button>
        <textarea id="notationArea"></textarea>
        
        <div className="color-picker">
          Play as: 
          <label className="label-black">
            <input type="radio" name="color" value="" id="black" onClick={() => playAsColor('black')} />
          </label>
          <label className="label-white">
            <input type="radio" name="color" value="" id="white" onClick={() => playAsColor('white')} />
          </label>
        </div>
        <Toggle toggle={localStorage['skipMoves']} />
        <ProgressBar percentage={numLeavesVisited / numLeaves} />
      </div>
    );
  }
}

class App extends Component {

  render() {
    return (
      <div>
        <div className="App">
        <Helmet>
            <meta charSet="utf-8" />
            <title>Chess Helper</title>
            <link rel="canonical" href="../public/favicon.ico" />
            </Helmet>
        <chess-board 
          id="board"
          orientation="black"
          draggable-pieces>
        </chess-board>
        <Sidebar />
      </div>
      <div className="not-supported">
        <h1>Sorry, this app is not supported on your device.</h1>
      </div>
      </div>
      
    );
  }
}

export default App;
