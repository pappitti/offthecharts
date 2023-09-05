import React from 'react';
import scoringProfile from './radarPath.js';
import {VictoryChart, VictoryAxis, VictoryArea, VictoryScatter, VictoryGroup,VictoryTooltip} from 'victory';
import {indexColors,decilesColors} from './statics.js';

/*this entire component relies on the Victory library. It has some benefits but it comes at a cost. An area chart is relatively easy to build 
in svg (much easier than the custom-made tooltip below) so getting rid of this dependency could be an important next step */


//this function builds the radar fro the tooltip. It is an alternative to the Canvas used in the radar component. Likely a better one in hingsight
function BuildSVGPath(gamestats,xinit,yinit){
    const mapInputs=[gamestats.position,[gamestats],"VERY_SMALL"];
    const points=scoringProfile(...mapInputs);//calling the function that generates coordinates for the radar (in radarPath.js)
    let path="";
    for (let i=0; i<points.length; i++){// interates over the different shapes that make up the radar
        (i===0)?path+="M"+(points[i][0][0]+xinit)+" "+(points[i][0][1]+yinit):path+=" M"+(points[i][0][0]+xinit)+" "+(points[i][0][1]+yinit) //moves to the first point of each shape. a space is added when it is not the first shape
        if (points[i].length>1){//iterates over the points that make up each shape
            for (let j=1; j<points[i].length; j++){
                path+=" L"+(points[i][j][0]+xinit)+" "+(points[i][j][1]+yinit);
            }
        }
        path+=" Z";//closes the shape
    };
    return path;
};

//this function builds the tooltip. 
function CustomTooltip(props) {
    function xAdjustment(coord){if (coord<110){return 0}else {return coord-110+Math.min(0,980-(coord+110))}};//adjustement to make sure the tooltip stays within the chart
    function yAdjustment(coord){if (coord>220){return coord-80}else {return coord+5}};//adjustement to make sure the tooltip stays within the chart
    const adjX=xAdjustment(props.x);
    const adjY=yAdjustment(props.y);
    const decile=props.datum.decile;
    return(
        <g>
            <rect width="225" height="75" x={adjX} y={adjY} rx="4.5" fill="white" stroke={indexColors["light"][props.datum.index]}/>
            <path d={BuildSVGPath(props.datum,adjX,adjY)} fill={decilesColors[decile]}/> {/*calls function to build the radar and fills it with the correct color*/}
            <text x={adjX+9} y={adjY+65} fontSize="10">{"Score: "+props.datum.SO5score}</text>
            <text x={adjX+80} y={adjY+15} fontSize="10">{props.datum.date}</text>
            <text x={adjX+150} y={adjY+15} fontSize="10" className="tooltip-icon">{"played "+props.datum.Mins_Played+"'"}</text>
            <rect width="155" height="18" x={adjX+70} y={adjY+20} fill={indexColors["light"][props.datum.index]}/>
            <rect width="1" height="75" x={adjX+70} y={adjY} fill={indexColors["light"][props.datum.index]}/>
            <text x={adjX+80} y={adjY+33} fontSize="10" fontWeight="bold">{(props.datum.competition.length<=30)?props.datum.competition:props.datum.competition.slice(0,27)+"..."}</text>{/*truncates the competition name if it is too long*/}
            <text x={adjX+80} y={adjY+50} fontSize="10" fontWeight={(props.datum.homeTeam===props.datum.playedFor)?"bold":"normal"}>{/*highlights which team the played played for in that game*/}
                {(props.datum.homeTeam.length<=21)?props.datum.homeTeam:props.datum.homeTeam.slice(0,18)+"..."}{/*truncates the name if it is too long*/}
            </text>
            <text x={adjX+211} y={adjY+50} fontSize="10">{props.datum.homeGoals}</text>
            <text x={adjX+80} y={adjY+65} fontSize="10"fontWeight={(props.datum.awayTeam===props.datum.playedFor)?"bold":"normal"}>{/*highlight which team the played played for in that game*/}
                {(props.datum.awayTeam.length<=21)?props.datum.awayTeam:props.datum.awayTeam.slice(0,18)+"..."}{/*truncates the name if it is too long*/}
            </text>
            <text x={adjX+211} y={adjY+65} fontSize="10">{props.datum.awayGoals}</text>
        </g>
    )
};

//this is the main component. The best is probably to look at the Victory documentation to fully understand what is going on.
/*adding comments to the code below breaks the component. The main steps are:
VictoryChart : key parameters of the chart area, including the Y axes deifnitions
then map to iterate over each player (1 series=1 player)
in practice the chart is a group if 2 charts, 1 for the area and the other for the points. flyout component is the custom tooltip
VictoryArea and VictoryScatter: x and y define the axis. it must be consistent across both charts so that they overlay. Color is set in style*/

function ScoreHistoryGraph(props){
    const myData=[...props.data];
    return (
        <div className="areaChartsContainer">
            <VictoryChart width={1000} domain={{y:[0,100]}} scale={{x:"time",y:"linear"}} padding={{top:20, bottom:20, left:30, right:20}}> 
                <VictoryAxis style={{ axis: {stroke: "grey"}, tickLabels: {fill: "grey", fontSize:10, padding: 5}}}/>
                <VictoryAxis dependentAxis style={{ axis: {stroke: "grey"}, tickLabels: {fill: "grey", fontSize:10, padding: 5}}}/>
                {myData.map((series,index) => 
                <VictoryGroup key={"chartGroup"+index} labels={({ datum }) => ""} labelComponent={<VictoryTooltip constrainToVisibleArea pointerLength={0} flyoutComponent={<CustomTooltip />}/>}>
                    <VictoryArea data={series} x={(d)=> new Date(d.date)} y="SO5score" key={"area"+index} style={{data: {fill:indexColors["dark"][index], fillOpacity: 0.10, strokeWidth:0}}} interpolation="monotoneX"/>
                    <VictoryScatter data={series} x={(d)=> new Date(d.date)} y="SO5score" key={"scatter"+index} size={4} style={{data:{fill: indexColors["dark"][index],fillOpacity:0.35}}}/>
                </VictoryGroup>
                    )}
            </VictoryChart>
        </div>
    )
};

export default ScoreHistoryGraph;