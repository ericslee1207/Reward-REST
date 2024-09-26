const express = require('express');
const app = express();
const port = 8000;
const { body, validationResult } = require('express-validator');

app.use(express.json());

let transactions = [];
let totalPoints = 0;

let payerPoints = {};

app.get('/', (req, res) => {
    res.send('Rewards REST API Base');
});

// O(1) runtime
app.get('/balance', (req, res) => {
    res.json(payerPoints);
});

// O(n) runtime, but realistically O(1)
app.post('/add', [
    body('payer').isString().withMessage('Payer must be a string').notEmpty().withMessage('Payer is required'),
    
    // points must be an integer
    body('points').isInt().withMessage('Points must be an integer'),
    
    // timestamp must be a valid ISO8601 date
    body('timestamp').isISO8601().withMessage('Timestamp must be a valid ISO 8601 date')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { payer, points, timestamp } = req.body;

    if ((payerPoints[payer] || 0) + points < 0) {
        return res.status(400).send("Payer's points cannot go negative");
    }
    
    let inserted = false;
    for (let i = 0; i < transactions.length; i++) {
        if (new Date(transactions[i].timestamp) < new Date(timestamp)) {
            transactions.splice(i, 0, { payer, points, timestamp });
            inserted = true;
            break;
        }
    }

    // If the transaction has the smallest timestamp, add it to the end
    if (!inserted) {
        transactions.push({ payer, points, timestamp });
    }

    totalPoints += points;
    payerPoints[payer] = (payerPoints[payer] || 0) + points;
    res.status(200).send("Transaction added successfully");
});

// O(n) runtime
app.post('/spend', [
    //points must be an integer
    body('points').isInt({min: 1}).withMessage('Points must be an integer').notEmpty().withMessage('Points is required')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { points } = req.body;
    
    // Check if the user has enough total points to spend
    if (totalPoints < points) {
        return res.status(400).send("User doesn't have enough points");
    }

    let paidAmounts = {};
    let pointsToSpend = points;

    // Iterate over the transactions from last to first (oldest first in descending order)
    for (let i = transactions.length - 1; i >= 0; i--) {
        if (pointsToSpend === 0) {
            break;
        }

        const transaction = transactions[i];

        if (transaction.points <= pointsToSpend) {
            // Spend all the points from the current transaction
            pointsToSpend -= transaction.points;

            // Update payer's paid amounts and points
            paidAmounts[transaction.payer] = (paidAmounts[transaction.payer] || 0) - transaction.points;
            payerPoints[transaction.payer] = (payerPoints[transaction.payer] || 0) - transaction.points;

            // Remove the transaction as it has been fully spent
            transactions.splice(i, 1);
        } else {
            // Spend only a portion of the points from the current transaction
            paidAmounts[transaction.payer] = (paidAmounts[transaction.payer] || 0) - pointsToSpend;
            payerPoints[transaction.payer] = (payerPoints[transaction.payer] || 0) - pointsToSpend;

            // Adjust the points in the current transaction
            transaction.points -= pointsToSpend;

            // No more points to spend
            pointsToSpend = 0;
        }
    }
    let paidList = [];
    for (const payer in paidAmounts) {
        paidList.push({ payer: payer, points: paidAmounts[payer] });
    }

    // Deduct the spent points from totalPoints
    totalPoints -= points;

    // Return the paid amounts per payer
    res.status(200).send(paidList);
});


module.exports = app;