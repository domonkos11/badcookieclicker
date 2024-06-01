const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://dbtitkosoldal:<password>@test0.812wltw.mongodb.net/?retryWrites=true&w=majority&appName=test0";
const inquirer = require('inquirer');
const http = require('http');
const fs = require('fs');
const port = 8080;

var toInsertMany = [
    {
        "numButton": 1,
        "numClicks": 100
    },
    {
        "numButton": 2,
        "numClicks": 200
    },
    {
        "numButton": 3,
        "numClicks": 300
    }
];
var toInsertOne = {
    "numImage": 1,
    "imageparams": "none"
}

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function connectClient() {
    try {
        await client.connect();
        console.log("Connected successfully to MongoDB");
    } catch (err) {
        console.error("MongoDB connection error: ", err);
    }
}

// Connect to the MongoDB client before starting the server
connectClient();

//temp test
async function listDocuments() {
  const database = client.db('newDb');
  const buttonClicksColl = database.collection('buttonClicks');
  try {
      const documents = await buttonClicksColl.find({}).toArray();
      console.log("Documents in buttonClicks collection:", documents);
  } catch (err) {
      console.error("Error listing documents:", err);
  }
}

// Call this function to list documents
listDocuments().catch(console.dir);


let handleRequest = async (request, response) => {
    let mainHtml = './index.html';
    let getClicks = '/clicks';

    if (request.url === '/') {
        fs.readFile(mainHtml, null, function (err, html) {
            if (err) {
                response.writeHead(500, { "Content-Type": "text/plain" });
                response.write("Internal Server Error");
                response.end();
                return;
            }
            response.writeHead(200, { "Content-Type": "text/html" });
            response.write(html);
            response.end();
        });
    }

    if (request.url === getClicks) {
        try {
            console.log("Getting clicks!");
            const dbse = client.db('newDb');
            const buttonClicksColl = dbse.collection('buttonClicks');
            const queryToUpdate = { "_id": new ObjectId("66574da002f3132499678745") };

            console.log("Running queryIt!");
            var currentClicks = await queryIt(queryToUpdate);
            console.log("Ran queryIt!");

            if (currentClicks && currentClicks.clicks !== undefined) {
                var newClicks = currentClicks.clicks + 1;
                var newValues = { $set: { clicks: newClicks } };

                console.log("Updating the value!");
                await buttonClicksColl.updateOne(queryToUpdate, newValues);

                response.writeHead(200, { "Content-Type": "text/html" });
                response.write("<p1>" + newClicks + "</p1>");
            } else {
                response.writeHead(404, { "Content-Type": "text/html" });
                response.write("<p1>No document found or clicks field is missing</p1>");
            }
            response.end();
        } catch (err) {
            console.error("Error handling /clicks request: ", err);
            response.writeHead(500, { "Content-Type": "text/html" });
            response.write("<p1>Internal Server Error</p1>");
            response.end();
        }
        console.log("Updated the value!");
    }
};

http.createServer(handleRequest).listen(port);
console.log('Server running at port ' + port);

async function queryIt(queryToQuery) {
    console.log("Started query!");
    const database = client.db('newDb');
    const buttonClicksColl = database.collection('buttonClicks');
    try {
        const result = await buttonClicksColl.findOne(queryToQuery);
        console.log("Got the result!", result);
        return result;
    } catch (err) {
        console.error("Error running queryIt: ", err);
        return null;
    }
}

// Insert Many (toInsertMany)
async function run2() {
    const database2 = client.db('newDb');
    const testColl = database2.collection('testCollection');
    try {
        await testColl.insertMany(toInsertMany);
        console.log("Sent the objects");
    } catch (err) {
        console.error("Error in run2: ", err);
    }
}

// Insert One (toInsertOne)
async function insertOneObject() {
    const database2 = client.db('newDb');
    const testColl = database2.collection('testCollection');
    try {
        await testColl.insertOne(toInsertOne);
        console.log("Sent the object");
    } catch (err) {
        console.error("Error in insertOneObject: ", err);
    }
}

// Create new collection
async function createColl(createCollectionName) {
    const database3 = client.db('newDb');
    try {
        await database3.createCollection(createCollectionName);
        console.log("Created the collection with the name " + createCollectionName);
    } catch (err) {
        console.error("Error in createColl: ", err);
    }
}

// Read if user wants to insert one or many
const questions = [
    {
        type: 'input',
        name: 'oneOrMultiple',
        message: 'Add one or many or create? (case sensitive)',
    },
    {
        type: 'input',
        name: 'createName',
        message: 'Name of new collection? (case sensitive)',
    },
];

/*
inquirer.prompt(questions).then(answers => {

    if(answers.oneOrMultiple == "one") {
        insertOneObject().catch(console.dir);
    }
    if(answers.oneOrMultiple == "many") {
        run2().catch(console.dir);
    }
    if(answers.oneOrMultiple == "create") {
        createColl(answers.createName).catch(console.dir);
    }
    
    console.log(answers.oneOrMultiple);
    console.log(answers.createName);
})
*/
