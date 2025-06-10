require('dotenv').config();

const { ObjectId } = require("mongodb");
const { userColl } = require("../database/mongodb_db");

const update_notification_status_patch = async (req, res) => {
    const { notifications } = req.body;
    const user_id = req.user.user_id;

    if (!notifications) {
        return res.status(400).json({ failed: true, error: "Missing Field: notifications" });
    }
    if (!user_id) {
        return res.status(400).json({ failed: true, error: "Missing Field: user_id" });
    }
    const noti_arr = notifications.map((elm) => new ObjectId(elm));

    try {
        const result = await userColl.updateOne(
            { _id: new ObjectId(user_id) },
            {
                $set: {
                    "notifications.$[noti].status": "read"
                }
            },
            {
                arrayFilters: [
                    { "noti.notification_id": { $in: noti_arr } }
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
};
module.exports = { update_notification_status_patch };