import * as Phaser from "phaser-ce";

export class CameraUtil {

    private game: Phaser.Game;

    constructor(game: Phaser.Game) {
        this.game = game;
    }

    zoom(zoomLevel: number) {
        //console.log(this.game.world.scale);
        //this.game.world.scale.set(zoomLevel);
        this.game.add.tween(this.game.camera.scale).to( { x: zoomLevel, y:zoomLevel }, 2000, "Linear", true);
    }
}