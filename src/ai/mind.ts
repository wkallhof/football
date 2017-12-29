import MatchState from "../models/matchState";
import { Player, RenderPlayer } from "../models/Player";
import * as Phaser from "phaser-ce";
import PlayState from "../models/playState";

export abstract class Mind {
    public abstract think(request: ThoughtRequest): void
    
    public runRoute(player: RenderPlayer, matchState: MatchState, beforeSnap: boolean) {
        player.routeIndex = beforeSnap ? 0 : player.routeIndex;
        let target = this.calculateTarget(player, matchState);

        if (!beforeSnap && this.atPoint(player.sprite, target) && player.routeIndex != player.route.length - 1) {
                player.routeIndex++;
        }
        else {
            this.accelerateToPoint(player.sprite, target, 300);
        }
    }

    public accelerateToPoint(object, point: Phaser.Point, speed: number) {
        if (Math.abs(object.body.x - point.x) < 3 && Math.abs(object.body.y - point.y) < 3) {
            object.body.rotation = 0;
            return;
        }
        const angle = this.rotateTowardsPoint(object, point);
        object.body.force.x = Math.cos(angle) * speed;    // accelerateToObject 
        object.body.force.y = Math.sin(angle) * speed;
    }

    public rotateTowardsPoint(object, point: Phaser.Point): number {
        
        const angle = Math.atan2(point.y - object.y, point.x -object.x);
        object.body.rotation = angle + Phaser.Math.degToRad(90);
        return angle;
    }

    private atPoint(player: Phaser.Sprite, point: Phaser.Point): boolean {
        return Math.abs(player.x - point.x) < 3 && Math.abs(player.y - point.y) < 3;
    }

    public finishedRoute(player: RenderPlayer, matchState: MatchState) {
        let target = this.calculateTarget(player, matchState);

        return this.atPoint(player.sprite, target)
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

