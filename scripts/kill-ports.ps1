# Frees local dev ports (default: 3000, 3001 — Vite / vercel:dev) by killing
# whatever process is listening on them. Usage:
#   powershell -File scripts/kill-ports.ps1            # kills 3000, 3001
#   powershell -File scripts/kill-ports.ps1 5173 3000   # kills a custom list
param(
  [int[]]$Ports = @(3000, 3001)
)

$pids = Get-NetTCPConnection -LocalPort $Ports -State Listen -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique

if (-not $pids) {
  Write-Host "Nothing listening on: $($Ports -join ', ')"
  exit 0
}

foreach ($processId in $pids) {
  $proc = Get-Process -Id $processId -ErrorAction SilentlyContinue
  if ($proc) {
    Write-Host "Killing PID $processId ($($proc.ProcessName)) on port(s) $($Ports -join ', ')"
    Stop-Process -Id $processId -Force
  }
}
