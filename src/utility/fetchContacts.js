import { API_HOST } from "/src/utility/constants.js";

// Function accepts the user object as a parameter
const fetchContacts = async (user) => {
  console.log(`Contacts called`);

  const apiUrl = `${API_HOST}/api/contacts/?page=1&page_size=250`;

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${user.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch contacts: ${response.statusText}`);
    }

    const contacts = await response.json();
    return contacts;
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return [];
  }
};

export default fetchContacts;
