import { useEffect, useState, useCallback, useRef } from "react";
import Cookies from 'js-cookie';
import { PlusIcon, ViewIcon, TrashIcon, Calendar, Timer, Plus, InfoIcon, Tag, IndianRupeeIcon, X, Layers, Save, Edit, ArrowDownLeft, ArrowUpRight, View, PiggyBank, BadgeIndianRupee, ChartBarIcon } from 'lucide-react';
import empty_saving_goals from '../../../public/empty.jpg';
import Sidebar from "../Sidebar/sidebar";
import Toast from "../Toast/toast";
import Navbar from "../Homepage/Navbar";
import Loader from "../Loader/loader";
import { MonthlySavingChart } from '../Graphs/graphs';
import ConfirmBox from "../Confirm_Box/confirm_box";

function CreateSavingGoals({ editGoal, setEditGoal, show_create_sav_goal, set_show_create_sav_goal, set_loading, show_toast, set_goal_data }) {
    const user_id = Cookies.get('spending_smart_client');

    const [new_goal_data, set_new_goal_data] = useState({
        user_id: user_id,
        title: '',
        target_amount: 0,
        start_date: new Date().toISOString().slice(0, 10), // 'YYYY-MM-DD'
        target_date: '',
        priority: 'Low',
        description: ''
    });
    const compRef = useRef();

    function handle_clear_form_data() {
        set_new_goal_data({
            user_id: user_id,
            title: '',
            target_amount: 0,
            start_date: new Date().toISOString().slice(0, 10),
            target_date: '',
            priority: '',
            description: ''
        });
    }

    async function create_saving_goal() {
        try {
            set_loading(true);

            if (!new_goal_data.title) {
                show_toast({
                    status: "Fail",
                    message: "Please enter a title for the goal."
                });
            } else if (!new_goal_data.target_amount) {
                show_toast({
                    status: "Fail",
                    message: "Please enter a target amount."
                });
            } else if (!new_goal_data.target_date) {
                show_toast({
                    status: "Fail",
                    message: "Please select a target date."
                });
            } else if (new Date(new_goal_data.target_date) < new Date(new_goal_data.start_date)) {
                show_toast({
                    status: "Fail",
                    message: "Target date cannot be earlier than start date."
                });
            } else if (!new_goal_data.description) {
                show_toast({
                    status: "Fail",
                    message: "Please enter a description for the goal."
                });
            } else {

                const result = await fetch(`${import.meta.env.VITE_SERVER_API}/saving-goals`, {
                    method: 'POST',
                    headers: {
                        "Authorization": `Bearer ${user_id}`, //user_id as token
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify(new_goal_data)
                });
                const finalRes = await result.json();

                if (finalRes.failed) {
                    console.log(finalRes);
                    show_toast({
                        status: "Fail",
                        message: "Failed to create saving goal. Please try again."
                    });
                } else if (!finalRes.created) {
                    show_toast({
                        status: "Info",
                        message: "Goal was not created. Please check your input and try again."
                    });
                } else {
                    show_toast({
                        status: "Success",
                        message: "Saving goal created successfully!"
                    });
                    let newElm = {
                        _id: finalRes.goal_id,
                        title: new_goal_data.title,
                        target_amount: new_goal_data.target_amount,
                        saved_amount: 0,
                        start_date: new_goal_data.start_date,
                        target_date: new_goal_data.target_date,
                        priority: new_goal_data.priority,
                        status: "active",
                        description: new_goal_data.description,
                        contributions: []
                    };

                    set_goal_data((prev) => ([...prev, newElm]));
                    set_show_create_sav_goal(false);
                    handle_clear_form_data();
                }
            }
        } catch (error) {
            console.log(error);
            show_toast({
                status: "Error",
                message: "An unexpected error occurred. Please try again."
            });
        } finally {
            set_loading(false);
        }
    }
    async function handle_save_edit_data() {
        try {
            set_loading(true);

            if (!new_goal_data.title) {
                show_toast({
                    status: "Fail",
                    message: "Please enter a title for the goal."
                });
            } else if (!new_goal_data.target_amount) {
                show_toast({
                    status: "Fail",
                    message: "Please enter a target amount."
                });
            } else if (!new_goal_data.target_date) {
                show_toast({
                    status: "Fail",
                    message: "Please select a target date."
                });
            } else if (new Date(new_goal_data.target_date) < new Date(new_goal_data.start_date)) {
                show_toast({
                    status: "Fail",
                    message: "Target date cannot be earlier than start date."
                });
            } else if (!new_goal_data.description) {
                show_toast({
                    status: "Fail",
                    message: "Please enter a description for the goal."
                });
            } else {
                const result = await fetch(`${import.meta.env.VITE_SERVER_API}/saving-goals`, {
                    method: 'PATCH',
                    headers: {
                        "Authorization": `Bearer ${user_id}`, //user_id as token
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify({ ...new_goal_data, goal_id: editGoal.goal_id })
                });
                const finalRes = await result.json();

                if (finalRes.failed) {
                    console.log(finalRes);
                    show_toast({
                        status: "Fail",
                        message: "Failed to save changes. Please try again later!."
                    });
                } else if (!finalRes.updated) {
                    show_toast({
                        status: "Info",
                        message: "Failed to save changes. Please check your input and try again."
                    });
                } else {
                    show_toast({
                        status: "Success",
                        message: "Successfully updated changes!"
                    });
                    console.log(editGoal.goal_id);
                    set_goal_data((prev) => (
                        prev.map((elm) => (
                            elm._id === editGoal.goal_id ?
                                {
                                    ...elm,
                                    description: new_goal_data.description,
                                    priority: new_goal_data.priority,
                                    start_date: new_goal_data.start_date,
                                    target_amount: new_goal_data.target_amount,
                                    target_date: new_goal_data.target_date,
                                    title: new_goal_data.title,
                                }
                                :
                                elm
                        ))
                    ));

                    set_show_create_sav_goal(false);
                    setEditGoal({ isEdit: false });
                }
            }
        } catch (error) {
            console.log(error);
            show_toast({
                status: "Error",
                message: "An unexpected error occurred. Please try again."
            });
        } finally {
            set_loading(false);
            if (!editGoal.isEdit)
                handle_clear_form_data();
        }
    }
    useEffect(() => {
        const comp = compRef.current;

        if (!comp) return;

        if (!show_create_sav_goal) {
            setTimeout(() => {
                comp.style.display = 'none';
            }, 450);
        } else {
            comp.style.display = 'flex';
        }
    }, [show_create_sav_goal]);

    useEffect(() => {
        if (editGoal.isEdit) {
            set_new_goal_data({
                user_id: user_id,
                title: editGoal.title,
                target_amount: editGoal.target_amount,
                start_date: new Date(editGoal.start_date).toISOString().split('T')[0],
                target_date: new Date(editGoal.target_date).toISOString().split('T')[0],
                priority: editGoal.priority,
                description: editGoal.description
            });
        }
    }, [editGoal]);
    return (
        <div ref={compRef} className="fixed hidden w-[100%] h-[100%] bg-[#000000bf] bg-opacity-60 items-center justify-center z-1000">
            <div style={{ animation: show_create_sav_goal ? 'scaleUp 0.5s ease-out' : 'scaleDown 0.5s ease-out', borderRadius: '10px', overflow: 'hidden' }} className="bg-white h-[75vh] w-[80vh] flex flex-col">
                {/* heading */}
                <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 flex justify-between items-center text-white">
                    <div className="flex gap-2 items-center">
                        {editGoal.isEdit ? <Edit /> : <Layers />}
                        <h1 className="font-[600] text-xl">{editGoal.isEdit ? "Edit Goal" : "Create New Goal"}</h1>
                    </div>
                    <X className="cursor-pointer" onClick={() => { set_show_create_sav_goal(false), handle_clear_form_data() }} />
                </div>
                {/* Body */}
                <div className="p-4 flex flex-col flex-1 gap-4 pb-0">
                    <div className='flex items-center gap-4'>
                        <div>
                            <p>Title</p>
                            <div className="flex items-center gap-4 p-2.5 rounded-lg" style={{ border: '1px solid lightgrey' }}>
                                <InfoIcon className="text-gray-400" />
                                <input type="text" placeholder="Title name..." className="outline-none " value={new_goal_data.title} onChange={(e) => set_new_goal_data((prev) => ({ ...prev, title: e.target.value }))} />
                            </div>
                        </div>
                        <div className="flex-1">
                            <p>Priority</p>
                            <div className="flex items-center gap-[5px] p-0 rounded-lg" style={{ border: '1px solid lightgrey' }}>
                                <InfoIcon className="text-gray-400 ml-[10px]" />
                                <select name="" id="" className="w-[100%] p-[10px] me-[5px] pl-0 pb-[11px] outline-none" value={new_goal_data.priority} onChange={(e) => set_new_goal_data((prev) => ({ ...prev, priority: e.target.value }))}>
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div>
                        <p>Target Amount</p>
                        <div className="flex items-center gap-4 p-2.5 rounded-lg" style={{ border: '1px solid lightgrey' }}>
                            <IndianRupeeIcon />
                            <input type="number" className=" outline-none w-[100%]" placeholder="Target amount..." value={new_goal_data.target_amount} onChange={(e) => set_new_goal_data((prev) => ({ ...prev, target_amount: e.target.value }))} />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div>
                            <p>Start Date</p>
                            <div className="flex items-center gap-4 p-2.5 rounded-lg" style={{ border: '1px solid lightgrey' }}>
                                <Calendar height={20} />
                                <input type="date" className=" outline-none" value={new_goal_data.start_date} onChange={(e) => set_new_goal_data((prev) => ({ ...prev, start_date: e.target.value }))} />
                            </div>
                        </div>
                        <div>
                            <p>Target Date</p>
                            <div className="flex items-center gap-4 p-2.5 rounded-lg" style={{ border: '1px solid lightgrey' }}>
                                <Calendar height={20} />
                                <input type="date" className=" outline-none" value={new_goal_data.target_date} onChange={(e) => set_new_goal_data((prev) => ({ ...prev, target_date: e.target.value }))} />
                            </div>
                        </div>
                    </div>
                    <div>
                        <p>Description</p>
                        <textarea name="" id="" placeholder="Goal description..." className="p-2.5 rounded-lg outline-0" value={new_goal_data.description} style={{ border: '1px solid lightgrey', width: '100%' }} onChange={(e) => set_new_goal_data((prev) => ({ ...prev, description: e.target.value }))}></textarea>
                    </div>
                </div>
                <div className="flex justify-end">
                    <button className="rounded-lg px-[20px] py-[11px] m-[10px] cursor-pointer" style={{ border: '1px solid lightgrey' }} onClick={() => { set_show_create_sav_goal(false), handle_clear_form_data() }}>Cancel</button>
                    {editGoal.isEdit ?
                        <button onClick={handle_save_edit_data} className="rounded-lg px-[20px] py-[11px] m-[10px] cursor-pointer flex items-center gap-1" style={{ border: '1px solid lightgrey' }}> <Save /> Save</button>
                        :
                        <button className="rounded-lg px-[20px] py-[11px] m-[10px] cursor-pointer flex items-center gap-1" style={{ border: '1px solid lightgrey' }} onClick={create_saving_goal}>
                            <Save />
                            Create Goal</button>}
                </div>

            </div>
        </div>
    );
}
function GoalProgress(target_amount, saved_amount) {
    // let t_amount = "";
    // let s_amount = "";
    // // Check if target_amount is an object with $numberDecimal
    // if (typeof target_amount === 'object' && target_amount) {
    //     t_amount = target_amount;
    // } else {
    //     t_amount = target_amount ?? "0"; // fallback if undefined
    // }

    // // Same for saved_amount
    // if (typeof saved_amount === 'object' && saved_amount) {
    //     s_amount = saved_amount;
    // } else {
    //     s_amount = saved_amount ?? "0";
    // }


    // const target = parseFloat(t_amount);
    // const saved = parseFloat(s_amount);

    const target = parseFloat(target_amount);
    const saved = parseFloat(saved_amount);

    const percentage = target > 0 ? Math.min((saved / target) * 100, 100).toFixed(2) : 0;
    const remaining = Math.max(target - saved, 0).toLocaleString('en-IN');

    // Decide color based on percentage
    let progressColor = 'bg-amber-400';
    if (percentage >= 70) {
        progressColor = 'bg-green-500';
    } else if (percentage >= 35) {
        progressColor = 'bg-blue-400';
    }

    return (
        <>
            {/* Progress Bar */}
            <div className="bg-gray-300 h-3 rounded-2xl my-3">
                <div
                    className={`h-3 rounded-2xl ${progressColor}`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>

            {/* Progress Text */}
            <div className="flex justify-between">
                <p className="font-[400] text-sm">{percentage}% Complete</p>
                <p className="font-[400] text-sm">₹{remaining} to go</p>
            </div>
        </>
    );
}
function ShowGoalDetails({ data, show_goal_details, set_show_goal_details }) {
    const compRef = useRef();

    function PriorityTag(priority) {
        let bgColor = "";
        let textColor = "";

        if (priority === "High") {
            bgColor = "bg-red-200";
            textColor = "text-red-600";
        } else if (priority === "Medium") {
            bgColor = "bg-yellow-200";
            textColor = "text-yellow-600";
        } else if (priority === "Low") {
            bgColor = "bg-green-200";
            textColor = "text-green-600";
        }

        return (
            <p className={`${bgColor} ${textColor} text-sm p-1 px-2 rounded-lg`}>
                {priority} Priority
            </p>
        );
    }
    function getDaysRemaining(targetDateString) {
        const today = new Date();
        const targetDate = new Date(targetDateString);

        // Set both dates to midnight for accurate day difference
        today.setHours(0, 0, 0, 0);
        targetDate.setHours(0, 0, 0, 0);

        const timeDiff = targetDate - today;
        const dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        return `${dayDiff >= 0 ? dayDiff : 0} days remaining`;
    }
    useEffect(() => {
        const comp = compRef.current;

        if (!comp) return;

        if (!show_goal_details) {
            setTimeout(() => {
                comp.style.display = 'none';
            }, 450);
        } else {
            comp.style.display = 'flex';
        }
    }, [show_goal_details]);

    return (
        <>
            {data &&
                <div ref={compRef} className="fixed hidden w-[100%] h-[100%] bg-[#000000bf] bg-opacity-60 items-center justify-center z-1000">
                    <div style={{ animation: show_goal_details ? 'scaleUp 0.5s ease-out' : 'scaleDown 0.5s ease-out', borderRadius: '10px', overflow: 'hidden' }} className="bg-white w-[50%] h-[80%] flex flex-col rounded-2xl">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 flex justify-between items-center text-white">
                            <div className="flex gap-2 items-center">
                                <View />
                                <h1 className="font-[600] text-xl">Saving Goal Detials</h1>
                            </div>
                            <X className="cursor-pointer" onClick={() => set_show_goal_details(false)} />
                        </div>
                        <div className="m-6">
                            <div className="flex justify-between">
                                <h1 className="font-[600] text-xl">{data.title}</h1>
                                {data && PriorityTag(data.priority)}
                            </div>
                            <div className="flex justify-between mt-4 items-center">
                                <p className="text-xl">₹{data.saved_amount}</p>
                                <p className="text-gray-400 text-md font-[400]">of ₹{data.target_amount}</p>
                            </div>
                            {GoalProgress(data.target_amount, data.saved_amount)}


                            <div className="flex justify-between mt-2 text-sm">
                                <div className="flex items-center gap-1 text-gray-400">
                                    <Calendar />
                                    <span>Target: {new Date(data.target_date).toLocaleDateString("en-gb")}</span>
                                </div>
                                <div className="flex items-center gap-1 text-gray-400">

                                    <Calendar />
                                    <span>Start Date: {new Date(data.start_date).toLocaleDateString("en-gb")}</span>
                                </div>
                            </div>
                            <div className="flex justify-between mt-2 text-sm">
                                <div className="flex items-center gap-1 text-gray-400">
                                    <Timer />
                                    <span>{getDaysRemaining(data.target_date)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="mx-6 mt-0 mb-4 flex-1 overflow-auto">
                            <div className="text-left">
                                <h1 className="text-xl font-bold">Contribution History</h1>
                            </div>
                            <div id="contrinbution_container" className="px-1 flex flex-col max-h-60 overflow-auto pt-3 pb-10 pe-4">
                                {
                                    data.contributions.map((elm, idx) => (
                                        <div key={idx} className="flex justify-between my-2 items-center" style={{ borderBottom: '1.5px solid #e5e7eb' }}>
                                            <div>
                                                <p className="text-gray-400 text-sm">{new Date(elm.date).toLocaleDateString("en-gb")}</p>
                                            </div>
                                            <div className="">
                                                <span className="text-lg font-[500]">₹{elm.amount}</span>
                                            </div>
                                        </div>
                                    ))
                                }

                            </div>
                            <div className="m-4 text-center">
                                <button onClick={() => set_show_goal_details(false)} className="rounded-lg font-[700] px-[20px] py-[11px] cursor-pointer" style={{ border: '1px solid lightgrey' }}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </>
    );
}
function AddMoney({ goal_id, show_add_money, set_show_add_money, set_loading, show_toast, set_goal_data }) {
    const user_id = Cookies.get('spending_smart_client');

    const [add_money, set_add_money] = useState({
        user_id: user_id,
        amount: '',
        date: new Date().toISOString().slice(0, 10), // 'YYYY-MM-DD',
        note: ''
    });
    const compRef = useRef();

    function handle_clear_form_data() {
        set_add_money({
            user_id: user_id,
            amount: '',
            date: new Date().toISOString().slice(0, 10),
            note: ''
        });
    }

    async function handle_add_money() {
        try {
            set_loading(true);

            if (!add_money.amount) {
                show_toast({
                    status: "Fail",
                    message: "Please enter an amount."
                });
            } else if (!add_money.date) {
                show_toast({
                    status: "Fail",
                    message: "Please select a date."
                });
            } else if (!add_money.note) {
                show_toast({
                    status: "Fail",
                    message: "Please provide some note on contribution."
                });
            } else {
                const result = await fetch(`${import.meta.env.VITE_SERVER_API}/saving-goals/add-money`, {
                    method: 'POST',
                    headers: {
                        "Authorization": `Bearer ${user_id}`, //user_id as token
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify({ ...add_money, goal_id })
                });
                const finalRes = await result.json();

                if (finalRes.failed) {
                    console.log(finalRes);
                    show_toast({
                        status: "Fail",
                        message: "Failed to add money. Please try again later!."
                    });
                } else if (!finalRes.updated) {
                    show_toast({
                        status: "Info",
                        message: "Failed to add money. Please check your input and try again."
                    });
                } else {
                    show_toast({
                        status: "Success",
                        message: "Money Added successfully!"
                    });

                    set_goal_data((prev) => (
                        prev.map((elm) => (
                            elm._id === goal_id ?
                                {
                                    ...elm,
                                    saved_amount: (parseFloat(add_money.amount) + parseFloat(elm.saved_amount)),
                                    status: elm.target_amount === (parseFloat(add_money.amount) + parseFloat(elm.saved_amount)) ? "completed" : "active",
                                    contributions: [...elm.contributions, { contribution_id: finalRes.contribution_id, amount: parseFloat(add_money.amount), date: add_money.date, note: add_money.note }]
                                    // saved_amount: {
                                    //     $numberDecimal: (parseFloat(add_money.amount) + parseFloat(elm.saved_amount)).toString()
                                    // }
                                }
                                :
                                elm
                        ))
                    ));
                    set_show_add_money(false);
                }
            }
        } catch (error) {
            console.log(error);
            show_toast({
                status: "Fail",
                message: "An unexpected error occurred. Please try again."
            });
        } finally {
            set_loading(false);
            handle_clear_form_data();
        }
    }

    useEffect(() => {
        const comp = compRef.current;

        if (!comp) return;

        if (!show_add_money) {
            setTimeout(() => {
                comp.style.display = 'none';
            }, 450);
        } else {
            comp.style.display = 'flex';
        }
    }, [show_add_money]);

    return (
        <div ref={compRef} className="fixed hidden w-[100%] h-[100%] bg-[#000000bf] bg-opacity-60 items-center justify-center z-1000">
            <div style={{ animation: show_add_money ? 'scaleUp 0.5s ease-out' : 'scaleDown 0.5s ease-out', borderRadius: '10px', overflow: 'hidden' }} className="bg-white h-[62vh] w-[45vh] flex flex-col">
                {/* heading */}
                <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 flex justify-between items-center text-white">
                    <div className="flex gap-2 items-center">
                        <PiggyBank />
                        <h1 className="font-[600] text-xl">Add Money</h1>
                    </div>
                    <X className="cursor-pointer" onClick={() => { set_show_add_money(false), handle_clear_form_data() }} />
                </div>
                {/* Body */}
                <div className="p-4 flex flex-col flex-1 gap-4 pb-0 w-fit m-auto">
                    <div>
                        <p>Amount</p>
                        <div className="flex items-center gap-4 p-2.5 rounded-lg" style={{ border: '1px solid lightgrey' }}>
                            <IndianRupeeIcon />
                            <input type="number" className=" outline-none w-[100%]" placeholder="Amount..." value={add_money.amount} onChange={(e) => set_add_money((prev) => ({ ...prev, amount: e.target.value }))} />
                        </div>
                    </div>
                    <div>
                        <p>Date</p>
                        <div className="flex items-center gap-4 p-2.5 rounded-lg" style={{ border: '1px solid lightgrey' }}>
                            <Calendar height={20} />
                            <input type="date" className=" outline-none" value={add_money.date} onChange={(e) => set_add_money((prev) => ({ ...prev, date: e.target.value }))} />
                        </div>
                    </div>
                    <div>
                        <p>Note</p>
                        <textarea name="" id="" placeholder="Some note on contribution..." className="p-2.5 rounded-lg outline-0" style={{ border: '1px solid lightgrey', width: '100%' }} value={add_money.note} onChange={(e) => set_add_money((prev) => ({ ...prev, note: e.target.value }))}></textarea>
                    </div>
                </div>
                <div className="flex justify-center">
                    <button className="rounded-lg px-[20px] py-[11px] m-[10px] cursor-pointer flex items-center gap-1 mb-4" style={{ border: '1px solid lightgrey' }} onClick={handle_add_money}>
                        <BadgeIndianRupee />
                        Add</button>
                </div>

            </div>
        </div>
    );
}

export default function SavingGoals() {
    const selectedTab = "savinggoals";
    const [loading, set_loading] = useState(false);
    const [user_data, set_user_data] = useState();
    const [toast_data, show_toast] = useState({
        status: '',
        message: ''
    });
    const [show_create_sav_goal, set_show_create_sav_goal] = useState(false);
    const [show_goal_details, set_show_goal_details] = useState(false);
    const [show_add_money, set_show_add_money] = useState(false);
    const [goal_data, set_goal_data] = useState([]);
    const [view_goal_data, set_view_goal_data] = useState();
    const [selected_goal_id, set_goal_id] = useState();
    const [editGoal, setEditGoal] = useState({ isEdit: false });
    const [total_saved_amount, set_total_saved_amount] = useState(0);
    const [confirmModal, show_confirm_modal] = useState({ show: false, type: "", message: "", onConfirm: null });
    const [active_count, set_active_count] = useState(0);
    const [completed_count, set_completed_count] = useState(0);
    const [total_saved, set_total_saved] = useState(0);
    const [show_analysis, set_show_analysis] = useState(false);

    const user_id = Cookies.get('spending_smart_client');

    const fetch_user = useCallback(async () => {
        try {
            set_loading(true);

            const response = await fetch(`${import.meta.env.VITE_SERVER_API}/user`, {
                method: 'GET',
                headers: {
                    "Authorization": `Bearer ${user_id}`, //user_id as token
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

    }, [user_id]);

    const fetch_goals = useCallback(async () => {
        try {
            set_loading(true);

            const response = await fetch(`${import.meta.env.VITE_SERVER_API}/saving-goals`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${user_id}`, //user_id as token
                }
            });
            const result = await response.json();

            if (result.failed) {
                console.log(result.error);
                show_toast({
                    status: "Error",
                    message: "Failed to fetch saving goals."
                });
            } else if (result.notFound) {
                show_toast({
                    status: "Info",
                    message: "No saving goals found for this user."
                });
            } else {
                set_goal_data(result.goals);
                show_toast({
                    status: "Success",
                    message: "Saving goals fetched successfully!"
                });
            }
        } catch (error) {
            console.log(error);
            show_toast({
                status: "Error",
                message: "An error occurred while fetching goals."
            });
        } finally {
            set_loading(false);
        }
    }, [user_id]);

    function formatDateToReadable(dateString) {
        const date = new Date(dateString);

        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };

        return date.toLocaleDateString('en-US', options);
    }
    function getDaysRemaining(targetDateString) {
        const today = new Date();
        const targetDate = new Date(targetDateString);

        // Set both dates to midnight for accurate day difference
        today.setHours(0, 0, 0, 0);
        targetDate.setHours(0, 0, 0, 0);

        const timeDiff = targetDate - today;
        const dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        return `${dayDiff >= 0 ? dayDiff : 0} days remaining`;
    }

    function PriorityTag(priority) {
        let bgColor = "";
        let textColor = "";

        if (priority === "High") {
            bgColor = "bg-red-200";
            textColor = "text-red-600";
        } else if (priority === "Medium") {
            bgColor = "bg-yellow-200";
            textColor = "text-yellow-600";
        } else if (priority === "Low") {
            bgColor = "bg-green-200";
            textColor = "text-green-600";
        }

        return (
            <p className={`${bgColor} ${textColor} text-sm p-1 px-2 rounded-lg`}>
                {priority} Priority
            </p>
        );
    }
    function AnalyzeGoals(goals) {
        let activeCount = 0;
        let completedCount = 0;
        let totalSaved = 0;

        goals.forEach(goal => {
            // Count active and completed goals
            if (goal.status === "active") {
                activeCount++;
            } else if (goal.status === "completed") {
                completedCount++;
            }

            // Add saved amount
            if (goal.saved_amount && goal.saved_amount) {
                totalSaved += parseFloat(goal.saved_amount);
            }
        });

        set_total_saved_amount(totalSaved);
        set_active_count(activeCount);
        set_completed_count(completedCount);
        set_total_saved(totalSaved);
    }

    async function handle_goal_delete(goal_id) {
        try {
            set_loading(true);

            const response = await fetch(`${import.meta.env.VITE_SERVER_API}/saving-goals`, {
                method: 'DELETE',
                headers: {
                    "Authorization": `Bearer ${user_id}`, //user_id as token
                    'content-type': 'application/json',
                },
                body: JSON.stringify({ goal_id }),
            });

            const result = await response.json();

            if (result.failed) {
                show_toast({
                    status: "fail",
                    message: "Failed to delete the saving goal. Please try again.",
                });
            } else if (!result.updated) {
                show_toast({
                    status: "info",
                    message: "Goal was not updated. It may not exist or has already been deleted.",
                });
            } else {
                show_toast({
                    status: "success",
                    message: "Saving goal deleted successfully.",
                });
                set_goal_data((prev) => prev.filter((elm) => elm._id !== goal_id));
            }
        } catch (error) {
            console.log(error);
            show_toast({
                status: "fail",
                message: "An unexpected error occurred while deleting the goal.",
            });
        } finally {
            set_loading(false);
            show_confirm_modal({ show: false, type: "", message: "", onConfirm: null });
        }
    }

    useEffect(() => {
        if (goal_data.length > 0) {
            console.log(goal_data);
            AnalyzeGoals(goal_data);
        }
    }, [goal_data]);

    useEffect(() => {
        if (user_id) {
            fetch_user();
            fetch_goals();
        }
    }, []);

    return (
        <div id="main-saving-goals" className="flex">

            <Sidebar selectedTab={selectedTab} user_profile_image={user_data?.profile_image} user_name={user_data?.name} />
            {toast_data.message && <Toast toast_data={toast_data} />}
            {loading ? <Loader /> : ''}
            <AddMoney set_show_add_money={set_show_add_money} show_add_money={show_add_money} set_loading={set_loading} show_toast={show_toast} goal_id={selected_goal_id} set_goal_data={set_goal_data} />
            <CreateSavingGoals setEditGoal={setEditGoal} editGoal={editGoal} show_create_sav_goal={show_create_sav_goal} set_show_create_sav_goal={set_show_create_sav_goal} set_loading={set_loading} show_toast={show_toast} set_goal_data={set_goal_data} />
            <ShowGoalDetails data={view_goal_data} show_goal_details={show_goal_details} set_show_goal_details={set_show_goal_details} />
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
                {/* <Navbar user_profile_image={user_data?.profile_image} friend_request={user_data?.friendRequest_come}/> */}
                <div className="flex items-center justify-between">
                    <div className="m-4">
                        <p className=" text-2xl">Saving Goals</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <div class="flex w-fit cursor-pointer gap-2 bg-[#6b8e23] text-white font-semibold rounded-3xl px-3 py-1.5 hover:scale-105 hover:bg-[#526c1e] transition-all duration-300">
                            <ChartBarIcon className="text-white w-5 h-5" /> {/* Chart or graph icon for analysis */}
                            <button class="cursor-pointer" onClick={()=>set_show_analysis(true)}>Analysis</button>
                        </div>
                        <div onClick={() => set_show_create_sav_goal(true)} className="flex bg-gradient-to-r from-orange-500 to-red-500 text-yellow-200 items-center gap-4 py-3 rounded-[30px_0px_0px_30px] pl-4 pe-4 cursor-pointer hover:pe-20 transition-all" style={{ fontWeight: '500' }}>
                            <PlusIcon />
                            <span>Add New Goal</span>
                        </div>
                    </div>
                </div>
                {goal_data && (
                    <div className="flex justify-between mx-20">
                        <div className="m-4 flex-1 bg-white p-4 rounded-xl shadow-[0px_0px_3px_0px_lightgrey]">
                            <p className="text-gray-400">Total Savings</p>
                            <p className="text-2xl mt-3">₹{total_saved}</p>
                        </div>
                        <div className="m-4 flex-1 bg-white p-4 rounded-xl shadow-[0px_0px_3px_0px_lightgrey]">
                            <p className="text-gray-400">Active Goals</p>
                            <p className="text-2xl mt-3">{active_count}</p>
                        </div>
                        <div className="m-4 flex-1 bg-white p-4 rounded-xl shadow-[0px_0px_3px_0px_lightgrey]">
                            <p className="text-gray-400">Completed Goals</p>
                            <p className="text-2xl mt-3">{completed_count}</p>
                        </div>
                    </div>
                )}

                {/* {goal_data && <AnalyzeGoals goals={goal_data} set_total_saved_amount={set_total_saved_amount} />} */}
                {(goal_data != null && goal_data?.length > 0) ?
                    <div>
                        <div className="saving-goal-con flex flex-wrap py-6 px-4 gap-6 justify-start">
                            {goal_data.map((goal, idx) => (
                                <div key={idx} className=" relative saving-goal-card bg-white p-6 w-[22rem] rounded-xl pb-5" style={{ boxShadow: "0px 0px 5px -2px #75889a" }}>
                                    <div
                                        onClick={() => {
                                            setEditGoal({
                                                description: goal.description,
                                                priority: goal.priority,
                                                start_date: goal.start_date,
                                                target_date: goal.target_date,
                                                target_amount: goal.target_amount,
                                                title: goal.title,
                                                user_id: goal.user_id,
                                                isEdit: true,
                                                goal_id: goal._id
                                            }),
                                                set_show_create_sav_goal(true)
                                        }}
                                        className="bg-[#f15b42] w-fit text-yellow-200 p-1 rounded-[50%] absolute top-[-3%] right-[-4%] cursor-pointer hover:scale-110 transition-all"
                                    >
                                        <Edit />
                                    </div>
                                    <div className="flex justify-between">
                                        <h1 className="font-[600] text-xl">{goal.title}</h1>
                                        {goal_data && PriorityTag(goal.priority)}
                                    </div>
                                    <div className="flex justify-between mt-4 items-center">
                                        <p className="text-xl">₹{goal.saved_amount}</p>
                                        <p className="text-gray-400 text-md font-[400]">of ₹{goal.target_amount}</p>
                                    </div>
                                    {GoalProgress(goal.target_amount, goal.saved_amount)}
                                    <div className="mt-2 text-sm">
                                        <div className="flex items-center gap-1 text-gray-400">
                                            <Calendar />
                                            <span className="text-sm">Target: {formatDateToReadable(goal.target_date)}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-400 mt-2">
                                            <Timer />
                                            <span className="text-sm">{getDaysRemaining(goal.target_date)}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between mt-5 gap-4 text-sm">
                                        <button onClick={() => { set_show_add_money(true), set_goal_id(goal._id) }} className="flex items-center gap-1 bg-[#f15b42] pl-2 pe-4 py-2 rounded-md text-yellow-200 cursor-pointer font-[600] hover:bg-[#cf4932]"><Plus className="ml-0" />Add</button>
                                        <button onClick={() => { set_view_goal_data(goal), set_show_goal_details(true) }} className="flex items-center gap-1  bg-white pl-2 pe-4 py-2 rounded-md border border-gray-300 cursor-pointer font-[600]"><ViewIcon />View</button>
                                        <button onClick={() => show_confirm_modal({ show: true, type: "remove", message: "Are you sure?", onConfirm: () => handle_goal_delete(goal._id) })} className="flex items-center gap-1  bg-white pl-2 pe-4 py-2 rounded-md border border-gray-300 cursor-pointer font-[600]"><TrashIcon />Delete</button>
                                    </div>
                                </div>
                            ))
                            }
                        </div>
                        {(goal_data && show_analysis) && <MonthlySavingChart goal_data={goal_data} total_saved_amount={total_saved_amount} />}
                    </div>
                    :
                    <div className="bg-white p-3 rounded-[10px]">
                        <div className=" rounded-[10px] overflow-hidden text-center" style={{ border: '2px dashed lightslategrey' }}>
                            <img className="w-[35%] m-auto" src={empty_saving_goals} alt="error" />
                            <h1 className="my-[1rem] text-[xx-large] font-[600]">Empty Saving Goals</h1>
                        </div>
                    </div>
                }
                {confirmModal.show && <ConfirmBox
                    show={confirmModal.show}
                    type={confirmModal.type}
                    message={confirmModal.message}
                    onConfirm={confirmModal.onConfirm}
                    show_confirm_modal={show_confirm_modal}
                />}
            </div>
        </div>
    );
}