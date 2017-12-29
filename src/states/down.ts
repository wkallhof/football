import * as Assets from '../assets';
import { CameraUtil } from "../utilities/CameraUtil";
import MatchState from "../models/matchState";
import * as _ from "lodash";
import Player from '../models/player';
import { PlayRoute, Play } from '../models/play';
import Team from "../models/Team";
import Field from '../models/field';

export default class Down extends Phaser.State {

    private cameraUtil: CameraUtil;
    private player: Phaser.Sprite;

    private cursors: Phaser.CursorKeys;
    private playerGroup: Phaser.Group;
    private backgroundTemplateSprite: Phaser.Sprite = null;

    private matchState: MatchState;
    private beforeSnap: boolean = true;

    private defensePlayers: Array<RenderPlayer> = new Array<RenderPlayer>();
    private offensePlayers: Array<RenderPlayer> = new Array<RenderPlayer>();

    init(matchState: MatchState): void{
        this.matchState = matchState;
        this.loadPlayers(this.matchState);
    }

    create(): void {
        this.cameraUtil = new CameraUtil(this.game);

        this.game.add.sprite(0,0, Assets.Images.ImagesField.getName());
        this.game.world.setBounds(0,0,1260, 2500);
        //	Enable p2 physics
	    this.game.physics.startSystem(Phaser.Physics.P2JS);
    
        //  Make things a bit more bouncey
        this.game.physics.p2.restitution = 0.8;

        var coords = this.matchState.field.translateYardsToCoords(this.matchState.fieldPosition);

        this.playerGroup = this.game.add.group(); 
        this.player = this.getPlayerSprite(coords.x-300, coords.y, 0x00000);

        this.drawYardLine(this.matchState);

        this.startHudle(this.offensePlayers, true);
        this.startHudle(this.defensePlayers, false);

        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.game.input.onTap.add(this.onTap, this);
        this.game.camera.follow(this.player, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);
        this.player.body.onBeginContact.add(this.onPlayerHit, this);
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
        for (let i = 0; i < players.length; i++){
            let player = players[i];
            let x = ballCoords.x;
            let y = ballCoords.y + (mod * offset) + (mod * i * 40);

            let sprite = this.getPlayerSprite(x, y, team.color );
            player.sprite = sprite;
        }
    }

    loadPlayers(matchState: MatchState) {
        this.offensePlayers = this.loadPlayerFromPlay(matchState.offenseTeam, matchState.offensePlay);
        this.defensePlayers = this.loadPlayerFromPlay(matchState.defenseTeam, matchState.defensePlay);
    }

    loadPlayerFromPlay(team: Team, play: Play) : Array<RenderPlayer> {
        let output = new Array<RenderPlayer>();
        for (let i = 0; i < play.playRoutes.length; i++){
            let route = play.playRoutes[i];
            // find the player if they haven't already been selected and match the position
            var player = _.find(team.players, (player:Player) => {
                return !_.some(this.offensePlayers, { "number": player.number, "position": player.position })
                    && player.position == route.position;    
            });

            if (player != null) {
                output.push(new RenderPlayer(player, route.route, team.color));
            }
        }

        return output;
    }

    update(): void{

        this.managePlayerInput();
        this.manageComputerInput();
    }

    manageComputerInput() {
        let ballPosition = this.matchState.field.translateYardsToCoords(this.matchState.fieldPosition)
        this.runRoute(this.offensePlayers, ballPosition);
        this.runRoute(this.defensePlayers, ballPosition);
    }

    runRoute(players: Array<RenderPlayer>, ballCoords: Phaser.Point) {
        for (let i = 0; i < players.length; i++){
            let player = players[i];
            player.routeIndex = this.beforeSnap ? 0 : player.routeIndex;
            let routeTarget = player.route[player.routeIndex];
            let target = new Phaser.Point(routeTarget.x + ballCoords.x, routeTarget.y + ballCoords.y);

            // if the player is close to target, it is before the snap, and they still have moves to make, increment
            if (Math.abs(player.sprite.x - target.x) < 3
                && Math.abs(player.sprite.y - target.y) < 3
                && !this.beforeSnap
                && player.routeIndex != player.route.length - 1) {
                    player.routeIndex++;
            }
            else {
                this.accelerateToPoint(player.sprite, target, 300);
            }
        }
    }


    onPlayerHit(body : Phaser.Physics.P2.Body, bodyB, shapeA, shapeB, equation) {
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

    accelerateToPoint(object, point: Phaser.Point, speed: number) {
        if (Math.abs(object.body.x - point.x) < 3 && Math.abs(object.body.y - point.y) < 3) {
            object.body.rotation = 0;
            return;
        }
        const angle = this.rotateTowardsPoint(object, point);
        object.body.force.x = Math.cos(angle) * speed;    // accelerateToObject 
        object.body.force.y = Math.sin(angle) * speed;
    }

    rotateTowardsPoint(object, point: Phaser.Point): number {
        
        const angle = Math.atan2(point.y - object.y, point.x -object.x);
        object.body.rotation = angle + Phaser.Math.degToRad(90);
        return angle;
    }

    managePlayerInput() {
        const shiftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
        const jukeLeft = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
        const jukeRight = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
        const space = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        const modifier = shiftKey.isDown ? 2 : 1;
        
        if (space.justDown) {
            if (!this.beforeSnap) {
                console.log("Reset!");
                this.beforeSnap = true;
                this.cameraUtil.zoom(1);
            }
            else {
                this.cameraUtil.zoom(0.75);
                console.log("Hut hut! - ball snapped -");
                this.beforeSnap = false;
            }
        }

        if (jukeLeft.justDown) {
            this.player.body.thrustLeft(10000);
        }
        if (jukeRight.justDown) {
            this.player.body.thrustRight(10000);
        }

        if (this.cursors.left.isDown)
        {
            this.player.body.rotateLeft(50 * modifier);
        }
        else if (this.cursors.right.isDown)
        {
            this.player.body.rotateRight(50 * modifier);
        }
        else
        {
            this.player.body.setZeroRotation();
        }
    
        if (this.cursors.up.isDown)
        {
            this.player.body.thrust(400 * modifier);
        }
        else if (this.cursors.down.isDown)
        {
            this.player.body.reverse(200);
        }
    }

    getPlayerSprite(x: number, y: number, color:number) : Phaser.Sprite {
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

class RenderPlayer{
    public info: Player;
    public sprite: Phaser.Sprite;
    public route: Array<Phaser.Point>;
    public color: number;
    public routeIndex: number;

    constructor(info: Player, route: Array<Phaser.Point>, color: number) {
        this.info = info;
        this.route = route;
        this.color = color;
        this.routeIndex = 0;
    }
}