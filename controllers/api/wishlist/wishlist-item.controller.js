'use strict';
/**
 * Wishlist Api
 */
const async = require('async');
const passport = require('passport');

const repo = require('../../../app/database/repositories/wishlist/wishlist-item.repository');
const wishlistRepo = require('../../../app/database/repositories/wishlist/wishlist.repository');
const wishlistAppRepo = require('../../../app/database/repositories/wishlist/wishlist-app-settings.repository');
const utils = require('../../../lib/utils');
const logger = require('../../../lib/winston.logger');
const appConfig = require('../../../lib/config.loader').app;
const webPush = require('web-push');
const apnPush = require('apn');
const apnProvider = require('../../../lib/apnLibrary').apnProvider;
const WISHLIST_ITEM_ADDED = 'wishlist-item-added';
const WISHLIST_ITEM_REMOVED = 'wishlist-item-removed';
const mandrill = require('../../../lib/mandrill.library').mandrill;

/**
 * Wishlist Api Controller
 * http://.../api/wishlist/:id/item
 * @author Antonio Marasco
 */
class WishlistItemController {

  /**
   * Constructor for Wishlist
   * @param {router} router Node router framework
   * @example let controller = new WishlistController(router);
   */
  constructor(router) {
    router.get(
      '/:id/item',
      //passport.authenticate('user-bearer', { session: false }),
      //utils.isInRole('admin'),
      this.all.bind(this)
    );

    router.get(
      '/:id/item/page/:skip/:top',
      passport.authenticate('user-bearer', { session: false }),
      utils.isInRole('admin'),
      this.allPaged.bind(this)
    );

    router.get(
      '/:id/item/:itemId',
      passport.authenticate('user-bearer', { session: false }),
      utils.isInRole(['admin', 'user']),
      this.get.bind(this)
    );

    router.post(
      '/:id/item',
      passport.authenticate('user-bearer', { session: false }),
      //utils.isInRole('admin'),
      this.insert.bind(this)
    );

    router.put(
      '/:id/item/:itemId',
      passport.authenticate('user-bearer', { session: false }),
      //utils.isInRole(['admin', 'user']),
      this.update.bind(this)
    );

    router.post(
      '/:id/item/:itemId/sort',
      passport.authenticate('user-bearer', { session: false }),
      //utils.isInRole(['admin', 'user']),
      this.sort.bind(this)
    );

    router.delete(
      '/:id/item/:itemId',
      passport.authenticate('user-bearer', { session: false }),
      //utils.isInRole('admin'),
      this.delete.bind(this)
    );

    //Logging Info
    this._classInfo = '*** [wishlist-item].controller';
    this._routeName = '/api/wishlist/:id/item';

  }

  /**
   * Gets all Wishlist
   * @param {Request} [request] Request object
   * @param {Response} response Response
   * @example GET /api/wishlist/:id/item
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
        logger.debug(`${this._classInfo}.all() [${this._routeName}] OK`, result);
        response.json(result);
      }
    });
  }

  /**
   * Gets all Wishlist paginated
   * @param {Request} request Request object {Default:10}
   * @param {Request} [request.params.top=10]
   * @param {Response} response Response
   * @example /api/wishlist/page/2/10
   * @description /api/wishlist/:id/item/page/{page number}/{# per page}
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
        logger.debug(`${this._classInfo}.allPaged() [${this._routeName}] OK`, result);
        response.json(result);
      }
    });
  }

  /**
   * Deletes a wishlist
   * @param {Request} request Request object
   * @param {Response} response Response object
   * @example DELETE /api/wishlist/:id/item/:itemId
   * @returns {status: true|false} via res pointer
   */
  delete(request, response) {
    const id = request.params.id;
    const itemId = request.params.itemId;
    // logger.info(`${this._classInfo}.delete(${id}) [${this._routeName}]`);

    // repo.delete(id, (error, result) => {
    //   if (error) {
    //     logger.error(`${this._classInfo}.delete() [${this._routeName}]`, error);
    //     response.status(500).json(error);
    //   } else {
    //     logger.debug(`${this._classInfo}.delete() [${this._routeName}] OK`, result);
    //     response.json(result);
    //   }
    // });
    // const id = request.params.id; //wishlist id
    // const itemId = request.params.itemId; //wishlist item id

    logger.info(`${this._classInfo}.delete(${id}, ${itemId}) [${this._routeName}]`);
    request.body.statusId = 'deleted';
    const wishlistId = request.body.wishlistId;

    // repo.update(itemId, request.body, (error, result) => {
    //   if (error) {
    //     logger.error(`${this._classInfo}.delete() [${this._routeName}]`, error, request.body);
    //     response.status(500).send(error);
    //   } else {
    //     logger.debug(`${this._classInfo}.delete() [${this._routeName}] OK`, result);
    //     response.json(result);
    //   }
    // });

    async.waterfall([
      (done) => {
        repo.update(itemId, request.body, (error, result) => {
          if (error) {
            logger.error(`${this._classInfo}.delete() [${this._routeName}]`, error, request.body);
            response.status(500).send(error);
          } else {
            logger.debug(`${this._classInfo}.delete() [${this._routeName}] OK`, result);
            done(null, result);
          }
        });
      },
      (itemDeleted, done) => {
        wishlistRepo.getDetails(itemDeleted.wishlistId._id, (error, wishlist) => {
          if (error) {
            logger.error(`${this._classInfo}.delete()::Wishlist.get() [${this._routeName}]`, error);
            response.status(500).send(error);
          } else {
            if (wishlist) {
              done(null, wishlist, itemDeleted);
            } else {
              response.status(500).send('Invalid wishlist Id');
            }
          }
        });
      },
      (wishlist, itemDeleted, done) => {
        //Send email Notifications
        if (wishlist.preferences.notifyOnRemoveItem) {
          //Get app settings
          wishlistAppRepo.get(appConfig.wishlistPremiere, (error, data) => {
            if (error) {
              logger.error(`${this._classInfo}.delete()::Wishlist.get() [${this._routeName}]`, error);
              response.status(500).send(error);
            } else {

              //wishlist-item-removed
              const payload = data.emailNotifications.find((element) => {
                return element.name === WISHLIST_ITEM_REMOVED
              });

              for (var i = 0, len = wishlist.follows.length; i < len; i++) {
                if (wishlist.follows[i].notifiedOnRemoveItem) {
                  var html_content = payload.html.replace(/##ITEMNAME##/g, itemDeleted.name);
                  var text_content = payload.text.replace(/##ITEMNAME##/g, itemDeleted.name);

                  var message = {
                    to: [{
                      email: wishlist.userId.email,
                      name: `${wishlist.userId.firstName} ${wishlist.userId.lastName}`,
                      type: 'to'
                    }],
                    important: false,
                    from_email: payload.fromEmailAddress,
                    from_name: payload.fromName,
                    subject: payload.subject.replace(/##WISHLISTNAME##/g, wishlist.name),
                    text: html_content,
                    html: text_content
                  };

                  mandrill.messages.send({ message: message, async: false }, (data) => {
                    logger.debug(`${this._classInfo}.delete()::WishlistItem [${this._routeName}] MESSAGE REQUESTED`, data);
                    let emailResult = data[0];

                    if (emailResult.status !== 'sent') {

                    };
                  }, (error) => {
                    done(error)
                  });

                }
              }

              done(null, wishlist, itemDeleted, data);
            }
          });
        } else {
          done(null, wishlist, itemDeleted, null);
        }
      },
      (wishlist, itemDeleted, wishlistApp, done) => {
        //Send device Notifications
        if (wishlist.preferences.notifyOnRemoveItem) {
          //wishlist-item-added
          const payload = wishlistApp.notifications.find((element) => {
            return element.name === WISHLIST_ITEM_REMOVED
          });

          for (var i = 0, len = wishlist.follows.length; i < len; i++) {
            if (wishlist.follows[i].notifiedOnRemoveItem) {

              for (var i = 0, len = wishlist.follows[i].userId.notifications.length; i < len; i++) {
                const pushSubscription = {
                  endpoint: wishlist.follows[i].userId.notifications.endpoint,
                  keys: {
                    p256dh: wishlist.follows[i].userId.notifications.keys.p256dh,
                    auth: wishlist.follows[i].userId.notifications.keys.auth
                  }
                };

                const pushPayload = {
                  title: payload.title.replace(/##WISHLISTNAME##/g, wishlist.name),
                  dir: payload.dir,
                  lang: payload.lang,
                  body: payload.body,
                  message: payload.message,
                  url: payload.url,
                  ttl: payload.ttl,
                  icon: payload.icon,
                  image: payload.image,
                  badge: payload.badge,
                  tag: payload.tag,
                  vibrate: payload.vibrate,
                  renotify: payload.renotify,
                  silent: payload.silent,
                  requireInteraction: payload.requireInteraction,
                  actions: payload.actions
                };

                webPush.sendNotification(pushSubscription, JSON.stringify(pushPayload))
                  .then((result) => {
                    logger.info(result);
                  })
                  .catch((error) => {
                    logger.error(`${this._classInfo}.pushNotification() [${this._routeName}]`, error);
                    // if it errors out carry on
                    //response.status(500).json(error);
                  });
              }
            }
          }

          done(null, itemDeleted);

        } else {
          done(null, itemDeleted);
        }
      }
    ], (error, result) => {
      if (error) {
        logger.error(`${this._classInfo}.delete() [${this._routeName}]`, error);
        return next(error)
      }
      logger.debug(`${this._classInfo}.delete() [${this._routeName}] OK`);
      response.json(result);
    })
  }

  /**
   * Gets a Wishlist by its id
   * @param {Request} request Request object
   * @param {Response} response Response
   * @example GET /api/wishlist/:id/item/:itemId
   */
  get(request, response) {
    const id = request.params.id;
    logger.info(`${this._classInfo}.get(${id}) [${this._routeName}]`);

    repo.get(id, (error, result) => {
      if (error) {
        logger.error(`${this._classInfo}.get() [${this._routeName}]`, error);
        response.status(500).send(error)
      } else {
        logger.debug(`${this._classInfo}.get() [${this._routeName}] OK`, result);
        response.json(result);
      }
    });
  }

  /**
   * Inserts a wishlist
   * @param {Request} request Request object
   * @param {Response} response Response
   * @example POST /api/wishlist/:id/item
   */
  insert(request, response, next) {
    logger.info(`${this._classInfo}.insert() [${this._routeName}]`);
    const wishlistId = request.body.wishlistId;

    async.waterfall([
      (done) => {
        repo.byWishlistId(wishlistId, (error, data) => {
          let itemCount = 0;
          if (error) {
            logger.error(`${this._classInfo}.insert() [${this._routeName}]`, error);
            response.status(500).send(error);
          } else {
            if (data) {
              itemCount = data.length;
            }

            done(null, itemCount)
          }
        })
      },
      (itemCount, done) => {
        request.body.sortOrder = itemCount;

        repo.insert(request.body, (error, result) => {
          if (error) {
            logger.error(`${this._classInfo}.insert() [${this._routeName}]`, error);
            response.status(500).send(error);
          } else {
            logger.debug(`${this._classInfo}.insert() [${this._routeName}] OK`, result);
            return done(null, result)
          }
        });
      },
      (newItem, done) => {
        wishlistRepo.getDetails(wishlistId, (error, wishlist) => {
          if (error) {
            logger.error(`${this._classInfo}.insert()::Wishlist.get() [${this._routeName}]`, error);
            response.status(500).send(error);
          } else {
            done(null, wishlist, newItem);
          }
        });
      },
      (wishlist, newItem, done) => {
        //Send email Notifications
        if (wishlist.preferences.notifyOnAddItem) {
          //Get app settings
          wishlistAppRepo.get(appConfig.wishlistPremiere, (error, data) => {
            if (error) {
              logger.error(`${this._classInfo}.insert()::Wishlist.get() [${this._routeName}]`, error);
              response.status(500).send(error);
            } else {

              //wishlist-item-added
              const payload = data.emailNotifications.find((element) => {
                return element.name === WISHLIST_ITEM_ADDED
              });

              for (var i = 0, len = wishlist.follows.length; i < len; i++) {
                if (wishlist.follows[i].notifiedOnAddItem) {
                  var html_content = payload.html.replace(/##ITEMNAME##/g, newItem.name);
                  var text_content = payload.text.replace(/##ITEMNAME##/g, newItem.name);

                  var message = {
                    to: [{
                      email: wishlist.userId.email,
                      name: `${wishlist.userId.firstName} ${wishlist.userId.lastName}`,
                      type: 'to'
                    }],
                    important: false,
                    // from_email: mandrillConfig.from_email,
                    // from_name: mandrillConfig.from_name,
                    from_email: payload.fromEmailAddress,
                    from_name: payload.fromName,
                    subject: payload.subject.replace(/##WISHLISTNAME##/g, wishlist.name),
                    text: html_content,
                    html: text_content
                  };

                  mandrill.messages.send({ message: message, async: false }, (data) => {
                    logger.debug(`${this._classInfo}.insert()::WishlistItem [${this._routeName}] MESSAGE REQUESTED`, data);
                    let emailResult = data[0];

                    if (emailResult.status !== 'sent') {
                      //response.status(500).send(new Error(email.reject_reason));
                    }

                    //return done(null, wishlist, newItem, data);
                  }, (error) => {
                    done(error)
                  });

                }
              }

              done(null, wishlist, newItem, data);
            }
          });
        } else {
          done(null, wishlist, newItem, null);
        }
      },
      (wishlist, newItem, wishlistApp, done) => {
        //Send device Notifications
        if (wishlist.preferences.notifyOnAddItem) {
          //wishlist-item-added
          const payload = wishlistApp.notifications.find((element) => {
            return element.name === WISHLIST_ITEM_ADDED
          });

          if (!!wishlist.follows) {
            for (var i = 0, len = wishlist.follows.length; i < len; i++) {
              if (wishlist.follows[i].notifiedOnAddItem) {

                if (!!wishlist.follows[i].userId.notifications) {
                  for (var i = 0, len = wishlist.follows[i].userId.notifications.length; i < len; i++) {

                    //Android/Web 
                    if (!!wishlist.follows[i].userId.notifications.endpoint) {
                      const pushSubscription = {
                        endpoint: wishlist.follows[i].userId.notifications.endpoint,
                        keys: {
                          p256dh: wishlist.follows[i].userId.notifications.keys.p256dh,
                          auth: wishlist.follows[i].userId.notifications.keys.auth
                        }
                      };

                      const pushPayload = {
                        title: payload.title.replace(/##WISHLISTNAME##/g, wishlist.name),
                        dir: payload.dir,
                        lang: payload.lang,
                        body: payload.body,
                        message: payload.message,
                        url: payload.url,
                        ttl: payload.ttl,
                        icon: payload.icon,
                        image: payload.image,
                        badge: payload.badge,
                        tag: payload.tag,
                        vibrate: payload.vibrate,
                        renotify: payload.renotify,
                        silent: payload.silent,
                        requireInteraction: payload.requireInteraction,
                        actions: payload.actions
                      };

                      webPush.sendNotification(pushSubscription, JSON.stringify(pushPayload))
                        .then((result) => {
                          logger.info(result);
                        })
                        .catch((error) => {
                          logger.error(`${this._classInfo}.pushNotification() [${this._routeName}]`, error);
                          // if it errors out carry on
                          //response.status(500).json(error);
                        });
                    } else {
                      let deviceToken = wishlist.follows[i].userId.notifications.token;

                      var note = new apnPush.Notification();

                      note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
                      note.badge = 3;
                      note.sound = "ping.aiff";
                      note.alert = `\uD83D\uDCE7 \u2709 Item added to ${wishlist.name}`;
                      note.payload = { 'messageFrom': 'Wishlist Premiere' };
                      note.topic = "<your-app-bundle-id>";

                      apnProvider.send(note, deviceToken).then((result) => {
                        // see documentation for an explanation of result
                      });
                    }
                  }
                }
              }
            }
          }

          done(null, newItem);

        } else {
          done(null, newItem);
        }
      }
    ], (error, result) => {
      if (error) {
        logger.error(`${this._classInfo}.insert() [${this._routeName}]`, error);
        return next(error)
      }
      logger.debug(`${this._classInfo}.insert() [${this._routeName}] OK`);
      response.json(result);
    })
  }

  /**
   * @description Updates a wishlist
   * @author Antonio Marasco
   * @date 2019-05-09
   * @param {*} request
   * @param {*} response
   * @memberof WishlistItemController
   */
  update(request, response) {
    const id = request.params.id; //wishlist id
    const itemId = request.params.itemId; //wishlist item id

    logger.info(`${this._classInfo}.update(${id}, ${itemId}) [${this._routeName}]`);

    repo.update(itemId, request.body, (error, result) => {
      if (error) {
        logger.error(`${this._classInfo}.update() [${this._routeName}]`, error, request.body);
        response.status(500).send(error);
      } else {
        logger.debug(`${this._classInfo}.update() [${this._routeName}] OK`, result);
        response.json(result);
      }
    });
  }

  /**
   * Sorts a wishlist
   * @param {Request} request Request object
   * @param {Response} response Response object
   * @example PUT /api/wishlist/:id/item/:itemId
   */
  sort(request, response, next) {
    const wishlistId = request.params.id; //wishlist id
    const itemId = request.params.itemId; //wishlist item id

    logger.info(`${this._classInfo}.sort(${wishlistId}) [${this._routeName}]`);

    async.waterfall([
      (done) => {
        repo.byWishlistId(wishlistId, (error, result) => {
          if (error) {
            logger.error(`${this._classInfo}.sort() [${this._routeName}]`, error);
            response.status(500).send(error);
          } else {
            done(null, result);
          }
        })
      },
      (wishlistItems, done) => {
        const rangeIndex = request.body.oldIndex - request.body.newIndex;
        const oldIndex = request.body.oldIndex;
        const newIndex = request.body.newIndex;
        const sortIncrementUp = rangeIndex > -1

        wishlistItems.forEach((wishlistItem) => {
          let sortOrder = wishlistItem.sortOrder;

          if (wishlistItem.sortOrder === oldIndex) {
            wishlistItem.sortOrder = newIndex;
          } else {
            if (sortIncrementUp) {
              if (sortOrder >= newIndex && sortOrder < oldIndex) {
                wishlistItem.sortOrder = sortOrder + 1;
              }
            } else {
              if (sortOrder > oldIndex && sortOrder <= newIndex) {
                wishlistItem.sortOrder = sortOrder - 1;
              }
            }
          }
        })

        return done(null, wishlistItems);
      },
      (sortedWishlistItems, done) => {

        repo.sort(sortedWishlistItems, (error, data) => {
          if (error) {
            logger.error(`${this._classInfo}.sort() [${this._routeName}]`, error);
            response.status(500).send(error);
          } else {
            done(null, sortedWishlistItems);
          }
        })
      },
      (updatedWishlistItems, done) => {
        updatedWishlistItems.sort((a, b) => (a.sortOrder > b.sortOrder) ? 1 : ((b.sortOrder > a.sortOrder) ? -1 : 0));
        done(null, updatedWishlistItems);
      }
    ], (error, result) => {
      if (error) {
        logger.error(`${this._classInfo}.insert() [${this._routeName}]`, error);
        return next(error)
      }
      logger.debug(`${this._classInfo}.insert() [${this._routeName}] OK`);
      response.json(result);
    })

  }

  sendEmailNotification(wishlistFollow, notificationEmailPayload) {
    console.log(wishlistFollow);
    console.log(notificationEmailPayload);
  }

  sendNotification(wishlistFollow, notificationsPayload) {

    for (var i = 0, len = wishlistFollow.userId.notifications.length; i < len; i++) {
      const pushSubscription = {
        endpoint: wishlistFollow.userId.notifications.endpoint,
        keys: {
          p256dh: wishlistFollow.userId.notifications.keys.p256dh,
          auth: wishlistFollow.userId.notifications.keys.auth
        }
      };

      const pushPayload = {
        title: notificationsPayload.title,
        dir: notificationsPayload.dir,
        lang: notificationsPayload.lang,
        body: notificationsPayload.body,
        message: notificationsPayload.message,
        url: notificationsPayload.url,
        ttl: notificationsPayload.ttl,
        icon: notificationsPayload.icon,
        image: notificationsPayload.image,
        badge: notificationsPayload.badge,
        tag: notificationsPayload.tag,
        vibrate: notificationsPayload.vibrate,
        renotify: notificationsPayload.renotify,
        silent: notificationsPayload.silent,
        requireInteraction: notificationsPayload.requireInteraction,
        actions: notificationsPayload.actions
      };

      webPush.sendNotification(pushSubscription, JSON.stringify(pushPayload))
        .then((result) => {
          logger.info(result);
        })
        .catch((error) => {
          logger.error(`${this._classInfo}.pushNotification() [${this._routeName}]`, error);
          //response.status(500).json(error);
        });
    }
  }
}

module.exports = WishlistItemController;
