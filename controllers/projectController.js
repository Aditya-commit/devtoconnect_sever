import { formidable } from 'formidable';
import { v4 as uuid4 , validate } from 'uuid';

import DbController from '../config/db.js';








export const viewMyProjects = async(req , res) => {
    
    const db = new DbController();

    const QUERY = `SELECT dtc.projects.id , dtc.users.username , title , description , dtc.projects.status , link , dtc.projects.date , feedback_counts FROM dtc.projects INNER JOIN dtc.users ON dtc.users.id=dtc.projects.user_id WHERE dtc.projects.user_id=$1 ORDER BY dtc.projects.date DESC${req.query?.recent === 'true' ? ' LIMIT 5' : ''};`;

    const result = await db.get_data(QUERY , [req.user_id]);

    if(result.status === 200){

        res.set('Content-Type' , 'application/json');
        res.status(200).end(JSON.stringify(result.data));
    }
    else{

        res.set('Content-Type' , 'text/plain');
        res.status(result.status).end(result.error);
    }
}






export const addProject = async(req ,res) => {

    const date = Date.now();

    const form = formidable({});

    try{

        const [fields] = await form.parse(req);

        const title = fields?.title?.[0].trim();
        const description = fields?.description?.[0].trim();
        const status = fields?.status?.[0].trim();
        const link = fields?.link?.[0].trim();

        
        // DATA VALIDATION

        if(title === undefined || description === undefined || status === undefined || link === undefined){
            res.set('Content-Type' , 'text/plain');
            res.status(400).end('Invalid Api');
        }
        else{

            if(title === ''){
                res.set('Content-Type' , 'text/plain');
                res.status(400).end('Title cannot be empty');
            }
            else if(title.length > 100){
                res.set('Content-Type' , 'text/plain');
                res.status(400).end('Title cannot contain more than 100 characters');
            }

            if(title === ''){
                res.set('Content-Type' , 'text/plain');
                res.status(400).end('Title cannot be empty');
            }
            else if(title.length > 100){
                res.set('Content-Type' , 'text/plain');
                res.status(400).end('Title cannot contain more than 100 characters');
            }

            if(description === ''){
                res.set('Content-Type' , 'text/plain');
                res.status(400).end('Description cannot be empty');
            }
            else if(description.length > 500){
                res.set('Content-Type' , 'text/plain');
                res.status(400).end('Description cannot contain more than 500 characters');
            }


            if(status === ''){
                res.set('Content-Type' , 'text/plain');
                res.status(400).end('Status cannot be empty');
            }
            else if(status !== 'complete' && status !== 'pending'){
                res.set('Content-Type' , 'text/plain');
                res.status(400).end('Invalid status value');
            }


            if(link === ''){
                res.set('Content-Type' , 'text/plain');
                res.status(400).end('Link cannot be empty');
            }
            else if(link.length > 100){
                res.set('Content-Type' , 'text/plain');
                res.status(400).end('Link cannot contain more than 1000 characters');
            }
        }


        const db = new DbController();

        const QUERY = "INSERT INTO dtc.projects (id , user_id , title , description , status , link , date) VALUES ($1 , $2 , $3 , $4, $5 , $6 , $7);"

        const id = uuid4();

        const insertResponse = await db.insert_row(QUERY , [id , req.user_id , title , description, status , link , date]);

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








export const projectFeed = async(req , res) => {

    
    const db = new DbController();

    const QUERY = "SELECT dtc.projects.id , user_id , dtc.users.username , title , description , dtc.projects.status , link , dtc.projects.date , feedback_counts FROM dtc.projects INNER JOIN dtc.users ON dtc.users.id=user_id WHERE dtc.users.id != $1 ORDER BY RANDOM() LIMIT 50;";

    const result = await db.get_data(QUERY , [req.user_id]);

    if(result.status === 200){

        res.set('Content-Type' , 'application/json');
        res.status(200).end(JSON.stringify(result.data));
    }
    else{

        res.set('Content-Type' , 'text/plain');
        res.status(result.status).end(result.error);
    }
}





export const viewProject = async(req , res) => {

    if(validate(req.params.id)){

        const db = new DbController();

        const QUERY = "SELECT dtc.users.id , dtc.users.username , dtc.projects.description as content , dtc.projects.link , dtc.projects.status , dtc.projects.date , dtc.projects.feedback_counts as count FROM dtc.projects INNER JOIN dtc.users ON dtc.users.id=dtc.projects.user_id WHERE dtc.projects.id=$1";

        const result = await db.get_data(QUERY , [req.params.id]);

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