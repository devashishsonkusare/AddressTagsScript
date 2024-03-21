import pkg from 'pg';
const { Client } = pkg;
import fetch from 'node-fetch';

async function fetchEntityLabel(address) {
    const url = `https://www.oklink.com/api/v5/explorer/address/entity-label?chainShortName=BTC&address=${address}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Ok-Access-Key': '05045e6c-c119-44c3-8cd6-f616f4bfa941'
        }
    });
    const data = await response.json();
    return data.data.map(item => item.label || 'null').join(', ');
}

async function createOrUpdateTableAndProcessData() {
    const client = new Client({
        user: 'pg',
        host: '35.244.5.230',
        database: 'Postgres',
        password: 'pass',
        port: '5432',
    });

    try {
        await client.connect();

        const checkTableQuery = `SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE  table_schema = 'public' 
            AND    table_name   = 'bitcoin'
        )`;
        const { rows: tableCheckRows } = await client.query(checkTableQuery);
        const tableExists = tableCheckRows[0].exists;

        if (!tableExists) {
            const createTableQuery = `CREATE TABLE bitcoin (
                addresss TEXT PRIMARY KEY,
                label TEXT,
                risk TEXT DEFAULT NULL
            )`;
            await client.query(createTableQuery);
        }

        let page = 1;
        let hasNextPage = true;
        while (hasNextPage) {
            const url = `https://www.oklink.com/api/v5/explorer/transaction/transaction-list?chainShortName=BTC&limit=1000&page=${page}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Ok-Access-Key': '05045e6c-c119-44c3-8cd6-f616f4bfa941'
                }
            });
            const transactionData = await response.json();

            const uniqueAddresses = new Set();
            console.log('Transaction Data:', transactionData);

            transactionData.data[0].transactionList.forEach(transaction => {
                const inputs = transaction.input.split(',');
                const outputs = transaction.output.split(',');
                inputs.forEach(address => uniqueAddresses.add(address));
                outputs.forEach(address => uniqueAddresses.add(address));
            });

            for (const address of uniqueAddresses) {
                try {
                    const labels = await fetchEntityLabel(address);
                    if (labels.trim() !== '') {
                        const query = tableExists ?
                            'INSERT INTO bitcoin (addresss, label, risk) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING' :
                            'INSERT INTO bitcoin (addresss, label, risk) VALUES ($1, $2, $3)';
                        const values = [address, labels, ""];
                        console.log("ADDED", values)
                        await client.query(query, values);
                    } else {
                        console.log(`No labels found for address: ${address}`);
                    }
                } catch (error) {
                    if (error.code === '23505') {
                        console.log(`Duplicate entry: ${address}. Skipping insertion...`);
                    } else {
                        throw error;
                    }
                }

                await new Promise(resolve => setTimeout(resolve, 200));
            }

            if (transactionData.data[0].transactionList.length === 0) {
                hasNextPage = false;
            } else {
                page++;
            }
        }

        console.log('Data processed successfully!');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.end();
    }
}


createOrUpdateTableAndProcessData();
