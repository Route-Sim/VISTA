---
title: 'Glossary'
summary: 'Definitions of core terms used across the VISTA network, simulation, and rendering architecture.'
source_paths:
  - 'src/net/**'
  - 'src/sim/**'
last_updated: '2025-10-31'
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
