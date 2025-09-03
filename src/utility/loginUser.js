import api from "./api";
import fetchByPage from "./fetchByPage";
import { updateUser } from "./UserSlice";

const swapUser = async (currentUser, newUser) => {

    

    let swapped = {errors:null,user:currentUser};

    if (window.confirm(`Hey Are you sure you want to masquerade as ${newUser.id} ${ newUser.name? newUser.name : newUser.account_name} ${newUser.email? newUser.email : newUser.invoice_email}`)) {
      try {
       console.log(`The masquerade user is ${JSON.stringify(newUser)}`)

       
      
        if(newUser.client_id){
            console.log(`This is a contact`)
            const locations = await api.get(`/api/contacts/${newUser.id}/locations?client_id=${newUser.client_id}`)

            console.log(`The locations are ${JSON.stringify(locations.data)}`)

            const tokenResponse = await api.post(`/api/services/user-token?email=${newUser.email? newUser.email : newUser.invoice_email}`)

            localStorage.setItem("accessToken",tokenResponse.data.token)

            const me = await  api.get(`/users/me`)

            console.log(`now logged in as user ${JSON.stringify({...me.data, locations:locations.data})}`)
            swapped.user = {...me.data, locations:locations.data}

        } else {
            //This is a Client
            const tokenResponse = await api.post(`/api/services/user-token?email=${newUser.email? newUser.email : newUser.invoice_email}`)
            localStorage.setItem("accessToken",tokenResponse.data.token)
            //loginUser(null,null,tokenResponse.data.token)
            console.log(`User token is now ${tokenResponse.data.token}`)
            const me = await  api.get(`/users/me`)
            const locations = await api.get(`/api/locations?client_id=${me.data.clients[0].id}`)
            console.log(`now logged in as user ${JSON.stringify({...me.data, locations:locations.data})}`)
            swapped.user = {...me.data, locations:locations.data}
        }
        
 
      } catch (error) {
        console.error("Error masquerading as client:", error.message);
        swapped.errors = error.message;
      }
    } else {
        swapped.errors = "Admin cancelled swap request. Returning Admin to List page"
    }


    return swapped;
  };

const colorLoggedInUserLocations = async(userData)=>{

    let response = {errors:"", locations:[],redirect:""}


    let yourLocations = [];
    let page = 1;
    let pageSize = 250;


   
    yourLocations =  await fetchByPage(userData.clients?.length > 1 ? `/api/locations?client_id=${userData.clients[0].id}`:`/api/locations`);


    if(userData.role == "contact" && yourLocations.length == 0){
        response.errors = `Ask the account owner to assign you to a location `;
        response.redirect = `/login`;
        return response;

    }

    

   // if(!yourLocations || yourLocations.length == 0){
   if(userData.clients[0]?.status == "pending"){
        //await api.post('/auth/jwt/logout');
       // dispatch(updateUser(userData));
        //navigate("/wizard");
        response.redirect = "/wizard";
        response.errors `User payment processed.  Assign Locations`

        return response;
    }

    let myLocations = yourLocations.map((l) => ({
        ...l,
        location: {
            lat: l.latitude,
            lng: l.longitude,
        },
    }));

    // Step 4: Get 24-hour data for locations
    const ids = myLocations.map((me) => me.id);

    let todayHr = new Date();
    todayHr.setDate(todayHr.getDate() + 1);

    const todayStrHr = `${todayHr.getFullYear()}-${(todayHr.getMonth() + 1).toString().padStart(2, '0')}-${todayHr.getDate().toString().padStart(2, '0')}`;


    const location24History = ids.length > 0 ? await api.post(userData.clients?.length > 1 ? `/api/locations/24h_data?client_id=${userData.clients[0].id}` :`/api/locations/24h_data`, ids, {
        params: {
            
            
        }
    }) : [];

    const loc24 = location24History.data;

    myLocations = myLocations.map((location) => {
        //location.atlas14_threshold = JSON.parse(location.atlas14_threshold);
        location.atlas14_threshold = (location.atlas14_threshold);
        let loc24Data = loc24.locations[location.id];
        if (loc24Data) {
            try {
               
            location.total_rainfall = loc24Data.total_rainfall;
            location.color_24 = location.total_rainfall >= location.h24_threshold
                ? location.atlas14_threshold && location.total_rainfall > location.atlas14_threshold['24h'][0] && userData.clients[0]?.tier != 1 ? "red" : "orange"
                : "green";

            

                //console.error(`Location DOES  have atlas 24 ${location.id} ${JSON.stringify(location.atlas14_threshold)}`)
            }catch (e){
               // console.error(`Location  does not have atlas 24 ${location.id} ${JSON.parse(location.atlas14_threshold)}`)
               console.log(e.message)
            }
        }
        return location;
    });

    // Step 5: Get hourly data for locations
    let today = new Date();
    today.setDate(today.getDate());
    
    const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;

    const locationHourlyHistory = ids.length > 0 ? await api.post(userData.clients?.length > 1 ? `/api/locations/24h_data?client_id=${userData.clients[0].id}` :`/api/locations/24h_data`, ids, {
        params: {
           
            date: todayStr,
        }
    }): [];

    const locHourly = locationHourlyHistory.data;

    console.log(`Hourly Data is ${todayStr} ${JSON.stringify(locHourly)}`)

    myLocations = myLocations.map((location) => {
        const locHourlyData = locHourly.locations[location.id];
        if (locHourlyData) {
            
            location.total_hourly_rainfall = locHourlyData.total_rainfall;
            location.color_hourly = location.total_hourly_rainfall >= location.h24_threshold
               ? location.atlas14_threshold && location.total_hourly_rainfall > location.atlas14_threshold['24h'][0] && userData.clients[0]?.tier != 1 ? "red" : "orange"
                : "green";
        }
        return location;
    });

    //userData.locations = myLocations;

    
    response.locations = myLocations;
    // Dispatch user data to Redux store
    //dispatch(updateUser(userData));

    console.log("User logged in and verified:", userData);
    console.log(`Location after login ${JSON.stringify(response)}`)

    return response;

}

const convertTier = (person) =>{

    

    let tier = 1;

    

    switch (person.clients[0]?.tier.toLowerCase()) {
        case "bronze":
            tier = 1;
            break;
      
        case "gold":
            tier = 3;
            break;
        case "silver":
            tier = 2;
            break;
        
        default:
            tier = 0;
            break;
    }

    if(person.is_superuser){
        tier = 4;
    }

    return tier;

}

const postClient = async(clientData) =>{

    let response = {clientData,errors:[]}

    try {

    const clientResponse =  await api.post(`/api/clients/`, clientData);

    response.data = clientResponse.data;

    }catch(e){

        response.errors.push(e.message)

    }finally {
        return response;
    }

    
}

const patchClient = async(clientData) =>{

    let response = {clientData,errors:[]}

    try {

    const clientResponse =  await api.patch(`/api/clients/${clientData.id}`, clientData);

    response.clientData = clientResponse.data;

    }catch(e){

        response.errors.push(e.message)

    }finally {
        return response;
    }

    
}

const logoutUser = async ()=>{
    //setShowDialog(true)
    let success = false;
    try {
      
      // Step 1: Log in to get the access token
      const loginResponse = await api.post(`/auth/jwt/logout`)
      success = true;
      

    }catch(e){
     // setShowDialog(false)
      console.log(e)
      success = false;
    } finally{
        return success;
    }


  }

const loginUser = async (email, password, token)=>{

    let userData = null;

    let response = {userData,errors:[]}

    
    
    try {

        console.log(`Logging in user ${email} with token ${token? "provided": "not provided"}`)

    const loginResponse = await api.post(`/auth/jwt/login`, new URLSearchParams({
        
        username: email,
        password: password
      
    }), {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });

    console.log(`Login response: ${JSON.stringify(loginResponse.data)}`)
    const { access_token: accessToken } = token ? {accessToken: token } : loginResponse.data;

    localStorage.setItem("accessToken", accessToken);
   
    if (!accessToken) {
        setErrorMsg("Login failed. Please check your credentials.");
        setServerError(true);
        console.log("Login failed. No access token received.");
        throw new Error("Login failed");
    }

    console.log(`Received bearer token: ${accessToken}`);

    // Step 2: Use the Token To get The Full User Profile
    const verifyResponse = await api.get(`/users/me`, {
        headers: {
            "Authorization": `Bearer ${accessToken}`,
        },
    });

    userData = verifyResponse.data;

    

    userData.firstName = userData.first_name;
    userData.lastName = userData.last_name;
    userData.accessToken = accessToken;

    userData.tier = convertTier (userData);

    
 
    
    // Step 3: Get the locations for this client
    const clients = userData.clients;

    if (!clients) {
        throw new Error(`Client Account information missing for this user ${userData.firstName} ${userData.lastName}`);
    }

    response.userData = userData;

    
    
}catch(e){

    response.errors.push(e.message);    

} finally {
    return response;
}
}



export  {loginUser, patchClient, postClient, convertTier, colorLoggedInUserLocations, swapUser, logoutUser};