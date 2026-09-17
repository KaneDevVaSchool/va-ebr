# Khởi động frontend (Vite) — dùng trực tiếp node.exe thật của ServBay để
# tránh lớp wrapper npm.cmd/node.cmd gây lỗi "The system cannot find the
# path specified" khi npm cố spawn tiến trình con qua cmd.exe lồng nhau.
$nodeExe = "C:\ServBay\packages\node\current\node.exe"
$root = $PSScriptRoot

Set-Location $root
& $nodeExe "$root\node_modules\vite\bin\vite.js"
