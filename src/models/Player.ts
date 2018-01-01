import * as Phaser from "phaser-ce";
import { PlayerPosition } from "./playerPosition";
import { Mind } from "../ai/mind";
import ObjectUtil from "../utilities/objectUtil";

export class Player {
    public name: string;
    public number: number;
    public body: Phaser.Physics.P2.Body;
    public position: PlayerPosition;
    public mind: Mind;

    constructor(name: string, number: number, position: PlayerPosition, mind: Mind) {
        this.name = name;
        this.number = number;
        this.position = position;
        this.mind = mind;
    }
}

export class RenderPlayer{
    public info: Player;
    public sprite: Phaser.Sprite;
    public route: Array<Phaser.Point>;
    public color: number;
    public routeIndex: number;
    public isUser: boolean;
    public get location(): Phaser.Point { return ObjectUtil.spriteToScreenPos(this.sprite); }

    constructor(info: Player, route: Array<Phaser.Point>, color: number) {
        this.info = info;
        this.route = route;
        this.color = color;
        this.routeIndex = 0;
    }
}