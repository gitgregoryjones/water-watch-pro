import React, { useEffect, useState } from "react";
import { FaPlus, FaTrash, FaPencilAlt } from "react-icons/fa"; // FontAwesome icons
import api from "../utility/api";
import { unstable_HistoryRouter, useNavigate } from "react-router-dom";
import { updateUser } from "../utility/UserSlice";
import { useDispatch, useSelector } from "react-redux";
import WorkingDialog from "./WorkingDialog";
 

const ChildAccountsWidget = ({ accounts = [], onUpdate }) => {
  const user = useSelector((state) => state.userInfo.user);
  const [newClientName, setNewClientName] = useState("");
  const [childAccounts, setChildAccounts] = useState([]);
  

  const [editIndex, setEditIndex] = useState(null);
  const [editName, setEditName] = useState("");
  const [showInput, setShowInput] = useState(false);

  const [showDialog,setShowDialog] = useState(false)
  
  const navigate = useNavigate();
  
  const dispatch = useDispatch();

  const handleClientChange = async (client) => {
    //setShowDialog(true)
  
    //alert(client.id)
    let resp = await api.patch('/users/me',{
      primary_client_id:client.id
    })
    
    //alert(`Client id passed to backend was ${client.id} and First id returned is ${resp.data.clients[0].id}`)
    //alert(JSON.stringify(resp.data.clients[0]))
    let resp2 = await api.get('/users/me')
    console.log(`Second Pass Client id passed to backend was ${client.id} and First id returned is ${resp2.data.clients[0].id}`)
    //dispatch(updateUser({...user,clients:resp2.data.clients}))
    //alert(JSON.stringify(resp.data))
    //closeMenu();

    
   
    setChildAccounts(resp2.data.clients)
   
    dispatch(updateUser({...user,clients:resp2.data.clients}))
   // setShowDialog(false)
    navigate("/client-form", {state:{client:client, myself:true}})
    
    setShowDialog(true)
    setTimeout(()=> location.reload(), 100)
  };


  useEffect(() => {
    
    setChildAccounts(accounts.length > 1 ? accounts.slice(1).filter((c)=> c.status == "active") : []);
  }, [accounts]);

  // Handle adding a new client
  const handleAddClient = async () => {
  
    if (newClientName.trim() !== "") {
     
      const newClient = {
        ...accounts[0],
        account_name: newClientName,
      };

      
       let rep = await api.post(`/api/clients/${accounts[0].id}/new`, newClient);

       handleClientChange(rep.data)

      setChildAccounts([...childAccounts, rep.data]);
      setNewClientName("");
      setShowInput(false);
    }
    
  };

  // Handle deleting an account
  const handleDelete =  async(index) => {
    let rep = await api.delete(`/api/clients/${childAccounts[index].id}?client_id=${accounts[0].id}`);
    setChildAccounts(childAccounts.filter((_, i) => i !== index));
    handleClientChange()
    
  };

  // Handle editing an account
  const handleEdit = (index) => {
    setEditIndex(index);
    setEditName(childAccounts[index].account_name);
  };

  // Handle saving an edited account
  const handleSaveEdit = async () => {
    const updatedAccounts = [...childAccounts];
    updatedAccounts[editIndex] = {
      ...updatedAccounts[editIndex],
      account_name: editName,
    };
    let rep = await api.patch(`/api/clients/${ updatedAccounts[editIndex].id}`,  updatedAccounts[editIndex]);
    setChildAccounts(updatedAccounts);
    setEditIndex(null);
    handleClientChange(rep.data)
  };

  return (
    <>
    <div className={ `${showDialog  && "blur"} p-4 w-full max-w-lg border  shadow-md rounded-md`}>
      <h2 className="text-lg font-semibold mb-2">Manage Associated Client Accounts</h2>

      <ul className="mb-2">
        {childAccounts.map((account, index) => (
          <li
            key={account.id}
            className="bg-gray-200 hover:bg-slate-300 cursor-pointer p-2 rounded-md mb-2 flex items-center justify-between"
            onClick={()=>handleClientChange(account)}
          >
            {editIndex === index ? (
              <input
                type="text"
                className="flex-1 text-gray-900 p-1 border border-gray-400 rounded-md"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            ) : (
              <span className="text-gray-800">{account.account_name}</span>
            )}

            <div className="flex gap-2 ml-2">
              {editIndex === index ? (
                <button
                  className="bg-green-500 text-white px-2 py-1 rounded-md text-sm hover:bg-green-600"
                  onClick={handleSaveEdit}
                >
                  Save
                </button>
              ) : (
                <button
                  className="hidden text-blue-600 hover:text-blue-800"
                  onClick={() => handleEdit(index)}
                >
                  <FaPencilAlt />
                </button>
              )}
              <button
                className="hidden text-red-600 hover:text-red-800"
                onClick={() => handleDelete(index)}
              >
                <FaTrash />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {showInput ? (
        <div className="flex items-center gap-2 border border-gray-300 rounded-md p-2">
          <input
            type="text"
            className="flex-1 text-gray-900 p-1 border-none focus:outline-none"
            placeholder="Enter client account name"
            value={newClientName}
            onChange={(e) => setNewClientName(e.target.value)}
          />
          <button
            className={`px-4 py-1 rounded-md text-white font-semibold ${
              newClientName ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-300 cursor-not-allowed"
            }`}
            onClick={handleAddClient}
            disabled={!newClientName}
          >
            Create
          </button>
          <button
            className="px-4 py-1 bg-gray-300 rounded-md text-gray-700 hover:bg-gray-400"
            onClick={() => setShowInput(false)}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          className="flex items-center gap-2 p-2 border border-gray-400 rounded-md w-full text-left "
          onClick={() => setShowInput(true)}
        >
          <FaPlus className="" />
          <span className="">Add Client Account</span>
        </button>
      )}
      
    </div>
    <WorkingDialog showDialog={showDialog} />
    </>
  );
};

export default ChildAccountsWidget;
