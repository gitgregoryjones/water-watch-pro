import styled from "styled-components";

const Dashboard = styled.div`

    display:flex;
    flex-direction:column;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto;
  --border:1px solid black;
  gap:1rem;
  min-height:100vh;
  --padding:1.5rem;
  grid-template-areas: 
  "header header" 
  "footer footer footer";
   width: 85vw;
   --border-radius:1rem;
   position:static;
   background-color: var(--dark);
   background-color: transparent;
   
   @media(max-width:600px){
  
      grid-template-columns:1fr;
      
      padding:0rem;
      width:100vw;
      
      border-radius:0px;
      
      
  
    }
   

             
`;

export default Dashboard;