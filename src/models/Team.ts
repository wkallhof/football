import Player from "./player";

export default class Team{
    public name: string;
    public players: Array<Player>;
    public color: string;

    constructor(name: string, color: string) {
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