'use strict';
/**
 * Books Api
 */
const repo = require('../../../app/database/repositories/book/book.repository');
const logger = require('../../../lib/winston.logger');

/**
 * User Api Controller
 * http://.../api/book
 */
class BookController {
  /**
   * Constructor for User
   * @param {router} router Node router framework
   */
  constructor(router) {
    router.get(
      '/',
      this.all.bind(this)
    );

    router.get(
      '/page/:skip/:top',
      this.allPaged.bind(this)
    );
    router.get(
      '/:id',
      this.get.bind(this)
    );
    router.post(
      '/',
      this.insert.bind(this)
    );
    router.put(
      '/:id',
      this.update.bind(this)
    );

    router.delete(
      '/:id',
      this.delete.bind(this)
    );

    //Logging Info
    this._classInfo = '*** [Book].controller';
    this._routeName = '/api/book';
  }

  /**
   * Gets all [Book]s
   * endpoint [GET]: /
   * @param {any} req Request object
   * @param {any} res Response
   */
  all(req, res) {
    logger.info(`${this._classInfo}.all() [${this._routeName}]`);

    repo.all((err, resp) => {
      if (err) {
        logger.error(`${this._classInfo}.all() [${this._routeName}]`, err);
        res.json(null);
      } else {
        logger.debug(`${this._classInfo}.all() [${this._routeName}] OK`, resp);
        res.json(resp.data);
      }
    });
  }

  /**
   * Gets all [Book]s paged
   * endpoint [GET]: /page/:skip/:top
   * @param {any} req Request object
   * @param {any} res Response
   */
  allPaged(req, res) {
    logger.info(`${this._classInfo}.allPaged() [${this._routeName}]`);

    const topVal = req.params.top,
      skipVal = req.params.skip,
      top = isNaN(topVal) ? 10 : +topVal,
      skip = isNaN(skipVal) ? 0 : +skipVal;

    repo.allPaged(skip, top, (err, resp) => {
      res.setHeader('X-InlineCount', resp.count);
      if (err) {
        logger.error(`${this._classInfo}.allPaged() [${this._routeName}]`, err);
        res.json(null);
      } else {
        logger.debug(`${this._classInfo}.allPaged() [${this._routeName}] OK`, resp);
        res.json(resp.data);
      }
    });
  }

  /**
   * Deletes a [Book]
   * endpoint [DELETE]: /:id
   * @param {any} req Request object
   * @param {any} res Response object
   */
  delete(req, res) {
    const id = req.params.id;
    logger.info(`${this._classInfo}.delete(${id}) [${this._routeName}]`);

    repo.delete(id, (err, result) => {
      if (err) {
        logger.error(`${this._classInfo}.delete() [${this._routeName}]`, err);
        res.json({ status: false });
      } else {
        logger.debug(`${this._classInfo}.delete() [${this._routeName}] OK`, result);
        res.json({ message: 'Book successfully deleted!', result });
      }
    });
  }

  /**
   * Gets a [Book] by its id
   * endpoint [GET]: /:id'
   * @param {any} req Request object
   * @param {any} res Response
   */
  get(req, res) {
    const id = req.params.id;
    logger.info(`${this._classInfo}.get(${id}) [${this._routeName}]`);

    repo.get(id, (err, resp) => {
      if (err) {
        logger.error(`${this._classInfo}.get() [${this._routeName}]`, err);
        res.json(null);
      } else {
        logger.debug(`${this._classInfo}.get() [${this._routeName}] OK`, resp);
        res.json(resp);
      }
    });
  }

  /**
   * Inserts a [Book]
   * endpoint [POST]: /
   * @param {any} req Request object
   * @param {any} res Response
   */
  insert(req, res) {
    logger.info(`${this._classInfo}.insert() [${this._routeName}]`);

    repo.insert(req.body, (err, book) => {
      if (err) {
        logger.error(`${this._classInfo}.insert() [${this._routeName}]`);
        res.json(err);
      } else {
        logger.debug(`${this._classInfo}.insert() [${this._routeName}] OK`, book);
        res.json({message: "Book successfully added!", book });
      }
    });
  }

  /**
   * Updates a [Book]
   * endpoint [PUT] : /:id
   * @param {any} req Request object
   * @param {any} res Response object
   */
  update(req, res) {
    const id = req.params.id;
    logger.info(`${this._classInfo}.update(${id}) [${this._routeName}]`);

    if (!req.body) {
      throw new Error('User required');
    }

    repo.update(id, req.body, (err, book) => {
      if (err) {
        logger.error(`${this._classInfo}.update() [${this._routeName}]`, err, req.body);
        res.json({
          status: false,
          msg: 'Update Failed',
          error: {
            code: err.code,
            errmsg: err.errmsg,
            index: err.index
          },
          data: null
        });
      } else {
        logger.debug(`${this._classInfo}.update() [${this._routeName}] OK`, book);
        res.json({ message: 'Book updated!', book });
      }
    });
  }
}

module.exports = BookController;
