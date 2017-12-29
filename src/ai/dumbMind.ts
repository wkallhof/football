import  { Mind, ThoughtRequest } from "./mind";

export default class DumbMind extends Mind {
    public think(request: ThoughtRequest) {
        let ballPosition = request.matchState.field.translateYardsToCoords(request.matchState.fieldPosition)
        this.runRoute(request.player, request.matchState, request.beforeSnap);
    }
}