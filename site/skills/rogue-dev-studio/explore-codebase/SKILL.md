---
name: explore-codebase
description: >-
  Pattern for efficiently exploring codebases using parallel subagents.
  Use when you need to understand code structure, find patterns, or gather context.
---

# Explore Codebase Skill

Pattern for exploring codebases efficiently with parallel subagents.

## When to Load This Skill

- You need to understand parts of the codebase
- You're gathering context before making decisions
- You need to find patterns, conventions, or existing implementations

## Exploration Strategy

### For Quick Searches (Do Yourself)

Use Glob / Grep when looking for a specific thing.

### For Broad Understanding (Spawn Explorers)

Spawn parallel explorer subagents with a focused query, hints, and scope.
Return structured YAML: findings, patterns_observed, related_areas, gaps.

### Synthesize Results

Combine explorer outputs into coherent understanding: common patterns,
integration points, constraints, and gaps.

## Principles

- **Parallel over sequential** — spawn multiple explorers at once
- **Breadth over depth** — explore broadly first
- **Structured output** — always produce YAML summaries
- **Note gaps** — what you couldn't find matters

## Attribution

<!-- ATTRIBUTION: Rogue Development | https://github.com/rogue-dev-studio | DO-NOT-REMOVE -->
Part of **Rogue Market Agent** by [Rogue Development](https://github.com/rogue-dev-studio) (`@rogue-dev-studio`).
