const express = require('express');
const { group_get, group_post, group_patch, group_delete, group_leave_patch } = require('../apiControllers/group');
const { group_expenses_get, group_expenses_post,
    group_expenses_put, 
    group_expenses_delete,
    group_expenses_isSettled_patch,
    //  group_expenses_patch, 
    //  group_expenses_profile_update_patch 
    } = require('../apiControllers/group-expenses');
const router = express.Router();

router.get('/', group_get);
router.post('/', group_post);
router.patch('/', group_patch);
router.patch('/leave', group_leave_patch);
router.delete('/', group_delete);

router.get('/group-expenses', group_expenses_get);
router.post('/group-expenses', group_expenses_post);
router.patch('/group-expenses/update-isSettled', group_expenses_isSettled_patch);
router.put('/group-expenses', group_expenses_put);
router.delete('/group-expenses', group_expenses_delete);
// router.put('/group-expenses', group_expenses_put);
// router.patch('/group-expenses', group_expenses_patch);

// router.patch('/profileUpdate', group_expenses_profile_update_patch);

module.exports = router;