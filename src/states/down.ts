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
import { StateManager, States } from '../utilities/stateManager';

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
        this.cameraUtil.zoom(1);
        this.setupWorld();

        this.playState = new PlayState();
        this.playState.isBeforeSnap = true;
        this.playState.playerWithBall = _.find(this.offensePlayers, (player: RenderPlayer) => {
            return player.info.position == PlayerPosition.QB;
        });

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
        this.logState();
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

    drawLargeText(text: string, intensity: number) {
        var style = { font: "60px Arial", fill: "#ffffff", align: "center" };
        let cameraCenter = this.cameraUtil.getCurrentCenter();
        var textObj = this.game.add.text(this.game.camera.x + this.game.camera.width, cameraCenter.y, text, style);
        textObj.anchor.set(0.5);
        textObj.stroke = "#000000";
        textObj.strokeThickness = 4;
        //  Apply the shadow to the Stroke only
        textObj.setShadow(5, 5, 'rgba(0,0,0,0.5)', 15, true, false);
        this.game.add.tween(textObj).to({ x: cameraCenter.x, y: cameraCenter.y }, 2000, Phaser.Easing.Cubic.Out, true);
        this.game.camera.shake(0.005, 1200);
    }

    /**
     * Responsible for rendering players for the down, starting
     * in their huddle.
     * @param players 
     * @param isOffense 
     */
    startHudle(players: Array<RenderPlayer>, isOffense: boolean) {

        let offset = 150;
        let mod = isOffense ? 1 : -1;
        let team = isOffense ? this.matchState.offenseTeam : this.matchState.defenseTeam;

        let ballCoords = this.matchState.field.translateYardsToCoords(this.matchState.fieldPosition);
        for (let i = 0; i < players.length; i++) {
            let player = players[i];
            let x = ballCoords.x - 200 + (40 * i);
            let y = ballCoords.y + (offset * mod);

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
        if (this.playState.playOver) return;
    
        //touchdown
        if (this.matchState.field.inTargetEndzone(this.playState.ball.getLocation())) {
            this.handleTouchdown();
            return;
        }

        // out of bounds
        if (this.playState.playerWithBall && this.matchState.field.isOutOfBounds(this.playState.playerWithBall.location)) {
            this.handleOutOfBounds();
            return;
        }

        this.cameraUtil.update();
        this.managePlayerInput();
        this.executeThought(this.offensePlayers);
        this.executeThought(this.defensePlayers);
    }

    render(): void{
        this.game.debug.text( this.debugTextValue, 10, 10 );
    }

    triggerNextState(seconds: number) {
        this.game.time.events.add(seconds * Phaser.Timer.SECOND, () => {
            StateManager.start(States.SELECT_PLAY, this.game, this.matchState);
        }, this);
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

        // no need to check tackle of play over or ball in the air
        if (this.playState.playOver || this.playState.ballThrown) return;

        let playerHit = this.getPlayerFromBody(body);
        if (!playerHit) return;

        let playerTackled = !this.playerIsOnOffense(playerHit);
        if (playerTackled) {
            this.handleTackle();
        }
    }

    logState() {
        console.log(`Quarter: ${this.matchState.quarter}, Down: ${this.matchState.currentDown}`);
    }

    handleTackle() {
        console.log("tackled!");
        this.handlePlayOver();
        this.matchState.fieldPosition = this.matchState.field.translateToYards(this.playState.ball.getLocation().y);
        this.matchState.currentDown++;
        if (this.matchState.currentDown > 4) {
            this.matchState.currentDown = 1;
            this.handleTurnoverOnDowns();
        }
        this.triggerNextState(3);
    }

    handleMissedPass() {
        console.log("Miss!");
        this.playState.playOver = true;
        this.matchState.currentDown++;
        if (this.matchState.currentDown > 4) {
            this.matchState.currentDown = 1;
            this.handleTurnoverOnDowns();
        }
        this.triggerNextState(3);
    }

    handleTouchdown() {
        console.log("Touchdown!!");
        this.drawLargeText("TOUCHDOWN", 10);
        this.handlePlayOver();
        this.matchState.fieldPosition = 90;
        this.matchState.currentDown = 1;
        this.triggerNextState(3);
    }

    handleOutOfBounds() {
        console.log("Out of bounds!");
        this.handlePlayOver();
        this.matchState.fieldPosition = this.matchState.field.translateToYards(this.playState.ball.getLocation().y);
        this.triggerNextState(3);
    }

    handlePlayOver() {
        let newLocation = this.matchState.field.translateToYards(this.playState.ball.getLocation().y);
        this.playState.playOver = true;
        console.log(`Gain of ${Math.round(this.matchState.fieldPosition - newLocation)} yards`);
    }

    handleSafety() {
        console.log("Safety!");
        this.playState.playOver = true;
        this.matchState.fieldPosition = 90;
        this.triggerNextState(3);
    }

    handleTurnoverOnDowns() {
        console.log("Turnover on Downs!");
        this.playState.playOver = true;
        this.matchState.fieldPosition = 90;
        this.triggerNextState(3);
    }

    onTap(pointer, doubleTap) {
        let clickXWorld = (pointer.x + this.game.camera.x) / this.game.camera.scale.x;
        let clickYWorld = (pointer.y + this.game.camera.y) / this.game.camera.scale.y;
        this.throwBall(new Phaser.Point(clickXWorld, clickYWorld));
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
        if (this.playState.playOver || !this.playState.playerWithBall || this.playState.ballThrown) return;

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
            this.handleMissedPass();
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
            if (this.player.sprite.body) {
                this.player.sprite.body.onBeginContact.removeAll();
            }
            
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

    getPlayerFromBody(body: Phaser.Physics.P2.Body) : RenderPlayer {
        let allPlayers = _.union(this.offensePlayers, this.defensePlayers);
        return _.find(allPlayers, (player: RenderPlayer) => {
            return player.sprite.body === body;
        });
    }

    playerIsOnOffense(player: RenderPlayer) {
        return _.indexOf(this.offensePlayers, player) > -1;
    }
}