# Candlesticks API

[![Tests CI](https://github.com/joanroig/candlesticks-api/actions/workflows/tests.yml/badge.svg)](https://github.com/joanroig/candlesticks-api/actions/workflows/tests.yml)

System that enables users to view price histories.
It will receive updates from a partner service, transform these updates and provide the aggregated data through an endpoint.

> The implementation is based on [assumptions](ASSUMPTIONS.md) to develop an MVP within 5 days.

## Content

- Intro and terminology
- Setup
- Future Development Discussion

## Intro and terminology

#### Instruments and Quotes

Every asset that can be traded is represented by an “instrument”, which has a unique identifier (ISIN).
Each time the instrument price changes, an update message called “quote” is broadcasted for this instrument to inform about the change.

#### What is a candlestick?

A [candlestick](https://en.wikipedia.org/wiki/Candlestick_chart) is a representation that describes the price movement for a given instrument in a fixed amount of time, usually one minute.
We will be using a simplified version of candlesticks for this system.

The basic idea is that we don't need to know about _all_ prices changes within a given timeframe.
Usually we want them grouped in 1 minute chunks, because we are more interested in some key data points within any given minute.
In theory, a candlestick “contains” all quotes, where the timestamp of the quote is higher than the openTimestamp and lower than the closeTimestamp (`openTimestamp <= quoteTimestamp < closeTimestamp`).
However, for each candle for each given minute, we only present the following data points to the user:

- the first quotes price, that was received (openPrice)
- the last quotes, that was received (closePrice)
- the highest quote price that was observed (highPrice)
- the lowest quote price that was observed (lowPrice)
- the timestamp when the candlestick was opened (openTimestamp)
- the timestamp when the candlestick was closed (closeTimestamp)

##### Example

Assume the following (simplified) data was received for an instrument:

```
@2019-03-05 13:00:05 price: 10
@2019-03-05 13:00:06 price: 11
@2019-03-05 13:00:13 price: 15
@2019-03-05 13:00:19 price: 11
@2019-03-05 13:00:32 price: 13
@2019-03-05 13:00:49 price: 12
@2019-03-05 13:00:57 price: 12
@2019-03-05 13:01:00 price: 9
```

The resulting minute candle would have these attributes:

```
openTimestamp: 2019-03-05 13:00:00
openPrice: 10
highPrice: 15
lowPrice: 10
closePrice: 12
closeTimestamp: 13:01:00
```

Note that the last received quote with a price of 9 is not part of this candlestick anymore, but belongs to the new candlestick.

### Input data

The input data is received through a websocket stream from a partner service.
There are two types of input messages:

- Instrument additions/deletions, which adds or removes an instrument from our catalog
- Instrument price updates, giving the most recent price for a specific instrument

### Output (Aggregated-Price History)

The output is the aggregated price history endpoint.
It should provide a 30 minutes quotes history in the form of minute candlesticks (check information below) for any requested instrument.

End-users of the service are interested in a specific instrument's price history, and they want it in a format that is easy to read.
Hence, we should provide candlesticks.
To get these candlesticks, the user needs to provide the instrument id (ISIN) as a query parameter (e.g. `http://localhost:9000/candlesticks?isin={ISIN}`).

The system only needs to return the candlesticks for the last 30 minutes, including the most recent prices.
If there weren't any quotes received for more than a minute, instead of missing candlesticks in the 30-minute window, values from the previous candle are reused.

# Setup

We will use Node.js with Typescript and Express to build the API.

## Framework Requirements

- Node 16 environment
- NPM and Yarn
- An IDE

### Running the Partner Service

To run a partner service, you can either use docker-compose. Docker v3 or above will require slight changes to the docker-compose files.

```
docker-compose up -d
```

or Java

```
java -jar partner-service-1.0.1-all.jar --port=8032
```

or Yarn

```
yarn start:partner-service
```

### Running the app

Install the dependencies first:

```
yarn
```

To run the app you can use the following yarn commands

```
yarn build && yarn start
```

To run the app for development purposes, you can use the following yarn command

```
yarn start:dev
```

Once the server is running, you can check the results at

```
http://localhost:9000/candlesticks?isin={ISIN}
```

### Running the tests

Run the tests with:

```
yarn test
```

To get the coverage and open the lcov-report:

```
yarn test:coverage
```

The coverage report will be available in the root folder.

You can also check the coverage from the continuous integration workflow:
https://github.com/joanroig/candlesticks-api/actions/workflows/tests.yml

### Environment configuration

Use the config folder to specify the configuration of the app depending on the environment. The configuration file name should match the node environment value.

Example to configure a production environment in a Dockerfile step, which will use production.json:

```
# Set node environment to production
ENV NODE_ENV production
```

### PartnerService

This repository includes a runnable JAR (the partner service) that provides the websockets mentioned below.
Running the jar in a terminal with `-h` or `--help` will print how to use it.
The default port is `8080`, but we use `8032` for the following examples.

Once started, it provides two websocket streams (`ws://localhost:8032`), plus a website preview of how the stream look (http://localhost:8032).

- `/instruments` provides the currently available instruments with their ISIN and a Description

  - when connecting to the stream, it gives all currently available Instruments
  - once connected, it streams the addition/removal of instruments
  - Our partners assured us, that ISINS are unique, but can in rare cases be reused once no Instrument with that ISIN is available anymore (has been deleted, etc.)

- `/quotes` provides the most current price for an instrument every few seconds per available instrument

If you restart the PartnerService, you will have to clean up any data you might have persisted, since it will generate new ISINs and does not retain state from any previous runs.

#### /instrument Specification

The `/instruments` websocket provides all currently active instruments `onConnect`, as well as a stream of add/delete events of instruments.
When you receive a `DELETE` event, the instrument is no longer available and will not receive any more quotes (beware of out of order messages on the /quotes stream)
The instruments are uniquely identified by their isin. Beware, ISINs can be reused _after_ an instrument has been deleted.
In any case, you would see a regular ADD event for this new instrument, even when it reuses an ISIN.

```
{
    // The type of the event. ADD if an instrument is ADDED
    // DELETE if an instrument is deleted
    "type": "DELETE"
    {
        //The Payload
        "data": {
            //The Description of the instrument
            "description": "elementum eos accumsan orci constituto antiopam",
            //The ISIN of this instrument
            "isin": "LS242I164451"
        }
    }
}
```

#### /quotes Specification

The `/quotes` Websocket provides prices for available instruments at an arbitrary rate.
It only streams prices for available instruments (beware of out of order messages).

```
{
    // The type of the event.
    // QUOTE if an new price is available for an instrument identified by the ISIN
    "type": "QUOTE"
    {
        //The Payload
        "data": {
            //The price of the instrument with arbitray precision
            "price": 1365.25,
            //The ISIN of this instrument
            "isin": "LS242I164451"
        }
    }
}
```

## Future Development

The following questions will be taken into account when integrating the system in a production environment.

- How could this system be changed to provide scaling capabilities to 50.000 (or more) available instruments, each streaming quotes between once per second and every few seconds?
- How could this system be built in a way that supports failover capabilities so that multiple instances of the system could run simultaneously?
