import express from 'express';

import { viewMyProjects , addProject , projectFeed , viewProject } from '../controllers/projectController.js';


const router = express.Router();


router.get('/my_projects' , viewMyProjects);
router.get('/feed' , projectFeed);
router.post('/add_project' , addProject)
router.get('/:id' , viewProject);


export default router;