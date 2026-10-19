@echo off
setlocal
for /f %%i in ('powershell -Command "$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 0); $listener.Start(); $port = $listener.LocalEndpoint.Port; $listener.Stop(); Write-Output $port"') do set FREE_PORT=%%i
echo Starting server on port %FREE_PORT%...
start /b powershell -Command "Start-Sleep -Seconds 4; Start-Process 'chrome' 'http://localhost:%FREE_PORT%'"
npm run dev -- --port %FREE_PORT%
