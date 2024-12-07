import React, {
    Children,
    useEffect,
    useState,
  } from "react";
  import LittleMenu from "./LittleMenu";
  
  export default function PillTabs({ children, className, mini, header }) {
    const [active, setActive] = useState(0);
    const [menuActions, setMenuActions] = useState([]);
    const [littleText, setLittleText] = useState("");
  
    const randomId = `lm${Math.random().toFixed(2) * 100}`;
  
    useEffect(() => {
      // Update littleText based on the active tab
      if (menuActions.length > 0) {
        setLittleText(menuActions[active]?.name || "");
      }
    }, [active, menuActions]);
  
    useEffect(() => {
      // Initialize menuActions on first render
      const actions = Children.toArray(children).map((child, index) => ({
        name: child.props.children[0] || `Tab ${index + 1}`,
        onClick: () => setActive(index),
      }));
      setMenuActions(actions);
    }, [children]);
  
    const addUserSuppliedClasses = (classString, section) => {
      section = section + "-";
  
      if (!classString || classString.trim().length === 0) return "";
  
      const rawBodyClasses = classString
        .split(" ")
        .filter((s) => s.indexOf(section) > -1);
  
      const refinedBodyClasses = rawBodyClasses.map((c) =>
        c.substring(c.indexOf("-") + 1)
      );
  
      return refinedBodyClasses.join(" ");
    };
  
    return (
      <div
        className={`md:border md:rounded-2xl shadow-xl shadow-[#95b8c8] w-full mx-auto justify-start items-start overflow-hidden flex flex-[2_2_0%] md:min-h-[20rem] flex-col ${className}`}
      >
        <div className="w-full flex flex-1 items-center justify-end">
          <div
            className={`mx-auto ${
              mini ? "hidden" : ""
            } border-[--main-color] flex justify-center my-4 overflow-hidden mb-4 w-[80%] min-w-[80%] rounded-2xl ${addUserSuppliedClasses(
              className,
              "header"
            )}`}
          >
            {children &&
              Children.toArray(children).map((child, index) => (
                <div
                  key={index}
                  onClick={() => setActive(index)}
                  className={`justify-start text-sm md:text-lg transition-all duration-300 ease-in-out justify-center text-[white] bg-[#197285] flex w-full flex-1 p-2 zhover:bg-lime-800/100 ease-in-out cursor-pointer ${
                    active === index ? "activeTab" : "inactiveTab"
                  } ${addUserSuppliedClasses(className, "tab")} ${
                    child.props.className
                  }`}
                >
                  {child.props.children[0]}
                </div>
              ))}
          </div>
          {mini && (
            <div className="flex gap-2 justify-center items-center w-full border">
              <div className={`font-bold text-sm flex flex-1 pl-0 h-full`}>
                {header}
              </div>
              <span className={`text-sm lm-text ${randomId}`}>{littleText}</span>
              <LittleMenu menuActions={menuActions} />
            </div>
          )}
        </div>
        <div
          className={`flex flex-1 h-full w-full justify-center items-center ${addUserSuppliedClasses(
            className,
            "body"
          )}`}
        >
          {children &&
            Children.toArray(children).map((child, index) =>
              active === index ? (
                <div
                  key={index}
                  className={`${
                    active === index ? "activeTabContent" : "inactiveTabContent"
                  } tabContent w-full`}
                >
                  {child.props.children.slice(1)}
                </div>
              ) : null
            )}
        </div>
      </div>
    );
  }
  