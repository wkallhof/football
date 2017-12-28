import * as Phaser from "phaser-ce";
import { Scene } from "./Scene";

class SceneManager{

    private scenes: Array<Scene>;
    private game: Phaser.Game;
    
    public currentScene: Scene;
    public currentSceneIndex: number;

    constructor(game : Phaser.Game) {
        this.game = game;
        this.scenes = new Array<Scene>();
        this.currentSceneIndex = 0;
    }

    public start() {
        if (this.scenes.length == 0) return;

        let scene = this.scenes[this.currentSceneIndex];
        scene.create();
    }

    public addScene() {
        
    }

    public nextScene() {
        
    }

    public goToSceneByTitle(title: string, data:any) {
        
    }

    public goToSceneByIndex(index: number, data: any) {
        if (index < 0 || index > (this.scenes.length - 1)) return;

        this.endCurrentScene();

        let scene = this.scenes[index];
        scene.create
    }

    private endCurrentScene() : any {
        if (this.currentScene == null) return;

        this.currentScene.finish();
    }
}