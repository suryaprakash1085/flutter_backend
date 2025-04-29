
// knex.js
const knex = require('knex')({
    client: 'mysql2',
    connection: {
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'flutter_project'
    }
  });
  
  module.exports = knex;
  