import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';

sqlite3.verbose();

const app = express();
const port = process.env.PORT || 5000;

const db = new sqlite3.Database('workflows.db', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connesso al database SQLite');

        db.run(`CREATE TABLE IF NOT EXISTS operations (
            id INTEGER PRIMARY KEY,
            name TEXT,
            description TEXT,
            date TEXT,
            deliveryTime TEXT,
            state TEXT
        )`, (err) => {
            if (err) {
                console.error("Errore durante la creazione della tabella 'operations':", err.message);
            } else {
                console.log("Tabella 'operations' già presente/creata con successo");
            }
        });
    }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/getOperations', (req, res) => {
    db.all('SELECT * FROM operations', (err, rows) => {
        if (err) {
            res.status(500).send(err);
            return;
        } else {
            res.status(200).json(rows);
        }
    });
});

app.delete('/api/deleteOperation/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM operations WHERE id = ?', id, (err) => {
        if (err) {
            res.status(500).send(err);
            return;
        } else {
            res.status(200).send('Event deleted');
        }
    });
});

app.post('/api/addOperation', (req, res) => {
    const operation = req.body;
    db.run('INSERT INTO operations (name, description, date, deliveryTime, state) VALUES (?, ?, ?, ?, ?)', [operation.name, operation.description, operation.date, operation.deliveryTime, operation.state], (err) => {
        if (err) {
            res.status(500).send(err);
            return;
        } else {
            res.status(200).send('Event added');
        }
    });
});

app.patch('/api/updateStateOperation/:id', (req, res) => {
    const id = req.params.id;
    const state = req.body.state;
    db.run('UPDATE operations SET state = ? WHERE id = ?', [state, id], (err) => {
        if (err) {
            res.status(500).send(err);
            return;
        } else {
            res.status(200).send('Event state updated');
        }
    });
});

app.patch('/api/updateOperation/:id', (req, res) => {
    const id = req.params.id;
    const operation = req.body;
    db.run('UPDATE operations SET name = ?, description = ?, date = ?, deliveryTime = ?, state = ? WHERE id = ?', [operation.name, operation.description, operation.date, operation.deliveryTime, operation.state, id], (err) => {
        if (err) {
            res.status(500).send(err);
            return;
        } else {
            res.status(200).send('Event updated');
        }
    });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});