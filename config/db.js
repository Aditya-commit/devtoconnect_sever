import { Pool } from 'pg'


const INTERNAL_ERROR='Internal Server Error';


const POOL_CONFIG = {
    host: process.env.PG_HOST,
    port : process.env.PG_PORT,
    user : process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database : process.env.PG_DATABASE,
    max: 100,
    min : 20,
    idleTimeoutMillis: 300000,
    connectionTimeoutMillis: 20000,
}



class DbController{

    // CLASS TO MANAGE DB OPERATIONS IN A PROTECTED ENVIRONMENT

    static #pool = new Pool(POOL_CONFIG);

    #sessionid=null;

    constructor(sessionid=null){
        this.#sessionid = sessionid;
    }

    async authenticate(){

        const QUERY = {
            text : "SELECT dtc.login_session.user_id FROM dtc.login_session INNER JOIN dtc.users ON dtc.login_session.user_id=dtc.users.id AND dtc.users.status=$1 WHERE dtc.login_session.session_id=$2",
            values : ['active' , this.#sessionid]
        }


        try{

            const res = await DbController.#pool.query(QUERY);

            if(res.rows.length === 0){

                return { status : 404 , error : 'Unauthenticated' }
            }
            else{

                return { status : 200 , data : res.rows[0].user_id }
            }
        }
        catch(error){

            return { status : 500 , error : INTERNAL_ERROR }

        }
    }


    async get_data(query , values){

        try{
            const res = await DbController.#pool.query(query , values);

            return { status : 200 , data : res.rows };
        }
        catch(error){
            return { status : 500 , error : INTERNAL_ERROR };
        }
    }


    async insert_row(query , values){

        try{
            const res = await DbController.#pool.query(query , values);

            return { status : 200 , data : 'Inserted successfully' };
        }
        catch(error){
            return { status : 500 , error : INTERNAL_ERROR };
        }
    }


    async insert_transac(queries){

        try{

            const client = await DbController.#pool.connect();

            try{

                await client.query('BEGIN');
            
                for(const query of queries){

                    await client.query(query.queryText , query.values);
                }
    
                await client.query("COMMIT")

                return { status : 200 , data : "Rows inserted successfully" }
            }
            catch(error){

                console.log(error);

                await client.query("ROLLBACK");

                return { status : 500 , error : INTERNAL_ERROR }
            }
        }
        catch(error){

            console.log(error);

            return { status : 500 , error : INTERNAL_ERROR };
        }

    }
}

export default DbController;