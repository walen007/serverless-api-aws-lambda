# Serverless API Application - Employee Management System (Mini)

Serverless API Application using Node.js, SST, AWS Lambda, API Gateway, RDS Postgres, SQS and JWT Authorization

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
