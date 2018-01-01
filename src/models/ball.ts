import * as Phaser from "phaser-ce";
import ObjectUtil from "../utilities/objectUtil";

export default class Ball {
    public sprite: Phaser.Sprite;
    private game: Phaser.Game;

    constructor(game: Phaser.Game, sprite: Phaser.Sprite) {
        this.sprite = sprite;
        this.game = game;
    }

    public getLocation(): Phaser.Point {
        return this.sprite.parent ?
            ObjectUtil.childSpriteWorldLocation(this.sprite, this.game) :
            ObjectUtil.spriteToWorldPos(this.sprite);
    }
}