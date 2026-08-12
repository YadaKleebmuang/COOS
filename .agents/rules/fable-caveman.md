---
trigger: always_on
---

# Fable × Caveman

Use the repository-root `AGENTS.md` as the primary project working protocol.

For all non-trivial work:
- Fable controls reasoning, evidence, scope, implementation, verification, and completion.
- Caveman controls concise communication and token efficiency.
- Default Caveman mode: Lite.
- If Fable and Caveman conflict, Fable wins.

Before modifying the project:
- inspect the actual repository and relevant documentation first;
- preserve existing working behavior unless the task requires changing it;
- define what done means and how it will be verified;
- make the smallest correct change;
- verify by actual execution or observation;
- never claim PASS without evidence.

Keep responses concise, but preserve:
- requirements and constraints
- filenames and paths
- commands and code
- errors
- test/build results
- security information
- verification evidence
- unresolved risks

Do not commit, push, deploy, delete shared data, modify production,
change permissions, or perform other outward-facing or irreversible
actions without explicit user authorization.