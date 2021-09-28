#!/usr/bin/env nodejs
const express = require('express');
const exphbs = require('express-handlebars');
// const hbsHelpers = require('handlebars-helpers');
const hbsLayouts = require('handlebars-layouts');
const bodyParser = require('body-parser');
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
// authRoutesJwt = require('./app/routes/JWT');
// Antonio
// Instantiate libraries

//= ===================================

// eslint-disable-next-line no-unused-expressions
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
    this.initSecureRoutes();
    this.initWebPush();
    this.start();
  }

  start() {
    module.exports = app.listen(port, () => {
      logger.debug(
        '[%s] Listening on http://localhost:%d',
        process.env.NODE_ENV,
        port
      );
    });
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
    logger.debug('Cors Initialized');
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
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
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

    process.on('uncaughtException', (err) => {
      if (err) {
        logger.error(
          '---------========APPLICATION ERROR========---------',
          err
        );
      }
    });
  }

  initPassport() {
    app.use(passport.initialize());
    app.use(passport.session());

    // Start Local Provider
    // eslint-disable-next-line global-require
    require('./app/security/strategies/local');
  }

  initPublicRoutes() {
    // AM TODO
    // router.load(app, './publiccontrollers');
    app.post('/oauth/token', authRoutes.token);
    // app.post('/oauth/jwt-token', authRoutesJwt.token);
  }

  initSecureRoutes() {
    router.reset();
    router.load(app, './controllers');

    // redirect all others to the index (HTML5 history)
    app.all('/*', (req, res) => {
      res.sendFile(`${__dirname}/public/index.html`);
    });
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
  }
}

// eslint-disable-next-line no-unused-vars
const server = new Server();
