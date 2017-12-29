import * as Assets from '../assets';
import { CameraUtil } from "../utilities/CameraUtil";
import MatchState from "../models/matchState";
import PlayState from "../models/playState";
import * as _ from "lodash";
import { Player, RenderPlayer } from '../models/player';
import { PlayRoute, Play } from '../models/play';
import Team from "../models/Team";
import Field from '../models/field';
import { ThoughtRequest } from '../ai/mind';
import { PlayerPosition } from '../models/playerPosition';

export default class Down extends Phaser.State {

    private cameraUtil: CameraUtil;
    private player: Phaser.Sprite;

    private cursors: Phaser.CursorKeys;
    private playerGroup: Phaser.Group;
    private backgroundTemplateSprite: Phaser.Sprite = null;

    private matchState: MatchState;

    private defensePlayers: Array<RenderPlayer> = new Array<RenderPlayer>();
    private offensePlayers: Array<RenderPlayer> = new Array<RenderPlayer>();

    private playState: PlayState;

    init(matchState: MatchState): void{
        this.matchState = matchState;
        this.loadPlayers(this.matchState);
    }

    create(): void {
        this.cameraUtil = new CameraUtil(this.game);
        this.setupWorld();

        this.playState = new PlayState();
        this.playState.isBeforeSnap = true;
        this.playState.playerWithBall = _.find(this.offensePlayers, (player: RenderPlayer) => {
            return player.info.position == PlayerPosition.QB;
        });
        console.log(this.playState.playerWithBall);

        var coords = this.matchState.field.translateYardsToCoords(this.matchState.fieldPosition);

        this.playerGroup = this.game.add.group();
        this.player = this.getPlayerSprite(coords.x - 300, coords.y, 0x00000);

        this.drawYardLine(this.matchState);

        this.startHudle(this.offensePlayers, true);
        this.startHudle(this.defensePlayers, false);

        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.game.input.onTap.add(this.onTap, this);
        this.game.camera.follow(this.player, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);
        this.player.body.onBeginContact.add(this.onPlayerHit, this);
    }

    private setupWorld() {
        this.game.add.sprite(0, 0, Assets.Images.ImagesField.getName());
        this.game.world.setBounds(0, 0, 1260, 2500);
        //	Enable p2 physics
        this.game.physics.startSystem(Phaser.Physics.P2JS);

        //  Make things a bit more bouncey
        this.game.physics.p2.restitution = 0.5;
    }

    drawYardLine(matchState: MatchState) {

        let coords = matchState.field.translateYardsToCoords(matchState.fieldPosition);

        const graphics = this.game.make.graphics(); // adds to the world stage
        graphics.lineStyle(2, 0xffff00, 1);
        graphics.moveTo(0, coords.y);
        graphics.lineTo(1260, coords.y);
        this.game.add.sprite(0, coords.y, graphics.generateTexture());
    }

    startHudle(players: Array<RenderPlayer>, isOffense: boolean) {

        console.log("Starting huddle", players);

        let offset = 200;
        let mod = isOffense ? 1 : -1;
        let team = isOffense ? this.matchState.offenseTeam : this.matchState.defenseTeam;

        let ballCoords = this.matchState.field.translateYardsToCoords(this.matchState.fieldPosition);
        for (let i = 0; i < players.length; i++) {
            let player = players[i];
            let x = ballCoords.x;
            let y = ballCoords.y + (mod * offset) + (mod * i * 40);

            let sprite = this.getPlayerSprite(x, y, team.color);
            player.sprite = sprite;
        }
    }

    loadPlayers(matchState: MatchState) {
        this.offensePlayers = this.loadPlayerFromPlay(matchState.offenseTeam, matchState.offensePlay);
        this.defensePlayers = this.loadPlayerFromPlay(matchState.defenseTeam, matchState.defensePlay);
    }

    loadPlayerFromPlay(team: Team, play: Play): Array<RenderPlayer> {
        let output = new Array<RenderPlayer>();
        for (let i = 0; i < play.playRoutes.length; i++) {
            let route = play.playRoutes[i];
            // find the player if they haven't already been selected and match the position
            var player = _.find(team.players, (player: Player) => {
                return !_.some(this.offensePlayers, { "number": player.number, "position": player.position })
                    && player.position == route.position;
            });

            if (player != null) {
                output.push(new RenderPlayer(player, route.route, team.color));
            }
        }

        return output;
    }

    update(): void {
        this.managePlayerInput();
        this.executeThought(this.offensePlayers);
        this.executeThought(this.defensePlayers);
    }

    executeThought(players: Array<RenderPlayer>) {
        for (let i = 0; i < players.length; i++) {
            let player = players[i];
            player.info.mind.think(new ThoughtRequest(player, this.matchState, this.playState));
        }
    }

    onPlayerHit(body: Phaser.Physics.P2.Body, bodyB, shapeA, shapeB, equation) {
        if (body == null || equation[0] == null) return;

        const velocity1 = new Phaser.Point(equation[0].bodyB.velocity[0], equation[0].bodyB.velocity[1]);
        const velocity2 = new Phaser.Point(equation[0].bodyA.velocity[0], equation[0].bodyA.velocity[1]);
        let force = Phaser.Point.distance(velocity1, velocity2) / 2000;
        
        this.game.camera.shake(force, 200);
    }

    onTap(pointer, doubleTap) {
        console.log(pointer);
        console.log(`${pointer.x + this.game.camera.x},${pointer.y + this.game.camera.y}`);
    }

    managePlayerInput() {
        const shiftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
        const jukeLeft = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
        const jukeRight = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
        const space = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        const modifier = shiftKey.isDown ? 2 : 1;
        
        if (space.justDown) {
            if (!this.playState.isBeforeSnap) {
                console.log("Reset!");
                this.playState.isBeforeSnap = true;
                this.cameraUtil.zoom(1);
            }
            else {
                this.cameraUtil.zoom(0.75);
                console.log("Hut hut! - ball snapped -");
                this.playState.isBeforeSnap = false;
            }
        }

        if (jukeLeft.justDown) {
            this.player.body.thrustLeft(10000);
        }
        if (jukeRight.justDown) {
            this.player.body.thrustRight(10000);
        }

        if (this.cursors.left.isDown) {
            this.player.body.rotateLeft(50 * modifier);
        }
        else if (this.cursors.right.isDown) {
            this.player.body.rotateRight(50 * modifier);
        }
        else {
            this.player.body.setZeroRotation();
        }
    
        if (this.cursors.up.isDown) {
            this.player.body.thrust(400 * modifier);
        }
        else if (this.cursors.down.isDown) {
            this.player.body.reverse(200);
        }
    }

    getPlayerSprite(x: number, y: number, color: number): Phaser.Sprite {
        const graphics = this.game.make.graphics(); // adds to the world stage
        graphics.beginFill(color);
        graphics.lineStyle(2, 0xFFFFFF, 1);
        graphics.moveTo(15, 0);
        graphics.lineTo(15, 5);
        graphics.drawRect(5, 5, 20, 20);
        graphics.endFill();
        var player = this.game.add.sprite(x, y, graphics.generateTexture());
        this.playerGroup.add(player);
        this.game.physics.p2.enable(player);

        //  Modify a few body properties
        player.body.damping = 0.8;
        return player;
    }
}