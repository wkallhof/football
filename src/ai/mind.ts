import MatchState from "../models/matchState";
import { Player, RenderPlayer } from "../models/Player";
import * as Phaser from "phaser-ce";
import PlayState from "../models/playState";
import ObjectUtil from "../utilities/objectUtil";

export abstract class Mind {
    public abstract think(request: ThoughtRequest): void
    
    public runRoute(player: RenderPlayer, matchState: MatchState, beforeSnap: boolean) {
        player.routeIndex = beforeSnap ? 0 : player.routeIndex;
        let location = this.calculateTarget(player, matchState);

        if (!beforeSnap && ObjectUtil.pointsAreCloseEnough(player.location, location, 3) && player.routeIndex != player.route.length - 1) {
                player.routeIndex++;
        }
        else {
            this.runToLocation(player, location, 300);
        }
    }

    public runToLocation(player: RenderPlayer, location: Phaser.Point, speed: number) {
        if (ObjectUtil.pointsAreCloseEnough(player.location, location, 3)) {
            player.sprite.body.rotation = 0;
            return;
        }

        let angle = ObjectUtil.calculateRotationAngleToPoint(player.location, location);

        player.sprite.body.rotation = angle + Phaser.Math.degToRad(90);
        player.sprite.body.force.x = Math.cos(angle) * speed;    // accelerateToObject 
        player.sprite.body.force.y = Math.sin(angle) * speed;
    }

    public finishedRoute(player: RenderPlayer, matchState: MatchState) {
        let target = this.calculateTarget(player, matchState);

        return ObjectUtil.pointsAreCloseEnough(player.location, target, 3)
            && player.routeIndex == player.route.length - 1;
    }

    private calculateTarget(player: RenderPlayer, matchState: MatchState): Phaser.Point{
        let ballPosition = matchState.field.translateYardsToCoords(matchState.fieldPosition);
        let routeTarget = player.route[player.routeIndex];
        return new Phaser.Point(routeTarget.x + ballPosition.x, routeTarget.y + ballPosition.y);
    }

    public getRandom(min: number, max:number): number {
        return Math.random() * (max - min) + min;
      }
}

export class ThoughtRequest {
    public player: RenderPlayer;
    public matchState: MatchState;
    public playState: PlayState;

    constructor(player: RenderPlayer, matchState: MatchState, playState: PlayState) {
        this.player = player;
        this.matchState = matchState;
        this.playState = playState;
    }
}

