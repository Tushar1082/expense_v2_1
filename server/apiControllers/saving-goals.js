require('dotenv').config();

const {
    savingGoalsColl
} = require('../database/mongodb_db.js');
const {ObjectId} = require('mongodb');
// const moment = require('moment');

const saving_goals_get = async(req, res)=>{
    try {
        const user_id = new ObjectId(req.user.user_id);
        const result = await savingGoalsColl.find({user_id:user_id}).toArray();

        if(result.length>0){
            return res.status(200).json({goals:result});
        }else{
            return res.status(404).json({notFound: true});
        }
    } catch (error) {
        return res.status(500).json({failed: true, error: error.message});  
    }
}
const saving_goals_post = async(req, res)=>{
    try {
        const user_id = new ObjectId(req.user.user_id);

        const data = {
            user_id: user_id,
            title: req.body.title,
            target_amount: parseFloat(req.body.target_amount),
            saved_amount: 0,
            start_date: new Date(req.body.start_date),
            target_date: new Date(req.body.target_date),
            priority: req.body.priority,
            status:"active",
            description: req.body.description,
            contributions:[],
            created_at: new Date(),
            updated_at: new Date()
        }

        const result = await savingGoalsColl.insertOne(data);

        if(result.insertedId){
            return res.status(200).json({created:true, goal_id: result.insertedId});
        }else{
            return res.status(400).json({created:false});
        }
    } catch (error) {
        return res.status(500).json({failed: true, error: error.message});  
    }
}
const saving_goals_put = async(req, res)=>{

}
const saving_goals_patch = async(req, res)=>{
    try {
        const goal_id = new ObjectId(req.body.goal_id);

        const result = await savingGoalsColl.updateOne({_id:goal_id},
            {
                $set:{
                    title: req.body.title,
                    priority: req.body.priority,
                    target_amount: parseFloat(req.body.target_amount),
                    start_date: new Date(req.body.start_date),
                    target_date: new Date(req.body.target_date),
                    description: req.body.description,
                    updated_at: new Date()
                }
            }
        );

        if(result.modifiedCount>0){
            return res.status(200).json({updated:true});
        }else
            return res.status(400).json({updated:false});
    } catch (error) {   
        return res.status(500).json({failed:true, error: error.message});
    }
}
const saving_goals_delete = async(req, res)=>{
    try {
        const result = await savingGoalsColl.deleteOne({_id: new ObjectId(req.body.goal_id)});

        if(result.deletedCount>0){
            return res.status(200).json({updated:true});
        }else{
            return res.status(400).json({updated:false});
        }
    } catch (error) {
        return res.status(500).json({failed: true, error: error.message});
    }
}
const saving_goals_profile_update_patch = async()=>{
    
}
const saving_goals_add_money_post = async(req, res)=>{
    const user_id = new ObjectId(req.user.user_id);
    const goal_id = new ObjectId(req.body.goal_id);

    try {
        const contribution_id = new ObjectId();
        const data = {
            contribution_id: contribution_id,
            amount: parseFloat(req.body.amount),
            date: new Date(req.body.date),
            note: req.body.note
        };

        const result = await savingGoalsColl.updateOne(
            {_id:goal_id, user_id},
            {
                $inc:{saved_amount: parseFloat(req.body.amount)},
                $set:{updated_at: new Date()},
                $push:{
                    "contributions": data
                }
            }
        );
        if(result.modifiedCount>0){
            res.status(200).json({updated:true, contribution_id});
        }else{
            res.status(400).json({updated:false});
        }
    } catch (error) {
        res.status(500).json({failed: true, error: error.message});
    }
}



// const saving_goals_get = async (req,res)=>{
//     const userId = req.query.user_id;
//     const getTransList = req.query.getTransList === "true";
//     const getAdjList = req.query.getAdjList === "true";
//     const savingGoalProf = req.query.savingGoalProf;
  
//     if(getTransList && savingGoalProf){
//         try {
//             const value = new ObjectId(userId);
//             const result = await savingGoalsColl.findOne(
//               {
//                   user_id: value,
//                   saving_goals_profiles: {
//                       $elemMatch: { saving_goals_profileId: new ObjectId(savingGoalProf) }
//                   }
//               },
//               {
//                   projection: { "saving_goals_profiles.$": 1 }
//               }
//           ); 
//           // console.log(result);
            
//             if(result && result.saving_goals_profiles && result.saving_goals_profiles.length > 0){
//               const transactions =  result.saving_goals_profiles[0].transactions;
//               if(transactions.length>0){
//                   return res.send(transactions);
//               }else{
//                 return res.json({empty:true});
//               }
//             }else
//                 return res.json({notFound:true});
            
//         } catch (error) {
//             console.log(error);
//             return res.json({failed:true});
//         }
//     }else if(getAdjList && savingGoalProf){
//           try {
//               const value = new ObjectId(userId);
//               const result = await savingGoalsColl.findOne(
//               {
//                   user_id: value,
//                   saving_goals_profiles: {
//                       $elemMatch: { saving_goals_profileId: new ObjectId(savingGoalProf) }
//                   }
//               },
//               {
//                   projection: { "saving_goals_profiles.$": 1 }
//               }
//           ); 
//           // console.log(result);
              
//               if(result && result.saving_goals_profiles && result.saving_goals_profiles.length > 0){
//               const adjustments =  result.saving_goals_profiles[0].adjustments;
//               if(adjustments.length>0){
//                   return res.send(adjustments);
//               }else{
//                   return res.json({empty:true});
//               }
//               }else
//                   return res.json({notFound:true});
              
//           } catch (error) {
//               console.log(error);
//               return res.json({failed:true});
//           }
//     }
//     else{
//         try {
//             const value = new ObjectId(userId);
//             const result = await savingGoalsColl.findOne({user_id:value});
            
//             if(result && result.saving_goals_profiles.length> 0){
//                 return res.send(result.saving_goals_profiles);
//             }else
//                 return res.json({notFound:true});
            
//         } catch (error) {
//             console.log(error);
//             return res.json({failed:true});
//         }
//     }
// };

// const saving_goals_post = async (req,res)=>{
//     try {
//         const value = new ObjectId(req.body.user_id);

//         const result = await savingGoalsColl.updateOne(
//             {user_id: value},
//             {
//                 $push:{
//                     saving_goals_profiles:{
//                         saving_goals_profileId : new ObjectId(),
//                         profile_name:req.body.profile_name,
//                         goal_amount: Decimal128.fromString(req.body.goal_amount),
//                         start_date: new Date(req.body.start_date),
//                         target_date: new Date(req.body.target_date),
//                         priority: req.body.priority,
//                         category: req.body.category,
//                         subCategory: req.body.subCategory,
//                         ...(req.body.regularly_contribution && {
//                             regularly_contribution:{ amount: new Decimal128(req.body.regularly_contribution.amount), frequancy: req.body.regularly_contribution.frequancy }
//                         }),
//                         description: req.body.description,
//                         transactions: [],
//                         adjustments: [] 
//                     }
//                 }
//             }
//             ,{upsert:true}
//         );

//         if(result.modifiedCount>0 || result.upsertedCount>0){
//             return res.json({created:true});
//         }else{
//             return res.json({created:false});
//         }

//     } catch (error) {
//         // res.json({error});
//         console.log(error);
//         res.json({created:false});
//     }
// };

// const saving_goals_put = async(req,res)=>{
//     try {
//         const result = await savingGoalsColl.updateOne(
//             {
//                 user_id: new ObjectId(req.body.user_id),
//             },{
//                 $pull:{
//                     "saving_goals_profiles.$[profile].transactions":{
//                         transaction_id: new ObjectId(req.body.transaction_id)
//                     }
//                 }
//             },
//             {
//                 arrayFilters:[
//                     {"profile.saving_goals_profileId": new ObjectId(req.body.saving_goals_profileId)},
//                 ]
//             }
//         );

//         if(result.modifiedCount> 0){
//             return res.json({updated:true});
//         }else{
//             return res.json({updated:false});
//         }

//     } catch (error) {
//         // res.json({error: error});
//         console.log(error);
//         res.json({failed: true});
//     }
// };

// const saving_goals_patch = async (req,res)=>{
//     const boolVal = req.body.bool;
  
//     if(boolVal === true){
//         try {
//             const amount = req.body.amount;
//             const data = {
//                 transaction_id: new ObjectId(),
//                 date: new Date(req.body.date),
//                 amount: new Decimal128(amount.toString()),
//                 ...(req.body.source && {
//                     source: req.body.source
//                 }),
//                 ...(req.body.description && {
//                     description: req.body.description
//                 })
//             };
    
//             const result = await savingGoalsColl.updateOne(
//                 {
//                     user_id: new ObjectId(req.body.user_id),
//                 },
//                 {
//                     $push:{
//                         "saving_goals_profiles.$[profile].transactions":data
//                     }
//                 },{
//                     arrayFilters: [
//                         { "profile.saving_goals_profileId": new ObjectId(req.body.saving_goals_profileId) } // Filter the specific profile
//                     ]
//                 }
//             );
    
//             if(result.modifiedCount>0){
//                 return res.json({updated: true});
//             }else
//                 return res.json({updated: false});
//         } catch (error) {
//             console.log(error);
//             return res.json({failed:true});
//         }
//     }else{
//       try {
//           const amount = req.body.amount;
  
//           const data = {
//               type:req.body.type,
//               date: new Date(req.body.date),
//               amount: new Decimal128(amount.toString()),
//               ...(req.body.reason && {
//                   source: req.body.reason
//               }),
//           };
  
//           const result = await savingGoalsColl.updateOne(
//               {
//                   user_id: new ObjectId(req.body.user_id),
//                   "saving_goals_profiles.saving_goals_profileId": new ObjectId(req.body.saving_goals_profileId)
//               },
//               {
//                   $push:{
//                       "saving_goals_profiles.$[profile].adjustments":data
//                   }
//               },{
//                   arrayFilters: [
//                       { "profile.saving_goals_profileId": new ObjectId(req.body.saving_goals_profileId) } // Filter the specific profile
//                   ]
//               }
//           );
  
//           if(result.modifiedCount>0){
//               return res.json({updated: true});
//           }else
//               return res.json({updated: false});
//       } catch (error) {
//           // res.send(error);
//           console.log(error);
//           return res.json({failed:true});
//       }
//     }
// };

// const saving_goals_profile_update_patch = async(req,res)=>{
//     const {priority,goalAmount, description, startDate, targetDate, expProf_id, user_id} = req.body;
//     try {
//         const parsedStartDate = moment(startDate, "DD/MM/YYYY, HH:mm:ss").toDate();
//         const parsedEndDate = targetDate ? moment(targetDate, "DD/MM/YYYY, HH:mm:ss").toDate() : null;

//         const updateFields = {
//             "saving_goals_profiles.$[element].goal_amount": Decimal128.fromString(goalAmount),
//             "saving_goals_profiles.$[element].priority": priority,
//             "saving_goals_profiles.$[element].description": description,
//             "saving_goals_profiles.$[element].start_date": parsedStartDate,
//         };

//         if (parsedEndDate) {
//             updateFields["saving_goals_profiles.$[element].target_date"] = parsedEndDate;
//         }
//         // console.log(document);
//         const result = await savingGoalsColl.updateOne(
//             {user_id: new ObjectId(user_id)},
//             {
//                 $set: updateFields
//             },{
//                 arrayFilters:[{"element.saving_goals_profileId": new ObjectId(expProf_id)}]
//             }
//         );
//         // console.log(result);
//         if(result.modifiedCount>0){
//             return res.json({updated: true});
//         }else{
//             return res.json({updated: false});
//         }
//     } catch (error) {
//         // return res.json({error});
//         console.log(error);
//         return res.json({failed: true});
//     }
// };

// const saving_goals_delete = async(req,res)=>{
//     try {
//         if(req.body.length==1){
//             const result = await savingGoalsColl.deleteOne({user_id: new ObjectId(req.body.user_id)});
            
//             if(result.deletedCount>0){
//                 return res.json({updated: true});
//             }else{
//                 return res.json({updated: false});
//             }
//         }else{
//             const result = await savingGoalsColl.updateOne(
//                 {user_id: new ObjectId(req.body.user_id)},
//                 {
//                   $pull:{
//                     saving_goals_profiles:{
//                         saving_goals_profileId: new ObjectId(req.body.saving_goals_profileId)
//                     }
//                   }  
//                 }
//             );
//             if(result.modifiedCount>0){
//                 return res.json({updated: true});
//             }else{
//                 return res.json({updated: false});
//             }
//         }
//     } catch (error) {
//         console.log(error);
//         res.json({failed:true}); 
//     }
// };

module.exports = {
    saving_goals_get,
    saving_goals_post,
    saving_goals_put,
    saving_goals_patch,
    saving_goals_delete,
    saving_goals_profile_update_patch,
    saving_goals_add_money_post
};