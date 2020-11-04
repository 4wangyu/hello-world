require('dotenv').config();

//require the Elasticsearch librray
const elasticsearchLoading = require('@elastic/elasticsearch');
const indexNameLoading = 'cities';
const dataJsonFile = './cities.json';
// instantiate an Elasticsearch client
const loadIndexclient = new elasticsearchLoading.Client({
  cloud: {
    id: process.env.ES_HOST,
  },
  auth: {
    username: process.env.ES_USER,
    password: process.env.ES_PASS,
  },
});
// ping the client to be sure Elasticsearch is up
loadIndexclient.ping(
  {
    requestTimeout: 30000,
  },
  function (error) {
    // at this point, elastic search is down, please check your Elasticsearch service
    if (error) {
      console.error('Elasticsearch cluster is down!');
    } else {
      console.log('Everything is ok');
    }
  }
);
// create a new index
loadIndexclient.indices.create(
  {
    index: indexNameLoading,
  },
  function (error, response, status) {
    if (error) {
      console.log(error);
    } else {
      console.log('created a new index', response);
    }
  }
);
// add 1 data to the index that has already been created
loadIndexclient.index(
  {
    index: indexNameLoading,
    type: 'cities_list',
    body: {
      Key1: 'Content for key one',
      Key2: 'Content for key two',
      key3: 'Content for key three',
    },
  },
  function (error, response, status) {
    console.log(response);
  }
);

// require the array of cities that was downloaded
const cities = require(dataJsonFile);
// declare an empty array called bulk
let bulk = [];
//loop through each city and create and push two objects into the array in each loop
//first object sends the index and type you will be saving the data as
//second object is the data you want to index
cities.forEach((city) => {
  bulk.push({
    index: {
      _index: indexNameLoading,
      _type: 'cities_list',
    },
  });
  bulk.push(city);
});
//perform bulk indexing of the data passed
loadIndexclient.bulk({ body: bulk }, function (err, response) {
  if (err) {
    // @ts-ignore
    console.log('Failed Bulk operation'.red, err);
  } else {
    // @ts-ignore
    console.log('Successfully imported %s'.green, cities.length);
  }
});
