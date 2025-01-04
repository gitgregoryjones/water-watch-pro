import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaEdit, FaTrashAlt, FaUser } from "react-icons/fa";

import api from "../utility/api";
import Card from "../components/Card";
import { useSelector } from "react-redux";
import SettingsMenu from "../components/SettingsMenu";
import { useDispatch } from "react-redux";
import { updateUser } from "../utility/UserSlice";
import Upgrade from "../components/Upgrade";
import { swapUser } from "../utility/loginUser";


const ClientListPage = () => {
  const [clients, setClients] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({});
  const [pageSize, setPageSize] = useState(250);
  const location = useLocation();

  
  const dispatch = useDispatch();
  
  

  useEffect(()=>{
    console.log(`Location user ${JSON.stringify(location.state)}`)
    if(location.state)
        setSelectedFilters(location.state)
  },[])
  
  
  /*useState({
    gold: true,
    silver: false,
    bronze: false,
    trial: false,
    unpaid: false,
  });*/

  const navigate = useNavigate();
  const user = useSelector((state) => state.userInfo.user);

  const fetchClients = async (page) => {
    try {
      let rows = []; // To store results from both pages
  
      for (let i = page; i > 0 ; i++) { // Loop from page to page + 1
        console.log(`Getting results for page ${i}`); // Use the loop counter `i`
        const response = await api.get(
          `/api/clients/?client_id=${user.clients[0].id}&page=${i}&page_size=${pageSize}`
        );
      
        
        if (response.data.length > 0) {
          rows = rows.concat(response.data); // Append results to rows
        } 

        if(response.data.length < pageSize) {
          break;
        } 
      }
  
      setClients(rows); // Update state with the combined results
    } catch (error) {
      console.error("Error fetching clients:", error.message);
    }
  };
  

  const masquerade = async (client) =>{

    let swapped = await swapUser(user,client);

    if(!swapped.errors){
      
       dispatch(updateUser(swapped.user))
        navigate("/dashboard")
   
    } else {
      console.error(swapped.errors)
    }

  }

  const filterClients = (e) => setSearchTerm(e.target.value);

  const handleFilterChange = (filterName) => {
    setSelectedFilters((prevFilters) => ({
      ...prevFilters,
      [filterName]: !prevFilters[filterName],
    }));
  };

  const filtered = clients.filter((client) => {
    const matchesSearch =
      client.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.toLowerCase().includes(searchTerm.toLowerCase());
  
    // Create an array of selected tiers
    const selectedTiers = [];
    if (selectedFilters.gold) selectedTiers.push("gold");
    if (selectedFilters.silver) selectedTiers.push("silver");
    if (selectedFilters.bronze) selectedTiers.push("bronze");
    
  
    // Check if the client's tier matches any of the selected tiers
    const matchesTier = selectedTiers.length === 0 || selectedTiers.includes(client.tier);

    let matchesTrial = true;

    if (selectedFilters.trial) {
        matchesTrial = client.account_type != "paid"
    }
  
  
   
  
    return matchesSearch && matchesTier && matchesTrial;
  });
  
  
  const handleDelete = async (clientId) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        await api.delete(`/api/clients/${clientId}`);
        fetchClients(currentPage);
      } catch (error) {
        console.error("Error deleting client:", error.message);
      }
    }
  };


  


  const handleEdit = (client) => {
    navigate("/client-form", { state: { client } });
  };

  useEffect(() => {
    fetchClients(currentPage);
  }, [currentPage]);

  

  return (
    <div className="mt-16 p-6 w-full text-sm flex flex-col items-center font-sans">
      <h1 className="text-2xl font-bold text-green-800 m-8 self-start">
        Settings > Clients
      </h1>
      <Card
        className="w-full"
        header={<SettingsMenu activeTab={"clients"} />}
      >
        <div className="mt-2 p-6 w-full md:w-full mx-auto bg-white shadow-md rounded-lg">
          <div
            className={`p-2 px-2 mb-2 border rounded bg-[#128CA6] text-[white] flex gap-2 items-center`}
          >
            <i className="text-yellow-500 fa fa-building"></i>
            {filtered.length} clients are viewable. Scroll down to see more.
          </div>
          <div className="flex justify-around items-end md:items-center gap-4 mb-6">
            <div className="flex md:flex-row flex-col md:justify-between flex-1">
              <input
                type="text"
                className="p-2 border border-green-800 rounded text-md flex flex-1"
                onChange={filterClients}
                placeholder="Search Clients..."
                value={searchTerm}
              />
            </div>
            <button
              onClick={() => navigate("/client-form")}
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              Add Client
            </button>
          </div>
          <div className="flex gap-4 items-center justify-start">
            <div className="font-bold">
              Gold{" "}
              <input
                type="checkbox"
                name="gold"
                checked={selectedFilters.gold}
                onChange={() => handleFilterChange("gold")}
              />
            </div>
            <div className="font-bold">
              Silver{" "}
              <input
                type="checkbox"
                name="silver"
                checked={selectedFilters.silver}
                onChange={() => handleFilterChange("silver")}
              />
            </div>
            <div className="font-bold">
              Bronze{" "}
              <input
                type="checkbox"
                name="bronze"
                checked={selectedFilters.bronze}
                onChange={() => handleFilterChange("bronze")}
              />
            </div>
            <div className=" font-bold">
              Trial{" "}
              <input
                type="checkbox"
                name="trial"
                checked={selectedFilters.trial}
                onChange={() => handleFilterChange("trial")}
              />
            </div>
            <div className="hidden font-bold">
              Unpaid{" "}
              <input
                type="checkbox"
                name="unpaid"
                checked={selectedFilters.unpaid}
                onChange={() => handleFilterChange("unpaid")}
              />
            </div>
          </div>

          <table className="table-auto block md:w-full min-h-[300px] h-[300px] overflow-auto border border-gray-300">
            <thead>
              <tr className="bg-gray-100 sticky top-0">
                <th className="text-sm border border-gray-300 p-2 text-center sticky top-0 md:min-w-[300px]">
                  Account Name
                </th>
                <th className="text-sm border border-gray-300 p-2 text-center sticky top-0 md:table-cell md:w-full">
                  Status
                </th>
                <th className="text-sm border border-gray-300 p-2 text-center sticky top-0 md:table-cell md:w-full md:min-w-[300px]">
                Account Type
                </th>
                <th className="text-sm border border-gray-300 p-2 text-center sticky top-0 md:table-cell">
                  Actions
                </th>
              </tr>
            </thead>
            {filtered.length > 0 ? (
              <tbody>
                {filtered.map((client) => (
                  <tr
                    className={`${
                      window.innerWidth < 800 && "cursor-pointer"
                    }`}
                    key={client.id}
                    onClick={() =>
                      window.innerWidth < 800 && handleEdit(client)
                    }
                  >
                    <td className="text-sm border border-gray-300 p-2 md:table-cell text-start">
                      {client.account_name}
                    </td>
                    <td className="text-sm border border-gray-300 p-2 md:table-cell">
                      {client.account_type || "N/A"}
                    </td>
                    <td className="text-sm border border-gray-300 p-2 md:table-cell">
                      {client.tier || "N/A"}
                    </td>
                    <td className="text-sm border border-gray-300 p-2 items-center gap-4 md:table-cell">
                    <Upgrade showMsg={false} tier={4}><button
                    onClick={() => masquerade(client)}
                    className="text-blue-500 hover:text-blue-700 px-2"
                    title={`Masquerade as ${client.name} `}
                  >
                    <FaUser />
                  </button>
                  </Upgrade>
                      <button
                        onClick={() => handleEdit(client)}
                        className="text-blue-500 hover:text-blue-700 px-2"
                        title="Edit Client"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete Client"
                      >
                        <FaTrashAlt />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            ) : (
              <tbody className="relative">
                <i className="absolute text-[green] fa fa-spinner top-[5rem] text-4xl left-1/2 animate-spin"></i>
              </tbody>
            )}
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ClientListPage;
