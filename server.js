const app = require('./index');
const port = 8000;


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

