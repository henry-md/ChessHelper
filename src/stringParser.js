
import { Chess } from 'chess.js';
const game = new Chess();

let practiceStr = 
        `1. e4 e5 2. Nf3 Nf6 3. Bc4 Nxe4 4. Nxe5 d5 5. Bb3 
        ( 5. Qf3 ) 
        ( 5. Bd3 ) 
        ( 5. Bb5+ ) 
        ( 5. Nxf7 Qe7 6. Bxd5 ( 6. O-O Qxf7 7. Bb3 Nc5 8. Re1+ Be7 9. d4 Nxb3 10. axb3 O-O ) 6... Ng3+ 7. Qe2 Qxe2# ) 
        5... Qg5 6. O-O 
        ( 6. Nc3 Nxc3 7. dxc3 Qxe5+ ) 
        ( 6. d4 Qxg2 7. Rf1 ( 7. Qf3 Qxf3 8. Nxf3 Be6 ) 7... Bh3 8. Qe2 Qxf1+ ) 
        ( 6. Qf3 Qxe5 7. O-O ( 7. d3 Bb4+ 8. c3 Nxc3+ 9. Be3 Nxb1+ 10. Ke2 Qxb2+ 11. Bd2 Qxd2+ 12. Kf1 Qe1# ) 7... Bd6 8. g3 ( 8. Re1 Qxh2+ 9. Kf1 O-O 10. Bxd5 Ng5 11. Qb3 Qh1+ 12. Ke2 Re8+ 13. Kd3 ) 8... O-O 9. Re1 Ng5 ) 
        ( 6. Nxf7 Qxg2 7. Rf1 ( 7. Nxh8 Qxf2# ) 7... Nc6 8. Bxd5 ( 8. Nxh8 Bh3 9. Qe2 Nd4 ) ( 8. Qh5 Bg4 9. Nd6+ ( 9. Qxd5 Bc5 10. d4 Nxd4 11. Be3 Nf3+ 12. Ke2 Nfd2+ 13. Kd3 Qxf1# ) 9... Kd7 10. Qf7+ Ne7 11. Nxb7 Bh3 ) ( 8. d3 Bh3 9. Qe2 Nd4 ) 8... Nd4 9. Ne5 ( 9. d3 Nf3+ 10. Ke2 Bg4 11. Bxe4 ( 11. Ke3 Nxh2 12. Bxe4 Nxf1+ 13. Kd4 Qxf2+ 14. Kc3 Qc5+ 15. Kb3 Qb4# ) 11... Nxh2+ 12. Kd2 Nxf1+ 13. Kc3 Qxf2 14. Qxg4 Qc5+ 15. Kb3 Qb4# ) ( 9. f3 Be7 ) ( 9. Nxh8 Bg4 10. f3 Be7 ) 9... Bh3 ) 
        ( 6. Nf3 Qxg2 7. Rf1 ( 7. Rg1 Qxf2# ) 7... Bg4 8. Bxd5 Bxf3 9. Bxe4 Bxe4 10. Qe2 Be7 ) 
        6... Qxe5 7. d3 
        ( 7. Re1 Bc5 8. d3 ( 8. d4 Bxd4 9. Be3 Bxb2 10. Bxd5 Bxa1 11. Bxe4 O-O ) ( 8. Re2 Bg4 9. Rxe4 Qxe4 10. Qf1 ) ( 8. Qf3 O-O 9. d3 Bg4 10. Qxg4 Nxf2 11. Rxe5 ( 11. Kf1 Qxe1+ ) 11... Nxg4+ 12. Kf1 Nxe5 ) ( 8. Qe2 Qf5 9. d3 Bxf2+ 10. Kh1 Bxe1 11. Qxe1 Qf2 ) 8... Bxf2+ 9. Kh1 ( 9. Kf1 Qxh2 10. dxe4 Qg1+ 11. Ke2 Bxe1 12. Qxe1 Bg4+ 13. Kd2 Qd4# ) 9... Ng3+ 10. hxg3 Qxe1+ 11. Qxe1+ Bxe1 ) 
        ( 7. d4 Qd6 8. c4 c6 ) 
        7... Nxf2 8. Rxf2 
        ( 8. Re1 Nxd1 9. Rxe5+ Be6 10. Bxd5 Nd7 11. Re1 Bc5+ 12. Kf1 Nf2 ) 
        ( 8. Kxf2 Bc5+ 9. Kf3 Qh5+ 10. Kg3 Qg6+ 11. Kf4 ( 11. Kf3 Qg4# ) 11... O-O ) 
        8... Bc5 9. Nc3 Bxf2+ 10. Kxf2 c6 `;
practiceStr = 
    `1. e4 e5 2. Ke2 
    ( 2. Nf3 Nc6 3. Bc4 Bc5 ) 
    2... Ke7 `;
let practiceMoves = practiceStr.split(' ');
// filter out empty strings, new lines, and numbers
practiceMoves = practiceMoves.filter(move => move !== '' && move !== '\n' && !Number(move[0]));

function createMoveTree() {
    // practiceStr = thisPracticeStr;
    let treeDict = {}
    applyListToDict(0, practiceMoves.length - 1, treeDict);
    // console.log('this particular tree:', treeDict['e4']['e5']['Nf3']['Nf6']['Bc4']['Nxe4']['Nxe5']['d5']['Bb3']['Qg5']['Qf3']['Qxe5']['d3'])
    return treeDict;
    
}
createMoveTree();

function applyListToDict(i, j, dict) { // inclusive bounds
    // base case
    if (i > j) return;

    // add to dict
    // console.log('i', i, 'practiceMoves[i]', practiceMoves[i], 'dict', dict);
    dict[practiceMoves[i]] = {};
    let recursedTree = dict[practiceMoves[i]];

    // recurse multiple times if necessary
    while (i + 1 < practiceMoves.length && practiceMoves[i + 1][0] == '(') {
        // get everything between parentheses
        let recurseCount = 1, k = i+2;
        while (k <= j) {
            if (practiceMoves[k][0] == '(') recurseCount++;
            if (practiceMoves[k][0] == ')') recurseCount--;
            if (recurseCount == 0) {
                // console.log('recursive sequence found', practiceMoves.slice(i+2, k)); // exclusive upper bound
                applyListToDict(i + 2, k - 1, dict);
                i = k;
                break;
            }
            k++;
        }
    };

    // continue down line
    // console.log('i', i, 'practiceMoves[i]', practiceMoves[i], 'dict', dict);
    applyListToDict(i + 1, j, recursedTree);
}

function makeMove(branch) {
    let keys = Object.keys(branch);
    return keys[Math.floor(Math.random()*keys.length)];
}

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