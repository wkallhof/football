import * as Phaser from "phaser-ce";
import { PlayerPosition } from "./playerPosition";

export default class Player{
    public name: string;
    public number: number;
    public body: Phaser.Physics.P2.Body;
    public position: PlayerPosition;

    constructor(name: string, number: number, position: PlayerPosition) {
        this.name = name;
        this.number = number;
        this.position = position;
    }
}