import mysql from "mysql2/promise";

const connection = async () => {
    try {
        // Create config inside the function so it reads env vars after dotenv loads them
        const mysqlConfig = {
            host: process.env.DB_SERVER,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            charset: 'utf8mb4',
        };

        const db = await mysql.createConnection(mysqlConfig);

        db.on('error', (err) => {
            console.error('Database connection error:', err);
        });

        db.connect((err) => {
            if (err) {
                console.error("Connection failed:", err);
            } else {
                console.log("Connected to MySQL database");
            }
        });

        return db;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

const closeConnection = async (db) => {
    try {
        await db.end();
    } catch (error) {
        console.log(error);
        throw error;
    }
}


export const callStoredFunction = async (function_name, params) => {
    try {
        const db = await connection();
        const [results] = await db.query(`SELECT ${function_name}('${params.join("', '")}') As result`);
        // Return just the result value, not the whole object
        await closeConnection(db);
        return results;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const callStoredProcedure = async (procedure_name, params) => {
    try {
        const db = await connection();
        console.log(`CALL ${procedure_name}('${params.join('", "')}')`)
        const [results] = await db.query(`CALL ${procedure_name}("${params.join('", "')}")`);
        await closeConnection(db);
        return results;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const Select = async (table, condition = []) => {
    try {
        const db = await connection();
        const [results] = await db.query(`Select * from ${table} ${condition.length > 0 ? 'where ' + condition.join(' and ') : ''}`);
        console.log(`Select * from ${table} ${condition.length > 0 ? 'where ' + condition.join(' and ') : ''}`, condition)
        await closeConnection(db);
        return results;
    } catch (error) {
        console.log(error);
        throw error;
    }
}
