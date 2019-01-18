// process.env.NODE_ENV = 'test';

// const State = require('../../../../app/database/repositories/core/state.repository');
// const DB = require('../../../../app/database/connection');
// const fs = require('fs');

// const readJson = (path, done) => {
//     fs.readFile(require.resolve(path), (err, data) => {
//         if (err) {
//             done(err);
//         }
//         else {
//             done(null, JSON.parse(data));
//         }
//     })
// }

// describe('State Tests', () => {
//     before((done) => {
//         DB.open(done);
//     });

//     beforeEach((done) => {
//         DB.drop((err) => {
//             if (err) {
//                 return done(err);
//             }
//             var fixtures;
//             readJson('../../../fixtures/state.model.fixture.json',
//                 (err, data) => {
//                     fixtures = data;
//                     DB.fixtures(fixtures, done);
//                 });
//         });
//     });

//     it('all', (done) => {
//         State.all((err, result) => {
//             result.should.have.length(50);
//             done();
//         });
//     });

//     it('delete', (done) => {
//         State.all((err, states) => {
//             State.delete(states[0]._id, (err) => {
//                 State.all((err, result) => {
//                     result.should.have.length(49);
//                     result[0]._id.should.not.eql(states[0]._id);
//                     done();
//                 });
//             });
//         });
//     });

//     it('get', (done) => {
//         State.all((err, result) => {
//             State.get(result[0]._id, (err, data) => {
//                 data.name.should.eql('Alabama');
//                 data.abbreviation.should.eql('AL');
//                 done();
//             })
//         });
//     });

//     it('insert', (done) => {
//         State.insert(
//             {
//                 name: 'Puerto Rico',
//                 abbreviation: 'PR'
//             },
//             (err, data) => {
//                 State.all((err, items) => {
//                     items.should.have.length(51);
//                     items[50].name.should.eql('Puerto Rico');
//                     items[50].abbreviation.should.eql('PR');
//                     done();
//                 });
//             });
//     });

//     // describe('Force State Model Errors.', () => {

//     //     describe('Faulty find and findOne method(s)', () => {
//     //         const _find = StateModel.find;
//     //         const _findById = StateModel.findById;
//     //         const _findOne = StateModel.findOne;
//     //         const _findByIdAndUpdate = StateModel.findByIdAndUpdate;
//     //         const _findOneAndUpdate = StateModel.findOneAndUpdate;
//     //         const _getAuthenticated = StateModel.getAuthenticated;

//     //         beforeEach(() => {
//     //             StateModel.find = () => {
//     //                 return Promise.reject('forced error');
//     //             };

//     //             StateModel.findById = () => {
//     //                 return Promise.reject('forced error');
//     //             };

//     //             StateModel.findOne = () => {
//     //                 return Promise.reject('forced error');
//     //             };

//     //             StateModel.findByIdAndUpdate = () => {
//     //                 return Promise.reject('forced error');
//     //             };

//     //             StateModel.findOneAndUpdate = () => {
//     //                 return Promise.reject('forced error');
//     //             };
//     //         });

//     //         afterEach(() => {
//     //             StateModel.find = _find;
//     //             StateModel.findById = _findById;
//     //             StateModel.findOne = _findOne;
//     //             StateModel.findByIdAndUpdate = _findByIdAndUpdate;
//     //             StateModel.findOneAndUpdate = _findOneAndUpdate;
//     //         });

//     //         it('all should respond with *** [State].repository.all::find forced error', function (done) {
//     //             State.all((error, result) => {
//     //                 expect(error).to.exist;
//     //                 done();
//     //             });
//     //         });

//     //         it('allPaged should respond with *** [State].repository.allPaged(0, 2) forced error', function (done) {
//     //             State.allPaged(0, 2, (error, result) => {
//     //                 expect(error).to.exist;
//     //                 done();
//     //             });
//     //         });

//     //         it('summary should respond with *** [State].repository.summary(0, 2) forced error', function (done) {
//     //             State.summary(0, 2, (error, result) => {
//     //                 expect(error).to.exist;
//     //                 done();
//     //             });
//     //         });


//     //         it('update should respond with *** [State].repository.update(123456789123)::findById forced error', function (done) {
//     //             State.update('123456789123', {}, (error, result) => {
//     //                 expect(error).to.exist;
//     //                 done();
//     //             });
//     //         });

//     //         it('get should respond with *** [State].repository.get(123456789123) forced error', function (done) {
//     //             State.get('123456789123', (error, result) => {
//     //                 expect(error).to.exist;
//     //                 done();
//     //             });
//     //         });

//     //     });
//     // });
// });