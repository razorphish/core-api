'use strict';
/**
 * Application Settings Api
 */

const repo = require('../../../../app/database/repositories/application/application-settings.repository');
const passport = require('passport');
const utils = require('../../../../lib/utils');
const logger = require('../../../../lib/winston.logger');

/**
 * Application Settings for items Api Controller
 * http://.../api/application/settings
 * @author Antonio Marasco
 */
class ApplicationSettingsController {

    /**
     * Constructor for Application Settings
     * @param {router} router Node router framework
     * @example let controller = new ApplicationSettingsController(router);
     */
    constructor(router) {
        router.get(
            '/',
            passport.authenticate('user-bearer', { session: false }),
            utils.isInRole('admin'),
            this.all.bind(this)
        );

        router.get(
            '/page/:skip/:top',
            passport.authenticate('user-bearer', { session: false }),
            utils.isInRole('admin'),
            this.allPaged.bind(this)
        );

        router.get(
            '/:id',
            passport.authenticate('user-bearer', { session: false }),
            utils.isInRole(['admin', 'user']),
            this.get.bind(this)
        );

        router.post(
            '/',
            passport.authenticate('user-bearer', { session: false }),
            utils.isInRole('admin'),
            this.insert.bind(this)
        );

        // Insert email Notification
        // /api/application/settings/:id/emailNotification/
        router.post(
            '/:id/emailNotification',
            passport.authenticate('user-bearer', { session: false }),
            utils.isInRole('admin'),
            this.insertEmailNotification.bind(this)
        );

        //Insert Notification
        ///api/application/settings/:id/notification/
        router.post(
            '/:id/notification',
            passport.authenticate('user-bearer', { session: false }),
            utils.isInRole('admin'),
            this.insertNotification.bind(this)
        );

        //Insert Notification Action
        ///api/application/settings/:id/notification/:notificationId/action
        router.post(
            '/:id/notification/:notificationId/action',
            passport.authenticate('user-bearer', { session: false }),
            utils.isInRole('admin'),
            this.insertNotificationAction.bind(this)
        );

        router.put(
            '/:id',
            passport.authenticate('user-bearer', { session: false }),
            utils.isInRole(['admin', 'user']),
            this.update.bind(this)
        );

        router.put(
            '/:id/notification/:notificationId/action/:actionId',
            passport.authenticate('user-bearer', { session: false }),
            utils.isInRole(['admin', 'user']),
            this.updateNotificationAction.bind(this)
        );

        // Update Notification
        router.put(
            '/:id/notification/:notificationId',
            passport.authenticate('user-bearer', { session: false }),
            utils.isInRole(['admin', 'user']),
            this.updateNotification.bind(this)
        );

        //Update Email Notification
        router.put(
            '/:id/emailNotification/:emailNotificationId',
            passport.authenticate('user-bearer', { session: false }),
            utils.isInRole(['admin', 'user']),
            this.updateEmailNotification.bind(this)
        );

        router.delete(
            '/:id',
            passport.authenticate('user-bearer', { session: false }),
            utils.isInRole('admin'),
            this.delete.bind(this)
        );

        //Logging Info
        this._classInfo = '*** [application-settings].controller';
        this._routeName = '/api/application/settings';

    }

    /**
     * Gets all {applicationSettings}
     * @param {Request} [request] Request object
     * @param {Response} response Response
     * @example GET /api/application/settings
     * @returns {pointer} res.json
     */
    all(request, response, next) {
        logger.info(`${this._classInfo}.all() [${this._routeName}]`);

        repo.all((error, result) => {
            if (error) {
                logger.error(`${this._classInfo}.all() [${this._routeName}]`, error);
                response.status(500).json(error);
                //next(error);
            } else {
                logger.debug(`${this._classInfo}.all() [${this._routeName}] OK`);
                response.json(result);
            }
        });
    }

    /**
     * Gets all {applicationSettings} paginated
     * @param {Request} request Request object {Default:10}
     * @param {Request} [request.params.top=10]
     * @param {Response} response Response
     * @example /api/application/settings/page/2/10
     * @description /api/application/settings/page/{page number}/{# per page}
     */
    allPaged(request, response) {
        logger.info(`${this._classInfo}.allPaged() [${this._routeName}]`);

        const topVal = request.params.top,
            skipVal = request.params.skip,
            top = isNaN(topVal) ? 10 : +topVal,
            skip = isNaN(skipVal) ? 0 : +skipVal;

        repo.allPaged(skip, top, (error, result) => {
            //response.setHeader('X-InlineCount', result.count);
            if (error) {
                logger.error(`${this._classInfo}.allPaged() [${this._routeName}]`, error);
                response.status(500).json(error);
            } else {
                logger.debug(`${this._classInfo}.allPaged() [${this._routeName}] OK`);
                response.json(result);
            }
        });
    }

    /**
     * Deletes a {applicationSettings}
     * @param {Request} request Request object
     * @param {Response} response Response object
     * @example DELETE /api/application/settings/:id
     * @returns {status: true|false} via res pointer
     */
    delete(request, response) {
        const id = request.params.id;
        logger.info(`${this._classInfo}.delete(${id}) [${this._routeName}]`);

        repo.delete(id, (error, result) => {
            if (error) {
                logger.error(`${this._classInfo}.delete() [${this._routeName}]`, error);
                response.json(result);
            } else {
                logger.debug(`${this._classInfo}.delete() [${this._routeName}] OK`);
                response.json(result);
            }
        });
    }

    /**
     * Gets a {applicationSettings} by its id
     * @param {Request} request Request object
     * @param {Response} response Response
     * @example GET /api/application/settings/:id
     */
    get(request, response) {
        const id = request.params.id;
        logger.info(`${this._classInfo}.get(${id}) [${this._routeName}]`);

        repo.get(id, (error, result) => {
            if (error) {
                logger.error(`${this._classInfo}.get() [${this._routeName}]`, error);
                response.status(500).json(error);
            } else {
                logger.debug(`${this._classInfo}.get() [${this._routeName}] OK`);
                response.json(result);
            }
        });
    }

    /**
     * Inserts a {applicationSettings}
     * @param {Request} request Request object
     * @param {Response} response Response
     * @example POST /api/application/settings
     */
    insert(request, response) {
        logger.info(`${this._classInfo}.insert() [${this._routeName}]`);

        repo.insert(request.body, (error, result) => {
            if (error) {
                logger.error(`${this._classInfo}.insert() [${this._routeName}]`, error);
                response.status(500).json(error);
            } else {
                logger.debug(`${this._classInfo}.insert() [${this._routeName}] OK`);
                response.json(result);
            }
        });
    }

    /**
    * Insert an {applicationSettings} email notification
    * @param {Request} request Request object
    * @param {Response} response Response object
    * @example POST /api/application/settings/:id/emailNotification/
    */
    insertEmailNotification(request, response) {
        const id = request.params.id;

        logger.info(`${this._classInfo}.insertEmailNotification(${id}) [${this._routeName}]`);

        repo.insertEmailNotification(id, request.body, (error, result) => {
            if (error) {
                logger.error(`${this._classInfo}.insertEmailNotification() [${this._routeName}]`, error, request.body);
                response.status(500).json(error);
            } else {
                logger.debug(`${this._classInfo}.insertEmailNotification() [${this._routeName}] OK`);
                response.json(result);
            }
        });
    }

    /**
    * Insert an {applicationSettings} notification
    * @param {Request} request Request object
    * @param {Response} response Response object
    * @example POST /api/application/settings/:id/notification/
    */
    insertNotification(request, response) {
        const id = request.params.id;

        logger.info(`${this._classInfo}.insertNotification(${id}) [${this._routeName}]`);

        repo.insertNotification(id, request.body, (error, result) => {
            if (error) {
                logger.error(`${this._classInfo}.insertNotification() [${this._routeName}]`, error, request.body);
                response.status(500).json(error);
            } else {
                logger.debug(`${this._classInfo}.insertNotification() [${this._routeName}] OK`);
                response.json(result);
            }
        });
    }

    /**
* Insert an {applicationSettings} notification
* @param {Request} request Request object
* @param {Response} response Response object
* @example POST /api/application/settings/:id/notification/:notificationId/action
*/
    insertNotificationAction(request, response) {
        const id = request.params.id; //SettingsId
        const notificationId = request.params.notificationId; //Notification id

        logger.info(`${this._classInfo}.insertNotificationAction(${id},${notificationId}) [${this._routeName}]`);

        repo.insertNotificationAction(id, notificationId, request.body, (error, result) => {
            if (error) {
                logger.error(`${this._classInfo}.insertNotificationAction() [${this._routeName}]`, error, request.body);
                response.status(500).json(error);
            } else {
                logger.debug(`${this._classInfo}.insertNinsertNotificationActionotification() [${this._routeName}] OK`);
                response.json(result);
            }
        });
    }

    /**
     * Updates a {applicationSettings}
     * @param {Request} request Request object
     * @param {Response} response Response object
     * @example PUT /api/application/settings/:id
     */
    update(request, response) {
        const id = request.params.id;
        logger.info(`${this._classInfo}.update(${id}) [${this._routeName}]`);

        repo.update(id, request.body, (error, result) => {
            if (error) {
                logger.error(`${this._classInfo}.update() [${this._routeName}]`, error, request.body);
                response.status(500).json(error);
            } else {
                logger.debug(`${this._classInfo}.update() [${this._routeName}] OK`);
                response.json(result);
            }
        });
    }

    /**
    * Updates an {applicationSettings} email notification
    * @param {Request} request Request object
    * @param {Response} response Response object
    * @example PUT /api/application/settings/:id/emailNotification/:emailNotificationId
    */
    updateEmailNotification(request, response) {
        const id = request.params.id;
        const emailNotificationId = request.params.emailNotificationId;

        logger.info(`${this._classInfo}.updateEmailNotification(${id}) [${this._routeName}]`);

        repo.updateEmailNotification(id, emailNotificationId, request.body, (error, result) => {
            if (error) {
                logger.error(`${this._classInfo}.updateEmailNotification() [${this._routeName}]`, error, request.body);
                response.status(500).json(error);
            } else {
                logger.debug(`${this._classInfo}.updateEmailNotification() [${this._routeName}] OK`);
                response.json(result);
            }
        });
    }

    /**
     * Updates a notification action
     * @param {Request} request Request object
     * @param {Response} response Response object
     * @example PUT /api/application/settings/:id/notification/:notificationId/action/:actionId
     */
    updateNotification(request, response) {
        const id = request.params.id;
        const notificationId = request.params.notificationId;

        logger.info(`${this._classInfo}.updateNotification(${id}) [${this._routeName}]`);

        repo.updateNotification(id, notificationId, request.body, (error, result) => {
            if (error) {
                logger.error(`${this._classInfo}.updateNotification() [${this._routeName}]`, error, request.body);
                response.status(500).json(error);
            } else {
                logger.debug(`${this._classInfo}.updateNotification() [${this._routeName}] OK`);
                response.json(result);
            }
        });
    }

    /**
     * Updates a notification action
     * @param {Request} request Request object
     * @param {Response} response Response object
     * @example PUT /api/application/settings/:id/notificationAction/:notificationActionId
     */
    updateNotificationAction(request, response) {
        const id = request.params.id;
        const notificationId = request.params.notificationId;
        const actionId = request.params.actionId;

        logger.info(`${this._classInfo}.updateNotificationAction(${id}) [${this._routeName}]`);

        repo.updateNotificationAction(id, notificationId, actionId, request.body, (error, result) => {
            if (error) {
                logger.error(`${this._classInfo}.updateNotificationAction() [${this._routeName}]`, error, request.body);
                response.status(500).json(error);
            } else {
                logger.debug(`${this._classInfo}.updateNotificationAction() [${this._routeName}] OK`);
                response.json(result);
            }
        });
    }
}

module.exports = ApplicationSettingsController;
