import React, { Children, useCallback, useEffect, useReducer, useState } from 'react'
import Dashboard from '../components/Dashboard'
import Card from '../components/Card'
import CardContent from '../components/CardContent'

import Pill from '../components/Pill'
import PillControls from '../components/PillControls'
import PillContent from '../components/PillContent'


import Forecast from '../components/Forecast'
import { BarChart } from '@mui/x-charts'
import RainHistory from '../components/RainHistory'
import { AdvancedMarker, APIProvider, Map, Marker, Pin } from '@vis.gl/react-google-maps'
import LocationSearch from '../components/LocationSearch'

import { createContext, useContext } from 'react';

import { LocationListContext } from '../components/LocationListContext'
import FormContainer from '../components/FormContainer'
import ButtonContainer from '../components/ButtonContainer'
import Button from '../components/Button'
import {getContactsFromDB, getLocationsFromDB} from './TestData';
import ItemControl from '../components/ItemControl'
import PillTabs from '../components/PillTabs'
import MyBarChart from '../components/MyBarChart'
import Header from '../components/Header'
import ContactManagment from '../components/ContactManagment'
import ContactAssignment from '../components/ContactAssignment'
import LocationManagement from '../components/LocationManagement'



export default function DashboardPage() {

  var [show, setShow] = useState(false);

  var [rainInterval,setRainInterval] = useState("daily");

  var [mapCoords, setMapCoords] = useState({lat:-33.8567844,lng:151.213108});

  var [filteredList, setFilteredList] = useState([]);

  var [locationList, setLocationList] = useState([]);

  var [contactList, setContactList] = useState([]);

  var [contact, setContact] = useState({});

  var [location, setLocation] = useState({});

  var [isNewContact, setIsNewContact] = useState(false);

  var [mapZoom, setMapZoom] = useState(7)

  var [assignedContact, setAssignedContact] = useState([{locations:[]}])

  var [totalHighlights, setTotalHighlights] = useState(0);

  var [unassignedList, setUnassignedList] = useState(locationList);

  const [, forceUpdate] = useReducer(x => x + 1, 0);

  var [favoriteList, setFavoriteList] = useState(0);

  
  

  

  
 var citiesToDisplay = [];

 

  useEffect(()=>{

    console.log(`Made it to Use Effect Dashboard MapCoords and Filtered Map Zoom to 15 cause length is ${filteredList.length}`)
   

    if(filteredList?.length > 0){
      setLocationList(filteredList);
    
        
    } else {
      console.log(`The db recs is ${getLocationsFromDB}`)
      let locationDBRecs = getLocationsFromDB();

      console.log(`Location DB Records is ${JSON.stringify(locationDBRecs)}`)
      
      setMapCoords(locationDBRecs[0].location)
      setMapZoom(10)
      setLocationList(locationDBRecs);
     
    }
    
    
    
  },[filteredList])

  useEffect(()=>{
    console.log(`Location List size is now ${locationList.length}`)
    
  },[locationList])

  useEffect(()=>{
      let dbRecords = getContactsFromDB();
      console.log(`Location DB Records Contact is ${JSON.stringify(dbRecords)}`)
      setContactList(dbRecords)
      setContact(dbRecords[0])
  },[])

  useEffect(()=>{

    if(assignedContact.locations){
     setUnassignedList(getLocationsFromDB().filter(location =>
      !assignedContact.locations.some(assigned => assigned.id === location.id)
    ))
  } else {
    setUnassignedList(getLocationsFromDB())
  }
  },[assignedContact])

  var [cameraProps,setCameraProps] = useState({center:{lat:-33.8567844,lng:151.213108},zoom:5});

  const handleCameraChange = useCallback((ev) => {
    console.log(`Set Camera Props called`)
    setCameraProps(ev.detail)
    setMapCoords(ev.detail.center)
    setMapZoom(ev.detail.zoom)
  }
  );

  function setMapCenter(locationObject){
    console.log(`Map Center called for ${locationObject.name}`)
    setMapCoords(locationObject.location)
    if(filteredList.length == 2){
      setMapZoom(8)
    } else
    setMapZoom(15);

    setLocation(locationObject)
  }

  /* Add Contact */
  function initAddContactForm(){
    setIsNewContact(true);
  }

  function toggleLocationSelection(itemText,e){

    console.log(`Item Text is ${itemText.name} `)
    setLocationList(locationList)

    

   // setTotalClicked(e.target.parentElement.querySelectorAll('.highlight').length);

  }

  



  
  function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function deleteLocationsFromUser(list){

  setUnassignedList([...list,...locationList.filter(location =>
    !assignedContact.locations.some(assigned => assigned.id === location.id)
  )])

 assignedContact.locations = assignedContact.locations.filter(location =>
    !list.some(assigned => assigned.id === location.id)
  )
}

function addLocationsToUser(list){

 console.log(`Locations to user is ${JSON.stringify(list)}`)
  assignedContact.locations = [...assignedContact.locations,...list]; 

  setUnassignedList([...locationList.filter(location =>
    !assignedContact.locations.some(assigned => assigned.id == location.id)
  )])

}

// Example usage
const handleChange = (event) => {
    

  if(event.target.name == "lat" || event.target.name == "lng"){
    Array.from(document.querySelectorAll(".laterror")).map(e => e.style.display = "block");
    return;
  } else {
    Array.from(document.querySelectorAll(".laterror")).map(e => e.style.display = "none");
  }

  const data = new FormData(event.target.parentElement);

  // Do a bit of work to convert the entries to a plain JS object
  const cObj = Object.fromEntries(data.entries());

  setLocation(cObj)

};


  
  console.log(`Loaded Dashboard! ${import.meta.env.VITE_GOOGLE_API_KEY}`)
  return (
    
    <Dashboard className='md:p-24'>
     
        <Card className='big-card flex flex-col md:flex-row justify-center items-center bg-[--admin-color]' >
          <CardContent>
          
          <div className='header flex flex-1 justify-between m-4 md:rounded-2xl items-center text-[--text-color] md:shadow  md:border p-4'>
            <div className='md:text-3xl font-bold'>Water Watch Pro Insights</div>
            <div className='alerts hidden md:flex flex-row gap-2 text-[--contrast] '>
            <div className='stat1 bg-[--notification] shadow border rounded p-4'>A Significant event or alert goes here...</div>
            <div className='stat1 bg-[--alert] shadow border rounded p-4 '>NOA Error detected. Stay tuned...</div>
            </div>
          </div>
          <div className='content flex gap-4 md:flex-row flex-col'>
          
         
            <APIProvider apiKey={import.meta.env.VITE_GOOGLE_API_KEY}>
            <div className='md:shadow-2xl h-[20rem] md:rounded-2xl md:border md:px-2 justify-center items-center flex flex-[3_3_0%]'>
              <Map
               
                className='md:shadow-2xl md:h-[90%] h-full flex-[3_3_0%] md:border'
                
                
                
                mapId={'mainMap'}
               
                gestureHandling={'greedy'}
                disableDefaultUI={true}
                zoom={mapZoom}
                center={mapCoords}
                onCameraChanged={handleCameraChange}
                
                
              >
                 
                { locationList.map((obj,i)=>{
                  return ( <AdvancedMarker key={obj.location.lng}  position={obj.location}>
                          <div className='flex p-2 text-xl justify-center items-center'>
                             <i className={`fas fa-map-marker-alt flex flex-1 text-4xl ${Math.random() > .5 ? 'text-[red]' : 'text-[orange]'}`}></i><div className={`px-2 border rounded flex flex-2 text-nowrap text-[white] text-lg bg-[green]`}>{Math.random().toFixed(2)} inches</div>
                             </div>
                          </AdvancedMarker> 
                        )
                })}
               
                
                </Map>
                </div>
            </APIProvider>
            <ItemControl className={``}
            collectionList={locationList}
            showAddButton={false}
            onItemClicked={setMapCenter}
            showSelectButton={false}
            enableMultiSelect={false}
            
            searchPlaceholder='Search Locations...'
            addButtonLabel={<span><i class="fa-solid fa-angles-left"></i> Move Locations &nbsp;</span>}


          />
            <PillTabs className={"md:border md:rounded-2xl shadow-2xl header-mb-4 header-w-[80%] flex  flex-1 body-p-[20px] body-border-[unset]   tab-transition-all tab-duration-300 tab-ease-in-out tab-justify-center  tab-text-[white] header-rounded-2xl"}>
            <div className='tab'>
              National

              <Forecast className={"items-end"}/>
            </div>
            <div className='tab'>
          Local 
          <Forecast local={true}/>
        </div>
          </PillTabs>
            </div>
          <div className='footer my-2 p-8 justify-around flex flex-1 text-2xl'>Currently Viewing {location.name}</div>
          </CardContent>
        </Card>
  
          <Card>
          <div className='header flex flex-1 justify-between m-4 md:rounded-2xl items-center text-[--text-color] md:shadow  md:border p-4'>
             <div className='md:text-3xl font-bold'>Contact Management</div>
             <div className='alerts hidden md:flex flex-row gap-2 text-[--contrast] '>
             <div className='stat1 bg-[--notification] shadow border rounded p-4 '>{favoriteList.length} Contacts are favorited</div>
             <div className='stat1 bg-[--alert] shadow border rounded p-4 '>3 Contacts are unassigned...</div>
             </div>
           </div>  
          <CardContent>
            <PillTabs className={"content"}>
              <div className='tab'>Edit Contacts
                <ContactManagment contact={contact} contactList={contactList} setFavoriteList={setFavoriteList} setContact={setContact}/>
              </div>
              <div className='tab'>
                Assign Contacts
                
                <ContactAssignment unassignedList={unassignedList} deleteLocationsFromUser={deleteLocationsFromUser} addLocationsToUser={addLocationsToUser} contact={contact} assignedContact={assignedContact} setUnassignedList={setUnassignedList} setAssignedContact={setAssignedContact} contactList={contactList} />
              </div>
            </PillTabs>
            </CardContent>
        </Card>
                <Card>
                <div className='header flex flex-1 justify-between m-4 md:rounded-2xl items-center text-[--text-color] md:shadow  md:border p-4'>
             <div className='md:text-3xl font-bold'>Location Management</div>
             <div className='alerts hidden md:flex flex-row gap-2 text-[--contrast] '>
            
             <div className='stat1 bg-[--notification] shadow border rounded p-4 '>{locationList.length} Locations are being managed</div>
             </div>
           </div> 
                  <LocationManagement location={location} locationList={locationList} handleChange={handleChange} setLocation={setLocation} />
                </Card>
    </Dashboard>
   
  )
}
