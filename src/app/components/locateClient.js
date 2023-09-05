'use client'
import React,{useState, useEffect, use} from 'react';
import {useRouter} from 'next/navigation';
import {countriesDict} from './worldMap';
import Loader from './loading';

export default function LocateClient(props){
    const router=useRouter();
    const [toCompare, setToCompare]=useState({});//{slug:displayName}
    const [countries, setCountries]=useState(Object.keys(countriesDict).reduce((acc,item)=>{acc[item]={displayName:countriesDict[item].displayName,cards:[]};return acc},{})); //{countryslug:{displayName, cards : [{cardSlug , playerSlug , playerDisplayName, playerAvatar,activeClub , cardUrl}]}}
    const [players, setPlayers]=useState({});//{slug:{displayName,club,showDetails, cards:[cardUrl]}}
    const [user, setUser]=useState(null);//name
    const [selectedCountry, setSelectedCountry]=useState(null);//countryslug    
    const [loading, setLoading]=useState(false);
    const [showAllCards, setShowAllCards]=useState(false);//boolean

     // deleting a player from the comparison
    function deletePlayer(event){
        event.preventDefault();
        const slug=event.currentTarget.id;
        const newPlayers=Object.keys(toCompare).filter((item)=>item!==slug).reduce((acc, item)=>{acc[item]=toCompare[item]; return acc;},{});
        setToCompare(newPlayers);
    };
    // adding a player to the comparison
    function addPlayer(event){
        const slug=event.currentTarget.id;
            if(!Object.keys(toCompare).includes(slug)){
            setToCompare((prevState)=>{
                const newState={...prevState};
                newState[slug]=players[slug].displayName;
                return newState}); 
        };
    };
    // people leaving in the UK will get it. For others, it passes parameters to the compare page for automatic comparison
    function goCompare(){
        router.push("/compare?"+Object.keys(toCompare).map((item)=>"player="+item).join("&"));
    };
    // populate list of players  when a country is clicked on
    function selectCountry(event){
        const country=event.currentTarget.id;
        setSelectedCountry(country);
        const countryPlayers=countries[country].cards.reduce((acc, item)=>{
            if (acc[item.playerSlug]){
                acc[item.playerSlug].cards=[...acc[item.playerSlug].cards,item.cardUrl];}
            else{
                acc[item.playerSlug]={displayName:item.playerDisplayName,
                                    club:item.activeClub,
                                    showDetails:showAllCards,
                                    avatar:item.playerAvatar,
                                    cards:[item.cardUrl]}
            }
            return acc;
            },{}
        );  
        setPlayers(countryPlayers);
    };
    // clear the country selection
    function deleteCountry(){
        setSelectedCountry(null);
        setPlayers({});
    };

    // enable card UI for a single player in a country
    function handleShowSingleDetails(event){
        const slug=event.currentTarget.id;
        setPlayers((prevState)=>{
            const newState={...prevState};
            newState[slug].showDetails=!prevState[slug].showDetails;
            return newState});
    }
    // select user to display
    function handleNewUser(event){
        event.preventDefault();
        const slug=event.currentTarget.elements[0].value;
        setUser(slug);
    }
    // fetches data for the user each time the user changes
    useEffect(()=>{
        setSelectedCountry(null);
        const newCountries=Object.keys(countriesDict).reduce((acc,item)=>{acc[item]={displayName:countriesDict[item].displayName,cards:[]};return acc},{});
        if (user&&user!==""){
            // loading UI whilst fetching data
            setLoading(true);
            const reqBody=JSON.stringify({slug:user});
            // fetches data from the API using variables above
            fetch("/api/user",{ next: { revalidate: 150 }, method: 'POST', body: JSON.stringify(reqBody) }).then((response)=>{if (!response.ok){setLoading(false); return {}} else{ return response.json()}}).then((data)=>Object.keys(data).reduce((acc,item)=>{acc[item].cards=data[item];return acc},newCountries)).then(()=>setLoading(false));
            }
        setCountries(newCountries)
        ;}
    ,[user]);

    // enables/disables cards UI for all players in a country
    useEffect(()=>{
        setPlayers((prevState)=>Object.keys(prevState).reduce((acc,item)=>{acc[item]=prevState[item];acc[item].showDetails=showAllCards;return acc},{}))
    },[showAllCards]);

    return(
        <div className="content content-flex">
            <Parameters data={toCompare} deletePlayer={deletePlayer} goCompare={goCompare} addPlayer={addPlayer} handleNewUser={handleNewUser}/>
            <div className="locate-container"> 
                {loading && <Loader/>}
                {!loading && <MapContent data={countries} user={user} selectCountry={selectCountry} selectedCountry={selectedCountry}/>}
                {/*list of countries only shows after click on country - it splits the UI*/}
                {selectedCountry && <CountryContent data={players} countryInfo={countries[selectedCountry].displayName} deleteCountry={deleteCountry} addPlayer={addPlayer} handleShowSingleDetails={handleShowSingleDetails} compareLength={Object.keys(toCompare).length} setShowAllCards={setShowAllCards} showAllCards={showAllCards}/>}
            </div>
        </div>
    )
}

//parameters at the top
export function Parameters (props){
    return(
        <div className="parameters-wrapper">
            <div className="parameters" id="parameters">
                <form className="parameters-content-col p-2-5" onSubmit={(e)=>{props.handleNewUser(e)}}>
                    <label className="date-label">Enter manager slug</label>
                    <input type="text" className="add-player-input" placeholder="slug: betatester2" name="slug"/>
                    <button type="submit" className="add-button">
                        Search User
                        <i className="symbol size-20">search</i>
                    </button>
                </form>
                <div className="parameters-content-col locate">
                    {/*list to selected players for future comparison, and comparison button only of there is at least one player */}
                    <div className="player-labels">
                        {Object.keys(props.data).map((item,index)=><PlayerLabel key={index} slug={item} displayName={props.data[item]} deletePlayer={props.deletePlayer}/>)}
                    </div>
                    {(Object.keys(props.data).length>0) && <button className="parameters-add-button" onClick={(e)=>props.goCompare(e)}>Compare</button>}
                </div>
            </div>
        </div>
    );
};

//labels for selected players, oncluding function to remove them form the list
function PlayerLabel(props){
    return (
        <div className="player-label">
            <div className="player-label-close" id={props.slug} onClick={(e)=>props.deletePlayer(e)}> x </div>
            <div >{props.displayName}</div>
        </div>
    )
};

//map of the world, with countries colored according to the number of cards owned by the user
function MapContent (props){
    const [hoverCountry, setHoverCountries]=useState(null);//countryslug

    const countries=Object.keys(props.data).reduce((acc,item)=>{
        acc[item]={displayName:props.data[item].displayName,
                    cardsNumber:props.data[item].cards.length,
                    playerNumber:props.data[item].cards.reduce((accu,subitem)=>{if (accu.indexOf(subitem.playerSlug)===-1){accu.push(subitem.playerSlug)}; return accu},[]).length};
        return acc;
    },{});
    const maxCards=Math.max(...Object.keys(countries).map((item)=>countries[item].cardsNumber),1);
    const totalOwnedCards=Object.keys(countries).reduce((acc,item)=>acc+=countries[item].cardsNumber,0);
    const disclaimer=(totalOwnedCards>=3000)?"incomplete list (capped at 3000)":null;

    function showTooltip(event){
        const country=event.currentTarget.id;
        setHoverCountries(country);
    }
    function hideTooltip(event){
        const country=event.currentTarget.id;
        setHoverCountries(null);
    }

    // in practice, the function loops over the countries object (in worldMap.js) and creates a path for each country. In the process, it applies the color of the country according to the number of cards owned by the user
    return(
        <div className="map-wrapper">
            <svg baseProfile="tiny" fill="#ececec" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeWidth=".2" version="1.2" viewBox="0 0 2000 857" width="100%" xmlns="http://www.w3.org/2000/svg" className="world-map">
                {Object.keys(countriesDict).map((item,index)=>countriesDict[item].path.map((subitem,subindex)=>
                    <path key={index+"-"+subindex} id={item} d={subitem} fill={(countries[item].cardsNumber>0)?`rgba(255,104,79,${countries[item].cardsNumber/maxCards*0.8+0.2})`:"#ececec"} onMouseOver={(e)=>showTooltip(e)} onMouseOut={(e)=>hideTooltip(e)} onClick={(e)=>props.selectCountry(e)}></path> /*sets state when mouse passes over a country, and clears stats when it leaves. If there is zero card, country is grey, otherwise it is orange and opacity defines the shade as a percentage of max cards (baseline at 0.2)*/
                ))}
            </svg>
            <div className="map-title" style={{margin:"20px auto "+(disclaimer||hoverCountry?0:12.5)+"px"}}> {/*title becomes tooltip on over (same contruct, only content changes)*/}
                <div className="map-title-topblock">
                    <div className="tooltip-col">
                        <div className="tooltip-content-label">{hoverCountry?"COUNTRY":"USER"}</div>
                        {hoverCountry && <div className="tooltip-content-main">{countries[hoverCountry].displayName}</div>}
                        {!hoverCountry && <div className="tooltip-content-main">{props.user?props.user:"select user"}</div>}
                    </div>
                    {props.user && <div className="tooltip-col">
                        <div className="tooltip-content-label">CARD(S)</div>
                        {hoverCountry && <div className="tooltip-content-secondary">{countries[hoverCountry].cardsNumber} card(s) of {countries[hoverCountry].playerNumber} player(s)
                                        </div>}
                        {!hoverCountry && <div className="tooltip-content-secondary"><div>{props.user?totalOwnedCards:0}</div></div>}
                        
                    </div>}
                </div>
                <div className="tooltip-explanation">{hoverCountry?"click on country for details":disclaimer}</div>
            </div>
        </div>    
    );
};
//list of players in a country, with their cards, appearing after a country is selected (on click on the map)
function CountryContent(props){
   
    return(
        <div className="country-wrapper">
            <div className="country-header">
                <div className="country-name">{props.countryInfo}</div>
                <div className="country-header-details">
                    <div>{Object.keys(props.data).reduce((acc,item)=>acc+=props.data[item].cards.length,0)} cards of {Object.keys(props.data).length} players</div>
                    <label key={"radarToggleLabel"} htmlFor="all expanded"><input key={"radarToggleBox"} id="all expanded" type="checkbox" checked={props.showAllCards} onChange={(e)=>props.setShowAllCards(e.currentTarget.checked)}/> Show all cards </label>
                </div>
                <div className="box-closing">
                    <i className="symbol size-20 fill" onClick={()=>props.deleteCountry()}>cancel</i>
                </div>
            </div>
            <div className="country-content-container">
                <div className="country-content">
                    {/*component for each player*/}
                    {Object.keys(props.data).map((item,index)=><PlayerContent key={index+"playerContent"} slug={item} displayName={props.data[item].displayName} showDetails={props.data[item].showDetails} club={props.data[item].club} avatar={props.data[item].avatar} cards={props.data[item].cards} addPlayer={props.addPlayer} handleShowSingleDetails={props.handleShowSingleDetails} compareLength={props.compareLength}/>)}
                </div>
            </div>
        </div>
    );
};

function PlayerContent(props){
    return(
        <div className="player-content">
            <div className="player-content-head">
                <div className="avatar-placeholder">
                    <svg className="small-player-avatar" viewBox="0 0 108 108" xmlns="http://www.w3.org/2000/svg" onClick={(e)=>props.handleShowSingleDetails(e)} id={props.slug}>
                        <defs>
                            <clipPath id="avatarClip">
                                <path d="M88.5274044717331 60.3817910158241 A20 20 0 0 0 90.7881844381693 43.2094622878003 L81.2210986290405 20.1124739750159 A20 20 0 0 0 67.4798156916519 9.56841672770415 L42.6936941573037 6.30526192220486 A20 20 0 0 0 26.6916312534805 12.9335334029182 L11.4725955282641 32.7673669102038 A20 20 0 0 0 9.21181556183137 49.9396956382281 L18.778901370965 73.0366839510105 A20 20 0 0 0 32.5201843083557 83.5807411983194 L57.3063058427047 86.8438960038135 A20 20 0 0 0 73.3083687465265 80.2156245230968 Z"/>
                            </clipPath>
                        </defs>
                        <path stroke="white" strokeWidth="5px" fill="white" d="M93.4846287786021 60.6538196394811 A20 20 0 0 0 95.7454087450384 43.4814909114572 L84.2649057740838 15.7651049361162 A20 20 0 0 0 70.5236228366953 5.22104768880445 L40.7802769954776 1.30526192220534 A20 20 0 0 0 24.7782140916545 7.93353340291871 L6.51537122139491 31.7341336116611 A20 20 0 0 0 4.25459125496218 48.9064623396855 L15.7350942259225 76.6228483150241 A20 20 0 0 0 29.4763771633132 87.166905562333 L59.2197230045317 91.082691328926 A20 20 0 0 0 75.2217859083535 84.4544198482093 Z" />
                        <image clipPath="url(#avatarClip)" href={props.avatar} height="75%" width="75%" y="5px" x="8px" preserveAspectRatio="xMidYMid"/>    
                        <path stroke={"var(--light-orange)"} strokeWidth="5px" fill="none" d="M93.4846287786021 60.6538196394811 A20 20 0 0 0 95.7454087450384 43.4814909114572 L84.2649057740838 15.7651049361162 A20 20 0 0 0 70.5236228366953 5.22104768880445 L40.7802769954776 1.30526192220534 A20 20 0 0 0 24.7782140916545 7.93353340291871 L6.51537122139491 31.7341336116611 A20 20 0 0 0 4.25459125496218 48.9064623396855 L15.7350942259225 76.6228483150241 A20 20 0 0 0 29.4763771633132 87.166905562333 L59.2197230045317 91.082691328926 A20 20 0 0 0 75.2217859083535 84.4544198482093 Z" />
                        <path stroke={"var(--dark-orange)"} strokeWidth="5px" fill="none" d="M88.5274044717331 60.3817910158241 A20 20 0 0 0 90.7881844381693 43.2094622878003 L81.2210986290405 20.1124739750159 A20 20 0 0 0 67.4798156916519 9.56841672770415 L42.6936941573037 6.30526192220486 A20 20 0 0 0 26.6916312534805 12.9335334029182 L11.4725955282641 32.7673669102038 A20 20 0 0 0 9.21181556183137 49.9396956382281 L18.778901370965 73.0366839510105 A20 20 0 0 0 32.5201843083557 83.5807411983194 L57.3063058427047 86.8438960038135 A20 20 0 0 0 73.3083687465265 80.2156245230968 Z" />
                    </svg>
                </div>
                <div className="player-content-header-info">
                    <div className="player-info player-name">
                        {props.displayName}
                        {/*only shows if there are fewer than 4 players already selected*/}
                        {props.compareLength<4 && <div className="small-compare-button" id={props.slug} onClick={(e)=>props.addPlayer(e)}>Compare</div>}
                    </div>
                    <div className="player-info ellipsis">{props.club}</div>
                </div>
            </div>
            {/*cars only show if option is selected*/}
            {props.showDetails && 
                <div className="player-content-body">
                    {props.cards.map((item,index)=><img key={index+"img"} className="card-image" src={item} alt={item}/>)}
                </div>
            }
        </div>
    );
}