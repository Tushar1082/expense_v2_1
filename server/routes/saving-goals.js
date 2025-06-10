const express = require('express');
const { saving_goals_get,
     saving_goals_post, 
     saving_goals_put, 
     saving_goals_patch, 
     saving_goals_delete, 
     saving_goals_profile_update_patch,
     saving_goals_add_money_post
     } = require('../apiControllers/saving-goals');
const router = express.Router();

router.get('/', saving_goals_get);
router.post('/', saving_goals_post);
router.put('/', saving_goals_put);
router.patch('/', saving_goals_patch);
router.delete('/', saving_goals_delete);

router.patch('/profile-update', saving_goals_profile_update_patch);

router.post('/add-money',saving_goals_add_money_post);
module.exports = router;