import {Categoryangles,profileRadarSizes,positions,pi,scoringMatrix, scoringRadarKeys, DAradarkeys,AAradarkeys,statIndex} from './statics.js';

//function calculates the coordinates of the points the radar chart
function canvasMaps(statObj,radarSize){
    const base=statObj["base"]; //base area, at the center
    const xPad=profileRadarSizes[radarSize][1]; //padding on the x axis, varies depending on size (only relevant for canvas)
    const yPad=profileRadarSizes[radarSize][2];//padding on the y axis, varies depending on size (only relevant for canvas)
    const pct=profileRadarSizes[radarSize][3]; //how much the base radius represents in relation to the total radius
    const profilechartray=profileRadarSizes[radarSize][0]; //total radius

    if (base===0){
        return [[[profilechartray+xPad,profilechartray+yPad]]]; //just a dot in the center
    }
    else{
        /*scoremap*/
        let AAangles=AAradarkeys.reduce((total,item)=>total+Categoryangles[item],0); //sum of angles in the Decisive half
        let DAangles=DAradarkeys.reduce((total,item)=>total+Categoryangles[item],0); //sum of angles in the All-Around half
        let playermap={};
            
        let AApositivenotch=1; //how much an increase one point in the AA half is worth in relation to the total radius
        let AAnegativenotch=1; //how much a decrease one point in the AA half is worth in relation to the total radius
        let DApositivenotch=20; //how much an increase one point in the DA half is worth in relation to the total radius
        let DAnegativenotch=15; //how much a decrease one point in the DA half is worth in relation to the total radius
        let reserve=0; //will grow as negative points accumulate. at the end, it will be the area that is empty in the center
        let positiveaas=0;
        let totaldas=0;
        let cumangle=0;
        
        const p=Math.pow((pct*profilechartray),2)*pi/35; //if the area of the base is 35, the percentage to apply to values is calculated here
        const r=pct*profilechartray*Math.pow(base,0.5)/Math.pow(35,0.5); //radius of the "real" i.e. with an area of only 25 if substitute
        const b=2*r;
        for (let j=0; j<scoringRadarKeys.length; j++){ //iterates over the categories
            const statcat=scoringRadarKeys[j];//name of the category
            const catvalue=statObj[statcat];
            let catangle=pi/2-cumangle; //the iteration starts at the top of the circle and goes clockwise so this is the angle where this categroy starts
            let notch=0;
            let deter=0;
            let length=0;
            let balance=null;
            if (statcat=="GOALKEEPING"||statcat=="DEFENDING"||statcat=="GENERAL"||statcat=="ASSISTS"||statcat=="GOALS"){ //Decisive half
                totaldas+=catvalue; //will be used later to address situations where there are too many negative points 
                cumangle=cumangle+Categoryangles[statcat]*pi/DAangles; //where the next category starts
                notch=(catvalue<0)?DAnegativenotch:DApositivenotch; //pick which notch to use depending on whether the value is positive or negative
                deter=Math.pow(b,2)+8*DAangles/pi*notch*p*catvalue/Categoryangles[statcat]; //discriminant of the quadratic equation
                if (deter>=0){ //only takes positive discriminants
                    length=r+(-b+Math.pow(deter,0.5))/2}
                else{ //if not, add the points to the reserve area (increasing the hole in the center)
                    balance=Categoryangles[statcat]*(-notch*catvalue/Categoryangles[statcat]-base/(2*DAangles));
                    reserve+=balance;}
            }
            else{ //All-Around half (everything is the same as above)
                cumangle=cumangle+Categoryangles[statcat]*pi/AAangles;
                if (catvalue<0){notch=AAnegativenotch;}
                else{notch=AApositivenotch;positiveaas+=catvalue};
                deter=Math.pow(b,2)+8*AAangles/pi*notch*p*catvalue/Categoryangles[statcat];
                if (deter>=0){
                    length=r+(-b+Math.pow(deter,0.5))/2}
                else{
                    balance=Categoryangles[statcat]*(-notch*catvalue/Categoryangles[statcat]-base/(2*AAangles));
                    reserve+=balance;};
            }
            playermap[statcat]=[catangle,length];//for each category, stores the angle and the length of the line
        }
        if (totaldas>1){reserve=Math.min(reserve,positiveaas-0.1);};//makes sure there is a minimum area
        const reserveR=Math.pow((reserve*p/pi),0.5) //radius of the empty area

        const coordinates=Object.keys(playermap).map((item,index)=>[item,index,playermap[item][0],playermap[item][1]])//creates an array of arrays with the category name, the index, the angle and the length of the line
        const catcoords=coordinates.length; //number of categories

        let mapshapes=[];
        for (let k=0;k<catcoords;k++){//iterates over the categories
            if (coordinates[k][3]>reserveR && k<catcoords-1){//ignores categories in length is smaller than the reserve radius. treats the last one differently
                mapshapes.push([//adds an array with 4 points. the 5th is the same as the first, added to make sure the shape is closed but it should not be necessary for canvas or svg paths
                    [coordinates[k][3]*Math.cos(coordinates[k][2]),coordinates[k][3]*Math.sin(coordinates[k][2])], //top-end of the shape (max value, angle where the category starts - clockwise). each time, first value is x, second is y
                    [coordinates[k][3]*Math.cos(coordinates[k+1][2]),coordinates[k][3]*Math.sin(coordinates[k+1][2])],//bottom-end of the shape (max value, angle where the next category starts - clockwise).each time, first value is x, second is y
                    [reserveR*Math.cos(coordinates[k+1][2]),reserveR*Math.sin(coordinates[k+1][2])],//bottem-center of the shape (reserve radius, angle where the next category starts - clockwise).each time, first value is x, second is y
                    [reserveR*Math.cos(coordinates[k][2]),reserveR*Math.sin(coordinates[k][2])],//top-center of the shape (reserve radius, angle where the category starts - clockwise).each time, first value is x, second is y
                    [coordinates[k][3]*Math.cos(coordinates[k][2]),coordinates[k][3]*Math.sin(coordinates[k][2])]//same as the first point
                ])
            }
            else if (coordinates[k][3]>reserveR && k===catcoords-1){//last shape needs to find the angle where the first category starts
                mapshapes.push([
                    [coordinates[k][3]*Math.cos(coordinates[k][2]),coordinates[k][3]*Math.sin(coordinates[k][2])],
                    [coordinates[k][3]*Math.cos(coordinates[0][2]),coordinates[k][3]*Math.sin(coordinates[0][2])],
                    [reserveR*Math.cos(coordinates[0][2]),reserveR*Math.sin(coordinates[0][2])],
                    [reserveR*Math.cos(coordinates[k][2]),reserveR*Math.sin(coordinates[k][2])],
                    [coordinates[k][3]*Math.cos(coordinates[k][2]),coordinates[k][3]*Math.sin(coordinates[k][2])]
                ])
            }
        }
        const myoutput=mapshapes.map((shape)=>shape.map((item)=>[profilechartray+item[0]+xPad,profilechartray-item[1]+yPad]));//converts the coordinates to the canvas system (adding the padding and inverting the y axis)
        return myoutput;
    }
}

//simplified version of the function above, used create the transparent shapes that will be placed on top of the radar chart to create the hover effect
function radarDetails(radarSize){
    const xPad=profileRadarSizes[radarSize][1];
    const yPad=profileRadarSizes[radarSize][2];
    const pct=profileRadarSizes[radarSize][3];
    const profilechartray=profileRadarSizes[radarSize][0];
    const adj=1;
    let AAangles=AAradarkeys.reduce((total,item)=>total+Categoryangles[item],0);
    let DAangles=DAradarkeys.reduce((total,item)=>total+Categoryangles[item],0);
    const mapshapes=[];
    let cumangle=0;
    for (let j=0; j<scoringRadarKeys.length; j++){
        const statcat=scoringRadarKeys[j];
        let catangle=pi/2-cumangle;
        if (statcat=="GOALKEEPING"||statcat=="DEFENDING"||statcat=="GENERAL"||statcat=="ASSISTS"||statcat=="GOALS"){
            cumangle=cumangle+Categoryangles[statcat]*pi/DAangles;
        }
        else {cumangle=cumangle+Categoryangles[statcat]*pi/AAangles};
        mapshapes.push([
            [profilechartray*adj*Math.cos(catangle),profilechartray*adj*Math.sin(catangle)],
            [profilechartray*adj*Math.cos(pi/2-cumangle),profilechartray*adj*Math.sin(pi/2-cumangle)],
            [profilechartray*pct*Math.cos(pi/2-cumangle),profilechartray*pct*Math.sin(pi/2-cumangle)],
            [profilechartray*pct*Math.cos(catangle),profilechartray*pct*Math.sin(catangle)],
            [profilechartray*adj*Math.cos(catangle),profilechartray*adj*Math.sin(catangle)]
        ])
    }
    const myoutput=mapshapes.map((shape)=>shape.map((item)=>[profilechartray+item[0]+xPad,profilechartray-item[1]+yPad]));
    return myoutput;
}

//builds on object with cummulated stats, the points received in relation to the stats (and then averages) grouped by category
function scoringProfile(position,gameArray,radarSize) {
    const longPos=positions[position]; //position is necessary as number of points for a given stat differs by position
    const totalGames=gameArray.length; //number of games, to calculate averages
    const statObject=scoringRadarKeys.reduce((acc,cur)=>{acc[cur]=0;return acc},{}); //initialize statObject
    if (totalGames===0){ //if no games, nothing is calculated, return empty array
        return [];
    }
    else {
        for (let i=0;i<statIndex.length;i++){ //statIndex is the array of stats in statics.js. the loop iterates over this object
            let statCat="";
            let statValue=0;
            if (statIndex[i]!="Clean_Sheet"){ //Clean_sheet has to be treated differently as it is a decisive for goalkeepers but not for defenders
                statCat=scoringMatrix[statIndex[i]].subcategory;
                statValue=scoringMatrix[statIndex[i]][longPos];
            }
            else if (longPos==="Goalkeeper"){
                statCat=scoringMatrix[statIndex[i]][0].subcategory;
                statValue=scoringMatrix[statIndex[i]][0][longPos];
            }
            else {
                statCat=scoringMatrix[statIndex[i]][1].subcategory;
                statValue=scoringMatrix[statIndex[i]][1][longPos];
            }
            statObject[statCat]+=statValue/totalGames*gameArray.reduce((total,item)=>total+item[statIndex[i]],0);//average points received in relation to that category
        }
        statObject.base=gameArray.reduce((total,item)=>total+item["base"],0)/totalGames;// calculate average base score (35 for starters, 25 for substitutes, 0 otherwise - see api/players/route.js)
    };
    let playerCoords=canvasMaps(statObject,radarSize); //runs the function that calculates the coordinates of the points
  return playerCoords;
}
export default scoringProfile;
export {radarDetails};