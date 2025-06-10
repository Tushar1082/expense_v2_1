const express = require('express');
const router = express.Router();
const { 
    user_profile_img_get, 
    user_profile_img_patch, 
    user_remove_friend, 
    send_money_request, 
    send_money_request_all,
    user_get, 
    user_post, 
    user_patch, 
    user_put, 
    user_update_profile_put, 
    user_change_password_put,
    decline_money_request
} = require('../apiControllers/user');

router.get('/', user_get);
router.post('/', user_post);
router.patch('/', user_patch);
router.put('/', user_put);

router.get('/profile-image', user_profile_img_get);
router.patch('/profile-image', user_profile_img_patch);

router.put('/update-profile', user_update_profile_put);

router.patch('/remove-friend', user_remove_friend);

router.post('/send-money-request', send_money_request);
router.post('/send-money-request/all', send_money_request_all);
router.delete('/decline-money-request', decline_money_request);

router.put('/change-password', user_change_password_put);

module.exports = router;