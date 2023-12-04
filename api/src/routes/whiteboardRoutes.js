const express = require('express');
const whiteboardController = require('../controllers/whiteboardController');
const router = express.Router();

router.route("/invite")
    .put(whiteboardController.inviteToWhiteboard)

router.route("/:id")
    .get(whiteboardController.getWhiteboardData)

/**
 * Handles the routes of /invite and /:id
 * @type {Router}
 */
module.exports = router;