const pg = require("pg");
const client = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "projeto2",
  password: "123456",
  port: 5432,
});

module.exports = class PostgresConnection {
  constructor() {
    PostgresConnection.createConnection();
  }
  static createConnection() {
    try {
      client.connect();
      console.info(
        "[POSTGRESQL] Conexão ao banco de dados realizada com sucesso."
      );
    } catch (error) {
      console.error(
        "[POSTGRESQL] Erro ao conectar ao banco de dados.\n ",
        error
      );
    }
  }

  executeQuery(param) {
    return client.query({
      text: param.text,
      values: param.values,
    });
  }
};
