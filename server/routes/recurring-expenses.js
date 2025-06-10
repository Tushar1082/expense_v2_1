const express = require('express');
const router = express.Router();
const { recurring_expenses_get, recurring_expenses_post, recurring_expenses_put, recurring_expenses_patch, recurring_expenses_delete, recurring_expenses_profile_update_patch } = require('../apiControllers/recurring-expenses');

router.get('/',recurring_expenses_get);
router.post('/', recurring_expenses_post);
router.put('/', recurring_expenses_put);
router.patch('/', recurring_expenses_patch);
router.delete('/', recurring_expenses_delete);

router.patch('/', recurring_expenses_profile_update_patch);

module.exports = router;