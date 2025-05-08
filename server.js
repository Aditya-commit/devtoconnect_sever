// IMPORTING MODULES
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';




import DbController from './config/db.js';


// IMPORTING ROUTE HANDLERS
import userRouters from './routes/auth.js';
import projectRouters from './routes/projects.js';
import feedbackRouter from './routes/feedback.js';





const whitelist = ['http://127.0.0.1:3000' , 'http://192.168.29.12:3000'];

const corsOptions = {
	origin : function (origin, callback) {
        if (!origin || whitelist.indexOf(origin) !== -1) {
          callback(null, true)
        } else {
          callback(new Error('Not allowed by CORS'))
        }
      },
      credentials : true
};








const cookieMiddleware = (req , res ,next) => {

    if(req.signedCookies.sessionid !== undefined){
        
        // CHECK WHETHER THE COOKIE IS VALID OR NOT

        const db = new DbController();

        db.authenticate(req.signedCookies.sessionid).then(result => {
          
          if(result.status === 200){

            if(req.path === '/auth/signup' || req.path === '/auth/signin'){

              res.set('Content-Type' , 'text/plain');
              res.status(301).end('Already Logged In');
            }
            else{

              req.user_id = result.data;

              next();
            }
          }
          else{

            res.set('Content-Type' , 'text/plain');
            res.status(result.status).end(result.error);

          }
        })
        .catch(error =>{
          console.log(error)
          
          res.set('Content-Type' , 'text/plain');
          res.status(500).end('Internal Server Error');

        });
    }
    else{

        if(req.path === '/auth/signup' || req.path === '/auth/signin'){
            next();
        }
        else{
            res.set('Content-Type' , 'text/plain');
            res.status(401).end('Unauthorized to perform this action');
        }
    }
}







const app = express();
app.use(cors(corsOptions));
app.use(cookieParser(process.env.SECRET));
app.use(express.json());
app.use(cookieMiddleware);


// LINK THE ROUTERS
app.use('/auth' , userRouters);
app.use('/projects' , projectRouters);
app.use('/feedback' , feedbackRouter);




app.listen(process.env.PORT , process.env.HOST , () => {
	console.log(`Server is listening at port ${process.env.PORT}`);
});