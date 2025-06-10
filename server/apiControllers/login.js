require('dotenv').config();
const {
    userColl,
} = require('../database/mongodb_db');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

async function login_get(req, res) {
    try {
        const { email, password } = req.query;

        // Check for invalid email
        if (!email || email === 'null' || email === 'undefined') {
            return res.status(400).json({ notFound: true }); // 400 Bad Request
        }

        const result = await userColl.findOne(
            { email: email },
            { projection: { profile_image: 1, password: 1 } }
        );

        if (result) {
            const isSame = await bcrypt.compare(password, result.password);
            let token = null;

            if(isSame){
                token = jwt.sign(
                    { user_id: result._id },        // <- Payload (this is secure)
                    process.env.JWT_SECRET       // <- Secret key to sign
                );
            }

            return res.status(200).json({
                profile_image: result.profile_image,
                isMatch: isSame,
                token: token
            });

        } else {
            return res.status(404).json({ notFound: true }); // 404 Not Found
        }

    } catch (error) {
        return res.status(500).json({ failed: true, error: error.message }); // 500 Internal Server Error
    }
}

module.exports = { login_get };