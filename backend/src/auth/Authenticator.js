
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')

/**
 * TODO
 * @type {exports.Authenticator}
 */
exports.Authenticator = class Authenticator {
    /**
     * TODO
     * @param model
     */
    constructor(model) {
        this.model = model;
        this.refreshTokenKey = process.env.REFRESH_TOKEN_KEY;
        this.accessTokenKey = process.env.ACCESS_TOKEN_KEY;
        this.accessTokenExpiration = "10m";
        this.refreshTokenExpiration = "7d";
    }

    /**
     * TODO
     * @param userData
     * @returns {Promise<{err: string, user: undefined}|{err: undefined, user: (*)}>}
     */
    async register(userData) {
        // Our register logic starts here
        try {
            // Get user input
            const { first_name, last_name, username, password } = userData;
            // Validate user input
            if (!(username && password && first_name && last_name)) {
                return {user: "",err:"All input is required"};
            }

            // check if user already exist
            // Validate if user exist in our database
            const oldUser = await this.model.findOneUser(username.toLowerCase());

            if (oldUser) {
                return{user: "",err:"User Already Exist. Please Login"};
            }

            //Encrypt user password
            const encryptedPassword = await bcrypt.hash(password, 10);

            // Create user in our database
            const user = await this.model.createUser({
                first_name,
                last_name,
                username: username.toLowerCase(), // sanitize: convert username to lowercase
                password: encryptedPassword,
            });

            // return new user
            return {user: user}
        } catch (err) {
            return {undefined,err}
        }
    }

    /**
     * TODO
     * @param userData
     * @returns {Promise<{err: string, user: undefined}|{err: undefined, user: (*)}>}
     */
    async login(userData) {

        if (!(userData.username && userData.password)) {
            return {user:"", err:"Please input username and password"};
        }
        const {username, password} = userData;
        // Validate if user exist in our database
        const user = await this.model.findOneUser(username);

        if (user && (await bcrypt.compare(password, user.password))) {
            // Create refresh token
            user.refreshToken = jwt.sign(
                {user_id: user._id, username},
                this.refreshTokenKey,
                {
                    expiresIn: this.refreshTokenExpiration,
                }
            );

            user.accessToken = jwt.sign(
                {user_id: user._id, username},
                this.accessTokenKey,
                {
                    expiresIn: this.accessTokenExpiration
                }
            )

            // user
            return {user:user, err:""}
        }
        return {user:"", err: "User not registered or wrong password"}
    }


    /**
     *
     * @param token
     * @returns {Promise<{err: string, user: undefined}|{err: undefined, user: (*)}>}
     */
    async validateRefreshToken(token) {
        if (!token) {
            return {user:undefined,err: "A token is required for authentication"};
        }
        try {
            const decoded = jwt.verify(token, this.refreshTokenKey);
            return {user:decoded, token: jwt.sign(
                {username:decoded.username, user_id: decoded._user_id},
                this.accessTokenKey,
                {
                    expiresIn: this.accessTokenExpiration
                }
            ), err: undefined}
        } catch (err) {
            return {user:undefined, err:"Invalid Token"};
        }
    }

    /**
     * TODO
     * @param token
     * @returns {Promise<{err: string, user: undefined}|{err: undefined, user: (*)}>}
     */
    async refreshToken(token) {
        return this.validateRefreshToken(token).then(result => {
            if (result.err) {
                return {token: undefined, err: "Unauthorized"}
            }
            return {
                token: jwt.sign(
                    {username:result.user.username, user_id: result.user._user_id},
                    this.accessTokenKey,
                    {
                        expiresIn: this.accessTokenExpiration
                    }
                )
            }
        })
    }

    /**
     * TODO
     * @param token
     * @returns {Promise<{err: string, user: undefined}|{err: undefined, user: (*)}>}
     */
    async validateAccessToken(token) {
        if (!token) {
            return {user:undefined,err: "A token is required for authorization"};
        }
        try {
            const decoded = jwt.verify(token, this.accessTokenKey);
            return {user:decoded, err: undefined}
        } catch (err) {
            return {user:undefined, err:"Invalid Token"};
        }
    }
}