'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('profiles', [
      {
        id: '6c714246-6dde-40a1-a209-616b09a22d59',
        type: 'client',
        profession: null,
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'b2a940ee-987c-4832-9fc4-bbceef7f54ac',
        type: 'contractor',
        profession: 'Developer',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'janesmith@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'b0edeee6-6cbf-4350-931c-a46a48f4d14c',
        type: 'client',
        profession: null,
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alicejohnson@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'c0b16f1a-c5ac-4a08-91ad-0f4efa320beb',
        type: 'contractor',
        profession: 'Designer',
        firstName: 'Bob',
        lastName: 'Brown',
        email: 'bobbrown@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('profiles', null, {});
  }
};
