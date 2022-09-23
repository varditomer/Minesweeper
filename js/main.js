'use strict'

//The Model
var gBoard = []

const gCell = {
    minesAroundCount: 4,
    isShown: false,
    isMine: false,
    isMarked: false
}

const gLevel = {
    SIZE: 4,
    MINES: 2,
    LEVEL: 'beginner'
}

var gGame
var gTimerInterval

const MINE_IMG = '<img src="images/mine.png" alt="mine">'
const MARKED_IMG = '<img src="images/marked.png" alt="marked">'
const LIFE = '❤ '
const HINT = '💡 '


//This is called when page loads
function initGame() {
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        isFirstClick: true,
        lifes: 3,
        hints: 3,
        isHintOn: false
    }
    updateCounter()

    // rendering life lines
    const elLife = document.querySelector('.life-panel') 
    renderLifeLine(gGame.lifes, elLife, LIFE)
    const elHint = document.querySelector('.hint-panel')
    renderLifeLine(gGame.hints,elHint, HINT)

    gBoard = buildBoard()
    setMinesNegsCount(gBoard)
    renderBoard(gBoard)
}

function buildBoard() {
    const board = createMat(gLevel.SIZE, gLevel.SIZE)
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            board[i][j] = { //each cell
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }
    insertMines(board)
    console.log(`board:`, board)
    return board
}

function insertMines(board) {
    var currPos = { i: 0, j: 0 }


    for (var i = 0; i < gLevel.MINES; i++) {
        currPos = getEmptyPos(board)
        board[currPos.i][currPos.j].isMine = true
    }
}

// Builds the board 
// Set mines at random locations
// Call setMinesNegsCount()
// Return the created board

// Count mines around each cell and set the cell's minesAroundCount.
function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (!board[i][j].isMine) board[i][j].minesAroundCount = countNegs(i, j, board)
        }
    }
}

//Render the board as a <table> to the page
function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr>\n`
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j]
            var currCellClass = getClassName({ i: i, j: j }) //cell-0-0
            currCellClass += (currCell.isMine) ? ' mine"' : ` number-${currCell.minesAroundCount}"`

            strHTML += '\t<td class="cell cell-' + gLevel.LEVEL + ' ' + currCellClass + ' onclick="cellClicked(' + 'this' + ',' + i + ',' + j + ')" oncontextmenu="cellMarked(' + 'event,' + 'this' + ',' + i + ',' + j + ')">\n'

            strHTML += '\t</td>\n'
        }
        strHTML += '</tr>\n'
    }
    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

function renderCell(elCell, cellContentImg = "") {
    elCell.innerHTML = `<span>${cellContentImg}</span>`
}

//Called when a cell (td) is clicked - leftMouseClick
function cellClicked(elCell, i, j) {
    //start timer with 1st click
    if (gGame.isFirstClick) handleGameStart()
    if (!gGame.isOn) return

    const currCell = gBoard[i][j]
    if (currCell.isMarked) return null
    if (currCell.isShown) return null

    //  update model
    currCell.isShown = true
    if (gGame.isHintOn) return handleHint(elCell, currCell, i, j)
    gGame.shownCount++

    //  update DOM
    var cellContentImg
    if (currCell.isMine) {
        // update model
        elCell.classList.add('mine-clicked')
        cellContentImg = MINE_IMG
        gGame.lifes--

        // update DOM
        const elLife = document.querySelector('.life-panel')
        renderLifeLine(gGame.lifes, elLife, LIFE)
        // renderElLife(gGame.lifes)

        if (!gGame.lifes) { //if no lifes left
            console.log(`gGame.lifes:`, gGame.lifes)
            hideElemet(elLife)
            revealAllMines()
            gameOver()
        }
    } else {
        if (!currCell.minesAroundCount) expandShown(gBoard, elCell, i, j)
        elCell.classList.add('cell-clicked')
        if (currCell.minesAroundCount) cellContentImg = currCell.minesAroundCount
    }
    renderCell(elCell, cellContentImg)
    isVictory()
}

//Called on right click to mark a cell
function cellMarked(ev, elCell, i, j) {
    if (gGame.isFirstClick) handleGameStart()
    ev.preventDefault()
    if (!gGame.isOn) return

    var currCell = gBoard[i][j]
    if (currCell.isShown && !currCell.isMine) return

    // update model: mark <=> unmark cell
    currCell.isMarked = !currCell.isMarked

    // update DOM
    if (currCell.isMarked) {
        gGame.markedCount++
        elCell.classList.add('marked')
        renderCell(elCell, MARKED_IMG)
    } else {
        gGame.markedCount--
        elCell.classList.remove('marked')
        renderCell(elCell, "")
    }
    updateCounter()
    isVictory()
}

function updateCounter() {
    document.querySelector('.counter-box').innerText = gLevel.MINES - gGame.markedCount
}


function revealAllMines() {
    const mines = document.querySelectorAll('.mine')
    for (var i = 0; i < mines.length; i++) {
        var elCurrMineCell = mines[i]
        renderCell(elCurrMineCell, MINE_IMG)
    }
}

function handleGameStart() {
    if (!gGame.isFirstClick) return
    gGame.isFirstClick = false
    gGame.isOn = true
    setTimer()
}

function gameOver() {
    console.log(`gTimerIntervalbeforecleare:`, gTimerInterval)
    clearInterval(gTimerInterval)
    console.log(`gTimerIntervalafter:`, gTimerInterval)
    gGame.isOn = false
    document.querySelector('.btn-start').innerText = '🤯'
}

function restartGame() {
    gGame.isFirstClick = true
    gGame.isOn = true
    document.querySelector('.btn-start').innerText = '😀'
    clearInterval(gTimerInterval)
    document.querySelector(".timer").innerHTML = '🧭'
    showElemet(document.querySelector('.life-panel'))
    initGame()
}

function onClickLvlSelect(elBtn, lvlId) {
    const elBtns = document.querySelectorAll('.btn-lvl')
    console.log(`elBtns:`, elBtns)
    for (var i = 0; i < elBtns.length; i++) {
        var currBtn = elBtns[i]
        if (currBtn.classList.contains('marked-lvl')) currBtn.classList.remove('marked-lvl')
        console.log(`currBtn:`, currBtn)
    }
    elBtn.classList.add('marked-lvl')
    console.log(`elBtn:`, elBtn)

    switch (lvlId) {
        case 'Beginner':
            gLevel.SIZE = 16 ** 0.5
            gLevel.MINES = 2
            gLevel.LEVEL = 'beginner'
            break;
        case 'Medium':
            gLevel.SIZE = 64 ** 0.5
            gLevel.MINES = 14
            gLevel.LEVEL = 'medium'
            break;
        case 'Expert':
            gLevel.SIZE = 144 ** 0.5
            gLevel.MINES = 32
            gLevel.LEVEL = 'expert'
            break;

        default:
            break;
    }
    initGame()
}

function expandShown(board, elCell, IdxI, Idxj) {
    for (var i = IdxI - 1; i <= IdxI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = Idxj - 1; j <= Idxj + 1; j++) {
            if (j < 0 || j >= board[0].length) continue
            if (i === IdxI && j === Idxj) continue //if it's the clicked cell continue
            console.log(`j:`, j)

            // Model:
            if (!gGame.isHintOn && !board[i][j].isShown) gGame.shownCount++
            board[i][j].isShown = true
            // Dom:
            var elCell = document.querySelector(`.cell-${i}-${j}`)
            if (board[i][j].isMine) {
                renderCell(elCell, MINE_IMG)
                continue
            } else {
                if(board[i][j].minesAroundCount) renderCell(elCell, board[i][j].minesAroundCount)
                else renderCell(elCell, '')
                elCell.classList.add('cell-clicked')
            }
            
        }
    }
}

function closedShown(board, elCell, IdxI, Idxj) {
    for (var i = IdxI - 1; i <= IdxI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = Idxj - 1; j <= Idxj + 1; j++) {
            if (j < 0 || j >= board[0].length) continue
            // Model:
            board[i][j].isShown = false
            // Dom:
            var elCell = document.querySelector(`.cell-${i}-${j}`)
            elCell.classList.remove('cell-clicked')
            renderCell(elCell, '')
        }
    }
}

function countNegs(cellIdxI, cellIdxJ, board) {
    var negsCount = 0
    for (var i = cellIdxI - 1; i <= cellIdxI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = cellIdxJ - 1; j <= cellIdxJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            if (board[i][j].isMine) negsCount++
        }
    }
    return negsCount
}

function isVictory() {
    if (gGame.markedCount > gLevel.MINES) return
    if (gGame.shownCount + gGame.markedCount === gLevel.SIZE ** 2) setVictory()
}

function setVictory() {
    gGame.isOn = false
    document.querySelector('.btn-start').innerText = '😎'
    clearInterval(gTimerInterval)
}

function setTimer() {
    gGame.isFirstClick = false
    gGame.secsPassed = 0
    gTimerInterval = setInterval(startTimer, 1000)
}

function startTimer() {
    gGame.secsPassed++
    document.querySelector(".timer").innerHTML = gGame.secsPassed;
}



function onHintClick() {
    if (gGame.isHintOn) return
    gGame.isHintOn = true
}

function handleHint(elCell, currCell, i, j) {
    elCell.classList.add('cell-clicked')
    var cellContentImg
    if (currCell.isMine) cellContentImg = MINE_IMG
    else { cellContentImg = (currCell.minesAroundCount) ? currCell.minesAroundCount : "" }
    renderCell(elCell, cellContentImg)
    expandShown(gBoard, elCell, i, j)

    setTimeout(function () {
        closedShown(gBoard, elCell, i, j)
        gGame.isHintOn = false
        gGame.hints--
        // update DOM
        const elHint = document.querySelector('.hint-panel')
        if (!gGame.hints) hideElemet(elHint)
        else renderLifeLine(gGame.hints, elHint, HINT)
    }, 2000);
}

function renderLifeLine(lifeLinesLeft, elLifeLine, lifeLineStr) {
    // updated DOM
    const updatedLifeLineStr = lifeLineStr.repeat(lifeLinesLeft)
    elLifeLine.innerText = updatedLifeLineStr
    showElemet(elLifeLine)
}

//get empty pos by trying rand poses
function getEmptyPos(board) {
    var emptyPos = { i: 0, j: 0 }
    emptyPos.i = +getRandomIntInclusive(0, gLevel.SIZE - 1)
    emptyPos.j = +getRandomIntInclusive(0, gLevel.SIZE - 1)

    while (board[emptyPos.i][emptyPos.j].isMine) {
        emptyPos.i = getRandomIntInclusive(0, gLevel.SIZE - 1)
        emptyPos.j = getRandomIntInclusive(0, gLevel.SIZE - 1)
    }
    return emptyPos
}

//disable the right mouse click contextmenu
document.querySelector('.table-container').addEventListener(
    'contextmenu',
    (e) => {
        e.preventDefault()
    }, false
)

document.body.oncontextmenu = function (e) {
    return false
}