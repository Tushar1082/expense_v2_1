const express = require('express');
const { travel_expenses_get, travel_expenses_post, travel_expenses_patch, travel_expenses_delete, travel_expenses_remove_member_patch, travel_expenses_add_member_patch, travel_expenses_make_admin_patch, travel_expenses_profile_update_patch } = require('../apiControllers/travel-expenses');
const router = express.Router();

router.get('/',travel_expenses_get);
router.post('/',travel_expenses_post);
router.patch('/',travel_expenses_patch);
router.delete('/',travel_expenses_delete);

router.patch('/remove-member',travel_expenses_remove_member_patch);
router.patch('/add-member',travel_expenses_add_member_patch);
router.patch('/make-admin',travel_expenses_make_admin_patch);
router.patch('/profile-update',travel_expenses_profile_update_patch);


module.exports = router;