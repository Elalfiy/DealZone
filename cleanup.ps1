# Safe PowerShell cleanup script for DealZone project
# Usage: .\cleanup.ps1 [operation]
# Operations: clean-node, clean-build, clean-all, reset-db

param(
    [string]$operation = "clean-all"
)

function Clean-Node {
    Write-Host "🧹 Cleaning node_modules and npm cache..." -ForegroundColor Cyan
    
    if (Test-Path "node_modules") {
        Remove-Item -Path "node_modules" -Recurse -Force
        Write-Host "✓ Removed node_modules" -ForegroundColor Green
    }
    
    if (Test-Path "package-lock.json") {
        Remove-Item -Path "package-lock.json" -Force
        Write-Host "✓ Removed package-lock.json" -ForegroundColor Green
    }
}

function Clean-Build {
    Write-Host "🧹 Cleaning build artifacts..." -ForegroundColor Cyan
    
    if (Test-Path "dist") {
        Remove-Item -Path "dist" -Recurse -Force
        Write-Host "✓ Removed dist/" -ForegroundColor Green
    }
    
    if (Test-Path "DealZone.API/bin") {
        Remove-Item -Path "DealZone.API/bin" -Recurse -Force
        Write-Host "✓ Removed DealZone.API/bin/" -ForegroundColor Green
    }
    
    if (Test-Path "DealZone.API/obj") {
        Remove-Item -Path "DealZone.API/obj" -Recurse -Force
        Write-Host "✓ Removed DealZone.API/obj/" -ForegroundColor Green
    }
}

function Clean-All {
    Write-Host "⚠️  Full cleanup starting..." -ForegroundColor Yellow
    Clean-Node
    Clean-Build
    Write-Host "✓ Cleanup complete!" -ForegroundColor Green
}

function Reset-Database {
    Write-Host "⚠️  Resetting database..." -ForegroundColor Yellow
    Push-Location "DealZone.API"
    
    try {
        Write-Host "Dropping current migrations..." -ForegroundColor Cyan
        dotnet ef database drop --force --no-build
        
        Write-Host "Removing migration files..." -ForegroundColor Cyan
        if (Test-Path "Migrations") {
            Get-ChildItem "Migrations" -Filter "*.cs" | Where-Object { $_.Name -notmatch "DbContextModelSnapshot" } | Remove-Item -Force
            Write-Host "✓ Old migrations removed" -ForegroundColor Green
        }
        
        Write-Host "Creating fresh migration..." -ForegroundColor Cyan
        dotnet ef migrations add InitialCreate
        
        Write-Host "Applying migration..." -ForegroundColor Cyan
        dotnet ef database update
        
        Write-Host "✓ Database reset complete!" -ForegroundColor Green
    }
    finally {
        Pop-Location
    }
}

# Execute operation
switch ($operation.ToLower()) {
    "clean-node" { Clean-Node }
    "clean-build" { Clean-Build }
    "clean-all" { Clean-All }
    "reset-db" { Reset-Database }
    default {
        Write-Host "Unknown operation: $operation" -ForegroundColor Red
        Write-Host "Available operations: clean-node, clean-build, clean-all, reset-db" -ForegroundColor Yellow
    }
}
