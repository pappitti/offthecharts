# INTRODUCING OFF_THE_CHARTS

Off_the_charts is a data visualization project dedicated to sports statistics. 
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). It was initially designed to learn and practice frontend development and explore data visualization concepts.  
  
The polar chart was developed so that the area is proportional to a score according to a given scoring matrix. In this example, the Sorare matrix. This allows to compare players across various positions and to track performance over time. script for the path in the radarPath.js file. angle breakdown in /pictures/BigRadar.png. 
Find more information about the genesis of the project here : https://pitti.fr/2023/05/not-all-sports-statistics-are-equal   
The area chart leverages the Victory library (Formidable). Icons from Font Awesome, Google Fonts and SorareData.com

# Next steps / roadmap :
- search by name instead of slug input (requires backend)
- add DA icons in area chart tooltip
- expand tooltip to show all gamedata

# IP & Copyright
Stats and player information (including pictures) are fetched from the SorareAPI [https://github.com/sorare/api] via an intermediary API. see details below. Nothing is stored in a proprietary database.  
If you intend to use the code for commercial purpose, please make sure you get the necessary approvals from the third parties mentioned above.  
If you are not an experienced developer, feel free to just use the app and break it. It is part of the learning process...

# Intermediary API
API response is largely based on SorareAPI info unless stated otherwise below.  

data:{  
    slug,  
    age,  
    club,  
    displayName,  
    nationalTeam,  
    pictureURL,  
    position: "GK" || "DEF" || "MID" || "FW", // calculated based on player Position, see dict in statics.js  
    games:[{...},{...},{...}]// array of games, each game is a dict (see below)  
}  
  
// Each game dict is populated via a script to process sorareAPI data - keys are a legacy of my own DB (sorry, hopefully it's straightforward, I add comments below when necessary) -values are stat values (sum of events, not points scored), scoring is calculated in app based on matrix in statics.js  
  
game dict content :  
{  
    Accurate_Passes,  
    AttAssists,  
    BigChanceCreated,  
    BigChanceMissed,  
    BlockedCrosses,  
    Clean_Sheet,  
    ClearanceOffLine,  
    Clearances,  
    CrossNotClaimed,  
    DiveCatch,  
    DiveSave,  
    DoubleDouble,  
    DuelLost,  
    DuelWon,  
    ErrorLeadToGoal,  
    ErrorToShot,  
    FinalThirdPasses,  
    FoulsCommitted,  
    GKSmoother,  
    GoalAssist,  
    GoalsScored,  
    Goals_Conceded,  
    HighClaim,  
    Interception,  
    KeeperSweeper,  
    LastManTackle,  
    LongBalls,  
    LongPassIntoOpposition,  
    LostCtrl,  
    Mins_Played,  
    MissedPasses,  
    Missed_Penalty,  
    On_Target,  
    OutfielderBlocks,  
    Own_Goals,  
    PenAreaEntries,  
    PenaltyConceded,  
    PenaltyWon,  
    Penalty_Save,  
    PossessionWon,  
    Punches,  
    Red_Card,  
    SO5score,  
    Save,  
    SaveInBox,  
    SixSeconds,  
    ThreeGoalsConceded,  
    TripleDouble,  
    TripleTriple,  
    Was_Fouled,  
    WonContest,  
    WonTackles,  
    Yellow_Card,  
    awayGoals,  
    awayTeam,  
    base: 35 || 25 || 0, // calculated depending on formationPlace and Mins_Played  
    competition,  
    date,  
    decile, // int(so5score/10) || 9 if so5score==100  
    formation : "starter"||"substitute"||"bench"||"out", // calculated based on formationPlace and Mins_Played  
    gameType: "Club"||"NationalTeam", calculated based on sorareAPI info  
    homeGoals,  
    homeTeam,  
    playedFor, || calculated based on sorareAPI info  
}  
