
import { API_HOST } from "./constants";

export default async function fetchJsonApi(accessToken,url, body = {}, method = 'GET') {

    //console.log(`Location 2 Hello everyone!!!!  ${accessToken} ${API_HOST}/${url}`)
  
    try {
        let  fetchResponse = {};

        if(method == 'GET'){
        fetchResponse = await fetch(`${API_HOST}${url}`, {
            method: method,
        
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            

        
        });
        } else if(method == "POST") {
            fetchResponse = await fetch(`${API_HOST}${url}`, {
                method: method,
            
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body : body
                
    
            
            });

        }
   
        console.log(fetchResponse)

        if (!fetchResponse.ok) {
            console.error(`HTTP error! Status: ${fetchResponse.status}`);
            return { error: `Request failed with status ${fetchResponse.status}` };
        }
      
    
        const jsonData = await fetchResponse.json();

       // console.log(`Location 2 Returned JSON is ${jsonData}`)

   

    return jsonData;

}catch(e){
    console.log(e);
}


}
