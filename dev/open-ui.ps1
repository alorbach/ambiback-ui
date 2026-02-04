param(
  [string]$ProxyHost = "https://ambiback.local",
  [string]$UiHost = "http://ambiback-ui.local"
)

$url = "$UiHost/#/system?device=$ProxyHost"
Write-Host "Opening: $url"
Start-Process $url
