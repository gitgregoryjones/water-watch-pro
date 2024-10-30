// ItemControl.js
// Component for displaying a searchable, selectable collection of items.
// Created by Greg Jones. Licensed under an open-source license for community use.

import React, { useEffect, useReducer, useState } from 'react';
import styled from 'styled-components';
import './ItemControl.css';

// Styled components for the container layout
const Container = styled.div`
  
  --background: var(--primary-color);
  padding-top: 1rem;
  padding-left:.25rem;
  padding-right:.25rem;
  border-radius: 10px;
  font-family: Poppins, sans-serif;
  display: flex;
  --flex:1;
  flex-direction: column;
  overflow: auto;
  
`;

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
  onItemClicked,
  onAddClicked,
  showAddButton = true,
  searchPlaceholder = "Search items...",
  addButtonLabel = "Add Item",
  onSelectAllClicked,
  showSelectButton = false,
  className,
  onFavoriteClicked,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  const handleItemClick = (item) => {
    if (!enableMultiSelect) collectionList.forEach(i => i.highlight = false);
    item.highlight = !item.highlight;
    onItemClicked && onItemClicked(item);
    forceUpdate();
  };

  const handleSearch = (event) => setSearchTerm(event.target.value);

  const toggleFavorite = (event, item) => {
    event.preventDefault();
    setFavorites(favs =>
      favs.includes(item) ? favs.filter(fav => fav !== item) : [...favs, item]
    );
  };

  const toggleShowFavorites = () => setShowFavorites(!showFavorites);

  // Filter items based on search and favorites
  const filteredItems = collectionList
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
    console.log(`The wrong thing was called correctly ${collectionList}`)

    console.log(`Use Effect isChecked and cites.length is ${collectionList.length} and checked is ${isChecked}`)

    collectionList.map(cc => {
      cc.highlight = isChecked ? true : false;
      console.log(`Setting field to ${JSON.stringify(cc)}`)
    });

    if(onSelectAllClicked) {
      
        onSelectAllClicked(cities)
    } 
    
    forceUpdate();
    
     
    

      
  },[isChecked])

  useEffect(()=>{

    onFavoriteClicked && onFavoriteClicked(favorites);

  },[favorites])

  const numberHighlighted = collectionList.filter(meC => meC.highlight).length;

  return (
    <Container className={`flex flex-1 h-full w-full shadow-2xl ${className}`}>
      <SearchBarContainer>
        <SearchBar
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={handleSearch}
        />
        <FilterIcon onClick={toggleShowFavorites} active={showFavorites}>
          {showFavorites ? `Showing (${favorites.length}) Favorites` : "Show Favorites?"}
        </FilterIcon>
      </SearchBarContainer>
      <div className='overflow-scroll w-full mb-4  max-h-[13rem]'>
        {Object.keys(groupedItems).map(category => (
          <Category key={category}>
            {/* <CategoryTitle>{category}</CategoryTitle>*/}
            { showSelectButton &&
            <div className='flex items-end justify-end'>
              {showSelectButton && <span>Select All <input type="checkbox" onClick={handleSelectAll} checked={isChecked} /></span>}
            </div>
            }
            {groupedItems[category].map((item, i) => (
              <Item className={`shadow ${item.highlight ? 'bg-[--highlight-color]' : 'bg-[--background-card]'} text-sm justify-between items-center py-2]`}
                key={item.name + i}
                onClick={() => handleItemClick(item)}
              >
                <div className='px-4'>{item.name}</div>
                <FavoriteButton onClick={(e) => toggleFavorite(e, item.name)}>
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
