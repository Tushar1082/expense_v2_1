require('dotenv').config();

const {
    client,
    userColl
} = require('../database/mongodb_db.js');
const { ObjectId } = require('mongodb');

const search_friends_get = async (req, res) => {
    try {
        const result = await userColl.find(
            {
                name: { $regex: req.query.name, $options: "i" }  // 'i' for case-insensitive
            },
            {
                projection: { name: 1, profile_image: 1, friendRequest_come:1  }
            }
        ).toArray();
        if (result && result.length > 0) {
            res.json(result);
        } else
            res.json({ notFound: true });

    } catch (error) {
        res.send({ failed: true });
        console.log(error);
    }
};

//Function to accept or reject user friend request
// const search_friends_put = async (req, res) => {
//     const session = await client.startSession();
//     session.startTransaction();

//     try {
//         const data = { // Data of person who get friend request 
//             user_id: new ObjectId(req.body.reqGetterId),
//             name: req.body.reqGetterName,
//             profile_image: req.body.reqGetterProfileImg,
//             // amount_to_take: new Decimal128('0'),
//             // amount_to_pay: new Decimal128('0')
//         };
//         let result1, result2, result3;

//         if (req.body.work === "accept") {
//             result1 = await userColl.updateOne(
//                 { _id: new ObjectId(req.body.requester_id) },
//                 {
//                     $push: { friendList: data },
//                     $pull: { friendRequest_send: { user_id: new ObjectId(req.body.reqGetterId) } }
//                 },
//                 { session }
//             );

//             result2 = await userColl.updateOne(
//                 { _id: new ObjectId(req.body.reqGetterId) },
//                 {
//                     $push: {
//                         friendList: {
//                             user_id: new ObjectId(req.body.requester_id),
//                             profile_image: req.body.requesterProfileImg,
//                             name: req.body.requesterName,
//                             // amount_to_take: new Decimal128('0'),
//                             // amount_to_pay: new Decimal128('0')
//                         }
//                     },
//                     $pull: { friendRequest_come: { user_id: new ObjectId(req.body.requester_id) } }
//                 },
//                 { session }
//             );
//             result3 = await userColl.updateOne(
//                 { _id: new ObjectId(req.body.requester_id) },
//                 {
//                     $push: {
//                         notifications: {
//                             notification_id: new ObjectId(),
//                             type: "Friend_Request",
//                             sender_id: new ObjectId(req.body.reqGetterId),
//                             sender_profile_image: req.body.reqGetterProfileImg,
//                             message: `${req.body.reqGetterName} is accepted your friend request`,
//                             status: 'Unread',
//                             date: new Date()
//                         }
//                     }
//                 },
//                 { session }
//             );
//         } else {
//             result1 = await userColl.updateOne(
//                 { _id: new ObjectId(req.body.reqGetterId) }, // a person who get friend request
//                 {
//                     $pull: {
//                         friendRequest_come: { user_id: new ObjectId(req.body.requester_id) }
//                     }
//                 },
//                 { session }
//             );
//             result2 = await userColl.updateOne(
//                 { _id: new ObjectId(req.body.requester_id) }, // a person who sent friend request
//                 {
//                     $pull: {
//                         friendRequest_send: { user_id: new ObjectId(req.body.reqGetterId) }
//                     }
//                 },
//                 {
//                     session
//                 }
//             );
//             result3 = await userColl.updateOne(
//                 { _id: new ObjectId(req.body.requester_id) },
//                 {
//                     $push: {
//                         notifications: {
//                             notification_id: new ObjectId(),
//                             type: "Friend_Request",
//                             sender_id: new ObjectId(req.body.reqGetterId),
//                             sender_profile_image: req.body.reqGetterProfileImg,
//                             message: `${req.body.reqGetterName} is not accepted your friend request`,
//                             status: 'Unread',
//                             date: new Date()
//                         }
//                     }
//                 },
//                 { session }
//             );
//         }

//         if (result1.modifiedCount > 0 && result2.modifiedCount > 0
//             && result3.modifiedCount > 0
//         ) {
//             await session.commitTransaction();
//             await session.endSession();
//             return res.json({ updated: true });
//         } else {
//             await session.abortTransaction();
//             await session.endSession();
//             return res.json({ updated: false });
//         }
//     } catch (error) {
//         await session.abortTransaction();
//         await session.endSession();
//         res.json({ failed: true });
//     }
// };

//Function to send or remove friend request
// const search_friends_patch = async (req, res) => {
//     const session = await client.startSession();
//     session.startTransaction();
//     try {
//         const data = {
//             user_id: new ObjectId(req.body.user_id),
//             profile_image: req.body.userProfImg, //image of person who send friend request
//             name: req.body.name,
//         };
//         let result1, result2;

//         if (req.body.work === "send") {
//             result1 = await userColl.updateOne(
//                 { _id: new ObjectId(req.body.sender_id) },
//                 {
//                     $push: { "friendRequest_come": data }
//                 },
//                 { session }
//             );

//             result2 = await userColl.updateOne(
//                 { _id: new ObjectId(req.body.user_id) },
//                 {
//                     $push: {
//                         "friendRequest_send": {
//                             user_id: new ObjectId(req.body.sender_id),
//                             profile_image: req.body.userProfImg,
//                             name: req.body.sender_name,
//                         }
//                     }
//                 },
//                 { session }
//             );
//         } else {
//             result1 = await userColl.updateOne(
//                 { _id: new ObjectId(req.body.sender_id) },
//                 {
//                     $pull: {
//                         "friendRequest_come": { user_id: new ObjectId(req.body.user_id) }
//                     }
//                 },
//                 { session }
//             );

//             result2 = await userColl.updateOne(
//                 { _id: new ObjectId(req.body.user_id) },
//                 {
//                     $pull: {
//                         "friendRequest_send": { user_id: new ObjectId(req.body.sender_id) }
//                     }
//                 },
//                 { session }
//             );
//         }

//         if (result1.modifiedCount > 0 && result2.modifiedCount > 0) {
//             await session.commitTransaction();
//             await session.endSession();
//             return res.json({ updated: true });
//         } else {
//             await session.abortTransaction();
//             await session.endSession();
//             return res.json({ updated: false });
//         }
//     } catch (error) {
//         await session.abortTransaction();
//         await session.endSession();
//         console.log(error);
//         res.json({ failed: true });
//     }
// };

module.exports = { 
    search_friends_get, 
    // search_friends_put, 
    // search_friends_patch
};