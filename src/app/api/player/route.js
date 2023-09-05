import { NextResponse } from 'next/server'
 

//graphQL query for player info
const playerInfo=`query myplayersinfo($slug:String!){
  player(slug:$slug){
        slug
        activeClub{name}
        activeNationalTeam{name}
        pictureUrl(derivative:"avatar")
        age
        displayName
        positionTyped
}
}  
`;

//graphQL query for first page of game stats
const playerSo5Stats=`query myplayersstats($slug:String!){
  player(slug:$slug){
        allSo5Scores{
            pageInfo{
                      startCursor
                      endCursor
                      hasNextPage
                    }
             nodes{
                  score
                  detailedScore{
                    category
                    points
                    stat
                    statValue
                    totalScore
                  }
                  playerGameStats{
                    formationPlace
                    team{
                        ...on Club
                        {slug}
                        ...on NationalTeam
                        {slug}
                      }
                    game {
                      date
                      id
                      status
                      competition{slug}
                      so5Fixture{slug}
                      awayTeam{
                        __typename
                        ...on Club
                        {slug}
                        ...on NationalTeam
                        {slug}
                      }
                      awayGoals
                      homeTeam{
                        __typename
                        ...on Club
                        {slug}
                        ...on NationalTeam
                        {slug}
                      }
                      homeGoals
                    }
                  }
             }
        }
    }
}`;

//graphQL query for other pages of game stats
const playerotherpages=`query myplayersstats($slug:String!,$text:String){
  player(slug:$slug){
        allSo5Scores(after:$text){
            pageInfo{
                  startCursor
                  endCursor
                  hasNextPage
                }
             nodes{
                  score
                  detailedScore{
                    category
                    points
                    stat
                    statValue
                    totalScore
                  }
                  playerGameStats{
                    formationPlace
                    team{
                        ...on Club
                        {slug}
                        ...on NationalTeam
                        {slug}
                      }
                    game {
                      date
                      id
                      status
                      competition{slug}
                      so5Fixture{slug}
                      awayTeam{
                        __typename
                        ...on Club
                        {slug}
                        ...on NationalTeam
                        {slug}
                      }
                      awayGoals
                      homeTeam{
                        __typename
                        ...on Club
                        {slug}
                        ...on NationalTeam
                        {slug}
                      }
                      homeGoals
                    }
                  }
             }
        }
    }
}`;

//matrix of positions {long name: short name}
const positions={"Defender":"DEF","Goalkeeper":"GK","Midfielder":"MID","Forward":"FW"};

async function fetchStats(playerSlug,previousEndCursor){
  const fetchQuery=previousEndCursor?playerotherpages:playerSo5Stats;
  const fetchVariables=previousEndCursor?{"slug":playerSlug,"text":previousEndCursor}:{"slug":playerSlug};
  //fetch game stats using query and variables above
  const res= await fetch(process.env.SORARE_APIURL, {
    method: 'POST',
    headers: {
        "Content-Type": "application/json",
        "apiKey": process.env.SORARE_API_KEY
        },
    body: JSON.stringify({
        query: fetchQuery,
        variables: fetchVariables
        })
    });
  const gameData= await res.json();

  //date of last game after which the fetch loop ends
  const lastGame=new Date("2022-01-01T00:00:00Z").getTime();
  let allGames=[];
  const gamelist=gameData["data"]["player"]["allSo5Scores"];
  if (gamelist["nodes"].length!=0){
    //cursor will be used to fetch next page of games
    const endCursor=gamelist["pageInfo"]["endCursor"];
    //building array of stats for each game in current page of games
    const maxGameDate=Math.min(...gamelist["nodes"].map(game=>new Date(game["playerGameStats"]["game"]["date"])));
    allGames=gamelist["nodes"].map(game=>{
      const dateapi=game["playerGameStats"]["game"]["date"];
      const competitionapi=game["playerGameStats"]["game"]["competition"]["slug"];
      const homegoalsapi=game["playerGameStats"]["game"]["homeGoals"];
      const awaygoalsapi=game["playerGameStats"]["game"]["awayGoals"];
      const hometeamapi=game["playerGameStats"]["game"]["homeTeam"]["slug"];
      const awayteamapi=game["playerGameStats"]["game"]["awayTeam"]["slug"];
      // type of game (club or national team)
      let typeapi="Club";
      if ((game["playerGameStats"]["game"]["homeTeam"]["__typename"]=="NationalTeam") && (game["playerGameStats"]["game"]["awayTeam"]["__typename"]=="NationalTeam")){
        typeapi="NationalTeam"};
      
      //gamestats
      const scoreapi=game["score"];
      //decile will be used for bar chart in UI
      let decileapi=9;
      if (scoreapi!=100){
        decileapi=Math.floor(scoreapi/10) 
        } 
      const playedforapi=game["playerGameStats"]["team"]["slug"];
      //object with individual stats for each game, level socre excluded as it will be calculated with formation below
      let detailedscore=Object.keys(game["detailedScore"]).filter(item=>game["detailedScore"][item]["stat"]!="level_score").reduce((acc,item)=>{acc[game["detailedScore"][item]["stat"]]=game["detailedScore"][item]["statValue"]; return acc},{});
      const minsplayed=detailedscore["mins_played"]?detailedscore["mins_played"]:null;
      //formation is the status (starter,substitute,bench, out)
      let formationapi="out";
      let baseapi=0;
      if (game["playerGameStats"]["formationPlace"]!=null){
        if (game["playerGameStats"]["formationPlace"]>0){
          formationapi="starter";
          baseapi=35}
        else if (minsplayed>0){
          formationapi="substitute";
          baseapi=25}
        else {formationapi="bench"};
      };
      //for each stats, null values if undertermined
      const yellowcard=detailedscore["yellow_card"]?detailedscore["yellow_card"]:null;
      const wasfouled=detailedscore["was_fouled"]?detailedscore["was_fouled"]:null;
      const errorleadtoshot=detailedscore["error_lead_to_shot"]?detailedscore["error_lead_to_shot"]:null;
      const doubledouble=detailedscore["double_double"]?detailedscore["double_double"]:null;
      const tripledouble=detailedscore["triple_double"]?detailedscore["triple_double"]:null;
      const tripletriple=detailedscore["triple_triple"]?detailedscore["triple_triple"]:null;
      const lostctrl=detailedscore["poss_lost_ctrl"]?detailedscore["poss_lost_ctrl"]:null;
      const duellost=detailedscore["poss_lost_ctrl"]?detailedscore["duel_lost"]:null;
      const duelwon=detailedscore["duel_won"]?detailedscore["duel_won"]:null;
      const bigchancecreated=detailedscore["big_chance_created"]?detailedscore["big_chance_created"]:null;
      const attassists=detailedscore["adjusted_total_att_assist"]?detailedscore["adjusted_total_att_assist"]:null;
      const accpass=detailedscore["accurate_pass"]?detailedscore["accurate_pass"]:null;
      const finalthird=detailedscore["successful_final_third_passes"]?detailedscore["successful_final_third_passes"]:null;
      const ontargetatt=detailedscore["ontarget_scoring_att"]?detailedscore["ontarget_scoring_att"]:null;
      const woncontest=detailedscore["won_contest"]?detailedscore["won_contest"]:null;
      const penareaentries=detailedscore["pen_area_entries"]?detailedscore["pen_area_entries"]:null;
      const missedpenalty=detailedscore["penalty_kick_missed"]?detailedscore["penalty_kick_missed"]:null;
      const bigchancemissed=detailedscore["big_chance_missed"]?detailedscore["big_chance_missed"]:null;
      const saves=detailedscore["saves"]?detailedscore["saves"]:null;
      const saveinbox=detailedscore["saved_ibox"]?detailedscore["saved_ibox"]:null;
      const highclaim=detailedscore["good_high_claim"]?detailedscore["good_high_claim"]:null;
      const punches=detailedscore["punches"]?detailedscore["punches"]:null;
      const divesave=detailedscore["dive_save"]?detailedscore["dive_save"]:null;
      const divecatch=detailedscore["dive_catch"]?detailedscore["dive_catch"]:null;
      const crossnotclaimed=detailedscore["cross_not_claimed"]?detailedscore["cross_not_claimed"]:null;
      const sixsecond=detailedscore["six_second_violation"]?detailedscore["six_second_violation"]:null;
      const gksmoother=detailedscore["gk_smother"]?detailedscore["gk_smother"]:null;
      const keepersweeper=detailedscore["accurate_keeper_sweeper"]?detailedscore["accurate_keeper_sweeper"]:null;
      const longballs=detailedscore["accurate_long_balls"]?detailedscore["accurate_long_balls"]:null;
      const missedpass=detailedscore["missed_pass"]?detailedscore["missed_pass"]:null;
      const threegoals=detailedscore["three_goals_conceded"]?detailedscore["three_goals_conceded"]:null;
      const cleansheet=detailedscore["clean_sheet_60"]?detailedscore["clean_sheet_60"]:null;
      const errorleadtogoal=detailedscore["error_lead_to_goal"]?detailedscore["error_lead_to_goal"]:null;
      const goalassist=detailedscore["goal_assist"]?detailedscore["goal_assist"]:null;
      const fouls=detailedscore["fouls"]?detailedscore["fouls"]:null;
      const goalsconceded=detailedscore["goals_conceded"]?detailedscore["goals_conceded"]:null;
      const clearances=detailedscore["effective_clearance"]?detailedscore["effective_clearance"]:null;
      const wontackle=detailedscore["won_tackle"]?detailedscore["won_tackle"]:null;
      const blockedcross=detailedscore["blocked_cross"]?detailedscore["blocked_cross"]:null;
      const outfielderblock=detailedscore["outfielder_block"]?detailedscore["outfielder_block"]:null;
      const posswon=detailedscore["poss_won"]?detailedscore["poss_won"]:null;
      const interception=detailedscore["interception_won"]?detailedscore["interception_won"]:null;
      const longpassintoopp=detailedscore["long_pass_own_to_opp_success"]?detailedscore["long_pass_own_to_opp_success"]:null;
      const clearanceoffline=detailedscore["clearance_off_line"]?detailedscore["clearance_off_line"]:null;
      const owngoal=detailedscore["own_goals"]?detailedscore["own_goals"]:null;
      const penaltyconceded=detailedscore["penalty_conceded"]?detailedscore["penalty_conceded"]:null;
      const lastmantackle=detailedscore["last_man_tackle"]?detailedscore["last_man_tackle"]:null;
      const goals=detailedscore["goals"]?detailedscore["goals"]:null;
      const penaltywon=detailedscore["assist_penalty_won"]?detailedscore["assist_penalty_won"]:null;
      const redcard=detailedscore["red_card"]?detailedscore["red_card"]:null;
      const penaltysave=detailedscore["penalty_save"]?detailedscore["penalty_save"]:null;

      const gameStatsApi={"date":dateapi.substring(0, 10),
      "competition":competitionapi,
      "homeTeam":hometeamapi,
      "homeGoals":homegoalsapi,
      "awayTeam":awayteamapi,
      "awayGoals":awaygoalsapi,
      "playedFor":playedforapi,
      "gameType":typeapi,
      "decile":decileapi,
      "SO5score":scoreapi,
      "formation":formationapi,
      "base":baseapi,
      "Mins_Played":minsplayed,
      "Yellow_Card":yellowcard,
      "Was_Fouled":wasfouled,
      "ErrorToShot":errorleadtoshot,
      "DoubleDouble":doubledouble,
      "TripleDouble":tripledouble,
      "TripleTriple":tripletriple,
      "LostCtrl":lostctrl,
      "DuelLost":duellost,
      "DuelWon":duelwon,
      "BigChanceCreated":bigchancecreated,
      "AttAssists":attassists,
      "Accurate_Passes":accpass,
      "FinalThirdPasses":finalthird,
      "On_Target":ontargetatt,
      "WonContest":woncontest,
      "PenAreaEntries":penareaentries,
      "Missed_Penalty":missedpenalty,
      "BigChanceMissed":bigchancemissed,
      "Save":saves,
      "SaveInBox":saveinbox,
      "HighClaim":highclaim,
      "Punches":punches,
      "DiveSave":divesave,
      "DiveCatch":divecatch,
      "CrossNotClaimed":crossnotclaimed,
      "SixSeconds":sixsecond,
      "GKSmoother":gksmoother,
      "KeeperSweeper":keepersweeper,
      "LongBalls":longballs,
      "MissedPasses":missedpass,
      "ThreeGoalsConceded":threegoals,
      "Clean_Sheet":cleansheet,
      "ErrorLeadToGoal":errorleadtogoal,
      "GoalAssist":goalassist,
      "FoulsCommitted":fouls,
      "Goals_Conceded":goalsconceded,
      "Clearances":clearances,
      "WonTackles":wontackle,
      "BlockedCrosses":blockedcross,
      "OutfielderBlocks":outfielderblock,
      "PossessionWon":posswon,
      "Interception":interception,
      "LongPassIntoOpposition":longpassintoopp,
      "ClearanceOffLine":clearanceoffline,
      "Own_Goals":owngoal,
      "PenaltyConceded":penaltyconceded,
      "LastManTackle":lastmantackle,
      "GoalsScored":goals,
      "PenaltyWon":penaltywon,
      "Red_Card":redcard,
      "Penalty_Save":penaltysave
      }
    
      return gameStatsApi
      }
      )
     //recursive loop to fetch next page of games (if any) before last game
    if ((maxGameDate>lastGame) && gamelist["pageInfo"]["hasNextPage"]){
      allGames=[...allGames,... await fetchStats(playerSlug,endCursor)]
    }
    }
  return allGames
}

export async function POST(request) {
  const body=await request.json();
  const bodyrequest = JSON.stringify(body);

  //fetch player information using query and variables above
  const res= await fetch(process.env.SORARE_APIURL, {
    method: 'POST',
    headers: {
        "Content-Type": "application/json",
        "apiKey": process.env.SORARE_API_KEY
    },
    body: JSON.stringify({
        query: playerInfo,
        variables: bodyrequest
    })
});
  const playersapi= await res.json(); 
  if (playersapi.errors) {
    console.error(playersapi.errors);
    throw new Error('Failed to fetch API');
}
  const nameapi=playersapi["data"]["player"]["displayName"];
  const positionapi=playersapi["data"]["player"]["positionTyped"];
  const ageapi=playersapi["data"]["player"]["age"];
  const pictureAPI=playersapi["data"]["player"]["pictureUrl"];
  const currentclubapi=playersapi["data"]["player"]["activeClub"]?playersapi["data"]["player"]["activeClub"]["name"]:null;
  const currentnationapi=playersapi["data"]["player"]["activeNationalTeam"]?playersapi["data"]["player"]["activeNationalTeam"]["name"]:null;
  //object that will be passed to the app, calling fetchStats to get games stats
  const playerTemplate={"slug":body.slug,"displayName":nameapi,"club":currentclubapi,"nationalTeam":currentnationapi,"age":ageapi,"pictureURL":pictureAPI,"position":positions[positionapi],"games": await fetchStats(body.slug)};


  return NextResponse.json(playerTemplate);
}