import { useState, useMemo, useEffect } from 'react';
import { LineChart, BarChart, PieChart as ReChartPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, Bar, Layer } from 'recharts';
import { PieChart, TrendingUp, Users, Target, CreditCard, Puzzle, Layers, Calendar } from 'lucide-react';
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import weekday from "dayjs/plugin/weekday";
// import isoWeekday from "dayjs/plugin/isoWeekday";
import dayOfYear from "dayjs/plugin/dayOfYear"; // ✅ Add this

dayjs.extend(weekday);
dayjs.extend(isoWeek);
dayjs.extend(dayOfYear);
// dayjs.extend(isoWeekday);

// Sample data sets - replace with your actual data
const expenseByCategory = [
  { name: 'Food', value: 400 },
  { name: 'Travel', value: 300 },
  { name: 'Rent', value: 800 },
  { name: 'Shopping', value: 250 },
  { name: 'Entertainment', value: 150 },
  { name: 'Utilities', value: 200 },
];

const monthlyData = [
  { month: 'Jan', expenses: 1800, savings: 500 },
  { month: 'Feb', expenses: 1600, savings: 600 },
  { month: 'Mar', expenses: 1900, savings: 450 },
  { month: 'Apr', expenses: 1700, savings: 700 },
  { month: 'May', expenses: 1500, savings: 800 },
  { month: 'Jun', expenses: 1650, savings: 750 },
];

const groupExpenses = [
  { name: 'You', amount: 320 },
  { name: 'Alex', amount: 280 },
  { name: 'Taylor', amount: 220 },
  { name: 'Jordan', amount: 180 },
];

const recentTransactions = [
  { id: 1, description: 'Grocery Store', date: 'May 5', amount: -78.52, category: 'Food' },
  { id: 2, description: 'Monthly Rent', date: 'May 3', amount: -800.00, category: 'Rent' },
  { id: 3, description: 'Salary Deposit', date: 'May 1', amount: 2400.00, category: 'Income' },
  { id: 4, description: 'Electric Bill', date: 'Apr 28', amount: -65.27, category: 'Utilities' },
  { id: 5, description: 'Restaurant', date: 'Apr 25', amount: -42.75, category: 'Food' },
];

const COLORS = ['#f15b42', '#f17c42', '#f19c42', '#f1bc42', '#e5f142', '#c5f142'];

const Colors = [
  '#f15b42', // red-orange
  '#f19c42', // orange
  '#42c9f1', // blue
  '#42f1a7', // green
  '#c942f1', // purple
  '#f1429c', // pink
  '#7a42f1', // indigo
  '#f1e842', // yellow
];

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

// Chart Components
export default function ChartsCollection() {
  return (
    <div className="p-6 space-y-8 bg-gray-50">
      <MonthlyExpenseVsSavings />
      <GroupExpenseComparison />
      {/* <div className='flex flex-wrap gap-[2rem] items-center'>
        <SavingsGoalProgress />
      </div> */}
      {/* <RecentTransactionsTable /> */}
    </div>
  );
}

// 1. Donut Chart for Expense Distribution by Category
export function ExpenseCategoryDonut({ data, label }) {
  // Convert amounts to float and sum them correctly
  const totalAmount = data.reduce((sum, item) => {
    const amount = parseFloat(item.amount || item.amount || 0);
    return sum + amount;
  }, 0);

  const processedData = data.map((entry) => ({
    ...entry,
    amount: parseFloat(entry.amount || entry.amount || 0),
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex-1">
      <div className="flex items-center mb-6">
        <PieChart size={20} className="text-gray-400 mr-2" />
        <h3 className="font-bold text-gray-800">{label}</h3>
      </div>

      <div className="h-64 flex justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <ReChartPieChart>
            <Pie
              data={processedData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="amount"
            >
              {processedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </ReChartPieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2">
        {processedData.map((entry, index) => {
          const percent = totalAmount > 0 ? ((entry.amount / totalAmount) * 100).toFixed(2) : 0;
          return (
            <div key={index} className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className="text-sm text-gray-600">{entry.name}</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium">₹{entry.amount.toFixed(2)}</span>
                <span className="text-xs text-gray-500 ml-1">({percent}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 2. Line Chart for Monthly Expenses vs Savings Trend
export function MonthlyExpenseVsSavings() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <TrendingUp size={20} className="text-gray-400 mr-2" />
          <h3 className="font-bold text-gray-800">Monthly Expenses vs Savings</h3>
        </div>
        <div className="flex space-x-2">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-400 mr-1"></div>
            <span className="text-xs text-gray-500">Expenses</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-400 mr-1"></div>
            <span className="text-xs text-gray-500">Savings</span>
          </div>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
            <XAxis dataKey="month" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="#f15b42"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="savings"
              stroke="#4ade80"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// 3. Bar Chart for Group Expenses Comparison
export function GroupExpenseComparison() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center mb-6">
        <Users size={20} className="text-gray-400 mr-2" />
        <h3 className="font-bold text-gray-800">Group Expenses</h3>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={groupExpenses}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
              {groupExpenses.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === 0 ? '#f15b42' : '#f19c42'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Bar Chat for category and sub category comparison
export function CatSubCatExpComparison({ expense_by_category, expense_by_subCategory, total_budget }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      {/* Category */}
      <div className="h-70">
        <ResponsiveContainer width="100%" height="100%">
          <div className="flex items-center mb-6">
            <Layers size={20} className="text-gray-400 mr-2" />
            <h3 className="font-bold text-gray-800">Category Wise Expenses</h3>
          </div>
          <BarChart data={expense_by_category}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis type='number' domain={[0, total_budget]} stroke="#9ca3af" />
            <Tooltip />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
              {expense_by_category.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={Colors[index % Colors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Sub Category */}
      <div className='h-70 mt-15 mb-10'>
        <ResponsiveContainer width="100%" height="100%">
          <div className="flex items-center mb-6">
            <Puzzle size={20} className="text-gray-400 mr-2" />
            <h3 className="font-bold text-gray-800">Sub-Category Wise Expenses</h3>
          </div>
          <BarChart data={expense_by_subCategory}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis type='number' domain={[0, total_budget]} stroke="#9ca3af" />
            <Tooltip />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
              {expense_by_subCategory.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={Colors[index % Colors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// export function ExpPeriodComparison({ exp_data, total_budget, viewType = "monthly" }) {
//   // Group expenses by day/week/month/year
//   const groupExpensesByPeriod = () => {
//     const group = {};

//     exp_data.forEach((exp) => {
//       const date = dayjs(exp.created_at);
//       let key = "";

//       switch (viewType) {
//         case "monthly":
//           key = date.format("MMM YYYY"); // e.g., May 2025
//           break;
//         case "yearly":
//           key = date.format("YYYY"); // e.g., 2025
//           break;
//         default:
//           key = date.format("MMM YYYY");
//       }

//       if (!group[key]) group[key] = 0;
//       group[key] += parseFloat(exp.amount);
//     });

//     return Object.entries(group).map(([name, amount]) => ({
//       name,
//       amount,
//     }));
//   };

//   const groupedData = groupExpensesByPeriod();

//   return (
//     <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 m-8">
//       <div className="flex items-center mb-6">
//         <Layers size={20} className="text-gray-400 mr-2" />
//         <h3 className="font-bold text-gray-800">
//           Expenses - {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
//         </h3>
//       </div>
//       <div className="h-80">
//         <ResponsiveContainer width="100%" height="100%">
//           <BarChart data={groupedData}>
//             <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
//             <XAxis dataKey="name" stroke="#9ca3af" />
//             <YAxis type="number" domain={[0, total_budget]} stroke="#9ca3af" />
//             <Tooltip />
//             <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
//               {groupedData.map((entry, index) => (
//                 <Cell key={`cell-${index}`} fill={Colors[index % Colors.length]} />
//               ))}
//             </Bar>
//           </BarChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// }

export function MonthlyWeekChart({ exp_data = [], total_budget = 1000 }) {
  const [selectedMonth, setSelectedMonth] = useState("");

  // Generate dropdown options from exp_data
  const monthOptions = useMemo(() => {
    const unique = new Set();

    exp_data.forEach((exp) => {
      const d = dayjs(exp.created_at);
      unique.add(d.format("YYYY-MM"));
    });

    const sorted = Array.from(unique).sort(); // oldest to newest
    if (!selectedMonth && sorted.length > 0) {
      setSelectedMonth(sorted[0]);
    }
    return sorted;
  }, [exp_data]);

  // Group expenses into Week 1–4 based on selectedMonth
  const weeklyData = useMemo(() => {
    const result = {
      "Week 1": 0,
      "Week 2": 0,
      "Week 3": 0,
      "Week 4": 0,
    };

    exp_data.forEach((exp) => {
      const date = dayjs(exp.created_at);
      const m = date.format("YYYY-MM");
      if (m !== selectedMonth) return;

      const day = date.date();
      let week = "";
      if (day <= 7) week = "Week 1";
      else if (day <= 14) week = "Week 2";
      else if (day <= 21) week = "Week 3";
      else week = "Week 4";

      result[week] += parseFloat(exp.amount || exp.amount || 0);
    });

    return Object.entries(result).map(([name, amount]) => ({ name, amount }));
  }, [exp_data, selectedMonth]);

  return (
    <div className="bg-white rounded-xl shadow p-6 border border-gray-200 m-8">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <Layers size={20} className="text-gray-400 mr-2" />

        Expenses - Weekly</h2>

      <select
        className="mb-4 p-2 border rounded"
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
      >
        {monthOptions.map((month) => (
          <option key={month} value={month}>
            {dayjs(month).format("MMMM YYYY")}
          </option>
        ))}
      </select>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, total_budget]} />
            <Tooltip />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
              {weeklyData.map((_, i) => (
                <Cell key={i} fill={Colors[i % Colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function MonthlyExpenseChart({ exp_data, total_budget }) {
  const [selectedYear, setSelectedYear] = useState("");

  const years = useMemo(() => {
    const y = new Set();
    exp_data.forEach((e) => {
      y.add(dayjs(e.created_at).year());
    });
    const sorted = Array.from(y).sort();
    if (!selectedYear && sorted.length > 0) setSelectedYear(sorted[0]);
    return sorted;
  }, [exp_data]);

  const groupedData = useMemo(() => {
    const group = {};

    exp_data.forEach((exp) => {
      const date = dayjs(exp.created_at);
      const year = date.year();
      if (year.toString() !== selectedYear.toString()) return;

      const key = date.format("MMM YYYY"); // e.g., May 2025
      if (!group[key]) group[key] = 0;
      group[key] += parseFloat(exp.amount || exp.amount || 0);
    });

    return Object.entries(group).map(([name, amount]) => ({ name, amount }));
  }, [exp_data, selectedYear]);

  useEffect(() => {
    console.log(exp_data);
  }, []);
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 m-8">
      <div className="mb-4">
        <div className="flex items-center mb-4">
          <Layers size={20} className="text-gray-400 mr-2" />
          <h3 className="font-bold text-gray-800">Monthly Expenses</h3>
        </div>
        <select
          className="p-2 border rounded"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={groupedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis domain={[0, total_budget]} stroke="#9ca3af" />
            <Tooltip />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
              {groupedData.map((_, index) => (
                <Cell key={index} fill={Colors[index % Colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function YearlyExpenseChart({ exp_data, total_budget }) {
  const groupedData = useMemo(() => {
    const group = {};

    exp_data.forEach((exp) => {
      const date = dayjs(exp.created_at);
      const key = date.format("YYYY"); // Year only
      if (!group[key]) group[key] = 0;
      group[key] += parseFloat(exp.amount || exp.amount || 0);
    });

    return Object.entries(group).map(([name, amount]) => ({ name, amount }));
  }, [exp_data]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 m-8">
      <div className="flex items-center mb-6">
        <Layers size={20} className="text-gray-400 mr-2" />
        <h3 className="font-bold text-gray-800">Yearly Expenses</h3>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={groupedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis domain={[0, total_budget]} stroke="#9ca3af" />
            <Tooltip />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
              {groupedData.map((_, index) => (
                <Cell key={index} fill={Colors[index % Colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// export function AverageExpenseOverview({ exp_data = [], total_budget }) {
//   const [selectedYear, setSelectedYear] = useState("");

//   // Get list of years from expense data
//   const yearOptions = useMemo(() => {
//     const years = new Set();
//     exp_data.forEach((exp) => {
//       const year = dayjs(exp.created_at).year();
//       years.add(year);
//     });
//     const sortedYears = Array.from(years).sort();
//     if (!selectedYear && sortedYears.length > 0) {
//       setSelectedYear(sortedYears[0]);
//     }
//     return sortedYears;
//   }, [exp_data, selectedYear]);

//   // Compute correct average expenses
//   const averageData = useMemo(() => {
//     if (!selectedYear) return [];

//     const expensesInYear = exp_data.filter(
//       (exp) => dayjs(exp.created_at).year().toString() === selectedYear.toString()
//     );

//     const total = expensesInYear.reduce((sum, exp) => {
//       const amount = parseFloat(exp.amount || exp.amount || 0);
//       return sum + amount;
//     }, 0);

//     const year = parseInt(selectedYear);
//     const daysInYear = dayjs(`${year}-12-31`).dayOfYear(); // 365 or 366
//     const weeksInYear = 52;
//     const monthsInYear = 12;

//     const dailyAvg = total / daysInYear;
//     const weeklyAvg = total / weeksInYear;
//     const monthlyAvg = total / monthsInYear;
//     const yearlyAvg = total;

//     return [
//       { name: "Daily", amount: parseFloat(dailyAvg.toFixed(2)) },
//       { name: "Weekly", amount: parseFloat(weeklyAvg.toFixed(2)) },
//       { name: "Monthly", amount: parseFloat(monthlyAvg.toFixed(2)) },
//       { name: "Yearly", amount: parseFloat(yearlyAvg.toFixed(2)) },
//     ];
//   }, [exp_data, selectedYear]);

//   return (
//     <div className="bg-white rounded-xl shadow p-6 border border-gray-200 m-8">
//       <h2 className="text-lg font-semibold mb-4 flex items-center">
//         <Layers size={20} className="text-gray-400 mr-2" />
//         Average Expenses Overview - (Daily, Weekly, Monthly, Yearly)
//       </h2>

//       <select
//         className="mb-4 p-2 border rounded"
//         value={selectedYear}
//         onChange={(e) => setSelectedYear(e.target.value)}
//       >
//         {yearOptions.map((year) => (
//           <option key={year} value={year}>
//             {year}
//           </option>
//         ))}
//       </select>

//       <div className="h-80">
//         <ResponsiveContainer width="100%" height="100%">
//           <BarChart data={averageData}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="name" />
//             <YAxis domain={[0, total_budget]} />
//             <Tooltip />
//             <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
//               {averageData.map((_, i) => (
//                 <Cell key={i} fill={Colors[i % Colors.length]} />
//               ))}
//             </Bar>
//           </BarChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// }

// 4. Progress Circle for Savings Goal

export function MonthlyDailyAverage({ exp_data = [] }) {
  const [selectedYear, setSelectedYear] = useState("");

  const yearOptions = useMemo(() => {
    const years = new Set();
    exp_data.forEach((exp) => {
      const year = dayjs(exp.created_at).year();
      years.add(year);
    });
    const sorted = Array.from(years).sort();
    if (!selectedYear && sorted.length > 0) {
      setSelectedYear(sorted[0]);
    }
    return sorted;
  }, [exp_data]);

  const chartData = useMemo(() => {
    const data = Array(12).fill(null).map((_, index) => ({
      month: monthNames[index],
      totalAmount: 0,
      totalDays: 0,
    }));

    const monthlyDates = Array(12).fill(null).map(() => new Set());

    exp_data.forEach((exp) => {
      const date = dayjs(exp.created_at);
      if (date.year().toString() !== selectedYear.toString()) return;

      const monthIndex = date.month();
      const amount = parseFloat(exp.amount || exp.amount || 0);
      data[monthIndex].totalAmount += amount;
      monthlyDates[monthIndex].add(date.format("YYYY-MM-DD"));
    });

    return data.map((entry, index) => ({
      name: monthNames[index],
      average: entry.totalDays === 0
        ? (entry.totalAmount / monthlyDates[index].size || 0)
        : (entry.totalAmount / entry.totalDays),
    }));
  }, [exp_data, selectedYear]);

  return (
    <div className="bg-white rounded-xl shadow p-6 border border-gray-200 m-8">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <Layers size={20} className="text-gray-400 mr-2" />
        Average Daily Expenses - Per Month
      </h2>

      <select
        className="mb-4 p-2 border rounded"
        value={selectedYear}
        onChange={(e) => setSelectedYear(e.target.value)}
      >
        {yearOptions.map((year) => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="average" radius={[4, 4, 0, 0]}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={Colors[i % Colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// export function SavingsGoalProgress() {
//   const savingsGoal = 5000;
//   const currentSavings = 3800;
//   const savingsPercentage = (currentSavings / savingsGoal) * 100;

//   const circleSize = 140;
//   const strokeWidth = 10;
//   const radius = (circleSize - strokeWidth) / 2;
//   const circumference = 2 * Math.PI * radius;
//   const strokeDashoffset = circumference - (savingsPercentage / 100) * circumference;

//   return (
//     <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex-1">
//       <div className="flex items-center mb-6">
//         <Target size={20} className="text-gray-400 mr-2" />
//         <h3 className="font-bold text-gray-800">Savings Goal</h3>
//       </div>

//       <div className="flex flex-col items-center">
//         <div className="relative" style={{ width: circleSize, height: circleSize }}>
//           <svg className="w-full h-full" viewBox={`0 0 ${circleSize} ${circleSize}`}>
//             <circle
//               className="text-gray-200"
//               stroke="currentColor"
//               strokeWidth={strokeWidth}
//               fill="none"
//               cx={circleSize / 2}
//               cy={circleSize / 2}
//               r={radius}
//             />
//             <circle
//               className="text-orange-500"
//               stroke="url(#gradient)"
//               strokeWidth={strokeWidth}
//               strokeDasharray={circumference}
//               strokeDashoffset={strokeDashoffset}
//               strokeLinecap="round"
//               fill="none"
//               cx={circleSize / 2}
//               cy={circleSize / 2}
//               r={radius}
//               transform={`rotate(-90 ${circleSize / 2} ${circleSize / 2})`}
//             />
//             <defs>
//               <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
//                 <stop offset="0%" stopColor="#f15b42" />
//                 <stop offset="100%" stopColor="#f19c42" />
//               </linearGradient>
//             </defs>
//             <text
//               x="50%"
//               y="50%"
//               dy=".3em"
//               textAnchor="middle"
//               className="font-bold text-2xl fill-gray-800"
//             >
//               {savingsPercentage.toFixed(0)}%
//             </text>
//           </svg>
//         </div>

//         <div className="mt-4 text-center">
//           <h4 className="font-medium text-gray-800">Vacation Fund</h4>
//           <p className="text-gray-500 text-sm mt-1">
//             ${currentSavings} of ${savingsGoal}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

// 5. Table for Recent Transactions


export function RecentTransactionsTable() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <CreditCard size={20} className="text-gray-400 mr-2" />
          <h3 className="font-bold text-gray-800">Recent Transactions</h3>
        </div>
        <button className="text-sm text-gray-500 hover:text-gray-700">View All</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-500 text-sm border-b border-gray-100">
              <th className="pb-3 font-medium">Description</th>
              <th className="pb-3 font-medium">Date</th>
              <th className="pb-3 font-medium">Category</th>
              <th className="pb-3 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {recentTransactions.map((transaction) => (
              <tr key={transaction.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-4">{transaction.description}</td>
                <td className="py-4 text-gray-500 text-sm">{transaction.date}</td>
                <td className="py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${transaction.category === 'Income'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                    }`}>
                    {transaction.category}
                  </span>
                </td>
                <td className={`py-4 text-right font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                  {transaction.amount > 0 ? '+' : ''}
                  ${Math.abs(transaction.amount).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function MonthlySavingChart({ goal_data }) {
  const [selectedYear, setSelectedYear] = useState("");

  const years = useMemo(() => {
    const y = new Set();
    goal_data.forEach((goal) => {
      y.add(dayjs(goal.start_date).year());
    });
    const sorted = Array.from(y).sort();
    if (!selectedYear && sorted.length > 0) setSelectedYear(sorted[0]);
    return sorted;
  }, [goal_data]);

  const groupedData = useMemo(() => {
    const group = {};

    goal_data.forEach((goal) => {
      const startDate = dayjs(goal.start_date);

      goal.contributions?.forEach((contribution) => {
        const contribDate = dayjs(contribution.date);

        // Only include contributions on or after the goal's start date
        if (contribDate.isBefore(startDate, "day")) return;

        const key = contribDate.format("MMM YYYY"); // e.g., Jun 2025
        if (!group[key]) group[key] = 0;
        group[key] += parseFloat(contribution.amount || 0);
      });
    });

    return Object.entries(group)
      .sort(([a], [b]) =>
        dayjs(a, "MMM YYYY").isAfter(dayjs(b, "MMM YYYY")) ? 1 : -1
      )
      .map(([name, amount]) => ({ name, amount }));
  }, [goal_data, selectedYear]);

  const maxAmount = useMemo(() => {
    return Math.max(...groupedData.map((d) => d.amount), 0);
  }, [groupedData]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 m-8">
      <div className="mb-4">
        <div className="flex items-center mb-4">
          <Layers size={20} className="text-gray-400 mr-2" />
          <h3 className="font-bold text-gray-800">Monthly Savings</h3>
        </div>
        <select
          className="p-2 border rounded"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={groupedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis
              domain={[0, Math.ceil(maxAmount / 1000) * 1000]}
              stroke="#9ca3af"
            />
            <Tooltip />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
              {groupedData.map((_, index) => (
                <Cell key={index} fill={Colors[index % Colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}