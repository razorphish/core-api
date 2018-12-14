process.env.NODE_ENV = 'test';

const RoleModel = require('../../../../app/database/models/auth/role.model');
const expect = require('chai').expect;

describe('Role Model Tests', () => {

    /**
     * Validations
     */
    it('should be invalid if name is missing', (done) => {
        var model = new RoleModel();

        model.validate((err) => {
            expect(err.errors.name).to.exist;
            done();
        });
    });

    it('should be invalid if normalizedName is missing', (done) => {
        var model = new RoleModel();

        model.validate((err) => {
            expect(err.errors.normalizedName).to.exist;
            done();
        });
    });

});