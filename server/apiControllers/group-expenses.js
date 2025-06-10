require('dotenv').config();
const {
    client,
    groupExpColl,
    userColl,
} = require('../database/mongodb_db.js');
const {ObjectId} = require('mongodb');

const group_expenses_get = async(req,res)=>{
    try {
        const result = await groupExpColl.findOne({group_id: new ObjectId(req.query.group_id)},{_id:0,group_id:0});

        if(result && result.expenses.length>0){
            return res.status(200).json({expenses: result.expenses});
        }else{
            return res.status(400).json({notFound:true});
        }
    } catch (error) {
        // console.log(error);
        return res.status(500).json({failed:true, error: error.message});
    }
};

const group_expenses_post = async(req,res)=>{
    try {
        const memberData = req.body.splitDetails;

        for(let i = 0; i<memberData.length;i++){
                memberData[i] = {
                    user_id: new ObjectId(memberData[i].user_id),
                    profile_image: memberData[i].profile_image,
                    name: memberData[i].name, 
                    ...(memberData[i].percentage !== undefined &&{percentage: parseFloat(memberData[i].percentage)}), //add this field if percentage exists
                    amount: parseFloat(memberData[i].amount),
                    money_requested: false,
                    paymentStatus: 'Pending'
                };
        }
        const expense_id = new ObjectId();

        const data = {
            expense_id, // Auto-generate expense_id
            name: req.body.name,
            category: req.body.category,
            subCategory: req.body.subCategory,
            description: req.body.description,
            amount: parseFloat(req.body.amount),
            paidBy: {
                user_id: new ObjectId(req.body.paidBy.user_id), 
                name: req.body.paidBy.name 
            },
            splitType: req.body.splitType,
            splitMethod: req.body.splitMethod,
            splitDetails: memberData,
            isSettled: {confirm:false,paymentMode:''},
            // isRequestedMoney:false,
            created_at: new Date(req.body.created_at),
            updated_at: new Date(req.body.created_at)
        }

        const result = await groupExpColl.updateOne(
            {group_id: new ObjectId(req.body.groupId)},
            {
                $push:{
                    expenses:data
                }
            }
        );

        if(result.modifiedCount>0){
            return res.json({created:true, expense_id});
        }else{
            return res.json({created:false}); 
        }

    } catch (error) {
        return res.json({failed:true, message: error.message})
        // console.log(error);
    }
};

const group_expenses_put = async(req, res)=>{
    const session = await client.startSession();

    await session.startTransaction();
    
    try {
        const {expenseData, groupId, expense_id} = req.body;
        if(!groupId){
            return res.json({failed: true, message: "Invalid or missing groupId field"});
        }
        if(!expense_id){
            return res.json({failed: true, message: "Invalid or missing expense_id field"});
        }
        if(!expenseData){
            return res.json({failed: true, message: "Invalid or missing expenseData field"});
        }

        const {
            name, 
            category, 
            subCategory, 
            description, 
            amount, 
            paidBy, 
            splitType, 
            splitMethod, 
            splitDetails, 
            isSettled, 
            isRequestedMoney, 
            created_at
        } = expenseData;
        
        const memberData = splitDetails;

        for(let i = 0; i<memberData.length;i++){
            memberData[i] = {
                user_id: new ObjectId(memberData[i].user_id),
                profile_image: memberData[i].profile_image,
                name: memberData[i].name, 
                ...(memberData[i].percentage !== undefined &&{percentage: parseFloat(memberData[i].percentage)}), //add this field if percentage exists
                amount: parseFloat(memberData[i].amount),
                paymentStatus: 'Pending'
            };
        }
        const paidByUser = {user_id: new ObjectId(paidBy.user_id), name: paidBy.name};

        const document = {
            expense_id: new ObjectId(expense_id),
            name,
            category,
            subCategory,
            description,
            amount,
            paidBy: paidByUser,
            splitType,
            splitMethod,
            splitDetails: memberData,
            isSettled,
            isRequestedMoney,
            created_at: new Date(created_at),
            updated_at: new Date()
        }

        const result1 = await groupExpColl.updateOne(
            {group_id: new ObjectId(groupId)}, 
            {
                $pull:{
                    expenses: {expense_id: new ObjectId(expense_id)}
                }
            },
            {session}
        );

        const result2 = await groupExpColl.updateOne(
            {group_id: new ObjectId(groupId)}, 
            {
                $push: { expenses: document }
            },
            {session}
        );

        if(result1.modifiedCount>0 && result2.modifiedCount>0){
            await session.commitTransaction();
            return res.status(200).json({updated: true});
        }else{
            await session.abortTransaction();
            return res.status(400).json({updated: false});
        }
    } catch (error) {
        await session.abortTransaction();
        return res.status(500).json({failed:true, error: error.message});
    }finally{
        await session.endSession();
    }
}

const group_expenses_delete = async(req, res)=>{
    const session = await client.startSession();

    try {
        if(!req.body.group_id){
            return res.json({failed:true, error: "group id is missing"});
        }
        if(!req.body.expense_id){
            return res.json({failed:true, error: "expense id is missing"});
        }

        await session.startTransaction();

        // 1. delete expense
        const result1 = await groupExpColl.updateOne(
            {group_id: new ObjectId(req.body.group_id)},
            {
                $pull:{
                    expenses:{expense_id: new ObjectId(req.body.expense_id)}
                }
            },{session}
        );

        // 2. delete all money requests
        const result2 = await userColl.updateMany(
            {
                money_request: {
                    $elemMatch: {
                        group_id: new ObjectId(req.body.group_id),
                        expense_id: new ObjectId(req.body.expense_id)
                    }
                }
            },
            {
                $pull: {
                    money_request: {
                        group_id: new ObjectId(req.body.group_id),
                        expense_id: new ObjectId(req.body.expense_id)
                    }
                }
            },
            { session }
        );

        if(result1.modifiedCount>0 && result2.modifiedCount>0){
            await session.commitTransaction();
            return res.json({updated:true});
        }else{
            await session.abortTransaction();
            return res.json({updated:false});
        }
    } catch (error) {
        await session.abortTransaction();
        return res.json({failed: true, error: error.message});
    }finally{
        await session.endSession();
    }
}
const group_expenses_isSettled_patch = async(req, res)=>{
    try {
        const {group_id, expense_id, splitDetails} = req.body;

        if(!group_id){
            return res.status(400).json({failed: true, message:"Missing Field: group_id"});
        }else if(!expense_id){
            return res.status(400).json({failed: true, message:"Missing Field: expense_id"});
        }else if(!splitDetails && !Array.isArray(splitDetails)){
            return res.status(400).json({failed: true, message:"Missing Field: splitDetails or not an array"});
        }
        const newSD = splitDetails.map((elm)=>({...elm, paymentStatus:"Paid"}));

        const result = await groupExpColl.updateOne(
            {group_id: new ObjectId(group_id)},
            {
                $set:{
                    "expenses.$[exp].isSettled": {confirm: true, paymentMode:"Cash", settledAt: new Date()},
                    "expenses.$[exp].splitDetails": newSD
                }
            },
            {arrayFilters:[{"exp.expense_id": new ObjectId(expense_id)}]} // Fixed: removed extra array brackets
        );

        if(result.modifiedCount>0){
            return res.status(200).json({updated:true});
        }else{
            return res.status(200).json({updated:false});
        }
    } catch (error) {
        return res.status(500).json({failed: true, message: error.message});
    }
}

module.exports = {
    group_expenses_get,
    group_expenses_post,
    group_expenses_put,
    group_expenses_delete,
    group_expenses_isSettled_patch
    // group_expenses_patch,
    // group_expenses_profile_update_patch
};

// const group_expenses_put = async(req,res)=>{
//     const session = client.startSession();
//     session.startTransaction();
//     try {
//         const result1 = await groupExpColl.updateOne(
//             {group_id: new ObjectId(req.body.groupId)},
//             {
//                 $pull:{
//                     expenses:
//                         {
//                             expense_id: new ObjectId(req.body.expense_id)
//                         }
//                 }
//             },{session}
//         );

//         if(result1.modifiedCount==0){
//             await session.abortTransaction();
//             await session.endSession();
//             return res.json({updated: false});
//         }
//         let arr = req.body.splitDetails.map((elm)=> new ObjectId(elm.user_id));
//         const result2 = await userColl.find({_id: {$in:arr}},{ projection:{ money_request:1}}, {session}).toArray();
      
//         if(!result2 || result2.length<arr.length){
//             await session.abortTransaction();
//             await session.endSession();
//             return res.json({updated:false});
//         }

//         let newArrIds=[];
//         const userId = new ObjectId(req.body.user_id);
//         const expenseId = new ObjectId(req.body.expense_id);

//         for(let i=0;i<result2.length;i++){
//             for(let j=0;j<result2[i].money_request.length;j++){
//                 if( result2[i].money_request[j].expense_id.equals(expenseId) && result2[i].money_request[j].moneyRequestor_id.equals(userId) ){
//                     newArrIds.push(result2[i]._id);
//                     break;
//                 }
//             }
//         }

//         if(newArrIds.length>0){
//             const result3 = await userColl.updateMany(
//                 {_id:{$in:newArrIds}},
//                 {
//                     $pull:{
//                         money_request:{
//                             $and:[
//                                 {expense_id: expenseId},
//                                 {moneyRequestor_id: userId},
//                             ]
//                         }
//                     }
                    
//                 },{session}
//             );

//             if(result3.modifiedCount==0){
//                 await session.abortTransaction();
//                 await session.endSession();
//                 return res.json({updated: false});
//             }
//         }

//         await session.commitTransaction();
//         await session.endSession();
//         return res.json({updated: true});
//     } catch (error) {
//         await session.abortTransaction();
//         await session.endSession();
//         console.log(error);
//         return res.json({failed:true});
//     }
// };

// const group_expenses_patch = async(req,res)=>{
//     const session = client.startSession();
//     session.startTransaction();
//     // console.log(req.body);
//     try {
//         let memberIdArr = []
//         const newSplitDetails = req.body.splitDetails.map((elm)=>{
//             memberIdArr.push(new ObjectId(elm.user_id));
//             return {...elm,user_id: new ObjectId(elm.user_id), paymentStatus:'Paid', amount: Decimal128.fromString(elm.amount.$numberDecimal)};
//         });
//         const result1 = await groupExpColl.updateOne(
//             {group_id: new ObjectId(req.body.groupId)},
//             {
//                 $set:{
//                     "expenses.$[expense].isSettled": {confirm: true, paymentMode: req.body.paymentMode},
//                     "expenses.$[expense].splitDetails": newSplitDetails
//                 },
//                 $unset:{
//                     "expenses.$[expense].isRequestedMoney": ''
//                 }
//             },
//             {
//                 arrayFilters:[{
//                     "expense.expense_id": new ObjectId(req.body.expense_id)
//                 }],session
//             }
//         )
//         if(result1.modifiedCount==0){
//             await session.abortTransaction();
//             await session.endSession();
//             return res.json({updated:false});
//         }
//         // const result2 = await userColl.findOne({_id: new ObjectId(req.body.user_id)},{ projection:{ money_request:1, _id:0}}, {session});
//         const result2 = await userColl.find({_id: {$in:memberIdArr}},{ projection:{ money_request:1}}, {session}).toArray();

//         if(!result2 || result2.length < memberIdArr.length){
//             await session.abortTransaction();
//             await session.endSession();
//             return res.json({updated:false});
//         }

//         let newArrIds=[];
//         const userId = new ObjectId(req.body.user_id);
//         const expenseId = new ObjectId(req.body.expense_id);

//         for(let i=0;i<result2.length;i++){
//             for(let j=0;j<result2[i].money_request.length;j++){
//                 if( result2[i].money_request[j].expense_id.equals(expenseId) && result2[i].money_request[j].moneyRequestor_id.equals(userId) ){
//                     newArrIds.push(result2[i]._id);
//                     break;
//                 }
//             }
//         }

//         if(newArrIds.length>0){
//             const result3 = await userColl.updateMany(
//                 {_id:{$in:newArrIds}},
//                 {
//                     $pull:{
//                         money_request:{
//                             $and:[
//                                 {expense_id: expenseId},
//                                 {moneyRequestor_id: userId},
//                             ]
//                         }
//                     }
                    
//                 },{session}
//             );

//             if(result3.modifiedCount==0){
//                 await session.abortTransaction();
//                 await session.endSession();
//                 return res.json({updated:false});
//             }
//         }

//         await session.commitTransaction();
//         await session.endSession();
//         return res.json({updated:true});
//     } catch (error) {
//         // res.send(error);
//         await session.abortTransaction();
//         await session.endSession();
//         console.log(error);
//         return res.json({failed: true});
//     }
// };

// const group_expenses_profile_update_patch = async(req,res)=>{
//     const {totalBudget, description, startDate,endDate, group_id} = req.body;
    
//     try {
//         const parsedStartDate = moment(startDate, "DD/MM/YYYY, HH:mm:ss").toDate();
//         const parsedEndDate = endDate ? moment(endDate, "DD/MM/YYYY, HH:mm:ss").toDate() : null;

//         const document = {
//             total_budget: Decimal128.fromString(totalBudget.toString()),
//             description: description,
//             start_date: parsedStartDate,
//             ...(parsedEndDate && { end_date: parsedEndDate })
//         };
//         const result = await groupColl.updateOne(
//             {_id: new ObjectId(group_id)},
//             {
//                 $set: document
//             }
//         );
        
//         if(result.modifiedCount>0){
//             return res.json({updated: true});
//         }else{
//             return res.json({updated: false});
//         }
//     } catch (error) {
//         console.log(error);
//         return res.json({failed: true});
//     }
// };

