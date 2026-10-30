#!/usr/bin/env pwsh
Push-Location (Join-Path $PSScriptRoot 'maximum-main')
try {
    vercel --prod @args
} finally {
    Pop-Location
}
