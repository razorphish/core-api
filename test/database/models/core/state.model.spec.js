// process.env.NODE_ENV = 'test';
// const StateModel = require('../../../../app/database/models/core/state.model')
// const fs = require('fs');
// const expect = require('chai').expect;

// var readJson = (path, done) => {
//     fs.readFile(require.resolve(path),
//         (err, data) => {
//             if (err)
//                 done(err)
//             else
//                 done(null, JSON.parse(data))
//         })
// }

// describe('State Model Tests', () => {

//     it('should be invalid if name is missing', (done) => {
//         var model = new StateModel();

//         model.validate((err) => {
//             expect(err.errors.name).to.exist;
//             done();
//         });
//     });

//     it('should be invalid if abbreviation is missing', (done) => {
//         var model = new StateModel();

//         model.validate((err) => {
//             expect(err.errors.abbreviation).to.exist;
//             done();
//         });
//     });
// });