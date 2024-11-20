import { AdvancedMarker, APIProvider, Map } from '@vis.gl/react-google-maps'
import React from 'react'
import ItemControl from './ItemControl'

export default function MapControl() {
  return (
    <div className='content flex gap-4 md:flex-row flex-col'>
          
         
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_API_KEY}>
    <div className='md:shadow-2xl h-[20rem] md:rounded-2xl md:border md:px-2 justify-center items-center flex flex-[3_3_0%]'>
      <Map
       
        className='md:shadow-2xl min-h-[20rem] md:h-[50%]  h-full flex-[3_3_0%] md:border'
        
        
        
        mapId={'mainMap'}
       
        gestureHandling={'greedy'}
        disableDefaultUI={false}
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
    <ItemControl className={`min-h-[20rem]`}
    collectionList={locationList}
    showAddButton={false}
    onItemClicked={setMapCenter}
    showSelectButton={false}
    enableMultiSelect={false}
    
    searchPlaceholder='Search Locations...'
    addButtonLabel={<span><i className="fa-solid fa-angles-left"></i> Move Locations &nbsp;</span>}


  />
   
    </div>

  )
}
