require('dotenv').config();
const {
    client,
    userColl,
    groupExpColl,
    groupTourColl,
} = require('../database/mongodb_db');
const { ObjectId } = require('mongodb');
const { send_mail_registration } = require('../apiControllers/email');

const bcrypt = require('bcryptjs');



const user_get = async (req, res) => {
    const userId = req.user.user_id;

    // Validate user_id
    if (!userId || userId.trim() === '' || userId.toLowerCase() === 'null' || userId.toLowerCase() === 'undefined') {
        return res.status(400).json({ notFound: true }); // 400 Bad Request
    }

    try {
        const value = new ObjectId(userId);
        const result = await userColl.findOne({ _id: value });

        if (result) {
            return res.status(200).json(result); // 200 OK
        } else {
            return res.status(404).json({ notFound: true }); // 404 Not Found
        }

    } catch (error) {
        return res.status(500).json({ failed: true }); // 500 Internal Server Error
    }
};

const user_post = async (req, res) => {
    try {
        // Function to hash the password securely
        const hashPassword = async (password) => {
            const saltRounds = 10; // Number of salt rounds
            return await bcrypt.hash(password, saltRounds);
        };

        // Validate required fields
        const { profileImg, name, dob, email, password, isGoogleSignUp
            // , gender 
        } = req.body;
        if (!name) {
            return res.status(400).json({ error: "Missing Field: name" });
        } else if (!email) {
            return res.status(400).json({ error: "Missing Field: email" });
        } else if (!password) {
            return res.status(400).json({ error: "Missing Field: password" });
        }
        // else if(!gender){
        //     return res.status(400).json({ error: "Missing Field: gender" });
        // }

        // Hash password securely
        const hashedPassword = await hashPassword(password);

        const data = {
            profile_image: profileImg,
            name: name,
            // gender:gender,
            dob: new Date(dob),
            email: email,
            password: hashedPassword,
            friendList: [],
            groups: [],
            tours: [],
            notifications: [],
            friendRequest_send: [],
            friendRequest_come: [],
            money_request: [],
            transactions: []
        };

        const result = await userColl.insertOne(data);

        if (result.insertedId) {
            if (isGoogleSignUp) {
                await send_mail_registration(name, email, password, true);
            } else
                await send_mail_registration(name, email, password, false);

            return res.status(201).json({ created: true }); // 201 Created
        } else {
            return res.status(500).json({ created: false, error: "User creation failed" }); // 500 Internal Server Error
        }
    } catch (error) {
        return res.status(500).json({ failed: true, error: error }); // 500 Internal Server Error
    }
}

const user_put = async (req, res) => {
    const leaveGroup = req.body.leaveGroup == true;

    if (leaveGroup) {
        try {
            const result = await userColl.updateOne(
                { _id: new ObjectId(req.body.user_id) },
                {
                    $pull: {
                        groups: {
                            group_id: new ObjectId(req.body.group_id)
                        }
                    }
                }
            )
            if (result && result.modifiedCount > 0) {
                return res.json({ updated: true });
            } else {
                return res.json({ updated: false });
            }
        } catch (error) {
            console.log(error);
            res.json({ failed: true });
        }
    } else {
        try {
            let arr = [];
            req.body.notifArr.forEach((elm) => {
                arr.push(new ObjectId(elm))
            });

            const result = await userColl.updateOne(
                { _id: new ObjectId(req.body.user_id) },
                {
                    $set: {
                        "notifications.$[element].status": "Read"
                    }
                },
                {
                    arrayFilters: [
                        { "element.notification_id": { $in: arr } }
                    ]
                }
            );

            if (result.modifiedCount > 0) {
                return res.json({ updated: true });
            } else {
                return res.json({ updated: false });
            }

        } catch (error) {
            console.log(error);
            res.json({ failed: true });
        }
    }
}

const user_patch = async (req, res) => {
    try {
        const result = await userColl.updateOne(
            { _id: new ObjectId(req.body.user_id) },
            {
                $set: {
                    name: req.body.name,
                    email: req.body.email,
                    age: parseInt(req.body.age),
                    password: req.body.password
                }
            }
        );
        if (result.modifiedCount > 0) {
            return res.json({ updated: true });
        } else {
            return res.json({ updated: false });
        }
    } catch (error) {
        console.log(error);
        return res.json({ failed: true });
    }
}

const user_profile_img_get = async (req, res) => {
    try {
        const result = await userColl.findOne(
            { _id: new ObjectId(req.user.user_id) },
            {
                projection: { profile_image: 1, email: 1, name: 1 }
            }
        );
        if (result._id) {
            return res.json(result);
        } else {
            return res.json({ notFound: false });
        }
    } catch (error) {
        console.log(error);
        return res.json({ failed: true });
    }
};

const user_profile_img_patch = async (req, res) => {
    try {
        const result = await userColl.updateOne(
            { _id: new ObjectId(req.body.user_id) },
            {
                $set: {
                    profile_image: req.body.profile_image
                }
            }
        );

        if (result.modifiedCount > 0) {
            return res.json({ updated: true });
        } else {
            return res.json({ updated: false });
        }
    } catch (error) {
        console.log(error);
        return res.json({ failed: true });
    }
};

const user_remove_friend = async (req, res) => {
    const session = client.startSession();
    session.startTransaction();

    try {
        const result1 = await userColl.updateOne(
            { _id: new ObjectId(req.body.user_id) },
            {
                $pull: {
                    friendList: {
                        user_id: new ObjectId(req.body.friend_id)
                    }
                }
            }, { session }
        );
        if (result1.modifiedCount == 0) {
            await session.abortTransaction();
            await session.endSession();
            return res.json({ updated: false });
        }
        const result2 = await userColl.updateOne(
            { _id: new ObjectId(req.body.friend_id) },
            {
                $pull: {
                    friendList: {
                        user_id: new ObjectId(req.body.user_id)
                    }
                }
            }, { session }
        );
        if (result2.modifiedCount == 0) {
            await session.abortTransaction();
            await session.endSession();
            return res.json({ updated: false });
        }

        await session.commitTransaction();
        await session.endSession();
        return res.json({ updated: true });
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        console.log(error);
        return res.json({ failed: true });
    }
}
const send_money_request = async (req, res) => {
    const requiredFields = [
        "group_id",
        "member",
        "user_profile_image",
        "expense_id",
        "expName",
        "date",
        "amount",
        "groupName"
    ];

    if (!req.user.user_id) {
        return res.status(400).json({ failed: true, message: "Missing field: user_id" });
    }

    const missingFields = requiredFields.filter(field => {
        return !req.body[field];
    });

    if (missingFields.length > 0) {
        return res.status(400).json({
            failed: true,
            message: "Missing required fields",
            missingFields
        });
    }

    const session = client.startSession(); // Start a MongoDB session

    try {
        session.startTransaction(); // Start a transaction

        const result1 = await userColl.updateOne(
            { _id: new ObjectId(req.body.member.user_id) },
            {
                $push: {
                    money_request: {
                        moneyRequest_id: new ObjectId(),
                        from: req.body.from,
                        moneyRequestor_id: new ObjectId(req.user.user_id),
                        moneyRequestor_profile_image: req.body.user_profile_image,
                        moneyRequestor_name: req.body.user_name,
                        expense_id: new ObjectId(req.body.expense_id),
                        expense_name: req.body.expName,
                        exp_date: new Date(req.body.date),
                        expense_amount: parseFloat(req.body.amount),
                        requested_amount: parseFloat(req.body.member.amount),
                        group_id: new ObjectId(req.body.group_id),
                        group_name: req.body.groupName,
                        created_at: new Date()
                    }
                }
            },
            { session } // Attach session
        );

        const result2 = await groupExpColl.updateOne(
            { group_id: new ObjectId(req.body.group_id) },
            {
                $set: {
                    "expenses.$[element].splitDetails.$[member].money_requested": true
                }
            },
            {
                arrayFilters: [
                    { "element.expense_id": new ObjectId(req.body.expense_id) },
                    { "member.user_id": new ObjectId(req.body.member.user_id) }
                ],
                session
            }
        );



        if (result1.modifiedCount === 0 || result2.modifiedCount === 0) {
            await session.abortTransaction();
            await session.endSession();
            return res.status(400).json({ created: false });
        }

        await session.commitTransaction(); // Commit transaction
        await session.endSession();
        return res.status(200).json({ created: true });

    } catch (error) {
        await session.abortTransaction(); // Rollback if an error occurs
        await session.endSession();
        console.error(error);
        return res.status(500).json({ failed: true, message: error.message });
    }
};

const send_money_request_all = async (req, res) => {
    const requiredFields = [
        "group_id",
        "splitDetails",
        "user_profile_image",
        "expense_id",
        "expName",
        "date",
        "amount",
        "groupName"
    ];

    const missingFields = requiredFields.filter(field => {
        if (field === "splitDetails") {
            return !req.body.splitDetails || req.body.splitDetails.length === 0;
        }
        return !req.body[field];
    });

    if (missingFields.length > 0) {
        return res.status(400).json({
            failed: true,
            message: "Missing required fields",
            missingFields
        });
    }

    const session = client.startSession(); // Start a MongoDB session

    try {
        session.startTransaction(); // Start a transaction

        for (const elm of req.body.splitDetails) { // Run sequentially
            await userColl.updateOne(
                { _id: new ObjectId(elm.user_id) },
                {
                    $push: {
                        money_request: {
                            moneyRequest_id: new ObjectId(),
                            from: req.body.from,
                            moneyRequestor_id: new ObjectId(req.user.user_id),
                            moneyRequestor_profile_image: req.body.user_profile_image,
                            moneyRequestor_name: req.body.user_name,
                            expense_id: new ObjectId(req.body.expense_id),
                            expense_name: req.body.expName,
                            exp_date: new Date(req.body.date),
                            expense_amount: parseFloat(req.body.amount),
                            requested_amount: parseFloat(elm.amount),
                            group_id: new ObjectId(req.body.group_id),
                            group_name: req.body.groupName,
                            created_at: new Date()
                        }
                    }
                },
                { session } // Attach session
            );
        }
        // const splitDetails_ids = req.body.splitDetails.filter((elm)=> elm.money_requested === false).map((elm) => elm.user_id);

        const promises = req.body.splitDetails.map((elm) => {
            return groupExpColl.updateOne(
                { group_id: new ObjectId(req.body.group_id) },
                {
                    $set: {
                        "expenses.$[element].splitDetails.$[member].money_requested": true
                    }
                },
                {
                    arrayFilters: [
                        { "element.expense_id": new ObjectId(req.body.expense_id) },
                        { "member.user_id": new ObjectId(elm.user_id) }
                    ],
                    session
                }
            );

        });
        
        const result = await Promise.all(promises);
        if (!result.every(r => r.modifiedCount > 0)) {
            await session.abortTransaction();
            return res.status(400).json({
                created: false,
                message: "Some money_requested fields were not updated."
            });
        }


        await session.commitTransaction(); // Commit transaction
        await session.endSession();
        return res.status(200).json({ created: true });

    } catch (error) {
        await session.abortTransaction(); // Rollback if an error occurs
        await session.endSession();
        console.error(error);
        return res.status(500).json({ failed: true, message: error.message });
    }
};

const decline_money_request = async (req, res) => {
    const session = await client.startSession();
    
    try {
        const { money_req_id, payer_id, user_name, requested_amount, expense_id, expense_name, from, group_id, group_name } = req.body;
        const user_id = req.user.user_id;

        if (!user_id) {
            return res.status(400).json({ failed: true, message: "Missing Field: user_id" });
        } if (!money_req_id) {
            return res.status(400).json({ failed: true, message: "Missing Field: money_req_id" });
        } else if (!payer_id) {
            return res.status(400).json({ failed: true, message: "Missing Field: payer_id" });
        } else if (!user_name) {
            return res.status(400).json({ failed: true, message: "Missing Field: user_name" });
        } else if (!requested_amount) {
            return res.status(400).json({ failed: true, message: "Missing Field: requested_amount" });
        }else if(!expense_id){
            return res.status(400).json({ failed: true, message: "Missing Field: expense_id" });
        } else if (!expense_name) {
            return res.status(400).json({ failed: true, message: "Missing Field: expense_name" });
        } else if (!from) {
            return res.status(400).json({ failed: true, message: "Missing Field: from" });
        }else if(!group_id){
            return res.status(400).json({ failed: true, message: "Missing Field: group_id" });
        } else if (!group_name) {
            return res.status(400).json({ failed: true, message: "Missing Field: group_name" });
        }

        await session.startTransaction();

        const noti = {
            notification_id: new ObjectId(),
            type: "other",
            status: "unread",
            user_id: "N/A",
            user_profile_image: "N/A",
            message: `${user_name} declined your money request for ₹${parseFloat(requested_amount).toFixed(2)} in '${expense_name}' expense under ${from} '${group_name}'.`,
            "date": new Date()
        }

        const result1 = await userColl.updateOne(
            { _id: new ObjectId(user_id) },
            {
                $pull: { money_request: { moneyRequest_id: new ObjectId(money_req_id) } }
            },
            {session}
        );
        const result2 = await groupExpColl.updateOne(
            { group_id: new ObjectId(req.body.group_id) },
            {
                $set: {
                    "expenses.$[element].splitDetails.$[member].money_requested": false
                }
            },
            {
                arrayFilters: [
                    { "element.expense_id": new ObjectId(req.body.expense_id) },
                    { "member.user_id": new ObjectId(user_id) }
                ],
                session
            }
        );
        const result3 = await userColl.updateOne(
            { _id: new ObjectId(payer_id) },
            {
                $push: { "notifications": noti }
            }
        );

        if (result1.modifiedCount > 0 && result2.modifiedCount>0) {
            await session.commitTransaction();
            return res.status(200).json({ updated: true });
        } else {
            await session.abortTransaction();
            return res.status(400).json({ updated: false });
        }
    } catch (error) {
        await session.abortTransaction();
        return res.status(500).json({ failed: true, message: error.message });
    }finally{
        await session.endSession();
    }
}

const user_update_profile_put = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const { name, date_of_birth, profile_image
            // , gender 
        } = req.body;

        if (!user_id)
            return res.status(500).json({ failed: true, message: "Missing Field: user_id" });
        else if (!name)
            return res.status(500).json({ failed: true, message: "Missing Field: name" });
        else if (!date_of_birth) {
            return res.status(500).json({ failed: true, message: "Missing Field: dob" });
        } else if (!profile_image) {
            return res.status(500).json({ failed: true, message: "Missing Field: profile_image" });
        }
        // else if (!gender) {
        //     return res.status(500).json({ failed: true, message: "Missing Field: gender" });
        // }

        const result = await userColl.updateOne(
            { _id: new ObjectId(user_id) },
            {
                $set: {
                    profile_image: profile_image,
                    name: name,
                    dob: new Date(date_of_birth)
                    // ,
                    // gender: req.body.gender
                }
            }
        );

        if (result.modifiedCount > 0) {
            return res.status(200).json({ updated: true });
        } else {
            return res.status(400).json({ updated: false });
        }
    } catch (error) {
        return res.status(500).json({ faield: true, message: error.message });
    }
}

const user_change_password_put = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const { new_password, old_password } = req.body;
        //Note: Here old passowrd is user previous password. This is given by user from front end.

        if (!user_id)
            return res.status(400).json({ failed: true, message: "Missing Field: user_id" });
        else if (!new_password) {
            return res.status(400).json({ failed: true, message: "Missing Field: new_password" });
        } else if (!old_password) {
            return res.status(400).json({ failed: true, message: "Missing Field: old_password" });
        }
        const user = await userColl.findOne({ _id: new ObjectId(user_id) }, { projection: { _id: 0, password: 1 } });
        if (!user) {
            return res.status(404).json({ failed: true, message: "User not found" });
        }

        const isOldCorrect = await bcrypt.compare(old_password, user.password);
        if (!isOldCorrect) return res.status(400).json({ isOldCorrect: false, message: "Your given current password is wrong." });

        const newPass = await bcrypt.hash(new_password, 10);

        const result = await userColl.updateOne(
            { _id: new ObjectId(user_id) },
            {
                $set: { password: newPass }
            }
        );

        if (result.modifiedCount > 0) {
            return res.status(200).json({ updated: true, isOldCorrect: true });
        } else {
            return res.status(400).json({ updated: false });
        }
    } catch (error) {
        return res.status(500).json({ failed: true, message: error.message });
    }
}
module.exports = { decline_money_request, user_get, user_post, user_put, user_patch, user_update_profile_put, user_profile_img_get, user_change_password_put, user_profile_img_patch, user_remove_friend, send_money_request, send_money_request_all };