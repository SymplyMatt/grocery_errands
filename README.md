
# Woven Finance Backend Task

## Overview
This backend exercise involves building a Node.js/Express.js application that serves a REST API. The implementation is structured to manage profiles, contracts, and jobs between clients and contractors.

## API Documentation
- **API Base URL:** [https://woven-test-bfd5944cf619.herokuapp.com/](https://woven-test-bfd5944cf619.herokuapp.com/)
- **Swagger Documentation:** [https://woven-test-bfd5944cf619.herokuapp.com/doc](https://woven-test-bfd5944cf619.herokuapp.com/doc)

### User Authentication
Users authenticate by passing their `profile_id` in the request header. Once authenticated, the user's profile is accessible under `req.user`. Note that endpoints within the admin profile require the user to be logged in as an admin.

## Data Models
All models are located in the `src/models` folder:

### Profile
- Represents either a client or a contractor.
- Each profile has a `balance` property.

### Contract
- Represents a contract between a client and a contractor.
- Has three statuses: `new`, `in_progress`, and `terminated`.
- Only contracts with the status `in_progress` are considered active.

### Job
- Represents a job performed by a contractor under a contract.
- Contractors get paid for jobs by clients.

## API Endpoints
### Contracts
- **GET /contracts/:id**
  - Returns the contract only if it belongs to the calling profile.
  
- **GET /contracts**
  - Returns a list of non-terminated contracts belonging to a user (client or contractor).
  
### Jobs
- **GET /jobs/unpaid**
  - Retrieves all unpaid jobs for a user (client or contractor) under active contracts.
  
- **POST /jobs/:job_id/pay**
  - Clients can pay for a job if their balance is greater than or equal to the amount. The amount is transferred from the client's balance to the contractor's balance.

### Balances
- **POST /balances/deposit/:userId**
  - Allows a client to deposit money into their balance. A client can't deposit more than 25% of their total jobs to pay at the time of deposit.

### Admin Endpoints
- **GET /admin/best-profession?start=<date>&end=<date>**
  - Returns the profession that earned the most money for any contractor within the specified time range.
  
- **GET /admin/best-clients?start=<date>&end=<date>&limit=<integer>**
  - Returns the clients who paid the most for jobs within the specified time period. The limit query parameter should be applied (default is 2).

## Additional Features
To enhance the application, unit tests have been included to ensure the reliability of the implemented features.

## Submission
The completed assignment is available in the GitHub repository linked below, which includes a Postman Collection for testing the APIs.

- **GitHub Repository:** [Your GitHub Repository Link Here]

Thank you for the opportunity to work on this task! 🙏
