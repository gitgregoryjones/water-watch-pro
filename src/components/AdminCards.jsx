import React, { useEffect, useState } from 'react'
import Card from './Card'
import PrettyHeader from './PrettyHeader'
import Stats from './Stats'
import { useNavigate } from 'react-router-dom'
import { VITE_MAILCHIMP_LOGIN, VITE_TWILIO_LOGIN } from '../utility/constants'
import api from '../utility/api'
import { useSelector } from 'react-redux'
import WorkingDialog from './WorkingDialog'
import Processing from './Processing'
import ProfilePic from './ProfilePic'


export default function AdminCards() {

  

  const user = useSelector((state)=> state.userInfo.user)

  const [clients,setClients] = useState([])
  const [gold,setGold] = useState([])
  const [silver,setSilver] = useState([])
  const [bronze,setBronze] = useState([])
  const [trial,setTrial] = useState([])
  const [currentPage,setCurrentPage] = useState(1)
  const [working,setWorking] = useState(false)
  const [summary,setSummary] = useState({
  
      gold: { count: 0, paid: 0, unpaid: 0 },
      silver: { count: 0, paid: 0, unpaid: 0 },
      bronze: { count: 0, paid: 0, unpaid: 0 },
      trial: { count: 0, paid: 0, unpaid: 0 },
      totalPaid: 0,
      totalUnpaid: 0,
      totalAccounts: 0,
    })

  useEffect(()=>{

    fetchClients();

  },[])

  

  function generateSummary(accounts) {
    const table = {
      gold: { count: 0, paid: 0, unpaid: 0 },
      silver: { count: 0, paid: 0, unpaid: 0 },
      bronze: { count: 0, paid: 0, unpaid: 0 },
      trial: { count: 0, paid: 0, unpaid: 0 },
      totalPaid: 0,
      totalUnpaid: 0,
      totalAccounts: accounts?.length,
      totalEmailFailures:0
    };
  
    accounts.forEach((account) => {
      const tier = account.tier || "trial";
      const isPaid = account.account_type === "paid";

      console.log(`Looping Tier is ${tier}`)
  
      // Increment tier-specific counts
      table[tier] ? table[tier].count += 1 : 0;

      if (isPaid) {
        table[tier].paid += 1;
        table.totalPaid += 1;
      } else {
        table[tier].unpaid += 1;
        table.totalUnpaid += 1;
      }
    });
  
    return table;
  }
  
  
 
async function countFailureTds() {
  try {
    // Make a GET request to the specified endpoint
    const response = await api.get('/api/reports/sockletlabs-email-report');

    // Check if response data is valid
    if (!response.data) {
      console.error("No data received from API.");
      return 0;
    }

    // Parse the HTML response using DOMParser (for browsers) or JSDOM (for Node.js)
    const htmlContent = response.data;

    // For browser environments
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // For Node.js environments, use JSDOM:
    // const dom = new JSDOM(htmlContent);
    // const doc = dom.window.document;

    // Select all <td> elements
    const tdElements = doc.querySelectorAll('td');

    // Count <td> elements with the text 'Failure'
    const failureCount = Array.from(tdElements).filter(
      (td) => td.textContent.trim() === 'Failed'
    ).length;

    console.log(`Total number of 'Failure' <td> tags: ${failureCount}`);
    return failureCount;
  } catch (error) {
    console.error("Error fetching or processing the report:", error);
    return 0;
  }
}

// Call the function




  async function fetchClients() {

    setWorking(true);

    try {
      const response = await api.get(`/api/clients/?client_id=${user.clients[0].id}&page=${currentPage}&page_size=250`);

      const emailFailures = await countFailureTds();

      //setTimeout(()=> setWorking(false),500)

      setClients(response.data);

      setWorking(false);
     
      //Get Gold
     
      setSummary({...generateSummary(response.data), totalEmailFailures:emailFailures})

      

    } catch (error) {
      console.error('Error fetching clients:', error.message);
    }
  };

  function checkOrNah(count){

    return count == 0 ? <i className={`fa text-[white] fa-solid fa-check`}></i> : <i className={`fa text-[orange] fa-solid fa-circle-exclamation`}></i>
  }

  const navigate = useNavigate();
  return (
    
    <div className='flex flex-col md:mt-28 gap-4'>
           <ProfilePic/>
        <Card className={'flex gap-4 justify-center items-center md:border-[transparent] '} header={<PrettyHeader icon={<i className='fa fa-solid fa-triangle-exclamation'></i>}><span className=''>Overall System Health {new Date().toLocaleDateString("EN-US")} </span></PrettyHeader>} footer={<div className='flex justify-around items-center gap-2 text-sm'></div>} >
      <div className='grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-8' >
    
        <Stats onClick={()=> window.location.href = VITE_MAILCHIMP_LOGIN} header={<div className='flex  gap-2 justify-center  items-center text-white h-full border-b-[white] text-xl md:text-2xl'><i className='fa fa-solid fa-envelope'></i>Emails </div>}>
          <div  className='flex flex-col'>
            <div className='flex gap-2 items-center justify-center text-3xl'>Processed</div>
          <div className='flex gap-2 justify-center items-center'>{checkOrNah(summary.totalEmailFailures)}{summary.totalEmailFailures} errors</div>
          </div>
        </Stats>
        <Stats onClick={()=> window.location.href = VITE_TWILIO_LOGIN} header={<div className='flex gap-2 justify-center items-center px-4 text-white h-full border-b-[white] text-3xl md:text-3xl'><i className='text-3xl fa fas fa-sms'></i>Twilio </div>}>
        <div className='flex flex-col'>
          <div className='flex items-center justify-center text-2xl md:text-3xl'>1200/1234</div>
          <div className='flex gap-2 justify-center items-center'><i className='fa text-[orange] fa-solid fa-circle-exclamation'></i>15 errors</div>
          </div>
        </Stats>
        <Processing/>
        <Stats className={`hidden`} header={<div className='flex gap-2 justify-center items-center text-white h-full border-b-[white] text-xl md:text-2xl'><i className='text-3xl fa fas fa-database'></i>Pass 2 </div>}>
          <div className='flex items-center justify-center md:text-3xl text-2xl text-[white]'>On Standby</div>
        </Stats>
      </div>

      
      </Card>

      <Card className={'flex gap-4 justify-center items-center md:border-[transparent] '} header={<PrettyHeader icon={<i className='fa  fa-solid fa-people-group text-[white]'></i>}>Client Status</PrettyHeader>} footer={<div className='flex justify-around items-center gap-2 text-sm'></div>} >
      <div className='grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-8' >
    
        <Stats onClick={(e)=> navigate("/settings-admin",{state:{gold:true,trial:false}})} header={<div className='flex gap-2 justify-center items-center text-white h-full border-b-[white] text-xl md:text-2xl'><i className='text-3xl text-[gold] fa fa-solid fa-circle-user'></i>Gold Tier </div>}>
        <div className='flex flex-col'>
          <div className='flex items-center justify-center text-3xl'>{summary.gold.count}</div>
          <div className='flex gap-2 justify-center items-center'>{checkOrNah(summary.gold.unpaid)}{summary.gold.unpaid} unpaid</div>
          </div>
        </Stats>
        <Stats onClick={(e)=> navigate("/settings-admin",{state:{silver:true}})} header={<div className='flex gap-2 justify-center items-center text-white h-full border-b-[white] text-xl md:text-2xl'><i className='text-3xl fa-solid fa-circle-user'></i>Silver Tier </div>}>
        <div className='flex flex-col'>
          <div className='flex items-center justify-center text-3xl'>{summary.silver.count}</div>
          <div className='flex gap-2 justify-center items-center'>{checkOrNah(summary.silver.unpaid)}{summary.silver.unpaid} unpaid</div>
          </div>  
        </Stats>
        <Stats onClick={(e)=> navigate("/settings-admin",{state:{bronze:true}})}  header={<div className='flex gap-2 justify-center items-center text-white h-full border-b-[white] text-xl md:text-2xl'><i className='text-3xl text-[tan] fa-solid fa-circle-user'></i>Bronze Tier</div>}>
        <div className='flex flex-col'>
          <div className='flex items-center justify-center text-3xl'>{summary.bronze.count}</div>
          <div className='flex gap-2 justify-center items-center'>{checkOrNah(summary.bronze.unpaid)}{summary.bronze.unpaid} unpaid</div>
          </div>
        </Stats>
        {/*<Stats header={<div className='flex gap-2 justify-center items-center text-white h-full border-b-[white] text-xl md:text-2xl'><i className='text-3xl text-[limegreen] fa-solid fa-circle-user'></i>Trials</div>}>
        <div className='flex flex-col'>
          <div className='flex items-center justify-center text-3xl'>{0}</div>
        
          </div>
        </Stats>*/}
        <Stats onClick={(e)=> navigate("/settings-admin")}  header={<div className='flex gap-2 justify-center items-center text-white h-full border-b-[white] text-xl md:text-2xl'><i className='text-3xl fa-solid fa-circle-user'></i>Total Accounts</div>}>
          <div className='flex items-center justify-center text-3xl'>{summary.totalAccounts}</div>
        </Stats>
        <Stats onClick={(e)=> navigate("/settings-admin",{state:{trial:true}})} header={<div className='flex gap-2 justify-center items-center text-white h-full border-b-[white] text-xl md:text-2xl'><i className='text-3xl text-[limegreen] fa-solid fa-circle-user'></i>Trials</div>}>
          <div className='flex items-center justify-center  text-3xl'>{summary.totalUnpaid}</div>
        </Stats>
      
      </div>

      
      </Card>
      <WorkingDialog showDialog={working}/>
    </div>
  )
}
