// ItemControl.js
// Component for displaying a searchable, selectable collection of items.
// Created by Greg Jones. Licensed under an open-source license for community use.

import React, { useEffect, useReducer, useState } from 'react';
import styled from 'styled-components';
import './ItemControl.css';

// Styled components for the container layout
export function Container({children, className}){

  return (<div className={`item-control bg-[--item-control-bg] flex flex-col  max-h-[20rem] overflow-auto min-h-[20rem] ${className}`}>{children}</div>)
}

const Button = styled.button`

    background-color: ${props => (props.secondary ? 'var(--second-accent-color)' : 'var(--dark)')};
    display:flex;
    flex:1;
   text-align:center;
    justify-content:center;
    align-items:center;
    max-height:3rem;
    color: var(--primary-color);
`

const SearchBarContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const SearchBar = styled.input`
  width: 100%;
  padding: 10px;
  background-color: white;
  color: black;
  border: 1px solid silver;
  border-radius: 5px;
  font-family: inherit;
  margin-bottom: 10px;
  font-size:small;
  &::placeholder {
    ---color: black
  }
 
  @media (max-width:550px) {
    width:85%
  }
  
`;

const FilterIcon = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  --font-size: 1.2em;
  cursor: pointer;
  padding: 0.5rem;
  color: ${props => (props.active ? 'var(--text-color)' : 'var(--text-color)')};
`;

const Category = styled.div`
  margin: 10px 0;
  display: flex;
  flex-direction: column;
  
  
`;

const CategoryTitle = styled.h3`
  --font-size: 1.2em;
  color: var(--secondary-color);
`;

const Item = styled.div`

  color: var(--dark);
  color:black;
  display: flex;
  --box-shadow: 0 3px 10px rgb(0 0 0 / 1);
  --border-bottom: 1px solid var(--highlight-color);
  cursor: pointer;
  opacity:1;
  &:hover {
    opacity:.9;
    background-color:var(--highlight-color);
  };
  
`;

const FavoriteButton = styled.button`
  background: transparent;
  color: var(--favorite-color)
  border: none;
  cursor: pointer;
  --font-size: 1.2em;
  &:hover {
    color: var(--icon-hover-color);
  }
`;

/**
 * ItemControl - Generic component to manage a list of items.
 * @param {Object} props - Properties passed to component
 * @param {Array} props.collectionList - Array of items to display.
 * @param {Function} props.onItemClicked - Callback when an item is clicked.
 * @param {Function} props.onAddClicked - Callback for when the add button is clicked.
 * @param {Boolean} props.enableMultiSelect - Enable or disable multi-selection.
 * @param {Boolean} props.showAddButton - Show or hide the add button.
 * @param {String} props.searchPlaceholder - Placeholder text for the search bar.
 * @param {String} props.addButtonLabel - Label for the add button.
 * @param {String} props.showSelectButton - Enable/disable the display of the select all checkbox
 * @param {String} props.className - add classes to the main container
 */
const ItemControl = ({
  collectionList = [],
  enableMultiSelect = false,
  showFavoriteControls = true,
  onItemClicked,
  onAddClicked,
  showAddButton = true,
  searchPlaceholder = "Search items...",
  addButtonLabel = "Add Item",
  onSelectAllClicked,
  showSelectButton = false,
  className,
  onFavoriteClicked,
  header,
  showSearchBar = true,
  onRowRendered,
  currentRow
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  const [cList,setCList] = useState(collectionList);

  const handleItemClick = (clickedItem) => {
    const updatedList = cList.map((item) => {
      if (item.id === clickedItem.id) {
        return {
          ...item,
          highlight: enableMultiSelect ? !item.highlight : true, // Toggle highlight for multi-select or set to true for single-select
        };
      }
      return enableMultiSelect ? item : { ...item, highlight: false }; // Keep other items' state if multi-select, otherwise reset
    });
  
    setCList(updatedList);
    onItemClicked && onItemClicked(clickedItem);
  };

  useEffect(()=>{

    setCList(collectionList)

  },[collectionList])
  
  
  //setCList(copy);

  const handleSearch = (event) => setSearchTerm(event.target.value);

  const toggleFavorite = (event, item) => {
    event.preventDefault();
    setFavorites(favs =>
      favs.includes(item) ? favs.filter(fav => fav !== item) : [...favs, item]
    );
  };

  const toggleShowFavorites = () => setShowFavorites(!showFavorites);


  //console.log(`CollectionList is ${cList.length} and placeholder is ${searchPlaceholder}`)

  // Filter items based on search and favorites
  const filteredItems = [...cList]
    .sort()
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const isFavorite = favorites.includes(item.name);
      return matchesSearch && (!showFavorites || isFavorite);
    });

  // Group items by category
  const groupedItems = filteredItems.reduce((acc, item) => {
    acc[item.category] = [...(acc[item.category] || []), item];
    return acc;
  }, {});

  const handleSelectAll = () => setIsChecked(!isChecked);

  useEffect(()=>{
    //console.log(`The wrong thing was called correctly ${cList}`)

    //console.log(`Use Effect isChecked and cites.length is ${cList.length} and checked is ${isChecked}`)

    const copy = cList.map(cc => ({
      ...cc, 
      highlight: isChecked ? true : false 
    }));
    
    setCList(copy);
    
    
    

    if(onSelectAllClicked) {
      
        onSelectAllClicked(cities)
    } 
    
    
    
     
    

      
  },[isChecked])

  useEffect(()=>{

    onFavoriteClicked && onFavoriteClicked(favorites);

  },[favorites])

  const numberHighlighted = cList.filter(meC => meC.highlight).length;

  return (
    <Container className={`flex flex-1 h-[unset] w-full md:shadow-2xl h-[10rem] md:max-h-[40rem] md:h-full overflow-hidden  ${className}`}>
      {header}
      {showSearchBar && <SearchBarContainer>
        <SearchBar
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={handleSearch}
        />
        { showFavoriteControls &&
        <FilterIcon onClick={toggleShowFavorites} active={showFavorites}>
          {showFavorites ? `Showing (${favorites.length}) Favorites` : "Show Favorites Only?"}
        </FilterIcon>
        }
      </SearchBarContainer>}
      <div className='overflow-auto max-h-[20rem] md:max-h-full w-full mb-2'>
        {Object.keys(groupedItems).map(category => (
          <Category key={category}>
            {/* <CategoryTitle>{category}</CategoryTitle>*/}
            { showSelectButton &&
            <div className='flex items-end justify-end'>
              {showSelectButton && <span>Select All <input type="checkbox" onClick={handleSelectAll} checked={isChecked} /></span>}
            </div>
            }
            {groupedItems[category].map((item, i) => (
              onRowRendered ? onRowRendered(item,<Item className={` shadow ${item.highlight ? 'bg-[--highlight-color]' : 'bg-[--background-card]'} text-sm justify-between items-center py-2 md:py-4`}
                key={item.name + i}
                onClick={() => handleItemClick(item)}
              >
                <div className='item px-4 overflow-hidden '>{item.name}</div>
                <FavoriteButton style={{visibility: !showFavoriteControls && "hidden"}} onClick={(e) => toggleFavorite(e, item.name)}>
                  {favorites.includes(item.name) ? <i className="fas fa-heart text-[--favorite-color]"></i> : <i className="far fa-heart"></i>}
                </FavoriteButton>
              </Item>, i) 
              : <Item className={`shadow ${item.highlight ? 'bg-[--highlight-color]' : 'bg-[--background-card]'} text-md smd:text-sm justify-between items-center py-2 md:py-4`}
              key={item.name + i}
              onClick={() => handleItemClick(item)}
            >
              <div className='item px-4 overflow-hidden '>{item.name}</div>
              <FavoriteButton style={{visibility: !showFavoriteControls && "hidden"}} onClick={(e) => toggleFavorite(e, item.name)}>
                {favorites.includes(item.name) ? <i className="fas fa-heart text-[--favorite-color]"></i> : <i className="far fa-heart"></i>}
              </FavoriteButton>
            </Item>
            ))}
          </Category>
        ))}
      </div>
      {showAddButton && (
        <Button onClick={() => onAddClicked && onAddClicked(collectionList.filter(i => i.highlight))}>
          {addButtonLabel} {enableMultiSelect && `(${numberHighlighted})`}
        </Button>
      )}
    </Container>
  );
};

export default ItemControl;
