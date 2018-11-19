process.env.NODE_ENV = 'test';

const expect = require('chai').expect;

const Book = require('../app/database/repositories/book.repository');
const DB = require('../app/database/connection');
var fs = require('fs');

var readJson = (path, done) => {
    fs.readFile(require.resolve(path), (err, data) => {
        if (err)
            done(err)
        else
            done(null, JSON.parse(data))
    })
}

describe('Book Model Tests', () => {
    before(function (done) {
        DB.open(done)
    })

    beforeEach(function (done) {
        DB.drop(function (err) {
            if (err) {
                return done(err);
            }
            var fixtures;
            readJson('./fixtures/model-books.json', (err, data) => {
                fixtures = data;
                DB.fixtures(fixtures, done);
            });
        })
    })


    it('all', function (done) {
        Book.all((err, data) => {
            data.count.should.eql(3)
            done();
        })
    })

    it('create', function (done) {
        Book.insert({ author: 'Famous Person', title: 'I am so famous!', year: 2018, pages: 100 }, 
            (err, book) => {
            Book.all((err, books) => {
                books.count.should.eql(4);
                books.data[3]._id.should.eql(book._id);
                books.data[3].author.should.eql('Famous Person');
                books.data[3].title.should.eql('I am so famous!');
                done();
            });
        });
    });

    it('remove', function (done) {
        Book.all(function (err, books) {
            Book.delete(books.data[0]._id, function (err) {
                Book.all(function (err, result) {
                    result.count.should.eql(2)
                    result.data[0]._id.should.not.eql(books.data[0]._id)
                    result.data[1]._id.should.not.eql(books.data[0]._id)
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