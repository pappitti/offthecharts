//all stats in the sorare matrix
const statIndex=["Yellow_Card","Was_Fouled","ErrorToShot",
            "DoubleDouble","TripleDouble","TripleTriple","LostCtrl","DuelLost","DuelWon",
          "BigChanceCreated","AttAssists","Accurate_Passes","FinalThirdPasses","On_Target","WonContest","PenAreaEntries","Missed_Penalty","BigChanceMissed",
          "Save","SaveInBox","HighClaim","Punches","DiveSave","DiveCatch","CrossNotClaimed","SixSeconds","GKSmoother","KeeperSweeper","LongBalls",
          "MissedPasses","ThreeGoalsConceded","Clean_Sheet","ErrorLeadToGoal","GoalAssist","FoulsCommitted","Goals_Conceded","Clearances","WonTackles",
          "BlockedCrosses","OutfielderBlocks","PossessionWon","Interception","LongPassIntoOpposition","ClearanceOffLine","Own_Goals","PenaltyConceded",
          "LastManTackle","GoalsScored","PenaltyWon","Red_Card","Penalty_Save"];

//groups to consolidate stats in the radar chart, clockwise from in the radar chart
const scoringRadarKeys=["MISSED PENALTY","MISSED CHANCE","SHOTS ON TARGET","WON CONTEST","PENALTY AREA ENTRIES",
              "BIG CHANCE CREATED","ATTEMPTED ASSIST","PASSING","LONG PASSING",
              "POSSESSION","DUELS","INTERCEPTIONS","DOUBLES AND TRIPLES","FOULS","NON DECISIVE ERRORS",
              "BLOCKS AND CLEARANCES","TACKLES","GOALS CONCEDED",
              "SAVE","CLAIMS","PUNCHES","DIVING","6SECONDS","SMOOTHER","SWEEPER",
              "GOALKEEPING","DEFENDING","GENERAL","ASSISTS","GOALS"];

//groups related to All Around
const AAradarkeys=["POSSESSION","DUELS","INTERCEPTIONS","DOUBLES AND TRIPLES","FOULS","NON DECISIVE ERRORS",
             "BLOCKS AND CLEARANCES","TACKLES","GOALS CONCEDED",
             "SAVE","CLAIMS","PUNCHES","DIVING","6SECONDS","SMOOTHER","SWEEPER",
             "MISSED PENALTY","MISSED CHANCE","SHOTS ON TARGET","WON CONTEST","PENALTY AREA ENTRIES",
             "BIG CHANCE CREATED","ATTEMPTED ASSIST","PASSING","LONG PASSING"];
//groups related to Decisive Actions
const DAradarkeys=["ASSISTS","GENERAL","DEFENDING","GOALKEEPING","GOALS"];

//legend for each stat
const areaDetails={"FOULS":["-Yellow Card","+Was Fouled","-Fouls Committed"],"DOUBLES AND TRIPLES":["+Double Double","+Triple Double","+Triple Triple"],
              "NON DECISIVE ERRORS":["-Error Leads To Shot"],
              "POSSESSION":["-Lost Control","+Possession Won"],"DUELS":["-Duel Lost","+Duel Won"],
              "BIG CHANCE CREATED":["+Big Chance Created"],"ATTEMPTED ASSIST":["+Attempted Assists"],
              "PASSING":["+Accurate Passes","-Missed Passes"],"LONG PASSING":["+Final Third Passes","+Long Balls","+Long Pass Into Opposition"],
             "SHOTS ON TARGET":["+On Target"],"WON CONTEST":["+Won Contest"],"PENALTY AREA ENTRIES":["+Penalty Area Entries"],
             "MISSED PENALTY":["-Missed Penalty"],"MISSED CHANCE":["-Big Chance Missed"],
             "INTERCEPTIONS":["+Interception"],
             "SAVE":["+Save","+Save In Box"],"CLAIMS":["+High Claim","-Cross Not Claimed"],"PUNCHES":["+Punches"],
             "DIVING":["+Dive Save","+Dive Catch"],"6SECONDS":["-6 Seconds"],"SMOOTHER":["+Goalkeeper Smoother"],
             "SWEEPER":["+Sweeper"],"GOALKEEPING":["+Clean Sheet","-3 Goals Conceded","+Penalty Save"],
             "GOALS CONCEDED":["+Clean Sheet (excl. GK)","-Goals Conceded"],
             "DEFENDING":["-Error Leads To Goal","+Clearance Off The Line","+Last Man Tackle"],
             "ASSISTS":["+Assist","-Penalty Conceded","+Penalty Won"],
             "BLOCKS AND CLEARANCES":["+Clearances","+Blocked Crosses","+Outfielder Blocks"],"TACKLES":["+Won Tackles"],
             "GENERAL":["-Red Card"],"GOALS":["+Goal","-Own Goal"]};

//Sorare scoring matrix. Note that, for cleansheets, there are two entries, one for goalkeepers and one for defenders as CS is a decisive for GKs but not for defenders
const scoringMatrix={"Yellow_Card":{"category":"GENERAL","subcategory":"FOULS","Goalkeeper":-3,"Defender":-3,"Midfielder":-3,"Forward":-3},
              "Was_Fouled":{"category":"GENERAL","subcategory":"FOULS","Goalkeeper":0,"Defender":0,"Midfielder":1,"Forward":1},
              "ErrorToShot":{"category":"GENERAL","subcategory":"NON DECISIVE ERRORS","Goalkeeper":-5,"Defender":-5,"Midfielder":-3,"Forward":-3},
              "DoubleDouble":{"category":"GENERAL","subcategory":"DOUBLES AND TRIPLES","Goalkeeper":0,"Defender":4,"Midfielder":4,"Forward":4},
              "TripleDouble":{"category":"GENERAL","subcategory":"DOUBLES AND TRIPLES","Goalkeeper":0,"Defender":6,"Midfielder":6,"Forward":6},
              "TripleTriple":{"category":"GENERAL","subcategory":"DOUBLES AND TRIPLES","Goalkeeper":0,"Defender":12,"Midfielder":12,"Forward":12},
              "LostCtrl":{"category":"POSSESSION","subcategory":"POSSESSION","Goalkeeper":-0.3,"Defender":-0.6,"Midfielder":-0.5,"Forward":-0.1},
              "DuelLost":{"category":"POSSESSION","subcategory":"DUELS","Goalkeeper":0,"Defender":-2,"Midfielder":-0.8,"Forward":-1},
              "DuelWon":{"category":"POSSESSION","subcategory":"DUELS","Goalkeeper":0,"Defender":1.5,"Midfielder":0.8,"Forward":1},
              "BigChanceCreated":{"category":"PASSING","subcategory":"BIG CHANCE CREATED","Goalkeeper":3,"Defender":3,"Midfielder":3,"Forward":3},
              "AttAssists":{"category":"PASSING","subcategory":"ATTEMPTED ASSIST","Goalkeeper":2,"Defender":3,"Midfielder":2,"Forward":2},
              "Accurate_Passes":{"category":"PASSING","subcategory":"PASSING","Goalkeeper":0.1,"Defender":0.08,"Midfielder":0.1,"Forward":0.1},
              "FinalThirdPasses":{"category":"PASSING","subcategory":"LONG PASSING","Goalkeeper":0.5,"Defender":0.4,"Midfielder":0.3,"Forward":0.1},
              "On_Target":{"category":"ATTACKING","subcategory":"SHOTS ON TARGET","Goalkeeper":3,"Defender":3,"Midfielder":3,"Forward":3},
              "WonContest":{"category":"ATTACKING","subcategory":"WON CONTEST","Goalkeeper":0,"Defender":0.5,"Midfielder":0.5,"Forward":0.5},
              "PenAreaEntries":{"category":"ATTACKING","subcategory":"PENALTY AREA ENTRIES","Goalkeeper":0,"Defender":0.5,"Midfielder":0.5,"Forward":0.5},
              "Missed_Penalty":{"category":"ATTACKING","subcategory":"MISSED PENALTY","Goalkeeper":-5,"Defender":-5,"Midfielder":-5,"Forward":-5},
              "BigChanceMissed":{"category":"ATTACKING","subcategory":"MISSED CHANCE","Goalkeeper":-5,"Defender":-5,"Midfielder":-5,"Forward":-5},
              "Save":{"category":"GOALKEEPING","subcategory":"SAVE","Goalkeeper":2,"Defender":0,"Midfielder":0,"Forward":0},
              "SaveInBox":{"category":"GOALKEEPING","subcategory":"SAVE","Goalkeeper":2,"Defender":0,"Midfielder":0,"Forward":0},
              "HighClaim":{"category":"GOALKEEPING","subcategory":"CLAIMS","Goalkeeper":1.5,"Defender":0,"Midfielder":0,"Forward":0},
              "Punches":{"category":"GOALKEEPING","subcategory":"PUNCHES","Goalkeeper":1.5,"Defender":0,"Midfielder":0,"Forward":0},
              "DiveSave":{"category":"GOALKEEPING","subcategory":"DIVING","Goalkeeper":3,"Defender":0,"Midfielder":0,"Forward":0},
              "DiveCatch":{"category":"GOALKEEPING","subcategory":"DIVING","Goalkeeper":3.5,"Defender":0,"Midfielder":0,"Forward":0},
              "CrossNotClaimed":{"category":"GOALKEEPING","subcategory":"CLAIMS","Goalkeeper":-3,"Defender":0,"Midfielder":0,"Forward":0},
              "SixSeconds":{"category":"GOALKEEPING","subcategory":"6SECONDS","Goalkeeper":-5,"Defender":0,"Midfielder":0,"Forward":0},
              "GKSmoother":{"category":"GOALKEEPING","subcategory":"SMOOTHER","Goalkeeper":5,"Defender":0,"Midfielder":0,"Forward":0},
              "KeeperSweeper":{"category":"GOALKEEPING","subcategory":"SWEEPER","Goalkeeper":3,"Defender":0,"Midfielder":0,"Forward":0},
              "LongBalls":{"category":"PASSING","subcategory":"LONG PASSING","Goalkeeper":0.2,"Defender":0.5,"Midfielder":0.5,"Forward":0},
              "MissedPasses":{"category":"PASSING","subcategory":"PASSING","Goalkeeper":-0.2,"Defender":-0.2,"Midfielder":-0.3,"Forward":0},
              "ThreeGoalsConceded":{"category":"NEGATIVE DA","subcategory":"GOALKEEPING","Goalkeeper":-1,"Defender":0,"Midfielder":0,"Forward":0},
              "Clean_Sheet":[{"category":"POSITIVE DA","subcategory":"GOALKEEPING","Goalkeeper":1,"Defender":0,"Midfielder":0,"Forward":0},
                             {"category":"DEFENDING","subcategory":"GOALS CONCEDED","Goalkeeper":0,"Defender":10,"Midfielder":0,"Forward":0}],
              "ErrorLeadToGoal":{"category":"NEGATIVE DA","subcategory":"DEFENDING","Goalkeeper":-1,"Defender":-1,"Midfielder":-1,"Forward":-1},
              "GoalAssist":{"category":"POSITIVE DA","subcategory":"ASSISTS","Goalkeeper":1,"Defender":1,"Midfielder":1,"Forward":1},
              "FoulsCommitted":{"category":"GENERAL","subcategory":"FOULS","Goalkeeper":-1,"Defender":-2,"Midfielder":-1,"Forward":-0.5},
              "Goals_Conceded":{"category":"DEFENDING","subcategory":"GOALS CONCEDED","Goalkeeper":-3,"Defender":-4,"Midfielder":-2,"Forward":0},
              "Clearances":{"category":"DEFENDING","subcategory":"BLOCKS AND CLEARANCES","Goalkeeper":0,"Defender":0.5,"Midfielder":0,"Forward":0},
              "WonTackles":{"category":"DEFENDING","subcategory":"TACKLES","Goalkeeper":0,"Defender":3,"Midfielder":3,"Forward":0},
              "BlockedCrosses":{"category":"DEFENDING","subcategory":"BLOCKS AND CLEARANCES","Goalkeeper":0,"Defender":1,"Midfielder":1,"Forward":0},
              "OutfielderBlocks":{"category":"DEFENDING","subcategory":"BLOCKS AND CLEARANCES","Goalkeeper":0,"Defender":2,"Midfielder":1,"Forward":0},
              "PossessionWon":{"category":"POSSESSION","subcategory":"POSSESSION","Goalkeeper":0,"Defender":0.5,"Midfielder":0.5,"Forward":0},
              "Interception":{"category":"POSSESSION","subcategory":"INTERCEPTIONS","Goalkeeper":0,"Defender":3,"Midfielder":3,"Forward":3},
              "LongPassIntoOpposition":{"category":"PASSING","subcategory":"LONG PASSING","Goalkeeper":0,"Defender":0.5,"Midfielder":0,"Forward":0},
              "ClearanceOffLine":{"category":"POSITIVE DA","subcategory":"DEFENDING","Goalkeeper":1,"Defender":1,"Midfielder":1,"Forward":1},
              "Own_Goals":{"category":"NEGATIVE DA","subcategory":"GOALS","Goalkeeper":-1,"Defender":-1,"Midfielder":-1,"Forward":-1},
              "PenaltyConceded":{"category":"NEGATIVE DA","subcategory":"ASSISTS","Goalkeeper":-1,"Defender":-1,"Midfielder":-1,"Forward":-1},
              "LastManTackle":{"category":"POSITIVE DA","subcategory":"DEFENDING","Goalkeeper":1,"Defender":1,"Midfielder":1,"Forward":1},
              "GoalsScored":{"category":"POSITIVE DA","subcategory":"GOALS","Goalkeeper":1,"Defender":1,"Midfielder":1,"Forward":1},
              "PenaltyWon":{"category":"POSITIVE DA","subcategory":"ASSISTS","Goalkeeper":1,"Defender":1,"Midfielder":1,"Forward":1},
              "Red_Card":{"category":"NEGATIVE DA","subcategory":"GENERAL","Goalkeeper":-1,"Defender":-1,"Midfielder":-1,"Forward":-1},
              "Penalty_Save":{"category":"POSITIVE DA","subcategory":"GOALKEEPING","Goalkeeper":1,"Defender":1,"Midfielder":1,"Forward":1}};

//number of angles for each category in the radar chart
const Categoryangles={"FOULS":2,"NON DECISIVE ERRORS":2,"DOUBLES AND TRIPLES":2,"POSSESSION":3,"DUELS":3,"BIG CHANCE CREATED":1,
                    "ATTEMPTED ASSIST":2,"PASSING":1,"LONG PASSING":3,"SHOTS ON TARGET":2,"WON CONTEST":1,"PENALTY AREA ENTRIES":2,
                "MISSED PENALTY":2,
                "MISSED CHANCE":2,
                "INTERCEPTIONS":3,
                "SAVE":4,
                "CLAIMS":1,
                "PUNCHES":1,
                "DIVING":1,
                "6SECONDS":1,
                "SMOOTHER":1,
                "SWEEPER":1,
                "GOALKEEPING":1,
                "GOALS CONCEDED":6,
                "DEFENDING":1,
                "ASSISTS":1,
                "BLOCKS AND CLEARANCES":1,
                "TACKLES":2,
                "GENERAL":1,
                "GOALS":1};

/*radius, padx,pady,baseradius as pct of radius*/
const profileRadarSizes={"BIG_MULTI":[134, 8, 10, 0.33],
                   "SMALL_MULTI":[95, 11, 11, 0.33],
                   "SMALL":[95, 11, 11,0.25],
                   "VERY_SMALL":[25, 10, 5, 0.33]};

//matrix of positions {short name:long name}
const positions={"DEF":"Defender","GK":"Goalkeeper","MID":"Midfielder","FW":"Forward"};
const pi=3.14159265358979

//colors used in the UI for each player, up to 4 players, each index in an array is a player
const indexColors={dark:["rgba(255,0,0,1)", "rgba(0,0,255,1)", "rgba(0,128,0,1)", "rgba(128,0,128,1)"],
                  medium:["rgba(255,0,0,0.5)", "rgba(0,0,255,0.5)", "rgba(0,128,0,0.5)", "rgba(128,0,128,0.5)"],
                   light:["rgba(255,0,0,0.25)", "rgba(0,0,255,0.25)", "rgba(0,128,0,0.25)", "rgba(128,0,128,0.25)"]};

//also set via CSS see global.css root variables
const decilesColors=["#ff6868","#dd8416","#f89f31","#d8b21b","#81bf50","#65a434","#50bf84","#33a066","#169a54","#106a3a"];

export {decilesColors,indexColors,Categoryangles,profileRadarSizes,positions,pi,scoringMatrix, scoringRadarKeys, DAradarkeys,AAradarkeys,statIndex,areaDetails}