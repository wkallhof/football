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
import Ball from "../models/ball";
import ObjectUtil from '../utilities/objectUtil';

export default class Down extends Phaser.State {

    private debugTextValue: string;
    private cameraUtil: CameraUtil;
    private player: RenderPlayer;
    private playerSelectedIndicator: Phaser.Sprite;

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

        var coords = this.matchState.field.translateYardsToCoords(this.matchState.fieldPosition);

        this.playerGroup = this.game.add.group();
        
        this.drawYardLine(this.matchState);

        this.startHudle(this.offensePlayers, true);
        this.startHudle(this.defensePlayers, false);

        this.playState.ball = new Ball(this.game, this.getBallSprite(new Phaser.Point(0, 0)));
        this.playState.playerWithBall.sprite.addChild(this.playState.ball.sprite);

        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.game.input.onTap.add(this.onTap, this);
        this.cameraUtil.follow(this.playState.ball.sprite);

        this.playerSelectedIndicator = this.getPlayerSelectedIndicator();

        this.setUserControlledPlayer(this.playState.playerWithBall);
    }

    private setupWorld() {

        let fieldTexture = this.matchState.field.getFieldTexture(this.game);
        this.game.add.sprite(0, 0, fieldTexture);
        this.game.world.setBounds(0, 0, fieldTexture.width, fieldTexture.height);
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

    /**
     * Responsible for rendering players for the down, starting
     * in their huddle.
     * @param players 
     * @param isOffense 
     */
    startHudle(players: Array<RenderPlayer>, isOffense: boolean) {

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
                return !_.some(this.offensePlayers, (rPlayer: RenderPlayer) => { return player.number == rPlayer.info.number && player.position == rPlayer.info.position})
                    && player.position == route.position;
            });

            if (player != null) {
                output.push(new RenderPlayer(player, route.route, team.color));
            }
        }

        return output;
    }

    update(): void {
        this.cameraUtil.update();
        this.managePlayerInput();
        this.executeThought(this.offensePlayers);
        this.executeThought(this.defensePlayers);
    }

    render(): void{
        this.game.debug.text( this.debugTextValue, 10, 10 );
    }

    executeThought(players: Array<RenderPlayer>) {
        for (let i = 0; i < players.length; i++) {
            let player = players[i];
            if (player.isUser) continue;
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
        let clickXWorld = (pointer.x + this.game.camera.x) / this.game.camera.scale.x;
        let clickYWorld = (pointer.y + this.game.camera.y) / this.game.camera.scale.y;
        this.throwBall(new Phaser.Point(clickXWorld, clickYWorld));
        //console.log(`${clickXWorld},${clickYWorld}`);
        //console.log(this.matchState.field.translateToYards(clickYWorld));
        console.log(this.matchState.field.getDebugInfo(new Phaser.Point(clickXWorld, clickYWorld)));
    }

    resetDown() {
        console.log("Reset!");
        this.playState.isBeforeSnap = true;
        this.cameraUtil.zoom(1);
        let qb = _.find(this.offensePlayers, (player: RenderPlayer) => {
            return player.info.position == PlayerPosition.QB;
        });
        this.setPlayerWithBall(qb);
        this.setUserControlledPlayer(qb);
    }

    throwBall(point: Phaser.Point) {
        if (!this.playState.playerWithBall || this.playState.ballThrown) return;

        //TODO: Implement throw strength
        //TODO: Implement correct speed modifier;

        let speedMod = 2.5;
        let ball = this.playState.ball;

        this.playState.playerWithBall.sprite.removeChild(ball.sprite);
        ball.sprite.kill();
        ball = this.playState.ball = new Ball(this.game, this.getBallSprite(this.playState.playerWithBall.location));
        ball.sprite.rotation = ObjectUtil.calculateSpriteRotationAngleToPoint(ball.sprite.position, point);
        this.cameraUtil.follow(ball.sprite);
        const distance = ObjectUtil.GetDistanceBetweenPoints(ball.sprite.position, point);
        
        this.playState.ballThrown = true;
        this.playState.ballTargetDestination = point;

        let newState = { x: point.x, y: point.y};
        let throwTween = this.game.add.tween(ball.sprite).to(newState, distance * speedMod);
        throwTween.onComplete.add(this.onBallThrowFinish, this);
        throwTween.start();

        let scaleState = { x: 1.5, y: 1.5 };
        let endState = { x: 1, y: 1 };
        let startTween = this.game.add.tween(ball.sprite.scale).to(scaleState, (distance * speedMod) / 2);
        startTween.start();
        let endTween = this.game.add.tween(ball.sprite.scale).to(endState, (distance * speedMod) / 2);
        startTween.chain(endTween);
        startTween.start();
        this.playState.playerWithBall = null;
    }

    onBallThrowFinish() {
        //TODO: Check if behind line for fumble
        let allPlayers = _.union(this.offensePlayers, this.defensePlayers);

        let player = _.chain(allPlayers).filter((player: RenderPlayer) => {
            return ObjectUtil.GetDistanceBetweenPoints(player.location, this.playState.ball.getLocation()) < 30;
        }).orderBy((player: RenderPlayer) => {
            return ObjectUtil.GetDistanceBetweenPoints(player.location, this.playState.ball.getLocation());
            }, ["asc"]).head().value();
        
        if (!player) {
            this.resetDown();
        }
        else {
            this.setPlayerWithBall(player);
            this.setUserControlledPlayer(player);
        }
        
    }

    setPlayerWithBall(player: RenderPlayer) {
        this.playState.ball.sprite.kill();
        this.playState.ball = new Ball(this.game, this.getBallSprite(new Phaser.Point(0, 0)));
        this.playState.playerWithBall = player;
        this.playState.ballThrown = false;
        this.playState.ballTargetDestination = null;
        this.playState.playerWithBall.sprite.addChild(this.playState.ball.sprite);
        this.cameraUtil.follow(this.playState.ball.sprite);
    }

    setUserControlledPlayer(player: RenderPlayer) {
        if (this.player) {
            this.player.isUser = false;
            this.player.sprite.body.onBeginContact.removeAll();
            //this.player.sprite.removeChild(this.playerSelectedIndicator);
        }
        this.player = player;
        this.player.isUser = true;
        //this.player.sprite.addChild(this.playerSelectedIndicator);
        this.player.sprite.body.onBeginContact.add(this.onPlayerHit, this);
    }

    managePlayerInput() {
        const shiftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
        const upKey = this.game.input.keyboard.addKey(Phaser.Keyboard.W);
        const downKey = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
        const leftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
        const rightKey = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
        const space = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        const modifier = shiftKey.isDown ? 2 : 1;
        
        if (space.justDown) {
            if (!this.playState.isBeforeSnap) {
                this.resetDown();
            }
            else {
                this.cameraUtil.zoom(0.75);
                console.log("Hut hut! - ball snapped -");
                this.playState.isBeforeSnap = false;
            }
        }

        // if (leftKey.justUp && leftKey.duration < 250) {
        //     this.player.sprite.body.thrustLeft(5000);
        // }
        // if (rightKey.justUp && rightKey.duration < 250) {
        //     this.player.sprite.body.thrustRight(5000);
        // }

        if (leftKey.isDown) {
            this.player.sprite.body.rotateLeft(50 * modifier);
        }
        else if (rightKey.isDown) {
            this.player.sprite.body.rotateRight(50 * modifier);
        }
        else {
            this.player.sprite.body.setZeroRotation();
        }
    
        if (upKey.isDown) {
            this.player.sprite.body.thrust(300 * modifier);
        }
        else if (downKey.isDown) {
            this.player.sprite.body.reverse(200);
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

    getPlayerSelectedIndicator(): Phaser.Sprite {
        const graphics = this.game.make.graphics(); // adds to the world stage
        graphics.beginFill(0xCCFF66);
        graphics.drawCircle(20, 20, 40);
        graphics.endFill();
        let sprite = this.game.add.sprite(0, 0, graphics.generateTexture());
        sprite.anchor.set(0.5);
        return sprite;
    }

    getBallSprite(point: Phaser.Point): Phaser.Sprite{
        const graphics = this.game.make.graphics();
        graphics.beginFill(0x996633);
        graphics.drawEllipse(5, 7, 5, 7);
        let sprite = this.game.add.sprite(point.x, point.y, graphics.generateTexture());
        sprite.anchor.set(0.5);

        return sprite;
    }
}