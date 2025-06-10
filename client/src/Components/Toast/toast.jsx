import {Check, InfoIcon, X} from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function Toast({toast_data}){
 const toastRef = useRef();

 useEffect(() => {
    const toast = toastRef.current;
  
    if (toast) {
      toast.style.display = "block";
      toast.style.opacity = "1";
      toast.style.transition = "opacity 1s ease";
  
      // Start fade-out after 1.5s
      const fadeOutTimeout = setTimeout(() => {
        toast.style.opacity = "0";
      }, 1500);
  
      // Hide after fade-out completes
      const hideTimeout = setTimeout(() => {
        toast.style.display = "none";
      }, 2000);
  
      return () => {
        clearTimeout(fadeOutTimeout);
        clearTimeout(hideTimeout);
      };
    }
  }, [toast_data]);
  

  return (
    <div ref={toastRef} className="fixed top-[3%] left-[50%] z-10000 w-[40%] px-[20px] py-[10px] rounded-lg font-[600]" style={{boxShadow:'0px 0px 7px -2px cadetblue', backgroundColor:'rgb(245, 237, 228)', transform: 'translate(-50%,0)'}}>
        <div className='flex gap-2 items-center'>
            { 
              (()=>{
                switch(toast_data.status){
                  case 'Success':
                    return <Check className='bg-[cadetblue] text-white rounded-[50%] p-[3px]'/>;
                  case 'Fail':
                    return <X className='bg-red-500 rounded-[50%] text-white p-[3px]'/>;
                  case 'Info':
                    return <InfoIcon className='text-blue-600' />
                }
              })()
            }
            <p>{toast_data.message}</p>
        </div>
    </div>
  );  
}