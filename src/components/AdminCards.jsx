import React from 'react'
import Card from './Card'
import PrettyHeader from './PrettyHeader'
import Stats from './Stats'

export default function AdminCards() {
  return (
    <div>
        <Card className={'gap-4 md:border-[transparent] '} header={<PrettyHeader icon={<i className='fa fa-solid fa-triangle-exclamation'></i>}><span className=''>Overall System Health</span></PrettyHeader>} footer={<div className='flex justify-around items-center gap-2 text-sm'></div>} >
      <div className='grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-8' >
    
        <Stats header={<div className='flex  gap-2 justify-around items-center text-white h-full border-b-[white] text-xl md:text-2xl'><i className='fa fa-solid fa-envelope'></i>Emails </div>}>
          <div className='flex flex-col'>
            <div className='flex gap-2 items-center justify-center text-3xl'>200/290</div>
          <div className='flex gap-2 justify-center items-center'><i className='fa text-[orange] fa-solid fa-circle-exclamation'></i>8 errors</div>
          </div>
        </Stats>
        <Stats header={<div className='flex gap-2 justify-around items-center text-white h-full border-b-[white] text-xl md:text-2xl'><i className='text-3xl fa fas fa-sms'></i>Twilio </div>}>
        <div className='flex flex-col'>
          <div className='flex items-center justify-center text-3xl'>1200/1234</div>
          <div className='flex gap-2 justify-center items-center'><i className='fa text-[orange] fa-solid fa-circle-exclamation'></i>15 errors</div>
          </div>
        </Stats>
        <Stats header={<div className='flex gap-2 justify-around items-center text-white h-full border-b-[white] text-xl md:text-2xl'><i className='text-3xl fa fas fa-database'></i>Pass 1 </div>}>
          <div className='flex items-center justify-center text-3xl'>Processed</div>
        </Stats>
        <Stats header={<div className='flex gap-2 justify-around items-center text-white h-full border-b-[white] text-xl md:text-2xl'><i className='text-3xl fa fas fa-database'></i>Pass 2 </div>}>
          <div className='flex items-center justify-center text-3xl text-[orange]'>Processing</div>
        </Stats>
      </div>

      
      </Card>

      <Card className={'gap-4 md:border-[transparent] '} header={<PrettyHeader icon={<i className='fa  fa-solid fa-people-group text-[white]'></i>}>Client Status</PrettyHeader>} footer={<div className='flex justify-around items-center gap-2 text-sm'></div>} >
      <div className='grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-8' >
    
        <Stats header={<div className='flex gap-2 justify-around items-center text-white h-full border-b-[white] text-xl md:text-2xl'><i className='text-3xl text-[gold] fa fa-solid fa-circle-user'></i>Gold Tier </div>}>
        <div className='flex flex-col'>
          <div className='flex items-center justify-center text-3xl'>30</div>
          <div className='flex gap-2 justify-center items-center'><i className='fa text-[orange] fa-solid fa-circle-exclamation'></i>3 unpaid</div>
          </div>
        </Stats>
        <Stats header={<div className='flex gap-2 justify-around items-center text-white h-full border-b-[white] text-xl md:text-2xl'><i className='text-3xl fa-solid fa-circle-user'></i>Silver Tier </div>}>
        <div className='flex flex-col'>
          <div className='flex items-center justify-center text-3xl'>45</div>
          <div className='flex gap-2 justify-center items-center'><i className='fa text-[orange] fa-solid fa-circle-exclamation'></i>3 unpaid</div>
          </div>
        </Stats>
        <Stats header={<div className='flex gap-2 justify-around items-center text-white h-full border-b-[white] text-xl md:text-2xl'><i className='text-3xl text-[tan] fa-solid fa-circle-user'></i>Bronze Tier</div>}>
        <div className='flex flex-col'>
          <div className='flex items-center justify-center text-3xl'>23</div>
          <div className='flex gap-2 justify-center items-center'><i className='fa text-[orange] fa-solid fa-circle-exclamation'></i>1 unpaid</div>
          </div>
        </Stats>
        <Stats header={<div className='flex gap-2 justify-around items-center text-white h-full border-b-[white] text-xl md:text-2xl'><i className='text-3xl text-[limegreen] fa-solid fa-circle-user'></i>Trials</div>}>
        <div className='flex flex-col'>
          <div className='flex items-center justify-center text-3xl'>82</div>
        
          </div>
        </Stats>
        <Stats header={<div className='flex gap-2 justify-around items-center text-white h-full border-b-[white] text-xl md:text-2xl'><i className='text-3xl fa-solid fa-circle-user'></i>Total Accounts</div>}>
          <div className='flex items-center justify-center text-3xl'>160</div>
        </Stats>
        <Stats header={<div className='flex gap-2 justify-around items-center text-white h-full border-b-[white] text-xl md:text-2xl'><i className='text-3xl fa-solid fa-circle-user'></i>Total Unpaid</div>}>
          <div className='flex items-center justify-center  text-3xl'>7</div>
        </Stats>
      
      </div>

      
      </Card>
    </div>
  )
}
