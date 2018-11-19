process.env.NODE_ENV = 'test';

const State = require('../../../../app/database/repositories/core/state.repository');
const DB = require('../../../../app/database/connection');
var fs = require('fs');

var readJson = (path, done) => {
    fs.readFile(require.resolve(path),
        (err, data) => {
            if (err)
                done(err)
            else
                done(null, JSON.parse(data))
        })
}

describe('State Model Tests', () => {
    before((done) => {
        DB.open(done)
    })

    beforeEach((done) => {
        DB.drop((err) => {
            if (err) {
                return done(err);
            }
            var fixtures;
            readJson('../../../fixtures/state.model.fixture.json',
                (err, data) => {
                    fixtures = data;
                    DB.fixtures(fixtures, done);
                });
        })
    })


    it('all', (done) => {
        State.all((err, data) => {
            data.count.should.eql(50);
            done();
        })
    })

    it('create', (done) => {
        State.insert(
            {
                name: 'Puerto Rico',
                abbreviation: 'PR',
            },
            (err, book) => {
                State.all((err, states) => {
                    states.count.should.eql(51);
                    states.data[50]._id.should.eql(book._id);
                    states.data[50].name.should.eql('Puerto Rico');
                    states.data[50].abbreviation.should.eql('PR');
                    done();
                });
            });
    });


    it('remove', (done) => {
        State.all((err, states) => {
            State.delete(states.data[0]._id, (err) => {
                State.all((err, result) => {
                    result.count.should.eql(49);
                    result.data[0]._id.should.not.eql(states.data[0]._id);
                    result.data[1]._id.should.not.eql(states.data[0]._id);
                    done()
                })
            })
        })
    })

    // it('should be invalid if name is missing', (done) => {
    //     var model = new Book();

    //     model.validate((err) => {
    //         expect(err.errors.title).to.exist;
    //         done();
    //     });
    // });
});