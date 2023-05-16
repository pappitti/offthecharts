import React from 'react';
import scoringProfile from './radarPath.js';
import {VictoryChart, VictoryAxis, VictoryArea, VictoryScatter, VictoryGroup,VictoryTooltip} from 'victory';
import {indexColors,decilesColors} from './statics.js';

function BuildSVGPath(gamestats,xinit,yinit){
    const mapInputs=[gamestats.position,[gamestats],"VERY_SMALL"];
    const points=scoringProfile(...mapInputs);
    let path="";
    for (let i=0; i<points.length; i++){
        (i===0)?path+="M"+(points[i][0][0]+xinit)+" "+(points[i][0][1]+yinit):path+=" M"+(points[i][0][0]+xinit)+" "+(points[i][0][1]+yinit)
        if (points[i].length>1){
            for (let j=1; j<points[i].length; j++){
                path+=" L"+(points[i][j][0]+xinit)+" "+(points[i][j][1]+yinit);
            }
        }
        path+=" Z";
    };
    return path;
};

function CustomTooltip(props) {
    function xAdjustment(coord){if (coord<110){return 0}else {return coord-110+Math.min(0,980-(coord+110))}};
    function yAdjustment(coord){if (coord>220){return coord-80}else {return coord+5}};
    const adjX=xAdjustment(props.x);
    const adjY=yAdjustment(props.y);
    const decile=props.datum.decile;
    return(
        <g>
            <rect width="225" height="75" x={adjX} y={adjY} rx="4.5" fill="white" stroke={indexColors["light"][props.datum.index]}/>
            <path d={BuildSVGPath(props.datum,adjX,adjY)} fill={decilesColors[decile]}/>
            <text x={adjX+9} y={adjY+65} fontSize="10">{"Score: "+props.datum.SO5score}</text>
            <text x={adjX+80} y={adjY+15} fontSize="10">{props.datum.date}</text>
            <text x={adjX+150} y={adjY+15} fontSize="10" className="tooltip-icon">{"played "+props.datum.Mins_Played+"'"}</text>
            <rect width="155" height="18" x={adjX+70} y={adjY+20} fill={indexColors["light"][props.datum.index]}/>
            <rect width="1" height="75" x={adjX+70} y={adjY} fill={indexColors["light"][props.datum.index]}/>
            <text x={adjX+80} y={adjY+33} fontSize="10" fontWeight="bold">{(props.datum.competition.length<=30)?props.datum.competition:props.datum.competition.slice(0,27)+"..."}</text>
            <text x={adjX+80} y={adjY+50} fontSize="10" fontWeight={(props.datum.homeTeam===props.datum.playedFor)?"bold":"normal"}>
                {(props.datum.homeTeam.length<=21)?props.datum.homeTeam:props.datum.homeTeam.slice(0,18)+"..."}
            </text>
            <text x={adjX+211} y={adjY+50} fontSize="10">{props.datum.homeGoals}</text>
            <text x={adjX+80} y={adjY+65} fontSize="10"fontWeight={(props.datum.awayTeam===props.datum.playedFor)?"bold":"normal"}>
                {(props.datum.awayTeam.length<=21)?props.datum.awayTeam:props.datum.awayTeam.slice(0,18)+"..."}
            </text>
            <text x={adjX+211} y={adjY+65} fontSize="10">{props.datum.awayGoals}</text>
        </g>
    )
};

function ScoreHistoryGraph(props){
    const myData=[...props.data];
    return (
        <div className="areaChartsContainer">
            <VictoryChart width={1000} domain={{y:[0,100]}} scale={{x:"time",y:"linear"}} padding={{top:20, bottom:20, left:30, right:20}}>
                <VictoryAxis style={{ axis: {stroke: "grey"}, tickLabels: {fill: "grey", fontSize:10, padding: 5}}}/>
                <VictoryAxis dependentAxis style={{ axis: {stroke: "grey"}, tickLabels: {fill: "grey", fontSize:10, padding: 5}}}/>
                {myData.map((series,index) => 
                <VictoryGroup key={"chartGroup"+index} labels={({ datum }) => ""}
                labelComponent={<VictoryTooltip constrainToVisibleArea pointerLength={0} flyoutComponent={<CustomTooltip />}/>}>
                    <VictoryArea data={series} x={(d)=> new Date(d.date)} y="SO5score" key={"area"+index} style={{data: {fill:indexColors["dark"][index], fillOpacity: 0.10, strokeWidth:0}}} interpolation="monotoneX"/>
                    <VictoryScatter data={series} x={(d)=> new Date(d.date)} y="SO5score" key={"scatter"+index} size={4} style={{data:{fill: indexColors["dark"][index],fillOpacity:0.35}}}/>
                </VictoryGroup>
                    )}
            </VictoryChart>
        </div>
    )
};

export default ScoreHistoryGraph;