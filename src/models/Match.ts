import Team from "./Team";

class Match{
    public HomeTeam: Team;
    public AwayTeam: Team;

    constructor(homeTeam: Team, awayTeam: Team) {
        this.HomeTeam = homeTeam;
        this.AwayTeam = awayTeam;
    }

    start() {
        // start clock
    }
}