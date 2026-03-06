$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$distPath = Join-Path $root 'dist'
$releasePath = Join-Path $root 'release'
$packageFolder = Join-Path $releasePath 'SaveIn'
$zipPath = Join-Path $releasePath 'savein-extension.zip'

if (-not (Test-Path $distPath)) {
  Write-Host 'dist folder not found. Running build first...'
  Push-Location $root
  try {
    pnpm build
    if ($LASTEXITCODE -ne 0) {
      throw 'Build failed.'
    }
  }
  finally {
    Pop-Location
  }
}

New-Item -ItemType Directory -Path $releasePath -Force | Out-Null

if (Test-Path $packageFolder) {
  Remove-Item $packageFolder -Recurse -Force
}

New-Item -ItemType Directory -Path $packageFolder -Force | Out-Null

if (Test-Path $zipPath) {
  Remove-Item $zipPath -Force
}

$installText = @"
SaveIn - Installation Guide

1. Open Chrome and go to: chrome://extensions
2. Turn on Developer mode
3. Click Load unpacked
4. Select this SaveIn folder
5. Open LinkedIn and start using the extension

If the extension does not appear on LinkedIn, refresh the page once.
"@

Set-Content -Path (Join-Path $packageFolder 'INSTALL.txt') -Value $installText -Encoding ASCII
Copy-Item -Path (Join-Path $distPath '*') -Destination $packageFolder -Recurse -Force

Compress-Archive -Path $packageFolder -DestinationPath $zipPath -Force

Write-Host "Created release zip: $zipPath"
Write-Host 'Share this zip with users.'
Write-Host 'Users should extract it, open the SaveIn folder, read INSTALL.txt, then load that folder from chrome://extensions.'