export const getLinkClasses = (theme,isActive) => {
    if (theme === 'dark') {
      return `${isActive ? 'text-yellow-400' : 'text-white'} hover:text-yellow-400`;
    }
    return `${isActive ? 'text-slate-800' : 'text-[--main-2]'} hover:text-[--main-2]`;
  };