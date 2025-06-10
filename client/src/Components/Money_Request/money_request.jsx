import { useState, useEffect, useCallback } from "react";
import {
    DollarSign,
    ArrowRight,
    Users,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    XCircle,
    Loader2,
    Receipt,
} from "lucide-react";
import Cookies from "js-cookie";

import Loader from "../Loader/loader";
import Toast from "../Toast/toast"; // Added missing import
import Sidebar from "../Sidebar/sidebar";
import Navbar from "../Homepage/Navbar";

export const TransactionStatus = ({
    isOpen,
    onClose,
    status, // 'success', 'failed', 'loading'
    transactionId,
    amount,
    expenseName,
    errorMessage,
    onRetry
}) => {
    if (!isOpen) return null;

    const getStatusConfig = () => {
        switch (status) {
            case 'loading':
                return {
                    icon: <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />,
                    title: 'Processing Payment',
                    subtitle: 'Please wait while we verify your payment...',
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-200'
                };
            case 'success':
                return {
                    icon: <CheckCircle className="w-16 h-16 text-white" />,
                    title: 'Payment Successful!',
                    subtitle: 'Your payment has been verified successfully',
                    bgColor: 'bg-gradient-to-br from-gray-900 to-gray-800',
                    borderColor: ''
                };
            case 'failed':
                return {
                    icon: <XCircle className="w-16 h-16 text-red-500" />,
                    title: 'Payment Failed',
                    subtitle: errorMessage || 'Payment verification failed. Please try again.',
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200'
                };
            default:
                return {
                    icon: <AlertCircle className="w-16 h-16 text-yellow-500" />,
                    title: 'Unknown Status',
                    subtitle: 'Please contact support if this persists',
                    bgColor: 'bg-yellow-50',
                    borderColor: 'border-yellow-200'
                };
        }
    };

    const config = getStatusConfig();

    return (
        <div className="fixed inset-0 bg-[#00000082] z-1000 bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                {/* Header */}
                <div className={`${config.bgColor} ${config.borderColor} border-b px-6 py-8 text-center`}>
                    <div className="flex justify-center mb-4">
                        {config.icon}
                    </div>
                    <h2 className={`text-2xl font-bold ${status !== 'success' ? "text-gray-800" : "text-white"} mb-2`}>
                        {config.title}
                    </h2>
                    <p className={`${status !== 'success' ? "text-gray-600" : "text-white"}`}>
                        {config.subtitle}
                    </p>
                </div>

                {/* Content */}
                <div className="px-6 py-6">
                    {/* Transaction Details */}
                    {(status === 'success' || status === 'failed') && (
                        <div className="space-y-4 mb-6">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-500">Expense</span>
                                    <span className="font-medium text-gray-800">{expenseName}</span>
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-500">Amount</span>
                                    <span className="font-bold text-lg text-gray-800">₹{parseFloat(amount).toFixed(2)}</span>
                                </div>
                                {transactionId && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">Transaction ID</span>
                                        <span className="font-mono text-xs text-gray-600">{transactionId}</span>
                                    </div>
                                )}
                            </div>

                            {/* Success specific content */}
                            {status === 'success' && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-center text-green-700 mb-2">
                                        <Receipt className="w-4 h-4 mr-2" />
                                        <span className="text-sm font-medium">Payment Confirmed</span>
                                    </div>
                                    <p className="text-sm text-green-600">
                                        Your payment has been successfully processed and your expense has been updated.
                                    </p>
                                </div>
                            )}

                            {/* Failure specific content */}
                            {status === 'failed' && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-center text-red-700 mb-2">
                                        <AlertCircle className="w-4 h-4 mr-2" />
                                        <span className="text-sm font-medium">What went wrong?</span>
                                    </div>
                                    <p className="text-sm text-red-600 mb-3">
                                        {errorMessage || 'The payment could not be verified. This could be due to network issues or invalid payment details.'}
                                    </p>
                                    <div className="text-xs text-red-500">
                                        <p>• Check your internet connection</p>
                                        <p>• Verify payment details should be correct</p>
                                        <p>• Contact support if issue persists</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Loading state - no content needed */}
                    {status === 'loading' && (
                        <div className="text-center py-4">
                            <div className="animate-pulse">
                                <div className="h-2 bg-blue-200 rounded mb-2"></div>
                                <div className="h-2 bg-blue-200 rounded w-3/4 mx-auto"></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="bg-gray-50 px-6 py-4 flex gap-3">
                    {status === 'success' && (
                        <>
                            <button
                                onClick={onClose}
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
                            >
                                Continue
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </button>
                        </>
                    )}

                    {status === 'failed' && (
                        <>
                            <button
                                onClick={onClose}
                                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors duration-200"
                            >
                                Close
                            </button>
                            {onRetry && (
                                <button
                                    onClick={onRetry}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Retry Payment
                                </button>
                            )}
                        </>
                    )}

                    {status === 'loading' && (
                        <div className="w-full text-center text-sm text-gray-500">
                            Do not close this window or refresh the page
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function MoneyRequest() {
    const selectedTab = "moneyrequests";
    const [loading, set_loading] = useState(false);
    const [toast_data, show_toast] = useState({
        status: '',
        message: ''
    });
    const [user_data, set_user_data] = useState();
    const [transactionModal, setTransactionModal] = useState({
        isOpen: false,
        status: 'loading',
        transactionId: '',
        amount: 0,
        expenseName: '',
        errorMessage: ''
    });
    const user_id = Cookies.get('spending_smart_client');

    const fetch_user = useCallback(async () => {
        try {
            set_loading(true);

            const response = await fetch(`${import.meta.env.VITE_SERVER_API}/user`, {
                method: 'GET',
                headers: {
                    "Authorization": `Bearer ${user_id}`,
                }
            });
            const result = await response.json();

            if (result.notFound) {
                console.warn("User not found");
            } else if (result.failed) {
                console.error("Server reported a failure");
            } else {
                set_user_data(result);
            }
        } catch (error) {
            console.error("Error while fetching user data:", error);
        } finally {
            set_loading(false);
        }
    }, [user_id]);

    function MoneyRequestAccordion({ request }) {
        const [openAccor, setOpenAccor] = useState(false);

        async function handlePay(request) {
            const {
                moneyRequest_id,
                from,
                moneyRequestor_id,
                moneyRequestor_name,
                moneyRequestor_profile_image,
                expense_id,
                expense_name,
                expense_amount,
                requested_amount,
                group_id,
                group_name
            } = request;

            if (!requested_amount) {
                console.log("Missing Field: amount");
                return;
            } if (!expense_amount) {
                console.log("Missing Field: expense_amount");
                return;
            } else if (!expense_id) {
                console.log("Missing Field: expense_id");
                return;
            } else if (!moneyRequest_id) {
                console.log("Missing Field: moneyRequest_id");
                return;
            } else if (!moneyRequestor_name) {
                console.log("Missing Field: moneyRequestor_name");
                return;
            } else if (!moneyRequestor_profile_image) {
                console.log("Missing Field: moneyRequestor_profile_image");
                return;
            } else if (!group_id) {
                console.log("Missing Field: group_id");
                return;
            } else if (!expense_name) {
                console.log("Missing Field: expense_name");
                return;
            } else if (!from) {
                console.log("Missing Field: from");
                return;
            } else if (!moneyRequestor_id) {
                console.log("moneyRequestor_id");
                return;
            }

            try {
                set_loading(true);
                const res = await fetch(`${import.meta.env.VITE_SERVER_API}/payment/create-order`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user_id}`, // JWT
                    },
                    body: JSON.stringify({ amount: parseFloat(requested_amount), expense_id, moneyRequest_id }),
                });
                const result = await res.json();
                console.log(result);
                if (result.failed) {
                    console.log(result);
                    show_toast({ status: "Fail", message: "Payment Creation Failed..." });
                } else if(result.notExists){
                    show_toast({ status: "Info", message: "Money request is no more..." });
                    setTimeout(()=>{
                        // window.location.reload();
                    },2000);
                } else {
                    openRazorpay(
                        result.order,
                        moneyRequest_id,
                        from,
                        moneyRequestor_id,
                        moneyRequestor_name,
                        moneyRequestor_profile_image,
                        expense_id,
                        expense_name,
                        expense_amount,
                        requested_amount,
                        group_id,
                        group_name
                    );
                }

            } catch (error) {
                console.log("Error while creating order in razorpay...");
                console.log(error);
                show_toast({ status: "Fail", message: "Network error occured" });
            } finally {
                set_loading(false);
            }
        }

        function openRazorpay(
            order,
            moneyRequest_id,
            from,
            moneyRequestor_id,
            moneyRequestor_name,
            moneyRequestor_profile_image,
            expense_id,
            expense_name,
            expense_amount,
            requested_amount,
            group_id,
            group_name
        ) {
            const options = {
                key: import.meta.env.VITE_RAZORPAY_API_KEY,
                amount: order.amount,
                currency: "INR",
                order_id: order.id,
                handler: function (response) {
                    verifyPayment(
                        response,
                        moneyRequest_id,
                        from,
                        moneyRequestor_id,
                        moneyRequestor_name,
                        moneyRequestor_profile_image,
                        expense_id,
                        expense_name,
                        expense_amount,
                        requested_amount,
                        group_id,
                        group_name
                    );
                },
                prefill: {
                    name: user_data.name,
                    email: user_data.email,
                },
                theme: {
                    color: "#3399cc" // Optional: Add theme color
                }
            };
            const razorpay = new window.Razorpay(options);
            razorpay.open();
            // const rzp = new Razorpay(options);
            // rzp.open();
        }
        const verifyPayment = async (
            response,
            moneyRequest_id,
            from,
            moneyRequestor_id,
            moneyRequestor_name,
            moneyRequestor_profile_image,
            expense_id,
            expense_name,
            expense_amount,
            requested_amount,
            group_id,
            group_name
        ) => {
            try {
                // Show loading modal
                setTransactionModal({
                    isOpen: true,
                    status: 'loading',
                    amount: requested_amount,
                    expenseName: expense_name,
                    transactionId: '',
                    errorMessage: ''
                });
                const res = await fetch(`${import.meta.env.VITE_SERVER_API}/payment/verify`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user_id}`, // Send JWT token if you use auth
                    },
                    body: JSON.stringify({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        // razorpay_signature: "invalid_signature_for_testing", // This will cause failure
                        moneyRequest_id,
                        from,
                        receiver_id: moneyRequestor_id,
                        receiver_name: moneyRequestor_name,
                        receiver_profile_image: moneyRequestor_profile_image,
                        expense_id: expense_id,
                        expense_name: expense_name,
                        expense_amount: requested_amount,
                        total_expense_amount: expense_amount,
                        user_profile_img: user_data.profile_image,
                        user_name: user_data.name,
                        group_id,
                        group_name
                    }),
                });

                const result = await res.json();

                if (result.success) {
                    // Show success modal
                    setTransactionModal(prev => ({
                        ...prev,
                        status: 'success',
                        transactionId: result.transaction_id
                    }));
                    // show_toast({ status: "Success", message: "Payment successful and verified!" });
                    // Optional: Refresh the page or update UI
                    // setTimeout(()=>{
                    //     window.location.reload();
                    // },500);
                } else {
                    // Show failure modal
                    setTransactionModal(prev => ({
                        ...prev,
                        status: 'failed',
                        transactionId: result.transaction_id || '',
                        errorMessage: result.message || 'Payment verification failed!'
                    }));
                    console.log(result);
                    // show_toast({ status: "Fail", message: "Payment verification failed!" });
                }
            } catch (error) {
                console.error("Error verifying payment:", error);
                // show_toast({ status: "Fail", message: "Something went wrong while verifying the payment." });
                // Show failure modal for network/server errors
                setTransactionModal(prev => ({
                    ...prev,
                    status: 'failed',
                    errorMessage: 'Something went wrong while verifying the payment. Please check your connection and try again.'
                }));
            }
        };

        return (
            <div
                className="rounded-xl shadow-sm mb-3 overflow-hidden hover:shadow-md transition-all duration-300"
                style={{ boxShadow: "0px 0px 3px 0px lightgrey" }}
            >
                {/* Header */}
                <div className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <img
                                    src={request.moneyRequestor_profile_image}
                                    alt="Profile"
                                    className="w-20 h-20 rounded-full object-cover p-0.5 border-1 border-gray-200"
                                />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 text-base">{request.moneyRequestor_name}</h3>
                                <p className="text-sm text-gray-600"><strong>Expense Name:</strong> {request.expense_name}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <div className="text-xl font-bold text-green-600">₹{request.requested_amount.toFixed(2)}</div>
                                <div className="text-xs text-gray-500">your share</div>
                            </div>
                            <button
                                onClick={() => handlePay(request)}
                                className="bg-gradient-to-br from-gray-900 to-gray-800 shadow-md text-white px-10 py-2.5 rounded-full transition-all duration-200 font-medium text-sm transform cursor-pointer hover:-translate-y-0.5"
                            >
                                Pay
                            </button>
                        </div>
                    </div>

                    {/* Quick Info Bar */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                {request.group_name}
                            </span>
                            <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {new Date(request.exp_date).toLocaleDateString('en-gb')}
                            </span>
                        </div>

                        <button
                            onClick={() => setOpenAccor(!openAccor)}
                            className="flex items-center gap-1 cursor-pointer text-sm text-blue-600 hover:bg-blue-200 py-2 rounded-2xl px-4 transition-all font-medium"
                        >
                            {openAccor ? 'Less' : 'More'} details
                            <svg
                                className={`w-4 h-4 transition-transform duration-200 ${openAccor ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Expandable Details */}
                {openAccor && (
                    <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <div className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">From</div>
                                <div className="text-gray-900 font-medium">{request.from}</div>
                            </div>
                            <div>
                                <div className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">Total Expense Amount</div>
                                <div className="text-gray-900 font-medium">₹{request.expense_amount}</div>
                            </div>
                            <div>
                                <div className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">Requested</div>
                                <div className="text-gray-900 font-medium">
                                    {new Date(request.created_at).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
    const handleTransactionRetry = () => {
        // Close modal and allow user to retry payment
        setTransactionModal(prev => ({ ...prev, isOpen: false }));
        // You can trigger the payment flow again here
    };

    const closeTransactionModal = () => {
        setTransactionModal(prev => ({ ...prev, isOpen: false }));
        setTimeout(() => {
            window.location.reload();
        }, 100)
    };
    useEffect(() => {
        if (user_id) {
            fetch_user();
        }
    }, [fetch_user]);

    return (
        <div className="flex">
            <Sidebar
                selectedTab={selectedTab}
                user_profile_image={user_data?.profile_image}
                user_name={user_data?.name}
            />
            {toast_data.message && <Toast toast_data={toast_data} />}
            {loading && <Loader />}

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
                <TransactionStatus
                    isOpen={transactionModal.isOpen}
                    onClose={closeTransactionModal}
                    status={transactionModal.status}
                    transactionId={transactionModal.transactionId}
                    amount={transactionModal.amount}
                    expenseName={transactionModal.expenseName}
                    errorMessage={transactionModal.errorMessage}
                    onRetry={handleTransactionRetry}
                />

                {/* Main Content */}
                <div className="p-6">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Money Requests</h1>
                        <p className="text-gray-600">Your pending money requests from friends and groups</p>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-sm p-6" style={{ boxShadow: "0px 0px 3px 0px lightseagreen" }}>
                            <div className="flex items-center">
                                <div className="p-3 bg-red-100 rounded-lg">
                                    <AlertCircle className="w-6 h-6 text-red-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {user_data?.money_request?.length || 0}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6" style={{ boxShadow: "0px 0px 3px 0px lightseagreen" }}>
                            <div className="flex items-center">
                                <div className="p-3 bg-yellow-100 rounded-lg">
                                    <DollarSign className="w-6 h-6 text-yellow-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Amount</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        ₹{(user_data?.money_request?.reduce((sum, req) => sum + req.requested_amount, 0 || 0))?.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6" style={{ boxShadow: "0px 0px 3px 0px lightseagreen" }}>
                            <div className="flex items-center">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <Users className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">From Groups</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {user_data?.money_request?.filter(req => req.group_id).length || 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Money Requests List */}
                    <div className="rounded-xl overflow-hidden">
                        <div className="p-6 mb-4 bg-white w-fit rounded-lg" style={{ boxShadow: "0px 0px 3px 0px lightgrey" }}>
                            <h2 className="text-xl font-semibold text-gray-900">Pending Money Requests</h2>
                        </div>

                        <div className="divide-y rounded-lg bg-white">
                            {user_data?.money_request && user_data.money_request.length > 0 ? (
                                user_data.money_request.map((request, idx) => (
                                    <MoneyRequestAccordion request={request} key={idx} />
                                ))
                            ) : (
                                <div className="p-4">
                                    <div className="p-12 text-center rounded-xl" style={{ border: '2px dashed lightgrey' }}>
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            No pending money requests
                                        </h3>
                                        <p className="text-gray-600">
                                            You're all caught up! No pending payments at the moment.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}