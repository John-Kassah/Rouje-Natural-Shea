import mongoose from "mongoose";
import { userModel } from "../models/user.model.js";
import { userLoginValidator, userRegistrationValidator } from "../validators/user_validator.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendVerificationMail } from "../utils/mailSender.js";



const generateauthToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET_KEY, { expiresIn: '40m' });
  };

export const getAllUsers = async (req, res) => {
    try {
        const allUsers = await userModel.find({});
        res.status(200).json({ message: "All users were retrieved successfully", data: allUsers});
    } catch (error) {
        console.log(`This error was thrown in an attempt to retrieve all users: ${error.message}`);
        res.status(500).json({ message: `This error was thrown in an attempt to retrieve all users: ${error.message}` });
    }
};

export const loginUser = async (req, res) => {

    // const { id } = req.params; is no longer needed... can be deleted for this project
    try {
        // Validate the request body using the userLoginValidator
        const {error, value} = userLoginValidator.validate(req.body)
        if (error) {
            return res.status(400).json(`Kindly check the request body for the following errors: ${error.details.map(err => err.message).join(', ')}`);
        }

        // Check if the id is not a valid mongoose id that fits a valid ObjectId
        // Do this before querying the database to save on resources and avoid an error called "CastError" which means that the id is not a valid ObjectId or is not in the correct format ot type
        /*if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).send(`This is not a valid user ID: ${id}`);
        }*/
        // Now this will not throw a CastError because the id is a valid ObjectId
        
        // Check if a user with the specified id does not exist
        const user = await userModel.findOne({
            $or: [
                { fullName: value.fullName },
                { email: value.email }
            ]
    });

        if (!user) {
            return res.status(404).send(`There is no user with the info: ${value.fullName || value.email}`);
        }

        // Check if the password is correct using the instance method *comparePassword* that we created in the user.model.js file to compare the password entered by the user with the hashed password in the database
        const isPasswordValid = await user.comparePassword(value.password);
        if (!isPasswordValid) {
            return res.status(401).send(`The password you entered is incorrect`);
        }

         // Remove the password and vertion field from the user object before sending the response
         const userWithoutPassword = user._doc; 
         delete userWithoutPassword.password; // Remove the password field
         delete userWithoutPassword.__v; // Remove the __v field
  
        //  Generate a JWT token for the user
        //  The token will be used to authenticate the user in subsequent requests becaused it will be sent to the client and saved in the local storage of the browser or in the cookies of the browser
        const token = generateauthToken(user.id);
        res.status(200).json({ message: "The user was retrieved successfully", data: userWithoutPassword, token: token });
    } catch (error) {   
        console.log(`This error was thrown in an attempt to retrieve a user with the specified id: ${error.message}`);
        res.status(500).json({ message: `This error was thrown in an attempt to retrieve a user with the specified id: ${error.message}` });
    }
}

export const registerUser = async (req, res) => {

    try {
        // Validate the request body using the userRegistrationValidator
        const {error, value} = userRegistrationValidator.validate(req.body);
        if (error) {
            return res.status(400).json(`Kindly check the request body for the following errors: ${error.details.map(err => err.message).join(', ')}`);
        } 
        // If the validation passes, proceed to extract the user info from the request body

        // Extract the user info(email and password and more) from the request body
        const reqUserInfo = req.body;

        // Extract userName from the request body for testing purposes
        const { fullName } = req.body;
        console.log(`fullName: ${fullName}`)

        const token = crypto.randomBytes(32).toString('hex'); // Generate a random token for email verification
        reqUserInfo.verificationToken = token; // Add the token to the user info object that will be saved to the database so we can compare to it later when the link token is extracted from the request query from the email verification link that was sent to the user

        // Create a new user that follows the schema model definition

        const modelUser = new userModel(reqUserInfo);

        // Check if the user already exists using the interface method *findOne* thats made possible by the userModel interface we created in the user.model.js file
        if (await userModel.findOne({
            $or: [
                { fullName: value.fullName },
                { email: value.email } 
            ]
        })) {
            return res.send(`User: ${fullName} already exists`)
        }

        // Check if the image was uploaded successfully and is present in the request body
        // If the image was uploaded successfully, it will be present in the request body as req.file or req.files depending on the type of upload you are doing, single or multiple.
    //     if (!req.file) {
    //         return res.status(400).json({ error: 'Image upload failed' });
    //     }

    // reqUserInfo.imageUrl = req.file.path; // Get the image URL from the request body and add it to the user info object that will be saved to the database.

        // Save the user info to the database once the user has been verified to not exist
        await modelUser.save();

        // now send a verification email to the user using the sendVerificationMail function we created in the mailSender.js file
        await sendVerificationMail(modelUser.email, token, res);
        // The sendVerificationMail function will send a verification email to the user with a link to verify their email address. The link will contain the token that was generated when the user registered, in its query.

        // Generate a JWT token for the user so as they are logged in right after registration, they can access authentication protected routes
        const authenticationToken = generateauthToken(modelUser._id);

        res.status(201).json({ message: "User was added successfully", data: modelUser, token: authenticationToken });

    } catch (error) {
        res.send(`This error was thrown in an attempt to add user info: ${error.message}`);
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        console.log({ id: id });

        // Check if a user with the specified id does not exist
        const user = await userModel.findById(id);
        if (!user) {
            return res.send(`User with ID: ${id} does not exist`);
        }
        const { userName, email } = user;
        await userModel.findByIdAndDelete(id);
        res.status(200).json({ message: `User with username: ${userName} and email: ${email} was deleted successfully` });
    } catch (error) {
        console.log(`This error was thrown in an attempt to delete user info: ${error.message}`);
        res.status(500).json({ message: `This error was thrown in an attempt to delete user info: ${error.message}` });
    }
};

export const updateUser = async (req, res) => {
    const {id} = req.params;
    const newUserUpdates = req.body;

      // Check if the id is not a valid mongoose id that fits a valid ObjectId
    //   Do this before querying the database to save on resources and avoid an error called "CastError" which means that the id is not a valid ObjectId or is not in the correct format ot type
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).send(`This is not a valid user ID: ${id}`);     
    }
    //  Now this will not throw a CastError because the id is a valid ObjectId
    const currentUserData = await userModel.findById(id);

    // Check if the user with the specified id does not exist
    if (!(currentUserData)) {
        return res.status(404).send(`There is no user with the provided user ID: ${id}`);   
    }

    // check to make sure that the changes being requested are not already present in the document in the DB
    if (Object.keys(newUserUpdates)
        .every( updateKeys => newUserUpdates[updateKeys] === currentUserData[updateKeys])) {
        return res.status(400).send(`The user info you are trying to update is already present in the database`);
    }

    // If the control flow reaches this point, it means that the user info is not already present in the database
    // and the id specified is valid and the user exists in the database
    // and the user info can be updated
    try {
         await userModel
        .findByIdAndUpdate(id, newUserUpdates, { new: true });
        res.status(200).json({message: "The update was a success", data: `Updates: changed to ${JSON.stringify(newUserUpdates, null, 2)} Current User Data: ${await userModel.findById(id)}`});
    } catch (error) {
        res.status(500).json({message: `This error was thrown in an attempt to update user info: ${error.message}`});
    }
};

export const verifyEmail = async (req, res) => {
    try {
        // Extract the token from the request query parameters
        // This is the token that was sent to the user's email address when they registered
        const {token} = req.query;
    
        // extract the user from the DB using the token
        const user = await userModel.findOne({verificationToken: token});
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }
        // If the user is found, update the user's isVerified field to true and remove the verificationToken field.
        user.isVerified = true;
        user.verificationToken = undefined; // Remove the verification token

        user.save(); // Save the updated user to the database

        res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        res.status(500).json({ message: `This error was thrown in an attempt to verify email: ${error.message}` });
    }
}