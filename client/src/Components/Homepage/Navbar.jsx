import { useEffect, useRef, useState } from 'react';
import logo from '../../../public/logo.png';
import { useNavigate } from 'react-router-dom';
import { HomeIcon, LayoutDashboard, MoveRight, Bell, UserPlus, DollarSign, Clock, Check, X, CreditCard, Activity, Info, IndianRupee, Receipt } from 'lucide-react';
import { TransactionStatus } from "../Money_Request/money_request";
import Cookies from 'js-cookie';

export default function Navbar({ user_id, user_name, user_profile_image, isHomePage, set_loading, friend_request, money_request, notifications, show_toast }) {
  const [scrolled, setScrolled] = useState(false);
  const [show_noti, set_show_noti] = useState(false);
  const [isNewNoti, set_isNewNoti] = useState((friend_request?.length > 0 || money_request?.length > 0) ? true : false);
  const navigate = useNavigate();

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    // Add event listener
    window.addEventListener('scroll', handleScroll);

    // Call it once to initialize
    handleScroll();

    // Clean up
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  // Add logo animation style
  useEffect(() => {
    // Add the custom animation styles to the document head
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes scaleUpDown {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
    `;
    document.head.appendChild(styleElement);
    // Clean up the style element when component unmounts
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  useEffect(() => {
    if (notifications && friend_request && money_request) {
      let val = false;
      notifications.forEach((elm) => {
        if (elm.status == "unread") {
          set_isNewNoti(true);
          val = true;
          return;
        }
      });
      if (!val) {
        set_isNewNoti(
          (friend_request?.length > 0 || money_request?.length > 0)
        );
      }
    }
  }, [notifications, friend_request, money_request]);

  return (
    <div className={`${isHomePage ? "fixed" : "sticky"} top-0 left-0 right-0 z-[999] flex justify-center`}>
      <nav
        className={`
          flex justify-between items-center py-3 px-12 
          bg-gradient-to-br from-gray-900 to-gray-800 shadow-lg
          transition-all duration-500 ease-in-out
          ${scrolled && isHomePage ?
            'w-[80%] mt-[10px] rounded-[30px] border border-gray-700' :
            'w-full rounded-none'
          }
        `}
      >
        <div className="flex items-center gap-1">
          <img
            style={{ animation: 'scaleUpDown 3s infinite ease-in-out' }}
            className="h-10"
            src={logo}
            alt="Spending Smart Logo"
          />
          <h1 className="font-bold text-white">Spending Smart</h1>
        </div>

        <div className="flex items-center gap-4">
          <li onClick={() => navigate('/')} className="list-none flex items-center gap-1 cursor-pointer text-white hover:text-[#C9DF8A] transition-colors duration-300">
            <HomeIcon />
            <span>Home</span>
          </li>
          <li onClick={() => navigate('/track-my-expenses')} className="list-none flex items-center gap-1 cursor-pointer text-white hover:text-[#C9DF8A] transition-colors duration-300">
            <Receipt/>
            <span>Track My Expenses</span>
          </li>
          {/* <li onClick={() => navigate('/dashboard')} className="list-none flex items-center gap-1 cursor-pointer text-white hover:text-[#C9DF8A] transition-colors duration-300">
            <LayoutDashboard />
            <span>Dashboard</span>
          </li> */}
          <li onClick={() => set_show_noti(true)} className="relative list-none flex items-center gap-1 cursor-pointer text-white hover:text-[#C9DF8A] transition-colors duration-300">
            <Bell />
            {isNewNoti ? <span className='h-2 w-2 bg-red-600 absolute rounded-[50%] top-0 left-3.5'></span> : ''}
            <span>Notification</span>
          </li>
          <li onClick={() => navigate('/aboutus')} className="list-none flex items-center gap-1 cursor-pointer text-white hover:text-[#C9DF8A] transition-colors duration-300">
            <Info />
            <span>About Us</span>
          </li>
          <li onClick={() => navigate('/user-profile')} className='list-none flex items-center gap-1 cursor-pointer text-white hover:text-[#C9DF8A] transition-colors duration-300'>
            {user_profile_image ? (
              <img
                src={user_profile_image || "../../../public/dummy_image.webp"}
                alt="User Profile"
                className="w-[3rem] aspect-square object-cover rounded-[50%]"
              />
            ) : (
              <>
                <a href="/login" className="no-underline text-white hover:text-[#C9DF8A] transition-colors duration-300">Login</a>
                <a
                  href="/sign-up"
                  className="no-underline bg-[#f15b42] font-[600] py-[5px] px-[10px] rounded-[20px] text-white hover:bg-[#d94a33] transition-colors duration-300"
                >
                  Sign Up
                </a>
              </>
            )}
          </li>

        </div>
      </nav>
      <NotifComp
        user_profile_image={user_profile_image}
        user_name={user_name}
        set_show_noti={set_show_noti}
        show_noti={show_noti}
        show_toast={show_toast}
        set_loading={set_loading}
        set_isNewNoti={set_isNewNoti}
        friend_requests={friend_request}
        money_request={money_request}
        notifications={notifications}
        receiver_data={{ receiver_id: user_id, receiver_profile_image: user_profile_image, receiver_name: user_name }}
      />
    </div>
  );
}

function NotifComp({ user_profile_image, user_name, set_show_noti, show_noti, set_loading, friend_requests, money_request, notifications, receiver_data, show_toast, set_isNewNoti }) {
  const compRef = useRef();
  const [activeTab, setActiveTab] = useState('all');
  const [friend_request, set_friend_request] = useState(friend_requests);
  const [is_noti_status_updated, set_is_noti_status_updated] = useState(false);
  const [transactionModal, setTransactionModal] = useState({
    isOpen: false,
    status: 'loading',
    transactionId: '',
    amount: 0,
    expenseName: '',
    errorMessage: ''
  });

  const user_id = Cookies.get('spending_smart_client');

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

      if (result.failed) {
        console.log(result);
        show_toast({ status: "Fail", message: "Payment Creation Failed..." })
      } else if (result.notExists) {
        show_toast({ status: "Info", message: "Money request is no more..." });
        setTimeout(() => {
          window.location.reload();
        }, 2000);
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
      // prefill: {
      //   name: user_data.name,
      //   email: user_data.email,
      // },
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
          user_profile_img: user_profile_image,
          user_name: user_name,
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

  useEffect(() => {
    const comp = compRef.current;

    if (comp) {
      if (show_noti) {
        comp.style.display = "block";
      } else {
        setTimeout(() => {
          comp.style.display = "none";
        }, 450);
      }
    }
  }, [show_noti]);

  useEffect(() => {
    if (friend_requests) {
      set_friend_request(friend_requests);
    }
  }, [friend_requests])

  async function update_notification_status(notifications) {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_API}/notification/update/status`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "Authorization": `Bearer ${user_id}`, //user_id as token
        },
        body: JSON.stringify({ notifications: notifications })
      });
      const result = await response.json();

      if (result.failed) {
        console.log(result);
        show_toast({ status: 'Fail', message: "Failed to update notification status" });
      } else if (!result.updated) {
        show_toast({ status: 'Info', message: "May be notification status already updated" });
      } else {
        show_toast({ status: 'Success', message: "Notification Status Updated Successfully!" });
        set_isNewNoti(false);
        set_is_noti_status_updated(true);
      }
    } catch (error) {
      show_toast({ status: 'Fail', message: "Failed to update notification status" });
      console.log("Error While updating notification status " + error);
    }
  }
  useEffect(() => {
    if (!show_noti || !notifications || is_noti_status_updated) {
      return;
    }
    // find notifications that have "unread" status
    let noti = [];
    notifications.forEach((elm) => {
      if (elm.status == "unread")
        noti.push(elm.notification_id);
    })
    if (noti.length > 0) {
      setTimeout(() => {
        //set notification's status read 
        update_notification_status(noti);
      }, 500);
    }

  }, [notifications, show_noti])

  const handleAcceptFriend = async (sender_data) => {
    try {
      set_loading(true);

      const response = await fetch(`${import.meta.env.VITE_SERVER_API}/friend-request/accept`, {
        method: 'PATCH',
        headers: {
          "Authorization": `Bearer ${user_id}`, //user_id as token
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender_id: sender_data.sender_id,
          sender_profile_image: sender_data.sender_profile_image,
          sender_name: sender_data.sender_name,
          receiver_id: receiver_data.receiver_id,
          receiver_profile_image: receiver_data.receiver_profile_image,
          receiver_name: receiver_data.receiver_name,
        })
      });
      const result = await response.json();

      if (result.failed) {
        console.log(result);
        show_toast({ status: "Fail", message: "Failed to accept the friend request. Please try again." });
      } else if (result.expire) {
        show_toast({ status: "Fail", message: result.message });
        set_friend_request((prev) => (
          prev.filter((elm) => elm.sender_id !== sender_data.sender_id)
        ))
      }
      else if (!result.updated) {
        show_toast({ status: "Info", message: "Something went wrong, Try again!" });
      } else {
        show_toast({ status: "Success", message: `You are now friends with ${sender_data.sender_name}.` });

        set_friend_request((prev) => (
          prev.filter((elm) => elm.sender_id !== sender_data.sender_id)
        ))
        set_isNewNoti(false);
      }

    } catch (error) {
      console.error("Error while accepting friend request:", error);
      show_toast({ status: "Fail", message: "Something went wrong. Please try again later." });
    } finally {
      set_loading(false);
    }
  };

  const handleRejectFriend = async (senderId) => {
    try {
      set_loading(true);

      const response = await fetch(`${import.meta.env.VITE_SERVER_API}/friend-request/reject`, {
        method: 'PATCH',
        headers: {
          "Authorization": `Bearer ${user_id}`, //user_id as token
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender_id: senderId,
          receiver_id: receiver_data.receiver_id,
          receiver_profile_image: receiver_data.receiver_profile_image,
          receiver_name: receiver_data.receiver_name,
        })
      });
      const result = await response.json();

      if (result.failed) {
        console.log(result);
        show_toast({ status: "Fail", message: "Failed to reject the friend request. Please try again." });
      } else if (result.expire) {
        show_toast({ status: "Fail", message: result.message });
        set_friend_request((prev) => (
          prev.filter((elm) => elm.sender_id !== senderId)
        ))
      }
      else if (!result.updated) {
        show_toast({ status: "Info", message: "Something went wrong, Try again!" });
      } else {
        show_toast({ status: "Success", message: "Successfully rejected friend request!" });

        set_friend_request((prev) => (
          prev.filter((elm) => elm.sender_id !== senderId)
        ))
        set_isNewNoti(false);
      }

    } catch (error) {
      console.error("Error while accepting friend request:", error);
      show_toast({ status: "Fail", message: "Something went wrong. Please try again later." });
    } finally {
      set_loading(false);
    }
  };

  async function handleDeclineMoneyReq(money_req_id, payer_id, requested_amount, expense_id, expense_name, from, group_id, group_name) {
    if (!money_req_id) {
      console.log("Missing Field: money_req_id");
      return;
    } else if (!payer_id) {
      console.log("Missing Field: payer_id");
      return;
    } else if (!requested_amount) {
      console.log("Missing Field: requested_amount");
      return;
    } else if (!expense_id) {
      console.log("Missing Field: expense_id");
      return;
    } else if (!expense_name) {
      console.log("Missing Field: expense_name");
      return;
    } else if (!from) {
      console.log("Missing Field: from");
      return;
    } else if (!group_id) {
      console.log("Missing Field: group_id");
      return;
    } else if (!group_name) {
      console.log("Missing Field: group_name");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_API}/user/decline-money-request`, {
        method: "DELETE",
        headers: {
          'content-type': 'application/json',
          "Authorization": `Bearer ${user_id}`, //user_id as token
        },
        body: JSON.stringify({ money_req_id, payer_id, user_name, requested_amount, expense_id, expense_name, from, group_id, group_name })
      });
      const result = await response.json();

      if (result.failed) {
        console.log(result);
        show_toast({ status: "Fail", message: "Failed to decline money request, Try again later!" });
      } else if (!result.updated) {
        show_toast({ status: "Info", message: "May be money request already declined..." });
      } else {
        show_toast({ status: "Success", message: "Successfully Declined Money Request!" });
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.log("Error while declining money request...");
      console.log(error);
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    return "₹" + parseFloat(amount).toFixed(2);
  };

  const hasNotifications = (friend_request?.length > 0 || money_request?.length > 0 || notifications?.length > 0);

  const closeTransactionModal = () => {
    setTransactionModal(prev => ({ ...prev, isOpen: false }));
    setTimeout(() => {
      window.location.reload();
    }, 100)
  };

  const handleTransactionRetry = () => {
    // Close modal and allow user to retry payment
    setTransactionModal(prev => ({ ...prev, isOpen: false }));
    // You can trigger the payment flow again here
  };

  return (
    <>
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
      <div ref={compRef} className="fixed hidden top-0 right-0 bottom-0 w-80 bg-white shadow-[0px_0px_2px_0px_lightgrey]" style={{ animation: show_noti ? 'rightToLeft 0.5s ease-out' : 'leftToRight 0.5s ease-in' }}>
        {/* Close button */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 shadow-lg absolute top-1/2 -left-8 cursor-pointer text-white" style={{ borderRadius: '10px 0 0 10px' }}>
          <button onClick={() => set_show_noti(false)} className="h-24 w-8 cursor-pointer flex items-center justify-center text-2xl">
            <MoveRight size={20} />
          </button>
        </div>

        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-orange-500 to-red-500 text-yellow-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Bell size={25} /> Notifications
            </h2>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-3 text-sm font-medium ${activeTab === 'all' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-500'}`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-3 text-sm font-medium ${activeTab === 'friends' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-500'}`}
          >
            Friends
          </button>
          <button
            onClick={() => setActiveTab('money')}
            className={`flex-1 py-3 text-sm font-medium ${activeTab === 'money' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-500'}`}
          >
            Money
          </button>
          <button
            onClick={() => setActiveTab('updates')}
            className={`flex-1 py-3 text-sm font-medium ${activeTab === 'updates' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-500'}`}
          >
            Updates
          </button>
        </div>

        {/* Content */}
        <div className="h-full overflow-y-auto" style={{ paddingBottom: '10rem' }}>
          {hasNotifications ? (
            <>
              {/* Friend Requests Section */}
              {(activeTab === 'all' || activeTab === 'friends') && friend_request && friend_request.length > 0 && (
                <div className="py-2">
                  <h3 className="px-4 text-lg font-medium text-gray-500 flex items-center gap-2 mb-2 mt-3">
                    <UserPlus size={24} /> Friend Requests
                  </h3>

                  {friend_request.map((request, index) => (
                    <div key={index} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100">
                      <div className="flex items-center">
                        <div className="relative">
                          <img
                            src={request.sender_profile_image || "../../../public/dummy_image.webp"}
                            alt={request.sender_name}
                            className="w-14 h-14 rounded-full object-cover border-2 border-orange-200"
                          />
                        </div>

                        <div className="ml-3 flex-1">
                          <p className="text-base font-medium text-gray-800">{request.sender_name}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock size={12} /> Wants to connect
                          </p>
                        </div>
                      </div>

                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => handleAcceptFriend(request)}
                          className="flex-1 px-3 py-2 text-xs font-medium bg-gradient-to-br from-gray-900 to-gray-800 shadow-lg text-white rounded-md hover:scale-105 transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Check size={14} /> Accept
                        </button>
                        <button
                          onClick={() => handleRejectFriend(request.sender_id)}
                          className="flex-1 px-3 py-2 text-xs font-medium bg-gray-200 text-gray-800 rounded-md cursor-pointer hover:bg-gray-300 hover:scale-105 transition-all flex items-center justify-center gap-1"
                        >
                          <X size={14} /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Money Requests Section */}
              {(activeTab === 'all' || activeTab === 'money') && money_request && money_request.length > 0 && (
                <div className="py-2">
                  <h3 className="px-4 text-lg font-medium text-gray-500 flex items-center gap-2 mb-2 mt-3">
                    <IndianRupee size={24} /> Money Requests
                  </h3>

                  {money_request.map((request, index) => (
                    <div key={request.moneyRequest_id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100">
                      <div className="flex items-start">
                        <div className="relative">
                          <img
                            src={request.moneyRequestor_profile_image || "../../../public/dummy_image.webp"}
                            alt={request.moneyRequestor_name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-orange-200"
                          />
                        </div>

                        <div className="ml-3 flex-1">
                          <div className="flex justify-between">
                            <p className="text-base font-medium text-gray-800">{request.moneyRequestor_name}</p>
                            <p className="text-base font-bold text-red-500">{formatAmount(request.requested_amount)}</p>
                          </div>
                          <p className="text-sm text-gray-700">
                            {request.expense_name}
                          </p>
                          <p className="text-sm text-gray-700">
                            {request.from}: {request.group_name}
                          </p>
                          <div className="flex justify-between mt-1">
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock size={12} /> {formatDate(request.created_at)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Total: {formatAmount(request.expense_amount)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => handlePay(request)}
                          className="w-full px-3 py-2 text-xs font-medium bg-gradient-to-r from-orange-500 to-red-500 text-yellow-200 rounded-md hover:scale-105 transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <CreditCard size={14} /> Pay Now
                        </button>
                        <button
                          onClick={() => handleDeclineMoneyReq(request.moneyRequest_id, request.moneyRequestor_id, request.requested_amount, request.expense_id, request.expense_name, request.from, request.group_id, request.group_name)}
                          className="flex-1 px-3 py-2 text-xs font-medium text-white bg-gradient-to-br from-gray-900 to-gray-800 shadow-lg rounded-md cursor-pointer hover:scale-105 transition-all flex items-center justify-center gap-1"
                        >
                          <X size={14} /> Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Activity Updates Section */}
              {(activeTab === 'all' || activeTab === 'updates') && notifications && notifications.length > 0 && (
                <div className="py-2">
                  <h3 className="px-4 text-lg font-medium text-gray-500 flex items-center gap-2 mb-2 mt-3">
                    <Activity size={24} /> Activity Updates
                  </h3>

                  {notifications && [...notifications].reverse().map((notification, index) => (
                    <div key={notification.notification_id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100">
                      <div className="flex">
                        <div className="mr-3">
                          {notification.type === 'friend_Request' ? (
                            <div className="w-12 bg-blue-100 rounded-full flex items-center justify-center">
                              {/* <UserPlus size={18} className="text-blue-600" /> */}
                              <img src={notification.user_profile_image || "../../../public/dummy_image.webp"} className='w-[100%] aspect-square object-cover border-amber-400 rounded-[50%]' alt="error" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <DollarSign size={18} className="text-green-600" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <p className="text-sm text-gray-800 pr-2">{notification.message}</p>
                            {notification.status == 'unread' && <div className='bg-red-600 h-2 w-2 aspect-square rounded-[50%]'></div>}
                          </div>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Clock size={12} /> {formatDate(notification.date)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-4">
              <img className="w-3/4 mb-4 opacity-70" src="emptyNotificaitonList.jpg" alt="No notifications" />
            </div>
          )}
        </div>
      </div>
    </>
  );
}