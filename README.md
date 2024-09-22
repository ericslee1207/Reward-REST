# Fetch Rewards Technical Project (Backend Software Engineering)
REST API service that accepts POST and GET HTTP requests 

## Outline
* A user starts with no points in their account
* Payers can either add or subtract points from a user in the form of transactions
* A user cannot spend more points than they possess
* When a user spends points, older timestamp transactions are processed first 

## Tools Used
[Node](https://nodejs.org/),
[Express](https://expressjs.com/),
[Express Validator](https://express-validator.github.io/docs/),
[jest](https://jestjs.io/),
[supertest](https://www.npmjs.com/package/supertest)

## Database
* There are no official databases used. All data are stored as in-memory variables, so restarting server will also refresh the data

## Getting Started
1) [Node] version v22.9.0 is recommended.
  Verify Node version
    ```
    node --version
    ```
2) Clone GitHub Repository
    ```
    git clone https://github.com/ericslee1207/Reward-REST.git
    ```
3) Navigate to project's root directory
    ```
    cd [path to Rewards-REST]
    ```
4) Install node dependencies
    ```
    npm i
    ```
5) Start the server
    ```
    node server.js
    ```
    Terminal should output
    ```
    Server running on http://localhost:8000
    ```
6) Open http://localhost:8000 to see "Rewards-REST"

**TESTING APIs**

* Postman is recommended for testing the APIs. 

**API ENDPOINTS**

* URL: http://localhost:8000
* POST /add
    * Purpose: Add a transaction for a payer
    * Request Body: 
        ```
        {
            "payer": "DANNON",
            "points": 1000,
            "timestamp": "2024-09-21T10:00:00Z"
        }
        ```
    * Response:
        * Returns 400 if the input is invalid (e.g., missing or incorrect fields).
        * Returns 400 if trying to add points that would result in a negative balance for the payer.

* POST /spend
    * Purpose: Spend points, starting with the oldest transactions (FIFO)
    * Request Body:
        ```
        {
            "points": 500
        }
        ```
    * Response
        ```
        [
            { "payer": "DANNON", "points": -100 },
            { "payer": "UNILEVER", "points": -200 },
            { "payer": "MILLER COORS", "points": -4700 }
        ]
        ```
        * Returns 400 if the user does not have enough points to spend.
        * Returns 200 and a list of
payer names with the number of points that were subtracted

    NOTE: If a negative points are added to a payer, it is treated as if points are deducted from the payer. However, if deducting the points would make the payer's balance go negative, it returns error code 400

* GET /balance
    * Purpose: Fetch the current point balance per payer
    * Response
        ```
        {
            "DANNON": 500,
            "UNILEVER": 0
        }
        ```
* Running Tests
    * To run provided tests, run the following command in the terminal
        ```
        npm test
        ```


