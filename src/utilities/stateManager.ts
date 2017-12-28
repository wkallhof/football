import * as Phaser from "phaser-ce";

import Boot from '../states/boot';
import Preloader from '../states/preloader';
import Game from '../states/game';
import Title from "../states/title";
import Settings from "../states/settings";

export class States {
    static BOOT : string = "boot";
    static GAME: string = "game";
    static PRELOADER: string = "preloader";
    static SETTINGS: string = "settings";
    static TITLE: string = "title";
};

export class StateManager {

    public static init(game: Phaser.Game): void {
        game.state.add(States.BOOT, Boot);
        game.state.add(States.PRELOADER, Preloader);
        game.state.add(States.TITLE, Title);
        game.state.add(States.SETTINGS, Settings);
        game.state.add(States.GAME, Game);
    }

    public static start(state: string, game: Phaser.Game) {
        game.state.start(state);
    }
}