/* ===================
   Import Node Modules
=================== */
var mongoose = require('mongoose'); // Node Tool for MongoDB
mongoose.Promise = global.Promise; // Configure Mongoose Promises
var Schema = mongoose.Schema; // Import Schema from Mongoose
var bcrypt = require('bcrypt-nodejs'); // A native JS bcrypt library for NodeJS

// Validate Function to check e-mail length
var emailLengthChecker = function(email) {
    // Check if e-mail exists
    if (!email) {
        return false; // Return error
    } else {
        // Check the length of e-mail string
        return !(email.length < 5 || email.length > 30);
    }
};

// Validate Function to check if valid e-mail format
var validEmailChecker = function(email) {
    // Check if e-mail exists
    if (!email) {
        return false; // Return error
    } else {
        // Regular expression to test for a valid e-mail
        var regExp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
        return regExp.test(email); // Return regular expression test results (true or false)
    }
};

// Array of Email Validators
var emailValidators = [
    // First Email Validator
    {
        validator: emailLengthChecker,
        message: 'E-mail must be at least 5 characters but no more than 30'
    },
    // Second Email Validator
    {
        validator: validEmailChecker,
        message: 'Must be a valid e-mail'
    }
];

// Validate Function to check username length
var usernameLengthChecker = function(username) {
    // Check if username exists
    if (!username) {
        return false; // Return error
    } else {
        // Check length of username string
        return !(username.length < 3 || username.length > 15);
    }
};

// Validate Function to check if valid username format
var validUsername = function(username) {
    // Check if username exists
    if (!username) {
        return false; // Return error
    } else {
        // Regular expression to test if username format is valid
        var regExp = new RegExp(/^[a-zA-Z0-9]+$/);
        return regExp.test(username); // Return regular expression test result (true or false)
    }
};

// Array of Username validators
var usernameValidators = [
    // First Username validator
    {
        validator: usernameLengthChecker,
        message: 'Username must be at least 3 characters but no more than 15'
    },
    // Second username validator
    {
        validator: validUsername,
        message: 'Username must not have any special characters'
    }
];

// Validate Function to check password length
var passwordLengthChecker = function(password) {
    // Check if password exists
    if (!password) {
        return false; // Return error
    } else {
        // Check password length
        return !(password.length < 8 || password.length > 35);
    }
};

// Validate Function to check if valid password format
var validPassword = function(password) {
    // Check if password exists
    if (!password) {
        return false; // Return error
    } else {
        // Regular Expression to test if password is valid format
        var regExp = new RegExp(/^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[\d])(?=.*?[\W]).{8,35}$/);
        return regExp.test(password); // Return regular expression test result (true or false)
    }
};

// Array of Password validators
var passwordValidators = [
    // First password validator
    {
        validator: passwordLengthChecker,
        message: 'Password must be at least 8 characters but no more than 35'
    },
    // Second password validator
    {
        validator: validPassword,
        message: 'Must have at least one uppercase, lowercase, special character, and number'
    }
];

// User Model Definition
var userSchema = new Schema({
    email: { type: String, required: true, unique: true, lowercase: true, validate: emailValidators },
    username: { type: String, required: true, unique: true, lowercase: true, validate: usernameValidators },
    password: { type: String, required: true, validate: passwordValidators }
});

// Schema Middleware to Encrypt Password
userSchema.pre('save', function(next) {
    // Ensure password is new or modified before applying encryption
    if (!this.isModified('password'))
        return next();

    // Apply encryption
    bcrypt.hash(this.password, null, null, function(err, hash) {
        if (err) return next(err); // Ensure no errors
        this.password = hash; // Apply encryption to password
        next(); // Exit middleware
    });
});

// Methods to compare password to encrypted password upon login
userSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.password); // Return comparison of login password to password in database (true or false)
};

// Export Module/Schema
module.exports = mongoose.model('User', userSchema);