#!/usr/bin/env nodejs
const express = require('express'),
  exphbs = require('express-handlebars'),
  hbsHelpers = require('handlebars-helpers'),
  hbsLayouts = require('handlebars-layouts'),
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
  errorhandler = require('errorhandler'),
  csrf = require('csurf'),
  morgan = require('morgan'),
  favicon = require('serve-favicon'),
  router = require('./lib/router'),
  database = require('./app/database/connection'),
  seeder = require('./app/database/seeder'),
  cors = require('cors'),
  passport = require('passport'),
  logger = require('./lib/winston.logger'),
  webPush = require('web-push');
  webPushConfig = require('./lib/config.loader').webPush;
  authRoutes = require('./app/routes/oAuth2');
//authRoutesJwt = require('./app/routes/JWT');
//Antonio
//Instantiate libraries


//====================================

(app = express()), (port = 3002);

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
    module.exports = app.listen(port, err => {
      logger.debug(
        '[%s] Listening on http://localhost:%d',
        process.env.NODE_ENV,
        port
      );
    });
  }

  initCors() {
    var whiteList = [
      'http://localhost:8080',
      'http://localhost:4200',
      'http://localhost:4201', //admin.maras.co
      'http://localhost:4203', //wishlist.maras.co
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
    var corsOptions = {
      origin: (origin, callback) => {
        if (whiteList.indexOf(origin) !== -1) {
          logger.debug(`Cors enabled: ${origin}`);
          callback(null, true);
        } else {
          if (origin) {
            logger.error(`origin not allowed: ${origin}`, origin);
            callback(new Error('Not allowed by CORS'));
          } else {
            callback(null, true);
          }
        }
      },
      //methods: 'GET,HEAD,OPTIONS',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      //allowedHeaders:['authorization','content-type','X-XSRF-TOKEN','XSRF-TOKEN','SET-COOKIE','COOKIE'],
      optionsSuccessStatus: 200,
      credentials: true
      //preflightContinue: true
    };

    app.use(cors(corsOptions));
    logger.debug('Cors Initialized');
  }

  initCustomMiddleware() {
    if (process.platform === 'win32') {
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
      //Set NODE_ENV to 'development' and uncomment the following if to only run
      //the seeder when in dev mode
      //if (process.env.NODE_ENV === 'development') {
      //  seeder.init();
      //}
      seeder.init();
    });
  }

  initExpressMiddleWare() {
    app.use(favicon(__dirname + '/public/images/favicon.ico'));
    app.use(express.static(__dirname + '/public'));
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

    //Declare public routes BEFORE XSRF so they
    //do not need the xsrf cookie
    this.initPublicRoutes();

    //app.use(csrf({ cookie: true }));

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
    //process.setMaxListeners(0);

    process.on('uncaughtException', err => {
      if (err) {
        logger.error('---------========APPLICATION ERROR========---------', err);
      }
    });
  }

  initPassport() {
    app.use(passport.initialize());
    app.use(passport.session());

    //Start Local Provider
    require('./app/security/strategies/local');
  }

  initPublicRoutes() {
    //AM TODO
    //router.load(app, './publiccontrollers');
    app.post('/oauth/token', authRoutes.token);
    //app.post('/oauth/jwt-token', authRoutesJwt.token);
  }

  initSecureRoutes() {
    router.reset();
    router.load(app, './controllers');

    // redirect all others to the index (HTML5 history)
    app.all('/*', (req, res) => {
      res.sendFile(__dirname + '/public/index.html');
    });
  }

  initViewEngine() {
    const hbs = exphbs.create({
      extname: '.hbs',
      defaultLayout: 'master'
    });
    app.engine('hbs', hbs.engine);
    app.set('view engine', 'hbs');
    hbsLayouts.register(hbs.handlebars, {});
  }

  initWebPush() {
    webPush.setVapidDetails(
      `mailto:${webPushConfig.email}`,
      webPushConfig.publicKey,
      webPushConfig.privateKey);
  }
}

var server = new Server();