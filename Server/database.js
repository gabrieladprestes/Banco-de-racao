const sql = require("mssql/msnodesqlv8")
const database = {
    // Aqui vai ficar o nome do servidor do sql server. Não esqueça de trocar o nome
    server: 'NoteGab',
    database: 'Banco_Racao',
    options: {
        trustServerCertificate: true,
        trustedConnection: true
    },
    driver: "ODBC Driver 17 for SQL Server"
}

async function conectar() {
    try {
        const db = await sql.connect(database);
        console.log("SQL Server conectado!");
        console.log("Banco: Banco_Racao");
        return db;
    } catch (error) {
        console.error("Erro ao conectar:");
        console.error(error.message);
        throw error;
    }
}

module.exports = {sql,conectar };