import * as Assets from '../assets';
import { States, StateManager } from "../utilities/stateManager";
import MatchState from "../models/matchState";

export default class SelectPlay extends Phaser.State {

    private matchState: MatchState;

    public init(matchState: MatchState): void{
        this.matchState = matchState;
    }

    public create(): void {

        this.setupAndDisplayText();
        this.game.time.events.add(4 * Phaser.Timer.SECOND, () => {
            StateManager.start(States.DOWN, this.game, this.matchState);
        }, this);
    }

    private setupAndDisplayText() {
        var style = { font: "30px Arial", fill: "#ffffff", align: "center" };
        var text = this.game.add.text(this.game.width, this.game.world.centerY-100, "Play selection coming soon.", style);
        text.anchor.set(0.5);
        this.game.add.tween(text).to({ x: this.game.world.centerX }, 2000, Phaser.Easing.Cubic.Out, true);
    }
}
