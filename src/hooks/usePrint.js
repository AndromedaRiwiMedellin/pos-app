import { useRef } from 'react'

/**
 * usePrint — impresión directa para taquilla térmica.
 *
 * IMPORTANTE: para que no aparezca el diálogo del navegador,
 * el kiosko debe lanzarse con:
 *   chromium-browser --kiosk-printing http://localhost:5173
 * o el script launch-pos.sh incluido en el proyecto.
 *
 * Los eventos beforeprint/afterprint permiten rastrear el ciclo
 * incluso sin el diálogo (funcionan igual con --kiosk-printing).
 */
export function usePrint() {
  const printRef = useRef(null)

  /**
   * @param {object} options
   * @param {(msg: string) => void} options.onStatus  callback con mensajes de estado
   * @param {(err: string) => void} options.onError   callback si algo falla
   * @param {() => void}           options.onDone     callback al terminar
   */
  const print = ({ onStatus, onError, onDone } = {}) => {
    const printRoot = document.getElementById('print-root')

    if (!printRef.current) {
      onError?.('No hay ticket cargado para imprimir.')
      return
    }
    if (!printRoot) {
      onError?.('Elemento #print-root no encontrado en el DOM.')
      return
    }

    onStatus?.('Preparando ticket...')

    // Copiar HTML al nodo de impresión fuera del árbol de React
    printRoot.innerHTML = printRef.current.innerHTML

    const handleBefore = () => {
      onStatus?.('Enviando a impresora...')
    }

    const handleAfter = () => {
      onStatus?.('✓ Impresión enviada correctamente.')
      printRoot.innerHTML = ''
      window.removeEventListener('beforeprint', handleBefore)
      window.removeEventListener('afterprint', handleAfter)
      onDone?.()
    }

    window.addEventListener('beforeprint', handleBefore)
    window.addEventListener('afterprint', handleAfter)

    // Seguridad: si afterprint no dispara en 8 s, limpiamos igual
    const fallback = setTimeout(() => {
      if (printRoot.innerHTML) {
        onStatus?.('✓ Impresión procesada.')
        printRoot.innerHTML = ''
        window.removeEventListener('beforeprint', handleBefore)
        window.removeEventListener('afterprint', handleAfter)
        onDone?.()
      }
    }, 8000)

    window.addEventListener('afterprint', () => clearTimeout(fallback), { once: true })

    try {
      window.print()
    } catch (err) {
      onError?.(`Error al imprimir: ${err.message}`)
      printRoot.innerHTML = ''
      window.removeEventListener('beforeprint', handleBefore)
      window.removeEventListener('afterprint', handleAfter)
      clearTimeout(fallback)
    }
  }

  return { printRef, print }
}
