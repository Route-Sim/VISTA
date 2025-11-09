# Summary

- [Overview](index.md)
- [Glossary](glossary.md)
- [Style Guide](style-guide.md)
- [API Reference](api-reference.md)

- Modules
  - [main](modules/main.md)
  - app
    - [config](modules/app/config.md)

  - config
    - [docker](modules/config/docker.md)
    - [docker-compose](modules/config/docker-compose.md)
    - [vite](modules/config/vite.md)

  - net
    - [index](modules/net/index.md)
    - [protocol/schema](modules/net/protocol/schema.md)
    - [protocol/mapping](modules/net/protocol/mapping.md)
    - [backoff](modules/net/backoff.md)
    - [events](modules/net/events.md)
    - [transport/browser-websocket](modules/net/transport/browser-websocket.md)
    - [transport/instrumented-transport](modules/net/transport/instrumented-transport.md)
    - [telemetry](modules/net/telemetry.md)
    - [request-tracker](modules/net/request-tracker.md)
    - [client](modules/net/client.md)

  - sim
    - [index](modules/sim/index.md)
    - domain
      - [entities](modules/sim/domain/entities.md)
      - [enums](modules/sim/domain/enums.md)
    - adapters
      - [wire-net-to-sim](modules/sim/adapters/wire-net-to-sim.md)
    - store
      - [sim-store](modules/sim/store/sim-store.md)
      - [reducers](modules/sim/store/reducers.md)

  - hud
    - [index](modules/hud/index.md)
    - containers
      - [play-controls](modules/hud/containers/play-controls.md)
      - [camera-help](modules/hud/containers/camera-help.md)
      - [net-events](modules/hud/containers/net-events.md)
      - [map-creator](modules/hud/containers/map-creator.md)
      - [fleet-creator](modules/hud/containers/fleet-creator.md)
      - [start-simulation](modules/hud/containers/start-simulation.md)
    - components
      - [map-graph](modules/hud/components/map-graph.md)
    - state
      - [playback-state](modules/hud/state/playback-state.md)
