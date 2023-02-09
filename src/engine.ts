import { Connection } from "./Connection";
import { GameObject } from "./GameObject";

export function engine(connection: Connection, game: GameObject) {
    const state = {};

    connection.on('state', onState);
    connection.on('moves', onMoves);

    function onMoves(moves) {
        game.setMoves(moves)
        console.log('received moves', moves)
    }

    function onState(state) {
        game.setState(state);
        console.log('received state', state);
    }
}