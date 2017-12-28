import * as Phaser from "phaser-ce";
import { Player } from "./Player";

export class Team{
    public name: string;
    public players: Array<Player>;
    public color: Phaser.Color;

    constructor(name: string, color: Phaser.Color) {
        this.players = new Array<Player>();
        this.color = color;
        this.name = name;
    }

    addPlayer(player: Player) {
        this.players.push(player);
    }

    lineUpForKickoff() {
        
    }

    sendToSideline() {
        
    }
}