import React from 'react'
import CardContent from './CardContent'
import Card from './Card'
import ItemControl from './ItemControl'
import FormContainer from './FormContainer'
import Button from './WaterWatchProButton'


export default function LocationManagement({locationList, setLocation, location, handleChange}) {
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
            collectionList={locationList}
            showAddButton={true}
            onItemClicked={setLocation}
            showSelectButton={false}
            enableMultiSelect={false}
            onAddClicked={(selectedRows)=> setLocation({id:-1,name:'',location:{lat:'',lng:''}})}
            searchPlaceholder='Search Locations...'
            addButtonLabel={<span className='flex justify-center gap-2 w-full items-center'><i class="fa-solid fa-plus"></i><div>Add New Location</div></span>}
            paddButtonLabel={<span><i class="fa-solid fa-plus"></i> New Location &nbsp;</span>}


          />
       
        </Card>
        
        <Card className={`card  ${location.id == -1 ? "bg-green-800/85" : `bg-[--admin-color]`} flex justify-center items-start h-full`}>
        
        <FormContainer  onSubmit={()=>{}} className={`w-full min-w-full md:min-w-[unset] text-start flex-1  bg-[--text-color] `}>
        <h1 className='text-[--text-color] text-2xl'>
          
          {location.id != -1 ? `Update ${location.name}` : `Add New Location`}
          </h1>    
           
       
            <label>Name</label>
            <input type="hidden" name="id" value={location.id}/>
            <input  name="name"  placeholder="Location Name" value={location.name} onChange={handleChange}/>
            <label>Use Current Location</label>
            <input type="checkbox" />
            <label>Lat</label>
            <input name="lat" type="number"  readonly placeholder="Latitude" value={location.location?.lat} onChange={handleChange}/>
            <div className='laterror text-[--alert] hidden'>Lat/Lng fields can not be edited <a>Learn More <i className='fa fa-info-circle'></i></a></div>
            <label >Lng</label>
            <input  name="lng" type="number" readonly placeholder="Longitude" value={location.location?.lng} onChange={handleChange}/>
            <div className='laterror text-[--alert] hidden'>Lat/Lng fields can not be edited <a>Learn More <i className='fa fa-info-circle'></i></a></div>
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
