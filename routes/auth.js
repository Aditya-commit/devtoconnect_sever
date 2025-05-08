import express from 'express';
import { signIn , signUp , signOut , checkAuthentication , getInfo } from '../controllers/authController.js';

const router = express.Router();


router.get('/authenticate' , checkAuthentication);
router.get('/myinfo' , getInfo);
router.post('/signin' , signIn);
router.post('/signout' , signOut);
router.post('/signup' , signUp);
export default router;