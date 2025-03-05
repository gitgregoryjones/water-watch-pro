import api from "/src/utility/api.js"; // Import your api utility

const fetchContacts = async (user) => {
  console.log(`Contacts called`);

  try {
    let page = 1;
    let pageSize = 250;
    let rows = [];

    while(page > 0){
      const response = await api.get(`/api/contacts?page=${page++}&page_size=${pageSize}${user.clients.length > 1 ? `&client_id=${user.clients[0].id}`:``}`);
      if(response.data.length > 0){
        rows = rows.concat(response.data)
      }

      if(response.data.length < pageSize){
        break;
      }
    }

    return rows; // Assuming contacts are in the `data` field
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return [];
  }
};

export default fetchContacts;
