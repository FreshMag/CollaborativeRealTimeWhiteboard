const express = require('express');
const userSettingController = require('../controllers/userSettingsController');
const router = express.Router();

router.route('/')
    .get(userSettingController.getUserData);
router.route('/updateInfo')
    .put(userSettingController.updateInfo);
router.route('/updatePassword')
    .put(userSettingController.updatePassword);


/**
 * Handles the routes of /, /updateInfo and /updatePassword
 * @type {Router}
 */
module.exports = router;
