process.env.NODE_ENV = 'test';

const State = require('../../../../app/database/repositories/core/state.repository');
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

describe('State Tests', () => {
    before((done) => {
        DB.open(done);
    });

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
        });
    });

    it('all', (done) => {
        State.all((err, data) => {
            data.count.should.eql(50);
            done();
        });
    });

    it('delete', (done) => {
        State.all((err, states) => {
            State.delete(states.data[0]._id, (err) => {
                State.all((err, result) => {
                    result.count.should.eql(49);
                    result.data[0]._id.should.not.eql(states.data[0]._id);
                    done();
                });
            });
        });
    });

    it('get', (done) => {
        State.all((err, result) => {
            State.get(result.data[0]._id, (err, data) => {
                data.name.should.eql('Alabama');
                data.abbreviation.should.eql('AL');
                done();
            })
        });
    });

    it('insert', (done) => {
        State.insert(
            {
                name: 'Puerto Rico',
                abbreviation: 'PR'
            },
            (err, token) => {
                State.all((err, items) => {
                    items.count.should.eql(51);
                    items.data[50].name.should.eql('Puerto Rico');
                    items.data[50].abbreviation.should.eql('PR');
                    done();
                });
            });
    });
});