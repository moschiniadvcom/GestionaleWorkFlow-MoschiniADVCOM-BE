import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';
import { format } from 'date-fns';
import { it } from 'date-fns/locale/it';

dotenv.config();

const db = new pg.Pool({
    connectionString: process.env.SECRET_DB_CONN_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const app = express();
const port = process.env.PORT || 5000;

db.connect((err) => {
    if (err) {
        console.error('connection error', err.stack);
    } else {
        console.log('Connesso al database Workflows');
    }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/getOperations', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM operations');
        res.status(200).send(result.rows);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.delete('/api/deleteOperation/:id', async (req, res) => {
    const id = req.params.id;
    
    try {
        await db.query('DELETE FROM operations WHERE id = $1', [id]);
        res.status(200).json({ message: "Operazione eliminata" });
    } catch (err) {
        res.status(500).send(err);
    }
});

app.post('/api/addOperation', async (req, res) => {
    const operation  = req.body;

    const descriptions = operation.description.map((desc) => desc.description);

    const delivery_time_date = new Date(operation.delivery_time);
    const formatted_delivery_time = format(delivery_time_date, 'dd LLLL yyyy', { locale: it });

    try {
        await db.query('INSERT INTO operations (id, name, description, delivery_time, state) VALUES ($1, $2, $3, $4, $5)', [operation.id, operation.name, descriptions, formatted_delivery_time, operation.state]);
        res.status(201).json({ message: "Operazione aggiunta" });
    } catch (err) {
        res.status(500).send(err);
    }
});

app.patch('/api/updateStateOperation/:id', async (req, res) => {
    const id = req.params.id;
    const state = req.body.state;
    
    try {
        await db.query('UPDATE operations SET state = $1 WHERE id = $2', [state, id]);
        res.status(200).json({ message: "Stato operazione aggiornato" });
    } catch (err) {
        res.status(500).send(err);
    }
});

app.put('/api/updateOperation/:id', async (req, res) => {
    const id = req.params.id;
    const operation = req.body;

    const descriptions = operation.description.map((desc) => desc.description);

    const delivery_time_date = new Date(operation.delivery_time);
    const formatted_delivery_time = format(delivery_time_date, "dd LLLL yyyy", {
      locale: it,
    });
    
    try {
        await db.query('UPDATE operations SET name = $1, description = $2, delivery_time = $3, state = $4 WHERE id = $5', [operation.name, descriptions, formatted_delivery_time, operation.state, id]);
        res.status(200).json({ message: "Operazione aggiornata" });
    } catch (err) {
        res.status(500).send(err);
    }
}); 

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});