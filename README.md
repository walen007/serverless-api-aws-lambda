# Serverless API Application - Mini Employee Management System

Serverless API Application using SST, AWS Lambda, API Gateway, RDS Postgres, SQS and JWT Authorization

This project demonstrates:

- functionalities such as:

  - customer registration
  - customer authentication using email and password login
  - API access authorization using the JWT authorization system
  - employees bulk upload in either a .csv or .json file
  - rejection of file formats that are niether a .csv nor a .json file (e.g renaming a binary file like .png to .csv will abort during processing)
  - retrieval of upload reports either for a single upload using reportId or multiple reports
  - retrieval of an employee using the employeeId
  - retrieval of all employees of a particular customer with pagination
  - update of a single employee data
  - delete of a single employee record

- technologies such as:

  - serverless API application development using AWS Lambda
  - using Postgres database clusters on AWS Relational Database Service (RDS)
  - using AWS Simple Queue Service (SQS) for asynchronous inter-app messaging
  - password hashing mechanisms
  - Database migrations
  - Structured Query Language (SQL)'s DDL, DQL, DML and TCL
  - Domain Driven Design (not too strict)
  - configurable app settings
  - generation of sample data

## Run App in Development Mode

### Install NPM Modules

- Run **yarn install**

### Start dev server

- Run **yarn dev**
  <br><br>

## Dev Environment

This project was developed in VS Code IDE with Vitest, ESLint, Prettier plugin and Thunder Client plugin
<br><br>

### Miscellaneous

- Unit test is pending and will be added. I have struggles with SST to implement stand-alone tests during my alloted time
- I took the liberty to assume that I have discussed with the rest of the team (Product Manager, Devs etc) that the initial requirement did not implement the app to a usable state and I have been authorized to implement (registration, login, employee retrieval, manpulations etc) in the second iteration of the app which is already included in this app.
