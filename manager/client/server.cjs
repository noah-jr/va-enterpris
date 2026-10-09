const express= require("express")
const path = require("path")



const app = express();

const appPath = path.join(__dirname, 'dist');


app.use(express.static(appPath));

// SPA fallback: handle all other requests by serving index.html
app.use((req, res) => {
  res.sendFile(path.join(appPath, 'index.html'));
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});