import React, { useState } from 'react'
import {addLocation,
updateLocation,
deleteLocation,
addContact,
updateContact,
deleteContact } from '../utility/LocationContactsSlice'

import { useSelector,useDispatch } from 'react-redux'
import FormContainer from '../components/FormContainer';
import Button from '../components/WaterWatchProButton';
import ButtonContainer from '../components/ButtonContainer';
import ItemControl from '../components/ItemControl';
import { updateUser } from '../utility/UserSlice';
import { Link, useNavigate } from 'react-router-dom';
import { useRadioGroup } from '@mui/material';



export default function SwitchUser() {
   
  const contacts = useSelector((state) => state.locationContacts.contacts);
  const user = useSelector((state) => state.userInfo.user);
  const dispatch = useDispatch();

  let button = 0;

  let [newUser, setNewUser] = useState({});

  let navigate = useNavigate();

  /**
   * Handle the form submission by evaluating the id of the button to determine the next action.  
   * Switch to the new user profile if save button clicked or cancel
   * always return to dashboard
   * @param {*} event 
   */
  const handleSubmit = (event) => {

    event.preventDefault();

    

    switch(event.nativeEvent.submitter.id){

        case "cancel":
            navigate("/dashboard");
            break;
        case "save":
            dispatch(updateUser(newUser));
            navigate("/dashboard");
            break;
        default:
            console.log(`The save and cancel buttons don't have an id of 'save' and  'cancel'.  Please add the id attribute tot he button with the correct value and try again.`)
            break;
    }


  }


  function subscriptionToString(tier){
    switch (tier){
        case 1:
            return "Silver";
            break;
        case 2:
        case 3:
            return "Gold";
            break;
        default:
            return "Bronze"
            break;

    }
  }

  return (

    <div className='mt-8 md:mt-28 border-b md:border-b-[unset] pb-8 bg-[white] md:bg-[white] flex flex-col md:border  md:max-w-[90%] gap-4 w-full  h-full min-h-full justify-center py-0 my-0'>
   <div className='flex flex-col justify-center items-center border-t-4  border-x-4 bg-[--main-2] pb-4 md:shadow-[unset] text-[white]'>
   <div className='h-4 mt-4 md:h-0 md:mt-0'></div>
    <div className='text-md md:text-2xl pt-4 pl-4 font-bold mb-2 text-[white]'>Switch User</div>
    <div className='flex gap-2 justify-center items-center'>
        
        <i className="hidden pl-2 text-[--main-1] text-lg  fa-solid fa-user-group"></i>
        <span>{user.name}</span>
        <i className=" pl-0 text-[--secondary-2] text-lg  fa-solid fa-repeat"></i>
        {newUser?.name ?  <div className='font-bold'>{newUser.name} : {newUser.role}</div> : <i class="fa-solid fa-question"></i> }
        
    </div>
    {newUser?.name  ? <div className='font-bold'>Subscription Level :  {subscriptionToString(newUser.tier)}</div> : ''}
    </div>
   
    <div className='flex gap-4 px-4' >
    <FormContainer  onSubmit={handleSubmit} className='md:hidden flex flex-1 w-full'>
        
          
        <div className='hidden grid-cols-2 grid w-full gap-4'>
        <label>User To Mimic</label>
            <label>Role to Mimic</label>
            <div className='border-b-4 border-[gold]'>{newUser.name? newUser.name : "None Selected"}</div>
            <div className='border-b-4 border-[gold] min-h-8'>{newUser.name? newUser.role : "N/A"}</div>
            <div className='col-span-2 mt-2'></div>
        <label >Current User</label>
        <label>Current Role</label>
            <div className='border-b border-b-4 border-[green]  w-full min-h-8'>{user.firstName} {user.lastName}</div>
            
            <div className='border-b border-b-4 border-[green]  w-full min-h-8'>{user.role}</div>
            
            
        </div>
            <hr/>
           
           
            <label className='md:hidden font-bold  pt-2'>Choose or Search From Users Below</label>
            <div className='hidden md:flex font-bold bg-[#fff7e3] px-8  text-lg border-2 border-[gold] items-start pt-8 border rounded-2xl w-full h-full leading-[3rem]'><div><i class="fa-solid fa-circle-info"></i> Choose a new user to mimic from the list and click the "Switch User" button to continue.  The user's name and role will show above as you toggle through your choices.</div></div>
            <div className='w-full md:hidden'>
            <ItemControl
                collectionList={contacts}
                className={'max-h-[50%] md:h-full  w-full md:shadow-[unset]  '}
                showFavoriteControls={false}
                showAddButton={false}
                searchPlaceholder='Search Users...'
                onItemClicked={setNewUser}
            />
            </div>
            <ButtonContainer className="md:hidden">
                 <Button id="cancel" className={'bg-[#84A98C]'}>Cancel</Button> <Button id="save">Switch User!</Button>
            </ButtonContainer>

          
           
            
        </FormContainer>
        <div className='hidden md:flex md:flex-1 flex-col gap-4 p-4 bg-[white] rounded-2xl'>
        <label className='font-bold px-2 pt-4'><i className=" pr-2 text-[--main-1] text-lg  fa-solid fa-user-group"></i>All System Users</label>
        <ItemControl
                collectionList={contacts}
                className={'h-full min-h-[25rem]  w-full md:shadow-[unset]   gap-4 '}
                showFavoriteControls={false}
                showAddButton={false}
                searchPlaceholder='Type to Search Users...'
                onItemClicked={setNewUser}
            />
            <FormContainer onSubmit={handleSubmit}>
             <ButtonContainer>
                 <Button id="cancel" className='bg-[#96B8C8]' >Cancel</Button> <Button  id="save" >Switch User</Button>
                
            </ButtonContainer>
            </FormContainer> 
            
        </div>
        </div>
        </div>
  )
}

