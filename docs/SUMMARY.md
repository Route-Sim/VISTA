# Summary

- [Overview](index.md)
- [Glossary](glossary.md)
- [Style Guide](style-guide.md)
- [API Reference](api-reference.md)

- Modules
  - app
    - [config](modules/app/config.md)

  - config
    - [docker](modules/config/docker.md)
    - [docker-compose](modules/config/docker-compose.md)

  - net
    - [index](modules/net/index.md)
    - [protocol/schema](modules/net/protocol/schema.md)
    - [protocol/mapping](modules/net/protocol/mapping.md)
    - [backoff](modules/net/backoff.md)
    - [events](modules/net/events.md)
    - [transport/browser-websocket](modules/net/transport/browser-websocket.md)
    - [request-tracker](modules/net/request-tracker.md)
    - [client](modules/net/client.md)

  - sim
    - [index](modules/sim/index.md)
    - domain
      - [index](modules/sim/domain/index.md)
      - [types](modules/sim/domain/types.md)
      - [node](modules/sim/domain/node.md)
      - [edge](modules/sim/domain/edge.md)
      - [road](modules/sim/domain/road.md)
      - [building](modules/sim/domain/building.md)
      - [depot](modules/sim/domain/depot.md)
      - [gas-station](modules/sim/domain/gas-station.md)
      - [site](modules/sim/domain/site.md)
      - [package](modules/sim/domain/package.md)
      - [truck](modules/sim/domain/truck.md)
      - [agent](modules/sim/domain/agent.md)
    - [state](modules/sim/state.md)
    - [selectors](modules/sim/selectors/index.md)
    - store
      - [index](modules/sim/store/index.md)
      - [simulation-state](modules/sim/store/simulation-state.md)
      - [simulation-store](modules/sim/store/simulation-store.md)
      - [snapshot-buffer](modules/sim/store/snapshot-buffer.md)
    - systems
      - [index](modules/sim/systems/index.md)
      - [advance](modules/sim/systems/advance.md)
    - adapters
      - [index](modules/sim/adapters/index.md)
      - [from-network](modules/sim/adapters/from-network.md)
      - [to-view](modules/sim/adapters/to-view.md)
