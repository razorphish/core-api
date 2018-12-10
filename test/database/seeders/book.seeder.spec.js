process.env.NODE_ENV = 'test';

//const Seeder = require('../../../app/database/seeders/book.seeder');
const DB = require('../../../app/database/connection');
//const Book = require('../../../app/database/repositories/book/book.repository');
const expect = require('chai').expect;

describe('Book Seeder Tests', () => {
    before((done) => {
        DB.open(done);
    });

    beforeEach((done) => {
        DB.drop((err) => {
            if (err) {
                return done(err);
            }
            done();
        });

    });

    it('Seed', (done) => {
        // Seeder.seed()
        //     .then(items => {
        //         if (items.length === 3) {
        //             done();
        //         }
        //     })
        //     .catch(err => {

        //     });

        //done();
        done();
    });

    // it('Seed No Connection', (done) => {
    //     DB.close();
    //     Seeder.seed()
    //         .then(items => {
    //             done();
    //         })
    //         .catch(err => {
    //             if (err) {
    //                 done();
    //             }
    //             done();
    //         });
    // });

});