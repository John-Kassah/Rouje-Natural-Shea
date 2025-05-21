import express from 'express';
import { registerUser, deleteUser, getAllUsers, updateUser, loginUser, verifyEmail } from '../controllers/user.controllers.js';
import { authenticator, authorizationOfRole } from '../middlewares/auth.js';



// Create an express router
const userRouter = express.Router();

// Mount get request on */getAllUsers* endpoint
userRouter.get('/getAllUsers', authenticator, authorizationOfRole('admin'), getAllUsers);

/* Mount get request on *get-A-UserWith-Id* endpoint */
userRouter.post('/login', loginUser)

// Mount get request on */addUser* endpoint
userRouter.post('/addUser', registerUser);

// Mount patch request on */updateUser* endpoint
userRouter.patch('/updateUser/:id', authenticator, authorizationOfRole('user', 'admin'), updateUser);

// Mount delete request on */deleteUser* endpoint
userRouter.delete('/deleteUser/:id', authenticator, authorizationOfRole('user', 'admin'), deleteUser);

// Mount get request on */verifyEmail* endpoint
userRouter.get('/verifyEmail', verifyEmail);

// make the default export available globally
export default userRouter;