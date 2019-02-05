module.exports = {
    /**
     * Application configuration section
     * http://pm2.keymetrics.io/docs/usage/application-declaration/
     */
    apps : [
  
      // First application
      {
        name      : 'api.maras.co',
        script    : 'server.js',
        watch : true,
        ignore_watch : ["node_modules", "logs", "./package-lock.json"],
        watch_options: {
          followSymlinks: false
        },
        env: {
          MARASCO_LOG: 'true',
          NODE_ENV: "production",
        },
        env_production : {
          NODE_ENV: 'production'
        },
        exec_mode: 'cluster',
        instances: 0
      }
    ],
  
    /**
     * Deployment section
     * http://pm2.keymetrics.io/docs/usage/deployment/
     */
    deploy : {
      production : {
        user : 'node',
        host : ['192.241.195.22'],
        ref  : 'origin/master',
        repo : 'https://github.com/razorphish/core-api',
        path : '/var/www/api.maras.co/html',
        'post-deploy' : 'npm install && pm2 reload ecosystem.production.config.js --env production',
        'post-setup': 'ls -la',
        env  : {
          NODE_ENV: 'production'
        }
      }
    }
  };
  