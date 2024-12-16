import api from "./api";

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

const loginUser = async (email, password)=>{

    let userData = null;

    let response = {userData,errors:[]}

    try {

    const loginResponse = await api.post(`/auth/jwt/login`, new URLSearchParams({
        
        username: email,
        password: password
      
    }), {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });

    const { access_token: accessToken } = loginResponse.data;

    localStorage.setItem("accessToken", accessToken);
   
    if (!accessToken) {
        setErrorMsg("Login failed. Please check your credentials.");
        setServerError(true);
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

    switch (userData.clients[0]?.tier?.toLowerCase()) {
        case "bronze":
            userData.tier = 1;
            break;
      
        case "gold":
            userData.tier = 3;
            break;
        case "silver":
            userData.tier = 2;
            break;
        default:
            userData.tier = 0;
            break;
    }

    if(userData.is_superuser == true){
        userData.tier = 4;
    }

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

export  {loginUser, patchClient};