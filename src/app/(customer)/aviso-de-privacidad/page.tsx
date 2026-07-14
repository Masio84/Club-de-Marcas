import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Shield, ShieldCheck } from 'lucide-react'

export const metadata = {
  title: 'Aviso de Privacidad | Club de Marcas',
  description: 'Aviso de privacidad integral para la protección de datos personales en posesión de Personal Rikdom S.A.P.I. de C.V. conforme al INAI.'
}

export default function PrivacyPage() {
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
            Conforme al INAI (LFPDPPP)
          </span>
        </div>

        {/* Encabezado */}
        <div className="space-y-4 text-center sm:text-left border-b border-gray-150 pb-6">
          <div className="inline-flex p-3 rounded-2xl bg-emerald/10 text-emerald mb-2">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-navy">
            Aviso de Privacidad
          </h1>
          <p className="text-sm text-gray-500 font-medium max-w-2xl">
            Última actualización: 3 de julio de 2026. Tu privacidad es nuestra prioridad absoluta. Protegemos tus datos personales conforme a las leyes de la República Mexicana.
          </p>
        </div>

        {/* Contenido Legal */}
        <div className="space-y-6 text-sm text-navy/80 leading-relaxed text-justify">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy uppercase tracking-wider flex items-center space-x-2">
              <span className="text-emerald">1.</span> <span>Identidad y Domicilio del Responsable</span>
            </h2>
            <p>
              El responsable del tratamiento y protección de sus datos personales es <strong>Personal Rikdom S.A.P.I. de C.V.</strong>, con domicilio para oír y recibir notificaciones en Aguascalientes, México. Nos comprometemos a resguardar su información bajo estrictos estándares de seguridad técnica, administrativa y física en estricto cumplimiento con lo establecido en la <em>Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)</em> y los lineamientos del Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales (INAI).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy uppercase tracking-wider flex items-center space-x-2">
              <span className="text-emerald">2.</span> <span>Datos Personales Recabados</span>
            </h2>
            <p>
              Para cumplir con las finalidades descritas en este aviso, recopilamos los siguientes datos personales:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-navy/70">
              <li>Nombre completo del cliente o socio.</li>
              <li>Dirección de correo electrónico.</li>
              <li>Dirección completa para envío y facturación (calle, número, colonia, código postal, alcaldía o municipio y estado).</li>
              <li>Teléfono celular de contacto.</li>
              <li>Datos de navegación técnica (dirección IP, cookies esenciales y datos analíticos anonimizados).</li>
            </ul>
            <p className="text-xs text-gray-500 mt-1">
              * Nota: <strong>No recabamos datos personales sensibles</strong> (como origen étnico, estado de salud, afiliaciones políticas o religiosas) ni almacenamos los números de tarjeta de crédito/débito directamente en nuestros servidores, las transacciones se realizan mediante pasarelas cifradas seguras.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy uppercase tracking-wider flex items-center space-x-2">
              <span className="text-emerald">3.</span> <span>Finalidades del Tratamiento</span>
            </h2>
            <p>
              Sus datos personales serán utilizados exclusivamente para las siguientes finalidades primarias y necesarias:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-navy/70">
              <li>Creación, autenticación y administración de su cuenta de socio en la plataforma.</li>
              <li>Procesamiento y entrega de los pedidos adquiridos a través del sitio web.</li>
              <li>Envío de confirmaciones de compra, facturación y estados de entrega.</li>
              <li>Atención al cliente por canales de soporte oficiales (incluyendo soporte vía WhatsApp).</li>
              <li>Cumplimiento de obligaciones fiscales, legales y requerimientos de autoridades mexicanas.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy uppercase tracking-wider flex items-center space-x-2">
              <span className="text-emerald">4.</span> <span>Transferencia de Datos</span>
            </h2>
            <p>
              Le informamos que sus datos personales de contacto y envío podrán ser compartidos con empresas proveedoras de servicios logísticos e integradores de mensajería (como DHL, FedEx o Estafeta) con la única finalidad de hacer llegar los productos comprados a su domicilio. Fuera de estos supuestos necesarios, no vendemos, rentamos ni transferimos sus datos personales a terceros sin su consentimiento previo por escrito.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy uppercase tracking-wider flex items-center space-x-2">
              <span className="text-emerald">5.</span> <span>Derechos ARCO y Ejercicio de los Mismos</span>
            </h2>
            <p>
              Usted tiene el derecho constitucional en todo momento de acceder, rectificar, cancelar u oponerse al tratamiento de sus datos personales (conocidos como <strong>Derechos ARCO</strong>). Para iniciar una solicitud, el socio podrá enviar un correo electrónico a nuestro departamento de privacidad en <code>privacidad@clubdemarcas.mx</code> detallando:
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-navy/70">
              <li>El nombre del titular y correo electrónico asociado a la cuenta.</li>
              <li>La descripción clara de los datos sobre los que busca ejercer alguno de sus derechos ARCO.</li>
              <li>Copia digitalizada de una identificación oficial vigente (INE o Pasaporte) para comprobar la identidad del titular.</li>
            </ol>
            <p>
              El plazo máximo de respuesta para informarle sobre la procedencia de su solicitud será de veinte (20) días hábiles contados a partir de su recepción, conforme a la LFPDPPP.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-navy uppercase tracking-wider flex items-center space-x-2">
              <span className="text-emerald">6.</span> <span>Modificaciones al Aviso de Privacidad</span>
            </h2>
            <p>
              El presente aviso de privacidad puede sufrir cambios o actualizaciones derivadas de reformas legislativas, políticas internas o nuevos requerimientos de servicio de Club de Marcas. Todas las actualizaciones serán publicadas de forma inmediata en esta misma sección, y se notificará a los socios vía correo electrónico sobre cambios sustanciales en el tratamiento de sus datos personales.
            </p>
          </section>

        </div>

        {/* Cierre de seguridad */}
        <div className="bg-[#F5F5F7] p-5 rounded-2xl border border-gray-150 flex items-start space-x-3 text-xs text-gray-500">
          <ShieldCheck className="w-5 h-5 text-emerald flex-shrink-0" />
          <p>
            Al registrarse y aceptar explícitamente las condiciones de este portal, usted otorga su consentimiento expreso para que Club de Marcas trate sus datos bajo los términos descritos. El regulador garante de estos derechos en México es el INAI (Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales).
          </p>
        </div>

      </div>
    </div>
  )
}
