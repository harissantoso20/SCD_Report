$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add('http://localhost:8080/')
$listener.Start()
Write-Host "Server started at http://localhost:8080/"
Write-Host "Membuka browser..."
Start-Process "http://localhost:8080/"
Write-Host "Tekan Ctrl+C untuk menghentikan server."

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $path = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrEmpty($path)) { $path = 'index.html' }
        
        # Cegah path traversal
        $path = $path.Replace('..', '')
        $fullPath = Join-Path $PWD $path
        
        if (Test-Path $fullPath -PathType Leaf) {
            $extension = [System.IO.Path]::GetExtension($fullPath).ToLower()
            $contentType = 'text/plain'
            switch ($extension) {
                '.html' { $contentType = 'text/html' }
                '.js' { $contentType = 'application/javascript' }
                '.css' { $contentType = 'text/css' }
            }
            $response.ContentType = $contentType
            
            $bytes = [System.IO.File]::ReadAllBytes($fullPath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
        }
        $response.Close()
    }
}
catch {
    Write-Host "Server dihentikan."
}
finally {
    $listener.Stop()
}
