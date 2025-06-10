const express = require('express');
const router = express.Router();
const { send_mail_change_email_otp } = require('../apiControllers/email');
const { userColl } = require('../database/mongodb_db');
const { ObjectId } = require('mongodb');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

router.get('/change-email/otp', async (req, res) => {
  const { name, email } = req.query;

  if (!email) {
    return res.status(400).json({ failed: true, message: "Missing field: email" });
  } else if (!name) {
    return res.status(400).json({ failed: true, message: "Missing field: name" });
  }

  try {

    const existingUser = await userColl.findOne({ email: email.toLowerCase() }, {projection:{_id:1}});

    if (existingUser) {
      return res.status(409).json({ isEmailExits:true,  message: "Email already exists..." });
    }

    const otp = generateOTP();
    const result = await send_mail_change_email_otp(name, email, otp);

    if (result)
      return res.status(200).json({ send: true, otp: otp, message: "Successfully send email to user for otp!" });
    else
      return res.status(400).json({ send: false, message: "failed to send email to user for otp!" });
  } catch (error) {
    return res.status(500).json({ failed: true, message: error.message });
  }
});
router.post('/change-email', async (req, res) => {
  const { new_email } = req.body;
  const user_id = req.user.user_id;

  if (!new_email) {
    return res.status(400).json({ failed: true, message: 'Missing Field: new_email' });
  } else if (!user_id) {
    return res.status(400).json({ failed: true, message: 'Missing Field: user_id' });
  }

  try {
    const result = await userColl.updateOne({ _id: new ObjectId(user_id) }, { $set: { email: new_email } });

    if (result.modifiedCount > 0) {
      return res.status(200).json({ updated: true });
    } else {
      return res.status(400).json({ updated: false });
    }
  } catch (error) {
    return res.status(500).json({ failed: true, message: error.message });
  }
});

module.exports = router;