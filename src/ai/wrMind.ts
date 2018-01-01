import  { Mind, ThoughtRequest } from "./mind";
import DumbMind from "./dumbMind";
import * as Phaser from "phaser-ce";

export default class WrMind extends DumbMind {
    public think(request: ThoughtRequest) {

        if (this.finishedRoute(request.player, request.matchState)) {
            let newX = this.getRandom(-400, 400);
            let newy = this.getRandom(-20, -400);
            request.player.route.push(new Phaser.Point(newX, newy));
        }
        
        super.think(request);

    }
}