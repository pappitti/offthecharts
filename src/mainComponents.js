import React,{useEffect, useState} from 'react';
import axios from 'axios';
import scoringProfile, {radarDetails} from './radarPath.js';
import ScoreHistoryGraph from './scoreHistoryGraph.js';
import {indexColors,areaDetails,scoringRadarKeys} from './statics.js';

const today = new Date();
const lastMonth = new Date(today);
lastMonth.setMonth(lastMonth.getMonth()-1);

class RadarApp extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            filters:{
                startDate:lastMonth.toISOString().slice(0,10),
                endDate:today.toISOString().slice(0,10),
                miniRadars:true,
                averageOn:"played",
                decilesMax:1
            },
            players:[],
            titleWidth:1000
        };
        this.handleChangeStartDate=this.handleChangeStartDate.bind(this);
        this.handleChangeEndDate=this.handleChangeEndDate.bind(this);
        this.addPlayer=this.addPlayer.bind(this);
        this.deletePlayer=this.deletePlayer.bind(this);
        this.updateDecilesMax=this.updateDecilesMax.bind(this);
        this.handleRadarVisibility=this.handleRadarVisibility.bind(this);
        this.handleChangeAverageOn=this.handleChangeAverageOn.bind(this);
        this.handleChangeTitleWidth=this.handleChangeTitleWidth.bind(this);
    };
    addPlayer(event){
        event.preventDefault();
        /*console.log("target", event.target.slug.value);*/
        axios.post(process.env.REACT_APP_APIURL, {
            "slug": event.target.slug.value
            })
            .then((response) => {
                let playerData={};
                console.log(response.data);
                playerData.displayName=response.data.displayName;
                playerData.age=response.data.age;
                playerData.club=response.data.club;
                playerData.nationalTeam=response.data.nationalTeam;
                playerData.pictureSource=response.data.pictureURL;
                playerData.position=response.data.position;
                playerData.games=response.data.games;
                playerData.radarVisible=true;
                this.setState({
                    filters:this.state.filters,
                    players:this.state.players.concat(playerData),
                    titleWidth:this.state.titleWidth
                 });
             })
            .then((error) => console.log(error));
        event.target.slug.value="";
    };
    deletePlayer(event){
        /*console.log(event.target.getAttribute("value"));*/
        this.setState({
            filters:{...this.state.filters, decilesMax:1},
            players:this.state.players.filter((player, index) => index != event.target.getAttribute("value")), 
            titleWidth:this.state.titleWidth
    })};
    handleChangeStartDate(event){
        this.setState({
            filters:{...this.state.filters, startDate:event.target.value, decilesMax:1},
            players:this.state.players,
            titleWidth:this.state.titleWidth});}
    handleChangeEndDate(event){
        this.setState({
            filters:{...this.state.filters, endDate:event.target.value, decilesMax:1},
            players:this.state.players,
            titleWidth:this.state.titleWidth});}
    updateDecilesMax(prop){
        this.setState({
            filters:{...this.state.filters, decilesMax:prop},
            players:this.state.players,
            titleWidth:this.state.titleWidth
        })
    };
    handleRadarVisibility(event){
        const index = event.target.getAttribute("value");
        const initState = this.state;
        initState.players[index].radarVisible= !initState.players[index].radarVisible;
        this.setState({
            ...initState
        });
    };
    handleChangeAverageOn(event){
        this.setState({
            filters:{...this.state.filters, averageOn:event.target.getAttribute("value")},
            players:this.state.players,
            titleWidth:this.state.titleWidth
        })
    };
    handleChangeTitleWidth(newWidth){
        this.setState({
            filters:this.state.filters,
            players:this.state.players,
            titleWidth:newWidth
        })
    };
    componentDidUpdate(){
        /*console.log(this.state)*/
    }
    render(){
        let filteredGames=this.state.players.map(item=>{return {...item, games:item.games.filter((game)=>game.date>=this.state.filters.startDate&&game.date<=this.state.filters.endDate)}})
        return(
            <div>
                <Header titleWidth={this.state.titleWidth} handleChangeTitleWidth={this.handleChangeTitleWidth}/>
                <main>
                    <div className="parameters-wrapper">
                        <Parameters param={this.state.filters} titleWidth={this.state.titleWidth} data={filteredGames}
                            handleChangeStartDate={this.handleChangeStartDate}
                            handleChangeEndDate={this.handleChangeEndDate}
                            handleChangeAverageOn={this.handleChangeAverageOn}
                            handleRadarVisibility={this.handleRadarVisibility}/>
                    </div>
                    <div className="container">
                            <PlayersContent data={filteredGames} filters={this.state.filters} addPlayer={this.addPlayer} 
                            deletePlayer={this.deletePlayer} updateDecilesMax={this.updateDecilesMax}/>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }
};

function Parameters (props){
    const [collapsed, setCollapsed]=useState(false);
    const handleCollapse=()=>{
        setCollapsed(!collapsed);
    };
    useEffect(()=>{if(props.titleWidth>500){setCollapsed(false)}}, [props.titleWidth]);
    return(
            <div>
                <div className="parameters" id="parameters">
                    {props.titleWidth<995 && <div className="parameters-title" onClick={handleCollapse}>{(collapsed)?"Show parameters ":"Hide parameters "}
                    <svg width="11" height="6" viewBox="0 0 11 6" xmlns="http://www.w3.org/2000/svg" className={(collapsed)?"parameter-toggler":"parameter-toggler rotate180"}>
                        <path fill="var(--dark-orange)" d="M9.87564 0.224476C10.196 0.535394 10.2095 1.05326 9.90567 1.38115L6.01893 5.5763C5.49553 6.14123 4.62843 6.14123 4.10504 5.5763L0.218296 1.38115C-0.0854941 1.05325 -0.0720463 0.535394 0.248332 0.224475C0.568709 -0.086443 1.0747 -0.0726801 1.37849 0.255216L5.06198 4.231L8.74548 0.255216C9.04927 -0.0726798 9.55526 -0.0864426 9.87564 0.224476Z"></path>
                    </svg>
                    </div>}
                    <div className="parameters-content" style={{display:(collapsed)?"none":"flex"}}>
                        <div className="parameters-content-col">
                        <label className="date-label" htmlFor="start-date">Between</label><input type="date" id="start-date" min="2022-07-01" max={props.param.endDate} value={props.param.startDate} onChange={props.handleChangeStartDate}/>
                        <label className="date-label" htmlFor="end-date">and</label><input type="date" id="end-date" min={props.param.startDate} value={props.param.endDate} onChange={props.handleChangeEndDate} />
                        </div>
                        <div className="parameters-content-col">
                        <div id="toggle-label">Show radar for games:</div>
                        <div className="radar-toggles">
                            <div className="radar-toggle" value="played" onClick={props.handleChangeAverageOn} style={(props.param.averageOn==="played")?{backgroundColor:"var(--bright-orange)",color:"white"}:{}}>Played</div>
                            <div className="radar-toggle" value="started" onClick={props.handleChangeAverageOn} style={(props.param.averageOn==="started")?{backgroundColor:"var(--bright-orange)",color:"white"}:{}}>Started</div>
                        </div>
                        </div>
                    </div>
                    <div className="visibilityToggles">
                        {props.data.map((item,index)=><div key={"radarToggleWrapper"+index} className="radarToggleWrapper"><input key={"radarToggleBox"+index} id={"visibility"+index} value={index} type="checkbox" checked={props.data[index].radarVisible} onChange={props.handleRadarVisibility}/><label key={"radarToggleLabel"+index} htmlFor={"visibility"+index}> {item.displayName}</label></div>)}
                    </div>
                </div>
            </div>
        );
}


function PlayersContent (props){
        return(
            <div>
            <div className="container-row">
                <div className="container-box player-box">
                    {props.data.map((player, index) => <PlayerOverview key={index} playerIndex={index} data={player} filters={props.filters} deletePlayer={props.deletePlayer} updateDecilesMax={props.updateDecilesMax}/>)}
                    {props.data.length < 4 && <NewPlayer addPlayer={props.addPlayer}/>}
                </div>
                <PlayerRadar data={props.data} filters={props.filters} handleRadarVisibility={props.handleRadarVisibility}/>
            </div>
            {props.data.length>0 && <ScoreHistory data={props.data}/>}
            </div>    
        );
};

function PlayerOverview (props){
    function distributeDecile(props){
        const starterDeciles = [0,0,0,0,0,0,0,0,0,0].map((item, index)=>props.data.games.filter((game)=>game.formation=="starter"&&game.decile==index).length);
        const nonStarterDeciles = [0,0,0,0,0,0,0,0,0,0].map((item, index)=>props.data.games.filter((game)=>game.formation!="starter"&&game.decile==index).length);
        const maxDeciles = Math.max(...starterDeciles, ...nonStarterDeciles);
        if (maxDeciles>props.filters.decilesMax){
            props.updateDecilesMax(maxDeciles)}
        return {starter:starterDeciles, nonStarter:nonStarterDeciles}
    }
    const filteredGames = props.data.games;
    const totalGames = filteredGames.length;
    const totalAvgScore = filteredGames.reduce((total, item)=>total+item.SO5score, 0)/totalGames;
    const totalGamesStarted = filteredGames.filter((item)=>item.formation=="starter").length;
    const totalAvgScoreStarted = filteredGames.filter((item)=>item.formation=="starter").reduce((total, item)=>total+item.SO5score, 0)/totalGamesStarted;
    const totalGamesPlayed = filteredGames.filter((item)=>item.formation=="starter"||item.formation=="substitute").length;;
    const totalAvgScorePlayed = filteredGames.filter((item)=>item.formation=="starter"||item.formation=="substitute").reduce((total, item)=>total+item.SO5score, 0)/totalGamesPlayed;
    const totalDecileCSS = "var(--decile"+((totalAvgScore===100)?9:Math.round(totalAvgScore/10)+1)+")";
    const startedDecileCSS= "var(--decile"+((totalAvgScoreStarted===100)?9:Math.round(totalAvgScoreStarted/10+1))+")";
    const playedDecileCSS= "var(--decile"+((totalAvgScoreStarted===100)?9:Math.round(totalAvgScorePlayed/10+1))+")";
    const decilesArr = distributeDecile(props);
    return(
            <div className="player" style={{boxShadow:"5px 5px "+indexColors["light"][props.playerIndex]+",-5px -5px 1rem rgb(240,240,240)"}}>
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
                            {decilesArr.starter.map((item, index)=><div key={"starterDecile"+index} className={"decile-"+(index+1)+" starter"} style={{height:item/props.filters.decilesMax*100+"%"}}>
                                                                    {(item/props.filters.decilesMax>=0.4)?item:""}
                                                                    </div>)}
                            <div className="distribution-label sub">Not Start.</div>
                            {decilesArr.nonStarter.map((item, index)=><div key={"NonStarterDecile"+index} className={"decile-"+(index+1)+" sub"} style={{height:item/props.filters.decilesMax*100+"%"}}>
                                                                    {(item/props.filters.decilesMax>=0.4)?item:""}
                                                                    </div>)}
                        </div>
                        <div className="stats-bottom-row">
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
                    <div className="box-closing">
                        <i className="material-symbols-outlined size-20 fill" onClick={props.deletePlayer} value={props.playerIndex}>cancel</i>
                    </div>
                </div>
    );
};

function NewPlayer(props){
    return(
        <div className="player new-player">
            <form onSubmit={props.addPlayer}>
                <div className="newPlayer-col"> Enter {/*player name <br/>or */}Sorare slug
                    <a href="https://pitti.fr/sorare-slugs" target="_blank" rel="author">
                        <i className="material-symbols-outlined size-20 fill">help</i>
                    </a>
                </div>
                <div className="newPlayer-col">
                    <input type="text" className="add-player-input" placeholder="slug: joshua-kimmich" name="slug"/>
                </div>
                <div className="newPlayer-col">
                    <button type="submit" className="add-button">
                        <span className="material-symbols-outlined size-20">add_circle</span>
                        Add Player
                    </button>
                </div>
            </form>
        </div>
    );
}

class PlayerRadar extends React.Component{
    constructor(props){
        super(props);
        this.state={
            areaHover:null
        }
        this.radarCanvas=React.createRef();
        this.drawRadar = this.drawRadar.bind(this);
        this.openImage = this.openImage.bind(this);
        this.updateAreaHover=this.updateAreaHover.bind(this);
        this.clearAreaHover=this.clearAreaHover.bind(this);
    };
    componentDidUpdate(){
        const canvas = this.radarCanvas.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0,0,canvas.width,canvas.height);
        for (let i=0;i<this.props.data.length;i++){
            if(this.props.data[i].radarVisible){
                const mapInputs=[this.props.data[i].position, this.props.data[i].games.filter((item)=>(this.props.filters.averageOn==="started")?item.formation=="starter":item.Mins_Played>0),"BIG_MULTI"];
                this.drawRadar(ctx,scoringProfile(...mapInputs),i);
            }
        }
    };
    openImage(){
        window.open(require("./pictures/BigRadar.png"), "Radar explanation", "width=950, height=650");
    }
    drawRadar(context,coords,index){
        context.globalAlpha = 0.15;
        if (coords.length>0){
            context.beginPath();
            for (let i=0;i<coords.length;i++){
                context.moveTo(coords[i][0][0],coords[i][0][1]);
                for(let j=1;j<coords[i].length;j++){
                    context.lineTo(coords[i][j][0],coords[i][j][1]);
                }
                }
            context.fillStyle = indexColors["dark"][index];
            context.fill();
        }
    };
    updateAreaHover(event){
        const category=event.target.getAttribute("value");
        const catDetails=areaDetails[category];
        this.setState({
            areaHover:[category,catDetails]
    })
    }
    clearAreaHover(){
        this.setState({
            areaHover:null
    })
    }
    render(){
        return(
            <div className="radar-wrapper">
                <canvas ref={this.radarCanvas} className="container-box radar-box" height={285} width={285}>
                </canvas>
                <div className="radar-mask">
                    <svg  viewBox="0 0 285 285" xmlns="http://www.w3.org/2000/svg">
                        {radarDetails("BIG_MULTI").map((item,index)=>{
                            let path="M"+(item[0][0])+" "+(item[0][1]);
                            for (let i=1; i<item.length; i++){
                                path+=" L"+(item[i][0])+" "+(item[i][1]);
                                    }
                            path+=" Z";
                            return <path key={"radarArea"+index} d={path} value={scoringRadarKeys[index]} onMouseOver={this.updateAreaHover} onMouseLeave={this.clearAreaHover} stroke="transparent" fill="transparent"/>
                        }
                        )}
                    </svg>
                </div>
                {(this.state.areaHover) && <div className="radarTooltip tootipCategory">{this.state.areaHover[0]}</div>}
                {(this.state.areaHover) &&<ul className="radarTooltip tootipCategoryDetails">{this.state.areaHover[1].map((item,index)=><li key={"statitem"+index}>{item}</li>)}</ul>}
                <div className="info-icon" onClick={this.openImage}>
                    <span className="material-symbols-outlined fill">info</span>
                </div>
            </div>
        );
}}

function ScoreHistory (props){
    const gameData=props.data.map((item)=>(item.radarVisible===true)?item.games:[]);
    const gameDataPoints=gameData.map((item,index)=>(item.length>0)?item.map((item2)=>{return {...item2,position:props.data[index].position,index:index}}):item);
    return(
        <div className="container-row">
            <div className="score-history">
                <ScoreHistoryGraph data={gameDataPoints}/>
            </div>
        </div>
    );
};

function Header(props){ 
    const siteBranding=React.createRef();
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

    return(
            <header ref={siteBranding}>
                <div className="intro">
                    <div className="intro-content">
                        <div className='main-title'>off_the_charts</div>
                        <div className='main-subtitle'>Visualizing athletes' performance using <br/>complex fantasy sports matrices </div>
                        <div className='start-button-container'>
                            <div className='start-button'><a href="#parameters">START</a></div>
                        </div>
                        <div className='know-more-content'>
                            <div className='know-more'><a href="https://pitti.fr/2023/05/not-all-sports-statistics-are-equal" target="_blank" rel="author">About</a> the off_the_charts project</div>
                            <div className='svg-logo'>
                            <svg  viewBox="0 0 64 30" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8.73315363881402 0.001 L17.2641509433962 9.29919137466307 L24.5013477088949 26.4420485175202 L16.900269541779 29.5148247978437 L0.001 24.6630727762803 Z" fill="var(--light-orange)"/>
                                <path d="M20.5390835579515 8.61185983827493 L45.0808625336927 0.363881401617251 L43.2614555256065 12.6549865229111 L34.0835579514825 29.1509433962264 L27.2911051212938 24.8652291105121 Z" fill="var(--light-orange)"/>
                                <path d="M43.9083557951482 18.3962264150943 L58.2210242587601 6.06469002695418 L63.0727762803235 12.4528301886792 L63.7196765498652 29.99999 L37.9649595687332 29.2722371967655 Z" fill="var(--light-orange)"/>
                            </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
    );
}

function Footer(){
    return(
            <footer>
                <div className="footer-separator separator-1"></div>
                <div className="footer-separator separator-2"></div>
                <div className="footer-wrapper">
                    <div className="footer-text">
                    <div className="footer-logo">
                           <a href="https://www.pitti.fr" rel="author" target="_blank">
                           <div className='svg-logo'>
                            <svg  viewBox="0 0 64 30" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8.73315363881402 0.001 L17.2641509433962 9.29919137466307 L24.5013477088949 26.4420485175202 L16.900269541779 29.5148247978437 L0.001 24.6630727762803 Z" fill="white"/>
                                <path d="M20.5390835579515 8.61185983827493 L45.0808625336927 0.363881401617251 L43.2614555256065 12.6549865229111 L34.0835579514825 29.1509433962264 L27.2911051212938 24.8652291105121 Z" fill="white"/>
                                <path d="M43.9083557951482 18.3962264150943 L58.2210242587601 6.06469002695418 L63.0727762803235 12.4528301886792 L63.7196765498652 29.99999 L37.9649595687332 29.2722371967655 Z" fill="white"/>
                            </svg>
                            </div>
                            </a>
                        </div>
                        <p>© 2023 PITTI</p>
                    </div>
                    <div className="social-logo twitter">
                    <a href="https://twitter.com/sorarepitti" rel="noreferrer" target="_blank">@SorarePITTI</a>
                    </div>
                    <div className="social-logo twitter">
                    <a href="https://twitter.com/PITTI_DATA" rel="noreferrer" target="_blank">@PITTI_DATA</a>
                    </div>
                    <div className="social-logo github">
                    <a href="https://github.com/pappitti/offthecharts" rel="noreferrer" target="_blank">pappitti/offthecharts</a>
                    </div>
                </div>
            </footer>
    )
}
;
export default RadarApp;