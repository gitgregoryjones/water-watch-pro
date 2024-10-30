import React from 'react'
import ItemControl from './ItemControl'
import Card from './Card'
import CardContent from './CardContent'




export default function ContactAssignment({ contact, deleteLocationsFromUser,addLocationsToUser, contactList,assignedContact, setAssignedContact, unassignedList}) {
  return (
    <Card className={`big-card flex  flex-col md:flex-row justify-start  ${contact.id == -1 ? "bg-green-800/85" : `bg-[--admin-color]`}  `} >
       
      
<ItemControl className={`flex-[2]`}
            collectionList={contactList}
            showAddButton={false}
            showSelectButton={true}
            enableMultiSelect={false}
            onItemClicked={setAssignedContact}
            searchPlaceholder='Search Contacts...'
            addButtonLabel={<span>Add Contact &nbsp;<i class="fa-solid fa-plus"></i></span>}


          />
        
       
       
        <ItemControl className={`flex-[2]`}
            collectionList={assignedContact.locations}
            showAddButton={true}
            showSelectButton={true}
            enableMultiSelect={true}
            onAddClicked={(list)=>{deleteLocationsFromUser(list) }}
            searchPlaceholder='Search Assigned...'
            addButtonLabel={<span>Move Locations <i class="fa-solid fa-angles-right"></i>&nbsp;</span>}


          />
      
      <ItemControl className={`flex-[2]`}
            collectionList={unassignedList}
            showAddButton={true}
            showSelectButton={true}
            enableMultiSelect={true}
            onAddClicked={(list)=>{addLocationsToUser(list)}}
            searchPlaceholder='Search Unassigned...'
            addButtonLabel={<span><i class="fa-solid fa-angles-left"></i> Move Locations &nbsp;</span>}


          />
  

        </Card>
  )
}
