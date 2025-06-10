import Sidebar from "../Sidebar/sidebar";
import { ArrowDownLeft, ArrowDownRight, ArrowUpRight, CreditCard } from 'lucide-react';
import {MonthlyExpenseVsSavings} from '../Graphs/graphs';
import { useState, useEffect } from "react";
import Navbar from "../Homepage/Navbar";
import Loader from "../Loader/loader";
import Cookies from 'js-cookie';
import Toast from "../Toast/toast";
import { useNavigate } from "react-router-dom";

const OverallSpendingComponent = ({ data }) => {
  const navigate = useNavigate();

  // Calculate total spent and total budget from the provided data
  let totalSpent = 0;
  let totalBudget = 0;

  // The 'data' prop is now expected to be an array of expense profiles directly
  if (data && Array.isArray(data)) { // Changed: checking if 'data' itself is an array
    data.forEach(profile => { // Iterate directly over 'data'
      totalBudget += profile.total_budget;
      if (profile.expenses && Array.isArray(profile.expenses)) {
        profile.expenses.forEach(expense => {
          totalSpent += expense.amount;
        });
      }
    });
  }

  const remainingBudget = totalBudget - totalSpent;
  // Handle the case where totalBudget is 0 to prevent division by zero
  const percentageSpent = totalBudget > 0 ? (totalSpent / totalBudget * 100).toFixed(0) : 0;

  // Determine color for the progress bar based on spending
  let progressBarColor = 'bg-blue-500';
  let textColor = 'text-blue-600';
  if (percentageSpent >= 90) {
    progressBarColor = 'bg-red-500'; // High spending
    textColor = 'text-red-600';
  } else if (percentageSpent >= 70) {
    progressBarColor = 'bg-orange-500'; // Moderate to high spending
    textColor = 'text-orange-600';
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between border border-gray-200 flex-1/2">
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Overall Spending from "Track My Expenses"</h2>
        <p className="text-sm text-gray-600 mb-2">
          This shows your combined spending and budget across all your personal expense profiles.
        </p>

        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${textColor} ${textColor.replace('text-', 'bg-').replace('-600', '-200')}`}>
                Progress
              </span>
            </div>
            <div className="text-right">
              <span className={`text-sm font-semibold inline-block ${textColor}`}>
                {percentageSpent}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
            <div
              style={{ width: `${percentageSpent}%` }}
              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${progressBarColor}`}
            ></div>
          </div>
        </div>

        <p className="text-3xl font-bold text-gray-900 mt-4">
          ₹{totalSpent.toLocaleString()} <span className="text-xl font-medium text-gray-500">of ₹{totalBudget.toLocaleString()}</span>
        </p>

        {remainingBudget >= 0 ? (
          <p className="text-base text-gray-500">
            You have <span className="font-semibold text-green-600">₹{remainingBudget.toLocaleString()}</span> remaining.
          </p>
        ) : (
          <p className="text-base text-red-600 font-semibold">
            You are over budget by ₹{(-remainingBudget).toLocaleString()}!
          </p>
        )}
      </div>

      <button onClick={()=>navigate('/track-my-expenses')} className="cursor-pointer mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg shadow-md transition duration-300">
        View All Expense Profiles
      </button>
    </div>
  );
};

const SavingsGoalProgress=({savingGoals})=>{
  const navigate = useNavigate();

  return(
        <div className="bg-white rounded-xl shadow-lg p-6 flex-1/2">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Saving Goals</h2>
          <div className="space-y-4">
            {savingGoals.map((goal, index) => (
              <div key={index} className="border-b border-gray-200 pb-3 last:border-b-0 last:pb-0">
                  <span className="text-lg font-medium text-gray-800">{goal.title}</span>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600"> <strong>Target date: </strong> { new Date(goal.target_date).toLocaleDateString()}</span>
                </div>
                <div className="relative pt-1">
                  <div className="flex mb-1 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block text-green-600">
                        ₹{goal.saved_amount.toFixed(2)} / ₹{goal.target_amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-green-600">
                        {(goal.saved_amount / goal.target_amount * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-green-200">
                    <div
                      style={{ width: `${(goal.saved_amount / goal.target_amount * 100).toFixed(0)}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={()=>navigate('/saving-goals')} className="cursor-pointer mt-6 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-md transition duration-300">
            Manage Saving Goals
          </button>
        </div>
  );
}

const ExpenseProfiles=()=>{
    return(
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Expense Profiles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {expenseProfiles.map((profile, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">{profile.icon}</span>
                    <h3 className="text-lg font-semibold text-gray-800">{profile.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600">Spent: ₹{profile.spent.toLocaleString()} / ₹{profile.budget.toLocaleString()}</p>
                  <div className="relative pt-1 mt-2">
                    <div className="overflow-hidden h-1 text-xs flex rounded bg-red-200">
                      <div
                        style={{ width: `${(profile.spent / profile.budget * 100).toFixed(0)}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"
                      ></div>
                    </div>
                  </div>
                  <button className="text-sm text-blue-600 hover:underline mt-3">View Details</button>
                </div>
              ))}
            </div>
            <button className="mt-6 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-md transition duration-300">
              View All Profiles
            </button>
        </div>
    );
}

export default function Dashboard() {
    const selectedTab = "dashboard";
    const [loading, set_loading] = useState(false);
    const [user_data, set_user_data] = useState();
    const [toast_data, show_toast] = useState({
        status: '',
        message: ''
    });
    const [ exp_prof, set_exp_prof] =  useState(null);
    const [dashboard_data, set_dashboard_data] = useState({saving_goals:[],exp_prof_aggr_data:[] });
    const navigate= useNavigate();

    const fetch_user = async (user_id) => {
        try {
            set_loading(true);

            const response = await fetch(`${import.meta.env.VITE_SERVER_API}/user`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${user_id}` //pass user_id as token
                }
            });
            const result = await response.json();


            if (result.notFound) {
                // Handle not found case
                console.warn("User not found");
            } else if (result.failed) {
                // Handle failure case
                console.error("Server reported a failure");
            } else {
              console.log(result);
              set_user_data(result); // Set fetched user data
            }
        } catch (error) {
            console.error("Error while fetching user data:", error);
        } finally {
            set_loading(false); // Always turn off loading
        }

    }

    const fetch_expense_prof_data = async (user_id) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_SERVER_API}/track-my-expenses/expense-profile`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${user_id}` //pass user_id as token
                }
            });
            const finalRes = await response.json();
            console.log(finalRes);
            if (finalRes.failed) {
                console.log(finalRes);
                show_toast({ status: "Fail", message: "Try again later! Internal Server Error" });
                console.error("Error From Backend: Failed to fetch expense profile data");
            } else if (finalRes.notFound) {
                show_toast({ status: "Info", message: "No expense profiles found" });
                // set_empty_prof(true);
            } else {
                if(Array.isArray(finalRes))
                    set_exp_prof(finalRes);
                else
                    set_exp_prof([]);
                // set_empty_prof(false);
            }
        } catch (error) {
            show_toast({ status: "Error", message: "Network error! Please check your connection." });
            console.error("Frontend Fetch Error:", error);
        }
    };

    const fetch_dashboard_data = async(user_id)=>{
      try {
        const response = await fetch(`${import.meta.env.VITE_SERVER_API}/dashboard`,{
          headers:{
            "Authorization": `Bearer ${user_id}` //pass user_id as token
          }
        });
        const result = await response.json();

        set_dashboard_data({saving_goals:result.data.saving_goals,exp_prof_aggr_data:[] });
      } catch (error) {
        console.log(error);
      }
    }

    useEffect(() => {
        const user_id = Cookies.get('spending_smart_client');

        if (user_id){
            fetch_user(user_id);
            fetch_expense_prof_data(user_id);
            fetch_dashboard_data(user_id);
        }
    }, []);

    return (
        <div id="main-dashboard" className="flex">
            <Sidebar selectedTab={selectedTab} user_profile_image={user_data?.profile_image} user_name={user_data?.name} />
            {toast_data.message && <Toast toast_data={toast_data} />}

            {loading ? <Loader /> : ''}

            <div className="w-[100%]">
                <Navbar
                    user_id={user_data?._id}
                    user_name={user_data?.name}
                    user_profile_image={user_data?.profile_image}
                    set_loading={set_loading}
                    friend_request={user_data?.friendRequest_come}
                    money_request={user_data?.money_request}
                    notifications={user_data?.notifications}
                    show_toast={show_toast}
                />
                <div className="m-5">
                    <div>
                        <h1 className="mb-5 text-3xl">Dashboard</h1>
                    </div>

                    <MonthlyExpenseVsSavings />

                    <div className="flex gap-4 items-start mt-8">
                      {exp_prof && <OverallSpendingComponent data={exp_prof} />}
                      <SavingsGoalProgress savingGoals={dashboard_data.saving_goals}/>
                    </div>


                    {/* Recent Transactions */}
                    {user_data && user_data?.transactions?.length>0 && <div className="w-[50%] bg-white p-4 rounded-[10px] mt-[3rem]" style={{ boxShadow: '0px 0px 5px 0px lightgrey' }}>
                        <div className="flex justify-between mb-5">
                            <div>
                                <CreditCard size={20} className="text-gray-400 mr-2" />
                                <h4 className="font-bold">Recent Transactions</h4>
                            </div>
                            <button className="text-blue-600 font-[500] cursor-pointer" onClick={()=>navigate('/transactions')}>View All</button>
                        </div>
                        <div id="recent-transaction-container" className="flex flex-col gap-4">
                            {user_data?.transactions.map((elm, idx)=>(
                              <div className="flex justify-between items-center pb-2" style={{ borderBottom: (user_data?.transactions?.length-1 != idx) ?'2px solid #d3d3d38f':"" }}>
                                  <div className="flex items-center gap-5">
                                      <div className="w-[10%]">
                                          <img className="w-[100%] rounded-[50%]" src={elm.payer.payer_profile_image} alt="error" style={{ aspectRatio: 1, objectFit: 'cover' }} />
                                      </div>
                                      <div>
                                          <p className="font-bold">{elm.expense_name}</p>
                                          <span className="text-gray text-[small]">{elm.payment_date || ""}</span>
                                      </div>
                                  </div>
                                  <div>
                                      <p className={`${elm.transactionType == "credit"?'text-[#00C000]' : 'text-red-400'} flex`}>{elm.transactionType == "credit"?<ArrowDownLeft />:<ArrowUpRight/>}₹{elm.expense_amount.toFixed(2)}</p>
                                  </div>
                              </div>
                            ))
                            }
                        </div>
                    </div>}

                </div>
            </div>
        </div>
    );
}