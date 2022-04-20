require("dotenv").config();
const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');
const mongoose = require('mongoose');
const Customer = require('./models/customer.model');
const Business = require('./models/business.model');
const Product = require('./models/product.model');
const Order = require('./models/order.model');

const app = express();
const logger = require('./config/logger.js');

//Connect to MongoDB client using mongoose
mongoose
  .connect(process.env.DBURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    logger.info('Database Connected');
    Customer.init();
    Business.init();
    Product.init();
    Order.init();
  })
  .catch((err) => {
    logger.error(`System: NIL >> ${err.toString()}`);
  });

mongoose.Promise = global.Promise;

//Use body-parser to parse json body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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

app.listen(PORT, () => {
    logger.info(`Server is running on port ${process.env.PORT || 3000}`);
});
