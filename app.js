const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const kanjiRouter = requireq("./routes/kanjiRouter");
const userRouter = requireq("./routes/userRouter");
const vocabularioRouter = requireq("./routes/vocabularioRouter");

const app = express();

//MIDDLEWARES

//Security HTTP Headers
app.use(helmet());

//Limitar requests de una misma IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour",
});
app.use("/api", limiter);

//Body parser
app.use(express.json({ limit: "10kb" }));

//Data sanitization contra inyeccion de NoSQL query
app.use(mongoSanitize());

//Data sanitization contra XSS
app.use(xss());

//Prevenir parameter polution
//Lo que viene siendo poner 2 veces algo en los parametros como numTomos=3&numTomos=5
app.use(
  hpp({
    whitelist: [],
  })
);

//Archivos estaticos
app.use(express.static(`${__dirname}/public`));

//Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//Routes
app.use("/api/v1/kanjis", kanjiRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/vocabulario", vocabularioRouter);
app.all("*", (req, res, next) => {
  next(new AppError(`No se encontró ${req.originalUrl} en el servidor`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
