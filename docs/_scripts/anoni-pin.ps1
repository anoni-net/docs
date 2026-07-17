#
# anoni-pin.ps1 — pin the latest IPFS mirror of the anoni.net docs site (Windows / PowerShell).
#
# Usage: make sure an IPFS daemon (IPFS Desktop or kubo) is running, then
#   powershell -NoProfile -ExecutionPolicy Bypass -File .\anoni-pin.ps1
# Run it on a schedule with Task Scheduler every 6 hours or so. See the docs.
#
# Docker users:
#   $env:IPFS_CMD = "docker exec ipfs_host ipfs"
#
# Design: pin the new version first, only then unpin the old one. If resolving
# or fetching fails, keep the copy you already have.
#

# The docs site's IPNS name (public value, same as DNSLink _dnslink.anoni.net)
$IPNS = 'k51qzi5uqu5dlfm2jj0f70ex3r3babmwy8qh071inwknttr7wqa3uhdwvlmrmw'

# Remembers the last CID we pinned, so we can unpin it next time
$State = if ($env:ANONI_PIN_STATE) { $env:ANONI_PIN_STATE } else { Join-Path $env:LOCALAPPDATA 'anoni-pin\last_cid.txt' }
New-Item -ItemType Directory -Force -Path (Split-Path $State) | Out-Null

# Override the ipfs command via IPFS_CMD (see the Docker note). Split into exe + prefix args.
$cmd   = if ($env:IPFS_CMD) { $env:IPFS_CMD } else { 'ipfs' }
$parts = $cmd -split '\s+'
$exe   = $parts[0]
$pre   = @()
if ($parts.Length -gt 1) { $pre = $parts[1..($parts.Length - 1)] }
function Invoke-Ipfs { & $exe @pre @args }

# 1. Resolve the IPNS name to the current CID (--nocache forces a fresh lookup)
$New = (Invoke-Ipfs name resolve --nocache "/ipns/$IPNS" 2>$null | Out-String).Trim()
if ([string]::IsNullOrWhiteSpace($New)) {
    Write-Host '[anoni-pin] resolve failed (network or node issue), keeping current state'
    exit 0
}

$Old = if (Test-Path $State) { (Get-Content $State -Raw).Trim() } else { '' }
if ($New -eq $Old) {
    Write-Host "[anoni-pin] already on the latest version $New, nothing to do"
    exit 0
}

# 2. Pin the new version first. Check LASTEXITCODE (not exceptions); on failure keep the old version.
Write-Host "[anoni-pin] pinning new version: $New"
Invoke-Ipfs pin add $New
if ($LASTEXITCODE -ne 0) {
    Write-Host '[anoni-pin] pin add failed, keeping the old version'
    exit 1
}

# 3. Record state, unpin the old version, reclaim space
Set-Content -Path $State -Value $New -NoNewline
if ($Old -and $Old -ne $New) {
    Write-Host "[anoni-pin] unpinning old version: $Old"
    Invoke-Ipfs pin rm $Old 2>$null
}
Invoke-Ipfs repo gc 2>$null | Out-Null
Write-Host "[anoni-pin] done, now pinning $New"
