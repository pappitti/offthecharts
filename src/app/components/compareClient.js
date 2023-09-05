'use client'
import React,{useState, useEffect} from 'react';
import scoringProfile, {radarDetails} from './radarPath.js';
import ScoreHistoryGraph from './scoreHistoryGraph.js';
import {indexColors,areaDetails,scoringRadarKeys} from './statics.js';
import Loader from './loading';

//initialize dates for default date filters
const today = new Date();
const lastMonth = new Date(today);
lastMonth.setMonth(lastMonth.getMonth()-1);


export default function CompareClient(props){
    const [filters, setFilters]=useState({
        startDate: lastMonth.toISOString().slice(0,10),
        endDate: today.toISOString().slice(0,10),
        averageOn: "played",
        decilesMax: 1 //can't be 0 because it will be used in a division (for the scale of the bar chart)
    });
    const [titleWidth, setTitleWidth]=useState(1000);
    const [players, setPlayers]=useState([]);// see addPlayer function for the structure of the player object
    const [filteredPlayers, setFilteredPlayers]=useState([]);//players filtered by date
    const [loading, setLoading]=useState(false);

    //the 5 functions may be on overkill as you can easily set the state directly in the onClick() event of the elements
    function handleChangeStartDate(event){
        setFilters({...filters, startDate:event.target.value});
    };

    function handleChangeEndDate(event){
        setFilters({...filters, endDate:event.target.value});
    };

    function handleChangeAverageOn(event){
        setFilters({...filters, averageOn:event.target.getAttribute("value")});
    };

    function updateDecilesMax(max){
        setFilters({...filters, decilesMax:max});
    };

    function handleChangeTitleWidth(newWidth){
        setTitleWidth(newWidth);
    };

    function handleRadarVisibility(event){
        const index = event.target.getAttribute("value");
        const newPlayers = [...players];
        newPlayers[index].radarVisible=!newPlayers[index].radarVisible;
        setPlayers(newPlayers);
    };

    function deletePlayer(event){
        const index = event.target.getAttribute("value");
        const newPlayers = [...players];
        newPlayers.splice(index,1);
        setPlayers(newPlayers);
        setFilters({...filters, decilesMax:1});
    };

    function addPlayer(slug){
        //only add a player if there are less than 4 players and if the strong is not empty
        if (slug && (players.length<4)){
            setLoading(true); // shows loading component in the UI whilst fetching
            const reqBody={slug:slug};
            fetch("/api/player", {body: JSON.stringify(reqBody), method: 'POST', next: { revalidate: 60 }})
            .then((response)=>{if (!response.ok){setLoading(false); return null} else{ return response.json()}})
            .then((data)=>{
                if (data){
                const playerData={};
                playerData.displayName=data.displayName;
                playerData.position=data.position;
                playerData.age=data.age;
                playerData.club=data.club;
                playerData.nationalTeam=data.nationalTeam;
                playerData.pictureSource=data.pictureURL;
                playerData.games=data.games
                playerData.radarVisible=true;
                setPlayers((prevState)=>[...prevState,playerData])
                };
            })
            .then(()=>setLoading(false)) //hides loading component in the UI when it's done
        };
    };

    function handleNewPlayer(event){
        event.preventDefault();
        const slug=event.currentTarget.elements[0].value;
        addPlayer(slug);
        event.currentTarget.elements[0].value=""; //clears the input field
    };
    //add players from the URL search parameters (if any)
    useEffect(()=>{
        if (props.players.length>0){
            props.players.map((item)=>{addPlayer(item)});
        }
    },[]);

    //only relevant games of players (given date filters) to calculate stats
    useEffect(()=>{
        setFilteredPlayers(players.map(item=>{return {...item,games:item.games.filter((game)=>game.date>=filters.startDate&&game.date<=filters.endDate)}}));
    },[players, filters.endDate, filters.startDate]);

    //defines the scale of the score distribution bar charts to be consistent across players
    useEffect(()=>{
        function findMaxDecile(playerGames){
            const maxStarters=Math.max(...[0,0,0,0,0,0,0,0,0,0].map((item, index)=>playerGames.filter((game)=>game.formation=="starter"&&game.decile==index).length),1)
            const maxNonStarters=Math.max(...[0,0,0,0,0,0,0,0,0,0].map((item, index)=>playerGames.filter((game)=>game.formation!="starter"&&game.decile==index).length),1)
            const maxDeciles = Math.max(maxStarters, maxNonStarters);
            return maxDeciles;
        }
        const maxDeciles = filteredPlayers.map((item)=>findMaxDecile(item.games)).reduce((max, item)=>{return Math.max(max, item)},1);
        updateDecilesMax(maxDeciles)
    },[filteredPlayers]);

    return(
        <div className="content">
            {/*the state will mostly be set through the filters so relevant functions are passed to the component*/}
            <Parameters param={filters} titleWidth={titleWidth} data={filteredPlayers}
                handleChangeStartDate={handleChangeStartDate}
                handleChangeEndDate={handleChangeEndDate}
                handleChangeAverageOn={handleChangeAverageOn}
                handleRadarVisibility={handleRadarVisibility}
                    handleChangeTitleWidth={handleChangeTitleWidth}/>
            <div className="container">
                    {/*the state will mostly be set through the filters so relevant functions are passed to the component*/}
                    <PlayersContent data={filteredPlayers} filters={filters} handleNewPlayer={handleNewPlayer} 
                    deletePlayer={deletePlayer} loading={loading} />
            </div>
        </div>
    )

}

export function Parameters (props){
    const [collapsed, setCollapsed]=useState(false);//for option to hide parameters on small screens
    const siteBranding=React.createRef();
    //tracks the width of a specific element and sets state accordingly. it will be used to set the UI in this component or others 
    useEffect(() => {
        const handleWindowResize = () => {
          if (siteBranding.current){
            const newWidth=siteBranding.current.getBoundingClientRect().width;
            props.handleChangeTitleWidth(newWidth);
        }
        };
    
        window.addEventListener("resize", handleWindowResize);
        return () => {
          window.removeEventListener("resize", handleWindowResize);
        };
      }, [siteBranding]);
    const handleCollapse=()=>{
        setCollapsed(!collapsed);
    };
    useEffect(()=>{if(props.titleWidth>500){setCollapsed(false)}}, [props.titleWidth]); // makes sure the parameters do not remain hidden if you enlarge window (toggle would not show so you would be stuck)

    return(
        <div className="parameters-wrapper">
            <div className="parameters" id="parameters" ref={siteBranding}>
            {/*next element only shows when titleWidth (size or div above) is lower than 995 pixels*/}
            {props.titleWidth<995 && <div className="parameters-title" onClick={()=>handleCollapse()}>{(collapsed)?"Show parameters ":"Hide parameters "}
                <svg width="11" height="6" viewBox="0 0 11 6" xmlns="http://www.w3.org/2000/svg" className={(collapsed)?"parameter-toggler":"parameter-toggler rotate180"}>
                    <path fill="var(--dark-orange)" d="M9.87564 0.224476C10.196 0.535394 10.2095 1.05326 9.90567 1.38115L6.01893 5.5763C5.49553 6.14123 4.62843 6.14123 4.10504 5.5763L0.218296 1.38115C-0.0854941 1.05325 -0.0720463 0.535394 0.248332 0.224475C0.568709 -0.086443 1.0747 -0.0726801 1.37849 0.255216L5.06198 4.231L8.74548 0.255216C9.04927 -0.0726798 9.55526 -0.0864426 9.87564 0.224476Z"></path>
                </svg>
                </div>}
                <div className="parameters-content" style={{display:(collapsed)?"none":"flex"}}>
                    <div className="parameters-content-col">
                    <label className="date-label" htmlFor="start-date">Between</label><input type="date" id="start-date" min="2022-01-01" max={props.param.endDate} value={props.param.startDate} onChange={(e)=>props.handleChangeStartDate(e)}/>
                    <label className="date-label" htmlFor="end-date">and</label><input type="date" id="end-date" min={props.param.startDate} value={props.param.endDate} onChange={(e)=>props.handleChangeEndDate(e)} />
                    </div>
                    <div className="parameters-content-col">
                    <div id="toggle-label">Show radar for games:</div>
                    <div className="radar-toggles">
                        {/*next element is a button for the radar options (effectively a div that change color when an option us selected)*/}
                        <div className="radar-toggle" value="played" onClick={(e)=>props.handleChangeAverageOn(e)} style={(props.param.averageOn==="played")?{backgroundColor:"var(--bright-orange)",color:"white"}:{}}>Played</div>
                        <div className="radar-toggle" value="started" onClick={(e)=>props.handleChangeAverageOn(e)} style={(props.param.averageOn==="started")?{backgroundColor:"var(--bright-orange)",color:"white"}:{}}>Started</div>
                    </div>
                    </div>
                </div>
                <div className="visibilityToggles">
                        {/*shows a checkbox for each selected player)*/}
                    {props.data.map((item,index)=><div key={"radarToggleWrapper"+index} className="radarToggleWrapper"><input key={"radarToggleBox"+index} id={"visibility"+index} value={index} type="checkbox" checked={props.data[index].radarVisible} onChange={(e)=>props.handleRadarVisibility(e)}/><label key={"radarToggleLabel"+index} htmlFor={"visibility"+index}> {item.displayName}</label></div>)}
                </div>
            </div>
        </div>
    );
}

//this component is the container for the players and the radar
function PlayersContent (props){
    return(
        <div>
            <div className="container-row">
                <div className="container-box player-box">
                    {/*generates a PlayerOverview component for each selected player*/}
                    {props.data.map((player, index) => <PlayerOverview key={index} playerIndex={index} data={player} filters={props.filters} deletePlayer={props.deletePlayer} updateDecilesMax={props.updateDecilesMax}/>)}
                     {/*component to search/add a additional player of there are fewer than 4 already*/}
                    {props.data.length < 4 && <NewPlayer handleNewPlayer={props.handleNewPlayer} loading={props.loading}/>}
                </div>
                <PlayerRadar data={props.data} filters={props.filters} handleRadarVisibility={props.handleRadarVisibility}/>
            </div>
            {/*score history only if there are selected players*/}
            {props.data.length>0 && <ScoreHistory data={props.data}/>}
        </div>    
    );
};

//this component contains information and stats about each player
function PlayerOverview (props){
    //sets the deciles for the score distribution bar chart. split between starters and non starters
    function distributeDecile(props){
        const starterDeciles = [0,0,0,0,0,0,0,0,0,0].map((item, index)=>props.data.games.filter((game)=>game.formation=="starter"&&game.decile==index).length);
        const nonStarterDeciles = [0,0,0,0,0,0,0,0,0,0].map((item, index)=>props.data.games.filter((game)=>game.formation!="starter"&&game.decile==index).length);
        return {starter:starterDeciles, nonStarter:nonStarterDeciles}
    }
    const filteredGames = props.data.games;
    const totalGames = filteredGames.length;
    const totalAvgScore = filteredGames.reduce((total, item)=>total+item.SO5score, 0)/totalGames;
    const totalGamesStarted = filteredGames.filter((item)=>item.formation=="starter").length;
    const totalAvgScoreStarted = filteredGames.filter((item)=>item.formation=="starter").reduce((total, item)=>total+item.SO5score, 0)/totalGamesStarted;
    const totalGamesPlayed = filteredGames.filter((item)=>item.formation=="starter"||item.formation=="substitute").length;;
    const totalAvgScorePlayed = filteredGames.filter((item)=>item.formation=="starter"||item.formation=="substitute").reduce((total, item)=>total+item.SO5score, 0)/totalGamesPlayed;
    //sets the background colors boxes with the averages
    const totalDecileCSS = "var(--decile"+((totalAvgScore===100)?10:Math.floor(totalAvgScore/10)+1)+")";
    const startedDecileCSS= "var(--decile"+((totalAvgScoreStarted===100)?10:Math.floor(totalAvgScoreStarted/10)+1)+")";
    const playedDecileCSS= "var(--decile"+((totalAvgScoreStarted===100)?10:Math.floor(totalAvgScorePlayed/10)+1)+")";
    const decilesArr = distributeDecile(props);
    return(
    <div className="player" style={{boxShadow:"5px 5px "+indexColors["light"][props.playerIndex]+",-5px -5px 1rem rgb(240,240,240)"}}>
            {/*color of the player's box are set in component indexColors importet form statics. This allows to change the olor everywhere are once. Could(should?) probably be done via CSS like deciles*/}
            <svg className="player-avatar" viewBox="0 0 108 108" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <clipPath id="avatarClip">
                        <path d="M88.5274044717331 60.3817910158241 A20 20 0 0 0 90.7881844381693 43.2094622878003 L81.2210986290405 20.1124739750159 A20 20 0 0 0 67.4798156916519 9.56841672770415 L42.6936941573037 6.30526192220486 A20 20 0 0 0 26.6916312534805 12.9335334029182 L11.4725955282641 32.7673669102038 A20 20 0 0 0 9.21181556183137 49.9396956382281 L18.778901370965 73.0366839510105 A20 20 0 0 0 32.5201843083557 83.5807411983194 L57.3063058427047 86.8438960038135 A20 20 0 0 0 73.3083687465265 80.2156245230968 Z"/>
                    </clipPath>
                </defs>
                <path stroke="white" strokeWidth="5px" fill="white" d="M93.4846287786021 60.6538196394811 A20 20 0 0 0 95.7454087450384 43.4814909114572 L84.2649057740838 15.7651049361162 A20 20 0 0 0 70.5236228366953 5.22104768880445 L40.7802769954776 1.30526192220534 A20 20 0 0 0 24.7782140916545 7.93353340291871 L6.51537122139491 31.7341336116611 A20 20 0 0 0 4.25459125496218 48.9064623396855 L15.7350942259225 76.6228483150241 A20 20 0 0 0 29.4763771633132 87.166905562333 L59.2197230045317 91.082691328926 A20 20 0 0 0 75.2217859083535 84.4544198482093 Z" />
                <image clipPath="url(#avatarClip)" href={props.data.pictureSource} height="75%" width="75%" y="5px" x="8px" preserveAspectRatio="xMidYMid"/>    
                <path stroke={indexColors["light"][props.playerIndex]} strokeWidth="5px" fill="none" d="M93.4846287786021 60.6538196394811 A20 20 0 0 0 95.7454087450384 43.4814909114572 L84.2649057740838 15.7651049361162 A20 20 0 0 0 70.5236228366953 5.22104768880445 L40.7802769954776 1.30526192220534 A20 20 0 0 0 24.7782140916545 7.93353340291871 L6.51537122139491 31.7341336116611 A20 20 0 0 0 4.25459125496218 48.9064623396855 L15.7350942259225 76.6228483150241 A20 20 0 0 0 29.4763771633132 87.166905562333 L59.2197230045317 91.082691328926 A20 20 0 0 0 75.2217859083535 84.4544198482093 Z" />
                <path stroke={indexColors["medium"][props.playerIndex]} strokeWidth="5px" fill="none" d="M88.5274044717331 60.3817910158241 A20 20 0 0 0 90.7881844381693 43.2094622878003 L81.2210986290405 20.1124739750159 A20 20 0 0 0 67.4798156916519 9.56841672770415 L42.6936941573037 6.30526192220486 A20 20 0 0 0 26.6916312534805 12.9335334029182 L11.4725955282641 32.7673669102038 A20 20 0 0 0 9.21181556183137 49.9396956382281 L18.778901370965 73.0366839510105 A20 20 0 0 0 32.5201843083557 83.5807411983194 L57.3063058427047 86.8438960038135 A20 20 0 0 0 73.3083687465265 80.2156245230968 Z" />
            </svg>
            <div className="player-col col-1" >
            </div>
            <div className="player-col col-2">
                <div className="player-info">{props.data.displayName} - {props.data.position} - {props.data.age}</div>
                <div className="player-info teams">{props.data.club}{(props.data.nationalTeam)?" & "+props.data.nationalTeam:""}</div>
                <div className="averages">
                    <div className="avg-block">
                        <div className="avg-score" style={{backgroundColor:totalDecileCSS}}>{Math.round(totalAvgScore)}</div>
                        <div className="avg-score-label">avg over<br /><span>{totalGames} games</span></div>
                    </div>
                    <div className="avg-block">
                        <div className="avg-score" style={{backgroundColor:playedDecileCSS}}>{Math.round(totalAvgScorePlayed)}</div>
                        <div className="avg-score-label">avg played<br/><span>{totalGamesPlayed}/{totalGames} ({Math.round(totalGamesPlayed/totalGames*100)}%)</span></div>
                    </div>
                    <div className="avg-block">
                        <div className="avg-score" style={{backgroundColor:startedDecileCSS}}>{Math.round(totalAvgScoreStarted)}</div>
                        <div className="avg-score-label">avg started<br/><span>{totalGamesStarted}/{totalGames} ({Math.round(totalGamesStarted/totalGames*100)}%)</span></div>
                    </div>
                </div>
            </div>
            <div className="player-col col-3">
                <div className="score-distribution">
                    <div className="distribution-title">Score distribution</div>
                    <div className="distribution-label starter">Start.</div>
                    {/*builds the distribution chart by iterating over the deciles arrays, setting height as a percentage of decilesmax*/}
                    {decilesArr.starter.map((item, index)=><div key={"starterDecile"+index} className={"decile-"+(index+1)+" starter"} style={{height:item/props.filters.decilesMax*100+"%"}}>
                                                            {/*only shows label if value is greater than 40% of the height*/}
                                                            {(item/props.filters.decilesMax>=0.4)?item:""}
                                                            </div>)}
                    <div className="distribution-label sub">Not Start.</div>
                    {decilesArr.nonStarter.map((item, index)=><div key={"NonStarterDecile"+index} className={"decile-"+(index+1)+" sub"} style={{height:item/props.filters.decilesMax*100+"%"}}>
                                                            {(item/props.filters.decilesMax>=0.4)?item:""}
                                                            </div>)}
                </div>
                <div className="stats-bottom-row">
                        {/*cummulative stats calculated directly in the element by counting (length) or adding (reduce)*/}
                        <div className="key-stats-title">Key stats</div>
                        <div className="played-icon">{totalGamesStarted}</div>
                        <div className="subbed-icon">{filteredGames.filter((item)=>item.formation=="substitute").length}</div>
                        <div className="bench-icon">{filteredGames.filter((item)=>item.formation=="bench").length}</div>
                        <div className="out-icon">{filteredGames.filter((item)=>item.formation=="out").length}</div>
                        <div className="decisives-title">Decisive actions</div>
                        <div className="goals-icon">{filteredGames.reduce((sum,item)=>sum+item.GoalsScored,0)}</div>
                        <div className="assists-icon">{filteredGames.reduce((sum,item)=>sum+item.GoalAssist,0)}</div>
                        <div className="penaltywon-icon">{filteredGames.reduce((sum,item)=>sum+item.PenaltyWon,0)}</div>
                        <div className="lastsave-icon">{filteredGames.reduce((sum,item)=>sum+item.ClearanceOffLine+item.LastManTackle,0)}</div>
                        <div className="red-icon">{filteredGames.reduce((sum,item)=>sum+item.Red_Card,0)}</div>
                        <div className="owngoal-icon">{filteredGames.reduce((sum,item)=>sum+item.Own_Goals,0)}</div>
                        <div className="error-icon">{filteredGames.reduce((sum,item)=>sum+item.ErrorLeadToGoal,0)}</div>
                        <div className="penaltycommitted-icon">{filteredGames.reduce((sum,item)=>sum+item.PenaltyConceded,0)}</div>
                </div>
            </div>
            {/*cross to delete player*/}
            <div className="box-closing">
                <i className="symbol size-20 fill" onClick={(e)=>props.deletePlayer(e)} value={props.playerIndex}>cancel</i>
            </div>
        </div>
    );
};

//box to add a new player
function NewPlayer(props){
return(
    <div className="player new-player">
        <form onSubmit={(e)=>props.handleNewPlayer(e)}>
            <div className="newPlayer-col"> Enter {/*player name <br/>or */}Sorare slug
                {/* link to help page*/}
                <a href="/sorare-slugs" target="_blank" rel="author">
                    <i className="symbol size-20 fill">help</i>
                </a>
            </div>
            <div className="newPlayer-col">
                <input type="text" className="add-player-input" placeholder="slug: joshua-kimmich" name="slug"/>
            </div>
            <div className="newPlayer-col">
                {/* shows loader if player is being added, button otherwise*/}
                {props.loading && <div className="loader-wrapper"><Loader/></div>}
                {!props.loading &&
                <button type="submit" className="add-button">
                    <i className="symbol size-20">add_circle</i>
                    Add Player
                </button>}
            </div>
        </form>
        
    </div>
);
}
//this component contains the radar
function PlayerRadar(props){
    const [areaHover, setAreaHover]=useState(null);
    const radarCanvas=React.createRef();


    //function that triggers the drawing when data or filters change. In hindsight, it would have been easier with SVGs (which is what I did later on for the transparent shapes to hollow hover) but it works fine so I did not change it
    useEffect(()=>{
        const canvas = radarCanvas.current;
        const ctx = canvas.getContext("2d");
        //clears the canvas
        ctx.clearRect(0,0,canvas.width,canvas.height);
        //iterates over the players and draws the radar for each only if it is visible. Function scoringProfile is defined in radarPath.js
        for (let i=0;i<props.data.length;i++){
            if(props.data[i].radarVisible){
                const mapInputs=[props.data[i].position, props.data[i].games.filter((item)=>(props.filters.averageOn==="started")?item.formation=="starter":item.Mins_Played>0),"BIG_MULTI"];
                drawRadar(ctx,scoringProfile(...mapInputs),i);
            }
        }
    },[props.data, props.filters.averageOn]);

    //opens new window with explanation of the radar
    function openImage(){
        window.open("/pictures/BigRadar.png", "Radar explanation", "width=950, height=650");
    }; 

    function drawRadar(context,coords,index){
        context.globalAlpha = 0.15;
        if (coords.length>0){
            context.beginPath();
            //i is a subshape of the radar, j is a point with coordinates x and y (j[0] and j[1])
            for (let i=0;i<coords.length;i++){
                context.moveTo(coords[i][0][0],coords[i][0][1]);
                for(let j=1;j<coords[i].length;j++){
                    context.lineTo(coords[i][j][0],coords[i][j][1]);
                }
                }
            context.fillStyle = indexColors["dark"][index];//uses correct color for the player defined in statics.js. Dark version because gloabl alpha is set above
            context.fill();
        }
    };

    function updateAreaHover(event){
        const category=event.target.getAttribute("value");
        const catDetails=areaDetails[category];//areaDetails is defined in statics.js
        setAreaHover([category,catDetails]
    )
    };

    function clearAreaHover(){
        setAreaHover(null)
    };
    return(
        <div className="radar-wrapper">
            <canvas ref={radarCanvas} className="container-box radar-box" height={285} width={285}>
            </canvas>
            <div className="radar-mask">
                {/*creates transparent shapes over the radar to allow hover. function is defined in radarPath.js*/}
                <svg  viewBox="0 0 285 285" xmlns="http://www.w3.org/2000/svg">
                    {radarDetails("BIG_MULTI").map((item,index)=>{
                        let path="M"+(item[0][0])+" "+(item[0][1]);
                        for (let i=1; i<item.length; i++){
                            path+=" L"+(item[i][0])+" "+(item[i][1]);
                                }
                        path+=" Z";
                        return <path key={"radarArea"+index} d={path} value={scoringRadarKeys[index]} onMouseOver={(e)=>updateAreaHover(e)} onMouseLeave={()=>clearAreaHover()} stroke="transparent" fill="transparent"/>
                    }
                    )}
                </svg>
            </div>
            {/*category and details only shown on Hover*/}
            {(areaHover) && <div className="radarTooltip tootipCategory">{areaHover[0]}</div>}
            {(areaHover) &&<ul className="radarTooltip tootipCategoryDetails">{areaHover[1].map((item,index)=><li key={"statitem"+index}>{item}</li>)}</ul>}
            {/*info icon to show radar details*/}
            <div className="info-icon" onClick={()=>openImage()}>
                <i className="symbol fill">info</i>
            </div>
        </div>
    );
};

//this component contains the score history graph, defined in scoreHistoryGraph.js
function ScoreHistory (props){
    const gameData=props.data.map((item)=>(item.radarVisible===true)?item.games:[]);
    //prepares input for the graph.
    const gameDataPoints=gameData.map((item,index)=>(item.length>0)?item.map((item2)=>{return {...item2,position:props.data[index].position,index:index}}):item);
    return(
        <div className="container-row">
            <div className="score-history">
                <ScoreHistoryGraph data={gameDataPoints}/>
            </div>
        </div>
    );
};
