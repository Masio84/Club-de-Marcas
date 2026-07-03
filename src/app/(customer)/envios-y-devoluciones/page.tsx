import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Truck, CheckCircle2 } from 'lucide-react'

export const metadata = {
  title: 'Envíos y Devoluciones | Club de Marcas',
  description: 'Políticas oficiales de envío, entrega y devoluciones de productos premium conforme a PROFECO en México.'
}

export default function ShippingReturnsPage() {
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
            Garantías y Envíos (PROFECO)
          </span>
        </div>

        {/* Encabezado */}
        <div className="space-y-4 text-center sm:text-left border-b border-gray-150 pb-6">
          <div className="inline-flex p-3 rounded-2xl bg-emerald/10 text-emerald mb-2">
            <Truck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-navy">
            Envíos y Devoluciones
          </h1>
          <p className="text-sm text-gray-500 font-medium max-w-2xl">
            Última actualización: 3 de julio de 2026. Transparencia y honestidad en el envío de tus marcas favoritas. Conoce tus derechos como consumidor mexicano.
          </p>
        </div>

        {/* Contenido Legal */}
        <div className="space-y-6 text-sm text-navy/80 leading-relaxed text-justify">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy uppercase tracking-wider flex items-center space-x-2">
              <span className="text-emerald">1.</span> <span>Políticas de Envío y Cobertura</span>
            </h2>
            <p>
              En <strong>Club de Marcas</strong> ofrecemos envíos a toda la República Mexicana. Trabajamos exclusivamente con paqueterías líderes (como DHL, FedEx y Estafeta) para asegurar la integridad de tus compras premium. 
            </p>
            <ul className="list-disc pl-5 space-y-1 text-navy/70">
              <li><strong>Envío Gratuito</strong>: Aplicará según los términos y promociones vigentes que defina el administrador de la tienda y se mostrará desglosado en el checkout.</li>
              <li><strong>Tiempos de entrega</strong>: El tiempo de entrega promedio oscila entre 3 y 5 días hábiles a partir de la confirmación del pago en zonas urbanas. Para zonas rurales o de difícil acceso, el plazo puede extenderse hasta 7 días hábiles.</li>
              <li><strong>Rastreo de envíos</strong>: Una vez enviado el paquete, se proporcionará un número de guía o código de seguimiento para que el socio pueda rastrear su paquete en tiempo real en los servidores de la paquetería correspondiente.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy uppercase tracking-wider flex items-center space-x-2">
              <span className="text-emerald">2.</span> <span>Garantía de Satisfacción y Devolución</span>
            </h2>
            <p>
              Conforme a la <em>Ley Federal de Protección al Consumidor</em> (PROFECO), si tu producto no cumple con lo anunciado, presenta defectos de fábrica o no es de la talla/característica seleccionada:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-navy/70">
              <li>El socio contará con un plazo de <strong>cinco (5) días hábiles</strong> tras recibir la mercancía para solicitar la devolución sin penalización alguna.</li>
              <li>El producto deberá ser enviado de vuelta en su empaque original, con etiquetas intactas y sin muestras de haber sido utilizado o desgastado.</li>
              <li>Una vez recibido en nuestro centro de distribución y validado el estado del artículo, procederemos a realizar la sustitución del producto o el reembolso completo de los importes pagados.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy uppercase tracking-wider flex items-center space-x-2">
              <span className="text-emerald">3.</span> <span>Procedimiento para Solicitar una Devolución</span>
            </h2>
            <p>
              Para iniciar una devolución, sigue estos pasos:
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-navy/70">
              <li>Envía un mensaje detallado a nuestro equipo de atención por correo en <code>devoluciones@clubdemarcas.mx</code> o por WhatsApp al número oficial de soporte de la tienda.</li>
              <li>Adjunta tu número de pedido y fotos del estado en que recibiste el producto (indispensable para verificar golpes o roturas causadas por la transportación).</li>
              <li>Nuestro equipo te enviará por correo una guía prepagada de paquetería para que dejes el paquete en la sucursal más cercana.</li>
            </ol>
            <p className="text-xs text-gray-500">
              * Nota: Las devoluciones son <strong>sin costo</strong> para el socio cuando son causadas por errores de surtido de Club de Marcas o defectos de fabricación del producto.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy uppercase tracking-wider flex items-center space-x-2">
              <span className="text-emerald">4.</span> <span>Reembolsos</span>
            </h2>
            <p>
              Los reembolsos autorizados se procesarán a través del mismo método de pago utilizado durante la compra:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-navy/70">
              <li><strong>Tarjetas de crédito o débito</strong>: El reembolso puede verse reflejado en un periodo de 5 a 15 días hábiles, dependiendo del banco emisor de la tarjeta.</li>
              <li><strong>Transferencia bancaria (SPEI) o depósitos</strong>: El reembolso se realizará por transferencia bancaria en un plazo máximo de 3 a 5 días hábiles tras proporcionarnos los datos CLABE del beneficiario.</li>
            </ul>
          </section>

        </div>

        {/* Garantía PROFECO */}
        <div className="bg-[#F5F5F7] p-5 rounded-2xl border border-gray-150 flex items-start space-x-3 text-xs text-gray-500">
          <CheckCircle2 className="w-5 h-5 text-emerald flex-shrink-0" />
          <p>
            En Club de Marcas México garantizamos el cumplimiento de las garantías oficiales de los productos premium de conformidad con las NOM (Normas Oficiales Mexicanas). Todos tus derechos de consumidor están protegidos y respaldados por la Ley Federal de Protección al Consumidor en México.
          </p>
        </div>

      </div>
    </div>
  )
}
