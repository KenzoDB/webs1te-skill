# Installs the webs1te skill pack into ~/.claude/skills and reports missing dependencies.
# Usage (PowerShell): powershell -ExecutionPolicy Bypass -File .\install.ps1
$ErrorActionPreference = "Stop"

$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$dest = if ($env:CLAUDE_SKILLS_DIR) { $env:CLAUDE_SKILLS_DIR } else { Join-Path $HOME ".claude\skills" }
New-Item -ItemType Directory -Force $dest | Out-Null

Get-ChildItem (Join-Path $here "skills") -Directory | ForEach-Object {
    $target = Join-Path $dest $_.Name
    if (Test-Path $target) {
        $bak = "$target.bak-$(Get-Date -Format yyyyMMddHHmmss)"
        Move-Item $target $bak
        Write-Host "  backed up existing $($_.Name)"
    }
    Copy-Item $_.FullName $target -Recurse
    Write-Host "OK $($_.Name)"
}

Write-Host "`nDependencies:"
function Check($name, $hint) {
    if (Test-Path (Join-Path $dest $name)) { Write-Host "  OK $name" } else { Write-Host "  MISSING $name - $hint" }
}
Check "taste-skill" "required (art direction scripts). Install it into $dest\taste-skill"
Check "playwright-cli" "required for parallel browsing: npm i -g @playwright/cli; playwright-cli install --skills"
Check "web-design-guidelines" "recommended (QA): from vercel-labs/agent-skills"
Check "founder-competitors" "optional (strategy)"
Check "founder-brand" "optional (new brands)"
Check "replica-deploy" "optional (deploy step)"
if (Get-Command node -ErrorAction SilentlyContinue) { Write-Host "  OK node $(node -v)" } else { Write-Host "  MISSING node 22+" }

Write-Host "`nPlugins (run inside Claude Code, optional but recommended):"
Write-Host "  /plugin marketplace add pbakaus/impeccable            then /plugin install impeccable@impeccable"
Write-Host "  /plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill  then /plugin install ui-ux-pro-max@ui-ux-pro-max-skill"
Write-Host "`nDone. Start a NEW Claude Code session and type: /webs1te <your links>"
