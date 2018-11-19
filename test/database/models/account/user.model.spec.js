process.env.NODE_ENV = 'test';

const User = require('../../../../app/database/repositories/account/user.repository');
const DB = require('../../../../app/database/connection');
var fs = require('fs');

var readJson = (path, done) => {
    fs.readFile(require.resolve(path), (err, data) => {
        if (err)
            done(err)
        else
            done(null, JSON.parse(data))
    })
}

describe('User Model Tests', () => {
    before((done) => {
        DB.open(done)
    })

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
        })
    })


    it('all', (done) => {
        User.all((err, data) => {
            data.count.should.eql(3)
            done();
        })
    })

    it('create', (done) => {
        User.insert(
            {
                author: 'Famous Person',
                title: 'I am so famous!',
                year: 2018,
                pages: 100
            },
            (err, user) => {
                User.all((err, users) => {
                    users.count.should.eql(4);
                    users.data[3]._id.should.eql(user._id);
                    users.data[3].author.should.eql('Famous Person');
                    users.data[3].title.should.eql('I am so famous!');
                    done();
                });
            });
    });

    it('allPaged', (done) => {
        User.allPaged(0, 2, (err, data) => {
            data.data.length.should.eql(2);
            done();
        })
    })

    it('remove', (done) => {
        User.all((err, users) => {
            User.delete(users.data[0]._id, (err) => {
                User.all((err, result) => {
                    result.count.should.eql(2)
                    result.data[0]._id.should.not.eql(users.data[0]._id)
                    result.data[1]._id.should.not.eql(users.data[0]._id)
                    done()
                })
            })
        })
    })

    it('should be invalid if name is missing', (done) => {
        var model = new User();

        model.validate((err) => {
            expect(err.errors.title).to.exist;
            done();
        });
    });
});