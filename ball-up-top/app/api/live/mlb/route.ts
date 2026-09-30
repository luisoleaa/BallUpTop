import { getLiveMlbGames } from "@/routes/live/mlb_live";

export async function GET(){
    try{
        const games = await getLiveMlbGames();
        return Response.json({games});
    }catch(error){
        return Response.json({error: "Failed to fetch live games"}, {status: 500});
    }
}