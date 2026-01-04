#!/bin/bash
# Wrapper that calls the original plugin script with the set -u bug fixed
# The bug: PROMPT_PARTS[*] fails with set -u when array is empty

#.claude/scripts/ralph-loop.sh --max-iterations=10 "prompt here"

PLUGIN_SCRIPT="~/.claude/plugins/cache/claude-plugins-official/ralph-wiggum/6d3752c000e2/scripts/setup-ralph-loop.sh"

# Fix: pipe modified script with 'set -eo pipefail' instead of 'set -euo pipefail'
sed 's/set -euo pipefail/set -eo pipefail/' "$PLUGIN_SCRIPT" | bash -s -- "$@"
