import { NextResponse } from 'next/server'
import {countriesDict} from '../../components/worldMap'

//query to get first page of all cards
const simplequery=`query myusercards($slug:String!){
                        user(slug:$slug){
                        slug
                        paginatedCards{
                            pageInfo{
                            hasNextPage
                            endCursor
                            }
                            nodes{
                            slug
                            pictureUrl
                            player{
                                slug
                                pictureUrl(derivative:"avatar")
                                displayName
                                activeClub{
                                name
                                country{
                                    slug
                                    code
                                }
                                }
                            }
                            }
                        }
                        }
                    }`

//query to get other pages of all cards
const paginatedquery=`query myusercards($slug:String!,$text:String!){
                            user(slug:$slug){
                            slug
                            paginatedCards(after:$text){
                                pageInfo{
                                hasNextPage
                                endCursor
                                }
                                nodes{
                                slug
                                pictureUrl
                                player{
                                    slug
                                    pictureUrl(derivative:"avatar")
                                    displayName
                                    activeClub{
                                    name
                                    country{
                                        slug
                                        code
                                    }
                                    }
                                }
                                }
                            }
                            }
                        }`
 //function to get all cards from a user
async function findAllCards(querytype,requestVariables,recursions){
     //fetch cards on given page using query and variables above
    const res= await fetch(process.env.SORARE_APIURL, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "apiKey": process.env.SORARE_API_KEY
        },
        body: JSON.stringify({
            query: querytype,
            variables: requestVariables
        })
    })
    const content = await res.json();
    if (content.errors) {
        console.error(content.errors);
        throw new Error('Failed to fetch API');
    }
    //recursive function to get cards on the next page (stops after 60 recursions, so probably around 3000 cards max - avoids PawelTrader crash should be enough for now)
    if (content.data.user.paginatedCards.pageInfo.hasNextPage && recursions<59){
        const newVariables=JSON.stringify({slug:content.data.user.slug,text:content.data.user.paginatedCards.pageInfo.endCursor});
        const paginatedCards=await findAllCards(paginatedquery,newVariables,recursions+1);
        content.data.user.paginatedCards.nodes=content.data.user.paginatedCards.nodes.concat(paginatedCards);
    }
    return content.data.user.paginatedCards.nodes;
}                        

export async function POST(request) {
    //add timeout?
  const body=await request.json();
  const requestVariable = JSON.stringify(body);
   //fetch user information using query and variables above
  const allCards=await findAllCards(simplequery,requestVariable,0);
  // generate a dictionary of cards by country
  const allCardsbyCountry=allCards.reduce((acc,card)=>{ 
    if (card.player.activeClub){
        function countryCode(input){
            //function to convert country slug to country code (trims last characters for wales and scotland as map does not have these countries)
            const firstTwoChars = input.toUpperCase().substring(0, 2);
            // converts monaco to france
            if (firstTwoChars === "MC") {
                return "FR";
            } 
            else if (firstTwoChars === "HK") {
                return "CN"; // Sorry for those who are offended by this, but it's the only way to get the map to work
            }
            else {
                return firstTwoChars;
            }
        };
        const country=countryCode(card.player.activeClub.country.slug);
        // if the object already contains the player, just adds the card to the array otherwise creates the entry for the player
        if (acc[country]){
        acc[country].push({cardUrl:card.pictureUrl,cardSlug:card.slug, playerSlug:card.player.slug, playerDisplayName:card.player.displayName, playerAvatar: card.player.pictureUrl,activeClub:card.player.activeClub.name});
        }else{
            acc[country]=[{cardUrl:card.pictureUrl,cardSlug:card.slug, playerSlug:card.player.slug, playerDisplayName:card.player.displayName, playerAvatar: card.player.pictureUrl,activeClub:card.player.activeClub.name}];
        }
        // check if, for some reason, the country is not in the dictionary
        if (!countriesDict[country]){
            console.log("country not found",country);
        }
    }
    // if the player is not active, adds the card to a category called NEMO
    else if (!acc["NEMO"]){acc["NEMO"]=[{cardUrl:card.pictureUrl,cardSlug:card.slug, playerSlug:card.player.slug, playerDisplayName:card.player.displayName,playerAvatar: card.player.pictureUrl}]}
    else{acc["NEMO"].push({cardUrl:card.pictureUrl,cardSlug:card.slug, playerSlug:card.player.slug, playerDisplayName:card.player.displayName,playerAvatar: card.player.pictureUrl})}
    
    return acc},{})
 
  return NextResponse.json(allCardsbyCountry)
}
