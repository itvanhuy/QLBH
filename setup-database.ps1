# ============================================================
# Script khởi tạo database restaurant_db
# Chạy: .\setup-database.ps1 -Password "your_mysql_password"
# ============================================================
param(
    [Parameter(Mandatory=$true)]
    [string]$Password,
    [string]$User = "root",
    [string]$Host = "localhost"
)

$mysql   = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
$schema  = "d:\QLBH\database\schema.sql"
$seed    = "d:\QLBH\database\seed_data.sql"

Write-Host "=========================================="
Write-Host "  Restaurant DB Setup"
Write-Host "=========================================="

# Bước 1: Chạy schema
Write-Host "`n[1/2] Tạo schema database..."
$result = & $mysql -u $User -p"$Password" -h $Host --default-character-set=utf8mb4 < $schema 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "    ✅ Schema tạo thành công"
} else {
    Write-Host "    ❌ Lỗi: $result"
    exit 1
}

# Bước 2: Chạy seed data
Write-Host "`n[2/2] Nhập dữ liệu mẫu..."
$result = & $mysql -u $User -p"$Password" -h $Host --default-character-set=utf8mb4 < $seed 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "    ✅ Dữ liệu mẫu nhập thành công"
} else {
    Write-Host "    ❌ Lỗi: $result"
    exit 1
}

Write-Host "`n=========================================="
Write-Host "  ✅ Database sẵn sàng!"
Write-Host "  Database: restaurant_db"
Write-Host "  Tiếp theo: Cập nhật application.properties"
Write-Host "             spring.datasource.password=$Password"
Write-Host "=========================================="
