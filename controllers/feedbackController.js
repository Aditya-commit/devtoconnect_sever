import { formidable } from 'formidable';
import { v4 as uuid4 , validate } from 'uuid';

import DbController from '../config/db.js';








export const viewFeedback = async(req , res) => {
    

    if(validate(req.params.id)){

        const db = new DbController();

        let QUERY;

        if(req.query?.count === 'true'){

            QUERY = `SELECT dtc.users.username , dtc.feedback.text , dtc.projects.feedback_counts as fcounts FROM dtc.feedback INNER JOIN dtc.users ON dtc.users.id=dtc.feedback.user_id INNER JOIN dtc.projects ON dtc.projects.id=$1 WHERE dtc.feedback.project_id=$2 ORDER BY dtc.feedback.date DESC`;

        }
        else{

            QUERY = `SELECT dtc.users.username , dtc.feedback.text FROM dtc.feedback INNER JOIN dtc.users ON dtc.users.id=dtc.feedback.user_id WHERE dtc.feedback.project_id=$1 ORDER BY dtc.feedback.date DESC`;
        }

        const result = await db.get_data(QUERY , req?.query?.count === 'true' ? [req.params.id , req.params.id] : [req.params.id]);


        if(result.status === 200){

            res.set('Content-Type' , 'application/json');
            res.status(200).end(JSON.stringify(result.data));
        }
        else{

            res.set('Content-Type' , 'text/plain');
            res.status(result.status).end(result.error);
        }

    }
    else{

        res.set('Content-Type' , 'text/plain');
        res.status(400).end("Invalid Api");
    }
}



export const addFeedback = async(req , res) => {

    const date = Date.now();

    const form = formidable({});

    try{

        const [fields] = await form.parse(req);

        const feedback = fields?.feedback?.[0].trim();
        const projectId = fields?.id?.[0].trim();

        
        // DATA VALIDATION

        if(feedback === undefined || projectId === undefined){
            res.set('Content-Type' , 'text/plain');
            res.status(400).end('Invalid Api');
        }
        
        if(feedback === ''){
            res.set('Content-Type' , 'text/plain');
            res.status(400).end('Feedback cannot be empty');
        }    
        else if(feedback.length > 1000){
            res.set('Content-Type' , 'text/plain');
            res.status(400).end('Feedback cannot contain more than 1000 characters');
        }


        if(!validate(projectId)){
            res.set('Content-Type' , 'text/plain');
            res.status(400).end('Please select a project');
        }



        const db = new DbController();

        const id = uuid4();

        const QUERY = "INSERT INTO dtc.feedback (id , user_id , project_id , text , date) VALUES ($1 , $2 , $3 , $4 , $5);";


        const insertResponse = await db.insert_row(QUERY , [id , req.user_id , projectId , feedback , date]);

        if(insertResponse.status === 200){

            res.set('Content-Type' ,'text/plain');
            res.end('Ok');
        }
        else{

            res.set('Content-Type' , 'text/plain');
            res.status(insertResponse.status).end(insertResponse.error);
        }
    }
    catch(error){

        res.set('Content-Type' , 'text/plain');
        res.status(200).end('Could not parse data');
    }
}