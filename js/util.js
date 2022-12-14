//show || hide element
function showElemet(el) {
    if(el.classList.contains('hide')) el.classList.remove('hide')
    el.classList.add('show')
}

function hideElemet(el) {
    if(el.classList.contains('show')) el.classList.remove('show')
    el.classList.add('hide')
}

function cursorToPointer(el) {
    el.style.cursor = 'pointer'
}
function cursorToNotAllowed(el) {
    el.style.cursor = 'not-allowed'
}

//create mat
function createMat(ROWS, COLS) {
    var mat = []
    for (var i = 0; i < ROWS; i++) {
        var row = []
        for (var j = 0; j < COLS; j++) {
            row.push('')
        }
        mat.push(row)
    }
    return mat
}

//get cell className
function getClassName(location) {
    var cellClass = 'cell-' + location.i + '-' + location.j
    return cellClass
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
  }

