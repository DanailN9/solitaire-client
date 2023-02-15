import { Connection } from "./Connection";
import { GameObject } from "./GameObject";

export function engine(connection: Connection, game: GameObject) {
    const state = {};

    connection.on('state', onState);
    connection.on('moves', onMoves);
    connection.on('moveResult', onResult);
    connection.on('victory', onVictory);

    function onMoves(receivedMoves) {
        let moves = {};
        moves = receivedMoves;
        game.sendMove(receivedMoves);
        game.receivedMoves(moves);
    }

    function onState(state) {
        game.setState(state);
        console.log('received state', state);
    }

    function onResult(data: any) {
       // console.log(data);
        game.setResult(data);
    }

    function onVictory() {
        game.Victory();
    }
}