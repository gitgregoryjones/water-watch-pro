import styled from "styled-components";
import { useContext } from 'react';
import { ThemeContext } from '../utility/ThemeContext.jsx';

const StyledContainer = styled.div`
    --background-color: var(--secondary-color);
    width:100vw;
    min-height:100vh;
    display:flex;
    flex-direction:column;
    justify-content:center;
    align-items:center;
    --background: purple;
    position:relative;
    background: var(--primary-color);
    padding-bottom:1rem;

    ${({ $theme }) => $theme !== 'dark' && `
        background:url(https://i.postimg.cc/GhGPCkYv/image.png) top left / contain;
    `}

    --background:url(https://i.postimg.cc/YCXvK9X1/Screenshot-2024-11-09-at-1-23-22-PM.png);
`;

const Container = ({ className, children }) => {
    const { theme } = useContext(ThemeContext);
    return (
        <StyledContainer className={className} $theme={theme}>
            {children}
        </StyledContainer>
    );
};

export default Container;
