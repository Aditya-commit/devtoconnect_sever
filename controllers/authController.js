import { formidable , errors as formidableErrors } from 'formidable';
import { v4 as uuid4 } from 'uuid';
import bcrypt from "bcryptjs";


// IMPORTING VALIDATORS
import { validateUsername } from '../utility/username_validator.js';
import { validateName } from '../utility/name_validator.js';
import { validatePassword } from '../utility/password_validator.js';
import { getSessionId } from '../utility/session_generator.js';
import DbController from '../config/db.js';




export const checkAuthentication = async(req , res) => {

    res.set('Content-Type' , 'text/plain');
    res.status(200).end('Ok');
};


export const getInfo = async (req , res) => {

    const db = new DbController();

    const QUERY = "SELECT id , username FROM dtc.users WHERE id=$1;";

    const response = await db.get_data(QUERY , [req.user_id]);


    if(response.status === 200){

        res.set("Content-Type" , 'application/json');
        res.status(200).end(JSON.stringify(response.data[0]));
    }
    else{
        res.set("Content-Type" , 'text/plain');
        res.status(response.status).end(response.error);
    }
}





export const signIn = async(req , res) => {

    const date = Date.now();

    const form = formidable({});

    try{

        const [fields] = await form.parse(req);

        const username = fields?.username?.[0]?.trim();
        const password = fields?.password?.[0]?.trim();

        if(username === undefined || password === undefined){

            res.set("Content-Type" , 'text/plain');
            res.status(400).end('Invalid Api');
        }

        // VALIDATE THE DATA

        const validUsername = validateUsername(username);

        if(username === ''){
            res.set("Cotent-Type" , 'text/plain');
            res.status(400).end('Username cannot be empty');
        }
        else if(!validUsername){

            res.set("Cotent-Type" , 'text/plain');
            res.status(400).end('Username is not of valid format');
        }

        if(password.trim() === ''){

            res.set("Content-Type" , 'text/plain');
            res.status(400).end("Password cannot be empty");
        }


        // IF DATA IS VALID

        const db = new DbController();

        const QUERY = "SELECT id , password FROM dtc.users WHERE username=$1";

        const dbResponse = await db.get_data(QUERY , [username]);

        
        if(dbResponse.status === 200){
            
            const { data } = dbResponse;

            if(data.length === 1){

                const validPassword = await bcrypt.compare(password , data[0].password);

                if(validPassword){

                    const sessionId = getSessionId();

                    const INSERT_QUERY = "INSERT INTO dtc.login_session (session_id , user_id ,date) VALUES ($1 , $2 , $3);"

                    const insertResponse = await db.insert_row(INSERT_QUERY , [sessionId , data[0].id , date]);
                
                    if(insertResponse.status === 200){

                        res.cookie('sessionid' , sessionId , { httponly : true , secure : true , sameSite : 'none' , signed : true , maxAge: 30 * 24 * 60 * 60 * 1000 });

                        res.set("Content-Type" , 'text/plain');
                        res.status(200).end('Signed In Successfully');
                    }
                    else{
                        res.set("Content-Type" , 'text/plain');
                        res.status(500).end('Internal Server Error');
                    }
                }
                else{

                    res.set("Content-Type" , 'text/plain');
                    res.status(404).end('Invalid credentials');
                }
            }
            else{
                res.set("Content-Type" , 'text/plain');
                res.status(404).end('Invalid credentials');
            }
        }
        else{
            
            res.set('Content-Type' , 'text/plain');
            res.status(dbResponse.status).end(dbResponse.error);
        }
    }
    catch(error){
        console.log(error);

        res.set("Content-Type" , 'text/plain');
        res.status(500).end('Internal Server Error');
    }
}



export const signUp = async(req , res) => {
    
    const form = formidable({});

    try{

        let fields;

        [fields] = await form.parse(req);

        const username = fields?.username?.[0].trim();
        const name = fields?.name?.[0].trim();
        const password = fields?.password?.[0].trim();

        if(username === undefined || name === undefined || password === undefined){
            res.set('Content-Type' , 'text/plain');
            res.status(400).end('Invalid Api');
        }
        else{

            // DATA VALIDATION

            const validName = validateName(name);
            const validUsername = validateUsername(username);
            const validPassword = validatePassword(password);

            if(validName === -1){

                res.set('Content-Type' , 'text/plain');
                res.status(400).end('Please provide name');
            }
            else if(validName === false){
                res.set('Content-Type' , 'text/plain');
                res.status(400).end('Name is not of valid format');
            }

            if(validUsername === -1){
                res.set('Content-Type' , 'text/plain');
                res.status(400).end('Please provide username');
            }
            else if(validUsername === false){
                res.set('Content-Type' , 'text/plain');
                res.status(400).end('Username is not of valid format');
            }

            if(validPassword === -1){
                res.set('Content-Type' , 'text/plain');
                res.status(400).end('Please provide password');
            }
            else if(validPassword === false){
                res.set('Content-Type' , 'text/plain');
                res.status(400).end('Password is not of valid format');
            }


            const sessionId = getSessionId();
            const date = Date.now();
            const userId = uuid4();

            const hashPassword = await bcrypt.hash(password , 10);

            const queries = [
                {queryText : "INSERT INTO dtc.users (id , username , name , password , date) VALUES ($1 , $2 , $3 , $4 , $5);" , values : [userId , username , name , hashPassword , date] },
                { queryText : "INSERT INTO dtc.login_session (user_id , session_id , date) VALUES ($1 , $2 , $3);" , values : [userId , sessionId , date] }
            ]

           const db = new DbController();

           const dbResponse= await db.insert_transac(queries);

           if(dbResponse.status === 200){

                res.cookie('sessionid' , sessionId , { secure : true , signed : true , sameSite : 'none' , maxAge: 30 * 24 * 60 * 60 * 1000 });

                res.set('Content-Type' , 'text/plain');
                res.end('Account Created Successfully');
            }
            else{
                res.set('Content-Type' , 'text/plain');
                res.status(dbResponse.status).end(dbResponse.error);
            }
        }
    }
    catch(error){

        console.log(error);

        res.set('Content-Type' , 'text/plain')
        res.status(400).end('Cannot parse data');
    }
}


export const signOut = async(req , res) => {

    const sessionid = req.signedCookies.sessionid;

    const db = new DbController();

    const QUERY = "DELETE FROM dtc.login_session WHERE session_id=$1;";

    const dbResponse = await db.delete_row(QUERY , [sessionid]);

    res.clearCookie('sessionid' , { httponly : true , secure : true , sameSite : 'none' , signed : true });

    res.set('Content-Type' , 'text/plain');
    res.end('Logged out successfully');

}