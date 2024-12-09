import React from 'react'
import { useSelector } from 'react-redux'

export default function Upgrade({children, link = "https://waterwatchpro.com/prices", tier = 2, showMsg = true}) {

    let user = useSelector(state => state.userInfo.user)

    //console.log(`Ties is ${tier}`)

  return (
     user.tier < tier && user.role != "Owner" ?  showMsg && <center><div className='flex w-full md:min-w-[50rem] max-w-[40rem] h-[80%] min-h-[15rem] my-4 border-[gold] border-4 rounded-2xl justify-center items-center flex-col gap-4'><div>This feature is not available at your current service level</div><a href={link}>Click Here to Upgrade</a></div></center>
     :
     <>{children}</>
  )
}
