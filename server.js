const app = require("./src/app");

const PORT = 5000;

const server = app.listen(PORT, () => {
  console.log("Web Service Is Starting !!!");
});

process.on("SIGINT", () => {
  server.close(() => console.log("Exit Server Express"));
});
