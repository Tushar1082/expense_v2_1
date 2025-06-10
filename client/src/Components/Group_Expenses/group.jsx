import { useState, useEffect, useRef } from "react";
import { PlusIcon, ViewIcon, TrashIcon } from 'lucide-react';
import Cookies from 'js-cookie';

import Navbar from "../Homepage/Navbar";
import Sidebar from "../Sidebar/sidebar";
import { ExpenseProfilePopup } from "../Create/create";
import Loader from "../Loader/loader";
import Toast from "../Toast/toast";
import empty_expense_profile from '../../../public/empty.jpg';
import GroupExpenses from "../Group_Expenses/group_expenses";
import dummy_img from "../../../public/dummy_image.webp";

export default function Group() {
    const selectedTab = "groupexpenses";
    const [show_create_expense_prof, set_show_create_expense_prof] = useState(false);
    const [loading, set_loading] = useState(false);
    const [user_data, set_user_data] = useState();
    const [toast_data, show_toast] = useState({
        status: '',
        message: ''
    });
    const [is_empty_prof, set_empty_prof] = useState();
    const [exp_prof, set_exp_prof] = useState();
    const [show_selected_exp_prof, set_show_selected_exp_prof] = useState(
        {
            show: false,
            expense_prof: null,
            group_id: null
        }
    );
    const user_id = Cookies.get('spending_smart_client');
    const create_prof_pop_ref = useRef();

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
            const response = await fetch(`${import.meta.env.VITE_SERVER_API}/group`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${user_id}` //pass user_id as token
                }
            });
            const finalRes = await response.json();

            if (finalRes.failed) {
                show_toast({ status: "Fail", message: "Try again later! Internal Server Error" });
                console.error("Error From Backend: Failed to fetch expense profile data");
            } else if (finalRes.notFound) {
                show_toast({ status: "Info", message: "No expense found" });
                set_empty_prof(true);
            } else {
                set_exp_prof(finalRes);
                set_empty_prof(false);
            }
        } catch (error) {
            show_toast({ status: "Fail", message: "Network error! Please check your connection." });
            console.error("Frontend Fetch Error:", error);
        }
    };

    const handle_expense_prof_delete = async (group_members, group_id) => {
        try {
            set_loading(true);
            const result = await fetch(`${import.meta.env.VITE_SERVER_API}/group`, {
                method: 'DELETE',
                headers: {
                    'content-type': 'application/json',
                    "Authorization": `Bearer ${user_id}`, //user_id as token
                },
                body: JSON.stringify({ groupMembers: group_members, group_id })
            });

            const finalRes = await result.json();

            if (finalRes.failed) {
                show_toast({ status: 'Error', message: 'Failed to delete profile. Please try again.' });
            } else if (!finalRes.updated) {
                show_toast({ status: 'Info', message: 'Profile not deleted. It may not exist.' });
            } else {
                show_toast({ status: 'Success', message: 'Expense profile deleted successfully.' });
                fetch_expense_prof_data(user_id);
            }
        } catch (error) {
            console.log(error);
            show_toast({ status: 'error', message: 'Something went wrong. Please try again later.' });
        } finally {
            set_loading(false);
        }
    }

    useEffect(() => {
        if (user_id) {
            fetch_user(user_id);
            fetch_expense_prof_data(user_id);
        }
    }, []);

    useEffect(() => {
        if (show_create_expense_prof) {
            if (create_prof_pop_ref.current) {
                // create_prof_pop_ref.current.showProfComp();
            }

        }
    }, [show_create_expense_prof]);
    return (
        <div id="main-track-my-expenses" className="flex">
            <Sidebar selectedTab={selectedTab} user_profile_image={user_data?.profile_image} user_name={user_data?.name} friend_request={user_data?.friendRequest_come} />
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

                {/* Expense Profile Section */}
                {!show_selected_exp_prof.show ? <div className="relative">
                    <ExpenseProfilePopup
                        ref={create_prof_pop_ref}
                        server_url={'group'}
                        isGroupPage={true} 
                        user_id={user_id}
                        fetch_expense_prof_data={fetch_expense_prof_data}
                        show_create_expense_prof={show_create_expense_prof}
                        set_show_create_expense_prof={set_show_create_expense_prof}
                        show_toast={show_toast} set_loading={set_loading}
                        friend_list={user_data?.friendList}
                        actual_user_id = {user_data?._id}
                        user_profile_image={user_data?.profile_image}
                        user_name = {user_data?.name}
                    />

                    <div className="flex items-center justify-between m-4">
                        <h1 className="font-bold text-2xl">Expense Profiles</h1>
                        <div onClick={() => { set_show_create_expense_prof(true) }} className="flex w-fit cursor-pointer gap-2 bg-[#f15b42] text-white font-[500] rounded-3xl px-3 py-1.5 hover:scale-105 transition-all duration-500">
                            <PlusIcon className="spin-on-active bg-white rounded-[50%] text-[#f15b42]" />
                            <button className="cursor-pointer">Create New Expense Profile</button>
                        </div>
                    </div>
                    <div id="expense-profile-container" className="h-[100vh] p-4 flex flex-col gap-4">
                        {/* Expense Profile */}
                        {is_empty_prof ?
                            <div className="bg-white p-3 rounded-[10px]">
                                <div className=" rounded-[10px] overflow-hidden text-center" style={{ border: '2px dashed lightslategrey' }}>
                                    <img className="w-[35%] m-auto" src={empty_expense_profile} alt="error" />
                                    <h1 className="my-[1rem] text-[xx-large] font-[600]">Empty Expense Profiles</h1>
                                </div>
                            </div>
                            :
                            exp_prof && exp_prof.map((elm, idx) => (
                                <div key={idx} className="flex items-center bg-white justify-between rounded-[10px] p-4 py-6 hover:scale-101 transition-all cursor-pointer" style={{ boxShadow: "0px 0px 5px -2px #75889a" }}>
                                    <div className="flex gap-4 items-center">
                                        <div className="w-[12%]">
                                            <img className="w-[100%] aspect-square object-cover rounded-[50%]" src={elm.profile_img || dummy_img} alt="error" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <p className="font-bold text-xl">{elm.profile_name}</p>
                                                <p className="text-sm bg-blue-400 text-white px-5 py-0.5 rounded-4xl">₹{elm.total_budget}</p>
                                                {/* <p className="text-sm bg-gray-300  px-5 py-1 rounded-4xl">{elm.expenses.length} Expenses</p> */}
                                                <p className="text-sm text-yellow-200 bg-[#f15b42]  px-5 py-1 rounded-4xl">{elm.expenses_period}</p>
                                            </div>
                                            <p className="text-gray-400 text-sm">Created on {new Date(elm.created_at).toLocaleDateString("en-gb")}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        <button onClick={() => set_show_selected_exp_prof({ show: true, expense_prof: elm, group_id: elm._id })} className="flex items-center bg-[var(--color-emerald-500)] text-white py-[6px] px-[16px] rounded-3xl cursor-pointer hover:bg-[var(--color-indigo-950)] transition-all"><ViewIcon className="me-1 h-[1.3rem]" /> View</button>
                                        <button onClick={() => handle_expense_prof_delete(elm.group_members, elm._id)} className="flex items-center bg-[var(--color-red-600)] text-white py-[6px] px-[16px] rounded-3xl cursor-pointer"><TrashIcon className="me-1 h-[1.3rem]" />Delete</button>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
                    :
                    <GroupExpenses
                        user_id={user_id}
                        actual_user_id = {user_data._id}
                        user_profile_image={user_data.profile_image}
                        user_name={user_data.name}
                        user_friendlist={user_data.friendList}
                        expense_prof={show_selected_exp_prof.expense_prof}
                        group_id={show_selected_exp_prof.group_id}
                        group_name={show_selected_exp_prof.expense_prof.profile_name}
                        set_loading={set_loading}
                        show_toast={show_toast}
                        set_show_selected_exp_prof={set_show_selected_exp_prof}
                    />
                }
            </div>
        </div>
    );
}