import app from "./app";

const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || "localhost";

app.listen({ port: PORT, host: HOST }, () => {
  console.log(`Server is listening to port ${PORT}`);
});