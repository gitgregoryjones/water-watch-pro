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
export function getContactsFromDB(){ return ([
    {
      "id": 1,
      "name": "John Doe",
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
      "data1": "olivia.jackson@example.com",
      "data2": "(555) 123-6789",
      "locations": [
        { "id": 28, "name": "Alpharetta", "category": "South", "location": { "lat": 34.0754, "lng": -84.2941 } },
        { "id": 29, "name": "Atlanta,GA", "category": "South", "location": { "lat": 33.7490, "lng": -84.3880 } },
        { "id": 30, "name": "Marietta", "category": "South", "location": { "lat": 33.9526, "lng": -84.5499 } }
      ]
    },
    {
      "id": 11,
      "name": "Daniel White",
      "data1": "daniel.white@example.com",
      "data2": "(555) 234-7890",
      "locations": [
        { "id": 31, "name": "Savannah", "category": "South", "location": { "lat": 32.0809, "lng": -81.0912 } },
        { "id": 32, "name": "Roswell", "category": "South", "location": { "lat": 34.0232, "lng": -84.3616 } },
        { "id": 33, "name": "Warner Robins", "category": "South", "location": { "lat": 32.6130, "lng": -83.6241 } }
      ]
    },
    {
      "id": 12,
      "name": "Sophia Harris",
      "data1": "sophia.harris@example.com",
      "data2": "(555) 345-8901",
      "locations": [
        { "id": 34, "name": "Sandy Springs", "category": "South", "location": { "lat": 33.9304, "lng": -84.3733 } },
        { "id": 35, "name": "Columbus", "category": "South", "location": { "lat": 32.4609, "lng": -84.9877 } },
        { "id": 36, "name": "Athens", "category": "South", "location": { "lat": 33.9519, "lng": -83.3576 } }
      ]
    },
    {
      "id": 13,
      "name": "Andrew Lewis",
      "data1": "andrew.lewis@example.com",
      "data2": "(555) 456-9012",
      "locations": [
        { "id": 37, "name": "Augusta", "category": "South", "location": { "lat": 33.4735, "lng": -82.0105 } },
        { "id": 38, "name": "Johns Creek", "category": "South", "location": { "lat": 34.0289, "lng": -84.1986 } },
        { "id": 39, "name": "Albany", "category": "South", "location": { "lat": 31.5785, "lng": -84.1557 } }
      ]
    },
    {
      "id": 14,
      "name": "Jessica Walker",
      "data1": "jessica.walker@example.com",
      "data2": "(555) 567-0123",
      "locations": [
        { "id": 40, "name": "Marietta", "category": "South", "location": { "lat": 33.9526, "lng": -84.5499 } },
        { "id": 41, "name": "Smyrna", "category": "South", "location": { "lat": 33.8830, "lng": -84.5144 } },
        { "id": 42, "name": "Athens", "category": "South", "location": { "lat": 33.9519, "lng": -83.3576 } }
      ]
    },
    {
      "id": 15,
      "name": "Ryan Hall",
      "data1": "ryan.hall@example.com",
      "data2": "(555) 678-1234",
      "locations": [
        { "id": 43, "name": "Atlanta,GA", "category": "South", "location": { "lat": 33.7490, "lng": -84.3880 } },
        { "id": 44, "name": "Dunwoody", "category": "South", "location": { "lat": 33.9462, "lng": -84.3346 } },
        { "id": 45, "name": "Savannah", "category": "South", "location": { "lat": 32.0809, "lng": -81.0912 } }
      ]
    },
    {
      "id": 16,
      "name": "Laura Allen",
      "data1": "laura.allen@example.com",
      "data2": "(555) 789-2345",
      "locations": [
        { "id": 46, "name": "Warner Robins", "category": "South", "location": { "lat": 32.6130, "lng": -83.6241 } },
        { "id": 47, "name": "Alpharetta", "category": "South", "location": { "lat": 34.0754, "lng": -84.2941 } },
        { "id": 48, "name": "Roswell", "category": "South", "location": { "lat": 34.0232, "lng": -84.3616 } }
      ]
    },
    {
      "id": 17,
      "name": "Brandon Young",
      "data1": "brandon.young@example.com",
      "data2": "(555) 890-3456",
      "locations": [
        { "id": 49, "name": "Macon", "category": "South", "location": { "lat": 32.8407, "lng": -83.6324 } },
        { "id": 50, "name": "Augusta", "category": "South", "location": { "lat": 33.4735, "lng": -82.0105 } },
        { "id": 51, "name": "Albany", "category": "South", "location": { "lat": 31.5785, "lng": -84.1557 } }
      ]
    },
    {
      "id": 18,
      "name": "Rachel King",
      "data1": "rachel.king@example.com",
      "data2": "(555) 901-4567",
      "locations": [
        { "id": 52, "name": "Valdosta", "category": "South", "location": { "lat": 30.8327, "lng": -83.2785 } },
        { "id": 53, "name": "Athens", "category": "South", "location": { "lat": 33.9519, "lng": -83.3576 } },
        { "id": 54, "name": "Dunwoody", "category": "South", "location": { "lat": 33.9462, "lng": -84.3346 } }
      ]
    },
    {
      "id": 19,
      "name": "James Wright",
      "data1": "james.wright@example.com",
      "data2": "(555) 123-5678",
      "locations": [
        { "id": 55, "name": "Savannah", "category": "South", "location": { "lat": 32.0809, "lng": -81.0912 } },
        { "id": 56, "name": "Roswell", "category": "South", "location": { "lat": 34.0232, "lng": -84.3616 } },
        { "id": 57, "name": "Sandy Springs", "category": "South", "location": { "lat": 33.9304, "lng": -84.3733 } }
      ]
    },
    {
      "id": 20,
      "name": "Megan Scott",
      "data1": "megan.scott@example.com",
      "data2": "(555) 234-6789",
      "locations": [
        { "id": 58, "name": "Columbus", "category": "South", "location": { "lat": 32.4609, "lng": -84.9877 } },
        { "id": 59, "name": "Augusta", "category": "South", "location": { "lat": 33.4735, "lng": -82.0105 } },
        { "id": 60, "name": "Valdosta", "category": "South", "location": { "lat": 30.8327, "lng": -83.2785 } }
      ]
    }
  ])}
  