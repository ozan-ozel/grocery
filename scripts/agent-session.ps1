# scripts/agent-session.ps1 - local server lifecycle for an agent-driven browser session.
#
#   npm run agent-session -- status
#   npm run agent-session -- up [-EarlyRestore]
#   npm run agent-session -- down
#
# What it does: starts (or reuses) the local `npm run vercel:dev` server with the agent-login endpoint
# enabled, and tears it down again. Hard boundaries, all deliberate:
#
#   * It never reads any environment file, and never touches any secret or credential of any kind. It
#     never mints a login token either - that step needs the caller to present the agent secret, so it lives
#     in scripts/agent-mint.mjs, which the developer runs by hand in their own terminal.
#   * It only ever stops a process it started itself: the root PID *and* its process-start-time are recorded
#     and must both still match (guards against PID reuse), and the port listener is recorded only if it is a
#     descendant of that root. A server it did not start is never stopped, restarted or modified.
#   * If the port is already occupied it never takes over: a foreign server that already answers
#     `{"ready":true}` is simply reused (untouched, and `down` will not touch it); anything else is refused.
#   * The `.vercelignore` edit is transactional: state is written before every mutation, the edit is
#     byte-exact (the file uses CRLF), and every failure path restores it. `vercel dev` honors that file, so
#     while the line is commented out the endpoint is deployable - hence it is restored as early as is safe.
#
# State + server logs live OUTSIDE the repo in %LOCALAPPDATA%\grocery-agent-session\ (no credentials in them;
# the logs are never printed and are deleted by `down`).
#
# Exit codes: 0 ok, 1 failure (everything rolled back), 2 refused (nothing was modified).

[CmdletBinding()]
param(
  [Parameter(Position = 0)]
  [ValidateSet('up', 'down', 'status')]
  [string]$Action = 'status',

  # Restore .vercelignore right after the server is ready instead of at `down`, then verify the endpoint
  # survived. Experimental until confirmed live (see docs) - the default keeps the line commented until `down`.
  [switch]$EarlyRestore
)

Set-StrictMode -Version 2
$ErrorActionPreference = 'Stop'

$script:IgnoreLine   = 'api/agent-login.ts'
$script:MarkerPrefix = '#AGENT-SESSION-TEMP# '

# --- context (overridable by a test harness that dot-sources this file) -----------------------------------

function Start-DevServer($Ctx) {
  New-Item -ItemType Directory -Force -Path $Ctx.StateDir | Out-Null
  $npm = (Get-Command npm.cmd -ErrorAction Stop).Source
  Start-Process -FilePath $npm -ArgumentList @('run', 'vercel:dev') -WorkingDirectory $Ctx.Root `
    -WindowStyle Hidden -PassThru `
    -RedirectStandardOutput (Join-Path $Ctx.StateDir 'server.out.log') `
    -RedirectStandardError (Join-Path $Ctx.StateDir 'server.err.log')
}

function New-Context {
  param(
    [string]$Root = (Split-Path -Parent $PSScriptRoot),
    [int]$Port = 3000,
    [string]$StateDir = (Join-Path $env:LOCALAPPDATA 'grocery-agent-session'),
    [scriptblock]$StartServer = $null,
    [int]$ReadyTimeoutSec = 180
  )
  if (-not $StartServer) { $StartServer = { param($c) Start-DevServer $c } }
  return @{ Root = $Root; Port = $Port; StateDir = $StateDir; StartServer = $StartServer; ReadyTimeoutSec = $ReadyTimeoutSec }
}

# --- .vercelignore: exact, transactional, CRLF-preserving -------------------------------------------------

function Get-IgnorePath($Ctx) { return (Join-Path $Ctx.Root '.vercelignore') }

function Read-IgnoreText($Ctx) {
  $bytes = [System.IO.File]::ReadAllBytes((Get-IgnorePath $Ctx))
  if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
    throw '.vercelignore starts with a UTF-8 BOM; refusing to edit it.'
  }
  return (New-Object System.Text.UTF8Encoding($false)).GetString($bytes)
}

function Write-IgnoreText($Ctx, [string]$Text) {
  $path = Get-IgnorePath $Ctx
  $tmp = "$path.agent-session.tmp"
  try {
    [System.IO.File]::WriteAllBytes($tmp, (New-Object System.Text.UTF8Encoding($false)).GetBytes($Text))
    # [NullString]::Value, not $null: PowerShell would otherwise pass "" as the backup path and throw.
    [System.IO.File]::Replace($tmp, $path, [NullString]::Value)
  }
  finally {
    if (Test-Path -LiteralPath $tmp) { Remove-Item -LiteralPath $tmp -Force -ErrorAction SilentlyContinue }
  }
}

# 'active' = the line is live (endpoint disabled locally); 'toggled' = our marker is in place;
# 'other' = missing, duplicated, or commented some other way - never touched.
function Get-IgnoreState($Ctx) {
  $lines = (Read-IgnoreText $Ctx) -split "`n"
  $active = @($lines | Where-Object { $_ -match ('^' + [regex]::Escape($script:IgnoreLine) + '\r?$') }).Count
  $toggled = @($lines | Where-Object { $_ -match ('^' + [regex]::Escape($script:MarkerPrefix + $script:IgnoreLine) + '\r?$') }).Count
  if ($active -eq 1 -and $toggled -eq 0) { return 'active' }
  if ($active -eq 0 -and $toggled -eq 1) { return 'toggled' }
  return 'other'
}

function Convert-IgnoreLine($Ctx, [string]$From, [string]$To) {
  $text = Read-IgnoreText $Ctx
  $lines = $text -split "`n"
  $rx = '^' + [regex]::Escape($From) + '\r?$'
  $hits = @(0..($lines.Count - 1) | Where-Object { $lines[$_] -match $rx })
  if ($hits.Count -ne 1) { throw ".vercelignore does not contain exactly one '$From' line." }
  $i = $hits[0]
  $cr = ''
  if ($lines[$i].EndsWith("`r")) { $cr = "`r" }
  $lines[$i] = $To + $cr
  $newText = $lines -join "`n"
  Write-IgnoreText $Ctx $newText
  if (-not ((Read-IgnoreText $Ctx) -ceq $newText)) { throw '.vercelignore verification after write failed.' }
}

function Set-IgnoreToggled($Ctx) {
  if ((Get-IgnoreState $Ctx) -ne 'active') { throw ".vercelignore is not in the expected 'active' shape." }
  Convert-IgnoreLine $Ctx $script:IgnoreLine ($script:MarkerPrefix + $script:IgnoreLine)
}

# Returns 'restored' | 'already-active' | 'unexpected'.
function Restore-Ignore($Ctx) {
  switch (Get-IgnoreState $Ctx) {
    'toggled' { Convert-IgnoreLine $Ctx ($script:MarkerPrefix + $script:IgnoreLine) $script:IgnoreLine; return 'restored' }
    'active'  { return 'already-active' }
    default   { return 'unexpected' }
  }
}

# --- state file (no credentials; ticks stored as strings) -------------------------------------------------

function Get-StatePath($Ctx) { return (Join-Path $Ctx.StateDir 'state.json') }

function Read-State($Ctx) {
  $p = Get-StatePath $Ctx
  if (-not (Test-Path -LiteralPath $p)) { return $null }
  try { return (Get-Content -LiteralPath $p -Raw | ConvertFrom-Json) } catch { return $null }
}

function Write-State($Ctx, $State) {
  New-Item -ItemType Directory -Force -Path $Ctx.StateDir | Out-Null
  [System.IO.File]::WriteAllText((Get-StatePath $Ctx), ($State | ConvertTo-Json), (New-Object System.Text.UTF8Encoding($false)))
}

function New-StateObject {
  return [ordered]@{
    ownerPid = 0; ownerStartTicks = ''; listenerPid = 0; listenerStartTicks = ''
    startedServer = $false; ignoreToggled = $false; earlyRestore = $false
  }
}

# --- processes ---------------------------------------------------------------------------------------------

function Get-StartTicks([int]$ProcId) {
  try { return [string][System.Diagnostics.Process]::GetProcessById($ProcId).StartTime.ToUniversalTime().Ticks } catch { return $null }
}

# Ours only if the PID is alive AND its start time is exactly the recorded one.
function Test-Owned($ProcId, $Ticks) {
  if (-not $ProcId -or -not $Ticks) { return $false }
  $t = Get-StartTicks ([int]$ProcId)
  return ($null -ne $t -and $t -eq [string]$Ticks)
}

function Test-Descendant([int]$ProcId, [int]$AncestorId) {
  $cur = $ProcId
  for ($n = 0; $n -lt 32; $n++) {
    $p = Get-CimInstance Win32_Process -Filter "ProcessId=$cur" -ErrorAction SilentlyContinue
    if (-not $p) { return $false }
    $parent = [int]$p.ParentProcessId
    if ($parent -eq $AncestorId) { return $true }
    if ($parent -le 0) { return $false }
    $cur = $parent
  }
  return $false
}

function Get-ListenerPids([int]$Port) {
  return @(Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
      Select-Object -ExpandProperty OwningProcess -Unique)
}

function Describe-Pids($ProcIds) {
  return ((@($ProcIds) | ForEach-Object {
        $name = 'unknown'
        try { $name = (Get-Process -Id $_ -ErrorAction Stop).ProcessName } catch { }
        "pid $_ ($name)"
      }) -join ', ')
}

# Kills the process tree rooted at $ProcId only if it is provably ours. taskkill runs inside cmd so its own
# stderr chatter (e.g. a descendant that exited while the tree was being killed) never reaches the console.
function Stop-OwnedTree($ProcId, $Ticks) {
  if (-not (Test-Owned $ProcId $Ticks)) { return $false }
  & cmd.exe /c "taskkill.exe /PID $([int]$ProcId) /T /F >nul 2>&1"
  return $true
}

# Waits until the recorded PID + start time is no longer a live process (killing a tree is not instantaneous).
function Wait-NotOwned($ProcId, $Ticks, [int]$Seconds = 5) {
  $deadline = (Get-Date).AddSeconds($Seconds)
  while ((Get-Date) -lt $deadline) {
    if (-not (Test-Owned $ProcId $Ticks)) { return $true }
    Start-Sleep -Milliseconds 200
  }
  return (-not (Test-Owned $ProcId $Ticks))
}

# 'ready' | 'notready' | 'other' | 'unreachable' - only the boolean-only readiness probe, no secrets involved.
function Get-ReadyStatus([int]$Port) {
  try {
    $r = Invoke-WebRequest -Uri "http://localhost:$Port/api/agent-login?_debug=1" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    try { $j = $r.Content | ConvertFrom-Json } catch { return 'other' }
    $names = @($j.PSObject.Properties.Name)
    if ($names.Count -eq 1 -and $names[0] -eq 'ready') {
      if ($j.ready -eq $true) { return 'ready' }
      return 'notready'
    }
    return 'other'
  }
  catch {
    if ($_.Exception.Response) { return 'other' }
    return 'unreachable'
  }
}

# --- teardown (shared by `down` and by every failure path of `up`) ------------------------------------------

function Invoke-Teardown($Ctx) {
  $r = [ordered]@{ ignore = 'n/a'; server = 'none owned'; state = 'none' }
  $st = Read-State $Ctx

  # 1. Restore .vercelignore first - it is the deployability hazard, independent of process handling.
  try {
    switch (Get-IgnoreState $Ctx) {
      'toggled' { $r.ignore = Restore-Ignore $Ctx }
      'active'  { $r.ignore = 'already-active' }
      default   { $r.ignore = 'unexpected shape - left untouched' }
    }
  }
  catch { $r.ignore = 'ERROR restoring .vercelignore - check it by hand' }

  # 2. Stop only processes proven ours (PID + start time): the root's whole tree first (which normally takes the
  #    listener down with it), then the recorded listener on its own only if it is somehow still alive.
  if ($st -and $st.startedServer) {
    $rootStopped = $false
    $listenerStoppedSeparately = $false
    try { $rootStopped = [bool](Stop-OwnedTree $st.ownerPid $st.ownerStartTicks) } catch { }
    try {
      if ($st.listenerPid -and (Test-Owned $st.listenerPid $st.listenerStartTicks)) {
        if (-not ($rootStopped -and (Wait-NotOwned $st.listenerPid $st.listenerStartTicks 5))) {
          $listenerStoppedSeparately = [bool](Stop-OwnedTree $st.listenerPid $st.listenerStartTicks)
        }
      }
    } catch { }
    $what = 'root'
    if ($st.listenerPid) { $what = 'root and its listener' }
    if ($rootStopped -and -not $listenerStoppedSeparately) { $r.server = "owned process tree stopped ($what)" }
    elseif ($rootStopped) { $r.server = 'owned process tree stopped (the listener needed a separate stop)' }
    elseif ($listenerStoppedSeparately) { $r.server = 'owned listener stopped (the root had already exited)' }
    else { $r.server = 'recorded server no longer running (or PID/start-time no longer match - not touched)' }
  }

  # 3. Remove our own state and logs (logs are never read or printed), then the state directory itself - only
  #    that one directory, only if it is now empty (no -Recurse: it cannot delete anything that is still in it).
  foreach ($f in @((Get-StatePath $Ctx), (Join-Path $Ctx.StateDir 'server.out.log'), (Join-Path $Ctx.StateDir 'server.err.log'))) {
    if (Test-Path -LiteralPath $f) { Remove-Item -LiteralPath $f -Force -ErrorAction SilentlyContinue }
  }
  if ((Test-Path -LiteralPath $Ctx.StateDir) -and -not (Get-ChildItem -LiteralPath $Ctx.StateDir -Force | Select-Object -First 1)) {
    Remove-Item -LiteralPath $Ctx.StateDir -Force -ErrorAction SilentlyContinue
  }
  if ($st) { $r.state = 'removed' }
  return $r
}

# --- up -----------------------------------------------------------------------------------------------------

function Invoke-Up($Ctx, [switch]$EarlyRestore) {
  # 0. Leftover state from an earlier run.
  $st = Read-State $Ctx
  if ($st) {
    $live = $false
    if ($st.startedServer) {
      $live = (Test-Owned $st.ownerPid $st.ownerStartTicks) -or ($st.listenerPid -and (Test-Owned $st.listenerPid $st.listenerStartTicks))
    }
    if ($live -and (Get-ReadyStatus $Ctx.Port) -eq 'ready') {
      Write-Host "Already up: the server agent-session started earlier is running and ready on http://localhost:$($Ctx.Port)."
      return 0
    }
    Write-Host 'Found stale or broken agent-session state; cleaning it up first.'
    [void](Invoke-Teardown $Ctx)
  }

  # 1. Port occupancy - decided BEFORE anything is modified.
  $listeners = @(Get-ListenerPids $Ctx.Port)
  if ($listeners.Count -gt 0) {
    $who = Describe-Pids $listeners
    $ready = Get-ReadyStatus $Ctx.Port
    if ($ready -eq 'ready') {
      Write-Host "Port $($Ctx.Port) is already served by $who and its agent-login endpoint is ready. Reusing it. It was NOT started by agent-session: 'down' will never stop it, and nothing was modified."
      return 0
    }
    Write-Host "REFUSING: port $($Ctx.Port) is occupied by $who, which does not expose a ready agent-login endpoint (probe: $ready)."
    Write-Host 'agent-session never takes over, stops or restarts a process it did not start, and nothing was modified.'
    Write-Host 'To exercise the full start/stop lifecycle, free the port yourself first.'
    return 2
  }

  # 2. .vercelignore must be in the expected shape (we only ever undo our own edit).
  $shape = Get-IgnoreState $Ctx
  if ($shape -ne 'active') {
    Write-Host "REFUSING: .vercelignore is not in the expected shape (state: $shape) - the api/agent-login.ts line must be present exactly once and uncommented. Nothing was modified."
    return 2
  }

  # 3. Transaction. State is written before every mutation; any failure rolls everything back.
  $ok = $false
  $state = New-StateObject
  try {
    $state.earlyRestore = [bool]$EarlyRestore
    Write-State $Ctx $state

    $state.ignoreToggled = $true
    Write-State $Ctx $state          # intent recorded first, so a crash mid-edit is still recoverable
    Set-IgnoreToggled $Ctx

    $proc = & $Ctx.StartServer $Ctx
    $ticks = $null
    for ($k = 0; $k -lt 25 -and -not $ticks; $k++) {
      $ticks = Get-StartTicks $proc.Id
      if (-not $ticks) { Start-Sleep -Milliseconds 200 }
    }
    if (-not $ticks) { throw 'the server process exited immediately.' }
    $state.ownerPid = $proc.Id
    $state.ownerStartTicks = $ticks
    $state.startedServer = $true
    Write-State $Ctx $state

    $deadline = (Get-Date).AddSeconds($Ctx.ReadyTimeoutSec)
    $isReady = $false
    $notReadyStreak = 0
    while ((Get-Date) -lt $deadline) {
      if ($proc.HasExited) { throw "the server process exited before becoming ready (exit code $($proc.ExitCode))." }
      $s = Get-ReadyStatus $Ctx.Port
      if ($s -eq 'ready') { $isReady = $true; break }
      if ($s -eq 'notready') {
        $notReadyStreak++
        if ($notReadyStreak -ge 5) { throw "the server is up but reports the agent-login endpoint as not ready (a required variable is missing from the function's environment)." }
      }
      else { $notReadyStreak = 0 }
      Start-Sleep -Milliseconds 1500
    }
    if (-not $isReady) { throw "timed out after $($Ctx.ReadyTimeoutSec)s waiting for the agent-login endpoint to become ready." }

    $ours = @(Get-ListenerPids $Ctx.Port | Where-Object { ($_ -eq $proc.Id) -or (Test-Descendant $_ $proc.Id) })
    if ($ours.Count -eq 0) { throw 'the port answers, but its listener is not a process this script started; refusing to claim it.' }
    $state.listenerPid = [int]$ours[0]
    $state.listenerStartTicks = Get-StartTicks ([int]$ours[0])
    Write-State $Ctx $state

    if ($EarlyRestore) {
      $res = Restore-Ignore $Ctx
      if ($res -ne 'restored') { throw ".vercelignore could not be restored early (result: $res)." }
      $state.ignoreToggled = $false
      Write-State $Ctx $state
      Start-Sleep -Seconds 5          # give a file watcher time to react before re-probing
      for ($k = 0; $k -lt 2; $k++) {
        if ((Get-ReadyStatus $Ctx.Port) -ne 'ready') {
          throw 'EARLY RESTORE FAILED: the endpoint disappeared after .vercelignore was restored, so this vercel dev re-reads it. Use the default mode (no -EarlyRestore).'
        }
        Start-Sleep -Seconds 1
      }
    }
    $ok = $true
  }
  finally {
    if (-not $ok) {
      $r = Invoke-Teardown $Ctx
      Write-Host ("Rolled back: .vercelignore = " + $r.ignore + '; server = ' + $r.server + '; state = ' + $r.state)
    }
  }

  Write-Host "UP: server started (pid $($state.ownerPid)) and ready on http://localhost:$($Ctx.Port)."
  if ($EarlyRestore) {
    Write-Host '.vercelignore was restored right after readiness and the endpoint survived (verified twice).'
  }
  else {
    Write-Host 'NOTE: api/agent-login.ts is temporarily commented out in .vercelignore until `down` - do not deploy or commit in this state.'
  }
  Write-Host 'Next: run `npm run agent-mint` in your own terminal and paste the redeem URL to the agent. When finished: `npm run agent-session -- down`.'
  return 0
}

# --- status / down ------------------------------------------------------------------------------------------

function Invoke-Status($Ctx) {
  $listeners = @(Get-ListenerPids $Ctx.Port)
  if ($listeners.Count -gt 0) { Write-Host "port $($Ctx.Port): occupied by $(Describe-Pids $listeners)" }
  else { Write-Host "port $($Ctx.Port): free" }
  Write-Host ("agent-login probe: " + $(if ($listeners.Count -gt 0) { Get-ReadyStatus $Ctx.Port } else { 'n/a (nothing listening)' }))
  $st = Read-State $Ctx
  if ($st) {
    $alive = Test-Owned $st.ownerPid $st.ownerStartTicks
    Write-Host "agent-session state: server owned (pid $($st.ownerPid), $(if ($alive) { 'alive' } else { 'not running' }))"
  }
  else { Write-Host 'agent-session state: none' }
  $shape = Get-IgnoreState $Ctx
  $desc = switch ($shape) {
    'active'  { 'active (agent-login endpoint disabled locally - the normal, deploy-safe state)' }
    'toggled' { 'TEMPORARILY COMMENTED by agent-session (run `down`; do not deploy/commit like this)' }
    default   { 'unexpected shape' }
  }
  Write-Host ".vercelignore: $desc"
  return 0
}

function Invoke-Down($Ctx) {
  $r = Invoke-Teardown $Ctx
  Write-Host ".vercelignore: $($r.ignore)"
  Write-Host "server: $($r.server)"
  Write-Host "state: $($r.state)"
  $left = @(Get-ListenerPids $Ctx.Port)
  if ($left.Count -gt 0) { Write-Host "port $($Ctx.Port) is still occupied by $(Describe-Pids $left) - not started by agent-session, so it was left alone." }
  return 0
}

function Invoke-Main {
  $ctx = New-Context
  $code = 1
  try {
    switch ($Action) {
      'up'     { $code = @(Invoke-Up $ctx -EarlyRestore:$EarlyRestore)[-1] }
      'down'   { $code = @(Invoke-Down $ctx)[-1] }
      'status' { $code = @(Invoke-Status $ctx)[-1] }
    }
  }
  catch {
    # `up` has already rolled everything back by the time it throws; keep the message plain.
    Write-Host "FAILED: $($_.Exception.Message)"
    $code = 1
  }
  exit ([int]$code)
}

# Dot-sourcing (a test harness) loads the functions without running anything.
if ($MyInvocation.InvocationName -ne '.') { Invoke-Main }
