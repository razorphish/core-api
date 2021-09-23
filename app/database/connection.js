/* eslint-disable consistent-return */
const mongoose = require('mongoose');
const async = require('async');

const { ObjectId } = mongoose.Types;
const config = require('../../lib/config.loader');
const logger = require('../../lib/winston.logger');

let connection = null;

class Database {
  constructor() {
    this.connectionString = '';
    this.serverless = config.app.hasServerless;

    if (this.serverless) {
      this.username = config.serverlessDatabaseConfig.username;
      this.password = config.serverlessDatabaseConfig.password;
      const _connectionString = config.serverlessDatabaseConfig.connectionString
        .replace('<username>', this.username)
        .replace('<password>', this.password)
        .replace('<database>', config.serverlessDatabaseConfig.database);
      this.connectionString = _connectionString;
    } else {
      this.username = config.databaseConfig.username;
      this.password = config.databaseConfig.password;
      this.connectionString = `mongodb://${config.databaseConfig.host}:${config.databaseConfig.port}/${config.databaseConfig.database}${config.databaseConfig.queryOptions}`;
    }
  }

  /**
   * Close the database
   */
  close() {
    connection.close(() => {
      logger.debug(
        'Mongoose default connection disconnected through app termination'
      );
      process.exit(0);
    });
  }

  drop(done) {
    if (!connection) {
      return done();
    }

    // This is faster then dropping the database
    connection.db.collections((err, collections) => {
      async.each(
        collections,
        (collection, cb) => {
          if (collection.collectionName.indexOf('system') === 0) {
            return cb();
          }
          collection.deleteOne(cb);
        },
        done
      );
    });

    // This is faster then dropping the database
    // connection.collections((err, collections) => {
    // async.each(collections, (collection, cb) => {
    // async.each(connection.db.collectionNames, (collection, cb) => {
    //     if (collection.collectionName.indexOf('system') === 0) {
    //         console.log('no')
    //         return cb()
    //     }
    //     console.log('yes')
    //     collection.remove(cb)
    // }, done)
    // })
  }

  fixtures(data, done) {
    if (!connection) {
      return done(new Error('Missing database connection.'));
    }

    const names = Object.keys(data.collections);

    async.each(
      names,
      (name, done2) => {
        connection.createCollection(name, (err, collection) => {
          if (err) {
            return done2(err);
          }

          // Add fields here that have an ObjectId data type (not _ids)
          data.collections[name].forEach((item) => {
            if (item.userId) {
              item.userId = new ObjectId(item.userId);
            }
          });

          collection.insertMany(data.collections[name], done);
        });
      },
      done
    );
  }

  getDatabase() {
    return connection;
  }

  open(done) {
    const options = {
      useNewUrlParser: true,
      user: this.username,
      pass: this.password
    };

    mongoose.connect(this.connectionString, options, (err) => {
      if (err) {
        logger.error('mongoose.connect() failed: ', err);
      }
    });

    // mongoose.set('useCreateIndex', true);

    connection = mongoose.connection;
    mongoose.Promise = global.Promise;

    mongoose.connection.on('error', (err) => {
      logger.error(
        `Error connecting to MongoDB: ${this.connectionString}`,
        err
      );
      done(err, false);
    });

    mongoose.connection.once('open', () => {
      logger.debug('We have connected to mongodb');
      done(null, true);
    });
  }
}

module.exports = new Database();
