import  { Mind, ThoughtRequest } from "./mind";
import DumbMind from "./dumbMind";
import * as Phaser from "phaser-ce";
import ObjectUtil from "../utilities/objectUtil";

export default class DlMind extends DumbMind {
    public think(request: ThoughtRequest) {
        
        let thisPlayer = request.player;
        let target = request.playState.ball;

        if (!request.playState.isBeforeSnap && target) {
            this.runToLocation(thisPlayer, target.getLocation(), 200);
        }
        else {
            super.think(request);
            if (this.finishedRoute(request.player, request.matchState)) {
                thisPlayer.sprite.body.rotation = Phaser.Math.degToRad(180);
            }
        }
    }
}