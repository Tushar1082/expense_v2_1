import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Search, Filter, Calendar, TrendingDown, TrendingUp, X, CheckCircle, XCircle, Clock, ArrowUpRight, ArrowDownLeft, ReceiptIndianRupee } from "lucide-react";
import Navbar from "../Homepage/Navbar";
import Sidebar from "../Sidebar/sidebar";
import Loader from "../Loader/loader";
import Toast from "../Toast/toast";
import Cookies from 'js-cookie';
import dummyImg from "../../../public/dummy_image.webp";

export default function Transactions() {
  const selectedTab = "transactions";
  const [loading, set_loading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [emptyTrans, setEmptyTrans] = useState(true);
  const [transList, setTransList] = useState(null);
  const [currTrans, setCurrTrans] = useState({ bool: false, details: null });
  const [showLoading, setShowLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [user_data, set_user_data] = useState();
  const [toast_data, show_toast] = useState({
    status: '',
    message: ''
  });
  const user_id = Cookies.get('spending_smart_client');
  const myRef = useRef();

  // Mock data for demonstration - matching your actual transaction structure
  const mockTransactions = [
    {
      transaction_id: "683ca1706d3b66f791d49fb0",
      payment_id: "pay_Qc2NFQuhJ44Nyo",
      expense_id: "683c3205b79d9ed128f61d64",
      expense_name: "Cake",
      expense_amount: 333.33,
      payment_date: new Date().toISOString(),
      payment_status: "Success",
      payer: {
        user_id: "6836037fa5b0518ea44a5283",
        name: "John Doe",
        profile_image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
      },
      receiver_id: "6836037fa5b0518ea44a5183"
    },
    {
      transaction_id: "683ca1706d3b66f791d49fb1",
      payment_id: "pay_Qc2NFQuhJ44Ny1",
      expense_id: "683c3205b79d9ed128f61d65",
      expense_name: "Coffee Meeting",
      expense_amount: 250.00,
      payment_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      payment_status: "Success",
      payer: {
        user_id: "6836037fa5b0518ea44a5284",
        name: "Alice Smith",
        profile_image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
      },
      receiver_id: "6836037fa5b0518ea44a5183"
    },
    {
      transaction_id: "683ca1706d3b66f791d49fb2",
      payment_id: "pay_Qc2NFQuhJ44Ny2",
      expense_id: "683c3205b79d9ed128f61d66",
      expense_name: "Movie Tickets",
      expense_amount: 480.00,
      payment_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      payment_status: "Failed",
      payer: {
        user_id: "6836037fa5b0518ea44a5285",
        name: "Mike Johnson",
        profile_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
      },
      receiver_id: "6836037fa5b0518ea44a5183"
    },
    {
      transaction_id: "683ca1706d3b66f791d49fb3",
      payment_id: "pay_Qc2NFQuhJ44Ny3",
      expense_id: "683c3205b79d9ed128f61d67",
      expense_name: "Dinner Split",
      expense_amount: 750.50,
      payment_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      payment_status: "Success",
      payer: {
        user_id: "6836037fa5b0518ea44a5286",
        name: "Sarah Wilson",
        profile_image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
      },
      receiver_id: "6836037fa5b0518ea44a5183"
    },
    {
      transaction_id: "683ca1706d3b66f791d49fb4",
      payment_id: "pay_Qc2NFQuhJ44Ny4",
      expense_id: "683c3205b79d9ed128f61d68",
      expense_name: "Grocery Shopping",
      expense_amount: 1200.25,
      payment_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      payment_status: "Success",
      payer: {
        user_id: "6836037fa5b0518ea44a5287",
        name: "Robert Brown",
        profile_image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
      },
      receiver_id: "6836037fa5b0518ea44a5183"
    },
    {
      transaction_id: "683ca1706d3b66f791d49fb5",
      payment_id: "pay_Qc2NFQuhJ44Ny5",
      expense_id: "683c3205b79d9ed128f61d69",
      expense_name: "Gas Bill Split",
      expense_amount: 890.00,
      payment_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      payment_status: "Success",
      payer: {
        user_id: "6836037fa5b0518ea44a5288",
        name: "Emma Davis",
        profile_image: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face"
      },
      receiver_id: "6836037fa5b0518ea44a5183"
    }
  ];

  function getPeriod(transactions) {
    setShowLoading(true);
    const now = new Date();
    const today = [];
    const yesterday = [];
    const sevenDays = [];
    const last30Days = [];
    const older = [];

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(todayStart.getDate() - 1);
    const sevenDaysAgo = new Date(todayStart);
    sevenDaysAgo.setDate(todayStart.getDate() - 6);
    const thirtyDaysAgo = new Date(todayStart);
    thirtyDaysAgo.setDate(todayStart.getDate() - 29);

    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(b.payment_date) - new Date(a.payment_date)
    );

    sortedTransactions.forEach((elm) => {
      const transactionDate = new Date(elm.payment_date);
      if (transactionDate >= todayStart) {
        today.push(elm);
      } else if (transactionDate >= yesterdayStart) {
        yesterday.push(elm);
      } else if (transactionDate >= sevenDaysAgo) {
        sevenDays.push(elm);
      } else if (transactionDate >= thirtyDaysAgo) {
        last30Days.push(elm);
      } else {
        older.push(elm);
      }
    });

    setTransList({ today, yesterday, sevenDays, last30Days, older });
    setTimeout(() => {
      setShowLoading(false);
    }, 1000);
  }

  function handleShowTransDetails(details) {
    setCurrTrans({ bool: true, details: details });
    const div = myRef.current;
    if (!div) return;
    div.style.display = 'flex';
    div.style.animation = "fadeIn 0.3s ease-in-out";
  }

  async function handleHideStatus() {
    const div = myRef.current;
    if (div) {
      div.style.animation = "fadeOut 0.3s ease-in-out";
      setTimeout(() => {
        div.style.display = 'none';
        setCurrTrans({ bool: false, details: null });
      }, 300);
    }
  }

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

        if (result.transactions && Array.isArray(result.transactions)) {
          if (result.transactions.length > 0) {
            getPeriod(result.transactions);
            setEmptyTrans(false);
          } else
            setEmptyTrans(true);
        } else
          setEmptyTrans(true);

      }
    } catch (error) {
      console.error("Error while fetching user data:", error);
    } finally {
      set_loading(false); // Always turn off loading
    }

  }

  const filteredTransactions = useMemo(() => {
    if (!transList) return null;

    const allTransactions = [
      ...transList.today,
      ...transList.yesterday,
      ...transList.sevenDays,
      ...transList.last30Days,
      ...transList.older
    ];

    return allTransactions.filter(transaction => {
      const matchesSearch = transaction.expense_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.payer.payer_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || transaction.payment_status.toLowerCase() === filterStatus.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [transList, searchTerm, filterStatus]);

  const renderTransactions = useMemo(() => {
    if (!transList) return null;

    const sections = [
      { label: "Today", data: transList.today, icon: Clock },
      { label: "Yesterday", data: transList.yesterday, icon: Calendar },
      { label: "Last 7 Days", data: transList.sevenDays, icon: Calendar },
      { label: "Last 30 Days", data: transList.last30Days, icon: Calendar },
      { label: "Older", data: transList.older, icon: Calendar },
    ];

    return sections.map(({ label, data, icon: Icon }) => {
      if (data.length === 0) return null;

      const filteredData = data.filter(transaction => {
        const matchesSearch = transaction.expense_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.payer.payer_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === "all" || transaction.payment_status.toLowerCase() === filterStatus.toLowerCase();
        return matchesSearch && matchesStatus;
      });

      if (filteredData.length === 0) return null;

      return (
        <div key={label} className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Icon className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">{label}</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent"></div>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {filteredData.length} transactions
            </span>
          </div>

          <div className="space-y-3">
            {filteredData.map((transaction, idx) => (
              <div
                key={idx}
                onClick={() => handleShowTransDetails(transaction)}
                className="bg-white border mb-4 w-[90%] m-auto border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-blue-300 transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={transaction.payer.payer_profile_image || dummyImg}
                        alt={transaction.payer.payer_name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                        // onError={(e) => {
                        //   e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(transaction.payer.payer_name)}&background=6366f1&color=fff`;
                        // }}
                      />
                      <div className={`absolute -bottom-1 -right-1 p-1 ${transaction.transactionType == "debit" ? "bg-blue-500" : "bg-green-500"} rounded-full flex items-center justify-center`}>
                        {transaction.transactionType == "debit" ?
                          <ArrowUpRight className="w-4 h-4 text-white" /> :
                          <ArrowDownLeft className="w-4 h-4 text-white" />
                        }
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {transaction.expense_name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-gray-500">
                          {new Date(transaction.payment_date).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span className="text-xs text-gray-600">
                          by {transaction.payer.payer_name}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-gray-800 text-2xl">
                      ₹{transaction.expense_amount.toLocaleString('en-IN')}
                    </p>
                    {transaction.payer.payer_id == user_data._id ? <div className="flex items-center justify-end gap-1 mt-1">
                      {transaction.payment_status === "Success" ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`text-xs font-medium ${transaction.payment_status === "Success" ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {transaction.payment_status}
                      </span>
                    </div> : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    });
  }, [transList, searchTerm, filterStatus]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    if (!filteredTransactions) return { totalExpense: 0, totalIncome: 0, totalTransactions: 0 };

    const stats = filteredTransactions.reduce((acc, transaction) => {
      acc.totalExpense += transaction.expense_amount;
      acc.totalTransactions += 1;
      return acc;
    }, { totalExpense: 0, totalIncome: 0, totalTransactions: 0 });

    return stats;
  }, [filteredTransactions]);


  useEffect(() => {
    if (user_id) {
      fetch_user(user_id);
    }
  }, []);
  return (
    <div className="flex">
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
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
                  <p className="text-gray-600 mt-1">Track and manage your financial activities</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <ReceiptIndianRupee className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total Transactions</p>
                      <p className="text-2xl font-bold">{summaryStats.totalTransactions}</p>
                    </div>
                    <ReceiptIndianRupee className="w-8 h-8 text-blue-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Total Amount</p>
                      <p className="text-2xl font-bold">₹{summaryStats.totalExpense.toLocaleString('en-IN')}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Success Rate</p>
                      <p className="text-2xl font-bold">
                        {summaryStats.totalTransactions > 0
                          ? Math.round((filteredTransactions?.filter(t => t.payment_status === 'Success').length / summaryStats.totalTransactions) * 100)
                          : 0
                        }%
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-200" />
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-3">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="success">Success</option>
                    <option value="failed">Failed</option>
                  </select>

                  {/* <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="date">Sort by Date</option>
                    <option value="amount">Sort by Amount</option>
                    <option value="name">Sort by Name</option>
                  </select> */}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 py-8">
            {!emptyTrans ? (
              <div className="space-y-8">
                {renderTransactions}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <ReceiptIndianRupee className="w-16 h-16 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">No Transactions Found</h2>
                <p className="text-gray-600">Start spending or earning to see your transactions here.</p>
              </div>
            )}
          </div>

          {/* Transaction Details Modal */}
          {currTrans.bool && currTrans.details && (
            <div
              ref={myRef}
              className="fixed inset-0 bg-[#000000b8] bg-opacity-50 flex items-center justify-center z-1000 p-4"
              style={{ display: 'none' }}
            >
              <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Transaction Details</h2>
                  <button
                    onClick={handleHideStatus}
                    className="p-2 cursor-pointer hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="text-center mb-6">
                  <div className="relative mb-4">
                    <img
                      src={currTrans.details.payer.payer_profile_image || dummyImg}
                      alt={currTrans.details.payer.payer_name}
                      className="w-30 h-30 mx-auto rounded-full object-cover border-4 border-gray-100"
                      // onError={(e) => {
                      //   e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currTrans.details.payer.payer_name)}&background=6366f1&color=fff`;
                      // }}
                    />
                    <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center ${currTrans.details.payment_status === "Success"
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                      }`}>
                      {currTrans.details.payment_status === "Success" ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <XCircle className="w-5 h-5" />
                      )}
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-1">
                    ₹{currTrans.details.expense_amount.toLocaleString('en-IN')}
                  </h3>
                  <p className="text-gray-600 mb-1">Paid by {currTrans.details.payer.payer_name}</p>
                  <p className={`font-medium ${currTrans.details.payment_status === "Success"
                    ? 'text-green-600'
                    : 'text-red-600'
                    }`}>
                    {currTrans.details.payment_status}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Expense Name</span>
                    <span className="text-gray-800 font-semibold">{currTrans.details.expense_name}</span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">{currTrans.details.source}</span>
                    <span className="text-gray-800 font-semibold">{currTrans.details.group_name}</span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Total Expense Amount</span>
                    <span className="text-gray-800 font-semibold">₹{currTrans.details.total_expense_amount}</span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Payer</span>
                    <div className="flex items-center gap-2">
                      <img
                        src={currTrans.details.payer.payer_profile_image || dummyImg}
                        alt={currTrans.details.payer.payer_name}
                        className="w-12 h-12 rounded-full object-cover"
                        // onError={(e) => {
                        //   e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currTrans.details.payer.payer_name)}&background=6366f1&color=fff`;
                        // }}
                      />
                      <span className="text-gray-800">{currTrans.details.payer.payer_name}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Receiver</span>
                    <div className="flex items-center gap-2">
                      <img
                        src={currTrans.details.receiver.receiver_profile_image || dummyImg}
                        alt={currTrans.details.receiver.receiver_name}
                        className="w-12 h-12 rounded-full object-cover"
                        // onError={(e) => {
                        //   e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currTrans.details.receiver.receiver_name)}&background=6366f1&color=fff`;
                        // }}
                      />
                      <span className="text-gray-800">{currTrans.details.receiver.receiver_name}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Expense ID</span>
                    <span className="text-gray-800 text-sm font-mono">{currTrans.details.expense_id}</span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Transaction ID</span>
                    <span className="text-gray-800 text-sm font-mono">{currTrans.details.transaction_id}</span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Payment ID</span>
                    <span className="text-gray-800 text-sm font-mono">{currTrans.details.payment_id}</span>
                  </div>

                  <div className="flex justify-between items-center py-3">
                    <span className="text-gray-600 font-medium">Date & Time</span>
                    <span className="text-gray-800">
                      {new Date(currTrans.details.payment_date).toLocaleString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Category</span>
                  <span className="text-gray-800">{currTrans.details.category || 'General'}</span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Transaction ID</span>
                  <span className="text-gray-800 text-sm font-mono">{currTrans.details.transaction_id}</span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Payment ID</span>
                  <span className="text-gray-800 text-sm font-mono">{currTrans.details.payment_id}</span>
                </div>

                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600 font-medium">Date & Time</span>
                  <span className="text-gray-800">
                    {new Date(currTrans.details.payment_date).toLocaleString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

              </div>

            </div>
          )}

          <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
          }
        `}</style>
        </div>
      </div>
    </div>
  );
}