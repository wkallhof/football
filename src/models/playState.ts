import { RenderPlayer } from "./Player";
import Ball from "./ball";

export default class PlayState{
    public ball: Ball;
    public playerWithBall: RenderPlayer;
    public playClock: number;
    public flagThrown: boolean;
    public isBeforeSnap: boolean;
}