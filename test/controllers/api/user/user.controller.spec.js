//During the test the env variable is set to test
process.env.NODE_ENV = 'test';


const User = require('../../../../app/database/repositories/account/user.repository');
const UserModel = require('../../../../app/database/models/account/user.model');
const DB = require('../../../../app/database/connection');
const fs = require('fs');

//Require the dev-dependencies
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const chai = require('chai');
const chaiHttp = require('chai-http');
const spies = require('chai-spies');

const server = require('../../../../server');
const should = chai.should();

let liveUser = {};
const origin = 'http://localhost:4200';

const readJson = (path, done) => {
    fs.readFile(require.resolve(path), (err, data) => {
        if (err) {
            done(err);
        }
        else {
            done(null, JSON.parse(data));
        }
    });
}


chai.use(chaiHttp);
chai.use(spies);
//Our parent block
describe('Users', () => {

    before((done) => { //Before each test we empty the database
        DB.open(done);
    });

    beforeEach((done) => {
        DB.drop((err) => {
            if (err) {
                return done(err);
            }
            var fixtures;
            readJson('../../../fixtures/client-user.model.fixture.json',
                (err, data) => {
                    fixtures = data;
                    DB.fixtures(fixtures, done);
                });

        });
    });

    beforeEach((done) => {
        let clientId = 'core-web-ui';
        let clientSecret = 'E89fZK0oQnEuMWuqRhpNZG5ObexOw81RdnWHnSIuQVjaei3bag4kq' +
            'nSyPXIrAi5gpYQcPU98leY1J5eL1sQUrUCRjS3SdZlMK1vSSv1kORtDqaxdYslVMe8uCBxk4Np' +
            'PkwFkiWB8ywHnAjXBZpRdXHry8Aj19KS7XQUvi3DVW953MqCJgipQm76Lw8rNfAl1oQMyjPyBV' +
            'cGKGecaevaz5bKulZWKx6m0sFKbNs2eT6FDiOfTuF25IHgKymnnoaCF';
        let username = 'david@maras.co';
        const password = 'Letme1n!';

        //this.timeout(15000);
        chai.request(server)
            .post('/oauth/token')
            .type('form')
            .set('origin', origin)
            .send({
                '_method': 'post',
                'username': username,
                'password': password,
                'client_id': clientId,
                'client_secret': clientSecret,
                'grant_type': 'password',
            })
            .end((err, res) => {
                liveUser = res.body;
                done();
            });
    });

    /*
    `    * Test the /GET route
     */
    describe('Endpoints', function () {

        it('should GET all the Users', (done) => {
            chai.request(server)
                .get('/api/user')
                .set({
                    'origin': origin,
                    'Content-Type': 'application/json',
                    'Authorization': `bearer ${liveUser.access_token}`,
                })
                .end((err, response) => {
                    response.should.have.status(200);
                    response.should.be.json;
                    response.body.should.be.a('array');
                    response.body.length.should.be.eql(2);
                    done();
                });
        });

        it('should GET all the Users Paged', (done) => {

            chai.request(server)
                .get('/api/user/page/0/2')
                .set({
                    'origin': origin,
                    'Content-Type': 'application/json',
                    'Authorization': `bearer ${liveUser.access_token}`,
                })
                .end((err, response) => {
                    response.should.have.status(200);
                    response.should.be.json;
                    response.body.should.be.a('array');
                    response.body.should.have.length(2);
                    done();
                });
        });

        it('should GET a User', (done) => {

            User.all((err, result) => {
                chai.request(server)
                    .get(`/api/user/${result[0]._id}`)
                    .set({
                        'origin': origin,
                        'Content-Type': 'application/json',
                        'Authorization': `bearer ${liveUser.access_token}`,
                    })
                    .end((err, response) => {
                        response.should.have.status(200);
                        response.should.be.json;
                        response.body.should.be.a('object');
                        response.body._id.should.equal(result[0]._id.toString());
                        done();
                    });
            });
        });

        it('should ADD a User', (done) => {

            chai.request(server)
                .post(`/api/user`)
                .set({
                    'origin': origin,
                    'Content-Type': 'application/json',
                    'Authorization': `bearer ${liveUser.access_token}`,
                })
                .send({
                    firstName: 'Snoop',
                    lastName: 'Doggy Dogg',
                    email: 'snoop@doggydogg.com',
                    email_lower: 'snoop@doggydog.com',
                    username: 'snoopdoggy',
                    username_lower: 'snoopdiggy',
                    password: 'Letme1n!',
                    status: 'active'
                })
                .end((err, response) => {
                    response.should.have.status(200);
                    response.should.be.json;

                    User.all((err, result) => {
                        result.length.should.eql(3);
                        done();
                    });
                });
        });

        it('should GET a User by roles', (done) => {
            chai.request(server)
                .get(`/api/user/roles/Admin`)
                .set({
                    'origin': origin,
                    'Content-Type': 'application/json',
                    'Authorization': `bearer ${liveUser.access_token}`,
                })
                .end((err, response) => {
                    response.should.have.status(200);
                    response.should.be.json;
                    response.body.should.be.a('array');
                    response.body.length.should.equal(1);
                    done();
                });
        });

        it('should DELETE A USER', (done) => {

            User.all((err, result) => {
                chai.request(server)
                    .del(`/api/user/${result[0]._id}`)
                    .set({
                        'origin': origin,
                        'Content-Type': 'application/json',
                        'Authorization': `bearer ${liveUser.access_token}`,
                    })
                    .end((err, response) => {
                        response.should.have.status(200);
                        response.should.be.json;
                        User.all((err, resp) => {
                            resp.length.should.eql(1);
                            done();
                        });
                    });
            });
        });

        it('should Add a device to user', (done) => {

            User.all((err, result) => {
                chai.request(server)
                    .post(`/api/user/${result[0]._id}/devices`)
                    .set({
                        'origin': origin,
                        'Content-Type': 'application/json',
                        'Authorization': `bearer ${liveUser.access_token}`,
                    })
                    .send({
                        pushRegistrationId: '123456789',
                        cordova: 'Cordova.Android',
                        model: 'Android',
                        platform: 'Lollipop',
                        uuid: '123asdf459erwerwe',
                        version: '12.0.1',
                        manufacturer: 'Samsung',
                        isVirtual: 'false',
                        serial: '12341234134'
                    })
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.should.be.json;
                        res.body.data.should.be.a('object');
                        res.body.data._id.should.equal(result[0]._id.toString());
                        res.body.data.should.have.property('devices')
                        res.body.data.devices.should.be.a('array');
                        res.body.data.devices.length.should.equal(1);
                        res.body.data.devices[0].should.have.property('pushRegistrationId').eql('123456789');
                        done();
                    });
            });
        });

        it('should Update a user', (done) => {

            User.all((err, result) => {

                chai.request(server)
                    .put(`/api/user/${result[0]._id}`)
                    .set({
                        'origin': origin,
                        'Content-Type': 'application/json',
                        'Authorization': `bearer ${liveUser.access_token}`,
                    })
                    .send({
                        firstName: 'Tommy',
                        lastName: 'John'
                    })
                    .end((err, response) => {
                        response.should.have.status(200);
                        response.should.be.json;
                        response.body.should.be.a('object');
                        response.body._id.should.equal(result[0]._id.toString());
                        response.body.should.have.property('firstName').eql('Tommy');
                        response.body.should.have.property('lastName').eql('John');
                        done();
                    });
            });
        });

        describe('Force Mongoose Errors.', () => {

            describe('Faulty find method', () => {
                const _find = UserModel.find;

                beforeEach(() => {
                    UserModel.find = () => {
                        return Promise.reject('forced error');
                    };
                });

                afterEach(() => {
                    UserModel.find = _find;
                });

                it('should respond with a server error', function () {
                    const spy = chai.spy();
                    return chai
                        .request(server)
                        .get('/api/user')
                        .set({
                            'origin': origin,
                            'Content-Type': 'application/json',
                            'Authorization': `bearer ${liveUser.access_token}`,
                        })
                        .then(spy)
                        .catch((err) => {
                            const res = err.response;
                            res.should.have.status(500);
                            done();
                        })
                        // .then(() => {
                        //     spy.should.not.have.been.called();
                        //     done();
                        // });
                });
            });
        });
    });
});
