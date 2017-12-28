import 'p2';
import 'pixi';
import 'phaser';

import * as Assets from './assets';
import { States, StateManager } from "./utilities/stateManager";

class App extends Phaser.Game {
    constructor(config: Phaser.IGameConfig) {
        super (config);

        StateManager.init(this);
        StateManager.start(States.BOOT, this);
    }
}

function startApp(): void {
    // There are a few more options you can set if needed, just take a look at Phaser.IGameConfig
    let gameConfig: Phaser.IGameConfig = {
        width: 800,
        height: 600,
        renderer: Phaser.AUTO,
        parent: '',
        resolution: 1
    };

    let app = new App(gameConfig);
}

window.onload = () => {
    startApp();
};
