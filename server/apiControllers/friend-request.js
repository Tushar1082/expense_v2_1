require('dotenv').config();

const {
    client,
    userColl
} = require('../database/mongodb_db.js');
const { ObjectId } = require('mongodb');

const friends_request_send_patch = async (req, res) => {
    const session = await client.startSession();
    session.startTransaction();
    try {
        //data of person who send friend request
        const data = {
            sender_id: new ObjectId(req.body.sender_id),
            sender_profile_image: req.body.sender_profile_image,
            sender_name: req.body.sender_name,
        };

        const result1 = await userColl.updateOne(
            { _id: new ObjectId(req.body.receiver_id) },
            {
                $push: { "friendRequest_come": data } //save friend request in receiver data
            },
            { session }
        );

        const result2 = await userColl.updateOne(
            { _id: new ObjectId(req.body.sender_id) },
            {
                $push: {
                    "friendRequest_send": { //save detail about friend request in sender data
                        receiver_id: new ObjectId(req.body.receiver_id),
                        receiver_profile_image: req.body.receiver_profile_img,
                        receiver_name: req.body.receiver_name,
                    }
                }
            },
            { session }
        );
        if (result1.modifiedCount > 0 && result2.modifiedCount > 0) {
            await session.commitTransaction();
            await session.endSession();
            return res.status(200).json({ updated: true });
        } else {
            await session.abortTransaction();
            await session.endSession();
            return res.status(400).json({ updated: false });
        }
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        res.status(500).json({ failed: true, error: error.message });
    }
};

const friends_request_cancel_patch = async (req, res) => {
    const session = await client.startSession();
    session.startTransaction();

    try {
        // check first, request is already accepted or not
        const result = await userColl.findOne({ _id: new ObjectId(req.body.receiver_id) }, { projection: { friendList: 1, _id: 0 } });

        if (!result) {
            return res.status(500).json({ failed: true, error: "receiver id is missing" });
        } else {
            const alreadyFriend = result.friendList.some(
                elm => elm.user_id.toString() === req.user.user_id
            );

            if (alreadyFriend) {
                return res.status(200).json({ expire: true, message: "Friend request is already accepted..." });
            }
        }
        const receiver_id = new ObjectId(req.body.receiver_id);
        const sender_id = new ObjectId(req.user.user_id);

        const result1 = await userColl.updateOne(
            { _id: sender_id },
            {
                $pull: {
                    friendRequest_send: { receiver_id: receiver_id }
                }
            },
            { session }
        );

        const result2 = await userColl.updateOne(
            { _id: receiver_id },
            {
                $pull: {
                    friendRequest_come: { sender_id: sender_id }
                }
            },
            { session }
        );

        if (result1.modifiedCount > 0 && result2.modifiedCount > 0) {
            await session.commitTransaction();
            return res.status(200).json({ updated: true });
        } else {
            await session.abortTransaction();
            return res.status(400).json({ updated: false });
        }
    } catch (error) {
        await session.abortTransaction();
        return res.status(500).json({ failed: true, error: error.message });
    } finally {
        await session.endSession();
    }
};

// function to remove friend from friend list
const friends_request_remove_patch = async (req, res) => {
    // check first, friend exist or not in my friendlist. Suppose i am going to remove a friend but he already removed me then 
    // i have to return msg, you already removed from friend list
    const result = await userColl.findOne({ _id: new ObjectId(req.user.user_id) }, { projection: { friendList: 1, _id: 0 } });

    if (!result) {
        return res.status(500).json({ failed: true, error: "user_id is missing" });
    } else {
        // checking another person is exist or not in my friendlist before removing
        const alreadyRemoved = result.friendList.some(
            elm => elm.user_id.toString() === req.body.friend_id
        );

        if (!alreadyRemoved) {
            return res.status(200).json({ expire: true, message: `You already removed from ${req.body.friend_name}'s friend list by ${req.body.friend_name}.` });
        }
    }
    const session = await client.startSession();
    session.startTransaction();
    try {
        const result1 = await userColl.updateOne(
            { _id: new ObjectId(req.user.user_id) },
            {
                $pull: {
                    "friendList": { user_id: new ObjectId(req.body.friend_id) }
                }
            },
            { session }
        );

        const result2 = await userColl.updateOne(
            { _id: new ObjectId(req.body.friend_id) },
            {
                $pull: {
                    "friendList": { user_id: new ObjectId(req.user.user_id) }
                }
            },
            { session }
        );
        if (result1.modifiedCount > 0 && result2.modifiedCount > 0) {
            await session.commitTransaction();
            await session.endSession();
            return res.status(200).json({ updated: true });
        } else {
            await session.abortTransaction();
            await session.endSession();
            return res.status(400).json({ updated: false });
        }
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        res.status(500).json({ failed: true, error: error.message });
    }
};

const friends_request_accept_patch = async (req, res) => {
    const session = await client.startSession();
    session.startTransaction();

    try {
        // check first, request till exists or not. If not then send msg--> Request no more
        const result = await userColl.findOne({ _id: new ObjectId(req.body.receiver_id) }, { projection: { friendRequest_come: 1, _id: 0 } });

        if (!result) {
            return res.status(500).json({ failed: true, message: "receiver id is missing" });
        } else {
            if (result?.friendRequest_come.length == 0) {
                return res.status(200).json({ expire: true, message: "Friend request is no more.." });
            }
            const requestExists = result.friendRequest_come.some(
                request => request.sender_id.toString() === req.body.sender_id
            );

            if (!requestExists) {
                return res.status(200).json({ expire: true, message: "Friend request is no more.." });
            }
        }
        const data = { // Data of person who get friend request 
            user_id: new ObjectId(req.body.receiver_id),
            name: req.body.receiver_name,
            profile_image: req.body.receiver_profile_image
        };

        const result1 = await userColl.updateOne(
            { _id: new ObjectId(req.body.sender_id) },
            {
                $push: { friendList: data },
                $pull: { friendRequest_send: { receiver_id: new ObjectId(req.body.receiver_id) } }
            },
            { session }
        );

        const result2 = await userColl.updateOne(
            { _id: new ObjectId(req.body.receiver_id) },
            {
                $push: {
                    friendList: {
                        user_id: new ObjectId(req.body.sender_id),
                        profile_image: req.body.sender_profile_image,
                        name: req.body.sender_name
                    }
                },
                $pull: { friendRequest_come: { sender_id: new ObjectId(req.body.sender_id) } }
            },
            { session }
        );
        const result3 = await userColl.updateOne(
            { _id: new ObjectId(req.body.sender_id) },
            {
                $push: {
                    notifications: {
                        notification_id: new ObjectId(),
                        type: "friend_Request",
                        status:"unread",
                        user_id: new ObjectId(req.body.receiver_id),
                        user_profile_image: req.body.receiver_profile_image,
                        message: `${req.body.receiver_name} is accepted your friend request`,
                        date: new Date()
                    }
                }
            },
            { session }
        );

        if (result1.modifiedCount > 0 && result2.modifiedCount > 0
            && result3.modifiedCount > 0
        ) {
            await session.commitTransaction();
            return res.status(200).json({ updated: true });
        } else {
            await session.abortTransaction();
            return res.status(400).json({ updated: false });
        }
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ failed: true, error: error.message });
    } finally {
        await session.endSession();
    }
}

const friends_request_reject_patch = async (req, res) => {
    const session = await client.startSession();
    session.startTransaction();

    try {
        // check first, request till exists or not. If not then send msg--> Request no more
        const result = await userColl.findOne({ _id: new ObjectId(req.body.receiver_id) }, { projection: { friendRequest_come: 1, _id: 0 } });

        if (!result) {
            return res.status(500).json({ failed: true, message: "receiver id is missing" });
        } else {
            if (result?.friendRequest_come.length == 0) {
                return res.status(200).json({ expire: true, message: "Friend request is no more.." });
            }
            const requestExists = result.friendRequest_come.some(
                request => request.sender_id.toString() === req.body.sender_id
            );

            if (!requestExists) {
                return res.status(200).json({ expire: true, message: "Friend request is no more.." });
            }
        }

        const result1 = await userColl.updateOne(
            { _id: new ObjectId(req.body.sender_id) },
            {
                $pull: { friendRequest_send: { receiver_id: new ObjectId(req.body.receiver_id) } }
            },
            { session }
        );

        const result2 = await userColl.updateOne(
            { _id: new ObjectId(req.body.receiver_id) },
            {
                $pull: { friendRequest_come: { sender_id: new ObjectId(req.body.sender_id) } }
            },
            { session }
        );
        const result3 = await userColl.updateOne(
            { _id: new ObjectId(req.body.sender_id) },
            {
                $push: {
                    notifications: {
                        notification_id: new ObjectId(),
                        type: "friend_Request",
                        status:"unread",
                        user_id: new ObjectId(req.body.receiver_id),
                        user_profile_image: req.body.receiver_profile_image,
                        message: `${req.body.receiver_name} is not accepted your friend request`,
                        date: new Date()
                    }
                }
            },
            { session }
        );

        if (result1.modifiedCount > 0 && result2.modifiedCount > 0
            && result3.modifiedCount > 0
        ) {
            await session.commitTransaction();
            return res.status(200).json({ updated: true });
        } else {
            await session.abortTransaction();
            return res.status(400).json({ updated: false });
        }
    } catch (error) {
        await session.abortTransaction();
        console.log(error);
        res.status(500).json({ failed: true, error: error.message });
    } finally {
        await session.endSession();
    }
}

module.exports = {
    friends_request_send_patch,
    friends_request_cancel_patch,
    friends_request_remove_patch,
    friends_request_accept_patch,
    friends_request_reject_patch
}