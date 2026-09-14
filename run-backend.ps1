# ============================================================
# Script chạy Spring Boot Backend
# ============================================================
$mvn     = "d:\QLBH\maven\bin\mvn.cmd"
$backend = "d:\QLBH\backend"

Write-Host "=========================================="
Write-Host "  Đang khởi động Backend Spring Boot..."
Write-Host "  Port: 8080"
Write-Host "  Nhấn Ctrl+C để dừng"
Write-Host "=========================================="

Set-Location $backend
& $mvn spring-boot:run
