import * as Phaser from "phaser-ce";

export default class ObjectUtil{

    /**
     * Calculates the rotation angle between two points
     * @param sourcePoint starting source point to calculate angle from 
     * @param targetPoint target point to calculate angle to
     */
    public static calculateRotationAngleToPoint(sourcePoint: Phaser.Point, targetPoint: Phaser.Point): number {
        if (!sourcePoint || !targetPoint) throw "Argument not set";
        
        return Math.atan2(targetPoint.y - sourcePoint.y, targetPoint.x -sourcePoint.x);
    }

    public static calculateSpriteRotationAngleToPoint(sourcePoint: Phaser.Point, targetPoint: Phaser.Point): number{
        return this.calculateRotationAngleToPoint(sourcePoint, targetPoint) + Phaser.Math.degToRad(90);
    }

    /**
     * Given two points, calculate if they are close enough to eachother. 
     * @param point Point to check if close enough to destination
     * @param destPoint Destination point to check against
     * @param deviation How far apart they can be
     */
    public static pointsAreCloseEnough(point: Phaser.Point, destPoint: Phaser.Point, deviation: number = 0): boolean {
        if (!point || !destPoint) throw "Argument not set";

        return Math.abs(point.x - destPoint.x) < 3 && Math.abs(point.y - destPoint.y) < 3;
    }

    /**
     * Uses pythagoras formula to calculate distance between two points
     * @param point1 First point to check distance from
     * @param point2 Second point to check distance to
     */
    public static GetDistanceBetweenPoints(point1: Phaser.Point, point2: Phaser.Point): number {
        if (!point1 || !point2) throw "Null point passed in";

        var a = point1.x - point2.x;
        var b = point1.y - point2.y;
        
        return Math.sqrt( a*a + b*b );
    }

    /**
     * Given a sprite, return a Phaser Point of the local screen position.
     * @param sprite Sprite to translate to screen position coordinates
     */
    public static spriteToScreenPos(sprite: Phaser.Sprite) : Phaser.Point{
        if (!sprite) throw "Null sprite passed in.";

        return sprite.position;
    }

    /**
     * Given a sprite, rturn the Phaser Point of the world position.
     * @param sprite Sprite to translate to world position coordinates
     */
    public static spriteToWorldPos(sprite: Phaser.Sprite) : Phaser.Point{
        if (!sprite) throw "Null sprite passed in.";

        let worldPos = sprite.worldPosition;
        return new Phaser.Point(worldPos.x, worldPos.y);
    }

    public static childSpriteWorldLocation(sprite: Phaser.Sprite, game: Phaser.Game): Phaser.Point{
        if (!sprite) throw "Null sprite passed in";

        let x = sprite.world.x / game.camera.scale.x;
        let y = sprite.world.y / game.camera.scale.y;

        return new Phaser.Point(x, y);
    }
}