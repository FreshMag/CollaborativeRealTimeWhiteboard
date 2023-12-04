
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')

/**
 * A class encapsulating all functionalities regarding the authentication process. It MUST be instantiated only once.
 * @author Francesco Magnani <francesco.magnani14@studio.unibo.it>
 * @type {exports.Authenticator}
 */
exports.Authenticator = class Authenticator {
    /**
     * Default constructor for the class. It sets the keys used for the tokens and their expiration.
     * @param model {RealDb} - Model instance, handling interactions with external databases
     */
    constructor(model) {
        this.model = model;
        this.refreshTokenKey = process.env.REFRESH_TOKEN_KEY;
        this.accessTokenKey = process.env.ACCESS_TOKEN_KEY;
        this.accessTokenExpiration = "10m";
        this.refreshTokenExpiration = "7d";
    }

    /**
     * Method that registers the user into the system. It checks if another user with the same username exists. If so,
     * returns a non-empty <code>err</code>. Otherwise, it hashes the password and stores the new user in the model.
     * @author Francesco Magnani <francesco.magnani14@studio.unibo.it>
     * @param userData {{first_name: String, last_name: String, username: String, password: String}} - User data, all
     * information must be provided or the method will return an error
     * @returns {Promise<{err: string, user: Object}>} - The new user just created if the process was successful, an
     * error message otherwise
     */
    async register(userData) {
        // Our register logic starts here
        try {
            // Get user input
            const { first_name, last_name, username, password } = userData;
            // Validate user input
            if (!(username && password && first_name && last_name)) {
                return {user: "", err:"All input is required"};
            }

            // check if user already exist
            // Validate if user exist in our database
            const oldUser = await this.model.findOneUser(username.toLowerCase());

            if (oldUser) {
                return {user: "",err:"User Already Exist. Please Login"};
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
            return {user: user, err: ""}
        } catch (err) {
            return {user:"",err}
        }
    }

    /**
     * Method used to log in a user into the system.
     * @param userData {{username: string, password: string}} - User data, all
     * information must be provided or the method will return an error
     * @returns {Promise<{err: string, user: Object}>} - The user just logged in, containing the username and other JWT
     * data or an <code>err</code> if the login process was not successful
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
     * Method used to validate a refresh token and generate a new access token
     * @param token {string} - The refresh token to be validated
     * @returns {Promise<{err: string, user: undefined, token: undefined}|{err: undefined, user: Object, token: Object}>} -
     * The decoded user containing the username and the new generated access token, or an error if the process was not
     * successful
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
     * A utility method that first validates the refresh token and then returns a new access token.
     * @param token {String} - The refresh token
     * @returns {Promise<{err: string, token: undefined}|{err: undefined, token: (*)}>} - The newly generated access token
     * or an error if the process was not successful
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
     * Method used to validate an access token, mainly for authorization purposes.
     * @param token {String} - The access token to be validated
     * @returns {Promise<{err: string, user: undefined}|{err: undefined, user: (*)}>} - The decoded user containing the
     * username, or an <code>err</code> if the validation was not successful.
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