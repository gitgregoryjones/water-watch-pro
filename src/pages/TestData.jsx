export function getLocationsFromDB(){ return (
    [
        { id:10, name: 'Atlanta,GA', category: 'South', location: { lat: 33.7490, lng: -84.3880 } },
        { id:20,name: 'Savannah', category: 'South', location: { lat: 32.0809, lng: -81.0912 } },
        { id:1, name: 'Augusta', category: 'South', location: { lat: 33.4735, lng: -82.0105 } },
        { id:12, name: 'Columbus', category: 'South', location: { lat: 32.4609, lng: -84.9877 } },
        { id:2,name: 'Macon', category: 'South', location: { lat: 32.8407, lng: -83.6324 } },
        { id:14,name: 'Athens', category: 'South', location: { lat: 33.9519, lng: -83.3576 } },
        { id:6,name: 'Sandy Springs', category: 'South', location: { lat: 33.9304, lng: -84.3733 } },
        { id:3,name: 'Roswell', category: 'South', location: { lat: 34.0232, lng: -84.3616 } },
        { id:16,name: 'Johns Creek', category: 'South', location: { lat: 34.0289, lng: -84.1986 } },
        { id:4, name: 'Warner Robins', category: 'South', location: { lat: 32.6130, lng: -83.6241 } },
        { id:13,name: 'Albany', category: 'South', location: { lat: 31.5785, lng: -84.1557 } },
        { id:7,name: 'Alpharetta', category: 'South', location: { lat: 34.0754, lng: -84.2941 } },
        { id:8,name: 'Marietta', category: 'South', location: { lat: 33.9526, lng: -84.5499 } },
        { id:11,name: 'Valdosta', category: 'South', location: { lat: 30.8327, lng: -83.2785 } },
        { id:15,name: 'Smyrna', category: 'South', location: { lat: 33.8830, lng: -84.5144 } },
        { id:9,name: 'Dunwoody', category: 'South', location: { lat: 33.9462, lng: -84.3346 } },
      ]);
}




export function getUserFromDB() {

  return {id:1, locations:getLocationsFromDB(), name:"James Dodge", tier:3, firstName: "Steve", lastName: "Urkel", role: "Owner", companyId : -1,loggedIn:false, jwt:"x91jsk1838"}

}

export function getContactsFromDB(){ return ([
  {
    "id": 1,
    "name": "John Doe",
    "firstName": "John",
    "lastName": "Doe",
    tier:2,
    "role": "Owner",
    "data1": "john.doe@example.com",
    "data2": "(555) 123-4567",
    "locations": [
      { "id": 1, "name": "Augusta", "category": "South", "location": { "lat": 33.4735, "lng": -82.0105 } },
      { "id": 2, "name": "Macon", "category": "South", "location": { "lat": 32.8407, "lng": -83.6324 } },
      { "id": 3, "name": "Roswell", "category": "South", "location": { "lat": 34.0232, "lng": -84.3616 } }
    ]
  },
  {
    "id": 2,
    "name": "Jane Smith",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "Client",
    tier:2,
    "data1": "jane.smith@example.com",
    "data2": "(555) 234-5678",
    "locations": [
      { "id": 4, "name": "Warner Robins", "category": "South", "location": { "lat": 32.6130, "lng": -83.6241 } },
      { "id": 5, "name": "Savannah", "category": "South", "location": { "lat": 32.0809, "lng": -81.0912 } },
      { "id": 6, "name": "Sandy Springs", "category": "South", "location": { "lat": 33.9304, "lng": -84.3733 } }
    ]
  },
  {
    "id": 3,
    "name": "Michael Johnson",
    "firstName": "Michael",
    "lastName": "Johnson",
    "role": "User",
    tier:1,
    "data1": "michael.johnson@example.com",
    "data2": "(555) 345-6789",
    "locations": [
      { "id": 7, "name": "Alpharetta", "category": "South", "location": { "lat": 34.0754, "lng": -84.2941 } },
      { "id": 8, "name": "Marietta", "category": "South", "location": { "lat": 33.9526, "lng": -84.5499 } },
      { "id": 9, "name": "Dunwoody", "category": "South", "location": { "lat": 33.9462, "lng": -84.3346 } }
    ]
  },
  {
    "id": 4,
    "name": "Emily Davis",
    "firstName": "Emily",
    "lastName": "Davis",
    "role": "Client",
    tier:1,
    "data1": "emily.davis@example.com",
    "data2": "(555) 456-7890",
    "locations": [
      { "id": 10, "name": "Atlanta,GA", "category": "South", "location": { "lat": 33.7490, "lng": -84.3880 } },
      { "id": 11, "name": "Valdosta", "category": "South", "location": { "lat": 30.8327, "lng": -83.2785 } },
      { "id": 12, "name": "Columbus", "category": "South", "location": { "lat": 32.4609, "lng": -84.9877 } }
    ]
  },
  {
    "id": 5,
    "name": "Christopher Brown",
    "firstName": "Christopher",
    "lastName": "Brown",
    "role": "Client",
    tier:1,
    "data1": "chris.brown@example.com",
    "data2": "(555) 567-8901",
    "locations": [
      { "id": 13, "name": "Albany", "category": "South", "location": { "lat": 31.5785, "lng": -84.1557 } },
      { "id": 14, "name": "Athens", "category": "South", "location": { "lat": 33.9519, "lng": -83.3576 } },
      { "id": 15, "name": "Smyrna", "category": "South", "location": { "lat": 33.8830, "lng": -84.5144 } }
    ]
  },
  {
    "id": 6,
    "name": "Amanda Wilson",
    "firstName": "Amanda",
    "lastName": "Wilson",
    "role": "User",
    tier:2,
    "data1": "amanda.wilson@example.com",
    "data2": "(555) 678-9012",
    "locations": [
      { "id": 16, "name": "Johns Creek", "category": "South", "location": { "lat": 34.0289, "lng": -84.1986 } },
      { "id": 17, "name": "Alpharetta", "category": "South", "location": { "lat": 34.0754, "lng": -84.2941 } },
      { "id": 18, "name": "Macon", "category": "South", "location": { "lat": 32.8407, "lng": -83.6324 } }
    ]
  },
  {
    "id": 7,
    "name": "Joshua Martinez",
    "firstName": "Joshua",
    "lastName": "Martinez",
    "role": "Trial User",
    tier:0,
    "data1": "joshua.martinez@example.com",
    "data2": "(555) 789-0123",
    "locations": [
      { "id": 19, "name": "Warner Robins", "category": "South", "location": { "lat": 32.6130, "lng": -83.6241 } },
      { "id": 20, "name": "Savannah", "category": "South", "location": { "lat": 32.0809, "lng": -81.0912 } },
      { "id": 21, "name": "Smyrna", "category": "South", "location": { "lat": 33.8830, "lng": -84.5144 } }
    ]
  },
  {
    "id": 8,
    "name": "Sarah Anderson",
    "firstName": "Sarah",
    "lastName": "Anderson",
    "role": "Client",
    tier:2,
    "data1": "sarah.anderson@example.com",
    "data2": "(555) 890-1234",
    "locations": [
      { "id": 22, "name": "Dunwoody", "category": "South", "location": { "lat": 33.9462, "lng": -84.3346 } },
      { "id": 23, "name": "Augusta", "category": "South", "location": { "lat": 33.4735, "lng": -82.0105 } },
      { "id": 24, "name": "Columbus", "category": "South", "location": { "lat": 32.4609, "lng": -84.9877 } }
    ]
  },
  {
    "id": 9,
    "name": "David Thomas",
    "firstName": "David",
    "lastName": "Thomas",
    "role": "Trial",
    tier:0,
    "data1": "david.thomas@example.com",
    "data2": "(555) 901-2345",
    "locations": [
      { "id": 25, "name": "Athens", "category": "South", "location": { "lat": 33.9519, "lng": -83.3576 } },
      { "id": 26, "name": "Valdosta", "category": "South", "location": { "lat": 30.8327, "lng": -83.2785 } },
      { "id": 27, "name": "Sandy Springs", "category": "South", "location": { "lat": 33.9304, "lng": -84.3733 } }
    ]
  },
  {
    "id": 10,
    "name": "Olivia Jackson",
    "firstName": "Olivia",
    "lastName": "Jackson",
    "role": "Client",
    tier:1,
    "data1": "olivia.jackson@example.com",
    "data2": "(555) 123-6789",
    "locations": [
      { "id": 28, "name": "Alpharetta", "category": "South", "location": { "lat": 34.0754, "lng": -84.2941 } },
      { "id": 29, "name": "Atlanta,GA", "category": "South", "location": { "lat": 33.7490, "lng": -84.3880 } },
      { "id": 30, "name": "Marietta", "category": "South", "location": { "lat": 33.9526, "lng": -84.5499 } }
    ]
  }
]
)}
  