import { useEffect, useRef, useState } from "react";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import dummy_image from "../../../public/dummy_image.webp";
import empty_expense_list from '../../../public/empty.jpg';
import { PlusIcon, ArrowBigLeftDashIcon, ChartBarIcon, SearchIcon, FileSpreadsheet, ChevronDown, ChevronRight, Users, Calendar, IndianRupee, FileText, HandCoins, Send, Check, Clock, AlertCircle, Split, SplitIcon, X } from "lucide-react";

import DataTable from 'react-data-table-component';
import {
    MonthlyDailyAverage,
    CatSubCatExpComparison,
    ExpenseCategoryDonut,
    MonthlyExpenseChart,
    MonthlyWeekChart,
    YearlyExpenseChart
} from '../Graphs/graphs';
import GroupExpenseCreator from "./group_expeses_creator";
import Footer from "../Homepage/Footer";
import GroupMembersDropdown from "./group_members";
import ConfirmBox from '../Confirm_Box/confirm_box';


const CustomAccordionComponent = ({ data, onRowClick, currentPage = 1, rowsPerPage = 10 }) => {
    const [expandedRows, setExpandedRows] = useState(new Set());

    // Toggle accordion expansion
    const toggleAccordion = (id) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Format currency
    const formatCurrency = (amount) => {
        const value = amount || amount || 0;
        return `₹${parseFloat(value).toLocaleString()}`;
    };

    // Handle pagination (if needed)
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedData = data.slice(startIndex, endIndex);

    return (
        <div className="space-y-3">
            {paginatedData.map((item, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {/* Accordion Header */}
                    <div
                        className="p-4 cursor-pointer flex items-center justify-between hover:bg-gray-50 transition-colors active:bg-gray-100"
                        onClick={() => {
                            toggleAccordion(item._id);
                            if (onRowClick) onRowClick(item);
                        }}
                    >
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3">
                                {/* Profile Icon */}
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                    </div>
                                </div>

                                {/* Main Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-semibold text-gray-900 truncate">
                                        {item.name}
                                    </h3>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <span className="text-sm font-medium text-green-600">
                                            {formatCurrency(item.amount)}
                                        </span>
                                        <span className="text-gray-300">•</span>
                                        <span className="text-sm text-gray-500">
                                            {item.splitDetails?.length || 0} members
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Expand/Collapse Icon */}
                        <div className="flex-shrink-0 ml-2">
                            {expandedRows.has(item._id) ? (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                            ) : (
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            )}
                        </div>
                    </div>

                    {/* Accordion Content */}
                    {expandedRows.has(item._id) && (
                        <div className="border-t border-gray-100 bg-gray-50">
                            <div className="p-4 space-y-4">

                                {/* Budget Section */}
                                <div className="flex items-start space-x-3">
                                    <IndianRupee className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">Budget Details</p>
                                        <p className="text-lg font-semibold text-green-600 mt-1">
                                            {formatCurrency(item.amount)}
                                        </p>
                                    </div>
                                </div>

                                {/* Members Section */}
                                {item.splitDetails && item.splitDetails.length > 0 && (
                                    <div className="flex items-start space-x-3">
                                        <Users className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900 mb-3">
                                                Group Members ({item.splitDetails.length})
                                            </p>
                                            <div className="space-y-2">
                                                {item.splitDetails.map((member) => (
                                                    <div key={member.user_id} className="flex items-center space-x-2">
                                                        <img
                                                            className="h-6 w-6 rounded-full object-cover flex-shrink-0"
                                                            src={member.profile_image || dummy_image}
                                                            alt={member.name}
                                                        />
                                                        <span className="text-sm text-gray-700 truncate">
                                                            {member.name}
                                                        </span>
                                                        <span className="text-sm text-gray-700 truncate">
                                                            {formatCurrency(member.amount)}
                                                        </span>
                                                        <span className="text-sm text-gray-700 truncate">
                                                            {member.paymentStatus}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Description Section */}
                                {item.description && (
                                    <div className="flex items-start space-x-3">
                                        <FileText className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">Description</p>
                                            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Dates Section */}
                                <div className="flex items-start space-x-3">
                                    <Clock className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900 mb-2">Timeline</p>
                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                            <div>
                                                <p className="font-medium text-gray-500 uppercase tracking-wide">Created</p>
                                                <p className="text-gray-900 mt-1">{formatDate(item.created_at)}</p>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-500 uppercase tracking-wide">Updated</p>
                                                <p className="text-gray-900 mt-1">{formatDate(item.updated_at)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}
                </div>
            ))}

        </div>
    );
};

const SplitActionsComponent = ({show_confirm_modal, expense, show_split_details, set_show_split_details, show_toast, set_loading, admin_id, actual_user_id, user_id, user_name, user_profile_image, group_id, groupName }) => {
    // const [sendingTo, setSendingTo] = useState(null);
    if (!expense) {
        return;
    } else if (expense.length == 0) {
        return;
    }

    const currentExpense = expense;

    const formatDate = (dateObj) => {
        if (!dateObj || !dateObj) return '';
        return new Date(dateObj).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return `₹${amount.toLocaleString()}`;
    };

    const getStatusBadge = (status) => {
        const baseClasses = "px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5";

        if (status === 'Paid') {
            return (
                <span className={`${baseClasses} bg-green-100 text-green-800 border border-green-200`}>
                    <Check size={14} />
                    Paid
                </span>
            );
        } else {
            return (
                <span className={`${baseClasses} bg-orange-100 text-orange-800 border border-orange-200`}>
                    <Clock size={14} />
                    Pending
                </span>
            );
        }
    };

    const getPendingUsers = () => {
        return currentExpense.splitDetails.filter(user => user.paymentStatus === 'Pending');
    };

    const getTotalPending = () => {
        return getPendingUsers().reduce((sum, user) => sum + user.amount, 0);
    };

    const pendingUsers = getPendingUsers();
    const totalPending = getTotalPending();
    const isSettled = currentExpense.isSettled.confirm;
    const compRef = useRef();

    async function handle_money_request(expense_id, expName, date, amount, member) {
        try {
            if (!expense_id) {
                console.log("Missing Field: expense_id");
                return;
            } else if (!expName) {
                console.log("Missing Field: expName");
                return;
            } else if (!amount) {
                console.log("Missing Field: amount");
                return;
            } else if (!member) {
                console.log("Missing Field: member");
                return;
            }

            const response = await fetch(`${import.meta.env.VITE_SERVER_API}/user/send-money-request`, {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    "Authorization": `Bearer ${user_id}`, //user_id as token
                },
                body: JSON.stringify({
                    group_id,
                    member,
                    from: "Group Expenses",
                    user_profile_image,
                    user_name,
                    expense_id,
                    expName,
                    date,
                    amount,
                    groupName
                })
            });
            const result = await response.json();

            if (result.failed) {
                console.log(result);
                show_toast({ status: "Fail", message: "Failed to send money request, Try again later!" });
            } else if (!result.created) {
                show_toast({ status: "Fail", message: "Failed to send money request, Try again!" });
            } else {
                show_toast({ status: "Success", message: "Send money request successfully!" });
                // if(exp_data){
                //     const data = exp_data.map((exp) => (exp.expense_id === expense_id ? { ...exp, splitDetails:[...exp.splitDetails, ]} : exp));
                //     set_exp_data(data);
                // }
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            }

        } catch (error) {
            console.log("Error while sending money request: " + error);
            show_toast({ status: "Fail", message: "Failed to send money request, Try again later!" });
        } finally {
            set_loading(false);
        }
    }

    async function handle_money_request_all(expense_id, expName, date, amount, splitDetails, isSettled) {
        try {
            splitDetails = splitDetails.filter((elm) => elm.paymentStatus != "Paid");

            if (isSettled.confirm) {
                show_toast({ status: "Info", message: "All payments for this expense are already settled." });
                return;
            }
            const isAllRequested = splitDetails.every((elm) => elm.money_requested == true);

            if (isAllRequested) {
                show_toast({ status: "Info", message: "You already send money request..." });
                return;
            }
            splitDetails = splitDetails.filter((elm)=> elm.money_requested === false);

            const response = await fetch(`${import.meta.env.VITE_SERVER_API}/user/send-money-request/all`, {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    "Authorization": `Bearer ${user_id}`, //user_id as token
                },
                body: JSON.stringify({
                    group_id,
                    splitDetails,
                    from: "Group Expenses",
                    user_profile_image,
                    user_name,
                    expense_id,
                    expName,
                    date,
                    amount,
                    groupName
                })
            });
            const result = await response.json();

            if (result.failed) {
                console.log(result);
                show_toast({ status: "Fail", message: "Failed to send money request, Try again later!" });
            } else if (!result.created) {
                show_toast({ status: "Fail", message: "Failed to send money request, Try again!" });
            } else {
                show_toast({ status: "Success", message: "Send money request successfully!" });
                // if (exp_data) {
                //     const data = exp_data.map((exp) => (exp.expense_id === expense_id ? { ...exp, isRequestedMoney: true } : exp));
                //     set_exp_data(data);
                // }
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            }

        } catch (error) {
            console.log("Error while sending money request: " + error);
            show_toast({ status: "Fail", message: "Failed to send money request, Try again later!" });
        } finally {
            set_loading(false);
        }
    }

    async function handle_isSettled(expense_id, splitDetails) {
        try {
            set_loading(true);
            const result = await fetch(`${import.meta.env.VITE_SERVER_API}/group/group-expenses/update-isSettled`, {
                method: "PATCH",
                headers: {
                    'content-type': 'application/json',
                    "Authorization": `Bearer ${user_id}`, //user_id as token
                },
                body: JSON.stringify({
                    group_id,
                    expense_id,
                    splitDetails
                })
            });

            const finalRes = await result.json();

            if (finalRes.failed) {
                console.log(finalRes);
                show_toast({ status: "Fail", message: "Something went wrong!" });
            } else if (!finalRes.updated) {
                show_toast({ status: "Info", message: "Failed to upated isSettled. Try again!" });
            } else {
                show_toast({ status: "Success", message: "IsSettled Successfully Updated!" });
                // fetch_expense_list_data();
                // set_exp_data((prev) => {
                //     const arr = prev.map((elm) => {
                //         if (elm.expense_id == expense_id) {
                //             const old_splitDetails = elm.splitDetails;
                //             const newSD = old_splitDetails.map((sd) => ({ ...sd, paymentStatus: "Paid" }));

                //             return { ...elm, splitDetails: newSD, isSettled: { confirm: true, paymentMode: "Cash" } };
                //         }
                //         return elm;
                //     });
                //     return arr;
                // });
                setTimeout(()=>{
                    window.location.reload();
                },500);
            }
        } catch (error) {
            console.error(error);
            show_toast({ status: "Fail", message: "Network error. Please try again later." });
        } finally {
            set_loading(false);
            show_confirm_modal({ show: false, type: "", message: "", onConfirm: null });
        }
    }

    useEffect(() => {
        const comp = compRef.current;
        if (!comp) return;

        const split_details_con = comp.querySelector('.split-details-con');
        if (!split_details_con) return;

        if (show_split_details) {
            split_details_con.style.animation = "topToDown 0.8s ease-in";
            comp.style.display = "block";
        } else {
            split_details_con.style.animation = "DownTotop 0.8s ease-in";
            setTimeout(() => {
                comp.style.display = "none";
            }, 800);
        }
    }, [show_split_details]);


    return (
        <div ref={compRef} className="hidden fixed top-0 left-0 z-1000 w-[100%] h-[100%] bg-[#000000ab]">
            <div className="fixed top-[50%] left-[50%] split-details-con" style={{ transform: "translate(-50%, -50%)", borderRadius: "10px", overflow: 'hidden' }}>
                <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-white text-xl font-semibold flex items-center">
                        <SplitIcon className="me-1" />
                        Split Details
                    </h2>
                    <button className="text-white focus:outline-none cursor-pointer"
                        onClick={() => set_show_split_details(false)}
                    >
                        <X />
                    </button>
                </div>
                <div className="max-w-4xl mx-auto p-6 space-y-6 bg-white h-[80vh] flex flex-col justify-between overflow-auto">
                    {/* Quick Actions Section */}
                    {!isSettled && pendingUsers.length > 0 && (
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Quick Actions</h3>
                                    <p className="text-sm text-gray-600">Send payment requests to users</p>
                                </div>
                                <button
                                    onClick={() => actual_user_id === currentExpense.paidBy?.user_id ? handle_money_request_all(currentExpense.expense_id, currentExpense.name, currentExpense.updated_at, currentExpense.amount, currentExpense.splitDetails, currentExpense.isSettled) : show_toast({ status: "Info", message: `This money request can be done by only ${currentExpense.paidBy?.name}` })}
                                    className="p-2.5 mt-4 w-fit cursor-pointer text-[13px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
                                >
                                    {/* <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> */}
                                    <Send size={16} />
                                    Request All ({formatCurrency(totalPending)})
                                </button>

                                { !currentExpense.isSettled.confirm && <button
                                    onClick={()=>{admin_id === actual_user_id? show_confirm_modal({show: true, type:'sure', message:'Are you sure you want to mark this entire expense as settled? This will confirm that all dues have been cleared.', onConfirm: ()=>handle_isSettled(currentExpense.expense_id, currentExpense.splitDetails)}) : show_toast({status:"Info", message:"This action can only be performed by an admin."}) }}
                                    className="p-2.5 mt-4 w-fit cursor-pointer text-[13px]  bg-gradient-to-br from-gray-900 to-gray-800 shadow-lg text-white rounded-lg  disabled:opacity-50 flex items-center gap-2 transition-colors"
                                >
                                    {/* <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> */}
                                    <IndianRupee size={16} />
                                    Is Settled?
                                </button>}
                            </div>
                        </div>
                    )}

                    {/* Split Details Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-xl font-semibold text-gray-900">Payment Details</h3>
                        </div>

                        <div className="divide-y divide-gray-100 max-h-[45vh] overflow-auto">
                            {currentExpense.splitDetails.map((user, index) => (
                                <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={user.profile_image}
                                                alt={user.name}
                                                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                                                onError={(e) => {
                                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&size=48`;
                                                }}
                                            />
                                            <div>
                                                <div className="font-semibold text-gray-900">{user.name}</div>
                                                {user.paidAt && (
                                                    <div className="text-sm text-gray-500">
                                                        Paid on {formatDate(user.paidAt)}
                                                    </div>
                                                )}
                                                {user.transactionId && (
                                                    <div className="text-xs text-gray-400 font-mono">
                                                        TX: {user.transactionId.slice(-8)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="text-md ml-2 font-bold text-gray-900">{formatCurrency(user.amount)}</div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {getStatusBadge(user.paymentStatus)}

                                                {user.paymentStatus === 'Pending' && !isSettled && (
                                                    <button
                                                        onClick={() => {
                                                            if (actual_user_id === currentExpense.paidBy?.user_id) {
                                                                if (user.money_requested || currentExpense.isSettled.confirm) {
                                                                    show_toast({ status: "Info", message: "You already sent money request..." });
                                                                } else {
                                                                    handle_money_request(
                                                                        currentExpense.expense_id,
                                                                        currentExpense.name,
                                                                        currentExpense.updated_at,
                                                                        currentExpense.amount,
                                                                        user,
                                                                        currentExpense.isSettled
                                                                    );
                                                                }
                                                            } else {
                                                                show_toast({
                                                                    status: "Info",
                                                                    message: `This money request can be done by only ${currentExpense.paidBy?.name}`
                                                                });
                                                            }
                                                        }}

                                                        className={`p-2 ${user.money_requested || currentExpense.isSettled.confirm?"text-gray-600 border-gray-200 hover:border-gray-300":"text-blue-600 hover:bg-blue-50 border-blue-200 hover:border-blue-300"}  rounded-lg transition-colors disabled:opacity-50 border`}
                                                        title={`Send money request to ${user.name}`}
                                                    >
                                                        {/* <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div> */}
                                                        <Send size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Settlement Status Section */}
                    {isSettled ? (
                        <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center gap-2 text-green-800 font-semibold mb-2">
                                <Check size={20} />
                                Expense Fully Settled
                            </div>
                            <div className="text-green-700">
                                Payment Method: {currentExpense.isSettled.paymentMode} •
                                Settled on {formatDate(currentExpense.isSettled.settledAt)}
                            </div>
                        </div>
                    ) : pendingUsers.length > 0 && (
                        <div className="p-6 bg-orange-50 rounded-lg border border-orange-200">
                            <div className="flex items-center gap-2 text-orange-800 font-semibold mb-2">
                                <AlertCircle size={20} />
                                Outstanding Payments
                            </div>
                            <div className="text-orange-700">
                                {pendingUsers.length} user{pendingUsers.length > 1 ? 's' : ''} still owe a total of {formatCurrency(totalPending)}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


export default function GroupExpenses({ expense_prof, actual_user_id, user_id, user_profile_image, user_name, user_friendlist, group_id, group_name, set_loading, show_toast, set_show_selected_exp_prof }) {
    const [is_exp_empty, set_is_exp_empty] = useState(null);
    const [show_create_exp_list, set_show_create_exp_list] = useState(false);
    const [exp_data, set_exp_data] = useState([]);
    const [cal, setCal] = useState({
        total: 0,
        avg: 0,
        max: 0
    });
    const [exp_cat_amount, set_exp_cat_amount] = useState([]);
    const [exp_subcat_amount, set_exp_subcat_amount] = useState([]);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [edit_expense, set_edit_expense] = useState({
        expense: '',
        edit_exp: false
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [show_create_expense, set_show_create_expense] = useState(false);
    const [confirmModal, show_confirm_modal] = useState({
        show: false,
        type: '',
        message: '',
        onConfirm: null
    });
    const [selected_expense, set_selected_expense] = useState([]);
    const [show_split_details, set_show_split_details] = useState(false);

    const chartRef = useRef();

    const customStyles = {
        header: {
            style: {
                //   fontSize: '18px',
                fontWeight: 'bold',
                //   color: '#374151', // text-gray-700
                backgroundColor: 'white', // light gray
                //   padding: '12px 16px',
                marginTop: '1rem'
            },
        },
        rows: {
            style: {
                minHeight: '52px',
                fontSize: '15px',
                color: '#374151', // text-gray-700
                backgroundColor: 'white',
                borderBottom: '1px solid #E5E7EB', // border-gray-300
            },
            highlightOnHoverStyle: {
                backgroundColor: '#FFF7ED', // light orange on hover
                borderBottomColor: '#F97316', // orange-500
                outline: 'none',
            },
        },
        headCells: {
            style: {
                fontSize: '16px',
                fontWeight: '600',
                backgroundColor: '#f15b42', // light gray
                color: 'oklch(94.5% 0.129 101.54)', // text-gray-500
                borderBottom: '1px solid red' // border-gray-300
            },
        },
        cells: {
            style: {
                //   padding: '10px 12px',
                fontWeight: '500'
            },
        },
    };

    const columns = [
        {
            name: 'S.No.',
            cell: (row, index, column, id) => String((currentPage - 1) * rowsPerPage + index + 1) + ".",
            width: '4%',
            sortable: false
        },
        {
            name: 'Name',
            selector: row => row.name,
            sortable: true,
            width: '8%'
        },
        {
            name: 'Category',
            selector: row => row.category,
            sortable: true,
            width: '9%'
        },
        {
            name: 'Sub-Category',
            selector: row => row.subCategory,
            // width: '10rem',
            sortable: true,
            width: '9%'
        },
        {
            name: 'Amount',
            selector: row => "₹" + parseFloat(row.amount || row.amount || 0).toFixed(2),
            sortable: true,
            right: true,
            width: '10%'
        },
        {
            name: 'Date',
            selector: row => new Date(row.created_at).toLocaleDateString("en-gb"),
            sortable: true,
            width: '10%'
        },
        {
            name: 'Last Updated',
            selector: row => new Date(row.updated_at).toLocaleDateString("en-gb"),
            sortable: true,
            width: '10%'
        },
        {
            name: 'Description',
            selector: row => row.description,
            width: '10%'
        },
        {
            name: "Split Details",
            cell: (row) => (
                <button onClick={() => { set_selected_expense(row), set_show_split_details(true) }} className="text-yellow-200 bg-[#f15b42] px-4 py-1 rounded-4xl cursor-pointer">View</button>
            ),
            width: "10%",
        },
        {
            name: 'Paid By',
            selector: row => row.paidBy.name,
            width: '9%'
        }
        ,
        {
            name: 'Actions',
            cell: (row) => (
                <div className="flex gap-2 justify-center items-center">
                    {/* <button
                        className="p-1 hover:bg-blue-100 rounded cursor-pointer"
                        title="Request Money back"
                        onClick={() => actual_user_id === row.paidBy?.user_id ? handle_money_request(row.expense_id, row.name, row.updated_at, row.amount, row.splitDetails, row.isRequestedMoney, row.isSettled) : show_toast({ status: "Info", message: `This money request can be done by only ${row.paidBy?.name}` })}
                    >
                        <HandCoins />
                    </button> */}
                    <button
                        className="p-1 hover:bg-green-100 rounded cursor-pointer"
                        // onClick={() => { set_edit_expense({ expense: row, edit_exp: true }), set_show_create_exp_list(true) }}
                        onClick={() => { actual_user_id === expense_prof.admin_id ? set_edit_expense({ expense: row, edit_exp: true }) : show_toast({ status: "Info", message: "Only Admin can edit expense..." }) }}
                        title="Edit expense"
                    >
                        <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill="#6b8e23">
                            <path d='m7 17.013 4.413-.015 9.632-9.54c.378-.378.586-.88.586-1.414s-.208-1.036-.586-1.414l-1.586-1.586c-.756-.756-2.075-.752-2.825-.003L7 12.583v4.43zM18.045 4.458l1.589 1.583-1.597 1.582-1.586-1.585 1.594-1.58zM9 13.417l6.03-5.973 1.586 1.586-6.029 5.971L9 15.006v-1.589z' />
                            <path d='M5 21h14c1.103 0 2-.897 2-2v-8.668l-2 2V19H8.158c-.026 0-.053.01-.079.01-.033 0-.066-.009-.1-.01H5V5h6.847l2-2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2z' />
                        </svg>
                    </button>

                    <button
                        className="p-1 hover:bg-red-100 rounded cursor-pointer"
                        onClick={() => actual_user_id === expense_prof.admin_id ? show_confirm_modal({ show: true, type: "remove", message: "Are you sure?", onConfirm: () => handle_delete(row.expense_id) }) : show_toast({ status: "Info", message: "Only Admin can delete expense.." })}
                        title="Delete expense"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#F44336" viewBox="0 0 24 24">
                            <path d="M5 20a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8h2V6h-4V4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2H3v2h2zM9 4h6v2H9zM8 8h9v12H7V8z" />
                            <path d="M9 10h2v8H9zm4 0h2v8h-2z" />
                        </svg>
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: '11%'
        }
    ];

    async function fetch_expense() {
        set_loading(true);
        try {
            const result = await fetch(`${import.meta.env.VITE_SERVER_API}/group/group-expenses?group_id=${group_id}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${user_id}`, //user_id as token
                }
            });
            const finalRes = await result.json();
            if (finalRes.failed) {
                show_toast({ status: "Fail", message: "Something went wrong while fetching expenses." });
            } else if (finalRes.notFound) {
                set_is_exp_empty(true);
                show_toast({ status: "Info", message: "No expenses found for this profile." });
            } else {
                show_toast({ status: "Success", message: "Expenses loaded successfully." });
                set_exp_data(finalRes.expenses);
            }
        } catch (error) {
            show_toast({ status: "Fail", message: "Failed to connect to the server." });
            console.log(error);
        } finally {
            set_loading(false);
        }
    }

    async function handle_delete(expense_id) {

        try {
            set_loading(true);
            const result = await fetch(`${import.meta.env.VITE_SERVER_API}/group/group-expenses`, {
                method: "DELETE",
                headers: {
                    'content-type': 'application/json',
                    "Authorization": `Bearer ${user_id}`, //user_id as token
                },
                body: JSON.stringify({
                    group_id: expense_prof._id,
                    expense_id
                })
            });

            const finalRes = await result.json();

            if (finalRes.failed) {
                console.log(finalRes);
                show_toast({ status: "Fail", message: finalRes.message || "Something went wrong." });
            } else if (!finalRes.updated) {
                show_toast({ status: "Info", message: "Expense not deleted. Try again." });
            } else {
                show_toast({ status: "Success", message: "Expense deleted successfully." });
                // fetch_expense_list_data();
                set_exp_data((prev) => {
                    const arr = prev.filter((elm) => elm.expense_id != expense_id);
                    return arr;
                });
            }
        } catch (error) {
            console.error(error);
            show_toast({ status: "Fail", message: "Network error. Please try again later." });
        } finally {
            set_loading(false);
            show_confirm_modal({ show: false, type: "", message: "", onConfirm: null });
        }
    }
    function profile_calculation() {
        if (exp_data && exp_data.length > 0) {
            let sum = 0, avg = 0, max = 0;
            const exp_cat_data = {};
            const exp_subcat_data = {};

            exp_data.forEach((elm) => {
                // Support both $numberDecimal and plain numbers
                const rawAmount = elm.amount;
                const amount = typeof rawAmount === "object" && rawAmount
                    ? parseFloat(rawAmount)
                    : parseFloat(rawAmount);

                sum += amount;
                if (amount > max) {
                    max = amount;
                }

                // Category-wise calculation
                exp_cat_data[elm.category] = (exp_cat_data[elm.category] || 0) + amount;

                // Sub-Category-wise calculation
                exp_subcat_data[elm.subCategory] = (exp_subcat_data[elm.subCategory] || 0) + amount;
            });

            avg = sum / exp_data.length;

            const catArry = Object.entries(exp_cat_data).map(([key, value]) => ({
                name: key,
                amount: value
            }));

            const subCatArray = Object.entries(exp_subcat_data).map(([key, value]) => ({
                name: key,
                amount: value
            }));

            set_exp_cat_amount(catArry);
            set_exp_subcat_amount(subCatArray);
            setCal({ total: sum, avg, max });
        }
    }


    const filteredData = exp_data.filter(item => {
        return (
            Object.entries(item).some(([key, value]) => {
                // Handle amount (Decimal128 or number)
                if (key === 'amount') {
                    const amount = parseFloat(value || value);
                    return String(amount).includes(searchText);
                }

                // Handle date (format to readable string)
                if (key === 'date') {
                    const dateStr = new Date(value).toLocaleDateString();
                    return dateStr.toLowerCase().includes(searchText.toLowerCase());
                }

                // Default case for other fields
                return String(value).toLowerCase().includes(searchText.toLowerCase());
            })
        );
    });

    function export_expenses_to_excel(data) {
        if (!data || data.length === 0) return;

        const formattedData = [];
        let sno = 1;

        // data.forEach(group => {
        exp_data.forEach(expense => {
            const baseInfo = {
                GroupID: expense_prof._id || '',
                ExpenseID: expense.expense_id || '',
                ExpenseName: expense.name,
                Category: expense.category,
                SubCategory: expense.subCategory,
                Description: expense.description,
                Amount: parseFloat(expense.amount),
                SplitType: expense.splitType,
                SplitMethod: expense.splitMethod,
                PaidBy: expense.paidBy?.name || '',
                IsSettled: expense.isSettled?.confirm ? "Yes" : "No",
                CreatedAt: new Date(expense.created_at).toLocaleDateString("en-GB"),
                LastUpdated: new Date(expense.updated_at).toLocaleDateString("en-GB"),
            };

            // Loop through each split member
            expense.splitDetails.forEach(member => {
                formattedData.push({
                    SNo: sno++,
                    ...baseInfo,
                    MemberName: member.name,
                    MemberAmount: parseFloat(member.amount).toFixed(2),
                    MemberPercentage: member.percentage !== undefined ? `${member.percentage}%` : '-',
                    PaymentStatus: member.paymentStatus,
                });
            });
        });
        // });

        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Group Expenses");

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
        });

        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(blob, "Group_Expenses_Report.xlsx");
    }

    useEffect(() => {
        if (group_id) {
            fetch_expense();
        }
    }, [group_id]);

    useEffect(() => {
        if (exp_data.length == 0) {
            set_is_exp_empty(true);
        } else {
            profile_calculation();
            set_is_exp_empty(false);
        }
    }, [exp_data]);

    return (
        <div id="main_expenses">
            <GroupExpenseCreator
                selectedGroup={expense_prof}
                set_loading={set_loading}
                groupId={expense_prof._id}
                show_toast={show_toast}
                show_create_expense={show_create_expense}
                set_show_create_expense={set_show_create_expense}
                set_exp_data={set_exp_data}
                edit_expense={edit_expense}
                set_edit_expense={set_edit_expense}
            />
            {confirmModal.show && <ConfirmBox
                show={confirmModal.show}
                type={confirmModal.type}
                message={confirmModal.message}
                onConfirm={confirmModal.onConfirm}
                show_confirm_modal={show_confirm_modal}
            />}
            <SplitActionsComponent show_confirm_modal={show_confirm_modal} expense={selected_expense} show_split_details={show_split_details} set_show_split_details={set_show_split_details} show_toast={show_toast} set_loading={set_loading} admin_id={expense_prof.admin_id} actual_user_id={actual_user_id} user_id={user_id} user_profile_image={user_profile_image} user_name={user_name} group_id={group_id} groupName={expense_prof.profile_name} />
            <div className="flex items-center justify-between m-4">
                <p onClick={() => set_show_selected_exp_prof({ show: false, expense_prof:null, group_id:null })} className="flex items-center text-2xl text-black hover:text-white transition-all hover:bg-[#f15b42] px-[10px] py-[5px] rounded-[30px] cursor-pointer">
                    <ArrowBigLeftDashIcon size={32} className="mr-2" />
                    <span>Back</span>
                </p>
                {/* <h1 className="font-bold text-2xl">Expense Profiles</h1> */}
                <div className="flex gap-4">
                    {/* Excel Export Button */}
                    <div onClick={() => export_expenses_to_excel(exp_data)} className="group flex items-center w-fit cursor-pointer gap-2 bg-[#6b8e23] text-white font-semibold rounded-3xl px-3 py-1.5 hover:scale-105 hover:bg-[#526c1e] transition-all duration-300">
                        <FileSpreadsheet className="group-hover:rotate-[340deg] transform duration-1000 text-white w-5 h-5" /> {/* Chart or graph icon for analysis */}
                        <button className="cursor-pointer text-sm">Export</button>
                    </div>

                    {/* Analysis Button */}
                    <div onClick={() => { setShowAnalysis(true), chartRef.current ? window.scrollTo({ top: chartRef.current.offsetTop, behavior: 'smooth' }) : '' }} className="flex w-fit cursor-pointer gap-2 bg-[#6b8e23] text-white font-semibold rounded-3xl px-3 py-1.5 hover:scale-105 hover:bg-[#526c1e] transition-all duration-300">
                        <ChartBarIcon className="text-white w-5 h-5" /> {/* Chart or graph icon for analysis */}
                        <button className="cursor-pointer text-sm">Analysis</button>
                    </div>

                    {/* Create New Expense Button */}
                    <div onClick={() => { cal.total >= expense_prof.total_budget ? show_toast({ status: "Info", message: 'You already exceed expense profile budget' }) : (set_show_create_expense(true), set_edit_expense({ edit_exp: false, expense: '' })) }} className="group flex w-fit cursor-pointer gap-2 bg-[#f15b42] text-white font-semibold rounded-3xl px-3 py-1.5 hover:scale-105 hover:bg-[#e14a34] transition-all">
                        <PlusIcon className="group-hover:animate-spin bg-white rounded-full text-[#f15b42] p-1" />
                        <button className="cursor-pointer text-sm">Create New Expense</button>
                    </div>
                </div>
            </div>
            {!expense_prof || !exp_data || exp_data?.length == 0 || is_exp_empty ?
                <div className="bg-white p-3 rounded-[10px]">
                    <div className=" rounded-[10px] overflow-hidden text-center" style={{ border: '2px dashed lightslategrey' }}>
                        <img className="w-[35%] m-auto" src={empty_expense_list} alt="error" />
                        <h1 className="my-[1rem] text-[xx-large] font-[600]">Empty Expenses</h1>
                    </div>
                </div>
                :
                <div>
                    {/* Expense Profile Summary */}
                    <div className="bg-white flex items-center gap-4 p-8" style={{ boxShadow: "0px 0px 5px -2px #75889a", margin: '10px', borderRadius: '10px' }}>
                        <div className="">
                            <img src={dummy_image} alt="error" className="w-[5rem] rounded-[50%] aspect-square object-cover" />
                        </div>
                        <div className="flex justify-between gap-4 flex-1 items-center">
                            <div>
                                <h1 className="font-bold text-2xl mb-0"><span>Profile Name: </span> <span style={{ color: '#0000009e' }}>{expense_prof.profile_name}</span></h1>
                                <p className="text-gray-400 text-sm">Created on {new Date(expense_prof.created_at).toLocaleDateString("en-gb")} | {exp_data.length} expenses</p>
                                <p className="text-sm text-yellow-200 bg-[#f15b42]  px-5 py-1 mt-2 w-fit rounded-4xl">{expense_prof.expenses_period}</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: "Total Budget", value: expense_prof.total_budget },
                                    { label: "Total Amount", value: cal.total },
                                    { label: "Average", value: cal.avg },
                                    { label: "Highest", value: cal.max },
                                ].map((item, index) => (
                                    <div
                                        key={index}
                                        className="bg-white shadow-md rounded-2xl p-4 text-center transition-all duration-300 border-transparent border hover:border-gray-300"
                                    >
                                        <p className="text-xl font-semibold text-gray-800 mb-1">₹{parseFloat(item.value).toFixed(2)}</p>
                                        <p className="text-sm text-gray-500">{item.label}</p>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>
                    <GroupMembersDropdown
                        set_show_selected_exp_prof = {set_show_selected_exp_prof}
                        show_confirm_modal={show_confirm_modal}
                        group_members={expense_prof.group_members}
                        admin_id={expense_prof.admin_id}
                        admin_name={user_name}
                        group_name={group_name}
                        actual_user_id={actual_user_id}
                        is_current_user_admin={actual_user_id === expense_prof.admin_id ? true : false}
                        group_id={expense_prof._id} show_toast={show_toast}
                        set_loading={set_loading}
                        friends_list={user_friendlist}
                    />
                    <div className="flex items-end justify-between mx-[3rem] mt-10">
                        <div className="bg-white shadow-[0px_0px_3px_0px_lightgrey] rounded-[10px] margin-[1rem] w-[40%]">
                            <h3 className="bg-[#f15b42] px-2.5 py-4 rounded-[10px_10px_0px_0px] text-yellow-200">Profile Description</h3>
                            <p className="px-2.5 py-4">{expense_prof.description}</p>
                        </div>
                        <div className="flex items-center bg-white rounded-[10px] overflow-hidden w-[30%] justify-between">
                            <div className="bg-[#ffe9e3] p-2.5 ">
                                <SearchIcon className="red" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search..."
                                className="px-3 py-2 mb-0 border-0 rounded-0 w-[100%] outline-0"
                                value={searchText}
                                onChange={e => setSearchText(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Expense List */}
                    <div id="my_exp_list_con" style={{ padding: '1rem', paddingBottom: '12rem' }}>
                        <div className="hidden lg:block">
                            {searchText != '' ?
                                <DataTable
                                    columns={columns}
                                    data={filteredData}
                                    customStyles={customStyles}
                                    pagination
                                    highlightOnHover
                                    striped
                                    responsive
                                    onChangeRowsPerPage={(newPerPage, page) => {
                                        setRowsPerPage(newPerPage);
                                        setCurrentPage(page);
                                    }}
                                    onChangePage={(page) => {
                                        setCurrentPage(page);
                                    }}
                                />
                                :
                                <DataTable
                                    columns={columns}
                                    data={exp_data}
                                    customStyles={customStyles}
                                    pagination
                                    highlightOnHover
                                    striped
                                    responsive
                                    onChangeRowsPerPage={(newPerPage, page) => {
                                        setRowsPerPage(newPerPage);
                                        setCurrentPage(page);
                                    }}
                                    onChangePage={(page) => {
                                        setCurrentPage(page);
                                    }}
                                />
                            }
                        </div>
                        <div className="block lg:hidden">
                            <CustomAccordionComponent
                                data={exp_data}
                                currentPage={currentPage}
                                rowsPerPage={rowsPerPage}
                            />
                        </div>
                    </div>

                    {showAnalysis &&
                        <>
                            <div id="chart-graphs-con" ref={chartRef} style={{ margin: '0rem 2rem', marginBottom: '5rem' }}>
                                <CatSubCatExpComparison expense_by_category={exp_cat_amount} expense_by_subCategory={exp_subcat_amount} total_budget={parseFloat(expense_prof.total_budget)} />
                            </div>
                            <div className="flex m-8 gap-4">
                                <ExpenseCategoryDonut data={exp_cat_amount} label={'Category'} />
                                <ExpenseCategoryDonut data={exp_subcat_amount} label={'Sub-Category'} />
                            </div>
                            {/* <AverageExpenseOverview total_budget={parseFloat(expense_prof.total_budget)} exp_data={exp_data}/> */}
                            <MonthlyDailyAverage total_budget={parseFloat(expense_prof.total_budget)} exp_data={exp_data} />
                            <MonthlyWeekChart total_budget={parseFloat(expense_prof.total_budget)} exp_data={exp_data} />
                            <MonthlyExpenseChart total_budget={parseFloat(expense_prof.total_budget)} exp_data={exp_data} />
                            <YearlyExpenseChart total_budget={parseFloat(expense_prof.total_budget)} exp_data={exp_data} />
                            {/* <ExpPeriodComparison total_budget={parseFloat(expense_prof.total_budget)} exp_data={exp_data}/> */}
                            {/* <ExpPeriodComparison total_budget={parseFloat(expense_prof.total_budget)} exp_data={exp_data} viewType="yearly"/> */}
                        </>
                    }
                </div>
            }
            <Footer />
        </div>
    )
}