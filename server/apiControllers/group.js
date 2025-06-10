require('dotenv').config();

const {
    client,
    userColl,
    groupColl,
    groupExpColl
} = require('../database/mongodb_db.js');
const { ObjectId } = require('mongodb');

const group_get = async (req, res) => {
    // if (!req.query.group_id || !req.query.user_id) {
    //     return res.status(400).json({ failed: true, message: "Missing Field: group_id" });
    // }
    if (req.query.group_id) {
        try {
            const groupId = new ObjectId(req.query.group_id);
            const admin_id = new ObjectId(req.query.user_id);

            const result = await groupColl.findOne({ _id: groupId, admin_id: admin_id });

            if (result != null) {
                return res.status(200).json({ result });
            } else {
                return res.status(400).json({ notFound: true });
            }
        } catch (error) {
            res.status(400).json({ failed: true, error: error.message });
        }
    } else {
        try {
            const user_groups = await userColl.findOne({ _id: new ObjectId(req.user.user_id) }, { projection: { groups: 1, _id: 0 } });
            const arrData = user_groups.groups;

            let newArr = [];
            for (let i = 0; i < arrData.length; i++) {
                // newArr[i] = new ObjectId(arrData[i]);
                newArr[i] = arrData[i].group_id;
            }

            const result = await groupColl.find(
                { _id: { $in: newArr } },
                { _id: 0, name: 1, start_date: 1, budget: 1, description: 1 }
            ).toArray();

            if (result.length > 0) {
                res.status(200).send(result);
            } else {
                res.status(400).json({ notFound: true });
            }
        } catch (error) {
            res.status(500).json({ failed: true, error: error.message })
        }
    }
};

const group_post = async (req, res) => {
    const session = await client.startSession();

    try {
        if (!req.body.budget) {
            return res.status(400).json({ creator: false, message: "Missing Field: budget" });
        }
        if (!req.user.user_id) {
            return res.status(400).json({ creator: false, message: "Missing Field: user_id" });
        }

        const totalBudget = parseFloat(req.body.budget);
        const admin_id = new ObjectId(req.user.user_id);
        const arr = req.body.members; // this array also contain admin data
        let groupArr = [];
        let userIds = [];
        let admin_name = "";

        if (!arr) {
            return res.status(400).json({ creator: false, message: "Missing Field: members" });
        } else if (!Array.isArray(arr)) {
            return res.status(400).json({ creator: false, message: "Member Field is not valid" });
        } else if (arr.length == 0) {
            return res.status(400).json({ creator: false, message: "Member Field is not contain members" });
        }

        await session.startTransaction();

        for (let i = 0; i < arr.length; i++) {
            groupArr[i] = { user_id: new ObjectId(arr[i].user_id), profile_image: arr[i].profile_image, name: arr[i].name };
            userIds.push(new ObjectId(arr[i].user_id));
            if (arr[i].user_id === req.user.user_id)
                admin_name = arr[i].name;
        }

        const result = await groupColl.insertOne(
            {
                profile_img: req.body.exp_profile_img,
                profile_name: req.body.profile_name,
                admin_id: admin_id,
                total_budget: totalBudget,
                group_members: groupArr,
                expenses_period: req.body.period,
                description: req.body.description,
                created_at: new Date(),
                updated_at: new Date()
            }, { session }
        );
        if (!result.insertedId) {
            await session.abortTransaction();
            return res.status(400).json({ created: false });
        }

        const result2 = await groupExpColl.insertOne(
            {
                group_id: new ObjectId(result.insertedId),
                expenses: []
            },
            { session }
        );

        if (!result2.insertedId) {
            await session.abortTransaction();
            return res.status(400).json({ created: false });
        }

        userIds = userIds.filter((elm) => elm.toString() !== req.user.user_id);

        const result3 = await userColl.updateOne(
            { _id: admin_id },
            {
                $push: { groups: { group_id: result.insertedId, isAdmin: true, } }
            },
            { session }
        );

        const result4 = await userColl.updateMany(
            { _id: { $in: userIds } },
            {
                $push: { groups: { group_id: result.insertedId, isAdmin: false } }
            },
            { session }
        );

        const result5 = await userColl.updateMany(
            { _id: { $in: userIds } },
            {
                $push:
                {
                    notifications: {
                        notification_id: new ObjectId(),
                        type: "other",
                        status: "unread",
                        user_id: "N/A",
                        user_profile_image: "N/A",
                        message: `You were added to the group '${req.body.profile_name}' by ${admin_name}`,
                        date: new Date()
                    }
                }
            },
            { session }
        );
        // console.log(result5);

        if (result3.modifiedCount > 0 && result4.modifiedCount > 0) {
            await session.commitTransaction();
            return res.status(200).json({ created: true })
        } else {
            await session.abortTransaction();
            return res.status(400).json({ created: false });
        }
    } catch (error) {
        await session.abortTransaction();
        return res.status(500).json({ failed: true, error: error.message })
        // console.log(error);
        // res.json({error:error});
    } finally {
        await session.endSession();
    }
};

const group_patch = async (req, res) => {
    const deleteMember = req.body.deleteMember == true;
    const addMembers = req.body.addMembers == true;
    const makeAdmin = req.body.makeAdmin == true;
    const session = client.startSession();
    session.startTransaction();

    try {
        let result1, result2;
        if (!req.body.group_id) {
            return res.status(400).json({ failed: true, message: "Missing Field: group_id" });
        }
        if (deleteMember) {
            if (!req.body.member_id) {
                return res.status(400).json({ failed: true, message: "Missing Field: member_id" });
            }
            result1 = await groupColl.updateOne(
                { _id: new ObjectId(req.body.group_id) },
                {
                    $pull: {
                        group_members: {
                            user_id: new ObjectId(req.body.member_id)
                        }
                    }
                }, { session }
            );
            if (result1.modifiedCount === 0) {
                await session.abortTransaction();
                await session.endSession();
                return res.status(400).json({ updated: false });
            }
            result2 = await userColl.updateOne(
                { _id: new ObjectId(req.body.member_id) },
                {
                    $pull: {
                        groups: { group_id: new ObjectId(req.body.group_id) }
                    }
                }, { session }
            )
            if (result2.modifiedCount === 0) {
                await session.abortTransaction();
                await session.endSession();
                return res.status(400).json({ updated: false });
            }

            // Find all money requests sent by the user who is now being removed from the group.
            const result3 = await userColl.updateMany(
                {
                    money_request: {
                        $elemMatch: {
                            moneyRequestor_id: new ObjectId(req.body.member_id),
                            group_id: new ObjectId(req.body.group_id)
                        }
                    }
                },
                {
                    $pull: {
                        money_request: {
                            moneyRequestor_id: new ObjectId(req.body.member_id),
                            group_id: new ObjectId(req.body.group_id)
                        }
                    }
                }
            );
            //This should be committed
            // if (result3.modifiedCount == 0) {
            //     await session.abortTransaction();
            //     await session.endSession();
            //     return res.status(400).json({ updated: false });
            // }
            const result4 = await userColl.updateOne(
                { _id: new ObjectId(req.body.member_id) },
                {
                    $push:
                    {
                        notifications: {
                            notification_id: new ObjectId(),
                            type: "other",
                            status: "unread",
                            user_id: "N/A",
                            user_profile_image: "N/A",
                            message: `You were removed from the group '${req.body.group_name}' by Admin`,
                            date: new Date()
                        }
                    }
                }, { session }
            );
        } else if (addMembers) {
            const { group_id, newMembers, admin_name } = req.body;

            if (!newMembers) {
                return res.status(400).json({ failed: true, message: "Missing Field: newMembers" });
            }
            // Convert user_ids inside newMembers to ObjectId
            const updatedMembers = newMembers.map(m => ({
                user_id: new ObjectId(m.user_id),
                name: m.name,
                profile_image: m.profile_image
            }));

            result1 = await groupColl.updateOne(
                { _id: new ObjectId(group_id) },
                {
                    $push: {
                        group_members: {
                            $each: updatedMembers
                        }
                    }
                },
                { session }
            );

            if (result1.modifiedCount === 0) {
                await session.abortTransaction();
                await session.endSession();
                return res.status(400).json({ updated: false });
            }
            // Extract ObjectIds for updating user documents
            const memberIds = updatedMembers.map(f => f.user_id);

            result2 = await userColl.updateMany(
                { _id: { $in: memberIds } },
                {
                    $push: {
                        groups: {
                            group_id: new ObjectId(group_id),
                            isAdmin: false
                        }
                    }
                },
                { session }
            );

            if (result2.modifiedCount === 0) {
                await session.abortTransaction();
                await session.endSession();
                return res.status(400).json({ updated: false });
            }
            const result3 = await userColl.updateOne(
                { _id: { $in: memberIds } },
                {
                    $push:
                    {
                        notifications: {
                            notification_id: new ObjectId(),
                            type: "other",
                            status: "unread",
                            user_id: "N/A",
                            user_profile_image: "N/A",
                            message: `You were added to the group '${req.body.group_name}' by ${admin_name}`,
                            date: new Date()
                        }
                    }
                }, { session }
            );
        } else if (makeAdmin) {
            if (!req.body.member_id) {
                return res.status(400).json({ failed: true, message: "Missing Field: member_id" });
            }
            result1 = await groupColl.updateOne(
                { _id: new ObjectId(req.body.group_id) },
                {
                    $set: {
                        admin_id: new ObjectId(req.body.member_id)
                    }
                }, { session }
            );

            if (result1.modifiedCount == 0) {
                await session.abortTransaction();
                await session.endSession();
                return res.status(400).json({ updated: false });
            }
            result2 = await userColl.updateOne(
                { _id: new ObjectId(req.body.prevAdmin_id) },
                {
                    $set: {
                        "groups.$[groupId].isAdmin": false
                    }
                },
                {
                    arrayFilters: [{
                        "groupId.group_id": new ObjectId(req.body.group_id)
                    }],
                    session
                }
            );

            if (result2.modifiedCount == 0) {
                await session.abortTransaction();
                await session.endSession();
                return res.status(400).json({ updated: false });
            }

            const result3 = await userColl.updateOne(
                { _id: new ObjectId(req.body.member_id) },
                {
                    $set: {
                        "groups.$[groupId].isAdmin": true
                    }
                },
                {
                    arrayFilters: [{
                        "groupId.group_id": new ObjectId(req.body.group_id)
                    }],
                    session
                }
            );

            if (result3.modifiedCount == 0) {
                await session.abortTransaction();
                await session.endSession();
                return res.status(400).json({ updated: false });
            }

            const result4 = await userColl.updateOne(
                { _id: new ObjectId(req.body.member_id) },
                {
                    $push:
                    {
                        notifications: {
                            notification_id: new ObjectId(),
                            type: "other",
                            status: "unread",
                            user_id: "N/A",
                            user_profile_image: "N/A",
                            message: `Congratulation!, You are now an admin of the group '${req.body.group_name}' by ${req.body.admin_name}`,
                            date: new Date()
                        }
                    }
                }, { session }
            );
        }

        if (result1 && result2 && result1.modifiedCount > 0 && result2.modifiedCount > 0) {
            await session.commitTransaction();
            await session.endSession();
            return res.status(200).json({ updated: true });
        } else {
            return res.status(400).json({ updated: false });
        }
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        // console.log(error);
        res.status(500).json({ failed: true, message: error.message });
    }
};

const group_leave_patch = async (req, res) => {
    const session = client.startSession();
    try {
        const { group_id, member_id } = req.body;

        if (!group_id) {
            return res.status(400).json({ failed: true, message: "Missing Field: group_id" });
        }
        if (!member_id) {
            return res.status(400).json({ failed: true, message: "Missing Field: member_id" });
        }
        session.startTransaction();

        // find all money request that have sent by user and delete them before leaving group
        const result1 = await userColl.updateMany(
            {
                money_request: {
                    $elemMatch: {
                        moneyRequestor_id: new ObjectId(member_id),
                        group_id: new ObjectId(group_id)
                    }
                }
            },
            {
                $pull: {
                    money_request: {
                        moneyRequestor_id: new ObjectId(member_id),
                        group_id: new ObjectId(group_id)
                    }
                }
            }
        );
        // Remove member from group
        const result2 = await groupColl.updateOne(
            { _id: new ObjectId(group_id) },
            {
                $pull: {
                    group_members: {
                        user_id: new ObjectId(member_id)
                    }
                }
            }, { session }
        );

        const result3 = await userColl.updateOne(
            { _id: new ObjectId(member_id) },
            {
                $pull: {
                    groups: { group_id: new ObjectId(group_id) }
                }
            }, { session }
        )

        if (result1.modifiedCount > 0 && result2.modifiedCount > 0 && result3.modifiedCount > 0) {
            await session.commitTransaction();
            return res.status(200).json({ updated: true });
        } else {
            await session.abortTransaction();
            return res.status(400).json({ updated: false });
        }
    } catch (error) {
        await session.abortTransaction();
        // console.log(error);
        res.status(500).json({ failed: true, message: error.message });
    } finally {
        await session.endSession();
    }
}

const group_delete = async (req, res) => {
    const group_members = req.body.groupMembers;

    if (!group_members) {
        return res.status(400).json({ failed: true, message: "Missing field: Group members" });
    }
    if (!req.body.group_id) {
        return res.status(400).json({ failed: true, message: "Missing field: group_id" });
    }

    const session = client.startSession();
    session.startTransaction();

    try {
        let memberIdsArr = [];
        group_members.forEach((elm) => {
            memberIdsArr.push(new ObjectId(elm.user_id));
        });
        
        //Delete group 
        const result = await groupColl.deleteOne(
            { _id: new ObjectId(req.body.group_id) },
            { session }
        );

        if (!result.deletedCount) {
            await session.abortTransaction();
            await session.endSession();
            return res.status(400).json({ updated: false });
        }

        // Delete all expenses of group.
        const result1 = await groupExpColl.deleteOne(
            { group_id: new ObjectId(req.body.group_id) },
            { session }
        );
        if (!result1.deletedCount) {
            await session.abortTransaction();
            await session.endSession();
            return res.status(400).json({ updated: false });
        }

        // Remove group reference from users
        const result2 = await userColl.updateMany(
            { _id: { $in: memberIdsArr } },
            {
                $pull: {
                    groups: { group_id: new ObjectId(req.body.group_id) }
                }
            },
            { session }
        );
        if (result2.modifiedCount == 0) {
            await session.abortTransaction();
            await session.endSession();
            return res.status(400).json({ updated: false });
        }

        // ✅ 4. Remove money_request related to the group for all users
        const result3 = await userColl.updateMany(
            {
                money_request: {
                    $elemMatch: {
                        group_id: new ObjectId(req.body.group_id)
                    }
                }
            },
            {
                $pull: {
                    money_request: { group_id: new ObjectId(req.body.group_id) }
                }
            },
            { session }
        );
        
        if(result3.modifiedCount==0){
            await session.abortTransaction();
            await session.endSession();
            return res.status(400).json({ updated: false });
        }

        await session.commitTransaction();
        await session.endSession();
        res.status(200).json({ updated: true });
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        res.status(500).json({ failed: true, error: error.message });
    }
};

module.exports = { group_get, group_post, group_patch, group_delete, group_leave_patch };