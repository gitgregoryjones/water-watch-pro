import api from "/src/utility/api.js"; // Import your api utility

const fetchContacts = async (user) => {
  console.log(`Contacts called`);

  try {
    const response = await api.get("/api/contacts/", {
      params: { page: 1, page_size: 250 }, // Use params for query string handling
      headers: {
        "Authorization": `Bearer ${user.accessToken}`, // Authorization header if required
      },
    });

    return response.data; // Assuming contacts are in the `data` field
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return [];
  }
};

export default fetchContacts;
