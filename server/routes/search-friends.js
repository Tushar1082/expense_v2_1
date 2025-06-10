const express = require('express');
const router = express.Router();
const { search_friends_get,
    //  search_friends_put, 
    //  search_friends_patch,
     } = require('../apiControllers/search-friends');

router.get('/',search_friends_get);
// router.put('/',search_friends_put);
// router.patch('/',search_friends_patch);
// router.patch('/remove-friend',search_friends_remove_delete);
module.exports = router;