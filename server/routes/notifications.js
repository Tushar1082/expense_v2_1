const express = require('express');
const router = express.Router();
const {update_notification_status_patch} = require('../apiControllers/notifications.js');

router.patch('/update/status',update_notification_status_patch);
module.exports = router;