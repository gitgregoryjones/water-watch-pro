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
import fetchJsonApi from '../utility/fetchJsonApi'
import Processing from '../components/Processing'
import MapWithGroupedMarkers from '../components/MapWithGroupedMarkers'


export default function DashboardPage() {

  const contacts = useSelector((state) => state.locationContacts.contacts);

  //const locations = useSelector((state) => state.locationContacts.locations);

  const user = useSelector((state) => state.userInfo.user);

  const locations = user.locations;
  

  var [show, setShow] = useState(false);

  var [rainInterval,setRainInterval] = useState("daily");

  var [mapCoords, setMapCoords] = useState({lat:33.748783,lng:-84.388168});

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
  
  const [showIndividualMarkers, setShowIndividualMarkers] = useState(false);

  const groupedLocations = groupLocations(locationList);

  const [currentLocation, setCurrentLocation] = useState(null);

  const [noaaThreshold, setNOAAThreshold] = useState(10);


  
  //const locations = useSelector((state) => state.locationContacts.locations);
  
  const dispatch = useDispatch();
  
  

  //console.log(`Locations is ${JSON.stringify(contacts)}`)

  
 var citiesToDisplay = [];

 

  useEffect(()=>{

    //console.log(`Made it to Use Effect Dashboard MapCoords and Filtered Map Zoom to 15 cause length is ${filteredList.length}`)
   

    if(filteredList?.length > 0){
      setLocationList(filteredList);
    
        
    } else {
      

      //console.log(`Location DB Records is ${JSON.stringify(locations)}`)
      
      setMapCoords({lat:locations[0]?.latitude, lng:locations[0]?.longitude})
      setLocation(locations[0]);
      setMapZoom(10)
      setLocationList(locations);
      
     
    }
    
    
    
  },[filteredList])

  useEffect(()=>{
    //console.log(`Location List size is now ${locationList.length}`)
    
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

  useEffect(() => {
    // Get the user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('Error fetching current location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }, []);

  var [cameraProps,setCameraProps] = useState({center:{lat:-33.8567844,lng:151.213108},zoom:5});

  const handleCameraChange = useCallback((ev) => {
    console.log(`Set Camera Props called`)
    setCameraProps(ev.detail)
    setMapCoords(ev.detail.center)
    setMapZoom(ev.detail.zoom)
  }
  );

  function setMapCenter(locationObject, zoomIn){
    console.log(`This is the location DUDE ${JSON.stringify(locationObject)}`);
    console.log(`Map Center called for ${locationObject.name}`)
    zoomIn && setMapCoords({lat:locationObject.latitude, lng:locationObject.longitude})
    
    setNOAAThreshold(locationObject.atlas14_threshold['1h'][0]);

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

  function groupLocations(locations, groupByKey = 'region') {
    const grouped = {};
  
    locations.forEach(location => {
      const groupKey = location[groupByKey] || 'default';
      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(location);
    });
  
    return Object.values(grouped).map(group => {
      const latSum = group.reduce((sum, loc) => sum + loc.latitude, 0);
      const lngSum = group.reduce((sum, loc) => sum + loc.longitude, 0);
  
      return {
        key: group[0][groupByKey], // First item's group key
        latitude: latSum / group.length,
        longitude: lngSum / group.length,
        count: group.length,
        locations: group,
      };
    });
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

/* Rest Page after 30 seconds */
setTimeout(function() {
  console.log(`Page would refresh data after 15 mins if this was real ${new Date()}`)
}, 15 * 60 * 1000); // 5 minutes in milliseconds

const resetMap = () => {
  setMapZoom(mapZoom);
  setMapCoords(mapCoords);
  setShowIndividualMarkers(false);
};

const handleGroupClick = (group) => {
  setMapZoom(12); // Zoom in when clicking a group
  setMapCoords({ lat: group.latitude, lng: group.longitude });
  setShowIndividualMarkers(group.locations);
  //setMapCenter(group.locations[0])
  //setLocation(group.locations[0])
  //console.log('clicked')
};
  
  
  return (
    
    <Dashboard className='mt-20  md:my-[8rem] px-8'>
      
          
         
      <Card  footer={<div className='flex justify-around items-center gap-2 text-sm'><div className='bg-[green] w-[1rem] h-[.5rem] px-2'></div><span>Below Threshold</span><div className='bg-[orange] w-[1rem] h-[.5rem] px-2'></div><span>Above Threshold</span> <div className='bg-[red] w-[1rem] h-[.5rem] px-2'></div><span>NOAA 14 Exceeded</span></div>} header={<div className='flex md:flex-row flex-col justify-between w-full gap-2 items-center '><div><i  onClick={resetMap} className="cursor-pointer text-lg text-[--main-1] fa-solid fa-location-dot px-2"></i>Map {location.name ? location.name + " (" + location.location.lat + "," +   location.location.lng + ")" : ""}</div> <Processing /></div>}  >
      <PillTabs className={"pb-8 md:border-0 md:shadow-[unset]"} mini={window.outerWidth < 600}>
      <div className='tab'>Daily Total
      <Card className={"w-full md:h-full max-h-[20rem]  md:max-h-full md:flex-row border-[transparent]"} >
        
      <APIProvider apiKey={VITE_GOOGLE_API_KEY}>
           
           <Map
            
             className='max-h-[95%]   md:h-[40rem] flex-[3_3_0%] md:border'
             
             
             
             mapId={'mainMap'}
            
             gestureHandling={'greedy'}
             disableDefaultUI={false}
             zoom={mapZoom}
             center={mapCoords}
             onCameraChanged={handleCameraChange}
             
             
           >
             {currentLocation && (
          <AdvancedMarker position={currentLocation} clickable={false}>
            <div className="flex p-2 text-xl justify-center items-center">
              <i className="fas fa-map-marker-alt text-[black] text-4xl"></i>
              <div className="px-2 border rounded text-[white] text-lg bg-[blue] " title="You Are Here">
               
              </div>
            </div>
          </AdvancedMarker>
        )}
              
              {locationList.map((obj, i) => (
          <AdvancedMarker
            onClick={() => setMapCenter(obj)}
            clickable={true}
            key={obj.longitude}
            position={{ lat: obj.latitude, lng: obj.longitude }}
          >
            <div className="flex p-2 text-xl justify-center items-center">
              <i className={`fas fa-map-marker-alt flex flex-1 text-4xl ${Math.random() > obj?.atlas14_threshold['1h'][0] ? 'text-[red]' : 'text-[green]'}`}></i>
              <div className="px-2 border rounded flex flex-2 text-nowrap text-[white] text-lg bg-[green]">
                {Math.random().toFixed(2)} inches
              </div>
            </div>
          </AdvancedMarker>
        ))}
            
              {/* Render marker for current location */}
       
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
          <div className='tab'>24 Hr Accum
      <Card className={"w-full md:h-full max-h-[20rem]  md:max-h-full md:flex-row border-[transparent]"} >
    
        
      <APIProvider apiKey={VITE_GOOGLE_API_KEY}>
           
      <Map
            
            className='max-h-[95%]   md:h-[40rem] flex-[3_3_0%] md:border'
            
            
            
            mapId={'mainMap'}
           
            gestureHandling={'greedy'}
            disableDefaultUI={false}
            zoom={mapZoom}
            center={mapCoords}
            onCameraChanged={handleCameraChange}
            
            
          >
                   {/* Render marker for current location */}
       {currentLocation && (
         <AdvancedMarker position={currentLocation} clickable={false}>
           <div className="flex p-2 text-xl justify-center items-center">
             <i className="fas fa-map-marker-alt text-[black] text-4xl"></i>
             <div className="px-2 border rounded text-[white] text-lg bg-[blue] " title="You Are Here">
              
             </div>
           </div>
         </AdvancedMarker>
       )}
             
             {locationList.map((obj, i) => (
         <AdvancedMarker
           onClick={() => setMapCenter(obj)}
           clickable={true}
           key={obj.longitude}
           position={{ lat: obj.latitude, lng: obj.longitude }}
         >
           <div className="flex p-2 text-xl justify-center items-center">
             <i className={`fas fa-map-marker-alt flex flex-1 text-4xl ${obj.total_rainfall > obj.atlas14_threshold['1h'][0] ? 'text-[red]' : 'text-[green]'}`}></i>
             <div className="px-2 border rounded flex flex-2 text-nowrap text-[white] text-lg bg-[green]">
               {obj?.total_rainfall?.toFixed(2)} inches
             </div>
           </div>
         </AdvancedMarker>
       ))}
           
      
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
            
            <div className='w-full h-full text-center'>Coming Soon</div>
          </div>
          <div className='tab'>1 Hour
            <div className='w-full h-full text-center'>Coming Soon</div>
          </div>
          <div className='tab'>RAPIDRAIN
            <Upgrade>
              <RainfallChart location={location} range={"rapidrain"} />
            </Upgrade>
          </div>
          <div className='tab'>NOAA Atlas 14
          {Object.keys(location).length > 0 && location.atlas14_threshold && <ResponsiveTable  location={location} />}
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
              {<Forecast location={location} className={"items-end"}/>}
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
