import React from 'react'
/*
display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr;
          grid-template-rows: auto;
          grid-template-areas: 
              "header header header header" 
              "full-line full-line full-line full-line"
              "content content content content"
              "footer footer footer footer"
             ;
             
           
           
          
              
          --border:1px solid black;
          
          .header {
              
              grid-area: header;
              
          }
          
          .content {
          
              grid-area: content;
              
          }
          
          .footer {
              grid-area:footer;
              --border: 1px solid black;
              
          }
          */
export default function CardContent({children}) {
  return (
    <div className='card-content w-full'>{children}</div>
  )
}


