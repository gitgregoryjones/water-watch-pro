
import api from "./api";
import { API_HOST } from "./constants";

export default async function fetchByPage(url, page=1,pageSize=250){

    try {
       
        let rows = [];

        while(page > 0){
            const response = await api.get(`${url}`,{
                params:{
                    page:page++,
                    page_size: pageSize
                }
                
            });
            if(response.data.length > 0){
                rows = rows.concat(response.data)
            }

            if(response.data.length < pageSize){
                break;
            }
        }
        console.log(`Returning rows ${JSON.stringify(rows)}`)
        return rows; // Assuming contacts are in the `data` field
    } catch (error) {
        console.error("Error fetching contacts:", error);
        return [];
    }
}
