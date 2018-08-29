/*global expect, describe, it*/

'use strict';

module.exports = function(knex) {
  var sinon = require('sinon');

  describe(knex.client.dialect + ' | ' + knex.client.driverName, function() {
    this.client = knex.client.dialect;
    this.driverName = knex.client.driverName;

    after(function() {
      return knex.destroy();
    });

    require('./schema')(knex);
    require('./migrate')(knex);

    require('./seed')(knex);
    require('./builder/inserts')(knex);
    require('./builder/selects')(knex);
    require('./builder/unions')(knex);
    require('./builder/joins')(knex);
    require('./builder/aggregate')(knex);
    require('./builder/updates')(knex);
    require('./builder/transaction')(knex);
    require('./builder/deletes')(knex);
    require('./builder/additional')(knex);
    require('./datatype/bigint')(knex);

    describe('knex.destroy', function() {
      it('should allow destroying the pool with knex.destroy', function() {
        var spy = sinon.spy(knex.client.pool, 'destroy');
        return knex
          .destroy()
          .then(function() {
            expect(spy).to.have.callCount(1);
            expect(knex.client.pool).to.equal(undefined);
            return knex.destroy();
          })
          .then(function() {
            expect(spy).to.have.callCount(1);
          });
      });
    });
  });

  describe('knex.initialize', function() {
    it('should allow initialize the pool with knex.initialize', function() {
      // TODO: fix to work with oracle too
      if (knex.client.driverName === 'oracledb') {
        return;
      }
      expect(knex.client.pool).to.equal(undefined);
      knex.initialize();
      expect(knex.client.pool.destroyed).to.equal(false);
      let waitForDestroy = knex.destroy();
      expect(knex.client.pool.destroyed).to.equal(true);
      return waitForDestroy.then(() => {
        expect(knex.client.pool).to.equal(undefined);
        knex.initialize();
        expect(knex.client.pool.destroyed).to.equal(false);
      });
    });
  });
};
