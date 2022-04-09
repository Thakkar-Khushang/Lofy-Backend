const express = require('express');
const cors = require('cors');

const app = express();

const logger = require('./config/logger.js');

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization, auth-token"
    );
    if (req.method === "OPTIONS") {
      res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
      return res.status(200).json({});
    }
    next();
});

app.use(cors())

app.get("/",(req,res)=>{
    return res.status(200).json({
        message: "Server is up and running"
    })
})

app.use("/customer", require("./routes/customer.routes"));
app.use("/business", require("./routes/business.routes"));
app.use("/order", require("./routes/order.routes"));
app.use("/product", require("./routes/product.routes"));

app.use((req, res, next) => {
  const error = new Error("Route not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

const PORT = 3000;

app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});
