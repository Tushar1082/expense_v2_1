import { useState, useRef, useEffect } from "react";
import { Layers, X, Info, DollarSign, Calendar, Users, CreditCard, Split, FileText, TrendingUp, Percent, Calculator, IndianRupee, Edit } from 'lucide-react';
import Cookies from 'js-cookie';

export default function GroupExpenseCreator({
    groupId,
    selectedGroup,
    set_loading,
    show_toast,
    show_create_expense,
    set_show_create_expense,
    set_exp_data,
    edit_expense,
    set_edit_expense
}) {

    const [expenseData, setExpenseData] = useState({
        name: '',
        category: '',
        subCategory: '',
        description: '',
        amount: 0,
        paidBy: {user_id:'', name:''},
        splitType: '',
        splitMethod: 'equal', //equal or percentage or custom
        splitDetails: [],
        isSettled: { confirm: false, paymentMode: '' },
        isRequestedMoney: false,
        created_at: new Date(),
        updated_at: new Date()
    });
    const [paidByData, setPaidByData] = useState('');
    const [state, setState] = useState(false);
    const summaryRef = useRef(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [bool, setBool] = useState(false);
    const [showCreateNewExp, setShowCreateNewExp] = useState(false);
    const [selectedMember, setSelectedMember] = useState('');
    const user_id = Cookies.get("spending_smart_client");
    const compRef = useRef();

    const categories = [
        {
            category: "Travel",
            subcategories: ["Transportation", "Accommodation", "Food & Drinks", "Activities", "Miscellaneous"],
        },
        {
            category: "Food",
            subcategories: ["Groceries", "Restaurants", "Snacks", "Beverages"],
        },
        {
            category: "Entertainment",
            subcategories: ["Movies", "Concerts", "Amusement Parks", "Games", "Parties"],
        },
        {
            category: "Utilities",
            subcategories: ["Electricity", "Water", "Internet", "Gas"],
        },
        {
            category: "Shopping",
            subcategories: ["Clothing", "Electronics", "Gifts", "Home Decor"],
        },
        {
            category: "Health & Fitness",
            subcategories: ["Gym", "Sports", "Healthcare", "Yoga", "Supplements"],
        },
        {
            category: "Events",
            subcategories: ["Birthdays", "Weddings", "Festivals", "Anniversaries"],
        },
        {
            category: "Education",
            subcategories: ["Workshops", "Books & Supplies", "Courses", "Conferences"],
        },
        {
            category: "Charity",
            subcategories: ["Donations", "Fundraisers", "Community Service"],
        }
    ];

    function changeToGroup() {
        if (bool) {
            setExpenseData((prev) => ({ ...prev, splitDetails: [] }))
            setBool(false);
        }
    }

    function changeToIndividual() {
        if (!bool) {
            setExpenseData((prev) => ({ ...prev, splitDetails: [] }))
            setBool(true);
        }
    }

    // Handle member selection
    function selectMembers(e) {
        const selectedId = e.target.value;
        const memberName = selectedGroup.group_members.filter((elm) => elm.user_id == selectedId);
        const selected = memberName[0].name;
        const selectedProfImg = memberName[0].profile_image;

        setSelectedMember(selected);
        const memberExistsIndex = expenseData.splitDetails.findIndex(
            (member) => member.user_id === selectedId
        );

        if (selected) {
            let updatedSplitDetails;

            if (memberExistsIndex === -1) {
                // Add new member if they don't exist
                updatedSplitDetails = expenseData.splitMethod == 'percentage' ? [
                    ...expenseData.splitDetails,
                    { user_id: selectedId, profile_image: selectedProfImg, name: selected, amount: 0, percentage: 0, paymentStatus:'Pending' },
                ] :
                    [
                        ...expenseData.splitDetails,
                        { user_id: selectedId, profile_image: selectedProfImg, name: selected, amount: 0, paymentStatus: 'Pending' },
                    ]
                    ;
            } else {
                // Keep existing members
                updatedSplitDetails = [...expenseData.splitDetails];
            }

            if (expenseData.splitMethod === 'equal') {
                const totalMembers = updatedSplitDetails.length + 1;
                const computedAmount = parseFloat(expenseData.amount / totalMembers);

                const recalculatedSplitDetails = updatedSplitDetails.map((member) => ({
                    ...member,
                    amount: computedAmount,
                }));

                setExpenseData((prev) => ({
                    ...prev,
                    splitDetails: recalculatedSplitDetails,
                }));
            } else if (expenseData.splitMethod === 'percentage') {
                const recalculatedSplitDetails = updatedSplitDetails.map((member) => ({
                    ...member,
                    amount: (member.percentage / 100) * expenseData.amount,
                }));

                setExpenseData((prev) => ({
                    ...prev,
                    splitDetails: recalculatedSplitDetails,
                }));
            } else if (expenseData.splitMethod === 'custom') {
                setExpenseData((prev) => ({
                    ...prev,
                    splitDetails: updatedSplitDetails,
                }));
            }
        }
    }


    //Delete member then recompute amount for all members
    function handleDelete(idx) {
        const updatedSplitDetails = expenseData.splitDetails.filter(
            (_, index) => index !== idx
        );

        if (expenseData.splitMethod === 'equal') {
            const totalMembers = updatedSplitDetails.length;
            const computedAmount =
                totalMembers > 0
                    ? parseFloat(expenseData.amount / totalMembers)
                    : 0;

            const recalculatedSplitDetails = updatedSplitDetails.map((member) => ({
                ...member,
                amount: computedAmount,
            }));

            setExpenseData((prev) => ({
                ...prev,
                splitDetails: recalculatedSplitDetails,
            }));
        } else if (expenseData.splitMethod === 'percentage') {
            const recalculatedSplitDetails = updatedSplitDetails.map((member) => ({
                ...member,
                amount: (member.percentage / 100) * expenseData.amount,
            }));

            setExpenseData((prev) => ({
                ...prev,
                splitDetails: recalculatedSplitDetails,
            }));
        } else if (expenseData.splitMethod === 'custom') {
            setExpenseData((prev) => ({
                ...prev,
                splitDetails: updatedSplitDetails,
            }));
        }
    }

    function handleSplitMethod(percentage, member_id, name, member_profile_image, amount) {
        if (expenseData.splitMethod === 'percentage') {
            const perc = Number(percentage);

            if (perc < 0 || perc > 100) {
                show_toast({ status: "Info", message: 'Provided percentage exceeds 100%. Please correct it.' });
                setExpenseData((prev) => ({
                    ...prev,
                    splitDetails: prev.splitDetails.map((elm) => {
                        if (elm.user_id === member_id) {
                            return { ...elm, amount: 0, percentage: 0 };
                        }
                        return elm;
                    })
                }));
                return;
            }

            // FIX: Use functional update to get the latest amount value
            setExpenseData((prev) => {
                const computedAmount = (perc / 100) * prev.amount; // Use prev.amount, not expenseData.amount

                const updatedSplitDetails = prev.splitDetails.map((elem) => {
                    if (elem.user_id === member_id) {
                        return { ...elem, percentage: perc, amount: computedAmount };
                    }
                    return elem;
                });

                // Add member if they don't exist (for group split mode)
                if (!prev.splitDetails.some((elem) => elem.user_id === member_id)) {
                    updatedSplitDetails.push({
                        user_id: member_id,
                        profile_image: member_profile_image,
                        name,
                        percentage: perc,
                        amount: computedAmount,
                        paymentStatus: 'Pending'
                    });
                }

                return { ...prev, splitDetails: updatedSplitDetails };
            });

        } else if (expenseData.splitMethod === 'custom') {
            const currentamount = parseFloat(amount);

            // FIX: Use functional update here too
            setExpenseData((prev) => {
                if (currentamount < 0 || currentamount > prev.amount) {
                    show_toast({ status: "Info", message: 'Provided amount greater than total amount. Please correct it.' });
                    return {
                        ...prev,
                        splitDetails: prev.splitDetails.map((elm) => {
                            if (elm.user_id === member_id) {
                                return { ...elm, amount: 0 };
                            }
                            return elm;
                        })
                    };
                }

                const updatedSplitDetails = prev.splitDetails.map((elem) => {
                    if (elem.user_id === member_id) {
                        return { ...elem, amount: currentamount };
                    }
                    return elem;
                });

                if (!prev.splitDetails.some((elem) => elem.user_id === member_id)) {
                    updatedSplitDetails.push({
                        user_id: member_id,
                        profile_image: member_profile_image,
                        name,
                        amount: currentamount,
                        paymentStatus: 'Pending'
                    });
                }

                return { ...prev, splitDetails: updatedSplitDetails };
            });
        }
    }

    function computeSplitDetails() {
        if (!paidByData) {
            return;
        }
        if (selectedGroup && expenseData.splitMethod === 'equal' && expenseData.splitType === "group") {
            const arr = [];
            const amount = parseFloat(expenseData.amount / selectedGroup.group_members.length);
            selectedGroup.group_members.forEach((elm) => {
                // Make sure to exclude the current paidBy member
                if (elm.user_id !== expenseData.paidBy.user_id) {
                    arr.push({
                        user_id: elm.user_id,
                        profile_image: elm.profile_image,
                        name: elm.name,
                        amount,
                        paymentStatus: 'Pending'
                    });
                }
            });
            setExpenseData((prev) => ({ ...prev, splitDetails: arr }));
        }
    }

    async function handleSave() {//Create new Expense for group
        if (!expenseData.name) return show_toast({ status: "Fail", message: "Enter the name of expense" });
        else if (!expenseData.category) return show_toast({ status: 'Fail', message: "Provide category for expense" });
        else if (!expenseData.subCategory) return show_toast({ status: 'Fail', message: "Provide sub category for expense" });
        else if (!expenseData.description) return show_toast({ status: 'Fail', message: "Fill the description for expense" });
        else if (!expenseData.amount) return show_toast({ status: 'Fail', message: "Enter the amount of expense" });
        else if (!expenseData.splitType) return show_toast({ status: 'Fail', message: "Provide spilit type (Individual or group)" });
        else if (!expenseData.paidBy) return show_toast({ status: 'Fail', message: "Provide who pay amount of expense" });
        else if (!expenseData.splitMethod) return show_toast({ status: 'Fail', message: "Provide split method" });
        else if (expenseData.splitDetails.length <= 0) return show_toast({ status: 'Fail', message: "Add members that have to pay you back" });

        if (edit_expense.edit_exp) {
            handleSaveNewChanges();
            return;
        }

        try {
            set_loading(true);
            const result = await fetch(`${import.meta.env.VITE_SERVER_API}/group/group-expenses`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    "Authorization": `Bearer ${user_id}`, //user_id as token
                },
                body: JSON.stringify({ ...expenseData, groupId })
            });
            const finalRes = await result.json();

            if (finalRes.created) {
                set_show_create_expense(false);
                setState(false);

                show_toast({ status: "Success", message: "Expense Created Successfully!" });
                const expense = { expense_id: finalRes?.expense_id, ...expenseData };

                set_exp_data((prev) => ([...prev, expense]));
                setExpenseData({
                    name: '',
                    category: '',
                    subCategory: '',
                    description: '',
                    amount: 0,
                    paidBy: '',
                    splitType: '',
                    splitMethod: 'equal', //equal or percentage or custom
                    splitDetails: [],
                    isSettled: { confirm: false, paymentMode: '' },
                    isRequestedMoney: false,
                    created_at: new Date(),
                    updated_at: new Date()
                })
            } else if (!finalRes.created) {
                show_toast({ status: "Fail", message: "Failed to create expense! Try again" });
            } else if (finalRes.failed) {
                console.log(finalRes);
                show_toast({ status: "Success", message: "Failed to create expense! Try again later" });
            }

        } catch (error) {
            console.log("Error while creating group expense: " + error);
            show_toast({ status: "Fail", message: "Something went wrong! Try again later" });
        } finally {
            set_loading(false);
        }
    }
    async function handleSaveNewChanges() {
        if (!expenseData.name) return show_toast({ status: "Fail", message: "Enter the name of expense" });
        else if (!expenseData.category) return show_toast({ status: 'Fail', message: "Provide category for expense" });
        else if (!expenseData.subCategory) return show_toast({ status: 'Fail', message: "Provide sub category for expense" });
        else if (!expenseData.description) return show_toast({ status: 'Fail', message: "Fill the description for expense" });
        else if (!expenseData.amount) return show_toast({ status: 'Fail', message: "Enter the amount of expense" });
        else if (!expenseData.splitType) return show_toast({ status: 'Fail', message: "Provide spilit type (Individual or group)" });
        else if (!expenseData.paidBy) return show_toast({ status: 'Fail', message: "Provide who pay amount of expense" });
        else if (!expenseData.splitMethod) return show_toast({ status: 'Fail', message: "Provide split method" });
        else if (expenseData.splitDetails.length <= 0) return show_toast({ status: 'Fail', message: "Add members that have to pay you back" });

        try {
            const response = await fetch(`${import.meta.env.VITE_SERVER_API}/group/group-expenses`, {
                method: "PUT",
                headers: {
                    'content-type': 'application/json',
                    "Authorization": `Bearer ${user_id}`, //user_id as token
                },
                body: JSON.stringify({ expenseData, groupId, expense_id: edit_expense.expense.expense_id })
            });
            const result = await response.json();

            if (result.failed) {
                console.log(result);
                show_toast({ status: "Fail", message: "Failed to update expense, Try again later!" });
            } else if (!result.updated) {
                show_toast({ status: "Info", message: "Failed to update expense, Try again!" });
            } else {
                show_toast({ status: "Success", message: "SuccessFully updated expense" });
                set_exp_data((prev) => [
                    ...prev.filter((elm) => elm.expense_id !== edit_expense.expense.expense_id),
                    expenseData
                ]);
                set_edit_expense({ edit_exp: false, expense: "" });
            }
        } catch (error) {
            show_toast({ status: "Fail", message: "Failed to update expense, Try again later!" })
            console.log("Error while saving new changes: ");
            console.log(error);
        }
    }
    // function handleSubmit() {
    //     if (expenseData.splitMethod === "percentage") {
    //         let totalPercentage = 0;

    //         // Calculate total percentage
    //         expenseData.splitDetails.forEach((elem) => {
    //             totalPercentage += elem.percentage || 0;
    //         });

    //         if (totalPercentage > 100) {
    //             show_toast({ status: "Info", message: 'The total percentage exceeds 100%. Please correct it.' });

    //             // Reset percentages asynchronously
    //             setExpenseData((prev) => ({
    //                 ...prev,
    //                 splitDetails: prev.splitDetails.map((elem) => ({
    //                     ...elem,
    //                     percentage: 0,
    //                 })),
    //             }));

    //             return; // Stop execution
    //         }
    //     } else if (expenseData.splitMethod === "custom") {
    //         let totalAmount = 0;

    //         expenseData.splitDetails.forEach((elem) => {
    //             totalAmount += elem.amount || 0;
    //         });

    //         if (totalAmount > expenseData.amount) {
    //             show_toast({ status: "Info", message: `The total amount greater than ${expenseData.amount}. Please correct it.` });

    //             // Reset percentages asynchronously
    //             setExpenseData((prev) => ({
    //                 ...prev,
    //                 splitDetails: prev.splitDetails.map((elem) => ({
    //                     ...elem,
    //                     amount: 0,
    //                 })),
    //             }));

    //             return; // Stop execution
    //         }
    //     }

    //     // Toggle state and compute split details
    //     setState((prev) => !prev);
    //     computeSplitDetails();
    // }
    function handleSubmit() {
        let updatedSplitDetails = [...expenseData.splitDetails];

        // === Handle 'percentage' split ===
        if (expenseData.splitMethod === "percentage") {
            let totalPercentage = 0;

            updatedSplitDetails.forEach((member) => {
                totalPercentage += member.percentage || 0;
            });

            if (totalPercentage > 100) {
                show_toast({
                    status: "Info",
                    message: "The total percentage exceeds 100%. Please correct it.",
                });

                // Reset percentages and amounts
                updatedSplitDetails = updatedSplitDetails.map((member) => ({
                    ...member,
                    percentage: 0,
                    amount: 0,
                }));

                setExpenseData((prev) => ({
                    ...prev,
                    splitDetails: updatedSplitDetails,
                }));

                return;
            }

            // Recalculate amounts based on valid percentages
            updatedSplitDetails = updatedSplitDetails.map((member) => ({
                ...member,
                amount: ((member.percentage || 0) / 100) * expenseData.amount,
            }));
        }

        // === Handle 'equal' split ===
        else if (expenseData.splitMethod === "equal") {
            const totalMembers = updatedSplitDetails.length;
            const amountPerMember =
                totalMembers > 0 ? parseFloat(expenseData.amount / totalMembers) : 0;

            updatedSplitDetails = updatedSplitDetails.map((member) => ({
                ...member,
                amount: amountPerMember,
            }));
        }

        // === Handle 'custom' split ===
        else if (expenseData.splitMethod === "custom") {
            const totalAssigned = updatedSplitDetails.reduce(
                (acc, member) => acc + parseFloat(member.amount || 0),
                0
            );

            if (totalAssigned > expenseData.amount) {
                show_toast({
                    status: "Info",
                    message: `The total amount exceeds ₹${expenseData.amount}. Please correct it.`,
                });

                updatedSplitDetails = updatedSplitDetails.map((member) => ({
                    ...member,
                    amount: 0,
                }));

                setExpenseData((prev) => ({
                    ...prev,
                    splitDetails: updatedSplitDetails,
                }));

                return;
            }
        }

        // ✅ Set the recalculated values before submitting
        setExpenseData((prev) => ({
            ...prev,
            splitDetails: updatedSplitDetails,
        }));

        // Continue submission
        setState((prev) => !prev);
        computeSplitDetails();
    }

    function handleEdit() {
        setState(false); // Hide summary
        setIsEditMode(true); // Enable clicks outside
    }

    useEffect(() => {
        const comp = compRef.current;
        if (!comp) return;

        const comp_div = comp.querySelector('.comp-child');
        if (!comp_div) return;

        const shouldShow =
            show_create_expense || (edit_expense && edit_expense.edit_exp);
        const shouldHide =
            !show_create_expense && (!edit_expense || !edit_expense.edit_exp);

        if (shouldShow) {
            comp.style.display = 'block';
            comp_div.style.animation = 'scaleUp 0.5s ease-out';
            const expData = edit_expense.expense;
            if (!expData) {
                return;
            }

            setExpenseData({
                name: expData.name,
                category: expData.category,
                subCategory: expData.subCategory,
                description: expData.description,
                amount: expData.amount || 0,
                paidBy: expData.paidBy,
                splitType: expData.splitType,
                splitMethod: expData.splitMethod, //equal or percentage or custom
                splitDetails: expData.splitDetails,
                isSettled: expData.isSettled,
                isRequestedMoney: expData.isRequestedMoney,
                created_at: expData.created_at,
                updated_at: expData.updated_at
            })
        } else if (shouldHide) {
            comp_div.style.animation = 'scaleDown 0.5s ease-in';
            setTimeout(() => {
                comp.style.display = 'none';
            }, 450);
            setExpenseData({
                name: '',
                category: '',
                subCategory: '',
                description: '',
                amount: 0,
                paidBy: { user_id: '', name: '' },
                splitType: '',
                splitMethod: 'equal', //equal or percentage or custom
                splitDetails: [],
                isSettled: { confirm: false, paymentMode: '' },
                isRequestedMoney: false,
                created_at: new Date(),
                updated_at: new Date()
            })
        }
    }, [show_create_expense, edit_expense]);

    return (
        <div ref={compRef} className="hidden fixed top-0 left-0 z-1000 w-[100%] h-[100%] bg-[#000000ab]">
            <div className="comp-child fixed top-[50%] left-[50%]  -translate-x-1/2 -translate-y-1/2 z-1000 max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 px-6 py-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative flex justify-between items-center">
                        <h2 className="text-white text-2xl font-bold flex items-center">
                            <div className="bg-white/20 p-2 rounded-lg mr-3 backdrop-blur-sm">
                                {!edit_expense.edit_exp ? <Layers className="h-6 w-6" /> : <Edit className="h-6 w-6" />}
                            </div>
                            {!edit_expense.edit_exp ? "Create Expense" : "Edit Expense"}
                        </h2>
                        <button className="text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-200">
                            <X className="h-6 w-6" onClick={() => { set_show_create_expense(false), set_edit_expense({ edit_exp: false, expense: '' }), setState(false) }} />
                        </button>
                    </div>
                </div>
                {/* Body */}
                <div className="p-8 space-y-8 max-h-[70vh] overflow-scroll">
                    {/* Profile Name */}
                    <div className="space-y-2">
                        <label className="block text-gray-800 font-semibold text-sm uppercase tracking-wide">
                            Expense Name
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                name="profile_name"
                                value={expenseData.name}
                                onChange={(e) => setExpenseData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pl-12 focus:ring-4 focus:ring-orange-100 focus:border-orange-400 outline-none transition-all duration-200 text-gray-800 placeholder-gray-400"
                                placeholder="e.g., Home Renovation, Wedding Trip"
                            />
                            <div className="absolute left-4 top-3.5 text-gray-400">
                                <Info className="h-5 w-5" />
                            </div>
                        </div>
                    </div>

                    {/* Expense Type Selection */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <Users className="mr-2 h-5 w-5 text-blue-600" />
                            Create Expense For
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <label className="flex items-center p-4 bg-white rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-300 transition-all duration-200">
                                <input
                                    type="radio"
                                    name="expenseType"
                                    value="group"
                                    onClick={changeToGroup}
                                    onChange={(e) => setExpenseData(prev => ({ ...prev, splitType: e.target.value }))}
                                    className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                                    checked={expenseData.splitType === "group"}
                                />
                                <span className="ml-3 text-gray-700 font-medium">Whole Group</span>
                            </label>
                            <label className="flex items-center p-4 bg-white rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-300 transition-all duration-200">
                                <input
                                    type="radio"
                                    name="expenseType"
                                    value="individual"
                                    onClick={changeToIndividual}
                                    onChange={(e) => setExpenseData(prev => ({ ...prev, splitType: e.target.value }))}
                                    className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                                    checked={expenseData.splitType === "individual"}
                                />
                                <span className="ml-3 text-gray-700 font-medium">Some Individuals</span>
                            </label>
                        </div>
                    </div>

                    {/* Expense Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Category */}
                        <div className="space-y-2">
                            <label className="block text-gray-800 font-semibold text-sm uppercase tracking-wide">
                                Category
                            </label>
                            <div className="relative">
                                <select
                                    value={expenseData.category}
                                    onChange={(e) => setExpenseData(prev => ({ ...prev, category: e.target.value }))}
                                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-orange-100 focus:border-orange-400 outline-none transition-all duration-200 text-gray-800 bg-white"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((elem, index) => (
                                        <option value={elem.category} key={index}>{elem.category}</option>
                                    ))}
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        {/* Sub Category */}
                        {expenseData.category && (
                            <div className="space-y-2">
                                <label className="block text-gray-800 font-semibold text-sm uppercase tracking-wide">
                                    Sub Category
                                </label>
                                {expenseData.category === "Other" ? (
                                    <input
                                        type="text"
                                        placeholder="Enter Sub Category"
                                        value={expenseData.subCategory}
                                        onChange={(e) => setExpenseData(prev => ({ ...prev, subCategory: e.target.value }))}
                                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-orange-100 focus:border-orange-400 outline-none transition-all duration-200 text-gray-800 placeholder-gray-400"
                                    />
                                ) : (
                                    <select
                                        value={expenseData.subCategory}
                                        onChange={(e) => setExpenseData(prev => ({ ...prev, subCategory: e.target.value }))}
                                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-orange-100 focus:border-orange-400 outline-none transition-all duration-200 text-gray-800 bg-white"
                                    >
                                        <option value="">Select Sub Category</option>
                                        {categories.map((elem) => (
                                            elem.category === expenseData.category ? (
                                                elem.subcategories.map((elm, idx) => (
                                                    <option value={elm} key={idx}>{elm}</option>
                                                ))
                                            ) : null
                                        ))}
                                    </select>
                                )}
                            </div>
                        )}

                        {/* Amount */}
                        <div className="space-y-2">
                            <label className="block text-gray-800 font-semibold text-sm uppercase tracking-wide">
                                Amount
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={expenseData.amount}
                                    onChange={(e) => setExpenseData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                                    onWheel={(e) => e.target.blur()}  // 🔒 prevents scroll changes
                                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pl-12 focus:ring-4 focus:ring-orange-100 focus:border-orange-400 outline-none transition-all duration-200 text-gray-800 placeholder-gray-400"
                                />
                                <div className="absolute left-4 top-3.5 text-gray-400">
                                    <IndianRupee className="h-5 w-5" />
                                </div>
                            </div>
                        </div>

                        {/* Date */}
                        <div className="space-y-2">
                            <label className="block text-gray-800 font-semibold text-sm uppercase tracking-wide">
                                Date
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={
                                        expenseData.created_at
                                            ? new Date(expenseData.created_at).toISOString().slice(0, 10)
                                            : ""
                                    }
                                    onChange={(e) => setExpenseData(prev => ({ ...prev, created_at: e.target.value, updated_at: e.target.value }))}
                                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pl-12 focus:ring-4 focus:ring-orange-100 focus:border-orange-400 outline-none transition-all duration-200 text-gray-800"
                                />
                                <div className="absolute left-4 top-3.5 text-gray-400">
                                    <Calendar className="h-5 w-5" />
                                </div>
                            </div>
                        </div>

                        {/* Paid By */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="block text-gray-800 font-semibold text-sm uppercase tracking-wide">
                                Paid By
                            </label>
                            <div className="relative">
                                <select
                                    value={expenseData.paidBy.user_id}
                                    // onChange={(e) => {
                                    //     const selectedMember = selectedGroup?.group_members.find(
                                    //         (member) => member.user_id === e.target.value
                                    //     );
                                    //     setExpenseData(prev => ({ ...prev, paidBy: { user_id: selectedMember?.user_id || '', name: selectedMember?.name || '' } }));
                                    //     setPaidByData({ user_id: e.target.value, name: selectedMember?.name || '' });
                                    // }}
                                    onChange={(e) => {
                                        const selectedMember = selectedGroup?.group_members.find(
                                            (member) => member.user_id === e.target.value
                                        );

                                        // Update paidBy data
                                        setExpenseData(prev => ({
                                            ...prev,
                                            paidBy: {
                                                user_id: selectedMember?.user_id || '',
                                                name: selectedMember?.name || ''
                                            },
                                            // Remove the new paidBy member from splitDetails if they exist
                                            splitDetails: prev.splitDetails.filter(member => member.user_id !== e.target.value)
                                        }));

                                        setPaidByData({
                                            user_id: e.target.value,
                                            name: selectedMember?.name || ''
                                        });
                                    }}
                                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pl-12 focus:ring-4 focus:ring-orange-100 focus:border-orange-400 outline-none transition-all duration-200 text-gray-800 bg-white"
                                >
                                    <option value="">Select who paid</option>
                                    {selectedGroup?.group_members?.map((member, idx) => (
                                        <option value={member.user_id} key={idx}>
                                            {member.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute left-4 top-3.5 text-gray-400">
                                    <CreditCard className="h-5 w-5" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Split Method */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                        <label className="text-gray-800 font-semibold text-lg mb-4 flex items-center">
                            <Split className="mr-2 h-5 w-5 text-green-600" />
                            Split Method
                        </label>
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { value: 'equal', label: 'Equal Split', icon: <TrendingUp className="h-4 w-4" /> },
                                { value: 'percentage', label: 'Percentage', icon: <Percent className="h-4 w-4" /> },
                                { value: 'custom', label: 'Custom Amount', icon: <Calculator className="h-4 w-4" /> }
                            ].map((method) => (
                                <label key={method.value} className="flex items-center p-4 bg-white rounded-lg border-2 border-gray-200 cursor-pointer hover:border-green-300 transition-all duration-200">
                                    <input
                                        type="radio"
                                        name="splitMethod"
                                        value={method.value}
                                        checked={expenseData.splitMethod === method.value}
                                        onChange={(e) => setExpenseData(prev => ({ ...prev, splitMethod: e.target.value, splitDetails: [] }))}
                                        className="text-green-600 focus:ring-green-500 h-4 w-4"
                                    />
                                    <div className="ml-3 flex items-center">
                                        {method.icon}
                                        <span className="ml-2 text-gray-700 font-medium text-sm">{method.label}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Individual Member Selection */}
                    {expenseData.splitType === 'individual' && (
                        <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                Select members to pay back {expenseData.paidBy?.name}
                            </h3>
                            <select
                                value={selectedMember}
                                onChange={selectMembers}
                                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-purple-100 focus:border-purple-400 outline-none transition-all duration-200 text-gray-800 bg-white mb-4"
                            >
                                <option value="">Select Member</option>
                                {selectedGroup?.group_members?.map((member, idx) =>
                                    member.user_id !== expenseData.paidBy.user_id ? (
                                        <option value={member.user_id} key={idx}>
                                            {member.name}
                                        </option>
                                    ) : null
                                )}
                            </select>

                            <div className="space-y-4">
                                {expenseData && expenseData.splitDetails && expenseData.splitDetails.length > 0 && expenseData.splitDetails.map((member, idx) => (
                                    <div key={idx} className="bg-white rounded-lg p-4 border border-purple-200 shadow-sm">
                                        <div className="flex items-center justify-between flex-wrap gap-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
                                                    {member.name.charAt(0)}
                                                </div>
                                                <span className="font-semibold text-gray-800">{member.name}</span>
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                {expenseData.splitMethod === 'equal' && (
                                                    <div className="bg-green-100 px-3 py-1 rounded-full text-green-800 font-semibold">
                                                        ₹{parseFloat(expenseData.amount / (expenseData.splitDetails.length + 1)).toFixed(2)}
                                                    </div>
                                                )}

                                                {expenseData.splitMethod === 'percentage' && (
                                                    // <input
                                                    //     type="number"
                                                    //     placeholder="0"
                                                    //     value={expenseData.splitDetails[idx].percentage === 0 ? '' : expenseData.splitDetails[idx].percentage}
                                                    //     onChange={(e) => handleSplitMethod(e.target.value, member.user_id, member.name, member.profile_image, expenseData.amount)}
                                                    //     onWheel={(e) => e.target.blur()}  // 🔒 prevents scroll changes
                                                    //     className="w-20 border-2 border-gray-200 rounded-lg px-3 py-2 text-center focus:ring-2 focus:ring-purple-300 focus:border-purple-400 outline-none"
                                                    // />
                                                    <input
                                                        type="number"
                                                        placeholder="0"
                                                        value={
                                                            // For individual split
                                                            expenseData.splitDetails[idx]?.percentage === 0 ? '' :
                                                                (expenseData.splitDetails[idx]?.percentage || '')
                                                        }
                                                        onChange={(e) => handleSplitMethod(
                                                            e.target.value,           // percentage value
                                                            member.user_id,           // member_id
                                                            member.name,              // name
                                                            member.profile_image,     // profile_image
                                                            null                      // Don't pass amount for percentage method
                                                        )}
                                                        onWheel={(e) => e.target.blur()}
                                                        className="w-20 border-2 border-gray-200 rounded-lg px-3 py-2 text-center focus:ring-2 focus:ring-purple-300 focus:border-purple-400 outline-none"
                                                    />
                                                )}

                                                {expenseData.splitMethod === 'custom' && (
                                                    <input
                                                        type="number"
                                                        placeholder="0.00"
                                                        value={expenseData.splitDetails[idx].amount === 0 ? '' : expenseData.splitDetails[idx].amount}
                                                        onChange={(e) => handleSplitMethod('', member.user_id, member.name, member.profile_image, e.target.value)}
                                                        onWheel={(e) => e.target.blur()}  // 🔒 prevents scroll changes
                                                        className="w-24 border-2 border-gray-200 rounded-lg px-3 py-2 text-center focus:ring-2 focus:ring-purple-300 focus:border-purple-400 outline-none"
                                                    />
                                                )}

                                                <button
                                                    onClick={() => handleDelete(idx)}
                                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-colors duration-200 font-medium"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Group Split Details */}
                    {expenseData.splitType === 'group' && expenseData.paidBy.name && (
                        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                Members who need to pay {expenseData.paidBy.name}
                            </h3>
                            <div className="space-y-4">
                                {selectedGroup?.group_members?.map((member, idx) =>
                                    member.user_id !== expenseData.paidBy.user_id ? (
                                        <div key={idx} className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
                                            <div className="flex items-center justify-between flex-wrap gap-4">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center text-white font-semibold">
                                                        {member.name.charAt(0)}
                                                    </div>
                                                    <span className="font-semibold text-gray-800">{member.name}</span>
                                                </div>

                                                <div className="flex items-center space-x-3">
                                                    {expenseData.splitMethod === 'equal' && (
                                                        <div className="bg-green-100 px-3 py-1 rounded-full text-green-800 font-semibold">
                                                            ₹{parseFloat(expenseData.amount / selectedGroup.group_members.length).toFixed(2)}
                                                        </div>
                                                    )}

                                                    {expenseData.splitMethod === 'percentage' && (
                                                        // <input
                                                        //     type="number"
                                                        //     placeholder="0"
                                                        //     value={expenseData.splitDetails.find(detail => detail.user_id === member.user_id)?.percentage === 0 ? '' : expenseData.splitDetails.find(detail => detail.user_id === member.user_id)?.percentage || ''}
                                                        //     onChange={(e) => handleSplitMethod(e.target.value, member.user_id, member.name, member.profile_image, expenseData.amount)}
                                                        //     onWheel={(e) => e.target.blur()}  // 🔒 prevents scroll changes
                                                        //     className="w-20 border-2 border-gray-200 rounded-lg px-3 py-2 text-center focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none"
                                                        // />
                                                        <input
                                                            type="number"
                                                            placeholder="0"
                                                            value={
                                                                (() => {
                                                                    const memberDetail = expenseData.splitDetails.find(detail => detail.user_id === member.user_id);
                                                                    return memberDetail?.percentage === 0 ? '' : (memberDetail?.percentage || '');
                                                                })()
                                                            }
                                                            onChange={(e) => handleSplitMethod(
                                                                e.target.value,           // percentage value
                                                                member.user_id,           // member_id  
                                                                member.name,              // name
                                                                member.profile_image,     // profile_image
                                                                null                      // Don't pass amount for percentage method
                                                            )}
                                                            onWheel={(e) => e.target.blur()}
                                                            className="w-20 border-2 border-gray-200 rounded-lg px-3 py-2 text-center focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none"
                                                        />
                                                    )}

                                                    {expenseData.splitMethod === 'custom' && (
                                                        <input
                                                            type="number"
                                                            placeholder="0.00"
                                                            value={expenseData.splitDetails.find(detail => detail.user_id === member.user_id)?.amount === 0 ? '' : expenseData.splitDetails.find(detail => detail.user_id === member.user_id)?.amount || ''}
                                                            onChange={(e) => handleSplitMethod('', member.user_id, member.name, member.profile_image, e.target.value)}
                                                            onWheel={(e) => e.target.blur()}  // 🔒 prevents scroll changes
                                                            className="w-24 border-2 border-gray-200 rounded-lg px-3 py-2 text-center focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ) : null
                                )}
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-gray-800 font-semibold text-sm uppercase tracking-wide flex items-center">
                            <FileText className="mr-2 h-4 w-4" />
                            Description
                        </label>
                        <textarea
                            placeholder="Add a description for this expense..."
                            value={expenseData.description}
                            onChange={(e) => setExpenseData(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-orange-100 focus:border-orange-400 outline-none transition-all duration-200 text-gray-800 placeholder-gray-400 resize-none"
                            rows="4"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center pt-6 gap-4">
                        <button
                            onClick={handleSubmit}
                            className=" w-[60%] cursor-pointer bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
                        >
                            {!edit_expense.edit_exp ? "Create Expense" : "Edit Expense"}
                            {/* Create Expense */}
                        </button>
                        <button className="border border-gray-400 rounded-xl px-8 py-3.5 cursor-pointer" onClick={() => { set_show_create_expense(false), set_edit_expense({ edit_exp: false, expense: '' }), setState(false) }}>Close</button>
                    </div>

                    {/* Summary */}
                    {state && (
                        <div ref={summaryRef} className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200 mt-8">
                            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                                <div className="bg-emerald-500 p-2 rounded-lg mr-3">
                                    <FileText className="h-5 w-5 text-white" />
                                </div>
                                Expense Summary
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-3">
                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                        <span className="text-gray-600 font-medium">Description:</span>
                                        <p className="text-gray-800 font-semibold mt-1">{expenseData.description || 'No description'}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                        <span className="text-gray-600 font-medium">Total Amount:</span>
                                        <p className="text-2xl font-bold text-green-600 mt-1">
                                            ₹{parseFloat(typeof expenseData.amount === 'object' ? expenseData.amount : expenseData.amount || 0).toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <span className="text-gray-600 font-medium">Paid By:</span>
                                    <div className="flex items-center mt-2">
                                        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                                            {expenseData.paidBy?.name?.charAt(0)}
                                        </div>
                                        <span className="text-gray-800 font-semibold">{expenseData.paidBy?.name}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-4 shadow-sm">
                                <h4 className="font-semibold text-gray-800 mb-3">
                                    Members returning money to {expenseData.paidBy?.name}:
                                </h4>
                                <div className="space-y-3">
                                    {expenseData.splitDetails.map((elm, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                                                    {elm.name.charAt(0)}
                                                </div>
                                                <span className="font-medium text-gray-800">{elm.name}</span>
                                            </div>
                                            {/* <div className="text-right">
                                                {expenseData.splitMethod === 'percentage' && (
                                                    <div className="text-sm text-gray-600">{elm.percentage}%</div>
                                                )}
                                                <div className="font-bold text-green-600">₹{parseFloat(elm.amount).toFixed(2)}</div>
                                            </div> */}
                                            <div className="text-right">
                                                {expenseData.splitMethod === 'percentage' && (
                                                    <div className="text-sm text-gray-600">{elm.percentage}%</div>
                                                )}
                                                <div className="font-bold text-green-600">
                                                    ₹{parseFloat(elm.amount || 0).toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex space-x-4 mt-6">
                                <button
                                    onClick={handleEdit}
                                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                                >
                                    Edit Expense
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                                >
                                    {!edit_expense.edit_exp ? "Save Expense" : "Update Expense"}
                                    {/* Save Expense */}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};