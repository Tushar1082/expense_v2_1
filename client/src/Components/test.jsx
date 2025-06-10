// import React from 'react';

// const Test = () => {
//   // Dummy data for demonstration purposes
//   const userName = "Alex Sharma";
//   const totalBudget = 25000;
//   const spentAmount = 18500;
//   const remainingBudget = totalBudget - spentAmount;

//   const expenseProfiles = [
//     { name: "Groceries", budget: 5000, spent: 4200, icon: '🛒' },
//     { name: "Rent", budget: 10000, spent: 10000, icon: '🏠' },
//     { name: "Entertainment", budget: 3000, spent: 1500, icon: '🎬' },
//   ];

//   const savingGoals = [
//     { name: "Vacation Fund", target: 50000, saved: 32000, endDate: "Dec 2025" },
//     { name: "New Laptop", target: 15000, saved: 8000, endDate: "Sep 2025" },
//   ];

//   const recentTransactions = [
//     { desc: "Coffee Shop", amount: 350, category: "Food", date: "June 7" },
//     { desc: "Online Shopping", amount: 1200, category: "Shopping", date: "June 6" },
//     { desc: "Electricity Bill", amount: 2500, category: "Utilities", date: "June 5" },
//   ];

//   const pendingMoneyRequests = 2;
//   const upcomingPaymentsCount = 1;

//   return (
//     <div className="min-h-screen bg-gray-100 p-6 sm:p-8 font-sans">
//       <div className="max-w-7xl mx-auto">
//         {/* Header Section */}
//         <div className="flex justify-between items-center mb-8">
//           <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Hello, {userName}! 👋</h1>
//           <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300">
//             Add New Expense
//           </button>
//         </div>

//         {/* --- */}

//         {/* Financial Summary */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//           {/* Overall Budget Progress */}
//           <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between">
//             <div>
//               <h2 className="text-xl font-semibold text-gray-700 mb-4">Overall Spending</h2>
//               <div className="relative pt-1">
//                 <div className="flex mb-2 items-center justify-between">
//                   <div>
//                     <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
//                       Progress
//                     </span>
//                   </div>
//                   <div className="text-right">
//                     <span className="text-sm font-semibold inline-block text-blue-600">
//                       {(spentAmount / totalBudget * 100).toFixed(0)}%
//                     </span>
//                   </div>
//                 </div>
//                 <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
//                   <div
//                     style={{ width: `${(spentAmount / totalBudget * 100).toFixed(0)}%` }}
//                     className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
//                   ></div>
//                 </div>
//               </div>
//               <p className="text-2xl font-bold text-gray-900 mt-4">₹{spentAmount.toLocaleString()} <span className="text-lg font-medium text-gray-500">of ₹{totalBudget.toLocaleString()}</span></p>
//               <p className="text-sm text-gray-500">₹{remainingBudget.toLocaleString()} remaining</p>
//             </div>
//             <button className="mt-6 w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-md transition duration-300">
//               View All Expenses
//             </button>
//           </div>

//           {/* Saving Goals Progress */}
//           <div className="bg-white rounded-xl shadow-lg p-6">
//             <h2 className="text-xl font-semibold text-gray-700 mb-4">Saving Goals</h2>
//             <div className="space-y-4">
//               {savingGoals.map((goal, index) => (
//                 <div key={index} className="border-b border-gray-200 pb-3 last:border-b-0 last:pb-0">
//                   <div className="flex justify-between items-center mb-1">
//                     <span className="text-lg font-medium text-gray-800">{goal.name}</span>
//                     <span className="text-sm text-gray-600">{goal.endDate}</span>
//                   </div>
//                   <div className="relative pt-1">
//                     <div className="flex mb-1 items-center justify-between">
//                       <div>
//                         <span className="text-xs font-semibold inline-block text-green-600">
//                           ₹{goal.saved.toLocaleString()} / ₹{goal.target.toLocaleString()}
//                         </span>
//                       </div>
//                       <div className="text-right">
//                         <span className="text-xs font-semibold inline-block text-green-600">
//                           {(goal.saved / goal.target * 100).toFixed(0)}%
//                         </span>
//                       </div>
//                     </div>
//                     <div className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-green-200">
//                       <div
//                         style={{ width: `${(goal.saved / goal.target * 100).toFixed(0)}%` }}
//                         className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
//                       ></div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//             <button className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-md transition duration-300">
//               Manage Saving Goals
//             </button>
//           </div>

//           {/* Quick Actions / Notifications */}
//           <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between">
//             <div>
//               <h2 className="text-xl font-semibold text-gray-700 mb-4">Quick Actions</h2>
//               <div className="space-y-3">
//                 <button className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 rounded-md flex items-center justify-center">
//                   <span className="mr-2">➕</span> Create New Expense Profile
//                 </button>
//                 <button className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-md flex items-center justify-center">
//                   <span className="mr-2">👥</span> Create New Group Expense
//                 </button>
//                 <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 rounded-md flex items-center justify-center">
//                   <span className="mr-2">🎯</span> Add New Saving Goal
//                 </button>
//               </div>
//             </div>
//             <div className="mt-6">
//               <h3 className="text-xl font-semibold text-gray-700 mb-3">Notifications</h3>
//               <div className="space-y-2">
//                 {pendingMoneyRequests > 0 && (
//                   <div className="bg-yellow-100 border border-yellow-200 text-yellow-800 p-3 rounded-md flex justify-between items-center">
//                     <span>You have **{pendingMoneyRequests} pending money requests.**</span>
//                     <a href="#" className="text-yellow-700 hover:underline font-semibold">View</a>
//                   </div>
//                 )}
//                 {upcomingPaymentsCount > 0 && (
//                   <div className="bg-blue-100 border border-blue-200 text-blue-800 p-3 rounded-md flex justify-between items-center">
//                     <span>**{upcomingPaymentsCount} upcoming payment** due soon.</span>
//                     <a href="#" className="text-blue-700 hover:underline font-semibold">View</a>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* --- */}

//         {/* Expense Profiles & Recent Transactions */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//           {/* Expense Profiles */}
//           <div className="bg-white rounded-xl shadow-lg p-6">
//             <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Expense Profiles</h2>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               {expenseProfiles.map((profile, index) => (
//                 <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
//                   <div className="flex items-center mb-2">
//                     <span className="text-2xl mr-2">{profile.icon}</span>
//                     <h3 className="text-lg font-semibold text-gray-800">{profile.name}</h3>
//                   </div>
//                   <p className="text-sm text-gray-600">Spent: ₹{profile.spent.toLocaleString()} / ₹{profile.budget.toLocaleString()}</p>
//                   <div className="relative pt-1 mt-2">
//                     <div className="overflow-hidden h-1 text-xs flex rounded bg-red-200">
//                       <div
//                         style={{ width: `${(profile.spent / profile.budget * 100).toFixed(0)}%` }}
//                         className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"
//                       ></div>
//                     </div>
//                   </div>
//                   <button className="text-sm text-blue-600 hover:underline mt-3">View Details</button>
//                 </div>
//               ))}
//             </div>
//             <button className="mt-6 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-md transition duration-300">
//               View All Profiles
//             </button>
//           </div>

//           {/* Recent Transactions */}
//           <div className="bg-white rounded-xl shadow-lg p-6">
//             <h2 className="text-xl font-semibold text-gray-700 mb-4">Recent Transactions</h2>
//             <div className="space-y-4">
//               {recentTransactions.map((transaction, index) => (
//                 <div key={index} className="flex justify-between items-center border-b pb-3 border-gray-200 last:border-b-0 last:pb-0">
//                   <div>
//                     <p className="text-lg font-medium text-gray-800">{transaction.desc}</p>
//                     <p className="text-sm text-gray-500">{transaction.category} • {transaction.date}</p>
//                   </div>
//                   <p className="text-lg font-semibold text-red-600">- ₹{transaction.amount.toLocaleString()}</p>
//                 </div>
//               ))}
//             </div>
//             <button className="mt-6 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-md transition duration-300">
//               View All Transactions
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Test;


import React from 'react';
import { motion } from 'framer-motion';
import { ChartBar, Users, PiggyBank, DollarSign, Package, CreditCard, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="font-sans text-gray-800">
      {/* Hero Section */}
      <section className="bg-white py-16 text-center px-6">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl font-bold mb-4">
          Track Your Expenses Effortlessly
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }} 
          whileInView={{ opacity: 1 }} 
          transition={{ delay: 0.2, duration: 0.6 }} 
          className="text-lg sm:text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
          A sleek app that helps you log expenses, split bills, and reach your saving goals.
        </motion.p>
        <motion.button 
          initial={{ scale: 0.9, opacity: 0 }} 
          whileInView={{ scale: 1, opacity: 1 }} 
          transition={{ delay: 0.4, duration: 0.5 }} 
          className="mt-4 inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md shadow-lg">
          Sign Up Now 
          <ArrowRight className="ml-2 w-5 h-5" />
        </motion.button>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="container mx-auto space-y-12">
          {/* Track Expenses */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row items-center gap-6">
            {/* Placeholder image */}
            <img src="path/to/chart-screenshot.jpg" alt="Expenses Chart" className="w-full md:w-1/2 rounded-lg shadow-md" />
            {/* Text content */}
            <div className="md:w-1/2 space-y-4">
              <h2 className="flex items-center text-2xl font-semibold">
                <ChartBar className="w-6 h-6 text-blue-600 mr-2" />
                Track My Expenses
              </h2>
              <p className="text-gray-600">
                Log all your expenses in one place with ease. View daily, weekly, or monthly summaries with charts to see where your money goes.
              </p>
            </div>
          </motion.div>

          {/* Group Expenses */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex flex-col md:flex-row items-center gap-6">
            <img src="path/to/group-screenshot.jpg" alt="Group Expenses" className="w-full md:w-1/2 order-2 md:order-1 rounded-lg shadow-md" />
            <div className="md:w-1/2 order-1 md:order-2 space-y-4">
              <h2 className="flex items-center text-2xl font-semibold">
                <Users className="w-6 h-6 text-blue-600 mr-2" />
                Split Bills with Friends
              </h2>
              <p className="text-gray-600">
                Easily manage shared expenses. Invite friends, split costs, and settle up fairly. No more complicated math – the app handles it.
              </p>
            </div>
          </motion.div>

          {/* Saving Goals */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col md:flex-row items-center gap-6">
            <img src="path/to/savings-screenshot.jpg" alt="Saving Goals" className="w-full md:w-1/2 rounded-lg shadow-md" />
            <div className="md:w-1/2 space-y-4">
              <h2 className="flex items-center text-2xl font-semibold">
                <PiggyBank className="w-6 h-6 text-blue-600 mr-2" />
                Save Towards Goals
              </h2>
              <p className="text-gray-600">
                Set savings targets (vacation fund, gadget, etc.) and track progress. The app helps you stay motivated by visualizing your achievements.
              </p>
            </div>
          </motion.div>

          {/* Friends & Social */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-col md:flex-row items-center gap-6">
            <img src="path/to/friends-screenshot.jpg" alt="Friends Page" className="w-full md:w-1/2 order-2 md:order-1 rounded-lg shadow-md" />
            <div className="md:w-1/2 order-1 md:order-2 space-y-4">
              <h2 className="flex items-center text-2xl font-semibold">
                <Users className="w-6 h-6 text-blue-600 mr-2" />
                Friends & Communities
              </h2>
              <p className="text-gray-600">
                Connect with other users, view shared expenses in groups, and offer tips. Our social page lets you follow friends and compare saving achievements.
              </p>
            </div>
          </motion.div>

          {/* Money Requests */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-col md:flex-row items-center gap-6">
            <img src="path/to/requests-screenshot.jpg" alt="Money Requests" className="w-full md:w-1/2 rounded-lg shadow-md" />
            <div className="md:w-1/2 space-y-4">
              <h2 className="flex items-center text-2xl font-semibold">
                <DollarSign className="w-6 h-6 text-blue-600 mr-2" />
                Money Requests
              </h2>
              <p className="text-gray-600">
                Quickly send or request money within the app. Get notified of incoming requests and settle up in just a few taps – no cash swapping needed.
              </p>
            </div>
          </motion.div>

          {/* Transactions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ delay: 1.0, duration: 0.6 }}
            className="flex flex-col md:flex-row items-center gap-6">
            <img src="path/to/transactions-screenshot.jpg" alt="Transactions" className="w-full md:w-1/2 order-2 md:order-1 rounded-lg shadow-md" />
            <div className="md:w-1/2 order-1 md:order-2 space-y-4">
              <h2 className="flex items-center text-2xl font-semibold">
                <CreditCard className="w-6 h-6 text-blue-600 mr-2" />
                Transaction History
              </h2>
              <p className="text-gray-600">
                View a comprehensive log of all activity. Filter by date, category or user, and export data if needed. Keeping track has never been easier.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Call-to-Action Footer */}
      <section className="bg-white py-12 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to take control of your finances?</h2>
        <p className="text-gray-600 mb-6">Join now and start tracking your expenses for free. Your wallet will thank you!</p>
        <motion.button 
          initial={{ scale: 0.9, opacity: 0 }} 
          whileInView={{ scale: 1, opacity: 1 }} 
          transition={{ delay: 0.2, duration: 0.5 }} 
          className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md shadow-lg">
          Get Started 
          <ArrowRight className="ml-2 w-5 h-5" />
        </motion.button>
      </section>
    </div>
  );
};

export default LandingPage;


