import styled from "styled-components";
const FormContainer = styled.form `
  display:flex;
  --min-width:20vw;
  max-width:30vw;
  min-height:400px;
  --border:2px solid white;
  border-radius:2rem;
  --background-color: var(--tertiary-color);
  background-color:transparent;
  flex-direction:column;
  justify-content:center;
  gap:.5rem;
  padding:1.5rem;
  

  & input{
    height:2rem;
    padding-left:1rem;
  }

  & label {
    font-weight:bold;
    color: var(--text-color)
  }
    & .logo {
        margin-bottom:1.2rem;
    }
    
    & button {
        margin-top:1rem;
    }
`;

export default FormContainer;