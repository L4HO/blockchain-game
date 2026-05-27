$ErrorActionPreference = "Stop"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$DataDir = Join-Path $Root ".geth"

if (Test-Path $DataDir) {
  Remove-Item -LiteralPath $DataDir -Recurse -Force
  Write-Host "Removed $DataDir"
} else {
  Write-Host "No local Geth data directory found."
}
