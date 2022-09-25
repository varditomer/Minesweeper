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
var gMegaHint
var gTimerInterval

// EMOJIS
const gEmojis = {
    START: '😀',
    VICTORY: '😎',
    LOSE: '🤯',
    UNAUTHORIZED_CLICK: '😲',
    TIMER: '🕓'
}

const gLifeLinesEmojis = {
    LIFE: '❤ ',
    HINT: '💡 ',
    SAFE_CLICK: '👍 '
}


// In game elements images
const MINE_IMG = '<img src="images/mine.png" alt="mine">'
const MARKED_IMG = '<img src="images/marked.png" alt="marked">'

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
        safeClicks: 3,
        isHintOn: false,
        isDarkMode: true,
        isMineExterminatorUsed: false,
        minesPoses: []
    }
    gMegaHint = {
        i1: 0,
        j1: 0,
        i2: 0,
        j2: 0,
        isFirstClick: true,
        isOn: false,
        isUsed: false
    }
    updateCounter()
    // rendering life lines
    renderLifeLine(gGame.lifes, document.querySelector('.life-panel'), gLifeLinesEmojis.LIFE)
    renderLifeLine(gGame.hints, document.querySelector('.hint-panel'), gLifeLinesEmojis.HINT)
    renderLifeLine(gGame.hints, document.querySelector('.safe-clicks-left'), gLifeLinesEmojis.SAFE_CLICK)

    gBoard = buildBoard()
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
    // insertMines(board)
    console.log(`board:`, board)
    return board
}

//Render the board as a <table> to the page
function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr>\n`
        for (var j = 0; j < board[0].length; j++) {
            var currCellClass = getClassName({ i: i, j: j }) //cell-0-0
            strHTML += '\t<td class="cell cell-' + gLevel.LEVEL + ' ' + currCellClass + '"' + ' onclick="cellClicked(' + 'this' + ',' + i + ',' + j + ')" oncontextmenu="cellMarked(' + 'event,' + 'this' + ',' + i + ',' + j + ')">\n'

            strHTML += '\t</td>\n'
        }
        strHTML += '</tr>\n'
    }
    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
    console.log(`elBoard.innerHTML:`, elBoard.innerHTML)
}

function renderCell(elCell, cellContentImg = "") {
    elCell.innerHTML = `<span>${cellContentImg}</span>`
}

//Called when a cell (td) is clicked - leftMouseClick
function cellClicked(elCell, i, j) {
    //start timer with 1st click
    if (gGame.isFirstClick) return handleFirstClick(elCell, i, j, 'cell-clicked')
    if (!gGame.isOn) return

    const currCell = gBoard[i][j]
    if (currCell.isMarked) return unauthorizedClick()
    if (currCell.isShown) return unauthorizedClick()

    //  update model
    currCell.isShown = true
    if (gGame.isHintOn) return handleHint(elCell, currCell, i, j)
    if (gMegaHint.isOn) return handleMegaHint(elCell, currCell, i, j)
    gGame.shownCount++

    //  update DOM
    var cellContentImg
    if (currCell.isMine) {
        // update model:
        elCell.classList.add('mine-clicked')
        cellContentImg = MINE_IMG
        gGame.lifes--

        // update DOM:
        const elLife = document.querySelector('.life-panel')
        if (!gGame.lifes) return gameOver(elLife)
        else renderLifeLine(gGame.lifes, elLife, gLifeLinesEmojis.LIFE)

    } else { //not a mine
        elCell.classList.add('cell-clicked')
        if (!currCell.minesAroundCount) expandShown(gBoard, elCell, i, j)
        else cellContentImg = currCell.minesAroundCount
    }
    renderCell(elCell, cellContentImg)
    isVictory()
}

//Called on right click to mark a cell
function cellMarked(ev, elCell, i, j) {
    if (gGame.isFirstClick) handleFirstClick(elCell, i, j, 'marked')
    ev.preventDefault()
    if (!gGame.isOn) return

    var currCell = gBoard[i][j]
    if (currCell.isShown) return unauthorizedClick()

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

function unauthorizedClick() {
    document.querySelector('.btn-start').innerText = gEmojis.UNAUTHORIZED_CLICK
    setTimeout(function () {
        document.querySelector('.btn-start').innerText = gEmojis.START
    }, 300);
}

function handleFirstClick(elCell, i, j, clickTypeStr) {
    if (!gGame.isFirstClick) return
    gGame.isFirstClick = false
    gGame.isOn = true
    cursorToPointer(document.querySelector('.hint-panel'))
    cursorToPointer(document.querySelector('.mega-hint-panel'))
    cursorToPointer(document.querySelector('.safe-click-panel'))
    cursorToPointer(document.querySelector('.mine-exterminator-panel'))
    const firstCell = { i: i, j: j }
    // update model:
    firstCell.minesAroundCount = 0
    if (clickTypeStr === 'marked') {
        gBoard[i][j].isMarked = true
        gGame.markedCount++
        // update DOM:
        elCell.classList.add('marked')
        console.log(`MARKED_IMG:`, MARKED_IMG)
        console.log(`1111:`)
    } else {
        gBoard[i][j].isShown = true
        gGame.shownCount++
        // update DOM:
        elCell.classList.add('cell-clicked')
        renderCell(elCell, '')
    }
    elCell.classList.add('number-0')
    insertMines(gBoard, firstCell)
    setMinesNegsCount(gBoard, firstCell)
    renderBoardAfterFirst(gBoard, firstCell)
    if (clickTypeStr !== 'marked') expandShown(gBoard, elCell, firstCell.i, firstCell.j)
    if (clickTypeStr === 'marked') renderCell(elCell, `<img src="images/marked.png" alt="marked">`)

    setTimer()
}

function insertMines(board, firstCell) {
    var currPos = { i: 0, j: 0 }
    for (var i = 0; i < gLevel.MINES; i++) {
        currPos = getEmptyPos(board, firstCell)
        board[currPos.i][currPos.j].isMine = true
    }
}

//get empty pos by trying rand poses
function getEmptyPos(board, firstCell) {
    var emptyPos = { i: 0, j: 0 }
    emptyPos.i = +getRandomIntInclusive(0, gLevel.SIZE - 1)
    emptyPos.j = +getRandomIntInclusive(0, gLevel.SIZE - 1)

    while (board[emptyPos.i][emptyPos.j].isMine ||
        (emptyPos.i === firstCell.i && emptyPos.j === firstCell.j) ||
        (Math.abs(emptyPos.i - firstCell.i) + Math.abs(emptyPos.j - firstCell.j)) <= 2) {
        emptyPos.i = getRandomIntInclusive(0, gLevel.SIZE - 1)
        emptyPos.j = getRandomIntInclusive(0, gLevel.SIZE - 1)
        if ((Math.abs(emptyPos.i - firstCell.i) === 0 && Math.abs(emptyPos.j - firstCell.j) === 2) || ((Math.abs(emptyPos.i - firstCell.i) === 2 && Math.abs(emptyPos.j - firstCell.j) === 0))) break
    }
    return emptyPos
}

///////
// Count mines around each cell and set the cell's minesAroundCount.
function setMinesNegsCount(board, firstCell) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (i === firstCell.i && j === firstCell.j) continue
            if (!board[i][j].isMine) board[i][j].minesAroundCount = countNegs(i, j, board, firstCell)
        }
    }
}

function countNegs(cellIdxI, cellIdxJ, board, firstCell) {
    var negsCount = 0
    for (var i = cellIdxI - 1; i <= cellIdxI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = cellIdxJ - 1; j <= cellIdxJ + 1; j++) {
            if (i === firstCell.i && j === firstCell.j) continue
            if (j < 0 || j >= board[i].length) continue
            if (board[i][j].isMine) negsCount++
        }
    }
    return negsCount
}

function renderBoardAfterFirst(board, firstCell) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j]
            if (i === firstCell.i && j === firstCell.j) continue
            const currCellClass = (currCell.isMine) ? 'mine' : `number-${currCell.minesAroundCount}`
            document.querySelector(`.cell-${i}-${j}`).classList.add(currCellClass)
        }
    }
}

function gameOver(elLife) {
    hideElemet(elLife)
    revealAllMines()
    clearInterval(gTimerInterval)
    gGame.isOn = false
    document.querySelector('.btn-start').innerText = gEmojis.LOSE
}

function revealAllMines() {
    const mines = document.querySelectorAll('.mine')
    for (var i = 0; i < mines.length; i++) {
        var elCurrMineCell = mines[i]
        renderCell(elCurrMineCell, MINE_IMG)
    }
}

function onClickStart() {
    gGame.isFirstClick = true
    gGame.isOn = true
    cursorToNotAllowed(document.querySelector('.hint-panel'))
    cursorToNotAllowed(document.querySelector('.mega-hint-panel'))
    document.querySelector('.btn-start').innerText = gEmojis.START
    clearInterval(gTimerInterval)
    document.querySelector(".timer").innerHTML = gEmojis.TIMER
    showElemet(document.querySelector('.life-panel'))
    initGame()
}

// if not a mine cell has no mines around - show his 1st degree negs (and marked them)
// also if hint was on - show cell's first degree negs
function expandShown(board, elCell, IdxI1, Idxj1, IdxI2 = IdxI1, Idxj2 = Idxj1) {
    for (var i = IdxI1 - 1; i <= IdxI2 + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = Idxj1 - 1; j <= Idxj2 + 1; j++) {
            if (j < 0 || j >= board[0].length) continue
            if (!gMegaHint.isOn && (i === IdxI1 && j === Idxj1)) continue
            // if (i === IdxI1 && j === Idxj1) continue //if it's the clicked cell continue

            // update model: (don't update shownCount if hint is on)
            if ((!gGame.isHintOn && !gMegaHint.isOn) && !board[i][j].isShown) {
                gGame.shownCount++
                if (board[i][j].isMarked) { //if not a mine cell was marked
                    board[i][j].isMarked = false
                    gGame.markedCount--
                    // update DOM
                    updateCounter()
                    document.querySelector(`.cell-${i}-${j}`).classList.remove('marked')
                }
            }
            board[i][j].isShown = true

            // update DOM:
            var elCell = document.querySelector(`.cell-${i}-${j}`)
            elCell.classList.add('cell-clicked')

            if ((gGame.isHintOn || gMegaHint.isOn) && board[i][j].isMine) { //only relevant when hint is on:
                renderCell(elCell, MINE_IMG)
                continue
            } else {
                if (board[i][j].minesAroundCount) renderCell(elCell, board[i][j].minesAroundCount)
                else renderCell(elCell, '')
            }

        }
    }
}

function closedShown(board, elCell, IdxI1, Idxj1, IdxI2 = IdxI1, Idxj2 = Idxj1) {
    for (var i = IdxI1 - 1; i <= IdxI2 + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = Idxj1 - 1; j <= Idxj2 + 1; j++) {
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

function isVictory() {
    if (gGame.markedCount > gLevel.MINES) return
    if (gGame.shownCount + gGame.markedCount === gLevel.SIZE ** 2) setVictory()
}

function setVictory() {
    gGame.isOn = false
    document.querySelector('.btn-start').innerText = gEmojis.VICTORY
    clearInterval(gTimerInterval)
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

function onSafeClick() {
    if (!gGame.isOn) return unauthorizedClick()
    if (!gGame.safeClicks) return unauthorizedClick()
    const safePos = getSafePos()
    const elCell = document.querySelector((`.cell-${safePos.i}-${safePos.j}`))
    if (gBoard[safePos.i][safePos.j].isMarked) renderCell(elCell, '')
    elCell.classList.add('safe-cell')
    elCell.innerText = '👍'
    setTimeout(function () {
        elCell.innerText = ''
        elCell.classList.remove('safe-cell')
        if (gBoard[safePos.i][safePos.j].isMarked) renderCell(elCell, MARKED_IMG)
        gGame.safeClicks--
        const elSafeClick = document.querySelector('.safe-clicks-left')
        if (!gGame.safeClicks) cursorToNotAllowed(document.querySelector('.safe-click-panel'))

        renderLifeLine(gGame.safeClicks, elSafeClick, gLifeLinesEmojis.SAFE_CLICK)
    }, 2000);
}

function getSafePos() {
    var safePos = { i: 0, j: 0 }
    safePos.i = +getRandomIntInclusive(0, gLevel.SIZE - 1)
    safePos.j = +getRandomIntInclusive(0, gLevel.SIZE - 1)

    while (gBoard[safePos.i][safePos.j].isMine ||
        gBoard[safePos.i][safePos.j].isShown) {
        safePos.i = getRandomIntInclusive(0, gLevel.SIZE - 1)
        safePos.j = getRandomIntInclusive(0, gLevel.SIZE - 1)
    }
    return safePos
}

function onMineExterminatorClick() {
    if (!gGame.isOn) return unauthorizedClick()
    if (gLevel.MINES <= 3) return unauthorizedClick()
    console.log(`gBoard1:`, gBoard)
    for (var i = 0; i < 3; i++) {
        var currMinePose = getRandMinePos()
        console.log(`currMinePose:`, currMinePose)
        gBoard[currMinePose.i][currMinePose.j].isMine = false
        gGame.MINES--
        var elCurrMineCell = document.querySelector((`.cell-${currMinePose.i}-${currMinePose.j}`))
        elCurrMineCell.classList.remove('mine')
    }
    console.log(`gGame.minesPoses:`, gGame.minesPoses)
    console.log(`gBoard2:`, gBoard)
    setMinesNegsCount(gBoard, { i: -1, j: -1 })
    renderBoardAfterFirst(gBoard, { i: -1, j: -1 })
    console.log(`gBoard3:`, gBoard)
}

function getRandMinePos() {
    var currMinePose = { i: 0, j: 0 }
    currMinePose.i = +getRandomIntInclusive(0, gLevel.SIZE - 1)
    currMinePose.j = +getRandomIntInclusive(0, gLevel.SIZE - 1)
    var isAlreadyExist = true

    while (!gBoard[currMinePose.i][currMinePose.j].isMine && isAlreadyExist) {
        currMinePose.i = getRandomIntInclusive(0, gLevel.SIZE - 1)
        currMinePose.j = getRandomIntInclusive(0, gLevel.SIZE - 1)
        if (!gGame.minesPoses.length && gBoard[currMinePose.i][currMinePose.j].isMine) {
            console.log(`currMinePose1:`, currMinePose)
            gGame.minesPoses.push(currMinePose)
            return currMinePose
        }
        for (var i = 0; i < gGame.minesPoses.length; i++) {
            if (gGame.minesPoses[i].i === currMinePose.i && gGame.minesPoses[i].j === currMinePose.j) continue
            else {
                console.log(`currMinePose2:`, currMinePose)
                gGame.minesPoses.push(currMinePose)
                return currMinePose
            }
        }
        isAlreadyExist = true
    }
    console.log(`gGame.minesPoses123:`, gGame.minesPoses)
}

function onHintClick(el) {
    if (!gGame.isOn) return unauthorizedClick()
    if (gGame.isHintOn) return unauthorizedClick()
    if (gGame.isFirstClick) return unauthorizedClick()
    if (el.classList.contains('hint-panel')) return gGame.isHintOn = true
    else {
        if (!gMegaHint.isFirstClick) return unauthorizedClick()
        if (gMegaHint.isUsed) return unauthorizedClick()
        gMegaHint.isOn = true
    }
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
        else renderLifeLine(gGame.hints, elHint, gLifeLinesEmojis.HINT)
    }, 2000);
}

function handleMegaHint(elCell, currCell, i, j) {
    elCell.classList.add('cell-clicked')
    var cellContentImg
    if (currCell.isMine) cellContentImg = MINE_IMG
    else { cellContentImg = (currCell.minesAroundCount) ? currCell.minesAroundCount : "" }
    renderCell(elCell, cellContentImg)

    if (gMegaHint.isFirstClick) {
        gMegaHint.i1 = i
        gMegaHint.j1 = j
        gMegaHint.isFirstClick = false
        return
    }
    gMegaHint.i2 = i
    gMegaHint.j2 = j

    expandShown(gBoard, elCell, gMegaHint.i1 + 1, gMegaHint.j1 + 1, gMegaHint.i2 - 1, gMegaHint.j2 - 1)
    setTimeout(function () {
        closedShown(gBoard, elCell, gMegaHint.i1 + 1, gMegaHint.j1 + 1, gMegaHint.i2 - 1, gMegaHint.j2 - 1)
        gMegaHint.isOn = false
        gMegaHint.isUsed = true

        // update DOM
        const elHint = document.querySelector('.mega-hint-panel')
    }, 2000);
}

function onClickDarkMode() {
    gGame.isDarkMode = !gGame.isDarkMode
    document.querySelector('.dark-mode-emoji').innerText = (gGame.isDarkMode) ? '🌗' : '🌞'
    toggleDarkModeStyle()

}

function renderLifeLine(lifeLinesLeft, elLifeLine, lifeLineStr) {
    // updated DOM
    const updatedLifeLineStr = lifeLineStr.repeat(lifeLinesLeft)
    elLifeLine.innerText = updatedLifeLineStr
    showElemet(elLifeLine)
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

function updateCounter() {
    document.querySelector('.counter-box').innerText = gLevel.MINES - gGame.markedCount
}

function toggleDarkModeStyle() {
    const elBody = document.querySelector('body')
    const elLvlBtns = document.querySelectorAll('.btn-lvl')
    console.log(`gGame.isDarkMode:`, gGame.isDarkMode)
    if (gGame.isDarkMode) {
        elBody.style.color = 'white'
        elBody.style.backgroundColor = 'rgb(49, 49, 49)'
        for (var i = 0; i < elLvlBtns.length; i++) {
            elLvlBtns[i].style.color = 'white'
            elLvlBtns[i].backgroundColor = 'rgb(49, 49, 49)'
        }
        const elGlowBtns = document.querySelectorAll('.glow-on-hover-light')
        for (var i = 0; i < elGlowBtns.length; i++) {
            elGlowBtns[i].classList.remove('glow-on-hover-light')
            elGlowBtns[i].classList.add('glow-on-hover-dark')
        }
    } else {
        elBody.style.color = 'black'
        elBody.style.backgroundColor = 'white'
        for (var i = 0; i < elLvlBtns.length; i++) {
            elLvlBtns[i].style.color = 'black'
            elLvlBtns[i].backgroundColor = 'white'
        }
        const elGlowBtns = document.querySelectorAll('.glow-on-hover-dark')
        for (var i = 0; i < elGlowBtns.length; i++) {
            elGlowBtns[i].classList.remove('glow-on-hover-dark')
            elGlowBtns[i].classList.add('glow-on-hover-light')
        }
    }
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