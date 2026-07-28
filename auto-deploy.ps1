# ============================================================
#  EUM auto-deploy
#  - Stages/builds/commits/pushes changes -> Vercel auto-deploy
#  - Pushes ONLY if the build succeeds (protects live site)
#  - ASCII-only + $PSScriptRoot (no Korean string literals)
#  - git progress goes to stderr; we suppress it and check exit codes
# ============================================================

# NOTE: do NOT use ErrorActionPreference=Stop here.
# git prints normal info to stderr, which would otherwise abort the script.
$ErrorActionPreference = "Continue"

Set-Location -LiteralPath $PSScriptRoot

# Clear stray git locks (OneDrive can hold them)
Remove-Item ".git\index.lock", ".git\HEAD.lock" -Force -ErrorAction SilentlyContinue

# Fast-forward to remote so we never diverge (suppress all output)
git fetch origin main *>$null
git merge --ff-only origin/main *>$null

# Stage only deploy targets (avoid junk files)
git add src public index.html vite.config.js *>$null

# Nothing changed -> exit quietly
$changes = git status --porcelain -- src public index.html vite.config.js
if (-not $changes) {
    Write-Host ("[{0}] no changes - skip" -f (Get-Date -Format 'HH:mm'))
    exit 0
}

Write-Host ("[{0}] changes found - building..." -f (Get-Date -Format 'HH:mm'))
& npm run build *>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host ("[{0}] BUILD FAILED - push cancelled (live is safe)" -f (Get-Date -Format 'HH:mm'))
    exit 1
}

$stamp = Get-Date -Format "yyyy-MM-dd HH:mm"
git commit -m ("auto: design auto-deploy ({0})" -f $stamp) *>$null
git push origin main *>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host ("[{0}] DEPLOYED -> Vercel updates in 1-2 min" -f $stamp)
} else {
    Write-Host ("[{0}] PUSH FAILED (exit {1})" -f $stamp, $LASTEXITCODE)
    exit 1
}
