#!/usr/bin/env bash
# Installs the webs1te skill pack into ~/.claude/skills and reports missing dependencies.
# Usage: ./install.sh            (macOS, Linux, Git Bash on Windows)
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
dest="${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}"
mkdir -p "$dest"

for s in "$here"/skills/*/; do
  name="$(basename "$s")"
  if [ -d "$dest/$name" ]; then
    mv "$dest/$name" "$dest/$name.bak-$(date +%Y%m%d%H%M%S)"
    echo "  backed up existing $name"
  fi
  cp -R "$s" "$dest/$name"
  echo "✓ $name"
done

echo
echo "Dependencies:"
check() { [ -d "$dest/$1" ] && echo "  ✓ $1" || echo "  ✗ $1 — $2"; }
check taste-skill "required (art direction scripts). Install it into $dest/taste-skill"
check playwright-cli "required for parallel browsing: npm i -g @playwright/cli && playwright-cli install --skills"
check web-design-guidelines "recommended (QA): from vercel-labs/agent-skills"
check founder-competitors "optional (strategy)"
check founder-brand "optional (new brands)"
check replica-deploy "optional (deploy step)"
command -v node >/dev/null && echo "  ✓ node $(node -v)" || echo "  ✗ node 22+ required"
command -v python >/dev/null || command -v python3 >/dev/null && echo "  ✓ python" || echo "  ✗ python 3 (optional, ui-ux-pro-max search)"
echo
echo "Plugins (run inside Claude Code, optional but recommended):"
echo "  /plugin marketplace add pbakaus/impeccable            then /plugin install impeccable@impeccable"
echo "  /plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill  then /plugin install ui-ux-pro-max@ui-ux-pro-max-skill"
echo
echo "Done. Start a NEW Claude Code session and type: /webs1te <your links>"
