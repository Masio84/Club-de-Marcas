import React from 'react'
import Link from 'next/link'
import { ArrowLeft, FileText, ShieldAlert } from 'lucide-react'

export const metadata = {
  title: 'Términos y Condiciones | Club de Marcas',
  description: 'Términos y condiciones legales aplicables para el uso de la plataforma Club de Marcas en México conforme a PROFECO.'
}

export default function TermsPage() {
  return (
    <div className="bg-[#F5F5F7] min-h-screen text-[#0A192F] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-3xl border border-gray-200 shadow-sm space-y-8">
        
        {/* Enlace para volver */}
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-emerald hover:text-navy transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la Tienda</span>
          </Link>
          <span className="text-[10px] bg-emerald/10 text-emerald-850 font-black uppercase tracking-widest px-3 py-1 rounded-full">
            Versión 1.0 (PROFECO)
          </span>
        </div>

        {/* Encabezado */}
        <div className="space-y-4 text-center sm:text-left border-b border-gray-150 pb-6">
          <div className="inline-flex p-3 rounded-2xl bg-emerald/10 text-emerald mb-2">
            <FileText className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-navy">
            Términos y Condiciones
          </h1>
          <p className="text-sm text-gray-500 font-medium max-w-2xl">
            Última actualización: 3 de julio de 2026. Por favor, lee atentamente los presentes términos antes de utilizar nuestros servicios en territorio mexicano.
          </p>
        </div>

        {/* Contenido Legal */}
        <div className="space-y-6 text-sm text-navy/80 leading-relaxed text-justify">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy uppercase tracking-wider flex items-center space-x-2">
              <span className="text-emerald">1.</span> <span>Declaración y Aceptación</span>
            </h2>
            <p>
              El presente contrato de adhesión regula el uso de la plataforma de comercio electrónico <strong>Club de Marcas</strong>. Al acceder, registrarse o realizar cualquier transacción en nuestro sitio web, usted declara ser mayor de edad en la República Mexicana y acepta expresamente y de forma incondicional sujetarse a los términos establecidos aquí en cumplimiento con la <em>Ley Federal de Protección al Consumidor (LFPC)</em> y las regulaciones de la Procuraduría Federal del Consumidor (PROFECO).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy uppercase tracking-wider flex items-center space-x-2">
              <span className="text-emerald">2.</span> <span>Registro de Cuenta y Membresía</span>
            </h2>
            <p>
              Para adquirir los productos premium disponibles en la plataforma, el usuario deberá registrar una cuenta de socio proporcionando información verídica, exacta y actualizada. Es responsabilidad del socio resguardar sus credenciales de acceso. Nos reservamos el derecho de suspender o cancelar cuentas que violen estos términos, muestren actividades fraudulentas o presenten comportamientos maliciosos.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy uppercase tracking-wider flex items-center space-x-2">
              <span className="text-emerald">3.</span> <span>Precios, Inventario y Disponibilidad</span>
            </h2>
            <p>
              Todos los precios mostrados en la plataforma están expresados en pesos mexicanos ($ MXN) e incluyen el Impuesto al Valor Agregado (IVA) correspondiente. Los costos de envío se calcularán y desglosarán de forma transparente en el checkout. Club de Marcas se compromete a mantener el stock actualizado; no obstante, en caso de presentarse una falta de disponibilidad imprevista después de procesar el pago, se notificará de inmediato al socio y se procederá al reembolso íntegro de la cantidad pagada conforme a los plazos legales establecidos por PROFECO.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy uppercase tracking-wider flex items-center space-x-2">
              <span className="text-emerald">4.</span> <span>Garantía y Derecho de Revocación</span>
            </h2>
            <p>
              En cumplimiento del Artículo 56 de la <em>Ley Federal de Protección al Consumidor</em>, el socio gozará de un derecho de revocación de su consentimiento (cancelación de compra) dentro de los cinco (5) días hábiles contados a partir de la entrega del bien, siempre que el producto no haya sido utilizado, se encuentre en su empaque original y en las mismas condiciones en que fue entregado. Las garantías de fábrica de los productos premium se regirán por los términos especificados en el empaque de cada marca, garantizando en todo momento la reparación o sustitución del bien defectuoso.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy uppercase tracking-wider flex items-center space-x-2">
              <span className="text-emerald">5.</span> <span>Limitación de Responsabilidad</span>
            </h2>
            <p>
              Club de Marcas opera bajo altos estándares de seguridad tecnológica y cifrado de transacciones. Sin embargo, no se hace responsable por interrupciones en el servicio debidas a fallas del proveedor de internet, ataques cibernéticos de fuerza mayor o incompatibilidades del dispositivo del usuario. Las reclamaciones de los consumidores podrán presentarse a través de nuestros canales oficiales de atención al cliente y, en su defecto, ante la PROFECO.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy uppercase tracking-wider flex items-center space-x-2">
              <span className="text-emerald">6.</span> <span>Legislación y Jurisdicción</span>
            </h2>
            <p>
              Estos términos y condiciones se rigen por las leyes federales vigentes en la República Mexicana. Cualquier controversia derivada del uso del sitio que no pueda ser resuelta mediante conciliación amistosa o arbitraje ante la PROFECO se someterá a la jurisdicción exclusiva de los tribunales competentes de la Ciudad de México, renunciando las partes a cualquier otra jurisdicción que les corresponda por domicilio presente o futuro.
            </p>
          </section>

        </div>

        {/* Nota de advertencia legal */}
        <div className="bg-[#F5F5F7] p-5 rounded-2xl border border-gray-150 flex items-start space-x-3 text-xs text-gray-500">
          <ShieldAlert className="w-5 h-5 text-emerald flex-shrink-0" />
          <p>
            <strong>Nota legal:</strong> El uso continuo de esta plataforma implica la aceptación absoluta de estos términos. Si no está de acuerdo con alguna cláusula descrita en este documento, le solicitamos abstenerse de usar la plataforma y de registrar sus datos.
          </p>
        </div>

      </div>
    </div>
  )
}
