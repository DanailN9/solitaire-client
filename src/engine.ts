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
        //game.sendMoves(receivedMoves);
        console.log('received moves', moves);
        //mergeMoves();
    }

    function onState(state) {
        game.setState(state);
        console.log('received state', state);
    }

    function onResult(data: any) {
        game.setResult(data);
        console.log('moves', data);
    }

    function onVictory() {
        game.Victory();
    }
}