const jwt = require("jsonwebtoken");
const {Model} = require("../models/model");

const OWNER = 0;
const NORMAL = 1;
/**
 * A class that encapsulates all the functionalities related to granting authorization.
 * @author Francesco Magnani <francesco.magnani14@studio.unibo.it>
 * @type {Authorizer} - Authorizer
 */
module.exports = class Authorizer {
    /**
     * Default constructor for this class. It sets internal keys to work with tokens.
     * @param model - Object representing the model
     */
    constructor(model) {
        this.model = model;
        this.accessKey = process.env.ACCESS_TOKEN_KEY;
    }

    /**
     * Main method of the class. Given a level of desired authorization, it checks if a provided access token possesses
     * the minimum requirements to be authorized to a certain resource (in this case, a whiteboard) using that level
     * of access.
     * @param level - The level of access the user wants to be authorized to
     * @param accessToken - The token provided to gain access
     * @param whiteboardId - The ID representing the whiteboard
     * @returns {Promise<{err: string}|{username}>} - Returns an object containing the user's username inside <code>username</code>,
     * or containing <code>err</code> if there was an error or the user was not authorized
     */
     async userToWhiteboard(level, accessToken, whiteboardId) {
        if (!accessToken || !(whiteboardId !== undefined)) {
            return {err: "Please input accessToken and whiteboardId"};
        }
        try {
            const decoded = await jwt.verify(accessToken, this.accessKey);
            let authorized;
            if (level === OWNER) {
                authorized = await Model.validateOwnerToWhiteboard(decoded.username, whiteboardId);
            } else {
                authorized = await Model.validateUserToWhiteboard(decoded.username, whiteboardId);
            }
            if (!authorized) {
                return {err: "Unauthorized to this whiteboard"};
            } else {
                return {username: decoded.username };
            }
        } catch (e) {
            console.log(e)
            return {err: "Invalid token or illegal input values"};
        }
    }

    /**
     * Utility method. Uses {@link userToWhiteboard} internally.
     * @param accessToken - The token provided to gain access
     * @param whiteboardId - The ID representing the whiteboard
     * @returns {Promise<{err: string}|{username}>} - Returns an object containing the user's username inside <code>username</code>,
     * or containing <code>err</code> if there was an error or the user was not authorized
     */
    async normalUserToWhiteboard(accessToken, whiteboardId) {
        return this.userToWhiteboard(NORMAL, accessToken, whiteboardId)
    }
    /**
     * Utility method. Uses {@link userToWhiteboard} internally.
     * @param accessToken - The token provided to gain access
     * @param whiteboardId - The ID representing the whiteboard
     * @returns {Promise<{err: string}|{username}>} - Returns an object containing the user's username inside <code>username</code>,
     * or containing <code>err</code> if there was an error or the user was not authorized
     */
    async ownerToWhiteboard(accessToken, whiteboardId) {
        return this.userToWhiteboard(OWNER, accessToken, whiteboardId);
    }
    /**
     * Utility method. Uses {@link normalUserToWhiteboard} internally. To draw a line you must be a simple user that
     * joined the whiteboard.
     * @param accessToken - The token provided to gain access
     * @param whiteboardId - The ID representing the whiteboard
     * @returns {Promise<{err: string}|{username}>} - Returns an object containing the user's username inside <code>username</code>,
     * or containing <code>err</code> if there was an error or the user was not authorized
     */
    async authorizeNewLine(accessToken, whiteboardId) {
        return this.normalUserToWhiteboard(accessToken, whiteboardId);
    }
    /**
     * Uses {@link normalUserToWhiteboard} internally. To end a line you must be a simple user that
     * joined the whiteboard.
     * @param accessToken - The token provided to gain access
     * @param lineId - The ID representing the line to end
     * @param whiteboardId - The ID representing the whiteboard
     * @returns {Promise<{err: string}|{username}>} - Returns an object containing the user's username inside <code>username</code>,
     * or containing <code>err</code> if there was an error or the user was not authorized
     */
    async authorizeLineEnd(accessToken, lineId, whiteboardId) {
        return this.normalUserToWhiteboard(accessToken, whiteboardId);
    }
    /**
     * Uses {@link normalUserToWhiteboard} internally. To delete a line you must be a simple user that
     * joined the whiteboard.
     * @param accessToken - The token provided to gain access
     * @param lineId - The ID representing the line to delete
     * @param whiteboardId - The ID representing the whiteboard
     * @returns {Promise<{err: string}|{username}>} - Returns an object containing the user's username inside <code>username</code>,
     * or containing <code>err</code> if there was an error or the user was not authorized
     */
    async authorizeLineDelete(accessToken, lineId, whiteboardId) {
        return this.normalUserToWhiteboard(accessToken, whiteboardId);
    }
}