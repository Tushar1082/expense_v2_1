import { useEffect, useRef, useState } from "react";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import dummy_image from "../../../public/dummy_image.webp";
import empty_expense_list from '../../../public/empty.jpg';
import { PlusIcon, ArrowBigLeftDashIcon, ChartBarIcon, SearchIcon, FileSpreadsheet } from "lucide-react";
import { ExpensePopup } from "../Create/create";
import DataTable from 'react-data-table-component';
import {
    // AverageExpenseOverview, 
    MonthlyDailyAverage,
    CatSubCatExpComparison, 
    ExpenseCategoryDonut, 
    MonthlyExpenseChart, 
    MonthlyWeekChart, 
    YearlyExpenseChart} from '../Graphs/graphs';

export default function Expenses({server_url,expense_prof,user_id,profile_id, set_loading, show_toast, set_show_selected_exp_prof}){
    const [is_exp_empty, set_is_exp_empty] = useState(expense_prof.expenses.length>0?false:true);
    const [show_create_exp_list,set_show_create_exp_list] = useState(false);
    const [exp_data, set_exp_data] = useState(expense_prof.expenses||[]);
    const [cal, setCal] = useState({
        total:0,
        avg:0,
        max:0
    });
    const [exp_cat_amount, set_exp_cat_amount] = useState([]);
    const [exp_subcat_amount,set_exp_subcat_amount] = useState([]);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [edit_expense,set_edit_expense] = useState({
        expense:'',
        edit_exp: false
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
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
            fontWeight:'500'
            },
        },
    };

    const columns = [
    {
        name: 'S.No.',
        cell: (row, index, column, id) => String((currentPage - 1) * rowsPerPage + index + 1)+".",
        width: '7%',
        sortable: false
    },
    {
        name: 'Name',
        selector: row => row.name,
        sortable: true,
        width:'11%'
    },
    {
        name: 'Category',
        selector: row => row.category,
        sortable: true,
        width:'11%'
    },
    {
        name: 'Sub-Category',
        selector: row => row.subCategory,
        // width: '10rem',
        sortable: true,
        width:'12%'
    },
    {
        name: 'Amount',
        selector: row => parseFloat(row.amount || 0).toFixed(2),
        sortable: true,
        right: true,
        width:'10%'
    },
    {
        name: 'Date',
        selector: row => new Date(row.created_at).toLocaleDateString("en-gb"),
        sortable: true,
        width:'11%'
    },
    {
        name: 'Last Updated',
        selector: row => new Date(row.updated_at).toLocaleDateString("en-gb"),
        sortable: true,
        width:'11%'
    },
    {
        name: 'Description',
        selector: row => row.exp_description,
        width:'18%'
    },
    {
        name: 'Actions',
        cell: (row) => (
        <div className="flex gap-2 justify-center items-center">
            <button
            className="p-1 hover:bg-green-100 rounded cursor-pointer"
            onClick={()=>{set_edit_expense({expense: row, edit_exp: true}), set_show_create_exp_list(true)}}
            >
                <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill="#6b8e23">
                    <path d='m7 17.013 4.413-.015 9.632-9.54c.378-.378.586-.88.586-1.414s-.208-1.036-.586-1.414l-1.586-1.586c-.756-.756-2.075-.752-2.825-.003L7 12.583v4.43zM18.045 4.458l1.589 1.583-1.597 1.582-1.586-1.585 1.594-1.58zM9 13.417l6.03-5.973 1.586 1.586-6.029 5.971L9 15.006v-1.589z'/>
                    <path d='M5 21h14c1.103 0 2-.897 2-2v-8.668l-2 2V19H8.158c-.026 0-.053.01-.079.01-.033 0-.066-.009-.1-.01H5V5h6.847l2-2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2z'/>
                </svg>
            </button>

            <button
            className="p-1 hover:bg-red-100 rounded cursor-pointer"
            onClick={() => handle_delete(row.expense_id)}
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
        width:'9%'
    }
    ];

    // async function fetch_expense_list_data() {
    //     set_loading(true);
    //     try {
    //         const result = await fetch(`${import.meta.env.VITE_SERVER_API}/track-my-expenses/expenses?user_id=${user_id}&profile_id=${profile_id}`);            
    //         const finalRes = await result.json();

    //         if (finalRes.failed) {
    //             show_toast({ status: "Fail", message: "Something went wrong while fetching expenses." });
    //         } else if (finalRes.notFound) {
    //             set_is_exp_empty(true);
    //             show_toast({ status: "Info", message: "No expenses found for this profile." });
    //         } else {
    //             show_toast({ status: "Success", message: "Expenses loaded successfully." });
    //             console.log(finalRes);
    //             set_exp_data(finalRes.expenses);
    //         }
    //     } catch (error) {
    //         show_toast({ status: "error", message: "Failed to connect to the server." });
    //         console.log(error);
    //     } finally {
    //         set_loading(false);
    //     }
    // }
    async function handle_delete(data) {
        const expense_id = data;

        try {
            const result = await fetch(`${import.meta.env.VITE_SERVER_API}/${server_url}`, {
                method: "DELETE",
                headers: {
                    'content-type': 'application/json',
                    "Authorization": `Bearer ${user_id}`, //user_id as token
                },
                body: JSON.stringify({
                    user_id,
                    profile_id: expense_prof.expenses_profileId,
                    expense_id
                })
            });

            const finalRes = await result.json();

            if (finalRes.failed) {
                console.log(finalRes);
                show_toast("error", finalRes.message || "Something went wrong.");
            } else if (!finalRes.updated) {
                show_toast("warning", "Expense not deleted. Try again.");
            } else {
                show_toast("success", "Expense deleted successfully.");
                // fetch_expense_list_data();
                set_exp_data((prev)=>{
                    const arr = prev.filter((elm)=> elm.expense_id != data);
                    return arr;
                });
            }
        } catch (error) {
            console.error(error);
            show_toast("error", "Network error. Please try again later.");
        }
    }

    function profile_calulation(){
        if(exp_data && exp_data.length>0){
            let sum = 0, avg=0, max=0, exp_cat_data={}, exp_subcat_data={};
            exp_data.map((elm)=>{
                let amount = parseFloat(elm.amount); 
                sum+= amount;
                if(max<amount){
                    max = amount;
                }
                exp_cat_data[elm.category] = (exp_cat_data[elm.category] || 0) + amount;
                exp_subcat_data[elm.subCategory] = (exp_subcat_data[elm.subCategory] || 0) + amount;
            });
            avg = sum/exp_data.length;
            
            const catArry = Object.entries(exp_cat_data).map(([key,value])=>({
                name: key,
                amount: value
            }));

            const subCatArray = Object.entries(exp_subcat_data).map(([key, value])=>({
                name: key, 
                amount: value
            }));
            set_exp_cat_amount(catArry);
            set_exp_subcat_amount(subCatArray);
            setCal({total:sum,avg,max})
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

    function export_expenses_to_excel(expenseData) {
        if (!expenseData || expenseData.length === 0) return;

        const formattedData = expenseData.map((item) => ({
            ID: item.expense_id,
            Name: item.name,
            Category: item.category,
            SubCategory: item.subCategory,
            Date: new Date(item.created_at).toLocaleDateString("en-GB"),
            Last_Updated: new Date(item.updated_at).toLocaleDateString("en-GB"),
            Amount: parseFloat(item.amount),
            Description: item.exp_description
        }));

        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");

        const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
        });

        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(blob, "Expenses_Report.xlsx");
    }

    useEffect(()=>{
        if(exp_data.length==0){
            set_is_exp_empty(true);
        }else{
            profile_calulation();
            set_is_exp_empty(false);
        }
    },[exp_data]);
    
    return(
        <div id="main_expenses">
            <ExpensePopup 
                total_budget = {parseFloat(expense_prof.total_budget)}
                total_amount ={cal.total}
                server_url={server_url}
                edit_expense={edit_expense} 
                set_edit_expense={set_edit_expense}
                show_create_exp_list={show_create_exp_list} 
                set_show_create_exp_list={set_show_create_exp_list} 
                set_loading={set_loading} show_toast={show_toast} 
                set_exp_data={set_exp_data} 
                user_id={user_id} 
                profile_id={profile_id}
                profile_calulation={profile_calulation}
            />

            <div className="flex items-center justify-between m-4">
                <p onClick={()=>set_show_selected_exp_prof({show:false})} className="flex items-center text-2xl text-black hover:text-white transition-all hover:bg-[#f15b42] px-[10px] py-[5px] rounded-[30px] cursor-pointer">
                <ArrowBigLeftDashIcon size={32} className="mr-2" />
                <span>Back</span>
                </p> 
                {/* <h1 className="font-bold text-2xl">Expense Profiles</h1> */}
                <div className="flex gap-4">
                    {/* Excel Export Button */}
                    <div onClick={()=> export_expenses_to_excel(exp_data)} className="group flex items-center w-fit cursor-pointer gap-2 bg-[#6b8e23] text-white font-semibold rounded-3xl px-3 py-1.5 hover:scale-105 hover:bg-[#526c1e] transition-all duration-300">
                        <FileSpreadsheet className="group-hover:rotate-[340deg] transform duration-1000 text-white w-5 h-5"/> {/* Chart or graph icon for analysis */}
                        <button className="cursor-pointer text-sm">Export</button>
                    </div>

                    {/* Analysis Button */}
                    <div onClick={()=>{setShowAnalysis(true), chartRef.current?window.scrollTo({top:chartRef.current.offsetTop, behavior:'smooth'}):''}} className="flex w-fit cursor-pointer gap-2 bg-[#6b8e23] text-white font-semibold rounded-3xl px-3 py-1.5 hover:scale-105 hover:bg-[#526c1e] transition-all duration-300">
                        <ChartBarIcon className="text-white w-5 h-5"/> {/* Chart or graph icon for analysis */}
                        <button className="cursor-pointer text-sm">Analysis</button>
                    </div>

                    {/* Create New Expense Button */}
                    <div onClick={() => {cal.total >= expense_prof.total_budget?show_toast({status:"Info", message:'You already exceed expense profile budget'}):(set_show_create_exp_list(true), set_edit_expense({edit_exp:false,expense:''}))}} className="group flex w-fit cursor-pointer gap-2 bg-[#f15b42] text-white font-semibold rounded-3xl px-3 py-1.5 hover:scale-105 hover:bg-[#e14a34] transition-all">
                        <PlusIcon className="group-hover:animate-spin bg-white rounded-full text-[#f15b42] p-1"/>
                        <button className="cursor-pointer text-sm">Create New Expense</button>
                    </div>
                </div>
            </div>
            {!expense_prof || !exp_data || exp_data?.length==0 || is_exp_empty?
                <div className="bg-white p-3 rounded-[10px]">
                    <div className=" rounded-[10px] overflow-hidden text-center" style={{border: '2px dashed lightslategrey'}}>
                        <img className="w-[35%] m-auto" src={empty_expense_list} alt="error" />
                        <h1 className="my-[1rem] text-[xx-large] font-[600]">Empty Expense Profiles</h1>
                    </div>
                </div>
                :
                <div>
                    {/* Expense Profile Summary */}
                    <div className="bg-white flex items-center gap-4 p-8" style={{boxShadow:"0px 0px 5px -2px #75889a", margin:'10px', borderRadius:'10px'}}>
                        <div className="">
                            <img src={dummy_image} alt="error" className="w-[5rem] rounded-[50%] aspect-square object-cover"/>
                        </div>
                        <div className="flex justify-between gap-4 flex-1 items-center">
                            <div>
                                <h1 className="font-bold text-2xl mb-0"><span>Profile Name: </span> <span style={{color:'#0000009e'}}>{expense_prof.profile_name}</span></h1>
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

                    <div className="flex items-end justify-between mx-[3rem] mt-10">
                        <div className="bg-white shadow-[0px_0px_3px_0px_lightgrey] rounded-[10px] margin-[1rem] w-[40%]">
                            <h3 className="bg-[#f15b42] px-2.5 py-4 rounded-[10px_10px_0px_0px] text-yellow-200">Profile Description</h3>
                            <p className="px-2.5 py-4">{expense_prof.description}</p>
                        </div>
                        <div className="flex items-center bg-white rounded-[10px] overflow-hidden w-[30%] justify-between">
                            <div className="bg-[#ffe9e3] p-2.5 ">
                                <SearchIcon className="red"/>
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
                    <div id="my_exp_list_con">
                        {searchText!='' ?
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
                        />}
                    </div>

                    {showAnalysis &&
                    <>
                        <div id="chart-graphs-con" ref={chartRef} style={{margin:'0rem 2rem', marginBottom:'5rem'}}>
                            <CatSubCatExpComparison expense_by_category={exp_cat_amount} expense_by_subCategory={exp_subcat_amount} total_budget={parseFloat(expense_prof.total_budget)}/>
                        </div>
                        <div className="flex m-8 gap-4">
                            <ExpenseCategoryDonut data={exp_cat_amount} label={'Category'}/>
                            <ExpenseCategoryDonut data={exp_subcat_amount} label={'Sub-Category'}/>
                        </div>
                        {/* <AverageExpenseOverview total_budget={parseFloat(expense_prof.total_budget)} exp_data={exp_data}/> */}
                        <MonthlyDailyAverage total_budget={parseFloat(expense_prof.total_budget)} exp_data={exp_data} />
                        <MonthlyWeekChart total_budget={parseFloat(expense_prof.total_budget)} exp_data={exp_data} />
                        <MonthlyExpenseChart total_budget={parseFloat(expense_prof.total_budget)} exp_data={exp_data}/>
                        <YearlyExpenseChart total_budget={parseFloat(expense_prof.total_budget)} exp_data={exp_data}/>
                        {/* <ExpPeriodComparison total_budget={parseFloat(expense_prof.total_budget)} exp_data={exp_data}/> */}
                        {/* <ExpPeriodComparison total_budget={parseFloat(expense_prof.total_budget)} exp_data={exp_data} viewType="yearly"/> */}
                    </>
                    }
                </div>
            }
        </div>
    )
}