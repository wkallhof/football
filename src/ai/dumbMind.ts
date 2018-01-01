import  { Mind, ThoughtRequest } from "./mind";

export default class DumbMind extends Mind {
    public think(request: ThoughtRequest) {
        if (request.playState.ballThrown && request.playState.ballTargetDestination) {
            this.runToLocation(request.player, request.playState.ballTargetDestination, 300);
            return;
        }
        let ballPosition = request.matchState.field.translateYardsToCoords(request.matchState.fieldPosition)
        this.runRoute(request.player, request.matchState, request.playState.isBeforeSnap);
    }
}