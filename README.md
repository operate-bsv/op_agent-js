# Operate | Agent (js)

**Operate | Agent (js)** is a JavaScript agent used to load and run programs (known as "tapes") encoded in Bitcoin SV transactions.

## About Operate

Operate is a toolset to help developers build applications, games and services on top of Bitcoin (SV). It lets you write functions, called "Ops", and enables transactions to become small but powerful programs, capable of delivering new classes of services layered over Bitcoin.

More infomation:

* [Project website](https://www.operatebsv.org)
* [API documentation](https://operate-bsv.github.io/op_agent-js)

## Installation

Install using NPM:

```console
npm install @operate/agent
```

```javascript
const Operate = require('@operate/agent')
```

Or use in the browser via CDN (adds `Operate` to the global namespace):

```html
<script src="//unpkg.com/@operate/agent@latest/dist/operate.min.js"></script>
```

## Quick start

### Aliases

To kick the styles, set up some aliases for common Bitcom protocol prefixes. This will allow you to load and run tapes from common services such as Bitpaste, Twetch, WeatherSV, Bit.sv and more.

```javascript
Operate.config.quickStartAliases()
```

### Load and run a tape

Operate can be used straight away to load and run tapes from transactions.

```javascript
const tape = await Operate.loadTape(txid)
const result = await Operate.runTape(tape)
```

Operate always returns table structures from the Lua environment as a JavaScript `Map`. If preferred, these can be converted to an `Object` for easier data traversal and access.

```javascript
Operate.util.mapToObject(result)
```

## Beta software

This software should be considered beta. There are a few known issues and things that may change over time:

* API changes. The current implmentation closely mirrors the design of the [Elixir agent](https://github.com/operate-bsv/op_agent). Elixir and JavaScript semantics are quite different so over time the API design may change to reflect more idiomatic JavaScript styles.
* Error handling sucks. If something goes wrong, especially in the Lua VM, the error you get back will almost certainly not be very useful. This will be improved over time.
* Bundle size. The minimised bundle currently weighs in at over 700kb! I think it will be possible to get this under 300kb, but this will take work and time.


## License

[MIT License](https://github.com/operate-bsv/op_agent-js/blob/master/LICENSE.md).

© Copyright 2020 Chronos Labs Ltd.