/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
process.env.NODE_ENV = 'test';

const { expect } = require('chai');
const UserModel = require('../../../../app/database/models/account/user.model');

describe('User Model Tests', () => {
  /**
   * Validations
   */
  it('should be invalid if email is missing', (done) => {
    const model = new UserModel();

    model.validate((err) => {
      expect(err.errors.email).to.exist;
      expect(err.errors.email_lower).to.exist;
      done();
    });
  });

  // it('should be invalid if status is missing', (done) => {
  //     var model = new UserModel();

  //     model.validate((err) => {
  //         expect(err.errors.status).to.exist;
  //         done();
  //     });
  // });

  it('should be invalid if username is missing', (done) => {
    const model = new UserModel();

    model.validate((err) => {
      expect(err.errors.username).to.exist;
      expect(err.errors.username_lower).to.exist;
      done();
    });
  });

  // it('should be invalid if password is missing', (done) => {
  //     var model = new UserModel();

  //     model.validate((err) => {
  //         expect(err.errors.password).to.exist;
  //         done();
  //     });
  // });
});
