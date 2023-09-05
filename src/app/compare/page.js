import CompareClient from "../components/compareClient";


export default async function Page({searchParams}) {
  let searchPlayers=[];
  if (searchParams.player){
    if (Array.isArray(searchParams.player)){
      searchPlayers=searchParams.player}
    else{
      searchPlayers=[searchParams.player]
    }
  }
  console.log(searchParams);
    return (
      <div className="content">
            <CompareClient  players={searchPlayers}/>
      </div>
    )
  }
