import { RenderPlayer } from "./Player";

export default class PlayState{
    public ballPosition: Phaser.Point;
    public playerWithBall: RenderPlayer;
    public playClock: number;
    public flagThrown: boolean;
    public isBeforeSnap: boolean;
}