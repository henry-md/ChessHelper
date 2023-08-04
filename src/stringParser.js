
import { Chess } from 'chess.js';
const game = new Chess();

let practiceMoves;

// create move tree from localStorage['notation']. Read from local storage rather than input
// so that the page can be refreshed without loss of data. Uses applyListToDict.
function createMoveTree() {
    let practiceStr = localStorage['notation'];
    if (practiceStr == undefined) {
        console.log('practiceStr is undefined');
        return;
    }
    console.log('practiceStr', practiceStr);
    practiceMoves = practiceStr.split(' ');
    // filter out empty strings, new lines, and anything containing a number or a period
    practiceMoves = practiceMoves.filter(move => move !== '' && move !== '\n' && !Number(move[0]) && !move.includes('.'));
    // replace any element that contains an opening parenthases with an opening parenthases
    for (let i = 0; i < practiceMoves.length; i++) {
        if (practiceMoves[i].includes('(')) {
            practiceMoves[i] = '(';
        }
    }
    let treeDict = {}
    let numLeaves = practiceStr.split('(').length;
    applyListToDict(0, practiceMoves.length - 1, treeDict);
    return [treeDict, numLeaves];
    
}
createMoveTree();

// recursive function that applies all moves in practiceMoves[i:j] to dict.
function applyListToDict(i, j, dict) { // inclusive bounds
    // base case
    if (i > j) return;

    // add first move to dict
    dict[practiceMoves[i]] = {};
    let recursedTree = dict[practiceMoves[i]];

    // get any sub-variation of the first move
    while (i + 1 < practiceMoves.length && practiceMoves[i + 1][0] == '(') {
        // find where the parenthases finall cancel and you're out of the sub-variation
        // recurseCount tracks the parenthases, k is the idx. [i] is the first move, [i + 1] is '(', so start at i + 2.
        let recurseCount = 1, k = i+2;
        while (k <= j) {
            if (practiceMoves[k][0] == '(') recurseCount++;
            if (practiceMoves[k][0] == ')') recurseCount--;
            if (recurseCount == 0) {
                // apply subvarations to the first move & inc i to move past the subvariation
                applyListToDict(i + 2, k - 1, dict);
                i = k;
                break;
            }
            k++;
        }
    };

    // recurse to next move
    applyListToDict(i + 1, j, recursedTree);
}

// returns random child (i.e. move) from dict representing a move tree
function makeMove(branch) {
    let keys = Object.keys(branch);
    return keys[Math.floor(Math.random()*keys.length)];
}

// return move notation like 'Nf3' based on jank dict format the board package returns
function getMove(newDict, oldDict) {
    let fromSquare = '', toSquare = '', pieceAbbrev = '';
    // console.log('newDict', newDict);
    for (let square in newDict) {
        if (oldDict[square] !== newDict[square]) {
            toSquare = square;
        }
    }
    for (let square in oldDict) {
        if (newDict[square] == undefined) {
            fromSquare = square;
        }
    }
    pieceAbbrev = oldDict[fromSquare][1];

    // consider capture & en passant
    if (oldDict[toSquare] != undefined) {
        if (pieceAbbrev == 'P') return fromSquare[0] + 'x' + toSquare; // capture
        else return pieceAbbrev + 'x' + toSquare;
    } else if (pieceAbbrev == 'P' && fromSquare[0] !== toSquare[0]) { // en passant
        return fromSquare[0] + 'x' + toSquare;
    } else {
        return (pieceAbbrev == 'P' ? '' : pieceAbbrev) + toSquare; // non-capture
    }
}

// export functions
export { createMoveTree, makeMove, getMove}