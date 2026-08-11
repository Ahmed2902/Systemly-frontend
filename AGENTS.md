# Agent instructions

For any work related to Systemly multi-branch support, read `docs/agent/BRANCHES_IMPLEMENTATION_PLAN.md` before making a commit. Keep every intermediate change backward-compatible with one-branch production behavior, keep operational branch selection separate from analytics scope, and do not expose the Add Branch feature until the full rollout is ready.
