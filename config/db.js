import { Pool } from 'pg'


const INTERNAL_ERROR='Internal Server Error';


const POOL_CONFIG = {
    connectionString : process.env.SUPABASE_DB_URL,
    max: 100,
    min : 20,
    idleTimeoutMillis: 300000,
    connectionTimeoutMillis: 20000,
    ssl: {
        rejectUnauthorized: false,
      }
}



class DbController{

    // CLASS TO MANAGE DB OPERATIONS IN A PROTECTED ENVIRONMENT

    static #pool = new Pool(POOL_CONFIG);


    async authenticate(sessionid){

        const QUERY = {
            text : "SELECT dtc.login_session.user_id FROM dtc.login_session INNER JOIN dtc.users ON dtc.login_session.user_id=dtc.users.id AND dtc.users.status=$1 WHERE dtc.login_session.session_id=$2",
            values : ['active' , sessionid]
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
            console.log(error)
            return { status : 500 , error : INTERNAL_ERROR };
        }
    }


    async insert_row(query , values){

        try{
            const res = await DbController.#pool.query(query , values);

            return { status : 200 , data : 'Inserted successfully' };
        }
        catch(error){
            console.log(error);
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

    async delete_row(query , value){

        try{
            const res = await DbController.#pool.query(query , value);

            return { status : 200 , data : 'Deleted successfully' };
        }
        catch(error){
            console.log(error);
            return { status : 500 , error : INTERNAL_ERROR };
        }
    }
}

export default DbController;