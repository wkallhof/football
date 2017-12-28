import * as Assets from '../assets';
import { States, StateManager } from "../utilities/stateManager";

export default class Boot extends Phaser.State {

    public preload(): void {
        // Load any assets you need for your preloader state here.
    }

    public create(): void {
        // Do anything here that you need to be setup immediately, before the game actually starts doing anything.

        if (this.game.device.desktop) {
            // Any desktop specific stuff here
        } else {
            // Any mobile specific stuff here

            // Comment the following and uncomment the line after that to force portrait mode instead of landscape
            this.game.scale.forceOrientation(true, false);
            // this.game.scale.forceOrientation(false, true);
        }

        // Use DEBUG to wrap code that should only be included in a DEBUG build of the game
        console.log(
            `DEBUG....................... ${DEBUG}`
        );

        StateManager.start(States.PRELOADER, this.game);
    }
}
