require('dotenv').config();
const {
    recurringExpColl,
} = require('../database/mongodb_db.js');
const {ObjectId} = require('mongodb');
const moment = require('moment');

const recurring_expenses_get = async (req,res)=>{
    const userId = req.query.user_id;
    const profileId = req.query.profile_id;
  
    if(profileId !== undefined){
          try {
              const value = new ObjectId(userId);
              const result = await recurringExpColl.findOne(
                  {
                    user_id: value,
                    "recurring_expenses_profiles.recurring_expenses_profileId": new ObjectId(profileId),
                  },
                  {
                    projection: {
                      _id: 0,
                      "recurring_expenses_profiles.$": 1, // Use `$` to project only the matched array element
                    },
                  }
              );
  
              if(result && result.recurring_expenses_profiles.length > 0){
                  return res.json({expenses: result.recurring_expenses_profiles[0].expenses});
              }else
                  return res.json({notFound:true});
          } catch (error) {
              console.log(error);
              return res.json({failed:true});
          }
      }else{
          try {
              const value = new ObjectId(userId);
              const result = await recurringExpColl.findOne({user_id:value});
              
              if(result && result.recurring_expenses_profiles.length> 0){
                  return res.send(result.recurring_expenses_profiles);
              }else
                  return res.json({notFound:true});
              
          } catch (error) {
              console.log(error);
              return res.json({failed:true});
          }
      }
};

const recurring_expenses_post = async(req,res)=>{
    try {
        const value = new ObjectId(req.body.user_id);
        const result = await recurringExpColl.updateOne(
            {user_id: value},
            {
                $push:{
                    recurring_expenses_profiles:{
                        recurring_expenses_profileId : new ObjectId(),
                        profile_name:req.body.profile_name,
                        total_budget: parseFloat(req.body.total_budget),
                        expenses_period: req.body.expenses_period,
                        description: req.body.description,
                        start_date: new Date(req.body.start_date),
                            ...(req.body.end_date && {
                            end_date: new Date(req.body.end_date),
                        }),
                        expenses: [] 
                    }
                }
            }
            ,{upsert:true}
        );

        if(result.modifiedCount>0 || result.upsertedCount>0){
            return res.json({created:true});
        }else{
            return res.json({created:false});
        }

    } catch (error) {
        res.json({error});
        // console.log(error);
        // res.json({created:false});
    }
};

const recurring_expenses_put = async (req,res)=>{
    try {
        const result = await recurringExpColl.updateOne(
            {
                user_id: new ObjectId(req.body.user_id),
            },{
                $pull:{
                    "recurring_expenses_profiles.$[profile].expenses":{
                       expense_id: new ObjectId(req.body.expense_id)
                    }
                }
            },
            {
                arrayFilters:[
                    {"profile.recurring_expenses_profileId": new ObjectId(req.body.recurring_expenses_profileId)},
                ]
            }
        );

        if(result.modifiedCount> 0){
            return res.json({updated:true});
        }else{
            return res.json({updated:false});
        }

    } catch (error) {
        // res.json({error: error});
        console.log(error);
        res.json({failed: true});
    }
};

const recurring_expenses_patch = async (req, res)=>{
    try {
        const amount = req.body.amount;
        const data = {
            expense_id: new ObjectId(),
            name: req.body.name,
            category: req.body.category,
            subCategory: req.body.subCategory||"Other",
            date: new Date(req.body.date),
            amount: parseFloat(amount),
            exp_description: req.body.description
        };

        const result = await recurringExpColl.updateOne(
            {
                user_id: new ObjectId(req.body.user_id),
                "recurring_expenses_profiles.recurring_expenses_profileId": new ObjectId(req.body.recurring_expenses_profileId)
            },
            {
                $push:{
                    "recurring_expenses_profiles.$[profile].expenses":data
                }
            },{
                arrayFilters: [
                    { "profile.recurring_expenses_profileId": new ObjectId(req.body.recurring_expenses_profileId) } // Filter the specific profile
                ]
            }
        );

        if(result.modifiedCount>0){
            return res.json({updated: true});
        }else
            return res.json({updated: false});
    } catch (error) {
        console.log(error);
        return res.json({failed:true});
    }
};

const recurring_expenses_delete = async(req,res)=>{
    try {
        if(req.body.length==1){
            const result = await recurringExpColl.deleteOne({user_id: new ObjectId(req.body.user_id)});

            if(result.deletedCount>0){
                return res.json({updated: true});
            }else{
                return res.json({updated: false});
            }
        }else{
            const result = await recurringExpColl.updateOne(
                {user_id: new ObjectId(req.body.user_id)},
                {
                  $pull:{
                    recurring_expenses_profiles:{
                        recurring_expenses_profileId: new ObjectId(req.body.recurring_expenses_profileId)
                    }
                  }  
                }
            );
            if(result.modifiedCount>0){
                return res.json({updated: true});
            }else{
                return res.json({updated: false});
            }
        }
    } catch (error) {
        console.log(error);
        res.json({failed:true}); 
    }
};

const recurring_expenses_profile_update_patch = async(req,res)=>{
    const {totalBudget, description, startDate,endDate, expProf_id, user_id} = req.body;
    // console.log(req.body);
    try {
        const parsedStartDate = moment(startDate, "DD/MM/YYYY, HH:mm:ss").toDate();
        const parsedEndDate = endDate ? moment(endDate, "DD/MM/YYYY, HH:mm:ss").toDate() : null;
        // console.log(typeof totalBudget);

        const updateFields = {
            "recurring_expenses_profiles.$[element].total_budget": parseFloat(totalBudget),
            "recurring_expenses_profiles.$[element].description": description,
            "recurring_expenses_profiles.$[element].start_date": parsedStartDate,
        };

        if (parsedEndDate) {
            updateFields["recurring_expenses_profiles.$[element].end_date"] = parsedEndDate;
        }
        // console.log(document);
        const result = await recurringExpColl.updateOne(
            {user_id: new ObjectId(user_id)},
            {
                $set: updateFields
            },{
                arrayFilters:[{"element.recurring_expenses_profileId": new ObjectId(expProf_id)}]
            }
        );
        // console.log(result);
        if(result.modifiedCount>0){
            return res.json({updated: true});
        }else{
            return res.json({updated: false});
        }
    } catch (error) {
        // return res.json({error});
        console.log(error);
        return res.json({failed: true});
    }
};

module.exports = {
    recurring_expenses_get,
    recurring_expenses_post,
    recurring_expenses_put,
    recurring_expenses_patch,
    recurring_expenses_delete,
    recurring_expenses_profile_update_patch
};