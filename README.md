# node-red-contrib-traffic-light [![npm](https://img.shields.io/npm/v/node-red-contrib-traffic-light.svg)](https://www.npmjs.com/package/node-red-contrib-traffic-light) <img height="20px" src="https://nodered.org/about/resources/media/node-red-hexagon.png">

![Example semaphore hardware](./docs/exampleHardware.jpg)

This is a Node-RED package to manage a traffic light.

### Life cycle

![Life cycle](./docs/lifeCycle.svg)

#### Stable states

- Only green
- Only red

#### Transition states

- Only orange
- Orange + red

### Example usage ([JSON export](./examples/ledSemaphore.json))

Motion sensor in bathroom + smart light with three leds

![Example nodes composition](./docs/exampleNode.png)

![Example node configuration](./docs/exampleConfiguration.png)
