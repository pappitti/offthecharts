# INTRODUCING OFF_THE_CHARTS

Off_the_charts is a data visualization project dedicated to sports statistics. The project uses the Sorare scoring matrix for its analyses. V2.2.0 adds a map to visualize Sorare's players and compare them.  

This project was bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app). It was initially designed to learn and practice frontend development and explore data visualization concepts. The transition from React app to Next.js took place at V2.2.0. The router and server components allowed to integrate a number of features that were previously left out. Including the API. If you have an API key for Sorare, you can run this app locally (see below).  
  
# Key Features
## Radar/Polar chart:
The polar chart was developed so that the area is proportional to a score according to a given scoring matrix. In this example, the Sorare matrix. This allows to compare players across various positions and to track performance over time. script for the path in the radarPath.js file. angle breakdown in /pictures/BigRadar.png. 
Find more information about the genesis of the project here : https://pitti.io/articles/not-all-sports-statistics-are-equal

## Map  
The map was developed by PITTI, lifting a map created by Simplemaps.com (MIT License). All relevant information regarding the original Simplemaps.com map and how we processed it are presented in ./components/worldMap.js.
  
# Others  
## Next steps / roadmap :
- search by name instead of slug input (requires light backend, MongoDB would do)
- Build area chart, add DA icons in area chart tooltip, expand tooltip to show all gamedata  

## Licence / IP / Copyrights
Stats and player information (including pictures) are fetched from the Sorare API [https://github.com/sorare/api]. See details in ./api/player/route.js and ./api/user/route.js. Nothing is stored in a proprietary database.  
The area chart leverages the Victory library (Formidable). Icons from Font Awesome, Google Fonts and SorareData.com
The map was build using a map from Simplemaps.com under MIT Licence.  
We never had any intention to make a commercial product out of this, but if you do reuse part of the code, be aware of the potential issues that may arise from the third parties mentioned above. Otherwise, just feel free to hack it, break it, whatever. Please feedback any issues you identify, it is also part of the learning process...

## Running Off_the-Charts locally
Clone this Github repo. Make sure you have Node.js installed.  
Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
  
You will need an API key for the Sorare API as queries exceed the basic depth... and you may run into a rate limit problem.
Create a file named .env in your root folder (same as README, package.json...), and paste the relevant variables (below) without quotation marks   
SORARE_APIURL=https://api.sorare.com/graphql  
SORARE_API_KEY=YOUR_API_KEY_HERE
