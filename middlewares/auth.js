import jwt from 'jsonwebtoken';
import { userModel } from '../models/user.model.js';

export const authenticator = async (req, res, next) => {
    // To verify the users identity, we extract the token from the 
    // authentication header of the http request

    // First, we get the authorization header
    const authHeader = req.headers.authorization;

    // now check if there is an auth header or if it starts with bearer.
    // a violation of any means the token is not present
    if (!authHeader || !authHeader.startsWith('Bearer ') ) {
        return res.status(401).json({ message: 'Authentication token not found' });
    }

    const jwtToken = authHeader.split(' ')[1];
    try {
        const decodedPayload = jwt.verify(jwtToken, process.env.JWT_SECRET_KEY);

        const user = await userModel.findById(decodedPayload.id)
        
        
        if (!user) {
            return res.status(404).json({message: `User with ID: ${decodedPayload.id} was not found`});
        }
        // Attach the queried user payload to the req object so its available for use in the route pipeline
        req.user = await userModel.findById(user.id).select('-password')
        // console.log(`req.user: ${JSON.stringify(user.toJSON(), null, 2)}`);
        next()
    } catch (error) {
        return res.send(`This error was thrown in an attempt to add user info: ${error.message}`);
    }
}

export const authorizationOfRole = (...allowedRoles) => {
    return (req, res, next) => {
        // Check if the user has the required role by comparing the user role that we saved in  with the allowed roles upon calling this middleware in the designated router
        const userRole = req.user.role // this is the role of the user that was extracted from the token and saved in the req.user object in the authenticator middleware
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ message: `This action is forbidden by the user`})
        }
        next()
    }
}