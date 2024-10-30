import React, { Children, cloneElement, createElement, isValidElement, useEffect, useState } from 'react'



export default function PillTabs({children,className}) {

    var [active, setActive] = useState(0);
    var [pills, setPills] = useState([])

    var [toggleActive, setToggleActive] = useState(0);

    
    useEffect(()=>{

    },[toggleActive])
    
    function getChildContent(element,level){
        if(level == 0) {
            return Children.toArray(element.props.children).slice(0,1)
        }else {
            return Children.toArray(element.props.children).slice(level)
        }
    }

    function addUserSuppliedClasses(classString,section){

        section = section + "-";

        if(!classString || classString.trim().length == 0)
            return "";

        var rawBodyClasses = classString.split(" ").filter(s => s.indexOf(section) > -1);

        var refinedBodyClasses = [];
        
        rawBodyClasses.map(c => refinedBodyClasses.push(c.substring(c.indexOf("-")+1)))
        
        console.log(`modified string is ${refinedBodyClasses}`)

        return refinedBodyClasses.join(" ");

    }

  return (
    <div className={`md:border md:rounded-2xl shadow-2xl flex  flex-1 w-full  mx-auto  justify-start  flex items-start overflow-hidden flex flex-[2_2_0%] md:min-h-[20rem] flex-col ${className}`}>
        <div className={`mx-auto border-[--main-color] flex justify-center  my-4 overflow-hidden mb-4 w-[80%] min-w-[80%] rounded-2xl ${addUserSuppliedClasses(className,"header")}`}>
        {
            children && Children.toArray(children).map((c,i) =>{
                

                   return c.props.className?.indexOf("tab") > -1 ?  (<div onClick={()=>setActive(i)} className={`justify-start  transition-all duration-300 ease-in-out justify-center  text-[white]   bg-[--highlight-color] flex w-full flex-1 p-2 hover:bg-lime-800/100  ease-in-out cursor-pointer  ${active == i ? 'activeTab': 'inactiveTab'} ${addUserSuppliedClasses(className,"tab")} ${c.props.className}` }>{getChildContent(c,0)}</div>)

                   : c
            })
        }
        </div>
        <div className={`flex flex-1 w-full justify-center items-center ${addUserSuppliedClasses(className,"body")}`}>
        {
             children && Children.toArray(children).map((c,i) =>{
                return  <div className={`${active == i ? 'activeTabContent' : 'inactiveTabContent'} tabContent w-full`} >{getChildContent(c,1)}</div>
            })
        }
        </div>
    </div>
  )
}
