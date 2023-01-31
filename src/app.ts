import { Connection } from "./Connection";
import { engine } from "./engine";
import { GameObject } from "./GameObject";

const initForm = document.querySelector('form');
const initSection = document.getElementById('init');
const gameSection = document.getElementById('game');

let connection = null;

initForm.addEventListener('submit', async event => {
    event.preventDefault();
    const { nickname } = Object.fromEntries(new FormData(event.target as HTMLFormElement));

    connection = new Connection(nickname as string);
    await connection.open();
    engine(connection);
    showBoard();
    connection.send('startGame');
});

document.getElementById('disconnect').addEventListener('click', () => {
    connection?.disconnect();
    showInit();
});


function showBoard() {
    initSection.style.display = 'none';
    gameSection.style.display = 'block';
    //START
    const game = new GameObject();
    game.generateBackground();
    game.genaratePlaces();
}

function showInit() {
    initSection.style.display = 'block';
    gameSection.style.display = 'none';
}