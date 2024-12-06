import React, { Children, cloneElement, createElement, isValidElement, useEffect, useState } from 'react'
import LittleMenu from './LittleMenu';



export default function PillTabs({children,className,mini, header}) {

    var [active, setActive] = useState(0);
    var [pills, setPills] = useState([])

    var [toggleActive, setToggleActive] = useState(0);
    var [littleText,setLittleText] = useState("");

    var menuActions = [];

    
    useEffect(()=>{

        //setLittleText(action);
        setLittleText(menuActions[active]?.name)

    },[active])
    
    

    const randomId = `lm${Math.random().toFixed(2) * 100}`;
    

    function getChildContent(element,level,optionIndex){
        if(level == 0) {
            var action = Children.toArray(element.props.children).slice(0,1)
            menuActions.push({name:action,onClick:()=> {setActive(optionIndex); console.log(`Index is ${optionIndex};`)}})
            
            return action;
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
        
        //console.log(`modified string is ${refinedBodyClasses}`)

        return refinedBodyClasses.join(" ");

    }

   

  return (
    <div className={`md:border md:rounded-2xl shadow-xl shadow-[#95b8c8] w-full  mx-auto  justify-start   items-start overflow-hidden flex flex-[2_2_0%] md:min-h-[20rem] flex-col ${className}`}>
       <div className='w-full flex flex-1 items-center justify-end'>
            <div className={`mx-auto ${mini ? 'hidden' : ''} border-[--main-color] flex  justify-center  my-4 overflow-hidden mb-4 w-[80%] min-w-[80%] rounded-2xl ${addUserSuppliedClasses(className,"header")}`}>
            {
                children && Children.toArray(children).map((c,i) =>{
                    

                    return c.props.className?.indexOf("tab") > -1 ?  (<div key={i} onClick={()=>{setActive(i); /*setLittleText(menuActions[i].name)*/}} className={`justify-start text-sm md:text-lg transition-all duration-300 ease-in-out justify-center  text-[white]   bg-[#99ba93] flex w-full flex-1 p-2 hover:bg-lime-800/100  ease-in-out cursor-pointer  ${active == i ? 'activeTab': 'inactiveTab'} ${addUserSuppliedClasses(className,"tab")} ${c.props.className}` }>{getChildContent(c,0,i)}</div>)

                    : c
                })
            }
            
            </div>
           {mini && <div className='flex gap-2 justify-center items-center w-full border'><div className={`font-bold text-sm flex flex-1 pl-0 h-full`}>{header}</div><span className={` text-sm lm-text ${randomId}`}>{littleText}</span><LittleMenu menuActions={menuActions}/></div>}
        </div>
        <div className={`flex flex-1 h-full w-full justify-center items-center ${addUserSuppliedClasses(className,"body")}`}>
        {
             children && Children.toArray(children).map((c,i) =>{
                return  <div key={i} className={`${active == i ? 'activeTabContent' : 'inactiveTabContent'} tabContent w-full`} >{getChildContent(c,1)}</div>
            })
        }
        </div>
    </div>
  )
}
