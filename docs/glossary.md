---
title: 'Glossary'
summary: 'Definitions of core terms used across the VISTA network, simulation, and rendering architecture.'
source_paths:
  - 'src/net/**'
  - 'src/sim/**'
last_updated: '2025-11-01'
owner: 'Mateusz Nędzi'
tags: ['glossary', 'net', 'sim', 'architecture']
links:
  parent: './SUMMARY.md'
  siblings: []
---

# Glossary

- Action: Client-sent command envelope with a literal `action` name and typed `params`.
- Signal: Server-sent notification envelope with a literal `signal` name and typed `data`.
- Envelope: Discriminated message shape carrying a `action|signal` tag and payload.
- request_id: Correlation key; included in actions and echoed by server in signals when supported.
- Matcher: Predicate that decides whether an incoming signal satisfies a pending request.
- Backoff (exponential): Reconnect delay increases exponentially up to a max; jitter randomizes delay.
- Transport: Platform-specific WebSocket wrapper implementing connect/send/close and events.
- Event Bus: Minimal observer for subscribing to typed signals or connection events.
- Request Tracker: Tracks in-flight requests and resolves them when a matching signal arrives or times out.
- HUD Container: Reusable card wrapper with title and hide action for on-screen panels.
- Playback Controller: Optional adapter that accepts playback commands (play, pause, resume, stop, setTickRate) from the HUD for future @net wiring.
-
- Net Telemetry: Lightweight, typed stream of connection lifecycle and IO events (incoming/outgoing) for diagnostics and HUD display.
- Instrumented Transport: Decorator around the WebSocket transport that surfaces `connecting`, `open/close/error`, `incoming`, and `outgoing` as observable events without modifying the core client.
- Net Events Panel: HUD panel that renders the telemetry stream with filters, timestamps, and expandable details for debugging.
