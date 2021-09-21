/* eslint-disable consistent-return */
/* eslint-disable no-undef */
// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

// Require the dev-dependencies
const fs = require('fs');
const chai = require('chai');
const chaiHttp = require('chai-http');
const DB = require('../../app/database/connection');
const server = require('../../server');

const readJson = (path, done) => {
  fs.readFile(require.resolve(path), (err, data) => {
    if (err) {
      done(err);
    } else {
      done(null, JSON.parse(data));
    }
  });
};

chai.use(chaiHttp);

// Our parent block
describe('oAuth Tests', () => {
  before((done) => {
    // Before each test we empty the database
    DB.open(done);
  });

  beforeEach((done) => {
    DB.drop((err) => {
      if (err) {
        return done(err);
      }
      let fixtures;
      readJson('../fixtures/client-user.model.fixture.json', (_, data) => {
        fixtures = data;
        DB.fixtures(fixtures, done);
      });
    });
  });

  /*
`    * Test the /GET route
     */
  describe('/oauth/Token', () => {
    it('authenticate', (done) => {
      const clientId = 'core-web-ui';
      const clientSecret =
        'E89fZK0oQnEuMWuqRhpNZG5ObexOw81RdnWHnSIuQVjaei3bag4kq' +
        'nSyPXIrAi5gpYQcPU98leY1J5eL1sQUrUCRjS3SdZlMK1vSSv1kORtDqaxdYslVMe8uCBxk4Np' +
        'PkwFkiWB8ywHnAjXBZpRdXHry8Aj19KS7XQUvi3DVW953MqCJgipQm76Lw8rNfAl1oQMyjPyBV' +
        'cGKGecaevaz5bKulZWKx6m0sFKbNs2eT6FDiOfTuF25IHgKymnnoaCF';
      const origin = 'http://localhost:4200';
      const username = 'david@maras.co';
      const password = 'Letme1n!';

      // this.timeout(15000);
      chai
        .request(server)
        .post('/oauth/token')
        .type('form')
        .set('origin', origin)
        .send({
          _method: 'post',
          username,
          password,
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'password'
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.user.firstName.should.equal('Antonio');
          res.body.user.lastName.should.equal('Marasco');
          res.body.user.email.should.equal('david@maras.co');
          done();
        });
    });

    it('authenticate:invalid credentials', (done) => {
      const clientId = 'core-web-ui';
      const clientSecret =
        'E89fZK0oQnEuMWuqRhpNZG5ObexOw81RdnWHnSIuQVjaei3bag4kq' +
        'nSyPXIrAi5gpYQcPU98leY1J5eL1sQUrUCRjS3SdZlMK1vSSv1kORtDqaxdYslVMe8uCBxk4Np' +
        'PkwFkiWB8ywHnAjXBZpRdXHry8Aj19KS7XQUvi3DVW953MqCJgipQm76Lw8rNfAl1oQMyjPyBV' +
        'cGKGecaevaz5bKulZWKx6m0sFKbNs2eT6FDiOfTuF25IHgKymnnoaCF';
      const origin = 'http://localhost:4200';
      const username = 'david@maras.co';
      const password = 'password';

      // this.timeout(15000);
      chai
        .request(server)
        .post('/oauth/token')
        .type('form')
        .set('origin', origin)
        .send({
          _method: 'post',
          username,
          password,
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'password'
        })
        .end((err, res) => {
          res.should.have.status(403);
          res.body.error.should.equal('invalid_grant');
          res.body.error_description.should.equal(
            'Invalid resource owner credentials'
          );
          done();
        });
    });

    it('authenticate:invalid client id', (done) => {
      const clientId = 'web-ui-NOT-VALID';
      const clientSecret =
        'E89fZK0oQnEuMWuqRhpNZG5ObexOw81RdnWHnSIuQVjaei3bag4kq' +
        'nSyPXIrAi5gpYQcPU98leY1J5eL1sQUrUCRjS3SdZlMK1vSSv1kORtDqaxdYslVMe8uCBxk4Np' +
        'PkwFkiWB8ywHnAjXBZpRdXHry8Aj19KS7XQUvi3DVW953MqCJgipQm76Lw8rNfAl1oQMyjPyBV' +
        'cGKGecaevaz5bKulZWKx6m0sFKbNs2eT6FDiOfTuF25IHgKymnnoaCF';
      const origin = 'http://localhost:4200';
      const username = 'david@maras.co';
      const password = 'Letme1n!';

      // this.timeout(15000);
      chai
        .request(server)
        .post('/oauth/token')
        .type('form')
        .set('origin', origin)
        .send({
          _method: 'post',
          username,
          password,
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'password'
        })
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('authenticate:invalid client secret', (done) => {
      const clientId = 'core-web-ui';
      const clientSecret =
        'E89fZK0oQnEuMWuqRhpNZG5ObexOw81RdnWHnSIuQVjaei3bag4kq' +
        'nSyPXIrAi5gpYQcPU98leY1J5eL1sQUrUCRjS3SdZlMK1vSSv1kORtDqaxdYslVMe8uCBxk4Np' +
        'PkwFkiWB8ywHnAjXBZpRdXHry8Aj19KS7XQUvi3DVW953MqCJgipQm76Lw8rNfAl1oQMyjPyBV' +
        'cGKGecaevaz5bKulZWKx6m0sFKbNs2eT6FDiOfTuF25IHgKymnnoaCF-NOT-VALID';
      const origin = 'http://localhost:4200';
      const username = 'david@maras.co';
      const password = 'Letme1n!';

      // this.timeout(15000);
      chai
        .request(server)
        .post('/oauth/token')
        .type('form')
        .set('origin', origin)
        .send({
          _method: 'post',
          username,
          password,
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'password'
        })
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('authenticate:client NOT TRUSTED', (done) => {
      const clientId = 'core-web-mobile';
      const clientSecret =
        'E89fZK0oQnEuMWuqRhpNZG5ObexOw81RdnWHnSIuQVjaei3bag4kq' +
        'nSyPXIrAi5gpYQcPU98leY1J5eL1sQUrUCRjS3SdZlMK1vSSv1kORtDqaxdYslVMe8uCBxk4Np' +
        'PkwFkiWB8ywHnAjXBZpRdXHry8Aj19KS7XQUvi3DVW953MqCJgipQm76Lw8rNfAl1oQMyjPyBV' +
        'cGKGecaevaz5bKulZWKx6m0sFKbNs2eT6FDiOfTuF25IHgKymnnoaCF';
      const origin = 'http://localhost:8100';
      const username = 'david@maras.co';
      const password = 'Letme1n!';

      // this.timeout(15000);
      chai
        .request(server)
        .post('/oauth/token')
        .type('form')
        .set('origin', origin)
        .send({
          _method: 'post',
          username,
          password,
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'password'
        })
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('authenticate:Username does not exist', (done) => {
      const clientId = 'core-web-ui';
      const clientSecret =
        'E89fZK0oQnEuMWuqRhpNZG5ObexOw81RdnWHnSIuQVjaei3bag4kq' +
        'nSyPXIrAi5gpYQcPU98leY1J5eL1sQUrUCRjS3SdZlMK1vSSv1kORtDqaxdYslVMe8uCBxk4Np' +
        'PkwFkiWB8ywHnAjXBZpRdXHry8Aj19KS7XQUvi3DVW953MqCJgipQm76Lw8rNfAl1oQMyjPyBV' +
        'cGKGecaevaz5bKulZWKx6m0sFKbNs2eT6FDiOfTuF25IHgKymnnoaCF';
      const origin = 'http://localhost:4200';
      const username = null;
      const password = 'Letme1n!';

      // this.timeout(15000);
      chai
        .request(server)
        .post('/oauth/token')
        .type('form')
        .set('origin', origin)
        .send({
          username,
          _method: 'post',
          password,
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'password'
        })
        .end((err, res) => {
          res.should.have.status(400);
          res.body.error.should.equal('invalid_request');
          res.body.error_description.should.equal(
            'Missing required parameter: username'
          );
          done();
        });
    });

    it('authenticate:Password does not exist', (done) => {
      const clientId = 'core-web-ui';
      const clientSecret =
        'E89fZK0oQnEuMWuqRhpNZG5ObexOw81RdnWHnSIuQVjaei3bag4kq' +
        'nSyPXIrAi5gpYQcPU98leY1J5eL1sQUrUCRjS3SdZlMK1vSSv1kORtDqaxdYslVMe8uCBxk4Np' +
        'PkwFkiWB8ywHnAjXBZpRdXHry8Aj19KS7XQUvi3DVW953MqCJgipQm76Lw8rNfAl1oQMyjPyBV' +
        'cGKGecaevaz5bKulZWKx6m0sFKbNs2eT6FDiOfTuF25IHgKymnnoaCF';
      const origin = 'http://localhost:4200';
      const username = 'david@maras.co';
      const password = null; // 'Letme1n!';

      // this.timeout(15000);
      chai
        .request(server)
        .post('/oauth/token')
        .type('form')
        .set('origin', origin)
        .send({
          username,
          _method: 'post',
          password,
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'password'
        })
        .end((err, res) => {
          res.should.have.status(400);
          res.body.error.should.equal('invalid_request');
          res.body.error_description.should.equal(
            'Missing required parameter: password'
          );
          done();
        });
    });
  });

  /*
   * Test the /POST route
   */
  // describe('/POST book', () => {
  //     it('it should not POST a book without pages field', (done) => {
  //         let book = {
  //             title: "The Lord of the Rings",
  //             author: "J.R.R. Tolkien",
  //             year: 1954
  //         }
  //         chai.request(server)
  //             .post('/api/book')
  //             .send(book)
  //             .end((err, res) => {
  //                 res.should.have.status(200);
  //                 res.body.should.be.a('object');
  //                 res.body.should.have.property('errors');
  //                 res.body.errors.should.have.property('pages');
  //                 res.body.errors.pages.should.have.property('kind').eql('required');
  //                 done();
  //             });
  //     });

  //     it('it should POST a book ', (done) => {
  //         let book = {
  //             title: "The Lord of the Rings",
  //             author: "J.R.R. Tolkien",
  //             year: 1954,
  //             pages: 1170
  //         }
  //         chai.request(server)
  //             .post('/api/book')
  //             .send(book)
  //             .end((err, res) => {
  //                 res.should.have.status(200);
  //                 res.body.should.be.a('object');
  //                 res.body.should.have.property('message').eql('Book successfully added!');
  //                 res.body.book.should.have.property('title');
  //                 res.body.book.should.have.property('author');
  //                 res.body.book.should.have.property('pages');
  //                 res.body.book.should.have.property('year');
  //                 done();
  //             });
  //     });

  // });

  //     /*
  //   * Test the /GET/:id route
  //   */
  //     describe('/GET/:id book', () => {
  //         it('it should GET a book by the given id', (done) => {
  //             let book = new Book({ title: "The Lord of the Rings",
  // author: "J.R.R. Tolkien", year: 1954, pages: 1170 });
  //             book.save((err, book) => {
  //                 chai.request(server)
  //                     .get('/api/book/' + book.id)
  //                     .send(book)
  //                     .end((err, res) => {
  //                         res.should.have.status(200);
  //                         res.body.should.be.a('object');
  //                         res.body.should.have.property('title');
  //                         res.body.should.have.property('author');
  //                         res.body.should.have.property('pages');
  //                         res.body.should.have.property('year');
  //                         res.body.should.have.property('_id').eql(book.id);
  //                         done();
  //                     });
  //             });

  //         });
  //     });

  //     /*
  //     * Test the /PUT/:id route
  //     */
  //     describe('/PUT/:id book', () => {
  //         it('it should UPDATE a book given the id', (done) => {
  //             let book = new Book({ title: "The Chronicles of Narnia",
  // author: "C.S. Lewis", year: 1948, pages: 778 })
  //             book.save((err, book) => {
  //                 chai.request(server)
  //                     .put('/api/book/' + book.id)
  //                     .send({ title: "The Chronicles of Narnia",
  // author: "C.S. Lewis", year: 1950, pages: 778 })
  //                     .end((err, res) => {
  //                         res.should.have.status(200);
  //                         res.body.should.be.a('object');
  //                         res.body.should.have.property('message').eql('Book updated!');
  //                         res.body.book.should.have.property('year').eql(1950);
  //                         done();
  //                     });
  //             });
  //         });
  //     });

  //     /*
  //      * Test the /DELETE/:id route
  //      */
  //     describe('/DELETE/:id book', () => {
  //         it('it should DELETE a book given the id', (done) => {
  //             let book = new Book({ title: "The Chronicles of Narnia",
  //  author: "C.S. Lewis", year: 1948, pages: 778 })
  //             book.save((err, book) => {
  //                 chai.request(server)
  //                     .delete('/api/book/' + book.id)
  //                     .end((err, res) => {
  //                         res.should.have.status(200);
  //                         res.body.should.be.a('object');
  //                         res.body.should.have.property('message')
  // .eql('Book successfully deleted!');
  //                         res.body.result.should.have.property('ok').eql(1);
  //                         res.body.result.should.have.property('n').eql(1);
  //                         done();
  //                     });
  //             });
  //         });
  //     });
});
