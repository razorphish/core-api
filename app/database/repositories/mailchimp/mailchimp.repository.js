const mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  MailChimpModel = require('../../models/mailchimp/mailchimp.model'),
  mailChimpConfig = require('./configLoader').mailChimp,
  mailChimp = require('mailchimp-api-3');

/**
* MailChimp Repository
*/
class MailChimpRepository {
  /**
 * Gets all MailChimps in db
 * @param {function} callback Callback function for fail/success 
 */
  all(callback) {
    console.log('*** MailChimp.repository.all()');

    MailChimpModel.count((err, count) => {
      console.log(`MailChimp count: ${count}`);

      MailChimpModel.find({}, (err, data) => {
        if (err) {
          console.log(`*** MailChimp.repository.all error: ${err}`);
          return callback(err);
        }

        callback(null, {
          count: count,
          data: data
        });
      });
    });
  }

  /**
 * Gets all MailChimps paged
 * @param {number} skip Page number
 * @param {number} top Number of items per page
 * @param {function} callback Callback function
 */
  allPaged(skip, top, callback) {
    console.log('*** MailChimp.Repository.allPaged');

    MailChimpModel.count((err, itemCount) => {
      if (err) {
        console.log(`*** MailChimp.repository.allPaged error ${err}`);
        return callback(err);
      }

      var count = itemCount;
      console.log(`Skip: ${skip} Top: ${top}`);
      console.log(`MailChimp count: ${count}`);

      MailChimpModel.find({})
        .sort({
          name: 1
        })
        .skip(skip)
        .limit(top)
        .exec((err, data) => {
          if (err) {
            console.log(`*** MailChimp.Repository.allPaged error : ${err}`);
            return callback(err);
          }

          callback(null, {
            count: count,
            data: data
          });
        });
    });
  }

  /**
   * Gets MailChimps by vendorId and action
   * @param {string} userId - user Id
   */
  byUserId(userId, callback) {
    console.log('*** MailChimp.repository.byUserId');

    var query = {
      userId: userId
    };

    MailChimpModel.find(query, (err, data) => {
      if (err) {
        console.log(`*** MailChimp.repository.byUserId error ${err}`);
        return callback(err);
      }

      callback(null, data);
    });
  }

  /**
 * Delete a MailChimp by id
 * @param {string} id Id of MailChimp
 * @param {function} callback function on success/fail
 */
  delete(id, callback) {
    console.log('*** MailChimp.repository.delete');
    MailChimpModel.deleteOne(
      {
        _id: id
      },
      (err, data) => {
        if (err) {
          console.log(`*** MailChimps.repository.delete error ${err}`);
          return callback(err, null);
        }
        callback(null, data);
      }
    );
  }

  /**
 * Gets MailChimp by Id
 * @param {ObjectId} id - Id of MailChimp
 * @param {function} callback - callback function
 */
  get(id, callback) {
    console.log('*** MailChimp.repository.get');
    MailChimpModel.findById(id, (err, data) => {
      if (err) {
        console.log(`*** MailChimp.repository.get error: ${err}`);
        return callback(err);
      }

      callback(null, data);
    });
  }

  /**
   * Inserts a MailChimp into db  
   * @param {object} body Object that contain MailChimp info
   * @param {function} callback Callback function success/fail
   */
  insert(body, callback) {
    console.log('*** MailChimp.repository.insert');

    if (body.constructor === Array) {
      let asyncData = [];
      let asyncTasks = this.asyncInsertMailChimps(body, (err, data) => {
        if (err) {
          callback(err);
        } else {
          asyncData.push(data);
        }
      });
      async.parallel(asyncTasks, (err, data) => {
        //Handle individual errors, insertions, if applicable
        if (err) {
          callback(err);
        } else {
          callback(null, data);
        }
      });
    } else {
      var model = new MailChimpModel();
      console.log(body);

      model.name = body.name;
      model.email = body.email;
      model.message = body.message;

      model.save((err, data) => {
        if (err) {
          console.log(`*** MailChimp.repository.insert error ${err}`);
          return callback(err);
        }

        callback(null, data);
      });
    }
  }

  /**
 * Returns summary (limited number of fields) in a recordset
 * @param {number} skip Number of items per page 
 * @param {number} top Return top number
 * @param {function} callback Callback function to calling user 
 */
  summary(skip, top, callback) {
    console.log('*** MailChimp.Repository.summary');
    MailChimpModel.count((err, itemCount) => {
      if (err) {
        console.log(`*** MailChimp.repository error ${err}`);
        return callback(err);
      }

      var count = itemCount;
      console.log(`MailChimp count: ${count}`);

      MailChimpModel.find(
        {},
        {
          _id: 0,
          name: 1,
          normalizedName: 1
        }
      )
        .skip(skip)
        .limit(top)
        .exec((err, data) => {
          if (err) {
            console.log(`*** MailChimp.repository.summary error ${err}`);
            return callback(err);
          }

          callback(null, {
            count: count,
            data: data
          });
        });
    });
  }

  /**
   * Updates an MailChimp
   * @param {any} id Id of MailChimp
   * @param {object} body Object containing MailChimp information
   * @param {function} callback Callback function fail/success
   */
  update(id, body, callback) {
    console.log('*** MailChimp.repository.update');

    MailChimpModel.findById(id, (err, item) => {
      if (err) {
        console.log(`*** MailChimp.repository.update error ${err}`);
        return callback(error);
      }

      item.name = body.name;
      item.email = body.email;
      item.message = body.message;

      item.save((err, data) => {
        if (err) {
          console.log(`*** MailChimp.repository.update error ${err}`);
          return callback(err);
        }

        //returns MailChimp data
        callback(null, data);
      });
    });
  }

  /////Private Methods ////////////////////////////////////////////////////////
  asyncInsertMailChimps(body, callback) {
    let asyncTasks = [];

    body.forEach(item => {
      asyncTasks.push(function(callback) {
        var model = new MailChimpModel();
        console.log(item);

        model.name = item.name;
        model.email = item.email;
        model.message = item.message;

        model.save((err, data) => {
          if (err) {
            console.log(`*** MailChimps.repository.insert error ${err}`);
            return callback(err);
          }

          callback(null, data);
        });
      });
    });

    return asyncTasks;
  }

  asyncUpdateMailChimps(body, callback) {
    let asyncTasks = [];

    body.forEach(mailChimp => {
      asyncTasks.push(function(callback) {
        MailChimps.findById(id, (err, item) => {
          if (err) {
            console.log(`*** MailChimps.repository.update error ${err}`);
            return callback(error);
          }

          item.name = mailChimp.name;
          item.email = mailChimp.email;
          item.message = mailChimp.message;

          item.save((err, data) => {
            if (err) {
              console.log(`*** MailChimps.repository.update error ${err}`);
              return callback(err);
            }

            //returns MailChimp data
            callback(null, data);
          });
        });
      });
    });

    return asyncTasks;
  }
}

module.exports = new MailChimpRepository();