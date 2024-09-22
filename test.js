const request = require('supertest')
const express = require('express')

const app = require('./index')


const validTransaction1 = {
    payer: 'DANNON',
    points: 300,
    timestamp: '2022-10-31T10:00:00Z',
};

const validTransaction2 = {
    payer: 'UNILEVER',
    points: 200,
    timestamp: '2022-10-31T11:00:00Z',
}

const validTransaction3 = {
    payer: 'DANNON',
    points: -200,
    timestamp: '2022-10-31T15:00:00Z',
}

const validTransaction4 = {
    payer: 'MILLER COORS',
    points: 10000,
    timestamp: '2022-11-01T14:00:00Z',
}

const validTransaction5 = {
    payer: 'DANNON',
    points: 1000,
    timestamp: '2022-11-02T14:00:00Z',
}

const invalidTransaction1 = {
    payer: '',
    points: "4t50",
    timestamp: '10/20/1990'
}

const invalidTransaction2 = {
    payer: 'UNILEVER',
    points: -500,
    timestamp: '2022-11-02T14:00:00Z'
}

describe('POST /add', () => {
    it('add valid transaction1', async () => {
        const response = await request(app)
            .post('/add')
            .send(validTransaction1)
            .expect(201);
        expect(response.body).toEqual({});
    });

    it('add valid transaction2', async () => {
        const response = await request(app)
            .post('/add')
            .send(validTransaction2)
            .expect(201);
        expect(response.body).toEqual({});
    });

    it('add valid transaction3', async () => {
        const response = await request(app)
            .post('/add')
            .send(validTransaction3)
            .expect(201);
        expect(response.body).toEqual({});
    });

    it('add valid transaction4', async () => {
        const response = await request(app)
            .post('/add')
            .send(validTransaction4)
            .expect(201);
        expect(response.body).toEqual({});
    });

    it('add valid transaction5', async () => {
        const response = await request(app)
            .post('/add')
            .send(validTransaction5)
            .expect(201);
        expect(response.body).toEqual({});
    });

    it('add invalid transaction1', async () => {
        const response = await request(app)
            .post('/add')
            .send(invalidTransaction1)
            .expect(400);
        expect(response.body.errors.length).toBeGreaterThan(0); 
    });

    it('add invalid transaction2', async () => {
        const response = await request(app)
            .post('/add')
            .send(invalidTransaction2)
            .expect(400);
    });

})

describe('POST /spend', () => {
    it('spend valid amount', async () => {
        const spendTransaction = await request(app)
            .post('/spend')
            .send({ points: 5000 })
            .expect(201);

        expect(spendTransaction.body).toEqual([
            { payer: "DANNON", points: -100 },
            { payer: "UNILEVER", points: -200 },
            { payer: "MILLER COORS", points: -4700},
        ]);
        
    })

    it('spend too much points', async () => {
        const spendTransaction = await request(app)
            .post('/spend')
            .send({ points: 7000 })
            .expect(400);

    })

    it('spend invalid points', async () => {
        const spendTransaction = await request(app)
            .post('/spend')
            .send({ points: -100 })
            .expect(400);

        expect(spendTransaction.body.errors.length).toBeGreaterThan(0);
    })
})

describe('GET /balance', () => {
    it('check balance', async () => {
        const checkBalance = await request(app)
            .get('/balance')
            .expect(200);

        expect(checkBalance.body).toEqual({
            "DANNON": 1000,
            "UNILEVER" : 0,
            "MILLER COORS": 5300
        });
        
    })
})