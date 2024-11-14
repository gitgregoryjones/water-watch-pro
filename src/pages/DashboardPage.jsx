import React, { Children, useCallback, useEffect, useReducer, useState } from 'react'
import Dashboard from '../components/Dashboard'
import Card from '../components/Card'
import CardContent from '../components/CardContent'

import Pill from '../components/Pill'
import PillControls from '../components/PillControls'
import PillContent from '../components/PillContent'


import Forecast from '../components/Forecast'

import { AdvancedMarker, APIProvider, Map, Marker, Pin } from '@vis.gl/react-google-maps'
import LocationSearch from '../components/LocationSearch'

import { createContext, useContext } from 'react';

import { LocationListContext } from '../components/LocationListContext'
import FormContainer from '../components/FormContainer'
import ButtonContainer from '../components/ButtonContainer'
import Button from '../components/WaterWatchProButton'
import {getContactsFromDB, getLocationsFromDB} from './TestData';
import ItemControl from '../components/ItemControl'
import PillTabs from '../components/PillTabs'
import MyBarChart from '../components/MyBarChart'
import Header from '../components/Header'
import ContactManagment from '../components/ContactManagment'
import ContactAssignment from '../components/ContactAssignment'
import LocationManagement from '../components/LocationManagement'
import RainfallChart from '../components/RainfallChart'
import { useSelector,useDispatch } from 'react-redux'
import Upgrade from '../components/Upgrade'
import { Link } from 'react-router-dom'
import Alerts from '../components/Alerts'
import ResponsiveTable from '../components/ResponsiveTable'
import { VITE_GOOGLE_API_KEY } from '../utility/constants'


export default function DashboardPage() {

  const contacts = useSelector((state) => state.locationContacts.contacts);

  //const locations = useSelector((state) => state.locationContacts.locations);

  const user = useSelector((state) => state.userInfo.user);

  const locations = user.locations;
  

  var [show, setShow] = useState(false);

  var [rainInterval,setRainInterval] = useState("daily");

  var [mapCoords, setMapCoords] = useState({lat:-33.8567844,lng:151.213108});

  var [filteredList, setFilteredList] = useState([]);

  var [locationList, setLocationList] = useState(locations);

  var [contactList, setContactList] = useState(contacts)

  var [contact, setContact] = useState({});

  var [location, setLocation] = useState({});

  var [isNewContact, setIsNewContact] = useState(false);

  var [mapZoom, setMapZoom] = useState(7)

  var [assignedContact, setAssignedContact] = useState([{locations:[]}])

  var [totalHighlights, setTotalHighlights] = useState(0);

  var [unassignedList, setUnassignedList] = useState(locationList);

  const [, forceUpdate] = useReducer(x => x + 1, 0);

  var [favoriteList, setFavoriteList] = useState(0);
  



  
  //const locations = useSelector((state) => state.locationContacts.locations);
  
  const dispatch = useDispatch();
  
  

  //console.log(`Locations is ${JSON.stringify(contacts)}`)

  
 var citiesToDisplay = [];

 

  useEffect(()=>{

    console.log(`Made it to Use Effect Dashboard MapCoords and Filtered Map Zoom to 15 cause length is ${filteredList.length}`)
   

    if(filteredList?.length > 0){
      setLocationList(filteredList);
    
        
    } else {
      

      console.log(`Location DB Records is ${JSON.stringify(locations)}`)
      
      setMapCoords(locations[0]?.location)
      setLocation(locations[0]?.location);
      setMapZoom(10)
      setLocationList(locations);
      
     
    }
    
    
    
  },[filteredList])

  useEffect(()=>{
    console.log(`Location List size is now ${locationList.length}`)
    
  },[locationList])

  
  useEffect(() => {
    setContactList(contacts);
    setContact(contacts[0]);
  }, [contacts]);

  useEffect(()=>{

    if(assignedContact.locations){
     setUnassignedList(getLocationsFromDB().filter(location =>
      !assignedContact.locations.some(assigned => assigned.id === location.id)
    ))
  } else {
    setUnassignedList(locations)
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

  function setMapCenter(locationObject, zoomIn){
    console.log(`Map Center called for ${locationObject.name}`)
    zoomIn && setMapCoords(locationObject.location)
    
    if(filteredList.length == 2){
      setMapZoom(8)
    } else
    zoomIn && setMapZoom(15);

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



  
  
  return (
    
    <Dashboard className='mt-20  md:my-[8rem] px-8'>
      
          
         
      <Card  header={<div className='flex gap-2 items-center '><i className="text-lg text-[--main-1] fa-solid fa-location-dot"></i>Map {location.name ? location.name + " (" + location.location.lat + "," +   location.location.lng + ")" : ""}</div>}  >
      <PillTabs className={"pb-8 md:border-0 md:shadow-[unset]"} mini={window.outerWidth < 600}>
      <div className='tab'>Daily Total
      <Card className={"w-full md:h-full max-h-[20rem]  md:max-h-full md:flex-row border-[transparent]"} >
      <APIProvider apiKey={VITE_GOOGLE_API_KEY}>
           
           <Map
            
             className='max-h-[95%]   md:h-[40rem] flex-[3_3_0%] md:border'
             
             
             
             mapId={'mainMap'}
            
             gestureHandling={'greedy'}
             disableDefaultUI={true}
             zoom={mapZoom}
             center={mapCoords}
             onCameraChanged={handleCameraChange}
             
             
           >
              
             { locationList.map((obj,i)=>{
               return ( <AdvancedMarker onClick={()=> setMapCenter(obj)} clickable={true} key={obj.location.lng}  position={obj.location}>
                       <div className='flex p-2 text-xl justify-center items-center'>
                          <i className={`fas fa-map-marker-alt flex flex-1 text-4xl ${Math.random() > .5 ? 'text-[red]' : 'text-[orange]'}`}></i><div className={`px-2 border rounded flex flex-2 text-nowrap text-[white] text-lg bg-[green]`}>{Math.random().toFixed(2)} inches</div>
                          </div>
                       </AdvancedMarker> 
                     )
             })}
            
             
             </Map>
         
         </APIProvider>
      <ItemControl className={`px-2 md:h-full max-h-[95%] md:shadow-[unset]`}
            collectionList={locationList}
            showAddButton={false}
            onItemClicked={(obj)=>setMapCenter(obj,true)}
            showSelectButton={false}
            enableMultiSelect={false}
            showFavoriteControls={false}
            
            searchPlaceholder='Search Your Locations...'
            addButtonLabel={<span><i class="fa-solid fa-angles-left"></i> Move Locations &nbsp;</span>}


          />
          
      
          
         
          </Card>
          </div>
          <div className='tab'>24 Accum
      <Card className={"w-full md:h-full max-h-[20rem]  md:max-h-full md:flex-row border-[transparent]"} >
    
        
      <APIProvider apiKey={import.meta.env.VITE_GOOGLE_API_KEY}>
           
           <Map
            
             className='max-h-[95%]   md:h-[40rem] flex-[3_3_0%] md:border'
             
             
             
             mapId={'mainMap'}
            
             gestureHandling={'greedy'}
             disableDefaultUI={true}
             zoom={mapZoom}
             center={mapCoords}
             onCameraChanged={handleCameraChange}
             
             
           >
              
             { locationList.map((obj,i)=>{
               return ( <AdvancedMarker onClick={()=> setMapCenter(obj)} clickable={true} key={obj.location.lng}  position={obj.location}>
                       <div className='flex p-2 text-xl justify-center items-center'>
                          <i className={`fas fa-map-marker-alt flex flex-1 text-4xl ${Math.random() > .5 ? 'text-[red]' : 'text-[orange]'}`}></i><div className={`px-2 border rounded flex flex-2 text-nowrap text-[white] text-lg bg-[green]`}>{Math.random().toFixed(2)} inches</div>
                          </div>
                       </AdvancedMarker> 
                     )
             })}
            
             
             </Map>
         
         </APIProvider>
      <ItemControl className={`px-2 md:h-full max-h-[95%] md:shadow-[unset]`}
            collectionList={locationList}
            showAddButton={false}
            onItemClicked={(obj)=>setMapCenter(obj,true)}
            showSelectButton={false}
            enableMultiSelect={false}
            showFavoriteControls={false}
            
            searchPlaceholder='Search Your Locations...'
            addButtonLabel={<span><i class="fa-solid fa-angles-left"></i> Move Locations &nbsp;</span>}


          />
          
      
          
         
          </Card>
          </div>
          </PillTabs>
          
      </Card>
      
      {/*<span className={`${location?.name ? '' : "hidden"}`}>*/}
      {/* These next two cards are never shown at the same time. One is for mobile and the other is larger screens md:block */}
      <Card  className={'shadow'}header={window.outerWidth >= 600 && <div className='flex items-center gap-2'><i class="fa-solid fa-droplet text-[--main-1] text-md"></i>Rainfall {location.name ? location.name : ''} </div>} >
        <PillTabs className={"md:border-0 md:shadow-[unset]"} mini={window.outerWidth < 600} header={window.outerWidth < 600 && <div className='flex items-center gap-2'><i class="fa-solid fa-droplet text-[--main-1] text-md"></i>Rainfall {location.name ? location.name : ''} </div>}>
          <div className='tab'>24 Hour
            <RainfallChart location={location} range={"daily"}/>
          </div>
          <div className='tab'>1 Hour
            <RainfallChart location={location} range={"hourly"}/>
          </div>
          <div className='tab'>RAPIDRAIN
            <Upgrade>
              <RainfallChart location={location} range={"rapidrain"} />
            </Upgrade>
          </div>
          <div className='tab'>NOAA Atlas 14
          <ResponsiveTable/>
          </div>
        
      
        </PillTabs>
        </Card>
      
  
      
      <Card header={window.outerWidth >= 600 && <div className='flex gap-2 items-center '><i className="text-lg text-[--main-1] fa-solid fa-circle-info"></i>3 Day Forecast</div>} >
           <PillTabs mini={window.outerWidth < 600} header={window.outerWidth < 600 && <div className='flex gap-2 items-center '><i className="text-lg text-[--main-1] fa-solid fa-circle-info"></i>3 Day Forecast</div>} className={"pb-8 md:border-0 md:shadow-[unset]"}>
            <div className='tab'>National
              <Forecast className={"items-end"}/>
           </div>
           <div className='tab'>{location.name ? location.name : ''}
            <Upgrade>
              <Forecast local={true} className={"items-end"}/>
            </Upgrade>
           </div>
           
            </PillTabs> 
        </Card>
        
     {/*</span>*/}
     <a name="alerts"></a>
      <Alerts/>
    </Dashboard>
   
  )
}
