import React from 'react'
import Card from './Card'
import CardContent from './CardContent'
import Location from './Location'
import PillSwap from './PillSwap'
import Pill from './Pill'

export default function Dashboard() {
  return (
    
   

    <div className="g">
        
        <Card className="big-card">
            <Card className="cardBackground">
            <h1>Map</h1>
            
            <CardContent>
               <div className="header">Map Goes Here</div>
               
               
               
            </CardContent>
        </Card>
        <Card pclassName="cardBackground">
            <h1>Your Locations</h1>
            
            <CardContent>
               
               <div className="location-list">
                  <Location>
                       <div className="name">Atlanta</div>
                       <div>Longitude</div>
                       <div>Latitude</div>
                       <div className="location-controls">
                           <div><i className="fas fa-edit"></i></div>
                           <div><i className="fa-solid fa-trash"></i></div>
                       </div>
                   </Location>
                  <Location>
                       <div className="name">Atlanta</div>
                       <div>Longitude</div>
                       <div>Latitude</div>
                       <div className="location-controls">
                           <div><i className="fas fa-edit"></i></div>
                           <div><i className="fa-solid fa-trash"></i></div>
                       </div>
                   </Location>
                   <Location>
                       <div className="name">Atlanta</div>
                       <div>Longitude</div>
                       <div>Latitude</div>
                       <div className="location-controls">
                           <div><i className="fas fa-edit"></i></div>
                           <div><i className="fa-solid fa-trash"></i></div>
                       </div>
                   </Location>
                   <Location>
                       <div className="name">Atlanta</div>
                       <div>Longitude</div>
                       <div>Latitude</div>
                       <div className="location-controls">
                           <div><i className="fas fa-edit"></i></div>
                           <div><i className="fa-solid fa-trash"></i></div>
                       </div>
                   </Location>
                   <Location>
                       <div className="name">Atlanta</div>
                       <div>Longitude</div>
                       <div>Latitude</div>
                       <div className="location-controls">
                           <div><i className="fas fa-edit"></i></div>
                           <div><i className="fa-solid fa-trash"></i></div>
                       </div>
                   </Location>
                   <Location>
                       <div className="name">Atlanta</div>
                       <div>Longitude</div>
                       <div>Latitude</div>
                       <div className="location-controls">
                           <div><i className="fas fa-edit"></i></div>
                           <div><i className="fa-solid fa-trash"></i></div>
                       </div>
                   </Location>
                   <Location>
                       <div className="name">Atlanta</div>
                       <div>Longitude</div>
                       <div>Latitude</div>
                       <div className="location-controls">
                           <div><i className="fas fa-edit"></i></div>
                           <div><i className="fa-solid fa-trash"></i></div>
                       </div>
                   </Location>
                  
                 </div>
                   
                  
            </CardContent>
        </Card>
        </Card>
       
        <Card className="cardBackground">
            <h1>Rainfall</h1>
            <PillSwap>
            <Pill>Daily</Pill>
            <Pill>Hourly</Pill>
            <Pill className="rapidrain">RAPIDRAIN</Pill>
            </PillSwap>
            <CardContent>
               <div className="header">hello</div>
               
               <div className="footer">
                   <div className="rainfall-controls">
                       <div>calendar</div>
                       <div>Reports</div>
                   </div>
                   
               </div>
               
            </CardContent>
        </Card>
        <Card className="cardBackground">
            <h1>Map</h1>
            
            <CardContent>
               <div className="header">Map Goes Here</div>
               
               
               
            </CardContent>
        </Card>
        <Card className="cardBackground">
            <h1>Locations</h1>
            
            <CardContent>
               <div className="header">Instructions</div>
               <div className="location-list">
                  <Location>
                       <div className="name">Atlanta</div>
                       <div>Longitude</div>
                       <div>Latitude</div>
                       <div className="location-controls">
                           <div><i className="fas fa-edit"></i></div>
                           <div><i className="fa-solid fa-trash"></i></div>
                       </div>
                   </Location>
                  <Location>
                       <div className="name">Atlanta</div>
                       <div>Longitude</div>
                       <div>Latitude</div>
                       <div className="location-controls">
                           <div><i className="fas fa-edit"></i></div>
                           <div><i className="fa-solid fa-trash"></i></div>
                       </div>
                   </Location>
                   <Location>
                       <div className="name">Atlanta</div>
                       <div>Longitude</div>
                       <div>Latitude</div>
                       <div className="location-controls">
                           <div><i className="fas fa-edit"></i></div>
                           <div><i className="fa-solid fa-trash"></i></div>
                       </div>
                   </Location>
                   <Location>
                       <div className="name">Atlanta</div>
                       <div>Longitude</div>
                       <div>Latitude</div>
                       <div className="location-controls">
                           <div><i className="fas fa-edit"></i></div>
                           <div><i className="fa-solid fa-trash"></i></div>
                       </div>
                   </Location>
                   <Location>
                       <div className="name">Atlanta</div>
                       <div>Longitude</div>
                       <div>Latitude</div>
                       <div className="location-controls">
                           <div><i className="fas fa-edit"></i></div>
                           <div><i className="fa-solid fa-trash"></i></div>
                       </div>
                   </Location>
                   <Location>
                       <div className="name">Atlanta</div>
                       <div>Longitude</div>
                       <div>Latitude</div>
                       <div className="location-controls">
                           <div><i className="fas fa-edit"></i></div>
                           <div><i className="fa-solid fa-trash"></i></div>
                       </div>
                   </Location>
                   <Location>
                       <div className="name">Atlanta</div>
                       <div>Longitude</div>
                       <div>Latitude</div>
                       <div className="location-controls">
                           <div><i className="fas fa-edit"></i></div>
                           <div><i className="fa-solid fa-trash"></i></div>
                       </div>
                   </Location>
                  
                 </div>
                   
                  
            </CardContent>
        </Card>
        <Card className="cardBackground">
            <h1>Forecast</h1>
            <PillSwap>
            <Pill className="active">National Forecast</Pill>
            <Pill>Atlanta, GA</Pill>
            </PillSwap>
            <CardContent>
               <div className="header">hello</div>
               <div className="content">
                   <Card className="cardBackground">
                       <CardContent className="forecastCards">
                           <div className="header">Mon</div>
                           <div className="content">0.25</div>
                       </CardContent>
                       
                   </Card>
                   <Card className="cardBackground">
                       <CardContent className="forecastCards">
                           <div className="header">Tues</div>
                           <div className="content">0.5</div>
                       </CardContent>
                       
                   </Card>
                   <Card className="cardBackground">
                       <CardContent className="forecastCards">
                           <div className="header">Wed</div>
                           <div className="content">0.1</div>
                       </CardContent>
                       
                   </Card>
                   
               </div>
               
               
            </CardContent>
        </Card>
        
    </div>

  )
}
