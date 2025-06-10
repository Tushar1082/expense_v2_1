const express = require('express');
const {
    friends_request_send_patch,
    friends_request_cancel_patch,
    friends_request_remove_patch,
    friends_request_accept_patch,
    friends_request_reject_patch
} = require('../apiControllers/friend-request');
const router = express.Router();

router.patch('/send', friends_request_send_patch);
router.patch('/cancel', friends_request_cancel_patch);
router.patch('/accept', friends_request_accept_patch);
router.patch('/reject', friends_request_reject_patch);
router.patch('/remove', friends_request_remove_patch);

module.exports = router;