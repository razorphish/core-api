// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

// Require the dev-dependencies

//* *OTHER LIBRARIES */
// let assert = require('assert');

// describe('**NODEJS SERVER**', function () {

//     const url = 'http://localhost:3002';
//     const postData = ''
//     const options = {
//         hostname: 'http://localhost',
//         port: 3002,
//         path: '/api/about',
//         method: 'GET',
//         headers: {
//             'Content-Type': 'application/x-www-form-urlencoded',
//             'Content-Length': Buffer.byteLength(postData)
//         }
//     }

//     before(() => {
//         server.listen(3002);
//     });

//     describe('/::Main page', () => {

//         it('should return 200', function (done) {
//             http.get(url, function (res) {
//                 expect(res.statusCode).to.equal(200);
//                 //assert.equal(200, res.statusCode);
//                 done();
//             });
//         });

//         it('should say "Hello, world!"', function (done) {
//             http.get(url, function (res) {
//                 var data = '';

//                 res.on('data', function (chunk) {
//                     data += chunk;
//                 });

//                 res.on('end', function () {
//                     //assert.equal('Hello, world!\r\n', data);
//                     expect(data).to.equal('Hello, world!\r\n');
//                     done();
//                 });
//             });
//         });
//     });

//     // describe('./About::does not exist', () => {

//     //     it('status', function (done) {
//     //         http.get(options,
//     //             function (response) {
//     //                 expect(response.statusCode).to.equal(404);
//     //                 done();
//     //             });
//     //     });
//     // })

//     after(() => {
//         server.close();
//     })
// });
