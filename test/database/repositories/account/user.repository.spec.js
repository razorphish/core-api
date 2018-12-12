process.env.NODE_ENV = 'test';

const User = require('../../../../app/database/repositories/account/user.repository');
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

describe('User Repository Tests', () => {
    before((done) => {
        DB.open(done);
    });

    beforeEach((done) => {
        DB.drop((err) => {
            if (err) {
                return done(err);
            }
            var fixtures;
            readJson('../../../fixtures/user.model.fixture.json',
                (err, data) => {
                    fixtures = data;
                    DB.fixtures(fixtures, done);
                });
        });
    });

    it('addDevice', (done) => {
        User.all((err, users) => {
            let body = {
                pushRegistrationId: 'Registrion Id',
                cordova: "body.cordova",
                model: "body.model",
                platform: "body.platform",
                uuid: "body.uuid",
                version: "body.version",
                manufacturer: "body.manufacturer",
                isVirtual: "body.isVirtual",
                serial: "body.serial"
            };

            User.addDevice(users[0]._id, body, (err, data) => {
                User.all((err, result) => {
                    expect(result[0].devices).to.exist;
                    done();
                });
            });
        });
    });

    it('all', (done) => {
        User.all((err, result) => {
            result.length.should.eql(2);
            done();
        });
    });

    it('allPaged', (done) => {
        User.allPaged(0, 2, (err, result) => {
            result.should.have.length(2);
            done();
        });
    });

    it('authenticate : valid credentials', (done) => {
        User.authenticate('david@maras.co', 'Letme1n!',
            (err, data, reason) => {
                done();
            });
    });

    it('authenticate : invalid credentials', (done) => {
        User.authenticate('david@maras.co', 'password',
            (err, data, reason) => {
                reason.should.eq(1);
                done();
            });
    });

    it('byRefreshToken', (done) => {
        User.byRefreshToken('77dd93db3f1455022d0a6f701c9bbd00e8b678f3', (err, data) => {
            data.firstName.should.eql('Antonio');
            data.lastName.should.eql('Marasco');
            done();
        });
    });

    it('byRefreshToken: invalid', (done) => {
        User.byRefreshToken('123', (err, data) => {
            expect(data).to.not.exist;
            done();
        });
    });

    it('byRole', (done) => {
        User.byRole('Guest', (err, result) => {
            result.length.should.eql(1);
            result[0].firstName.should.eql('Antonio');
            result[0].lastName.should.eql('Marasco');
            done();
        });
    });

    it('byUsername', (done) => {
        User.byUsername('david@maras.co', (err, result) => {
            result.firstName.should.eql('Antonio');
            result.lastName.should.eql('Marasco');
            done();
        });
    });

    it('delete', (done) => {
        User.all((err, users) => {
            User.delete(users[0]._id, (err) => {
                User.all((err, result) => {
                    result.length.should.eql(1);
                    result[0]._id.should.not.eql(users[0]._id);
                    done();
                });
            });
        });
    });

    it('get', (done) => {
        User.all((err, result) => {
            User.get(result[0]._id, (err, data) => {
                data.firstName.should.eql('Antonio');
                data.lastName.should.eql('Marasco');
                done();
            })
        });
    });

    it('insert', (done) => {
        User.insert(
            {
                firstName: 'Erica',
                lastName: 'Marasco',
                email: 'erica@ericamarasco.com',
                email_lower: 'erica@ericamarasco.com',
                username: 'erica.marasco',
                username_lower: 'erica.marasco',
                status: 'active',
                password: 'Letme1n!',
                salt: '1NC7owXUlUj',
                roles: [
                    {
                        _id: "59af319cfc13ae21640000dc",
                        name: "Stylist",
                        normalizedName: "STYLIST"
                    },
                ],
                refreshToken: {
                    userId: "59e8e689ea1ea07ca6e6ef96",
                    loginProvider: "oAuth2",
                    name: "refresh_token3",
                    scope: "*",
                    type: "bearer",
                    expiresIn: 15552000,
                    value: '123456789abcdefghi'
                }
            },
            (err, user) => {
                User.all((err, users) => {
                    users.length.should.eql(3);
                    users[2]._id.should.eql(user._id);
                    users[2].firstName.should.eql('Erica');
                    users[2].lastName.should.eql('Marasco');
                    users[2].email.should.eql('erica@ericamarasco.com');
                    users[2].username.should.eql('erica.marasco');

                    done();
                });
            });
    });

    it('passwordMatch : valid credentials', (done) => {
        User.passwordMatch('david@maras.co', 'Letme1n!',
            (err, data) => {
                data.firstName.should.eql('Antonio');
                data.lastName.should.eql('Marasco');
                done();
            });
    });

    it('passwordMatch : invalid credentials', (done) => {
        User.passwordMatch('david@maras.co', 'password',
            (err, data) => {
                expect(data).to.not.exist;
                done();
            });
    });

    it('summary', (done) => {
        User.summary(0, 2, (err, result) => {
            result.length.should.eql(2);
            expect(result[0].password).to.not.exist;
            expect(result[0].salt).to.not.exist;
            expect(result[0].refreshToken).to.not.exist;
            expect(result[0].loginAttempts).to.not.exist;
            expect(result[0].lockUntil).to.not.exist;
            done();
        });
    });

    it('update', (done) => {
        User.all((err, users) => {
            let body = {
                firstName: 'Paco'
            }
            User.update(users[0]._id, body, (err, user) => {
                User.get(user._id, (err, data) => {
                    data.firstName.should.eql('Paco');
                    done();
                });
            });
        });
    });

    it('updateSummary', (done) => {
        User.all((err, users) => {
            let body = {
                firstName: 'Smith',
            }
            User.updateSummary(users[0]._id, body, (err, user) => {
                User.get(user._id, (err, data) => {
                    data.firstName.should.eql('Smith');
                    done();
                });
            });
        });
    });

    it('updateToken', (done) => {
        User.all((err, result) => {

            let token = {
                userId: "59e8e689ea1ea07ca6e6ef96",
                loginProvider: "oAuth2",
                name: "refresh_token",
                scope: "*",
                type: "bearer",
                expiresIn: 15552000,
                value: '123456789abcdefghi'
            }

            User.updateToken(result[0]._id, token, (err, user) => {
                user.refreshToken.value.should.eql('123456789abcdefghi');
                done();
            });
        });
    });
});