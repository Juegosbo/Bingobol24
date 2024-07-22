document.addEventListener('DOMContentLoaded', () => {
    const masterBoardContainer = document.getElementById('masterBoardContainer');
    const bingoBoardsContainer = document.getElementById('bingoBoardsContainer');
    const resetGameBtn = document.getElementById('resetGame');
    const clearMarksBtn = document.getElementById('clearMarks');
    const nameCardsBtn = document.getElementById('nameCards');
    const searchBox = document.getElementById('searchBox');
    const searchButton = document.getElementById('searchButton');
    const winnerButton = document.getElementById('winnerButton');
    const winnerVideoContainer = document.getElementById('winnerVideoContainer');
    const winnerVideo = document.getElementById('winnerVideo');
    const closeVideoButton = document.getElementById('closeVideo'); // Referencia del botón de cierre
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const currentPageSpan = document.getElementById('currentPage');
    const totalPagesSpan = document.getElementById('totalPages');
    const selectFigure = document.getElementById('selectFigure');
    const figurePreviewContainer = document.getElementById('figurePreviewContainer');
    const figurePreview = document.getElementById('figurePreview');
    const printButton = document.getElementById('printButton');

    // Evento de clic para cerrar el videoS
    closeVideoButton.addEventListener('click', () => {
        winnerVideoContainer.style.display = 'none';
        winnerVideo.pause(); // Pausar el video
    });

    const boardsPerPage = 9;
    const totalBoards = 10000;

    let generatedNumbers = [];
    let bingoBoardsState = {};
    let playerNames = {};
    let selectedFigure = '';
    let currentPage = parseInt(localStorage.getItem('currentPage')) || 1;

    // Cargar el estado guardado
    loadState();

    // Calcular páginas totales
    let totalPages = Math.ceil(totalBoards / boardsPerPage);
    totalPagesSpan.textContent = totalPages;

    createMasterBoard();
    createBingoBoards(currentPage);
    
     if (selectedFigure) {
        updateFigurePreview(selectedFigure);
        markFigureNumbers();
    }

    searchButton.addEventListener('click', filterBoards);
    resetGameBtn.addEventListener('click', resetGame);
    clearMarksBtn.addEventListener('click', clearMarks);
    nameCardsBtn.addEventListener('click', () => {
        window.location.href = 'naming.html';
    });
    winnerButton.addEventListener('click', () => {
        winnerVideoContainer.style.display = 'block';
        winnerVideo.play();
    });
    prevPageBtn.addEventListener('click', () => changePage(currentPage - 1));
    nextPageBtn.addEventListener('click', () => changePage(currentPage + 1));
    selectFigure.addEventListener('change', (e) => {
        const figure = e.target.value;
        updateFigurePreview(figure);
    });

    printButton.addEventListener('click', async () => {
    const boards = document.querySelectorAll('.bingoBoard');

    // Agregar estilo de borde temporalmente
    boards.forEach(board => {
        board.style.border = '2px solid black';
        board.style.padding = '10px';
    });

    const uniqueBoards = new Set();

    for (let i = 0; i < boards.length; i++) {
        const boardNumberElement = boards[i].querySelector('.bingoBoardNumber');
        if (boardNumberElement && !boardNumberElement.closest('#masterBoardContainer') && !boardNumberElement.closest('#figurePreviewContainer')) {
            const boardNumber = boardNumberElement.textContent.replace(/\D/g, ''); // Extraer el número del cartón
            if (!uniqueBoards.has(boardNumber)) {
                uniqueBoards.add(boardNumber);

                const canvas = await html2canvas(boards[i]);
                const imgData = canvas.toDataURL('image/png');

                const link = document.createElement('a');
                link.href = imgData;
                link.download = `bingo_carton_${boardNumber}.png`;
                link.style.display = 'none';

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }

    // Eliminar estilo de borde después de la captura
    boards.forEach(board => {
        board.style.border = '';
        board.style.padding = '';
    });
});

    function createMasterBoard() {
    masterBoardContainer.innerHTML = '';
    const board = document.createElement('div');
    board.classList.add('bingoBoard');

    const header = document.createElement('div');
    header.classList.add('bingoHeader');
    ['B', 'I', 'N', 'G', 'O'].forEach(letter => {
        const cell = document.createElement('div');
        cell.textContent = letter;
        header.appendChild(cell);
    });
    board.appendChild(header);

    const columns = document.createElement('div');
    columns.classList.add('bingoColumns');
    columns.style.display = 'grid';
    columns.style.gridTemplateColumns = 'repeat(5, 1fr)';
    columns.style.gap = '5px';

    const bColumn = createFixedBingoColumn(1, 15);
    const iColumn = createFixedBingoColumn(16, 30);
    const nColumn = createFixedBingoColumn(31, 45);
    const gColumn = createFixedBingoColumn(46, 60);
    const oColumn = createFixedBingoColumn(61, 75);

    columns.appendChild(bColumn);
    columns.appendChild(iColumn);
    columns.appendChild(nColumn);
    columns.appendChild(gColumn);
    columns.appendChild(oColumn);

    board.appendChild(columns);
    masterBoardContainer.appendChild(board);

        // Marcar números previamente generados
    generatedNumbers.forEach(number => {
        const cell = board.querySelector(`[data-number="${number}"]`);
        if (cell) {
            cell.classList.add('master-marked');
        }
    });
}

    function createFixedBingoColumn(min, max) {
        const column = document.createElement('div');
        column.classList.add('bingoColumn');
        for (let i = min; i <= max; i++) {
            const cell = document.createElement('div');
            cell.classList.add('bingoCell');
            cell.textContent = i;
            cell.dataset.number = i;
            cell.addEventListener('click', () => toggleMarkNumber(i));
            column.appendChild(cell);
        }
        return column;
    }

   function toggleMarkNumber(number) {
    const index = generatedNumbers.indexOf(number);
    if (index > -1) {
        generatedNumbers.splice(index, 1);
    } else {
        generatedNumbers.push(number);
    }
    saveState();

    // Marcar o desmarcar solo en el tablero maestro con un único color
    document.querySelectorAll('#masterBoardContainer .bingoCell').forEach(cell => {
        if (parseInt(cell.dataset.number) === number) {
            cell.classList.toggle('master-marked');
        }
    });

        // Marcar o desmarcar en el resto de los tableros (mantiene la lógica existente)
    document.querySelectorAll('.bingoBoard:not(#masterBoardContainer) .bingoCell').forEach(cell => {
        if (parseInt(cell.dataset.number) === number) {
            cell.classList.toggle('marked');
        }
    });

    if (selectedFigure) {
        markFigureNumbers();
    }
}

    function getRandomNumbers(min, max, count) {
        const numbers = [];
        while (numbers.length < count) {
            const num = Math.floor(Math.random() * (max - min + 1)) + min;
            if (!numbers.includes(num)) {
                numbers.push(num);
            }
        }
        return numbers;
    }

    function createBingoBoards(page) {
        bingoBoardsContainer.innerHTML = '';
        const startBoard = (page - 1) * boardsPerPage + 1;
        const endBoard = Math.min(startBoard + boardsPerPage - 1, totalBoards);

        for (let i = startBoard; i <= endBoard; i++) {
            const board = document.createElement('div');
            board.classList.add('bingoBoard');
            board.dataset.boardNumber = i;

            const boardNumberContainer = document.createElement('div');
            boardNumberContainer.classList.add('boardNumberContainer');
            
            const boardNumber = document.createElement('div');
            boardNumber.classList.add('bingoBoardNumber');
            boardNumber.textContent = `Cartón Nº ${i}`;

            const playerName = document.createElement('div');
            playerName.classList.add('playerName');
            playerName.textContent = playerNames[i] || 'Sin nombre';
            
            boardNumberContainer.appendChild(boardNumber);
            boardNumberContainer.appendChild(playerName);
            board.appendChild(boardNumberContainer);

            const header = document.createElement('div');
            header.classList.add('bingoHeader');
            ['B', 'I', 'N', 'G', 'O'].forEach(letter => {
                const cell = document.createElement('div');
                cell.textContent = letter;
                header.appendChild(cell);
            });
            board.appendChild(header);

            const columns = document.createElement('div');
            columns.classList.add('bingoColumns');
            columns.style.display = 'grid';
            columns.style.gridTemplateColumns = 'repeat(5, 1fr)';
            columns.style.gap = '0px';

            const bColumn = createBingoColumn(1, 15, i);
            const iColumn = createBingoColumn(16, 30, i);
            const nColumn = createBingoColumn(31, 45, i, true);
            const gColumn = createBingoColumn(46, 60, i);
            const oColumn = createBingoColumn(61, 75, i);

            columns.appendChild(bColumn);
            columns.appendChild(iColumn);
            columns.appendChild(nColumn);
            columns.appendChild(gColumn);
            columns.appendChild(oColumn);

            board.appendChild(columns);
            bingoBoardsContainer.appendChild(board);
        }

        // Marcar los números generados
        generatedNumbers.forEach(number => {
            document.querySelectorAll(`[data-number="${number}"]`).forEach(cell => {
                cell.classList.add('marked');
            });
        });

        // Marcar los números de la figura si hay una seleccionada
        if (selectedFigure) {
            markFigureNumbers();
        }

       currentPageSpan.textContent = currentPage; 
    }

    function createBingoColumn(min, max, boardNumber, hasFreeCell = false) {
        const column = document.createElement('div');
        column.classList.add('bingoColumn');
        const numbers = bingoBoardsState[boardNumber] && bingoBoardsState[boardNumber][`col${min}-${max}`] ?
            bingoBoardsState[boardNumber][`col${min}-${max}`] :
            getRandomNumbers(min, max, 5);

        const boardState = bingoBoardsState[boardNumber] || {};
        numbers.forEach((num, index) => {
            const cell = document.createElement('div');
            cell.classList.add('bingoCell');
            const cellNumber = hasFreeCell && index === 2 ? 'FREE' : num;
            cell.textContent = cellNumber;
            cell.dataset.number = cellNumber;

            if (cellNumber === 'FREE') {
                cell.classList.add('free');
            }

            if (cellNumber === 'FREE' || generatedNumbers.includes(Number(cellNumber))) {
                cell.classList.add('marked');
            }
            column.appendChild(cell);

            if (!boardState[`col${min}-${max}`]) {
                boardState[`col${min}-${max}`] = numbers;
            }
        });

        bingoBoardsState[boardNumber] = boardState;
        saveState();
        return column;
    }

    function markNumber(number) {
        const index = generatedNumbers.indexOf(number);
        if (index > -1) {
            generatedNumbers.splice(index, 1);
        } else {
            generatedNumbers.push(number);
        }
        saveState();
        document.querySelectorAll(`[data-number="${number}"]`).forEach(cell => {
            cell.classList.toggle('marked');
        });

        if (selectedFigure) {
            markFigureNumbers();
        }
    }

    function resetGame() {
        generatedNumbers = [];
        bingoBoardsState = {};
        playerNames = {};
        saveState();
        document.querySelectorAll('.bingoCell').forEach(cell => {
            cell.classList.remove('marked');
            cell.classList.remove('figure-marked');
        });
        masterBoardContainer.innerHTML = '';
        createMasterBoard();
        currentPage = 1;
        createBingoBoards(currentPage);
    }

  function clearMarks() {
    // Eliminar marcas en todos los tableros excepto el maestro
    document.querySelectorAll('.bingoBoard:not(#masterBoardContainer) .bingoCell').forEach(cell => {
        cell.classList.remove('marked', 'figure-marked');
    });

    // Limpiar las marcas en el tablero maestro
    document.querySelectorAll('#masterBoardContainer .bingoCell').forEach(cell => {
        cell.classList.remove('master-marked');
    });

    // Limpiar los números generados
    generatedNumbers = [];
    saveState();
}
    
    function saveState() {
        localStorage.setItem('generatedNumbers', JSON.stringify(generatedNumbers));
        localStorage.setItem('bingoBoardsState', JSON.stringify(bingoBoardsState));
        localStorage.setItem('playerNames', JSON.stringify(playerNames));
        localStorage.setItem('selectedFigure', selectedFigure);
        localStorage.setItem('currentPage', currentPage.toString());
    }

    function saveState() {
    localStorage.setItem('generatedNumbers', JSON.stringify(generatedNumbers));
    localStorage.setItem('bingoBoardsState', JSON.stringify(bingoBoardsState));
    localStorage.setItem('playerNames', JSON.stringify(playerNames));
    localStorage.setItem('selectedFigure', selectedFigure);
    localStorage.setItem('currentPage', currentPage.toString());

    // Guardar las marcas en la tabla maestra
    const masterBoardMarks = Array.from(document.querySelectorAll('#masterBoardContainer .bingoCell.master-marked')).map(cell => parseInt(cell.dataset.number));
    localStorage.setItem('masterBoardMarks', JSON.stringify(masterBoardMarks));
}

function loadState() {
    generatedNumbers = JSON.parse(localStorage.getItem('generatedNumbers')) || [];
    bingoBoardsState = JSON.parse(localStorage.getItem('bingoBoardsState')) || {};
    playerNames = JSON.parse(localStorage.getItem('playerNames')) || {};
    selectedFigure = localStorage.getItem('selectedFigure') || '';
    currentPage = parseInt(localStorage.getItem('currentPage')) || 1;

    // Cargar las marcas en la tabla maestra
    const masterBoardMarks = JSON.parse(localStorage.getItem('masterBoardMarks')) || [];
    masterBoardMarks.forEach(number => {
        const cell = document.querySelector(`#masterBoardContainer .bingoCell[data-number="${number}"]`);
        if (cell) {
            cell.classList.add('master-marked');
        }
    });

    // Actualizar el selector de figura
    if (selectedFigure) {
        selectFigure.value = selectedFigure;
    }
}
    
    function filterBoards() {
    const query = searchBox.value.trim().toLowerCase();
    let found = false;

    document.querySelectorAll('.bingoBoard').forEach(board => {
        board.classList.remove('blurry');
        board.classList.remove('highlighted-permanent');
    });

    for (let page = 1; page <= totalPages; page++) {
        const startBoard = (page - 1) * boardsPerPage + 1;
        const endBoard = Math.min(startBoard + boardsPerPage - 1, totalBoards);

        for (let i = startBoard; i <= endBoard; i++) {
            const playerName = playerNames[i] ? playerNames[i].toLowerCase() : '';
            if (i.toString().includes(query) || playerName.includes(query)) {
                found = true;
                changePage(page);
                setTimeout(() => {
                    const board = document.querySelector(`.bingoBoard[data-board-number='${i}']`);
                    if (board) {
                        document.querySelectorAll('.bingoBoard').forEach(b => {
                            if (b !== board && !b.closest('#masterBoardContainer')) {
                                b.classList.add('blurry');
                            }
                        });
                        document.getElementById('masterBoardContainer').classList.remove('blurry');

                        board.classList.remove('blurry');
                        board.scrollIntoView({ behavior: 'smooth' });
                        board.classList.add('highlighted-permanent');

                        const closeButton = document.createElement('button');
                        closeButton.textContent = 'X';
                        closeButton.classList.add('closeButton');
                        closeButton.addEventListener('click', () => {
                            board.classList.remove('highlighted-permanent');
                            board.querySelector('.closeButton').remove();
                            document.querySelectorAll('.bingoBoard').forEach(b => {
                                b.classList.remove('blurry');
                            });
                        });

                        board.appendChild(closeButton);
                    }
                }, 500);
                break;
            }
        }

        if (found) {
            break;
        }
    }

    if (!found) {
        alert('No se encontró el cartón.');
    }
}

function changePage(newPage) {
    console.log("Changing to page:", newPage);
    if (newPage < 1 || newPage > totalPages) return;
    currentPage = newPage;
    createBingoBoards(currentPage);
    saveState();
    currentPageSpan.textContent = currentPage;
}

function updateFigurePreview(figure) {
    figurePreview.innerHTML = '';
    let cells = Array(25).fill(false);
    let figureImageSrc = ''; // Variable para almacenar la ruta de la imagen

    switch (figure) {
            case 'letraT':
            cells = [
                false, false, true,  false, false,
                false, false, true,  false, false,
                true,  true,  true,  true,  true,
                false, false, true,  false, false,
                false, false, true,  false, false
            ];
            figureImageSrc = 'LetraT.png'; // Cambia a la ruta de tu imagen
            break;
            case 'letraL':
            cells = [
                false, false, true,  false, false,
                false, false, true,  false, false,
                true,  true,  true,  true,  true,
                false, false, true,  false, false,
                false, false, true,  false, false
            ];
            figureImageSrc = 'LetraL.PNG'; // Cambia a la ruta de tu imagen
            break;

            case 'letraP':
            cells = [
                false, false, true,  false, false,
                false, false, true,  false, false,
                true,  true,  true,  true,  true,
                false, false, true,  false, false,
                false, false, true,  false, false
            ];
            figureImageSrc = 'LetraP.png'; // Cambia a la ruta de tu imagen
            break;

            case 'letraI':
            cells = [
                false, false, true,  false, false,
                false, false, true,  false, false,
                true,  true,  true,  true,  true,
                false, false, true,  false, false,
                false, false, true,  false, false
            ];
            figureImageSrc = 'LetraI.PNG'; // Cambia a la ruta de tu imagen
            break;

            case 'letraS':
            cells = [
                false, false, true,  false, false,
                false, false, true,  false, false,
                true,  true,  true,  true,  true,
                false, false, true,  false, false,
                false, false, true,  false, false
            ];
            figureImageSrc = 'LetraS.PNG'; // Cambia a la ruta de tu imagen
            break;

            case 'letraZ':
            cells = [
                false, false, true,  false, false,
                false, false, true,  false, false,
                true,  true,  true,  true,  true,
                false, false, true,  false, false,
                false, false, true,  false, false
            ];
            figureImageSrc = 'LetraZ.png'; // Cambia a la ruta de tu imagen
            break;
            
            case 'corazon':
            cells = [
                false, false, true,  false, false,
                false, false, true,  false, false,
                true,  true,  true,  true,  true,
                false, false, true,  false, false,
                false, false, true,  false, false
            ];
            figureImageSrc = 'Corazon.PNG'; // Cambia a la ruta de tu imagen
            break;
        case 'cross':
            cells = [
                false, false, true,  false, false,
                false, false, true,  false, false,
                true,  true,  true,  true,  true,
                false, false, true,  false, false,
                false, false, true,  false, false
            ];
            figureImageSrc = 'cross.PNG'; // Cambia a la ruta de tu imagen
            break;

            /* NUEVAS FIGURAS */

            case 'Explosion':
            cells = [
                true, false, false,  false, true,
                false, false, true,  false, false,
                false,  true,  true,  true,  false,
                false, false, true,  false, false,
                true, false, false,  false, true
            ];
            figureImageSrc = 'Explosion.PNG'; // Cambia a la ruta de tu imagen
            break;

            case 'Ahorcado':
            cells = [
                false, false, true,  false, true,
                true, true, true,  true, false,
                true,  false,  true,  false,  true,
                true, false, false,  false, false,
                true, true, true,  true, true
            ];
            figureImageSrc = 'Ahorcado.PNG'; // Cambia a la ruta de tu imagen
            break;

            case 'Paraguas':
            cells = [
                false, true, false,  true, false,
                true, true, false,  false, true,
                true,  true,  true,  true,  false,
                true, true, false,  false, false,
                false, true, false,  false, false
            ];
            figureImageSrc = 'paraguas.PNG'; // Cambia a la ruta de tu imagen
            break;

/*FIN DE NUEVAS FIGURAS */
            
        case 'bigO':
            cells = [
                true,  true,  true,  true,  true,
                true,  false, false, false, true,
                true,  false, false, false, true,
                true,  false, false, false, true,
                true,  true,  true,  true,  true
            ];
            figureImageSrc = 'bigO.png'; // Cambia a la ruta de tu imagen
            break;
        case 'diamond':
            cells = [
                false, false, true,  false, false,
                false, true,  false, true,  false,
                true,  false, false, false, true,
                false, true,  false, true,  false,
                false, false, true,  false, false
            ];
            figureImageSrc = 'diamond.PNG'; // Cambia a la ruta de tu imagen
            break;
        case 'fourCorners':
            cells = [
                true,  false, false, false, true,
                false, false, false, false, false,
                false, false, false, false, false,
                false, false, false, false, false,
                true,  false, false, false, true
            ];
            figureImageSrc = 'fourCorners.PNG'; // Cambia a la ruta de tu imagen
            break;
        case 'letterH':
            cells = [
                true, true, true, true, true,
                false, false, true, false, false,
                false, false, true, false, false,
                false, false, true, false, false,
                true, true, true, true, true
            ];
            figureImageSrc = 'letterH.PNG'; // Cambia a la ruta de tu imagen
            break;
        case 'tree':
            cells = [
                false, false, true,  false, false,
                false, true,  true,  false,  false,
                true,  true, true,  true, true,
                false, true,  true,  false,  false,
                false, false, true,  false, false
            ];
            figureImageSrc = 'tree.PNG'; // Cambia a la ruta de tu imagen
            break;
        case 'numberOne':
            cells = [
               false, false, true,  false, false,
               false, false, true,  false, false,
               false, false, true,  false, false,
               false, false, true,  false, false,
               false,  false,  true,  false,  false
            ];
            figureImageSrc = 'numberOne.PNG'; // Cambia a la ruta de tu imagen
            break;
        case 'chess':
            cells = [
                true,  false, true,  false, true,
                false, true,  false, true,  false,
                true,  false, true,  false, true,
                false, true,  false, true,  false,
                true,  false, true,  false, true
            ];
            figureImageSrc = 'chess.png'; // Cambia a la ruta de tu imagen
            break;
        case 'diagonals':
            cells = [
                true,  false, false, false, true,
                false, true,  false, true,  false,
                false, false, true,  false, false,
                false, true,  false, true,  false,
                true,  false, false, false, true
            ];
            figureImageSrc = 'diagonals.png'; // Cambia a la ruta de tu imagen
            break;
        default:
            return;
    }

    const board = document.createElement('div');
    board.classList.add('bingoBoard', 'small', 'figure-board');

    const header = document.createElement('div');
    header.classList.add('bingoHeader');
    ['B', 'I', 'N', 'G', 'O'].forEach(letter => {
        const cell = document.createElement('div');
        cell.textContent = letter;
        header.appendChild(cell);
    });
    board.appendChild(header);

    const columns = document.createElement('div');
    columns.classList.add('bingoColumns');
    columns.style.display = 'grid';
    columns.style.gridTemplateColumns = 'repeat(5, 1fr)';
    columns.style.gap = '2px';

    cells.forEach((marked, index) => {
        const cell = document.createElement('div');
        cell.classList.add('bingoCell');
        if (index === 12) {
            cell.classList.add('free');
            cell.textContent = 'FREE';
        } else if (marked) {
            cell.classList.add('figure-marked');
        }
        columns.appendChild(cell);
    });

    board.appendChild(columns);
    figurePreview.appendChild(board);

    figurePreviewContainer.classList.remove('hidden');
    selectedFigure = figure;
    localStorage.setItem('selectedFigure', figure);
    markFigureNumbers();

    // Mostrar la imagen de la figura seleccionada
    const figureImage = document.getElementById('figureImage');
    if (figureImageSrc) {
        figureImage.src = figureImageSrc;
        figureImage.style.display = 'block';
    } else {
        figureImage.style.display = 'none';
    }
}
function markFigureNumbers() {
    if (!selectedFigure) return;

    let cells = Array(25).fill(false);

    switch (selectedFigure) {

        case 'letraT':
            cells = [
                true, false, false,  false, false,
                true, false, false,  false, false,
                true,  true,  true,  true,  true,
                true, false, false,  false, false,
                true, false, false,  false, false
            ];
            break;
            case 'letraL':
            cells = [
                true, true, true,  true, true,
                false, false, false,  false, true,
                false,  false,  false,  false,  true,
                false, false, false,  false, true,
                false, false, false,  false, true
            ];
            break;

            case 'letraP':
            cells = [
                true, true, true,  true, true,
                true, false, true,  false, false,
                true,  false,  true,  false,  false,
                true, false, true,  false, false,
                true, true, true,  false, false
            ];
            break;

             case 'letraI':
            cells = [
                true, false, false,  false, true,
                true, false, false,  false, true,
                true,  true,  true,  true,  true,
                true, false, false,  false, true,
                true, false, false,  false, true
            ];
            break;

             case 'letraS':
            cells = [
                true, true, true,  false, true,
                true, false, true,  false, true,
                true,  false,  true,  false,  true,
                true, false, true,  false, true,
                true, false, true,  true, true
            ];
            break;

             case 'letraZ':
            cells = [
                true, false, false,  false, true,
                true, false, false,  true, true,
                true,  false,  true,  false,  true,
                true, true, false,  false, true,
                true, false, false,  false, true
            ];
            break;
            
            case 'corazon':
            cells = [
                false, true, true,  false, false,
                true, false, false,  true, false,
                false,  true,  false,  false,  true,
                true, false, false,  true, false,
                false, true, true,  false, false
            ];
            break;

            /*NUEVAS FIGURAS */
             case 'Explosion':
            cells = [
                true, false, false,  false, true,
                false, false, true,  false, false,
                false,  true,  true,  true,  false,
                false, false, true,  false, false,
                true, false, false,  false, true
            ];
           
            break;

            case 'Ahorcado':
            cells = [
                true, true, true,  true, true,
                true, false, false,  false, false,
                true,  false,  true,  false,  true,
                true, true, true,  true, false,
                false, false, true,  false, true
            ];
            break;

            case 'Paraguas':
            cells = [
                false, true, false,  true, false,
                true, true, false,  false, true,
                true,  true,  true,  true,  false,
                true, true, false,  false, false,
                false, true, false,  false, false
            ];
           
            break;

            /*HASTA AQUI NUEVAS FIGURAS */
            
        case 'cross':
            cells = [
                false, false, true,  false, false,
                false, false, true,  false, false,
                true,  true,  true,  true,  true,
                false, false, true,  false, false,
                false, false, true,  false, false
            ];
            break;
        case 'bigO':
            cells = [
                true,  true,  true,  true,  true,
                true,  false, false, false, true,
                true,  false, false, false, true,
                true,  false, false, false, true,
                true,  true,  true,  true,  true
            ];
            break;
        case 'diamond':
            cells = [
                false, false, true,  false, false,
                false, true,  false, true,  false,
                true,  false, false, false, true,
                false, true,  false, true,  false,
                false, false, true,  false, false
            ];
            break;
        case 'fourCorners':
            cells = [
                true,  false, false, false, true,
                false, false, false, false, false,
                false, false, false, false, false,
                false, false, false, false, false,
                true,  false, false, false, true
            ];
            break;
        case 'letterH':
            cells = [
                true, true, true, true, true,
                false, false, true, false, false,
                false, false, true, false, false,
                false, false, true, false, false,
                true, true, true, true, true
            ];
            break;
        case 'tree':
            cells = [
                false, false, true,  false, false,
                false, true,  true,  false,  false,
                true,  true, true,  true, true,
                false, true,  true,  false,  false,
                false, false, true,  false, false
            ];
            break;
        case 'numberOne':
            cells = [
               false, false, false,  false, false,
               false, true, false,  false, true,
               true, true, true,  true, true,
               false, false, false,  false, true,
               false,  false,  false,  false,  false
            ];
            break;
        case 'chess':
            cells = [
                true,  false, true,  false, true,
                false, true,  false, true,  false,
                true,  false, true,  false, true,
                false, true,  false, true,  false,
                true,  false, true,  false, true
            ];
            break;
        case 'diagonals':
            cells = [
                true,  false, false, false, true,
                false, true,  false, true,  false,
                false, false, true,  false, false,
                false, true,  false, true,  false,
                true,  false, false, false, true
            ];
            break;
        default:
            return;
    }

        // Marcar las celdas en los cartones de bingo
    document.querySelectorAll('.bingoBoard').forEach(board => {
        const boardCells = board.querySelectorAll('.bingoCell');
        boardCells.forEach((cell, index) => {
            const cellNumber = parseInt(cell.dataset.number);
            if (cells[index] && generatedNumbers.includes(cellNumber)) {
                cell.classList.add('figure-marked');
            } else {
                cell.classList.remove('figure-marked');
            }
        });
    });

    // Marcar las celdas en el cartón de figura
    document.querySelectorAll('#figurePreviewContainer .bingoCell').forEach((cell, index) => {
        if (cells[index]) {
            cell.classList.add('figure-marked');
        } else {
            cell.classList.remove('figure-marked');
        }
    });
}

// Restaurar la figura seleccionada al cargar la página
if (selectedFigure) {
    updateFigurePreview(selectedFigure);
}

// Event listeners
searchButton.addEventListener('click', filterBoards);
resetGameBtn.addEventListener('click', resetGame);
clearMarksBtn.addEventListener('click', clearMarks);
nameCardsBtn.addEventListener('click', () => {
    window.location.href = 'naming.html';
});
winnerButton.addEventListener('click', () => {
    winnerVideoContainer.style.display = 'block';
    winnerVideo.play();
});
prevPageBtn.addEventListener('click', () => changePage(currentPage - 1));
nextPageBtn.addEventListener('click', () => changePage(currentPage + 1));
selectFigure.addEventListener('change', (e) => {
    const figure = e.target.value;
    updateFigurePreview(figure);
});

printButton.addEventListener('click', async () => {
    const boards = document.querySelectorAll('.bingoBoard');
    
    // Agregar estilo de borde temporalmente
    boards.forEach(board => {
        board.style.border = '2px solid black';
        board.style.padding = '10px';
    });

    const downloadCanvasImage = async (board, boardNumber) => {
        const canvas = await html2canvas(board);
        const imgData = canvas.toDataURL('image/png');

        const link = document.createElement('a');
        link.href = imgData;
        link.download = `bingo_carton_${boardNumber}.png`; // Nombre del archivo con el número del cartón
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const uniqueBoards = [];
    boards.forEach(board => {
        const boardNumberElement = board.querySelector('.bingoBoardNumber');

        if (boardNumberElement && !board.closest('#masterBoardContainer') && !board.closest('#figurePreviewContainer')) {
            const boardNumber = boardNumberElement.textContent.replace(/\D/g, ''); // Extraer el número del cartón
            if (!uniqueBoards.includes(boardNumber)) {
                uniqueBoards.push(boardNumber);
                downloadCanvasImage(board, boardNumber);
            }
        }
    });

    // Eliminar estilo de borde después de la captura
    boards.forEach(board => {
        board.style.border = '';
        board.style.padding = '';
    });
});


createMasterBoard();
createBingoBoards(currentPage);
});
