/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
process.env.NODE_ENV = 'test';

const { expect } = require('chai');
const RoleModel = require('../../../../app/database/models/auth/role.model');

describe('Role Model Tests', () => {
  /**
   * Validations
   */
  it('should be invalid if name is missing', (done) => {
    const model = new RoleModel();

    model.validate((err) => {
      expect(err.errors.name).to.exist;
      done();
    });
  });

  it('should be invalid if normalizedName is missing', (done) => {
    const model = new RoleModel();

    model.validate((err) => {
      expect(err.errors.normalizedName).to.exist;
      done();
    });
  });
});
