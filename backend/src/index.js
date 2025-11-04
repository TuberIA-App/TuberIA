const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => res.send('Hola TuberIA mundo!'));

app.listen(PORT, () => console.log(`Server hosted successfully on http://localhost:${PORT}`));
