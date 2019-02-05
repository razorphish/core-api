[![Build Status](https://travis-ci.org/razorphish/core-api.svg?branch=master)](https://travis-ci.org/razorphish/core-api)

[![Coverage Status](https://coveralls.io/repos/github/razorphish/core-api/badge.svg)](https://coveralls.io/github/razorphish/core-api)

# Marasco Api
=========

Core api library for all Maras,co based apis

## Installation

  `npm install @marasco/core-api`

## Getting Started

> These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites
* [Install Nginx (Web Server)](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-16-04)

* [Install NodeJS](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-16-04)

* [Server Blocks (Web server)](https://www.digitalocean.com/community/tutorials/how-to-set-up-nginx-server-blocks-virtual-hosts-on-ubuntu-16-04)

## Setup Git
Follow the instructions below to setup git for [deployments](https://stackoverflow.com/questions/6448242/git-push-error-insufficient-permission-for-adding-an-object-to-repository-datab)

* [Automatic git deployments](https://www.digitalocean.com/community/tutorials/how-to-set-up-automatic-deployment-with-git-with-a-vps)


> use : auto_node_dev_admin in dev | auto_node_qa_admin in qa for 'groupname'.  

```
$ cd /path/to/repo.git [/var/repo]
$ git config core.sharedRepository
$ sudo git config core.sharedRepository group
$ sudo chgrp -R groupname .
$ sudo chmod -R g+rwX .
$ find . -type d -exec chmod g+s '{}' +
```

### After repository is set up go to project location

```
$ sudo chown -R root:auto_node_dev_admin /var/www/*.axis.epsilonrms.com/html
$ sudo chmod -R g+rw /var/www/   
```

## Checking in code
> Follow basic instructions to check in your code
```
$ git add .
$ git commit -m "My project is ready"
$ git push 
```

## Verion Numbers
> Use following commands to update version number 
```
$ npm version patch|major|minor|premajor|preminor| -m "Version %s - add sweet badges"
$git push && git push --tags
$ npm publish
```

## Remote Deployments

### Git Remotes
> Check Remotes to see which ones you have installed
```
$ git remote -v   
```

### Flush pm2 logs
> Set access, flush logs and monitor activity
```
$ sudo chmod -R 775 logs
$ sudo pm2 flush
$ sudo pm2 monit
```

### Load Balancing Servers. 
> Set up multiple remote servers for single deployment (i.e. QA, Staging, Production).   You'll need to set this up locally on your desktop

```
$ git remote add [name_of_remote] ssh://[git_repo]/[repo].git
$ git remote set-url --add --push [name_of_remote] [original repo URL]
$ git remote set-url --add --push [name_of_remote] [second repo URL]

$ ##Example (Multiple Servers, Cluster)
$ git remote add staging ssh://root@www.maras.co/var/repo/www.maras.co.git
$ git remote set-url --add --push staging ssh://root@172.23.5.251/var/repo/www.maras.co.git
$ git remote set-url --add --push staging ssh://root@172.23.5.250/var/repo/www.maras.co.git
$ git remote -v
```


### NGINX Enable 
```
$ sudo ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/
```

## Useful linux commands
```
$ lsb_release -a : Gets OS of linux system
$
$ /*Set environment variable*/
$ sudo echo export NODE_ENV=production >> ~/.bash_profile
$ source ~/.bash_profile
$
```


### **EADDRINUSE** error
> The first command retrieves a list of services with Process ID (PID).  Use the PID in the
subsequent call to kill the process
```
$ ps aux | grep node
$ kill -
```

## Create/Start **pm2** services
> Use the first set of commands with the project's ecosystem file.  This file
will handle all the configurations available to that project.
```
$ cd /var/www/your/web/location
$ sudo pm2 start ecosysystem.config.js 
```

### More about EcoSystem.Config
The ecosystem files that are included in this project provide an extremely resourceful way of starting and creating
NodeJs services that can be optimized to fit each server's environment.  To learn more about Ecosystem please click
[here](http://pm2.keymetrics.io/docs/usage/deployment/).

> Manual options
```
$ sudo pm2 start /var/www/api.maras.co/html/server.js -n api.maras.co --ignore-watch="node_modules" --watch -i 0 
$ sudo pm2 start /var/www/api.maras.co/html/server.js -n api.maras.co -i 0 
```

### PM2 Startup/Unexpected shutoffs
In order for pm2 to run after a reboot or unexpected shutdown you will need to execute the following commands.
```
$ sudo pm2 startup
$ sudo pm2 save
$ sudo pm2 show 0 
```

### Update PM2 after Update Node version
```
cd /to/root/of/your/project
npm rebuild
npm i -g pm2 && pm2 update
```

The first command 'sudo pm2 startup' will analyze your pm2 processes and provide you with a command to run 
in order to make the startup script official.  Typically, the command will just 'sudo pm2 save' which will
save the reboot script in a dump file.  In addition, it will also give you a command to remove the script.
Typically, this is 'sudo pm2 unstartup systemd'.

### Set Git username
This link shows how to change your repository check-in name globally as well as per project
[Setting your Git username](https://help.github.com/articles/setting-your-username-in-git/)

## JWT

https://stackoverflow.com/questions/40595895/how-can-i-generate-the-private-and-public-certificates-for-jwt-with-rs256-algori
You can generate them by installing and using the Cygwin package: http://www.cygwin.com.

### Generate Private Keys Using the following commands:

 1. Generating a Private Key:
 2. Generating a Public Key:

```
$ openssl genrsa -aes256 -out private_key.pem 2048
$ openssl rsa -pubout -in private_key.pem -out public_key.pem
```

### JWT Token Format [header.payload.signature]
~~~
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9           // header
.eyJrZXkiOiJ2YWwiLCJpYXQiOjE0MjI2MDU0NDV9      // payload
.eUiabuiKv-8PYk2AkGY4Fb5KMZeorYBLw261JPQD5lM   // signature
~~~

```
$ 'C:\Program Files\OpenSSL-Win64\bin\openssl.exe' genrsa -out private.pem 1024
$ 'C:\Program Files\OpenSSL-Win64\bin\openssl.exe' rsa -in private.pem -out public.pem -outform PEM -pubout
$ echo -n "RaC0nt@Ur1+2" | & 'C:\Program Files\OpenSSL-Win64\bin\openssl.exe' dgst -RSA-SHA256 -sign private.pem > signed
```

### OR you can just the tools below
https://report-uri.com/home/pem_decoder

https://jwt.io

```json
{
  "username": "myusername",
  "grant_type":"urn:ietf:params:oauth:grant-type:jwt-bearer",
  "assertion": "",
  "client_id": "core-web-ui",
  "client_secret": ""
}
```

### JWT Token Object
**iss**: (issuer) claim identifies the principal that issued the JWT (String/URI value:Case-sensitive:Optional)  

**sub**: (subject) claim identifies the principal that is the subject of the JWT. The claims in a JWT are normally statements about the subject.  The subject value MUST either be scoped to be locally unique in the context of the issuer or be globally unique (App Specific:case-sensitive:Optional)

**aud**: (audience) claim identifies the recipients that the JWT is
   intended for.Each principal intended to process the JWT MUST
   identify itself with a value in the audience claim.  If the principal processing the claim does not identify itself with a value in the "aud" claim when this claim is present, then the JWT MUST be rejected.  In the general case, the "aud" value is an array of case-sensitive strings, each containing a StringOrURI value.  In the special case when the JWT has one audience, the "aud" value MAY be a single case-sensitive string containing a StringOrURI value.  The interpretation of audience values is generally application specific. Use of this claim is OPTIONAL.
**exp**: This will probably be the registered claim most often used. This will define the expiration in NumericDate value. The expiration MUST be after the current date/time.

**nbf**: Defines the time before which the JWT MUST NOT be accepted for processing

**iat**: The time the JWT was issued. Can be used to determine the age of the JWT

**jti**: Unique identifier for the JWT. Can be used to prevent the JWT from being replayed. This is helpful for a one time use token.

## Authors

* **Antonio Marasco** - *Initial work* - david@maras.co

See also the list of [contributors](https://github.com//contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Maras,co Development Team