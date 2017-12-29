
import { PlayerPosition } from "./playerPosition";
import * as Phaser from "phaser-ce";

export class Play{
    private maxPlayRoutes: number = 11;
    public playRoutes: Array<PlayRoute>;

    constructor() {
        this.playRoutes = new Array<PlayRoute>();
    }

    addPlayRoute(route: PlayRoute) {
        if (this.playRoutes.length == this.maxPlayRoutes) return;
        this.playRoutes.push(route);
    }
}

export class PlayRoute{
    public position: PlayerPosition;
    public route: Array<Phaser.Point>;

    constructor(position: PlayerPosition, route: Array<Phaser.Point>) {
        this.position = position;
        this.route = route;
    }
}

