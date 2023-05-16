import {Categoryangles,profileRadarSizes,positions,pi,scoringMatrix, scoringKeys,scoringRadarKeys, DAradarkeys,AAradarkeys,statIndex} from './statics.js';


function canvasMaps(statObj,radarSize){
    const base=statObj["base"];
    const xPad=profileRadarSizes[radarSize][1];
    const yPad=profileRadarSizes[radarSize][2];
    const pct=profileRadarSizes[radarSize][3];
    const profilechartray=profileRadarSizes[radarSize][0];

    if (base===0){
        return [[[profilechartray+xPad,profilechartray+yPad]]];
    }
    else{
        /*scoremap*/
        let AAangles=AAradarkeys.reduce((total,item)=>total+Categoryangles[item],0);
        let DAangles=DAradarkeys.reduce((total,item)=>total+Categoryangles[item],0);
        let playermap={};
            
        let AApositivenotch=1;
        let AAnegativenotch=1;
        let DApositivenotch=20;
        let DAnegativenotch=15;
        let reserve=0;
        let positiveaas=0;
        let totaldas=0;
        let cumangle=0;
        
        const p=Math.pow((pct*profilechartray),2)*pi/35;
        const r=pct*profilechartray*Math.pow(base,0.5)/Math.pow(35,0.5);
        const b=2*r;
        for (let j=0; j<scoringRadarKeys.length; j++){
            const statcat=scoringRadarKeys[j];
            const catvalue=statObj[statcat];
            let catangle=pi/2-cumangle;
            let notch=0;
            let deter=0;
            let length=0;
            let balance=null;
            if (statcat=="GOALKEEPING"||statcat=="DEFENDING"||statcat=="GENERAL"||statcat=="ASSISTS"||statcat=="GOALS"){
                totaldas+=catvalue;
                cumangle=cumangle+Categoryangles[statcat]*pi/DAangles;
                notch=(catvalue<0)?DAnegativenotch:DApositivenotch;
                deter=Math.pow(b,2)+8*DAangles/pi*notch*p*catvalue/Categoryangles[statcat];
                if (deter>=0){
                    length=r+(-b+Math.pow(deter,0.5))/2}
                else{
                    balance=Categoryangles[statcat]*(-notch*catvalue/Categoryangles[statcat]-base/(2*DAangles));
                    reserve+=balance;}
            }
            else{
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
            playermap[statcat]=[catangle,length];
        }
        if (totaldas>1){reserve=Math.min(reserve,positiveaas-0.1);};
        const reserveR=Math.pow((reserve*p/pi),0.5)

        const coordinates=Object.keys(playermap).map((item,index)=>[item,index,playermap[item][0],playermap[item][1]])
        const catcoords=coordinates.length;

        let mapshapes=[];
        for (let k=0;k<catcoords;k++){
            if (coordinates[k][3]>reserveR && k<catcoords-1){
                mapshapes.push([
                    [coordinates[k][3]*Math.cos(coordinates[k][2]),coordinates[k][3]*Math.sin(coordinates[k][2])],
                    [coordinates[k][3]*Math.cos(coordinates[k+1][2]),coordinates[k][3]*Math.sin(coordinates[k+1][2])],
                    [reserveR*Math.cos(coordinates[k+1][2]),reserveR*Math.sin(coordinates[k+1][2])],
                    [reserveR*Math.cos(coordinates[k][2]),reserveR*Math.sin(coordinates[k][2])],
                    [coordinates[k][3]*Math.cos(coordinates[k][2]),coordinates[k][3]*Math.sin(coordinates[k][2])]
                ])
            }
            else if (coordinates[k][3]>reserveR && k===catcoords-1){
                mapshapes.push([
                    [coordinates[k][3]*Math.cos(coordinates[k][2]),coordinates[k][3]*Math.sin(coordinates[k][2])],
                    [coordinates[k][3]*Math.cos(coordinates[0][2]),coordinates[k][3]*Math.sin(coordinates[0][2])],
                    [reserveR*Math.cos(coordinates[0][2]),reserveR*Math.sin(coordinates[0][2])],
                    [reserveR*Math.cos(coordinates[k][2]),reserveR*Math.sin(coordinates[k][2])],
                    [coordinates[k][3]*Math.cos(coordinates[k][2]),coordinates[k][3]*Math.sin(coordinates[k][2])]
                ])
            }
        }
        const myoutput=mapshapes.map((shape)=>shape.map((item)=>[profilechartray+item[0]+xPad,profilechartray-item[1]+yPad]));
        return myoutput;
    }
}

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

function scoringProfile(position,gameArray,radarSize) {
    const longPos=positions[position];
    const totalGames=gameArray.length;
    const statObject=scoringKeys.reduce((acc,cur)=>{acc[cur]=0;return acc},{}); //initialize statObject
    if (totalGames===0){
        return [];
    }
    else {
        for (let i=0;i<statIndex.length;i++){
            let statCat="";
            let statValue=0;
            if (statIndex[i]!="Clean_Sheet"){
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
            statObject[statCat]+=statValue/totalGames*gameArray.reduce((total,item)=>total+item[statIndex[i]],0);
        }
        statObject.base=gameArray.reduce((total,item)=>total+item["base"],0)/totalGames;
    };
    let playerCoords=canvasMaps(statObject,radarSize);
  return playerCoords;
}
export default scoringProfile;
export {radarDetails};