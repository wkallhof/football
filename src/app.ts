import 'p2';
import 'pixi';
import 'phaser';

import Boot from './states/boot';
import Preloader from './states/preloader';
import Game from './states/game';
import Title from "./states/title";
import Settings from "./states/settings";
import * as Assets from './assets';

class App extends Phaser.Game {
    constructor(config: Phaser.IGameConfig) {
        super (config);

        this.state.add('boot', Boot);
        this.state.add('preloader', Preloader);
        this.state.add("title", Title);
        this.state.add('settings', Settings);
        this.state.add('game', Game);

        this.state.start('boot');
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
