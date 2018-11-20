process.env.NODE_ENV = 'test';

const Client = require('../../../../app/database/repositories/auth/client.repository');
const DB = require('../../../../app/database/connection');
const fs = require('fs');
const expect = require('chai').expect;

const readJson = (path, done) => {
    fs.readFile(require.resolve(path), (err, data) => {
        if (err) {
            done(err);
        }
        else {
            done(null, JSON.parse(data));
        }
    })
}

describe('Client Repository Tests', () => {
    before((done) => {
        DB.open(done);
    });

    beforeEach((done) => {
        DB.drop((err) => {
            if (err) {
                return done(err);
            }
            var fixtures;
            readJson('../../../fixtures/client.model.fixtures.json',
                (err, data) => {
                    fixtures = data;
                    DB.fixtures(fixtures, done);
                });
        });
    });

    it('all', (done) => {
        Client.all((err, data) => {
            data.count.should.eql(2);
            done();
        });
    });

    it('allPaged', (done) => {
        Client.allPaged(0, 2, (err, result) => {
            result.data.length.should.eql(2);
            done();
        });
    });

    it('byClientId: valid', (done) => {
        Client.byClientId('web-mobile', (err, data) => {
            data.name.should.eql('Web.Mobile');
            done();
        });
    });

    it('byClientId: invalid', (done) => {
        Client.byClientId('fake-mobile', (err, data) => {
            expect(data).to.not.exist;
            done();
        });
    });

    it('delete', (done) => {
        Client.all((err, users) => {
            Client.delete(users.data[0]._id, (err) => {
                Client.all((err, result) => {
                    result.count.should.eql(1);
                    result.data[0]._id.should.not.eql(users.data[0]._id);
                    done();
                });
            });
        });
    });

    it('get', (done) => {
        Client.all((err, result) => {
            Client.get(result.data[0]._id, (err, data) => {
                data.name.should.eql('Web.UI');
                data.clientId.should.eql('web-ui');
                done();
            })
        });
    });

    it('insert', (done) => {
        Client.insert(
            {
                name: 'App.UI',
                clientId: 'app-ui',
                clientSecret: '353b992ef5abd23cfc349228970b550616161458',
                isTrusted: false,
                applicationType: 'Native',
                allowedOrigins: [
                    'http://localhost:4200',
                    'http://admin.app.maras.co'
                ],
                tokenLifeTime: 30,
                refreshTokenLifeTime: 259200,
                allowedLoginAttempts: 3,
                daysToLock: 3
            },
            (err, user) => {
                Client.all((err, items) => {
                    items.count.should.eql(3);
                    items.data[2]._id.should.eql(user._id);
                    items.data[2].name.should.eql('App.UI');
                    items.data[2].clientId.should.eql('app-ui');
                    items.data[2].tokenLifeTime.should.eql(30);
                    items.data[2].refreshTokenLifeTime.should.eql(259200);
                    done();
                });
            });
    });

    it('refreshToken', (done) => {
        Client.all((err, result) => {

            Client.refreshToken(result.data[0]._id, (err, item) => {
                expect(item.takenHash).should.exist;
                expect(item.clientSecret).should.exist;
                done();
            });
        });
    });

    it('update', (done) => {
        Client.all((err, users) => {
            let body = {
                clientId: 'maraso-web-ui'
            }
            Client.update(users.data[0]._id, body, (err, item) => {
                Client.get(item._id, (err, data) => {
                    data.clientId.should.eql('maraso-web-ui');
                    done();
                });
            });
        });
    });

    it('verify : valid credentials', (done) => {
        let clientId = 'web-ui';
        let clientSecret = 'E89fZK0oQnEuMWuqRhpNZG5ObexOw81RdnWHnSIuQVjaei3bag4kq' +
        'nSyPXIrAi5gpYQcPU98leY1J5eL1sQUrUCRjS3SdZlMK1vSSv1kORtDqaxdYslVMe8uCBxk4Np' +
        'PkwFkiWB8ywHnAjXBZpRdXHry8Aj19KS7XQUvi3DVW953MqCJgipQm76Lw8rNfAl1oQMyjPyBV' +
        'cGKGecaevaz5bKulZWKx6m0sFKbNs2eT6FDiOfTuF25IHgKymnnoaCF';
        let origin = 'http://localhost:4200';

        Client.verify(clientId, clientSecret, origin,
            (err, data, reason) => {
                data.name.should.eq('Web.UI');
                done();
            });
    });

    it('verify : invalid credentials::Secret incorrect', (done) => {
        let clientId = 'web-ui';
        let clientSecret = '123456789';
        let origin = 'http://localhost:4200';

        Client.verify(clientId, clientSecret, origin,
            (err, data, reason) => {
                //Secret incorrect
                reason.should.eq(1);
                done();
            });
    });

    it('verify : invalid credentials::NOT FOUND', (done) => {
        let clientId = 'web-ui-luke-skyywalker';
        let clientSecret = '123456789';
        let origin = 'http://localhost:4200';

        Client.verify(clientId, clientSecret, origin,
            (err, data, reason) => {
                //Not Found
                reason.should.eq(0);
                done();
            });
    });

    it('verify : invalid credentials::NOT TRUSTED', (done) => {
        let clientId = 'web-mobile';
        let clientSecret = 'E89fZK0oQnEuMWuqRhpNZG5ObexOw81RdnWHnSIuQVjaei3bag4kq' +
        'nSyPXIrAi5gpYQcPU98leY1J5eL1sQUrUCRjS3SdZlMK1vSSv1kORtDqaxdYslVMe8uCBxk4Np' +
        'PkwFkiWB8ywHnAjXBZpRdXHry8Aj19KS7XQUvi3DVW953MqCJgipQm76Lw8rNfAl1oQMyjPyBV' +
        'cGKGecaevaz5bKulZWKx6m0sFKbNs2eT6FDiOfTuF25IHgKymnnoaCF';
        let origin = 'http://localhost:8100';

        Client.verify(clientId, clientSecret, origin,
            (err, data, reason) => {
                //Not Found
                reason.should.eq(3);
                done();
            });
    });

    it('verify : invalid credentials::ORIGIN DISABLED', (done) => {
        let clientId = 'web-ui';
        let clientSecret = 'E89fZK0oQnEuMWuqRhpNZG5ObexOw81RdnWHnSIuQVjaei3bag4kq' +
        'nSyPXIrAi5gpYQcPU98leY1J5eL1sQUrUCRjS3SdZlMK1vSSv1kORtDqaxdYslVMe8uCBxk4Np' +
        'PkwFkiWB8ywHnAjXBZpRdXHry8Aj19KS7XQUvi3DVW953MqCJgipQm76Lw8rNfAl1oQMyjPyBV' +
        'cGKGecaevaz5bKulZWKx6m0sFKbNs2eT6FDiOfTuF25IHgKymnnoaCF';
        let origin = 'https://api.maras.co';

        Client.verify(clientId, clientSecret, origin,
            (err, data, reason) => {
                reason.should.eq(2);
                done();
            });
    });
});