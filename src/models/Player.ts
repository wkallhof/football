import * as Phaser from "phaser-ce";
import { PlayerPosition } from "./PlayerPosition";

export class Player{
    public name: string;
    public number: number;
    public body: Phaser.Physics.P2.Body;
    public position: PlayerPosition;

    constructor(body: Phaser.Physics.P2.Body, name: string, number: number) {
        this.name = name;
        this.number = number;
        this.body = body;
    }
}