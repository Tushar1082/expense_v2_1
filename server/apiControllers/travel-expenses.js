require('dotenv').config();

const {
    client,
    userColl,
    individualTourColl,
    groupTourColl
} = require('../database/mongodb_db.js');
const {ObjectId} = require('mongodb');
const moment = require('moment');

const travel_expenses_get = async(req,res)=>{
    const tour_id = req.query.tour_id;
    
    if(tour_id){
        try {
            if(req.query.tour_type === "Individual"){
                const result = await individualTourColl.findOne({_id: new ObjectId(req.query.tour_id)},{projection:{_id:0,expenses:1}});

                if(result === null || result.expenses.length===0){
                    return res.json({notFound:true});
                }else{
                    return res.send(result.expenses);
                }
            }else if(req.query.tour_type === "Group"){
                const result = await groupTourColl.findOne({_id: new ObjectId(req.query.tour_id)},{projection:{_id:0,expenses:1}});

                if(result === null || result.expenses.length===0){
                    return res.json({notFound:true});
                }else{
                    return res.send(result.expenses);
                }
            }else{
                return res.json({failed:true})
            }
        } catch (error) {
            console.log(error);
            res.json({failed: true});
        }
    }else{
        try {
            const arrData = JSON.parse(req.get('Array-Data'));
            const tourArr = arrData;
            const individualArr= [];
            const groupArr = [];

            tourArr.forEach((elm)=>{
                if(elm.type === 'Individual'){
                    individualArr.push(new ObjectId(elm.tour_id));
                }else if(elm.type === 'Group'){
                    groupArr.push(new ObjectId(elm.tour_id));
                }
            });
    
            const result1 = await individualTourColl.find({_id:{ $in: individualArr}}).toArray();
            const result2 = await groupTourColl.find({_id:{$in: groupArr}}).toArray();
    
            if(result1.length==0 && result2.length==0){
                return res.json({notFound:true});
            }else{
                res.json({
                    individualTourData: result1 || [],
                    groupTourData: result2 || [],
                });
            }
    
        } catch (error) {
            console.log(error);
            res.json({failed: true});
        }
    }
};

const travel_expenses_post = async(req,res)=>{
    if(!req.body.total_budget && !req.body.admin_id){
        return res.json({created: false});
    }
    if(!ObjectId.isValid(req.body.admin_id)){
        return res.json({created:false});
    }
    const session = client.startSession();
    session.startTransaction();
    // console.log(req.body);
    try {

        const totalBudget = parseFloat(req.body.total_budget);

        const admin_id = new ObjectId(req.body.admin_id);
        const data_individual = {
            admin_id: admin_id,
            name: req.body.tour_name,
            start_date: new Date(req.body.start_date),
            ...(req.body.end_date && {
                end_date: new Date(req.body.end_date),
            }),
            budget:totalBudget,
            locations: req.body.locations|| [],
            description:req.body.description|| '',
            type: req.body.track_for,
            expenses: []
        };

        let result;
        let groupMembersArr = [];

        // Insert into the respective collection
        if(req.body.track_for === 'Individual'){
            result = await individualTourColl.insertOne(data_individual,{session});
        }else if(req.body.track_for === 'Group'){
            if(req.body.group_members.length> 0){
                groupMembersArr.push({user_id: new ObjectId(req.body.admin_id), profile_image: req.body.profile_image, name: req.body.userName});
                req.body.group_members.forEach((elm)=>{
                    groupMembersArr.push({...elm, user_id: new ObjectId(elm.user_id)});
                });
            }
            const data_group = {
                ...data_individual,
                group_members: groupMembersArr
            }
            result = await groupTourColl.insertOne(data_group,{session});
        }else {
            return res.json({created:false});
        }
        
        if(!result.insertedId){
            await session.abortTransaction();
            await session.endSession();
            return res.json({created:false});
        }     

        const updateCreatorUser  = await userColl.updateOne({_id:admin_id},
            {$push:{tours:
                {
                    tour_id:result.insertedId,
                    type:req.body.track_for,
                    isAdmin:true
                }}
            },{session}
        );

        if(!updateCreatorUser.modifiedCount===0){
            await session.abortTransaction();
            await session.endSession();
            return res.json({created:false})
        }
        // let updateOtherMember;

        if(req.body.track_for === 'Group' && req.body.group_members.length>0){
            let groupMem = []; //req.body.group_members contains other group memebers not admin 
            // const arr = groupMembersArr.filter((elm) => elm.user_id !== admin_id).map((elm) => elm.user_id);
            req.body.group_members.forEach((elm)=>{
                groupMem.push(new ObjectId(elm.user_id));
            });

            const updateOtherMember  = await userColl.updateMany(
                {_id:{$in:groupMem}},
                {$push:{tours:
                    {
                        tour_id:result.insertedId,
                        type:req.body.track_for,
                        isAdmin:false
                    }}
                },{session}
            );
            if(!updateOtherMember.modifiedCount){
                await session.abortTransaction();
                await session.endSession();
                return res.json({created:false})
            }
        }

        // Rollback: Delete the inserted document if user update fails
        // if (req.body.track_for === 'Individual') {
        //     await individualTourColl.deleteOne({ _id: result.insertedId });
        // } else if (req.body.track_for === 'Group') {
        //     await groupTourColl.deleteOne({ _id: result.insertedId });
        // }
        await session.commitTransaction();
        await session.endSession();
        res.json({ created: true });

    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        // res.json({err:error});
        console.log(error);
        return res.json({failed:true});
    }
};

const travel_expenses_put = async(req,res)=>{
    const session = client.startSession();
    session.startTransaction();

    try {
        if(req.body.tour_type === "Individual"){
            const result = await individualTourColl.updateOne(
                {_id: new ObjectId(req.body.tour_id)},
                {
                    $pull:{
                        expenses:{
                            expense_id: new ObjectId(req.body.expense_id)
                        }
                    }
                },
                {session}
            );

            if(result.modifiedCount==0){
                await session.abortTransaction();
                await session.endSession();
                return res.json({updated:false});
            }
            await session.commitTransaction();
            await session.endSession();
            return res.json({updated:true});
        }else{
            const result = await groupTourColl.updateOne(
                {_id: new ObjectId(req.body.tour_id)},
                {
                    $pull:{
                        expenses:{
                            expense_id: new ObjectId(req.body.expense_id)
                        }
                    }
                },
                {session}
            );
            if(result.modifiedCount==0){
                await session.abortTransaction();
                await session.endSession();
                return res.json({updated:false});
            }
            let arr = req.body.splitDetails.map((elm)=> new ObjectId(elm.user_id));
            const result2 = await userColl.find({_id: {$in:arr}},{ projection:{ money_request:1}}, {session}).toArray();
          
            if(!result2 || result2.length<arr.length){
                await session.abortTransaction();
                await session.endSession();
                return res.json({updated:false});
            }
    
            let newArrIds=[];
            const userId = new ObjectId(req.body.user_id);
            const expenseId = new ObjectId(req.body.expense_id);
    
            for(let i=0;i<result2.length;i++){
                for(let j=0;j<result2[i].money_request.length;j++){
                    if( result2[i].money_request[j].expense_id.equals(expenseId) && result2[i].money_request[j].moneyRequestor_id.equals(userId) ){
                        newArrIds.push(result2[i]._id);
                        break;
                    }
                }
            }
    
            if(newArrIds.length>0){
                const result3 = await userColl.updateMany(
                    {_id:{$in:newArrIds}},
                    {
                        $pull:{
                            money_request:{
                                $and:[
                                    {expense_id: expenseId},
                                    {moneyRequestor_id: userId},
                                ]
                            }
                        }
                        
                    },{session}
                );

                if(result3.modifiedCount==0){
                    await session.abortTransaction();
                    await session.endSession();
                    return res.json({updated: false});
                }
            }
    
            await session.commitTransaction();
            await session.endSession();
            return res.json({updated:true});
        }
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        console.log(error);
        return res.json({failed:true});
    }
};

const travel_expenses_patch = async(req,res)=>{
    if(req.body.bool){
        const session = client.startSession();
        session.startTransaction();
        
        try {
            let memberIdArr = []
            const newSplitDetails = req.body.splitDetails.map((elm)=>{
                memberIdArr.push(new ObjectId(elm.user_id));
                return {...elm,user_id: new ObjectId(elm.user_id), paymentStatus:'Paid', amount: parseFloat(elm.amount)};
            });

            const result1 = await groupTourColl.updateOne(
                {_id: new ObjectId(req.body.tour_id)},
                {
                    $set:{
                        // "expenses.$[expense].isSettled": req.body.isSettled
                        "expenses.$[expense].isSettled": req.body.isSettled,
                        "expenses.$[expense].splitDetails": newSplitDetails
                    },
                    $unset:{
                        "expenses.$[expense].isRequestedMoney": ''
                    }
                },
                {
                    arrayFilters:[{
                        "expense.expense_id": new ObjectId(req.body.expense_id)
                    }], session
                }
            )

            if(result1.modifiedCount==0){
                await session.abortTransaction();
                await session.endSession();
                return res.json({updated:false})
            }

            const result2 = await userColl.find({_id: {$in:memberIdArr}},{ projection:{ money_request:1}}, {session}).toArray();

            if (!result2 || result2.length < memberIdArr.length) {
                await session.abortTransaction();
                await session.endSession();
                return res.json({ updated: false });
            }
            

            let newArrIds=[];
            const userId = new ObjectId(req.body.user_id);
            const expenseId = new ObjectId(req.body.expense_id);

            for(let i=0;i<result2.length;i++){
                for(let j=0;j<result2[i].money_request.length;j++){
                    if( result2[i].money_request[j].expense_id.equals(expenseId) && result2[i].money_request[j].moneyRequestor_id.equals(userId) ){
                        newArrIds.push(result2[i]._id);
                        break;
                    }
                }
            }

            if(newArrIds.length>0){
                const result3 = await userColl.updateMany(
                    {_id:{$in:newArrIds}},
                    {
                        $pull:{
                            money_request:{
                                $and:[
                                    {expense_id: expenseId},
                                    {moneyRequestor_id: userId},
                                ]
                            }
                        }
                        
                    },{session}
                );

                if(result3.modifiedCount==0){
                    await session.abortTransaction();
                    await session.endSession();
                    return res.json({updated:false});
                }
            }

            await session.commitTransaction();
            await session.endSession();
            return res.json({updated:true})
        } catch (error) {
            await session.abortTransaction();
            await session.endSession();
            // return res.json({error});
            console.log(error);
            return res.json({failed: true});
        }
    }else{
        try {
            if(req.body.tour_type === "Individual"){
                const data = {
                    expense_id: new ObjectId(),
                    name: req.body.name,
                    category:  req.body.category,
                    subCategory: req.body.subCategory,
                    date: new Date(req.body.date),
                    description: req.body.description,
                    amount: parseFloat(req.body.amount),
                    paymentMode:  req.body.paymentMode,
                    ...(req.body.expense_location === "Other" ? {
                        expense_location: req.body.otherLocation}
                        :{
                            expense_location: req.body.expense_location,
                        }
                    )
                }
                const result = await individualTourColl.updateOne(
                    {_id: new ObjectId(req.body.tour_id)},
                    {
                        $push:{
                            expenses:data
                        }
                    }
                );

                if(result.modifiedCount>0){
                    return res.json({created:true});
                }else{
                    return res.json({created:false});
                }
            }else{
                let splitDetails = [];
                req.body.splitDetails.forEach((elem)=>{
                    splitDetails.push({...elem, user_id: new ObjectId(elem.user_id), amount: parseFloat(elem.amount), paymentStatus:'Pending'});
                })
                // console.log(req.body);
                const data = {
                    expense_id: new ObjectId(),
                    name: req.body.name,
                    category:  req.body.category,
                    subCategory: req.body.subCategory,
                    date: new Date(req.body.date),
                    description: req.body.description,
                    amount: parseFloat(req.body.amount),
                    paymentMode:  req.body.paymentMode,
                    ...(req.body.expense_location === "Other" ? {
                        expense_location: req.body.otherLocation}
                        :{
                            expense_location: req.body.expense_location,
                        }
                    ),
                    paidBy:{ user_id: new ObjectId(req.body.paidBy.user_id), name: req.body.paidBy.name},
                    splitType: req.body.splitType,
                    splitMethod: req.body.splitMethod,
                    splitDetails: splitDetails,
                    isSettled:{confirm:false, paymentMode:""}
                }

                const result = await groupTourColl.updateOne(
                    {_id: new ObjectId(req.body.tour_id)},
                    {
                        $push:{
                            expenses:data
                        }
                    }
                );
                if(result.modifiedCount>0){
                    return res.json({updated:true});
                }else{
                    return res.json({updated:false});
                }
            }
        } catch (error) {
            // res.send(error);
            // console.log(error);
            console.log(error);
            // return res.json({error:error});
            return res.json({failed:true});
        }
    }

};

const travel_expenses_remove_member_patch = async(req,res)=>{
    const session = client.startSession();
    session.startTransaction();

    try {
        const result = await groupTourColl.updateOne(
            {_id: new ObjectId(req.body.tour_id)},
            {
                $pull:{
                    group_members:{
                        user_id: new ObjectId(req.body.member_id)
                    }
                }
            },{session}
        );
        if(result.modifiedCount==0){
            await session.abortTransaction();
            await session.endSession();
            return res.json({updated:false});
        }

        const result1 = await userColl.updateOne(
            {_id: new ObjectId(req.body.member_id)},
            {
                $pull:{
                    tours:{
                        tour_id: new ObjectId(req.body.tour_id)
                    }
                }
            },{session}
        );
        if(result1.modifiedCount==0){
            await session.abortTransaction();
            await session.endSession();
            return res.json({updated:false});
        }
        await session.commitTransaction();
        await session.endSession();
        return res.json({updated:true});
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        console.log(error);
        return res.json({failed:true});
    }
};

const travel_expenses_add_member_patch = async(req,res)=>{
    const session = client.startSession();
    session.startTransaction();

    try {
        const result = await groupTourColl.updateOne(
            {_id: new ObjectId(req.body.tour_id)},
            {
                $push:{
                    group_members:{
                        user_id: new ObjectId(req.body.user_id),
                        profile_image: req.body.profile_image,
                        name: req.body.name
                    }
                }
            },{session}
        );
        if(result.modifiedCount==0){
            await session.abortTransaction();
            await session.endSession();
            return res.json({updated:false});
        }

        const result1 = await userColl.updateOne(
            {_id: new ObjectId(req.body.user_id)},
            {
                $push:{
                    tours:{
                        tour_id: new ObjectId(req.body.tour_id),
                        type: 'Group',
                        isAdmin: false
                    }
                }
            },{session}
        );
        if(result1.modifiedCount==0){
            await session.abortTransaction();
            await session.endSession();
            return res.json({updated:false});
        }
        await session.commitTransaction();
        await session.endSession();
        return res.json({updated:true});
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        console.log(error);
        return res.json({failed:true});
    }
};

const travel_expenses_make_admin_patch = async(req,res)=>{
    const session = client.startSession();
    try {
        session.startTransaction();
        const result1 = await groupTourColl.updateOne(
            {_id: new ObjectId(req.body.tour_id)},
            {
                $set:{
                    admin_id: new ObjectId(req.body.user_id)
                }
            },{session}
        );
        if(result1.modifiedCount==0){
            await session.abortTransaction();
            await session.endSession();
            return res.json({updated:false});
        }
        const result2 = await userColl.updateOne(
            {_id: new ObjectId(req.body.prevAdmin_id)},
            {
                $set:{
                    "tours.$[tourId].isAdmin": false 
                }
            },
            {
                arrayFilters:[{
                    "tourId.tour_id": new ObjectId(req.body.tour_id)
                }],
                session
            }
        );
        if(result2.modifiedCount==0){
            await session.abortTransaction();
            await session.endSession();
            return res.json({updated:false});
        }

        const result3 = await userColl.updateOne(
            {_id: new ObjectId(req.body.user_id)},
            {
                $set:{
                    "tours.$[tourId].isAdmin": true 
                }
            },
            {
                arrayFilters:[{
                    "tourId.tour_id": new ObjectId(req.body.tour_id)
                }],
                session
            }
        );

        if(result3.modifiedCount==0){
            await session.abortTransaction();
            await session.endSession();
            return res.json({updated:false});
        }

        await session.commitTransaction();
        await session.endSession();
        return res.json({updated:true});
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        console.log(error);
        return res.json({failed:true});
    }
};

const travel_expenses_profile_update_patch = async(req,res)=>{
    const {totalBudget, description, startDate, locations,endDate, tour_id} = req.body;
    
    try {
        const parsedStartDate = moment(startDate, "DD/MM/YYYY, HH:mm:ss").toDate();
        const parsedEndDate = endDate ? moment(endDate, "DD/MM/YYYY, HH:mm:ss").toDate() : null;
        // console.log(typeof totalBudget);

        const document = {
            budget: parseFloat(totalBudget),
            description: description,
            start_date: parsedStartDate,
            ...(parsedEndDate && { end_date: parsedEndDate }),
            locations: locations 
        };

        const result = await groupTourColl.updateOne(
            {_id: new ObjectId(tour_id)},
            {
                $set: document
            }
        );
        if(result.modifiedCount>0){
            return res.json({updated: true});
        }else{
            return res.json({updated: false});
        }
    } catch (error) {
        console.log(error);
        return res.json({failed: true});
    }
};

const travel_expenses_delete = async(req,res)=>{
    try {
        if(req.body.tour_type === "Individual"){
            const result = await individualTourColl.deleteOne({_id: new ObjectId(req.body.tour_id)});
            
            if(result.deletedCount>0){
                return res.json({updated: true});
            }else{
                return res.json({updated: false});
            }
        }else{
            const result = await groupTourColl.deleteOne({_id: new ObjectId(req.body.tour_id)});
            
            if(result.deletedCount>0){
                return res.json({updated: true});
            }else{
                return res.json({updated: false});
            }
        }
    } catch (error) {
        console.log(error);
        return res.json({failed:true});
    }
};

module.exports = {
    travel_expenses_get, 
    travel_expenses_post, 
    travel_expenses_patch, 
    travel_expenses_put, 
    travel_expenses_delete,
    travel_expenses_remove_member_patch,
    travel_expenses_add_member_patch,
    travel_expenses_make_admin_patch,
    travel_expenses_profile_update_patch
};