'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('contracts', [
      {
        id: 'c0b16f1a-c5ac-4a08-91ad-0f4efa320bea',
        clientId: '6c714246-6dde-40a1-a209-616b09a22d59',
        contractorId: 'b2a940ee-987c-4832-9fc4-bbceef7f54ac', 
        status: 'new',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'c0b16f1a-c5ac-4a08-91ad-0f4efa320beb',
        clientId: 'b0edeee6-6cbf-4350-931c-a46a48f4d14c', 
        contractorId: 'c0b16f1a-c5ac-4a08-91ad-0f4efa320beb', 
        status: 'in_progress',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'c0b16f1a-c5ac-4a08-91ad-0f4efa320bec',
        clientId: '6c714246-6dde-40a1-a209-616b09a22d59', 
        contractorId: 'c0b16f1a-c5ac-4a08-91ad-0f4efa320beb', 
        status: 'new',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('contracts', null, {});
  }
};
