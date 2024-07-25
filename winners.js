document.addEventListener('DOMContentLoaded', () => {
    // Definición de los patrones de las figuras utilizando matrices de true/false
    const patterns = {
        T: [
            true,  true,  true,  true,  true,
            false, false, true,  false, false,
            false, false, true,  false, false,
            false, false, true,  false, false,
            false, false, true,  false, false
        ],
        L: [
            true,  true, true, true, true,
            false,  false, false, false, true,
            false,  false, false, false, true,
            false,  false, false, false, true,
            false,  false,  false,  false,  true
        ],
        X: [
            true,  false, false, false, true,
            false, true,  false, true,  false,
            false, false, true,  false, false,
            false, true,  false, true,  false,
            true,  false, false, false, true
        ]
        // Añadir más patrones según sea necesario
    };

    // Función para actualizar la lista de ganadores
      function updateWinnersList() {
        const winnersList = document.getElementById('listagana');
        if (!winnersList) {
            console.error('Elemento listagana no encontrado');
            return;
        }
        winnersList.innerHTML = ''; // Limpiar la lista de ganadores

        const winners = findWinners();
        console.log('Ganadores encontrados:', winners); // Mensaje de depuración

        winners.forEach(winner => {
            const listItem = document.createElement('div');
            listItem.textContent = `Cartón Nº ${winner.boardNumber} - ${winner.playerName}`;
            winnersList.appendChild(listItem);
        });
    }

    function findWinners() {
        const winners = [];
        const allBoards = JSON.parse(localStorage.getItem('bingoBoardsState')) || {};
        Object.keys(allBoards).forEach(boardNumber => {
            const board = allBoards[boardNumber];
            if (checkIfBoardWins(board)) {
                winners.push({ boardNumber, playerName: board.playerName });
            }
        });
        return winners;
    }

    function checkIfBoardWins(board) {
        return Object.values(patterns).some(pattern => {
            return pattern.every((required, index) => !required || board.cells[index].marked);
        });
    }

    window.updateWinnersList = updateWinnersList;
});
