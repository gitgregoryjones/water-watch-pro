import styled from 'styled-components';

const Button = styled.button`

    background-color: ${props => (props.secondary ? 'var(--second-accent-color)' : 'var(--dark)')};
    display:flex;
    flex:1;
   text-align:center;
    justify-content:center;
    align-items:center;
    max-height:3rem;
    color: var(--primary-color);
`;

export default Button;