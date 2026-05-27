$ErrorActionPreference = "Stop"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$DataDir = Join-Path $Root ".geth\dev"

New-Item -ItemType Directory -Force -Path $DataDir | Out-Null

Write-Host "Starting local Geth dev network"
Write-Host "RPC: http://127.0.0.1:8545"
Write-Host "Chain ID: 1337"
Write-Host "Data dir: $DataDir"

geth `
  --dev `
  --dev.period 1 `
  --datadir $DataDir `
  --http `
  --http.addr "127.0.0.1" `
  --http.port 8545 `
  --http.api "eth,net,web3,personal,miner,txpool" `
  --http.corsdomain "*" `
  --http.vhosts "*" `
  --allow-insecure-unlock `
  --verbosity 3
