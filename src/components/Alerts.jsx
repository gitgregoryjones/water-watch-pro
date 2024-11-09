import React from 'react'
import Card from './Card'
import ItemControl from './ItemControl'

export default function Alerts() {

    function gotoNotification(notification){

        

        window.location = (notification.link)
    }

  return (
    <Card header={<div className='flex gap-2 justify-start items-center'><i class="fa fa-bell text-[#ecbf1d]"></i>Latest Alerts</div>}>
        <ItemControl
          className='mt-4 max-w-[90%] w-full md:shadow-[unset]'
          showSearchBar={true}
          showAddButton={false}
          showFavoriteControls={false}
          searchPlaceholder='Search Alerts...'
          onItemClicked={gotoNotification}
          collectionList={[{
            name:"OHare has exceeded .5 inches of precipitation in the last 24 hours.  CLICK HERE for precip infoOHare has exceeded .5 inches of precipitation in the last 24 hours.",
            link:"http://www.yu3z.com/ve/ve.php?t=2329FwPCTSN7"
          },
          {
            name:"ATL has exceeded .5 inches of precipitation in the last 24 hours.",
            link:"http://www.yu3z.com/ve/ve.php?t=2329FwPCTSN7"
          },
          {
            name:"LAX has exceeded .1 inches of precipitation in the last 24 hours.",
            link:"http://www.yu3z.com/ve/ve.php?t=2329FwPCTSN7"
          }
        ]}
        />
        </Card> 
  )
}
