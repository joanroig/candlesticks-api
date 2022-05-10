# Candlesticks API assumptions

As the system scope is open, some assumptions have been made:

## Instrument deletion

After deleting an instrument, the related quotes and handlesticks are deleted as well. If an instrument is added, but it was already there, the instrument and the candle history will be overwritten.

## Persistence

No persistence implemented, as everytime the system is bootstrapped all data needs to be cleared. The candlesticks are kept in a hashmap, and the old ones are removed after a configurable time (set the configuration clean-schedule to 0 in case you want to deactivate it).

In case the system needs to scale up with multiple instances, a mongodb database can be used to track the candlesticks, but some effort will be needed to ensure synchronous access and that all data is up to date.

## Out of order

As the system is thread-safe, there shouldn't be out of order quotes. Everytime a quote is received, the system itselfs assigns the timestamp, so the timings should be controlled.
The implementation checks if the new quote should update the open or close values, in case multiple instances will be running and updating a database in the future.

## Missing candlesticks

The provided candlesticks should be consistent in time. This means that between candlesticks and between the last candlestick and the current minute there should be no gaps.
To fill the gaps, the previous closest candlestick will be copied. To properly identify the copied candlestick, its timestamps will be changed to match the minute that is representing (open and close timestamps will be the start of the minute). The gap from the start of time to the first candlestick is ignored, as there is no previous data to be copied.

As an example, consider we have a list of candlesticks represented by the following rules:

- Each value is represented by a character and separated by spaces, and represents a candlestick in a minute.
- The representation is read from left to right, the first character is the first candlestick at start of time, followed by the next candlesticks, one per minute.
- Underscores are used for non-existing candlesticks in a given minute.
- A number represents when the candlestick data was originally generated (it indicates the minutes passed from the start of time).
- A repeated number means that the candlestick is reused, so its price data comes from a past minute.

In the example, a 9-minute window is used for simplicity. In case a user requests candlesticks at 22:09:30, data will be checked from the minutes 22:01, 22:02, [...], and 22:09, which results in a total of 9 candlesticks or less. The system will fill the results as it follows:

```
Source: 1 2 3 _ _ 6 7 8 9
Filled: 1 2 3 3 3 6 7 8 9
```

```
Source: _ _ 3 4 5 6 7 8 _
Filled: _ _ 3 4 5 6 7 8 8
```

```
Source: _ 2 _ _ 5 6 7 _ _
Filled: _ 2 2 2 5 6 7 7 7
```

Note that filled candlesticks are not persisted, and they are generated when a user requests the data.
This can occasionate the next circumstance, which is on purpose:

- A user requests data that contains cloned candlesticks
- Instantly after, a quote generates a candlestick that was missing in the previous response
- Instantly after, the same user requests the same data again. The response will be different, as one of the candlesticks is not cloned and it contains the real candlestick data instead of the cloned one.

## Reconnections

If the partner service is disconnected, all data must be cleared as the information will probably not be consistent.
