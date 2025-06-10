const express = require('express');
const { 
    expense_profile_get,
    expense_profile_post,
    expense_profile_delete,
    track_my_expenses_profile_update_patch,
    
    expense_get,
    expense_post,
    expense_put,
    expense_delete
 } = require('../apiControllers/track-my-expenses');
const router = express.Router();

// Expense Profile REST Methods
router.get('/expense-profile',expense_profile_get);
router.post('/expense-profile',expense_profile_post);
router.delete('/expense-profile',expense_profile_delete);


// Expense REST Methods
router.get('/expense', expense_get);
router.post('/expense', expense_post);
router.put('/expense', expense_put);
router.delete('/expense', expense_delete);

router.patch('/profileUpdate', track_my_expenses_profile_update_patch);
module.exports = router;