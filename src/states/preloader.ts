import * as Assets from '../assets';
import { States, StateManager } from "../utilities/stateManager";

export default class Preloader extends Phaser.State {

    public preload(): void {
        // display loading bar or text
        var style = { font: "35px Arial", fill: "#ffffff", align: "center" };
        var text = this.game.add.text(this.game.world.centerX, this.game.world.centerY, "Loading", style);
        text.anchor.set(0.5);

        Assets.Loader.loadAllAssets(this.game);

        this.game.camera.onFadeComplete.addOnce(this.loadGame, this);
        this.game.camera.fade(0x000000, 1000);
    }
    
    private loadGame(): void {
        //StateManager.start(States.TITLE, this.game);
        StateManager.start(States.TITLE, this.game);
    }
}
