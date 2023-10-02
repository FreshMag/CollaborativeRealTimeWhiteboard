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
 * TODO
 * @type {Router}
 */
module.exports = router;
