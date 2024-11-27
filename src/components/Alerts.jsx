import React from 'react'
import Card from './Card'
import ItemControl from './ItemControl'

export default function Alerts() {

    function gotoNotification(notification){

        

        window.location = (notification.link)
    }

    function onRowRendered(notification,row,index){



        if(notification.name.indexOf("NOAA Atlas 14")> -1){

            //row.classList.add("text-[red]");
            //console.log(`NOA`)
            //console.log(row.props.className)
            
            let clone = React.cloneElement(row,{
              ...row,
                style:{color:"red", fontWeight:"bold"}
            }
                
            );
            
            row = clone;
        } 

        return row;
    }

  return (
    <Card header={<div className='flex gap-2 justify-start items-center'><i className="fa fa-bell text-[#ecbf1d]"></i>Latest Alerts</div>}>
        <ItemControl
          className='mt-4 max-w-[90%] w-full md:shadow-[unset]'
          showSearchBar={true}
          showAddButton={false}
          showFavoriteControls={false}
          searchPlaceholder='Search Alerts...'
          onItemClicked={gotoNotification}
          onRowRendered={onRowRendered}
          collectionList={[{
            name:"11/14/2024 23:22 OHare has exceeded .5 inches of precipitation in the last 24 hours.  CLICK HERE for precip infoOHare has exceeded .5 inches of precipitation in the last 24 hours.",
            link:"http://www.yu3z.com/ve/ve.php?t=2329FwPCTSN7"
          },
          {
            name:"11/13/2024 14:00 ATL has exceeded .5 inches of precipitation in the last 24 hours.",
            link:"http://www.yu3z.com/ve/ve.php?t=2329FwPCTSN7"
          },
          {
            name:"11/12/2024 03:45 LAX has exceeded .1 inches of precipitation in the last 24 hours.",
            link:"http://www.yu3z.com/ve/ve.php?t=2329FwPCTSN7"
          },
          {
            name:"11/10/2024 10:00: The NOAA Atlas 14 24-hour (or 1-hour) value was exceeded at FL2",
            link:"http://www.yu3z.com/ve/ve.php?t=2329FwPCTSN7"
          }
        ]}
        />
        </Card> 
  )
}
