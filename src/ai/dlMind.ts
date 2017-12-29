import  { Mind, ThoughtRequest } from "./mind";
import DumbMind from "./dumbMind";
import * as Phaser from "phaser-ce";

export default class DlMind extends DumbMind {
    public think(request: ThoughtRequest) {
        
        let thisPlayer = request.player;
        let target = request.playState.playerWithBall;

        if (!request.playState.isBeforeSnap && target) {
            this.accelerateToPoint(thisPlayer.sprite, target.sprite.position, 200);
        }
        else {
            super.think(request);
        }
    }
}