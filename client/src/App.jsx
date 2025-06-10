import './App.css'
import {BrowserRouter, Routes, Route } from 'react-router-dom';
import Homepage from './Components/Homepage/Homepage'
import Signup from './Components/Signup/signup';
import Login from './Components/Login/login';
import Dashboard from './Components/Dashboard/dashboard';
import TrackMyExpenses from './Components/Track_My_Expenses/track-my-expenses';
import SavingGoals from './Components/Saving_Goals/saving_goals';
import Group from './Components/Group_Expenses/group';
import Friends from './Components/Friends/friends';
import UserProfile from './Components/User_Profile/user_profile';
import MoneyRequest from './Components/Money_Request/money_request';
import Transactions from './Components/Transactions/transactions';
import Test from './Components/test';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/sign-up" element={<Signup/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/track-my-expenses" element={<TrackMyExpenses/>}/>
        <Route path='/saving-goals' element={<SavingGoals/>}/>
        <Route path='/group-expenses' element={<Group/>}/>
        <Route path='/friends' element={<Friends/>}/>
        <Route path='/user-profile' element={<UserProfile/>}/>
        <Route path='/money-requests' element={<MoneyRequest/>}/>
        <Route path='/transactions' element={<Transactions/>}/>

        <Route path='/test' element={<Test/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App;