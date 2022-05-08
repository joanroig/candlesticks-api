# Candlesticks API assumptions

As the system scope is open, some assumptions have been made:

## Authentication

TODO

## Calculations

We assume that not all candlesticks will be needed at the same time, so we save each quote with a timestamp to calculate the candlesticks on demand.
TODO: A real-time calculation mode can be enabled via the config.

## Number of users

TODO: Test how many users can handle, and check how to increase it (load balancer?)

## Instrument deletion

After deleting an instrument, the related quotes and handlesticks are deleted as well.
