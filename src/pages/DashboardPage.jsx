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
import { API_HOST, VITE_GOOGLE_API_KEY } from '../utility/constants'
import fetchJsonApi from '../utility/fetchJsonApi'
import Processing from '../components/Processing'
import MapWithGroupedMarkers from '../components/MapWithGroupedMarkers'
import ProfilePic from '../components/ProfilePic'
import CheckboxGroup from '../components/CheckboxGroup'
import { color } from 'chart.js/helpers'
import PrettyHeader from '../components/PrettyHeader'
import Stats from '../components/Stats'
import AdminCards from '../components/AdminCards'


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

  const [hourlyRainfallChartData, setHourlyRainFallChartData] = useState({})

  const [dailyRainfallChartData,setDailyRainfallChartData] = useState({});

  const [currentColor, setCurrentColor] = useState("green")

  const [currentColor24, setCurrentColor24] = useState("green")


  
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

    //document.querySelector(".item").click();
    
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
    
    let nThresh = locationObject.atlas14_threshold;

    if(nThresh){

      setNOAAThreshold(nThresh['1h'][0]);
    } else {
      console.log(`No NOAA!`)
    }

    setLocation(locationObject)

    //document.querySelector(".mapList > .indiv")

    let choice = Array.from(document.querySelectorAll(`.mapList div.item`)).find((m)=> m.innerHTML == `${locationObject.name}`);

    choice.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    choice.click()
    console.log(`clicked for location ${locationObject.name}`)

    if(filteredList.length == 2){
      setMapZoom(8)
    } else
    zoomIn && setMapZoom(15);

    
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

useEffect(() => {
  const fetchHourlyData = async () => {
    if (!currentLocation?.id) return;

    try {
      const { data } = await api.get(`/api/locations/${currentLocation.id}/hourly_data`, {
        params: { days: 3 },
      });
      setHourlyRainFallChartData(data.hourly_data);
      console.log('Hourly Rainfall Data:', data.hourly_data);
    } catch (error) {
      console.error('Failed to fetch hourly rainfall data:', error);
    }
  };

  const fetchDailyData = async () => {
    if (!currentLocation?.id) return;

    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      const day = today.getDate().toString().padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;

      const { data } = await api.get(`/api/locations/${currentLocation.id}/hourly_data`, {
        params: { days: 3, date: todayStr },
      });
      setDailyRainfallChartData(data.hourly_data);
      console.log('Daily Rainfall Data:', data.hourly_data);
    } catch (error) {
      console.error('Failed to fetch daily rainfall data:', error);
    }
  };

  fetchHourlyData();
  fetchDailyData();
}, [currentLocation]);
  
/* Render A Row A Different Color Based on Rainfall for That Area Hourly */
function onRenderedRowHourly(raw,row,index){
  
  
  //let raincolor = raw.total_hourly_rainfall  > raw.h24_threshold ? raw.total_hourly_rainfall  > raw.atlas14_threshold['1h'][0] ? "red" : "orange" : "black";
  let raincolor = raw.color_hourly;

  let display = (currentColor != "green" && currentColor != raw.color_hourly) ? "none" : "flex";

  let clone = React.cloneElement(row,{
    
      style:{color: raincolor, fontWeight:"bold", display:display},
      filter: raincolor
  }
      
  );
  
  row = clone;
  return row;
}

/* Render A Row A Different Color Based on Rainfall for That Area 24hrAccum */
function onRenderedRow24HourAccum(raw,row,index){
  
  

  //let raincolor = raw.total_hourly_rainfall  > raw.h24_threshold ? raw.total_hourly_rainfall  > raw.atlas14_threshold['24h'][0] ? "red" : "orange" : "black";
  let raincolor = raw.color_24;

  let display = (currentColor24 != "green" && currentColor24 != raw.color_24) ? "none" : "flex";

  //console.log(`Setting ${raw.name} to display ${display} because [${raw.color_24}] and current color is ${currentColor24} `)

  let clone = React.cloneElement(row,{
    
      style:{color: raincolor, fontWeight:"bold", display:display},
      filter: raincolor
  }
      
  );
  
  row = clone;
  return row;
}

function showThreshold(color){

  setCurrentColor(color)

}

  return (
    
    <Dashboard className='mt-20  md:my-[8rem] px-8'>
      <ProfilePic/>

      {user.tier >= 4 && (<AdminCards/>)}
      
      
          
        {user.processedThrough}
      
      <Card  className={`${user.tier == 4 && 'hidden'}`}
      footer={<div className='flex justify-around items-center gap-2 text-sm'><div className='bg-[green] w-[1rem] h-[.5rem] px-2'></div><span>Below Threshold</span><div className='bg-[orange] w-[1rem] h-[.5rem] px-2'></div><span>Above Threshold</span> <div className='bg-[red] w-[1rem] h-[.5rem] px-2'></div><span>NOAA 14 Exceeded</span></div>} 
      header={<div className='flex md:flex-row flex-row justify-between w-full gap-2 items-center '><div className='flex w-full justify-around items-center'><i  onClick={resetMap} className="cursor-pointer text-lg text-[--main-1] fa-solid fa-location-dot px-2"></i>Map {location.name ? location.name + " (" + location.location.lat + "," +   location.location.lng + ")" : ""}<Processing showPlain={true}/></div> <Processing /></div>}  >
      <PillTabs className={"pb-2 md:border-0 md:shadow-[unset]"} mini={window.outerWidth < 600}>
      <div className='tab'><span>Daily Total</span>
      <Card className={"w-full md:h-full max-h-[20rem]  md:max-h-full md:flex-row border-[transparent]"} >
        
      <APIProvider apiKey={VITE_GOOGLE_API_KEY}>
           
           <Map
            
             className='max-h-[95%]   md:h-[45rem] flex-[3_3_0%] md:border md:border-slate-800'
             
             
             
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
          (currentColor == "green" || currentColor == obj.color_hourly) && <AdvancedMarker
            onClick={() => setMapCenter(obj)}
            clickable={true}
            key={i}
            position={{ lat: obj.latitude, lng: obj.longitude }}
          >
            <div className="flex p-2 text-xl justify-center items-center" title={`${obj.name}`}>
              <i className={`fas fa-map-marker-alt flex flex-1 text-4xl text-[${obj.color_hourly}]`}></i>
              <div className={`px-2 border rounded flex flex-2 text-nowrap text-[white] text-lg bg-[${obj.color_hourly}]`} > 
                {obj.total_hourly_rainfall?.toFixed(2)}
              </div>
            </div>
          </AdvancedMarker>
        ))}
            
              {/* Render marker for current location */}
       
             </Map>
         
         </APIProvider>
     
      <div className='w-[30%] md:w-[20%]'>
        <CheckboxGroup className={`border rounded mx-2 mb-2`} color={currentColor} onClick={setCurrentColor}/>
       
      <ItemControl className={`mapList px-2  justify-start md:h-[80%] max-h-[95%] md:shadow-[unset]`}
            collectionList={locationList}
            showAddButton={false}
            onItemClicked={(obj)=>setMapCenter(obj,true)}
            showSelectButton={false}
            enableMultiSelect={false}
            showFavoriteControls={false}
            onRowRendered={onRenderedRowHourly}
            
            searchPlaceholder='Search...'
            addButtonLabel={<span><i className="fa-solid fa-angles-left"></i> Move Locations &nbsp;</span>}


          />
        </div>
      
          
         
          </Card>
          </div>
          <div className='tab'>24 Hr Accum
      <Card className={`${user.tier == 4 && 'hidden'} w-full md:h-full max-h-[20rem]  md:max-h-full md:flex-row border-[transparent]`} >
    
        
      <APIProvider apiKey={VITE_GOOGLE_API_KEY}>
           
      <Map
            
            className='max-h-[95%]   md:h-[40rem] flex-[3_3_0%] md:border'
            
            
            
            mapId={'mainMap2'}
           
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
       (currentColor24 == "green" || currentColor24 == obj.color_24) &&  <AdvancedMarker
           onClick={() => setMapCenter(obj)}
           clickable={true}
           key={i}
           position={{ lat: obj.latitude, lng: obj.longitude }}
         >
           <div className="flex p-2 text-xl justify-center items-center" title={`${obj.name}`}>
             <i className={`fas fa-map-marker-alt flex flex-1 text-4xl text-[${obj.color_24}]`}></i>
             <div className={`px-2 border rounded flex flex-2 text-nowrap text-[white] text-lg bg-[${obj.color_24}]`}>
               {obj?.total_rainfall?.toFixed(2)}
             </div>
           </div>
         </AdvancedMarker>
       ))}
           
      
            </Map>
        
         
         </APIProvider>
       <div className='w-[30%] md:w-[20%]'>
      <CheckboxGroup color={currentColor24} onClick={setCurrentColor24}/>
      <hr className='hidden md:block m-2'/>
      <ItemControl className={`mapList px-2 md:h-full max-h-[95%] md:shadow-[unset]`}
            collectionList={locationList}
            showAddButton={false}
            onItemClicked={(obj)=>setMapCenter(obj,true)}
            showSelectButton={false}
            enableMultiSelect={false}
            showFavoriteControls={false}
            onRowRendered={onRenderedRow24HourAccum}
            
            searchPlaceholder='Search Your Locations...'
            addButtonLabel={<span><i className="fa-solid fa-angles-left"></i> Move Locations &nbsp;</span>}


          />
          </div>
          
      
          
         
          </Card>
          </div>
          </PillTabs>
          
      </Card>
     
      {/*<span className={`${location?.name ? '' : "hidden"}`}>*/}
      {/* These next two cards are never shown at the same time. One is for mobile and the other is larger screens md:block */}
      <div id="graphs" className='h-[10px]'></div>
      <Card className={`${user.tier == 4 && 'hidden'}`} 
        footer={window.innerWidth <= 600  && <div className='flex gap-2 justify-around text-sm py-2 items-center'><div className='bg-[orange] h-2 w-4'></div>Exceeds 24h threshold of {location.h24_threshold}  <div className='bg-[red] h-2 w-4'></div> Exceeds 24h NOAA Atlas 14</div>}
        header={window.outerWidth >= 600 && <div className='flex gap-2 items-center '><i className="text-lg text-[--main-1] fa-solid fa-droplet"></i><span>Rainfall {location.name}</span>
      <div className='flex flex-col md:flex-row gap-2 items-center'><div className='bg-[orange] h-2 w-4'></div>Exceeds 24h threshold of {location.h24_threshold}  <div className='bg-[red] h-2 w-4'></div> Exceeds 24h NOAA Atlas 14</div></div>} >
           <PillTabs mini={window.outerWidth < 600} header={window.outerWidth < 600 && <div className='flex gap-2 items-center '><i className="text-lg text-[--main-1] fa-solid droplet"></i>Rainfall {location.name}</div>} className={`pb-8 md:border-0 md:shadow-[unset] ${user.tier == 4 && 'hidden'}`}>
            <div className='tab'>24 Hour
              
            <RainfallChart location={location} period={"daily"} max={3} />
            </div>
            <div className='tab'>1 Hour 
            <RainfallChart location={location} period={"hourly"} max={2} />
            </div>
            <div className='tab'>RapidRain
           <Upgrade tier={3}><RainfallChart location={location} period={"rapidrain"} max={12} /></Upgrade>
            </div>
            <div className='tab'>NOAA Atlas 14
            <Upgrade tier={2}><ResponsiveTable  location={location} /></Upgrade>
            </div>
            </PillTabs>
        </Card>
  
  
      
  
      <span id="forecast" className=''></span>
      <Card className={`${user.tier == 4 && 'hidden'}`} header={window.outerWidth >= 600 && <div className='flex gap-2 items-center '><i className="text-lg text-[--main-1] fa-solid fa-circle-info"></i>3 Day Forecast</div>} >
           <PillTabs mini={window.outerWidth < 600} 
           header={window.outerWidth < 600 && <div className='flex gap-2 items-center '><i className="text-lg text-[--main-1] fa-solid fa-circle-info"></i>3 Day Forecast</div>} className={`pb-8 md:border-0 md:shadow-[unset] ${user.tier == 4 && 'hidden'}`}>
            <div className='tab'>National
              
              <Forecast className={"items-end"}/>
           </div>
           <div className='tab'>{location.name ? location.name : ''}
            <Upgrade tier={3}>
              {<Forecast location={location} className={"items-end"}/>}
            </Upgrade>
           </div>
           
            </PillTabs> 
        </Card>
{/*
        <Card header={window.outerWidth >= 600 && <div className='flex gap-2 items-center '><i className="text-lg text-[--main-1] fa-solid fa-circle-info"></i>Contact Assignment</div>} >
          <ContactAssignment contact={contact} contactList={contactList} assignedContact={assignedContact} deleteLocationsFromUser={deleteLocationsFromUser} addLocationsToUser={addLocationsToUser}
          setAssignedContact={setAssignedContact} unassignedList={unassignedList}
          />
        </Card>
        */}
        
     {/*</span>*/}
     <a name="alerts"></a>
      
    </Dashboard>
   
  )
}
