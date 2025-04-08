const express = require("express");
const path = require("path");
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

const buildPath = path.join(__dirname, "build");
console.log(`Serving build from: ${buildPath}`);
if (fs.existsSync(buildPath)) {
  console.log('Build folder exists');
} else {
  console.error('Build folder does not exist');
}

app.use(express.static(buildPath));
app.get("*", (req, res) => {
  const indexPath = path.join(buildPath, "index.html");
  console.log(`Sending file: ${indexPath}`);
  res.sendFile(indexPath);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});