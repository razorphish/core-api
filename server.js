#!/usr/bin/env nodejs
const express = require('express');
const exphbs = require('express-handlebars');
// const hbsHelpers = require('handlebars-helpers');
const hbsLayouts = require('handlebars-layouts');
const cookieParser = require('cookie-parser');
const errorhandler = require('errorhandler');
// const csrf = require('csurf');
const morgan = require('morgan');
const favicon = require('serve-favicon');
const cors = require('cors');
const passport = require('passport');
const webPush = require('web-push');
const router = require('./lib/router');
const database = require('./app/database/connection');
const seeder = require('./app/database/seeder');
const logger = require('./lib/winston.logger');
const webPushConfig = require('./lib/config.loader').webPush;
const authRoutes = require('./app/routes/oAuth2');
const terminate = require('./lib/exit.handler');

let server;
//= ===================================
const app = express();
const port = 3000;

class Server {
  constructor() {
    this.initViewEngine();
    this.initCors();
    this.initPassport();
    this.initExpressMiddleWare();
    this.initCustomMiddleware();
    this.initDbSeeder();
    this.initRoutes();
    this.initWebPush();
    this.start();
  }

  start() {
    server = app.listen(port, () => {
      logger.debug(
        '[%s] Maras.co Server Started! Listening on http://localhost:%d',
        process.env.NODE_ENV,
        port
      );
    });

    module.exports = server;
  }

  /**
   * @description Initialize Cors Engine
   * @author Antonio Marasco
   * @date 2019-05-14
   * @memberof Server
   */
  initCors() {
    const whiteList = [
      'http://localhost', // android
      'capacitor://localhost', // ios
      'http://localhost:3333', // npx cap serve [remove later]
      'http://localhost:8080',
      'http://localhost:3333',
      'http://127.0.0.1:8080',
      'http://localhost:4200',
      'http://localhost:4201', // admin.maras.co
      'http://localhost:4203', // wishlist.maras.co
      'http://localhost:60000',
      'http://localhost:60001',
      'http://admin.biddler.com',
      'https://admin.biddler.com',
      'http://localhost:8100',
      'chrome-extension://aejoelaoggembcahagimdiliamlcdmfm',
      'http://admin.local.biddler.com',
      'https://app.biddler.com',
      'https://admin.maras.co',
      'https://www.maras.co',
      'https://wishlist.maras.co',
      'https://twittles.maras.co',
      'file://'
    ];
    const corsOptions = {
      origin: (origin, callback) => {
        if (whiteList.indexOf(origin) !== -1) {
          logger.debug(`Cors enabled: ${origin}`);
          callback(null, true);
        } else if (origin) {
          logger.error(`origin not allowed: ${origin}`, origin);
          callback(new Error('Not allowed by CORS'));
        } else {
          callback(null, true);
        }
      },
      // methods: 'GET,HEAD,OPTIONS',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      // allowedHeaders:['authorization','content-type',
      // 'X-XSRF-TOKEN','XSRF-TOKEN','SET-COOKIE','COOKIE'],
      optionsSuccessStatus: 200,
      credentials: true
      // preflightContinue: true
    };

    app.use(cors(corsOptions));
    logger.info('...Cors Initialized');
  }

  initCustomMiddleware() {
    if (process.platform === 'win32') {
      // eslint-disable-next-line global-require
      require('readline')
        .createInterface({
          input: process.stdin,
          output: process.stdout
        })
        .on('SIGINT', () => {
          logger.debug('SIGINT: Closing MongoDB connection');
          database.close();
        });
    }

    process.on('SIGINT', () => {
      logger.debug('SIGINT: Closing MongoDB connection');
      database.close();
    });
  }

  initDbSeeder() {
    database.open(() => {
      // Set NODE_ENV to 'development' and uncomment the following if to only run
      // the seeder when in dev mode
      // if (process.env.NODE_ENV === 'development') {
      //  seeder.init();
      // }
      seeder.init();
    });
  }

  initExpressMiddleWare() {
    app.use(favicon(`${__dirname}/public/images/favicon.ico`));
    app.use(express.static(`${__dirname}/public`));
    app.use(morgan('dev'));
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(errorhandler());

    app.use(cookieParser());
    // app.use(cookieParser({
    //   key: "mysite.sid.uid.whatever",
    //   secret: 'secret123', //**SET ENCRYPTED SECRET IN ENV process.env["SESSION_SECRET"],
    //   cookie: {
    //     maxAge: 2678400000 // 31 days
    //   },
    // }));
    // Replace line below with:
    // app.use(csrf({ cookie: false }));

    // Declare public routes BEFORE XSRF so they
    // do not need the xsrf cookie
    this.initPublicRoutes();

    // app.use(csrf({ cookie: true }));

    // // UnCOMMENT WHEN SOLUTION FOUND FOR CSRF
    // app.use((req, res, next) => {
    //   if (req.method === 'OPTIONS') {
    //     console.log('Options');
    //   }
    //   var csrfToken = req.csrfToken();
    //   res.locals._csrf = csrfToken;
    //   res.cookie('XSRF-TOKEN', csrfToken);
    //   // console.log('csrf-token: ' + csrfToken);
    //   next();
    // });
    // process.setMaxListeners(0);
  }

  initPassport() {
    app.use(passport.initialize());
    app.use(passport.session());

    // Start Local Provider
    // eslint-disable-next-line global-require
    require('./app/security/strategies/local');

    logger.info('...Passport Initialized');
  }

  initPublicRoutes() {
    // router.load(app, './publiccontrollers');
    app.post('/oauth/token', authRoutes.token);
    // app.post('/oauth/jwt-token', authRoutesJwt.token);
  }

  initRoutes() {
    router.reset();
    router.load(app, './controllers');

    // redirect all others to the index (HTML5 history)
    app.all('/*', (req, res) => {
      res.sendFile(`${__dirname}/public/index.html`);
    });

    logger.info('...Public Routes Initialized');
  }

  initServerShutdownHandler() {
    const exitHandler = terminate(server, {
      coredump: false,
      timeout: 500
    });

    process.on('uncaughtException', exitHandler(1, 'Unexpected Error'));
    process.on('unhandledRejection', exitHandler(1, 'Unhandled Promise'));
    process.on('SIGTERM', exitHandler(0, 'SIGTERM'));
    process.on('SIGINT', exitHandler(0, 'SIGINT'));

    logger.info('...Server Shutdown Handler Initialized');
  }

  /**
   * @description Inits View Engine of Node
   * @author Antonio Marasco
   * @date 2019-05-14
   * @memberof Server
   */
  initViewEngine() {
    const hbs = exphbs.create({
      extname: '.hbs',
      defaultLayout: 'master'
    });
    app.engine('hbs', hbs.engine);
    app.set('view engine', 'hbs');
    hbsLayouts.register(hbs.handlebars, {});

    logger.info('...View Engine Initialized');
  }

  /**
   * @description Initializes Web Push Notifications service
   * @author Antonio Marasco
   * @date 2019-05-14
   * @memberof Server
   */
  initWebPush() {
    webPush.setGCMAPIKey(webPushConfig.gcmApiKey);
    webPush.setVapidDetails(
      `mailto:${webPushConfig.email}`,
      webPushConfig.publicKey,
      webPushConfig.privateKey
    );

    logger.info('...Web Push Initialized');
  }
}

// eslint-disable-next-line no-unused-vars
const marascoApiServer = new Server();
