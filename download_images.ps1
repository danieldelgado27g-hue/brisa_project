$imagesDir = "C:\env\develop\brisa_project\project\images\products"
New-Item -ItemType Directory -Path $imagesDir -Force | Out-Null

$images = @(
    @{ Name = "cerave-limpiador"; Url = "https://dermashop.pe/cdn/shop/files/9_aa60e3c0-bd35-488a-b444-a99e4a03d196.png?v=1707370156&width=1000"; Ext = "png" }
    @{ Name = "laroche-effaclar"; Url = "https://dermotiendashopping.com/cdn/shop/files/3337872411991.jpg?v=1770673514"; Ext = "jpg" }
    @{ Name = "neutrogena-hydroboost"; Url = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJTdrwOXVRPI3k4U9O26RrIdKqBnD3dFp8xRtiOr_wOMTLOfF2vuwieeI&s=10"; Ext = "encrypted" }
    @{ Name = "cerave-pm"; Url = "https://dermashop.pe/cdn/shop/files/4-nuevos-productos-web-2026-2026-06-16T084836.764.jpg?v=1781617725&width=1000"; Ext = "jpg" }
    @{ Name = "eltamd-uvclear"; Url = "https://i0.wp.com/dermatologia.com.pe/wp-content/uploads/2025/04/EltaMD_UVClear_SinColor_Swatch.jpg?fit=1500%2C1500&ssl=1"; Ext = "jpg" }
    @{ Name = "paulaschoice-bha"; Url = "https://sbsbeauty.pe/cdn/shop/products/s2421394-main-zoom.webp?v=1663689658&width=1400"; Ext = "webp" }
    @{ Name = "ordinary-niacinamide"; Url = "https://http2.mlstatic.com/D_NQ_NP_809270-MLA92400638146_092025-O.webp"; Ext = "webp" }
    @{ Name = "caudalie-vinoperfect"; Url = "https://static.sweetcare.com/img/prd/488/v-638974356406506197/caudalie-000155cd_01.webp"; Ext = "webp" }
    @{ Name = "retinol-inkeylist"; Url = "https://picsum.photos/seed/retinol/300/300"; Ext = "jpg" }
    @{ Name = "aveeno-ultracalming"; Url = "https://folliculitisscout.com/wp-content/uploads/2019/07/Aveeno_Ultra_Calming_Daily_Face_Moisturizer_SPF_15.jpg"; Ext = "jpg" }
    @{ Name = "bioderma-atoderm"; Url = "https://dermashop.pe/cdn/shop/files/2-nuevos-productos-web-2025-2026-02-26T111943.015.jpg?v=1772122817&width=1000"; Ext = "jpg" }
    @{ Name = "supergoop-unseen"; Url = "https://supergoop.com/cdn/shop/files/UnseenBody_Img1_new.jpg?v=1767364288"; Ext = "jpg" }
    @{ Name = "cetaphil-gentle"; Url = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWGVbPJSp-Tipc7PzpjiBQAPSy6EXx03R5m1PGZEka8xSaGR4_nCKSdEk&s=10"; Ext = "encrypted" }
    @{ Name = "vanicream-moisturizer"; Url = "https://allergystore.com/cdn/shop/files/vanicream-skin-cream-4oz_2000x2000.jpg?v=1696660699"; Ext = "jpg" }
    @{ Name = "laroche-anthelios"; Url = "https://dermashop.pe/cdn/shop/files/rxc-lrp-fluide.jpg?v=1762208568&width=860"; Ext = "jpg" }
    @{ Name = "ordinary-hyaluronic"; Url = "https://beautyaddicts.pe/cdn/shop/files/Hyaluronic-Acid-2-B5-Acido-hialuronico-The-Ordinary-1.png?v=1769177914&width=1214"; Ext = "png" }
    @{ Name = "simple-moisturizer"; Url = "https://picsum.photos/seed/simple-moisturizer/300/300"; Ext = "jpg" }
    @{ Name = "cerave-sunscreen"; Url = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTER6-mMLaUPEuK-oe1KEfYflkhRClIAvunfjFL58WSSw&s=10"; Ext = "encrypted" }
    @{ Name = "goodmolecules-discoloration"; Url = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJJFPqTClBI_9_xISO7rWIM9HOUADJAuxyd6QepdDhXw&s=10"; Ext = "encrypted" }
    @{ Name = "neutrogena-rapidwrinkle"; Url = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTujiMChJTx-ALj3JD-i7scKygVB6LVYcbjHE-ubxq__A&s=10"; Ext = "encrypted" }
    @{ Name = "beautyofjoseon-dynasty"; Url = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKz4bcRsvhRGHr0wcI1dG2olnOpBq673DJvARuRjO0ow&s=10"; Ext = "encrypted" }
    @{ Name = "somebymi-aha"; Url = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYgFiuH94ei2Ueh55QSmjMTMW8xIm0yDxXmR4ddLN-Dg&s=10"; Ext = "encrypted" }
    @{ Name = "laneige-sleeping"; Url = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRA5oAZTnF34de5_XwMKH6hxw-U2ul7UTQCo-rM6jAcPA&s=10"; Ext = "encrypted" }
    @{ Name = "innisfree-greentea"; Url = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdkeKrbEWWRa_oaZAUdCm1Ax_k3qhLR_jFPymjQ5Kmpw&s=10"; Ext = "encrypted" }
    @{ Name = "missha-time"; Url = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwiALpgMViBKBEPnS5vlPWMR393FyYRGvoPjjrKGWj9w&s=10"; Ext = "encrypted" }
    @{ Name = "anua-heartleaf"; Url = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQv6RdHgy9WtErmrYlumNv8WHQzacpZv6JK1AsDomh0iA&s=10"; Ext = "encrypted" }
    @{ Name = "roundlab-birch"; Url = "https://beautyaddicts.pe/cdn/shop/files/birch-juice-moisturizing-sunscreen-round-lab-1.webp?v=1764086638&width=1214"; Ext = "webp" }
)

$successCount = 0
$failCount = 0
$placeholderSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300"><rect fill="#f3e5f5" width="300" height="300" rx="16"/><circle cx="150" cy="130" r="50" fill="#ce93d8" opacity="0.5"/><text x="150" y="145" text-anchor="middle" font-size="48">🧴</text><text x="150" y="220" text-anchor="middle" fill="#6A4C93" font-size="14" font-family="sans-serif">Imagen no disponible</text></svg>'

# Create the main placeholder.svg
Set-Content -Path "$imagesDir\placeholder.svg" -Value $placeholderSvg -NoNewline

Write-Host "=== Starting image downloads ===" -ForegroundColor Cyan

foreach ($img in $images) {
    $filename = $img.Name
    $url = $img.Url
    $ext = $img.Ext

    if ($ext -eq "encrypted") {
        # Create SVG placeholder
        $outFile = "$imagesDir\$filename.svg"
        Set-Content -Path $outFile -Value $placeholderSvg -NoNewline
        Write-Host "[PLACEHOLDER] $filename.svg created (encrypted URL)" -ForegroundColor Yellow
        $failCount++
        continue
    }

    $outFile = "$imagesDir\$filename.$ext"

    try {
        Invoke-WebRequest -Uri $url -OutFile $outFile -TimeoutSec 15 -UseBasicParsing -ErrorAction Stop
        if ((Get-Item $outFile).Length -gt 0) {
            Write-Host "[OK] $filename.$ext downloaded" -ForegroundColor Green
            $successCount++
        } else {
            throw "Empty file"
        }
    } catch {
        # Fallback: create SVG placeholder
        $svgFile = "$imagesDir\$filename.svg"
        Set-Content -Path $svgFile -Value $placeholderSvg -NoNewline
        Write-Host "[FAIL] $filename.$ext - $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "[PLACEHOLDER] $filename.svg created instead" -ForegroundColor Yellow
        $failCount++
    }
}

Write-Host ""
Write-Host "=== Download complete ===" -ForegroundColor Cyan
Write-Host "Successful: $successCount" -ForegroundColor Green
Write-Host "Failed/Placeholder: $failCount" -ForegroundColor Yellow
