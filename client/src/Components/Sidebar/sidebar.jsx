import {
    LayoutDashboard,
    ListChecks,
    Users,
    PiggyBank,
    Bell,
    HandCoins,
    ArrowLeftRight,
    PlaneTakeoff,
    UserSearchIcon,
    UserCircle2
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../../public/logo.png';
import dummy_image from '../../../public/dummy_image.webp';

export default function Sidebar({ selectedTab, user_profile_image, user_name }) {
    const [activeItem, setActiveItem] = useState(selectedTab.toLowerCase());
    const navigate = useNavigate();

    return (
        <div id="sidebar" className="flex flex-col w-fit bg-white sticky top-0 h-[100vh]" style={{ boxShadow: '0px 0px 4px 1px lightgrey' }}>
            <div onClick={() => navigate('/')} className="flex items-center gap-[10px] p-4 pt-[1.5rem] pe-[3rem] cursor-pointer" style={{ borderBottom: '1px solid orange' }}>
                <img className="w-[2.5rem]" src={logo} alt="error" style={{ animation: 'spin 2s ease-in' }} />
                <p className='font-bold text-[1.5rem] whitespace-nowrap'>Spending Smart</p>
            </div>
            <div className="ml-[3rem]" style={{flex:1}}>
                <ul className=" grid gap-2 my-6">
                    {/* <li onClick={() => { setActiveItem('dashboard'), navigate('/Dashboard') }} className={`flex gap-2 cursor-pointer bg-[${activeItem == 'dashboard' ? '#f15b42' : 'white'}] ${activeItem == 'dashboard' ? 'text-yellow-200' : 'text-black'} p-[10px] pe-[7rem]`} style={{ borderRadius: '30px 0px 0px 30px' }}>
                        <LayoutDashboard />
                        <span className='font-[500] whitespace-nowrap'>Dashboard</span>
                    </li> */}
                    <li onClick={() => { setActiveItem("trackmyexpenses"), navigate('/track-my-expenses') }} className={`flex gap-2 cursor-pointer  bg-[${activeItem == "trackmyexpenses" ? '#f15b42' : 'white'}] ${activeItem == 'trackmyexpenses' ? 'text-yellow-200' : 'text-black'} p-[10px] pe-[7rem]`} style={{ borderRadius: '30px 0px 0px 30px' }}>
                        <ListChecks />
                        <span className='font-[500] whitespace-nowrap'>Track My Expenses</span>
                    </li>
                    <li onClick={() => { setActiveItem("groupexpenses"), navigate('/group-expenses') }} className={`flex gap-2 cursor-pointer  bg-[${activeItem == "groupexpenses" ? '#f15b42' : 'white'}] ${activeItem == 'groupexpenses' ? 'text-yellow-200' : 'text-black'} p-[10px] pe-[7rem]`} style={{ borderRadius: '30px 0px 0px 30px' }}>
                        <Users />
                        <span className='font-[500] whitespace-nowrap'>Group Expenses</span>
                    </li>
                    {/* <li onClick={()=> setActiveItem("travelexpenses")} className={`flex gap-2 cursor-pointer  bg-[${activeItem=="travelexpenses"?'#f15b42': 'white'}] ${activeItem=='travelexpenses'? 'text-yellow-200' :'text-black'} p-[10px] pe-[7rem]`}  style={{borderRadius:'30px 0px 0px 30px'}}>
                        <PlaneTakeoff  />
                        <span className='font-[500] whitespace-nowrap'>Travel Expenses</span>
                    </li> */}
                    <li onClick={() => { setActiveItem("savinggoals"), navigate('/saving-goals') }} className={`flex gap-2 cursor-pointer  bg-[${activeItem == "savinggoals" ? '#f15b42' : 'white'}] ${activeItem == 'savinggoals' ? 'text-yellow-200' : 'text-black'} p-[10px] pe-[7rem]`} style={{ borderRadius: '30px 0px 0px 30px' }}>
                        <PiggyBank />
                        <span className='font-[500] whitespace-nowrap'>Saving Goals</span>
                    </li>
                    <li onClick={() => { setActiveItem("friends"), navigate('/friends') }} className={`flex gap-2 cursor-pointer  bg-[${activeItem == "friends" ? '#f15b42' : 'white'}] ${activeItem == 'friends' ? 'text-yellow-200' : 'text-black'} p-[10px] pe-[7rem]`} style={{ borderRadius: '30px 0px 0px 30px' }}>
                        <UserSearchIcon />
                        <span className='font-[500] whitespace-nowrap'>Friends</span>
                    </li>
                    <li onClick={() => {setActiveItem("moneyrequests"), navigate('/money-requests')}} className={`flex gap-2 cursor-pointer  bg-[${activeItem == "moneyrequests" ? '#f15b42' : 'white'}] ${activeItem == 'moneyrequests' ? 'text-yellow-200' : 'text-black'} p-[10px] pe-[7rem]`} style={{ borderRadius: '30px 0px 0px 30px' }}>
                        <HandCoins />
                        <span className='font-[500] whitespace-nowrap'>Money Requests</span>
                    </li>
                    <li onClick={() => {setActiveItem("transactions"), navigate('/transactions')}} className={`flex gap-2 cursor-pointer  bg-[${activeItem == "transactions" ? '#f15b42' : 'white'}] ${activeItem == 'transactions' ? 'text-yellow-200' : 'text-black'} p-[10px] pe-[7rem]`} style={{ borderRadius: '30px 0px 0px 30px' }}>
                        <ArrowLeftRight />
                        <span className='font-[500] whitespace-nowrap'>Transactions</span>
                    </li>
                    <li onClick={() => {setActiveItem("userprofile"), navigate('/user-profile')}} className={`flex gap-2 cursor-pointer  bg-[${activeItem == "userprofile" ? '#f15b42' : 'white'}] ${activeItem == 'userprofile' ? 'text-yellow-200' : 'text-black'} p-[10px] pe-[7rem]`} style={{ borderRadius: '30px 0px 0px 30px' }}>
                        <UserCircle2 />
                        <span className='font-[500] whitespace-nowrap'>User Profile</span>
                    </li>
                </ul>
            </div>
            <div className="p-4 pb-[2rem]" style={{ borderTop: '1px solid orange' }}>
                <div className='flex items-center gap-4 m-auto '>
                    <img className="w-[3.5rem] rounded-[50%] aspect-square object-cover" src={user_profile_image ? user_profile_image : dummy_image} alt="error" />
                    <div>
                        <h5 className='font-bold'>Hii, {user_name}</h5>
                    </div>
                </div>
            </div>
        </div>
    );
}

