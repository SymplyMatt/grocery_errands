'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('jobs', [
      {
        id: '1d2a740e-4b9b-41b9-b1e1-4c8f1f572d43',
        title: 'Website Development for Local Business',
        description: 'Create a fully responsive and user-friendly website to enhance the online presence of a local business.',
        price: 1500.00,
        paid: false,
        completed: false,
        approvalStatus: 'pending',
        contractId: 'c0b16f1a-c5ac-4a08-91ad-0f4efa320bea',
        clientId: '6c714246-6dde-40a1-a209-616b09a22d59',  
        contractorId: 'b2a940ee-987c-4832-9fc4-bbceef7f54ac',  
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2f3b680f-5c9b-47c5-a00c-d2a0c6e4e404',
        title: 'Unique Logo Design for Startup',
        description: 'Develop a distinctive logo that captures the essence of a new startup and stands out in the market.',
        price: 800.00,
        paid: false,
        completed: true,
        approvalStatus: 'pending',
        contractId: 'c0b16f1a-c5ac-4a08-91ad-0f4efa320beb',
        clientId: 'b0edeee6-6cbf-4350-931c-a46a48f4d14c',  
        contractorId: 'c0b16f1a-c5ac-4a08-91ad-0f4efa320beb',  
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '3e4c890g-6d9c-48c9-b11d-e3c1d7f57865',
        title: 'Mobile Application Development for Android and iOS',
        description: 'Build a cross-platform mobile app that provides a seamless experience for users on both Android and iOS devices.',
        price: 2000.00,
        paid: false,
        completed: false,
        approvalStatus: 'pending',
        contractId: 'c0b16f1a-c5ac-4a08-91ad-0f4efa320beb',
        clientId: 'b0edeee6-6cbf-4350-931c-a46a48f4d14c',  
        contractorId: 'c0b16f1a-c5ac-4a08-91ad-0f4efa320beb',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('jobs', null, {});
  }
};
