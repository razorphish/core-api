//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

let User = require('../../../../app/database/models/account/user.model');
const DB = require('../../../../app/database/connection');
const fs = require('fs');
//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../../../../server');
let should = chai.should();

let user = {};

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
        let clientId = 'web-ui';
        let clientSecret = 'E89fZK0oQnEuMWuqRhpNZG5ObexOw81RdnWHnSIuQVjaei3bag4kq' +
            'nSyPXIrAi5gpYQcPU98leY1J5eL1sQUrUCRjS3SdZlMK1vSSv1kORtDqaxdYslVMe8uCBxk4Np' +
            'PkwFkiWB8ywHnAjXBZpRdXHry8Aj19KS7XQUvi3DVW953MqCJgipQm76Lw8rNfAl1oQMyjPyBV' +
            'cGKGecaevaz5bKulZWKx6m0sFKbNs2eT6FDiOfTuF25IHgKymnnoaCF';
        let origin = 'http://localhost:4200';
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
                'grant_type': 'password'
            })
            .end((err, res) => {
                user = res.body;
                done();
            });
    });

    /*
    `    * Test the /GET route
     */
    describe('/GET user', () => {
        it('it should GET all the Users', (done) => {
            let origin = 'http://localhost:4200';

            //console.log(user);
            chai.request(server)
                .get('/api/user')
                .set({
                    'origin': origin,
                    'Content-Type': 'application/json',
                    'Authorization': `bearer ${user.access_token}`,
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(2);
                    done();
                });
        });
    });

    /*
    * Test the /POST route
    */
    // describe('/POST user', () => {
    //     it('it should not POST a user without pages field', (done) => {
    //         let user = {
    //             title: "The Lord of the Rings",
    //             author: "J.R.R. Tolkien",
    //             year: 1954
    //         }
    //         chai.request(server)
    //             .post('/api/user')
    //             .send(user)
    //             .end((err, res) => {
    //                 res.should.have.status(200);
    //                 res.body.should.be.a('object');
    //                 res.body.should.have.property('errors');
    //                 res.body.errors.should.have.property('pages');
    //                 res.body.errors.pages.should.have.property('kind').eql('required');
    //                 done();
    //             });
    //     });
    //     it('it should POST a user ', (done) => {
    //         let user = {
    //             title: "The Lord of the Rings",
    //             author: "J.R.R. Tolkien",
    //             year: 1954,
    //             pages: 1170
    //         }
    //         chai.request(server)
    //             .post('/api/user')
    //             .send(user)
    //             .end((err, res) => {
    //                 res.should.have.status(200);
    //                 res.body.should.be.a('object');
    //                 res.body.should.have.property('message').eql('user successfully added!');
    //                 res.body.user.should.have.property('title');
    //                 res.body.user.should.have.property('author');
    //                 res.body.user.should.have.property('pages');
    //                 res.body.user.should.have.property('year');
    //                 done();
    //             });
    //     });

    // });

    // /*
    // * Test the /GET/:id route
    // */
    // describe('/GET/:id user', () => {
    //     it('it should GET a user by the given id', (done) => {
    //         let user = new User({ title: "The Lord of the Rings", author: "J.R.R. Tolkien", year: 1954, pages: 1170 });
    //         user.save((err, user) => {
    //             chai.request(server)
    //                 .get('/api/user/' + user.id)
    //                 .send(user)
    //                 .end((err, res) => {
    //                     res.should.have.status(200);
    //                     res.body.should.be.a('object');
    //                     res.body.should.have.property('title');
    //                     res.body.should.have.property('author');
    //                     res.body.should.have.property('pages');
    //                     res.body.should.have.property('year');
    //                     res.body.should.have.property('_id').eql(user.id);
    //                     done();
    //                 });
    //         });

    //     });
    // });

    /*
    * Test the /PUT/:id route
    */
    // describe('/PUT/:id user', () => {
    //     it('it should UPDATE a user given the id', (done) => {
    //         let user = new User({ title: "The Chronicles of Narnia", author: "C.S. Lewis", year: 1948, pages: 778 })
    //         user.save((err, user) => {
    //             chai.request(server)
    //                 .put('/api/user/' + user.id)
    //                 .send({ title: "The Chronicles of Narnia", author: "C.S. Lewis", year: 1950, pages: 778 })
    //                 .end((err, res) => {
    //                     res.should.have.status(200);
    //                     res.body.should.be.a('object');
    //                     res.body.should.have.property('message').eql('user updated!');
    //                     res.body.user.should.have.property('year').eql(1950);
    //                     done();
    //                 });
    //         });
    //     });
    // });

    /*
     * Test the /DELETE/:id route
     */
    // describe('/DELETE/:id user', () => {
    //     it('it should DELETE a user given the id', (done) => {
    //         let user = new User({ title: "The Chronicles of Narnia", author: "C.S. Lewis", year: 1948, pages: 778 })
    //         user.save((err, user) => {
    //             chai.request(server)
    //                 .delete('/api/user/' + user.id)
    //                 .end((err, res) => {
    //                     res.should.have.status(200);
    //                     res.body.should.be.a('object');
    //                     res.body.should.have.property('message').eql('user successfully deleted!');
    //                     res.body.result.should.have.property('ok').eql(1);
    //                     res.body.result.should.have.property('n').eql(1);
    //                     done();
    //                 });
    //         });
    //     });
    // });
});