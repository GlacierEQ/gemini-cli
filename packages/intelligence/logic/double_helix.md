# Double Helix Logic Specification

## The Strands
- **Strand Alpha (The Record):** Notion & Airtable. 
  - *Purpose:* Strategic intent, task tracking, and structured long-term memory.
  - *Mode:* 2-way sync (Read tasks/status, Write logs/progress).
- **Strand Beta (The Forge):** GitHub & Gemini.
  - *Purpose:* Code implementation, reasoning, and versioned output.
  - *Mode:* 2-way sync (Read code/issues, Write PRs/commits/analysis).

## The Piston (The Engine)
The Piston acts as the dynamic interweaver:
1. **Pull (A):** Scans Notion/Airtable for "Pending" or "In Progress" tasks.
2. **Transform:** Uses Gemini to decompose tasks into GitHub implementation plans.
3. **Execute (B):** Generates branches and PRs on GitHub.
4. **Push (A):** Updates the original Notion/Airtable record with the GitHub PR link and completion status.

## The Pillars (Connectors)
Each connector is a modular Python class supporting `read()` and `write()` methods:
- `AirtablePillar`: Manages record-based state.
- `NotionPillar`: Manages page-based documentation and tasking.
- `GitHubPillar`: Manages the filesystem and repository state.
- `GeminiPillar`: Manages high-level reasoning and instruction synthesis.
