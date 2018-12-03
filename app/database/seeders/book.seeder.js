const Book = require('../models/book/book.model');
const logger = require('../../../lib/winston.logger');

class BookFeeder {
    constructor() {
        this._classInfo = '*** [Book].seeder';
    }

    /**
     * User Seeding
     */
    seed() {
        logger.info(`${this._classInfo}.seed()`);

        return new Promise((resolve,reject) => {
            var books = [
                {
                    title: 'Don Quixote',
                    author: 'Miguel de Cervantes',
                    year: 1948,
                    pages: 345
                },
                {
                    title: 'In Search of Lost Time',
                    author: 'Marcel Proust',
                    year: 2001,
                    pages: 301
                },
                {
                    title: 'Ulysses',
                    author: 'James Joyce',
                    year: 1983,
                    pages: 732
                }
            ];
    
            var l = books.length,
                i;
    
            Book.remove({});
    
            for (i = 0; i < l; i++) {
                var book = new Book({
                    title: books[i].title,
                    author: books[i].author,
                    year: books[i].year,
                    pages: books[i].pages
                });
    
    
                book.save((err, book) => {
                    //logger.verbose(`${this._classInfo}.seed()`, user);
    
                    if (err) {
                        //logger.error(`${this._classInfo}.seed()`, err);
                        return reject(err);
                    } else {
                        logger.debug(
                            `${this._classInfo}.seed() OK`,
                            `${book.email} ${book.username}`
                        );
                    }
                });
            }
            return resolve(books);
        })

    }
}

module.exports = new BookFeeder();
