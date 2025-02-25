/* eslint-disable no-unused-expressions */
/* eslint-disable consistent-return */
/* eslint-disable no-undef */
process.env.NODE_ENV = 'test';

const fs = require('fs');
const { expect } = require('chai');
const ClientRepository = require('../../../../app/database/repositories/auth/client.repository');
const DB = require('../../../../app/database/connection');

const readJson = (path, done) => {
  fs.readFile(require.resolve(path), (err, data) => {
    if (err) {
      done(err);
    } else {
      done(null, JSON.parse(data));
    }
  });
};

describe('Client Repository Tests', () => {
  before((done) => {
    DB.open(done);
  });

  beforeEach((done) => {
    DB.drop((err) => {
      if (err) {
        return done(err);
      }
      let fixtures;
      readJson('../../../fixtures/client.model.fixture.json', (_, data) => {
        fixtures = data;
        DB.fixtures(fixtures, done);
      });
    });
  });

  it('all', (done) => {
    ClientRepository.all((err, clients) => {
      clients.should.have.length(2);
      done();
    });
  });

  it('allPaged', (done) => {
    ClientRepository.allPaged(0, 2, (err, clients) => {
      clients.should.have.length(2);
      done();
    });
  });

  it('byClientId: valid', (done) => {
    ClientRepository.byClientId('core-web-mobile', (err, client) => {
      client.name.should.eql('@marasco/core-mobile-ui');
      done();
    });
  });

  it('byClientId: invalid', (done) => {
    ClientRepository.byClientId('fake-mobile', (err, client) => {
      expect(client).to.not.exist;
      done();
    });
  });

  it('delete', (done) => {
    ClientRepository.all((err, data) => {
      ClientRepository.delete(data[0]._id, () => {
        ClientRepository.all((_, clients) => {
          clients.should.have.length(1);
          clients[0].name.should.not.eql(data[0].name);
          done();
        });
      });
    });
  });

  it('get', (done) => {
    ClientRepository.all((err, clients) => {
      ClientRepository.get(clients[0]._id, (_, client) => {
        client.name.should.eql('@marasco/core-web-ui');
        client.clientId.should.eql('core-web-ui');
        done();
      });
    });
  });

  it('insert', (done) => {
    ClientRepository.insert(
      {
        name: 'App.UI',
        clientId: 'app-ui',
        clientSecret: '353b992ef5abd23cfc349228970b550616161458',
        isTrusted: false,
        applicationType: 'Native',
        allowedOrigins: ['http://localhost:4200', 'http://admin.app.maras.co'],
        tokenLifeTime: 30,
        refreshTokenLifeTime: 259200,
        allowedLoginAttempts: 3,
        daysToLock: 3
      },
      (err, client) => {
        ClientRepository.all((_, clients) => {
          clients.should.have.length(3);
          clients[2]._id.should.eql(client._id);
          clients[2].name.should.eql('App.UI');
          clients[2].clientId.should.eql('app-ui');
          clients[2].tokenLifeTime.should.eql(30);
          clients[2].refreshTokenLifeTime.should.eql(259200);
          done();
        });
      }
    );
  });

  it('refreshToken', (done) => {
    ClientRepository.all((err, clients) => {
      ClientRepository.refreshToken(clients[0]._id, (error, token) => {
        expect(token.takenHash).should.exist;
        expect(token.clientSecret).should.exist;
        done();
      });
    });
  });

  it('update', (done) => {
    ClientRepository.all((err, clients) => {
      const body = {
        clientId: 'maraso-web-ui'
      };
      ClientRepository.update(clients[0]._id, body, (_, client) => {
        ClientRepository.get(client._id, (error, data) => {
          data.clientId.should.eql('maraso-web-ui');
          done();
        });
      });
    });
  });

  it('verify : valid credentials', (done) => {
    const clientId = 'core-web-ui';
    const clientSecret =
      'E89fZK0oQnEuMWuqRhpNZG5ObexOw81RdnWHnSIuQVjaei3bag4kq' +
      'nSyPXIrAi5gpYQcPU98leY1J5eL1sQUrUCRjS3SdZlMK1vSSv1kORtDqaxdYslVMe8uCBxk4Np' +
      'PkwFkiWB8ywHnAjXBZpRdXHry8Aj19KS7XQUvi3DVW953MqCJgipQm76Lw8rNfAl1oQMyjPyBV' +
      'cGKGecaevaz5bKulZWKx6m0sFKbNs2eT6FDiOfTuF25IHgKymnnoaCF';
    const origin = 'http://localhost:4200';

    ClientRepository.verify(clientId, clientSecret, origin, (err, client) => {
      client.name.should.eq('@marasco/core-web-ui');
      done();
    });
  });

  it('verify : invalid credentials::Secret incorrect', (done) => {
    const clientId = 'core-web-ui';
    const clientSecret = '123456789';
    const origin = 'http://localhost:4200';

    ClientRepository.verify(
      clientId,
      clientSecret,
      origin,
      (err, client, reason) => {
        // Secret incorrect
        reason.should.eq(1);
        done();
      }
    );
  });

  it('verify : invalid credentials::NOT FOUND', (done) => {
    const clientId = 'web-ui-luke-skyywalker';
    const clientSecret = '123456789';
    const origin = 'http://localhost:4200';

    ClientRepository.verify(
      clientId,
      clientSecret,
      origin,
      (err, client, reason) => {
        // Not Found
        reason.should.eq(0);
        done();
      }
    );
  });

  it('verify : invalid credentials::NOT TRUSTED', (done) => {
    const clientId = 'core-web-mobile';
    const clientSecret =
      'E89fZK0oQnEuMWuqRhpNZG5ObexOw81RdnWHnSIuQVjaei3bag4kq' +
      'nSyPXIrAi5gpYQcPU98leY1J5eL1sQUrUCRjS3SdZlMK1vSSv1kORtDqaxdYslVMe8uCBxk4Np' +
      'PkwFkiWB8ywHnAjXBZpRdXHry8Aj19KS7XQUvi3DVW953MqCJgipQm76Lw8rNfAl1oQMyjPyBV' +
      'cGKGecaevaz5bKulZWKx6m0sFKbNs2eT6FDiOfTuF25IHgKymnnoaCF';
    const origin = 'http://localhost:8100';

    ClientRepository.verify(
      clientId,
      clientSecret,
      origin,
      (err, data, reason) => {
        // Not Found
        reason.should.eq(3);
        done();
      }
    );
  });

  it('verify : invalid credentials::ORIGIN DISABLED', (done) => {
    const clientId = 'core-web-ui';
    const clientSecret =
      'E89fZK0oQnEuMWuqRhpNZG5ObexOw81RdnWHnSIuQVjaei3bag4kq' +
      'nSyPXIrAi5gpYQcPU98leY1J5eL1sQUrUCRjS3SdZlMK1vSSv1kORtDqaxdYslVMe8uCBxk4Np' +
      'PkwFkiWB8ywHnAjXBZpRdXHry8Aj19KS7XQUvi3DVW953MqCJgipQm76Lw8rNfAl1oQMyjPyBV' +
      'cGKGecaevaz5bKulZWKx6m0sFKbNs2eT6FDiOfTuF25IHgKymnnoaCF';
    const origin = 'https://api.maras.co';

    ClientRepository.verify(
      clientId,
      clientSecret,
      origin,
      (err, data, reason) => {
        reason.should.eq(2);
        done();
      }
    );
  });
});
