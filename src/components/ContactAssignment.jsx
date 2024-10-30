import React, { useEffect, useState } from 'react'
import ItemControl from './ItemControl'
import Card from './Card'
import CardContent from './CardContent'





export default function ContactAssignment({ contact, deleteLocationsFromUser,addLocationsToUser, contactList,assignedContact, setAssignedContact, unassignedList}) {
    var [selectedPerson, setSelectedPerson] = useState({});

    function getTheCurrentName(person){

        console.log(`The person is ${JSON.stringify(person)}`)
        setSelectedPerson(person)
        setAssignedContact(person)
    }

    return (
    <Card className={`big-card flex  flex-col md:flex-row justify-start  ${contact.id == -1 ? "bg-green-800/85" : `bg-[--admin-color]`}  `} >
     <CardContent>
     <div className='footer flex flex-1 justify-between m-4 md:rounded-2xl items-center text-[--text-color] md:shadow  md:border p-4'>
             <div style={{textShadow:"none"}} className=' md:text-md drop-shadow-none text-[black]   flex gap-4 justify-center items-center w-full'><div className='border-2 p-8 rounded-2xl  text-[black]  flex gap-2'><i class="fa-solid fa-circle-info"></i> Tip:</div><div className='border-2 p-8 rounded-2xl text-lg border-[#B3C100] text-[black]  flex gap-2 text-start  flex-1 w-full'>Tired of assigning contacts to locations manually? Click here to learn more options.</div></div>
             <div className='alerts hidden md:flex flex-row gap-2 text-[--contrast] '>
            
            
             </div>
           </div>  
     <div className='content flex gap-4 md:flex-row flex-col'>
      
<ItemControl className={`flex-[2]`}
            collectionList={contactList}
            showAddButton={false}
            showSelectButton={false}
            enableMultiSelect={false}
            onItemClicked={(person)=> {getTheCurrentName(person)}}
            searchPlaceholder='1. Find Contacts...'
            showFavoriteControls={false}
            addButtonLabel={<span>Add Contact &nbsp;<i class="fa-solid fa-plus"></i></span>}


          />
        
        <ItemControl className={`flex-[2]`}
            collectionList={unassignedList}
            showAddButton={true}
            showSelectButton={true}
            enableMultiSelect={true}
            onAddClicked={(list)=>{addLocationsToUser(list)}}
            header={<div>{selectedPerson.name? `${selectedPerson.name} 's`:''} Unassigned Locations</div>}
            showFavoriteControls={false}
            searchPlaceholder='2. View Unassigned Locations for this Contact...'
            showSearchBar={false}
            addButtonLabel={<span>Assign Locations <i class="fa-solid fa-angles-right"></i>&nbsp;</span>}


          />
       
        <ItemControl className={`flex-[2]`}
            collectionList={assignedContact.locations}
            showAddButton={true}
            showSelectButton={true}
            enableMultiSelect={true}
            header={<div>{selectedPerson.name? `${selectedPerson.name} 's ${assignedContact.locations.length}`:''} Assigned Locations</div>}
            onAddClicked={(list)=>{deleteLocationsFromUser(list) }}
            searchPlaceholder='3. See All Assigned Locations for this contact...'
            showFavoriteControls={false}
            showSearchBar={false}
            addButtonLabel={<span><i class="fa-solid fa-angles-left"></i> Unassign Locations &nbsp;</span>}


          />
      
     
  </div>
  </CardContent>

        </Card>
  )
}
