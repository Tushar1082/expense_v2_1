require('dotenv').config();

const {
    trackMyExpColl,
} = require('../database/mongodb_db.js');
const { ObjectId } = require('mongodb');


// Expense Profile REST Functions
const expense_profile_get = async (req, res) => {
    const userId = req.user.user_id;
    if (!userId) {
        return res.json({ failed: true, error: "user id is missing" });
    }
    try {
        const value = new ObjectId(userId);

        const result = await trackMyExpColl.findOne({ user_id: value });

        if (result) {
            if (result.expenses_profiles.length > 0) {
                return res.status(200).send(result.expenses_profiles); // OK
            } else {
                return res.status(204).send({ notFound: true }); // No Content (found user but no profiles)
            }
        } else {
            return res.status(400).json({ notFound: true }); // Not Found
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ failed: true, error: error.message }); // Internal Server Error
    }
};

const expense_profile_post = async (req, res) => {
    try {
        if (!req.user.user_id) {
            return res.json({ failed: true, error: "user id is missing" });
        }
        const value = new ObjectId(req.user.user_id);

        const result = await trackMyExpColl.updateOne(
            { user_id: value },
            {
                $push: {
                    expenses_profiles: {
                        expenses_profileId: new ObjectId(),
                        profile_img: req.body.exp_profile_img,
                        profile_name: req.body.profile_name,
                        total_budget: parseFloat(req.body.budget),
                        expenses_period: req.body.period,
                        description: req.body.description,
                        created_at: new Date(),
                        updated_at: new Date(),
                        expenses: [],
                    },
                },
            },
            { upsert: true }
        );

        if (result.modifiedCount > 0 || result.upsertedCount > 0) {
            return res.status(200).json({ created: true }); // Success status code
        } else {
            return res.status(400).json({ created: false }); // Bad request if no changes were made
        }

    } catch (error) {
        return res.status(500).json({ failed: false, error: error }); // Internal server error for any exception
    }
};

const expense_profile_delete = async (req, res) => {
    try {
        const { profile_id } = req.body;
        const user_id = req.user.user_id;
        if (!user_id) {
            return res.json({ failed: true, error: "user id is missing" });
        }
        // Case: only one profile, delete the whole document
        if (req.body.profile_count == 1) {
            const result = await trackMyExpColl.deleteOne({ user_id: new ObjectId(user_id) });

            if (result.deletedCount > 0) {
                return res.status(200).json({ updated: true });
            } else {
                return res.status(200).json({ updated: false });
            }
        }

        // Case: delete only selected profile(s) from array
        const result = await trackMyExpColl.updateOne(
            { user_id: new ObjectId(user_id) },
            {
                $pull: {
                    expenses_profiles: {
                        expenses_profileId: new ObjectId(profile_id)
                    }
                }
            }
        );

        if (result.modifiedCount > 0) {
            return res.status(200).json({ updated: true });
        } else {
            return res.status(200).json({ updated: false });
        }

    } catch (error) {
        return res.status(500).json({ failed: true, error: error });
    }
};


const track_my_expenses_profile_update_patch = async (req, res) => {
    const { totalBudget, description, startDate, endDate, expProf_id, user_id } = req.body;
    // console.log(req.body);
    try {
        const parsedStartDate = moment(startDate, "DD/MM/YYYY, HH:mm:ss").toDate();
        const parsedEndDate = endDate ? moment(endDate, "DD/MM/YYYY, HH:mm:ss").toDate() : null;
        // console.log(typeof totalBudget);

        const updateFields = {
            "expenses_profiles.$[element].total_budget": parseFloat(totalBudget),
            "expenses_profiles.$[element].description": description,
            "expenses_profiles.$[element].start_date": parsedStartDate,
        };

        if (parsedEndDate) {
            updateFields["expenses_profiles.$[element].end_date"] = parsedEndDate;
        }
        // console.log(document);
        const result = await trackMyExpColl.updateOne(
            { user_id: new ObjectId(user_id) },
            {
                $set: updateFields
            }, {
            arrayFilters: [{ "element.expenses_profileId": new ObjectId(expProf_id) }]
        }
        );
        // console.log(result);
        if (result.modifiedCount > 0) {
            return res.json({ updated: true });
        } else {
            return res.json({ updated: false });
        }
    } catch (error) {
        // return res.json({error});
        console.log(error);
        return res.json({ failed: true });
    }
};
// Expense REST Functions
const expense_get = async (req, res) => {
    const userId = req.query.user_id;
    const profile_id = req.query.profile_id;

    try {
        const result = await trackMyExpColl.aggregate([
            { $match: { user_id: new ObjectId(userId) } },
            {
                $unwind: "$expenses_profiles"
            },
            {
                $match: {
                    "expenses_profiles.expenses_profileId": new ObjectId(profile_id)
                }
            },
            {
                $project: {
                    _id: 0,
                    expenses: "$expenses_profiles.expenses"
                }
            }
        ]).toArray();

        if (result.length > 0) {
            return res.status(200).json({ expenses: result[0].expenses });
        } else {
            return res.status(400).send({ notFound: true });
        }

    } catch (error) {
        return res.status(500).json({ failed: true, error: error.message }); // Internal Server Error
    }
};
const expense_post = async (req, res) => {
    try {
        if (!req.user.user_id) {
            return res.json({ failed: true, error: "user id is missing" });
        }
        const data = {
            expense_id: new ObjectId(),
            name: req.body.expense_name,
            category: req.body.category,
            subCategory: req.body.subcategory || "Other",
            amount: parseFloat(req.body.amount),
            exp_description: req.body.description,
            created_at: new Date(req.body.date),
            updated_at: new Date(req.body.date),
        };

        const result = await trackMyExpColl.updateOne(
            {
                user_id: new ObjectId(req.user.user_id),
                "expenses_profiles.expenses_profileId": new ObjectId(req.body.profile_id)
            },
            {
                $push: {
                    "expenses_profiles.$[profile].expenses": data
                }
            }, {
            arrayFilters: [
                { "profile.expenses_profileId": new ObjectId(req.body.profile_id) } // Filter the specific profile
            ]
        }
        );

        if (result.modifiedCount > 0) {
            return res.json({ updated: true, expense_id: data.expense_id });
        } else
            return res.json({ updated: false });
    } catch (error) {
        console.log(error);
        return res.json({ failed: true });
    }
};
const expense_put = async (req, res) => {
    try {
        if (!req.user.user_id) {
            return res.json({ failed: true, error: "user id is missing" });
        }
        const user_id = new ObjectId(req.user.user_id);
        const profile_id = new ObjectId(req.body.profile_id);
        const expense_id = new ObjectId(req.body.expense_id);

        const data = {
            expense_id: expense_id,
            name: req.body.expense_name,
            category: req.body.category,
            subCategory: req.body.subCategory || "Other",
            amount: parseFloat(req.body.amount),
            exp_description: req.body.description,
            created_at: new Date(req.body.created_at),
            updated_at: new Date(req.body.updated_at),
        };

        const result = await trackMyExpColl.updateOne(
            {
                user_id: user_id
            },
            {
                $set: {
                    "expenses_profiles.$[profile].expenses.$[expense]": data
                }
            },
            {
                arrayFilters: [
                    { "profile.expenses_profileId": profile_id },
                    { "expense.expense_id": expense_id }
                ]
            }
        );

        if (result.modifiedCount > 0) {
            return res.status(200).json({ updated: true });
        } else {
            return res.status(400).json({ updated: false });
        }
    } catch (error) {
        return res.status(500).json({ failed: true, error: error.message });
    }
}
const expense_delete = async (req, res) => {
    try {
        if (!req.user.user_id) {
            return res.json({ failed: true, error: "user id is missing" });
        }
        const user_id = new ObjectId(req.user.user_id);
        const expense_id = new ObjectId(req.body.expense_id);
        const profile_id = new ObjectId(req.body.profile_id);

        const result = await trackMyExpColl.updateOne(
            {
                user_id: user_id,
            },
            {
                $pull: {
                    "expenses_profiles.$[profile].expenses": {
                        expense_id: expense_id
                    }
                }
            },
            {
                arrayFilters: [
                    { "profile.expenses_profileId": profile_id },
                ]
            }
        );

        if (result.modifiedCount > 0) {
            return res.status(200).json({ updated: true });
        } else {
            return res.status(400).json({ updated: false, message: "Expense not found or already deleted." });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ failed: true, message: "Internal Server Error" });
    }
};

module.exports = {
    expense_profile_get,
    expense_profile_post,
    expense_profile_delete,
    track_my_expenses_profile_update_patch,

    expense_get,
    expense_post,
    expense_put,
    expense_delete
}