const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require('path');
require('dotenv').config()
const Sentry = require('@sentry/node');

const api = require('./src/api');

const app = express();

const { databaseConnection } = require('./src/database');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(cors());

app.use('/upload', express.static(path.join(__dirname, 'uploads/')));
app.use('/quiz', express.static(path.join(__dirname, 'uploads/quiz/')));

//connection with mongo db
databaseConnection();

//route call
api(app);

if(process.env.SENTRY_URL){
    Sentry.init({
        dsn: process.env.SENTRY_URL,
        integrations: [
            // enable HTTP calls tracing
            new Sentry.Integrations.Http({ tracing: true }),
            // enable Express.js middleware tracing
            new Sentry.Integrations.Express({ app }),
            // Automatically instrument Node.js libraries and frameworks
            ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),
        ],
    
        // Set tracesSampleRate to 1.0 to capture 100%
        // of transactions for performance monitoring.
        // We recommend adjusting this value in production
        tracesSampleRate: 1.0,
    });
    
    // RequestHandler creates a separate execution context, so that all
    // transactions/spans/breadcrumbs are isolated across requests
    app.use(Sentry.Handlers.requestHandler());
    // TracingHandler creates a trace for every incoming request
    app.use(Sentry.Handlers.tracingHandler());
}

app.listen({ port: process.env.PORT }, () => console.log(`🚀 Server ready at http://localhost:` + process.env.PORT))
    .on('error', (err) => {
        console.log(err);
        process.exit();
    })
    .on('close', () => {
        channel.close();
    });