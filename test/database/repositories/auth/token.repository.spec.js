process.env.NODE_ENV = 'test';

const Token = require('../../../../app/database/repositories/auth/token.repository');
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

describe('Token Repository Tests', () => {
    before((done) => {
        DB.open(done);
    });

    beforeEach((done) => {
        DB.drop((err) => {
            if (err) {
                return done(err);
            }
            var fixtures;
            readJson('../../../fixtures/token.model.fixture.json',
                (err, data) => {
                    fixtures = data;
                    DB.fixtures(fixtures, done);
                });
        });
    });

    it('all', (done) => {
        Token.all((err, data) => {
            data.count.should.eql(3);
            done();
        });
    });

    it('byToken: valid', (done) => {
        Token.byToken('df87095132d000193ae7f2d34fe9196b30de83bc',
            (err, data) => {
                let userId = data.userId.toString();
                data.loginProvider.should.eql('oAuth2');
                userId.should.eql('59b0767a8207af454caa2560');
                done();
            });
    });

    it('byToken: invalid', (done) => {
        Token.byToken('fake-mobile', (err, data) => {
            expect(data).to.not.exist;
            done();
        });
    });

    it('byUserId: valid', (done) => {

        Token.byUserId('59b0767a8207af454caa2560',
            (err, data) => {
                data.length.should.eql(3);
                done();
            });
    });

    it('byUserId: invalid', (done) => {
        Token.byUserId('fake-user-id', (err, data) => {
            data.length.should.eql(0);
            done();
        });
    });


    it('delete', (done) => {
        Token.all((err, users) => {
            Token.delete(users.data[0]._id, (err) => {
                Token.all((err, result) => {
                    result.count.should.eql(2);
                    result.data[0]._id.should.not.eql(users.data[0]._id);
                    done();
                });
            });
        });
    });

    it('deleteByTokenHash', (done) => {
        Token.all((err, tokens) => {
            Token.deleteByTokenHash(tokens.data[0].value, (err) => {
                Token.all((err, result) => {
                    result.count.should.eql(2);
                    result.data[0]._id.should.not.eql(tokens.data[0]._id);
                    done();
                });
            });
        });
    });

    // it('deleteByUserId', (done) => {
    //     Token.all((err, tokens) => {
    //         Token.deleteByUserId(tokens.data[0].userId, (err) => {
    //             Token.all((err, result) => {
    //                 result.count.should.eql(2);
    //                 result.data[0]._id.should.not.eql(tokens.data[0]._id);
    //                 done();
    //             });
    //         });
    //     });
    // });

    it('get', (done) => {
        Token.all((err, result) => {
            Token.get(result.data[0]._id, (err, data) => {
                data.loginProvider.should.eql('oAuth2');
                data.value.should.eql('df87095132d000193ae7f2d34fe9196b30de83bc');
                done();
            })
        });
    });

    it('insert', (done) => {
        Token.insert(
            {
                userId: '59b0767a8207af454caa2560',
                loginProvider: 'oAuth2',
                name: 'access_token',
                value: 'df87095132d000193ae7f2d34fe9196b30de83bc',
                scope: '*',
                type: "bearer",
                expiresIn: 1800,
                dateExpire: '2019-09-06T16:00:07-07:00',
                protocol: 'http'
            },
            (err, token) => {
                Token.all((err, items) => {
                    items.count.should.eql(4);
                    items.data[3]._id.should.eql(token._id);
                    items.data[3].name.should.eql('access_token');
                    items.data[3].loginProvider.should.eql('oAuth2');
                    items.data[3].expiresIn.should.eql(1800);

                    done();
                });
            });
    });
});