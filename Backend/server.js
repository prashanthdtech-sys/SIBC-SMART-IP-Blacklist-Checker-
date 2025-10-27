require('dotenv').config();
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000

app.use(cors());
app.use(express.json());

// Route
const blacklistRoute = require("./Routes/blackListRoute");

app.use("/api", blacklistRoute);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
