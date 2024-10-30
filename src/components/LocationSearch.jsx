import React, { useContext, useEffect, useReducer, useState } from 'react';
import styled from 'styled-components';
import { LocationListContext } from './LocationListContext';
import Button from './Button';


// Styled components
const Container = styled.div`
  width: 100%;
  --background: linear-gradient( var(--dark), var(--primary-color));
  background: transparent;
  padding: 20px;
  border-radius: 10px;
  color: var(--text-color);
  color:black;
  font-family: Poppins, sans-serif;
  display:flex;
  flex:1;
  height:100%;
  flex-direction:column;
  overflow:scroll;
  
`;

const SearchBarContainer = styled.div`
  position: relative;
  width: 100%;
  display:flex;
  flex-direction:column;
`;

const SearchBar = styled.input`
  width: 100%;
  padding: 10px;
  padding-right: 40px; /* Space for the star icon */
  margin-bottom: 10px;
  background-color: var(--dark);
  color: var(--text-color);
  border: 1px solid var(--dark);
  border-radius: 5px;
  outline: none;
  font-family: inherit;
  display:flex;
  flex-direction:row;
  justify-content:center;
  align-items:center;
`;

const StarIcon = styled.span`
  --position: relative;
  right: 10px;
  --top: 50%;
  --transform: translateY(-50%);
  --border:1px solid black;
  width:100%;
  display:flex;
  flex:1;
  justify-content:center;
  align-items:center;
  font-size: 1.2em;
  color: ${props => (props.active ? 'orange' : 'var(--dark)')};
  --color: var(--dark);
  cursor: pointer;
  padding-right:1rem;
  margin-bottom:1rem;
  gap:.5rem;
  outline:1px 1px 1px 1px black;
  
`;

const Category = styled.div`
  --margin: 10px 0;
  display:flex;
  --gap:1rem;
  flex-direction:column;
`;

const CategoryTitle = styled.h3`
  font-size: 1.2em;
  color: var(--secondary-color);
`;

const CityItem = styled.div`
  --padding: 5px;
  
  --margin: 2px 0;
  
  --background-color: ${props => props.isfavorite ? 'whitesmoke' : 'var(--text-color)'};
  color: var(--dark);
  display: flex;
  justify-content: space-between;
  align-items:center;
  --border:1px solid black;
  border-bottom:1px solid black;
  border-radius: 0px;
  cursor: pointer;
  &:hover {
    --background-color: var(--hover-color);
  }
`;

const FavoriteButton = styled.button`
  background: transparent;
  color: ${props => (props.isfavorite ? 'red' : 'var(--icon-hover-color)')};
  border: none;
  cursor: pointer;
  font-size: 1.2em;
  &:hover {
    color: var(--icon-hover-color);
  }
`;



const LocationControl = ({totalClicked, enableMultiSelect, broadcastSelectClick, broadcastLocationClicked, disableAddButton, searchPrompt, addPrompt, locationList, broadcastFilteredList, broadcastAddClicked}) => {

  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [selectedCity, setSelectedCity] = useState();
  const [showFavorites, setShowFavorites] = useState(false);
  const [internalTotal, setInternalTotal] = useState(totalClicked);
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const [isChecked,setIsChecked] = useState(false);

  

   
  

    
  let cities = locationList ? locationList : [];

  broadcastLocationClicked ? broadcastLocationClicked : ()=>{console.log(`broadcastLocationClicked callback was not set: info`)};

   
  //_setInternalSelectClick = broadcastSelectClick ? broadcastSelectClick : _setInternalSelectClick;
  
  
  


  useEffect(()=>{

    console.log(`Running show Favorites code because the user add/deleted favorite from list ${showFavorites}`)
    if(showFavorites && filteredCities.length > 0){
      broadcastFilteredList && broadcastFilteredList(filteredCities);
      broadcastLocationClicked(filteredCities[0]);
      
    } else {
      broadcastFilteredList && broadcastFilteredList([])
    }



  },[showFavorites,favorites]);

  useEffect(()=>{
    console.log(`The wrong thing was called correctly ${locationList}`)

    console.log(`Use Effect isChecked and cites.length is ${cities.length} and checked is ${isChecked}`)

    cities.map(cc => {
      cc.highlight = isChecked ? true : false;
      console.log(`Setting field to ${JSON.stringify(cc)}`)
    });

    if(broadcastSelectClick) {
      
        broadcastSelectClick(cities)
    } 
    
    forceUpdate();
    
     
    

      
  },[isChecked])


  const handleCityClick = (clickedCity,e)=>{

    console.log(`Clicked City is ${clickedCity}`)

    //var foundCity = cities.find((city) => city.name == clickedCity);

    var foundCity = clickedCity;

    console.log(`Found City is ${JSON.stringify(foundCity)}`)

    if(!enableMultiSelect){
      cities.map(cc => cc.highlight = false)
    }


    foundCity.highlight = !foundCity.highlight;

    broadcastLocationClicked && broadcastLocationClicked(foundCity,e);

    
     

    forceUpdate();

    

   
}

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const toggleFavorite = (event,city) => {
    event.preventDefault();

    setFavorites((prevFavorites) =>
      prevFavorites.includes(city)
        ? prevFavorites.filter(fav => fav !== city)
        : [...prevFavorites, city]
    );
  };

  const toggleShowFavorites = () => {
    setSearchTerm("")
   
    setShowFavorites(!showFavorites)
    console.log(`ToggleShowFavorites cities is now and show favorites is ${showFavorites}` )
   

    
  };

  const filteredCities = cities.sort().filter(city => {
    const matchesSearch = city.name.toLowerCase().includes(searchTerm.toLowerCase());
    const isFavorite = favorites.includes(city.name);
    return matchesSearch && (!showFavorites || isFavorite);
  });
  // Group cities by category
  const groupedCities = filteredCities.reduce((acc, city) => {
    acc[city.category] = [...(acc[city.category] || []), city];
    return acc;
  }, {});

  
  function _internalSelectClick(e){


      setIsChecked(!isChecked);

      

  
  }
  
  const numberHighlighted = cities.filter(meC => meC.highlight).length;

  return (
    <Container>
      
      <SearchBarContainer>
        <SearchBar
          type="text"
          placeholder={searchPrompt ? searchPrompt : "Search locations..."}
          value={searchTerm}
          onChange={handleSearch}
        />
        
        {broadcastFilteredList && <StarIcon onClick={toggleShowFavorites} active={showFavorites}>
         <div className='text-[--primary-color] text-sm '>{showFavorites? "Showing Favorite Locations Only" : "Show only Your Favorite Locations?"}</div>
         {showFavorites ? <span className='text-red-800'><i class="fas fa-map-marker-alt"></i></span>
            : <span className='border-2 border-[--primary-color] rounded-[50%] h-4 w-4'></span>
         }
        </StarIcon>}
        {  showFavorites && console.log(`Favorites can see showFavorites is ${showFavorites}`)}
        
      </SearchBarContainer>
    <div className='overflow-scroll w-full mb-4 flex flex-1 flex-col '>
    
      {Object.keys(groupedCities).map(category => {
        return (
        <Category key={category}>
          {/*<CategoryTitle>{category != "undefined" ? category : ''}</CategoryTitle>*/}
          <div className='flex flex-1 items-end justify-end'><span className='text-[--text-color]'>Select All <input id="selectAll" type="checkbox" className='' onClick={_internalSelectClick } name="select-all"  checked={isChecked} /></span></div>
          {groupedCities[category].map((city,i) => (
            <CityItem className={`${city.highlight ? "bg-[--hover-color]" : "bg-[--text-color]" } bg-[--text-color]  p-3`} key={city.name + i +  new Date().getTime()} isfavorite={favorites.includes(city.name)} onClick={(e)=>{handleCityClick(city,e)}}>
              {city.name}<span className='my-4'></span>
              {broadcastFilteredList && <FavoriteButton
                onClick={(e) => toggleFavorite(e,city.name)}
                isfavorite={favorites.includes(city.name)}
              >
                {favorites.includes(city.name) ? <i class="fas fa-map-marker-alt"></i> : <i class="fa-regular fa-circle"></i>}
              </FavoriteButton>}
            </CityItem>
          ))}
        </Category>
        
      )})}
      </div>
      {!disableAddButton && <Button onClick={(e)=>{ broadcastAddClicked? broadcastAddClicked(cities.filter(cc => cc.highlight)) : console.log(`No Add Action Specified`)}} className='md:max-4 mb-2 px-4' secondary> { numberHighlighted? `(${numberHighlighted}) Selected ` : ''} {addPrompt ? addPrompt : "Add Location"}</Button>}
    </Container>
  );
};

export default LocationControl;
