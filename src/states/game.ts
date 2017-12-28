import * as Assets from '../assets';
import { CameraUtil } from "../utilities/CameraUtil";

export default class Game extends Phaser.State {

    private cameraUtil: CameraUtil;
    private player: Phaser.Sprite;
    private computerPlayers: Array<any>;

    private cursors: Phaser.CursorKeys;
    private playerGroup: Phaser.Group;
    private targetPlayer: boolean;
    private backgroundTemplateSprite: Phaser.Sprite = null;

    create(): void {
        this.cameraUtil = new CameraUtil(this.game);

        this.game.add.sprite(0,0, Assets.Images.ImagesField.getName());
        this.game.world.setBounds(0,0,1260, 2500);
        //	Enable p2 physics
	    this.game.physics.startSystem(Phaser.Physics.P2JS);
    
        //  Make things a bit more bouncey
        this.game.physics.p2.restitution = 0.8;

        this.playerGroup = this.game.add.group(); 
        this.player = this.addPlayer(20, 20);
        this.targetPlayer = false;

        this.computerPlayers = new Array<any>();
        this.computerPlayers.push({
            player: this.addPlayer(383, 541),
            dest: new Phaser.Point(329, 334)
        }, {
            player: this.addPlayer(336, 561),
            dest: new Phaser.Point(359, 334)    
        }, {
            player: this.addPlayer(465, 508),
            dest: new Phaser.Point(389, 334)    
        },{
            player: this.addPlayer(530, 508),
            dest: new Phaser.Point(419, 334)    
        });

        //this.player.body.fixedRotation = true;

        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.game.input.onTap.add(this.onTap, this);
        this.game.camera.follow(this.player, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);
        this.player.body.onBeginContact.add(this.onPlayerHit, this);
    }

    update(): void{

        this.managePlayerInput();
        this.computerPlayers.forEach((value) => {
            this.manageComputerInput(value);
        });
    }

    onPlayerHit(body : Phaser.Physics.P2.Body, bodyB, shapeA, shapeB, equation) {
        if (body == null || equation[0] == null) return;

        const velocity1 = new Phaser.Point(equation[0].bodyB.velocity[0], equation[0].bodyB.velocity[1]);
        const velocity2 = new Phaser.Point(equation[0].bodyA.velocity[0], equation[0].bodyA.velocity[1]);
        let force = Phaser.Point.distance(velocity1, velocity2) / 2000;

        console.log(force);

        this.game.camera.shake(force, 200);
    }

    onTap(pointer, doubleTap) {
        console.log(`${pointer.x},${pointer.y}`);
    }

    manageComputerInput(computer) {
        
        this.accelerateToPoint(computer.player, this.targetPlayer? this.player : computer.dest, 400);
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
            this.targetPlayer = !this.targetPlayer;
            this.cameraUtil.zoom(this.targetPlayer ? 0.75 : 1);
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

    addPlayer(x: number, y: number) : Phaser.Sprite {
        const graphics = this.game.make.graphics(); // adds to the world stage
        graphics.beginFill(0x000000);
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
