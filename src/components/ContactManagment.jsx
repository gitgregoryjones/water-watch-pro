import React from 'react'
import CardContent from './CardContent'
import Card from './Card'
import ItemControl from './ItemControl'
import FormContainer from './FormContainer'
import Button from './Button'

const handleChange = (event) => {
    

    const data = new FormData(event.target.parentElement);

    // Do a bit of work to convert the entries to a plain JS object
    const cObj = Object.fromEntries(data.entries());

    setContact(cObj)
  
  };

export default function ContactManagment({contactList, setContact, setFavoriteList, contact}) {
  return (
    <Card>
    <CardContent>
    
           <div className='header flex flex-1 justify-between m-4 md:rounded-2xl items-center text-[--text-color] md:shadow  md:border p-4'>
             <div className='md:text-2xl font-bold'>Instructions or Notes</div>
             <div className='alerts hidden md:flex flex-row gap-2 text-[--contrast] '>
            
            
             </div>
           </div>  
        <div className='content flex gap-4 md:flex-row flex-col'>
        <Card className='card  bg-[--admin-color] border' >
       
        
              <ItemControl className={`flex-[2]`}
            collectionList={contactList}
            showAddButton={true}
            onItemClicked={setContact}
            showSelectButton={false}
            enableMultiSelect={false}
            onFavoriteClicked={setFavoriteList}
            onAddClicked={(selectedRows)=> setContact({id:-1,name:'',data1:'',data2:''})}
            searchPlaceholder='Search Address Book...'
            addButtonLabel={<span className='flex justify-center gap-2 w-full items-center'><i class="fa-solid fa-plus"></i><div>Add New User</div></span>}
            paddButtonLabel={<span><i class="fa-solid fa-plus"></i> New User &nbsp;</span>}


          />
       
        </Card>
        
        <Card className={`card  ${contact.id == -1 ? "bg-green-800/85" : `bg-[--admin-color]`} flex justify-center items-start h-full`}>
        
        <FormContainer  onSubmit={()=>{}} className={`w-full min-w-full md:min-w-[unset] text-start flex-1  bg-[--text-color] `}>
        <h1 className='text-[--text-color] text-2xl'>
          
          {contact.id != -1 ? `Update ${contact.name}` : `Add New Contact`}
          </h1>    
           
       
            <label>Name</label>
            <input type="hidden" name="id" value={contact.id}/>
            <input  name="name"  placeholder="Full Name" value={contact.name} onChange={handleChange}/>
            <label>Email</label>
            <input name="email" type="email"  placeholder="Email Address" value={contact.data1} onChange={handleChange}/>
            <label >Mobile Number</label>
            <input  name="mobile" type="phone" placeholder="Phone Number" value={contact.data2} onChange={handleChange}/>
            <div className='flex justify-around gap-2'><Button>Save</Button><Button secondary='red'>Delete</Button></div>
            {
               
            } 
            
            
        </FormContainer>
        </Card>
        </div>
        </CardContent>
        </Card>
  )
}
