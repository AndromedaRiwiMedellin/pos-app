#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
# launch-pos.sh — Iniciador del kiosco de Taquilla Orbix
#
# Lanza Chromium con --kiosk-printing para que window.print()
# envíe DIRECTO a la impresora predeterminada sin diálogo.
#
# USO:
#   chmod +x launch-pos.sh
#   ./launch-pos.sh
#
# Antes de correr, asegúrate de que:
#   1. La impresora térmica está configurada como predeterminada en
#      Configuración > Impresoras (CUPS).
#   2. El backend está corriendo: dotnet run (en asp_backend/)
#   3. El frontend está corriendo: npm run dev (en pos-app/)
# ─────────────────────────────────────────────────────────────────

POS_URL="${1:-http://localhost:5173}"

# Detectar el ejecutable de Chromium disponible
if command -v chromium-browser &>/dev/null; then
    CHROME="chromium-browser"
elif command -v chromium &>/dev/null; then
    CHROME="chromium"
elif command -v google-chrome &>/dev/null; then
    CHROME="google-chrome"
elif command -v google-chrome-stable &>/dev/null; then
    CHROME="google-chrome-stable"
else
    echo "❌ No se encontró Chrome/Chromium. Instálalo con:"
    echo "   sudo apt install chromium-browser"
    exit 1
fi

echo "✓ Usando: $CHROME"
echo "✓ URL: $POS_URL"
echo "✓ Modo impresión directa activo (--kiosk-printing)"
echo ""

exec "$CHROME" \
    --kiosk-printing \
    --user-data-dir=/tmp/pos-kiosk \
    --no-first-run \
    --disable-translate \
    --disable-infobars \
    --disable-session-crashed-bubble \
    --disable-features=TranslateUI \
    "$POS_URL"
