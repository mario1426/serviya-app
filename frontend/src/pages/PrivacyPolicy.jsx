import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-light">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 text-gray-medium hover:text-navy">
            ←
          </button>
          <div className="flex items-center gap-1">
            <span className="text-xl font-bold text-primary">Servi</span>
            <span className="text-xl font-bold text-navy">Ya</span>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="card">
          <h1 className="text-2xl font-bold text-navy mb-1">Política de Privacidad</h1>
          <p className="text-xs text-gray-medium mb-6">Última actualización: mayo 2025</p>

          <div className="space-y-5 text-sm text-gray-dark leading-relaxed">
            <section>
              <h2 className="font-bold text-navy mb-2">1. Información que recopilamos</h2>
              <p>Recopilamos la información que nos proporcionás al registrarte: nombre, dirección de correo electrónico, foto de perfil (obtenida de tu cuenta de Google), número de teléfono, y ubicación geográfica cuando usás la app. También recopilamos fotos del documento de identidad y selfie en el proceso de verificación de trabajadores.</p>
            </section>

            <section>
              <h2 className="font-bold text-navy mb-2">2. Cómo usamos tu información</h2>
              <p>Usamos tu información para: operar y mejorar la plataforma, conectarte con otros usuarios, enviarte notificaciones sobre tus servicios, verificar tu identidad como trabajador, y cumplir con obligaciones legales. Nunca vendemos tu información a terceros.</p>
            </section>

            <section>
              <h2 className="font-bold text-navy mb-2">3. Ubicación geográfica</h2>
              <p>La app solicita acceso a tu ubicación para mostrar trabajadores cercanos y permitir el filtrado por zona. Tu ubicación se almacena de forma segura y solo se comparte con otros usuarios en la medida necesaria para prestar el servicio (por ejemplo, tu barrio general, no tu dirección exacta).</p>
            </section>

            <section>
              <h2 className="font-bold text-navy mb-2">4. Compartir información con terceros</h2>
              <p>Compartimos información limitada con servicios de terceros necesarios para operar: Google Firebase (autenticación), Cloudinary (almacenamiento de imágenes) y MongoDB Atlas (base de datos). Todos estos proveedores cuentan con sus propias políticas de privacidad y medidas de seguridad.</p>
            </section>

            <section>
              <h2 className="font-bold text-navy mb-2">5. Seguridad de los datos</h2>
              <p>Implementamos medidas técnicas para proteger tu información, incluyendo transmisión cifrada (HTTPS) y autenticación segura. Sin embargo, ningún sistema es 100% seguro. Te recomendamos usar contraseñas seguras y no compartir tu cuenta.</p>
            </section>

            <section>
              <h2 className="font-bold text-navy mb-2">6. Tus derechos</h2>
              <p>De acuerdo con la Ley 25.326 de Protección de Datos Personales de Argentina, tenés derecho a acceder, rectificar, actualizar y suprimir tus datos personales. Para ejercer estos derechos, contactanos en <span className="text-primary font-medium">serviyaaplicacion@gmail.com</span></p>
            </section>

            <section>
              <h2 className="font-bold text-navy mb-2">7. Retención de datos</h2>
              <p>Conservamos tu información mientras tu cuenta esté activa. Si eliminás tu cuenta, tus datos personales serán eliminados dentro de los 30 días, excepto aquellos que debamos conservar por razones legales.</p>
            </section>

            <section>
              <h2 className="font-bold text-navy mb-2">8. Menores de edad</h2>
              <p>ServiYa no está dirigido a menores de 18 años. No recopilamos intencionalmente información de menores. Si detectamos que un menor ha creado una cuenta, la eliminaremos de inmediato.</p>
            </section>

            <section>
              <h2 className="font-bold text-navy mb-2">9. Cambios en esta política</h2>
              <p>Podemos actualizar esta política periódicamente. Te notificaremos los cambios importantes a través de la app. El uso continuado de ServiYa implica la aceptación de la política actualizada.</p>
            </section>

            <section>
              <h2 className="font-bold text-navy mb-2">10. Contacto</h2>
              <p>Para cualquier consulta sobre privacidad escribinos a <span className="text-primary font-medium">serviyaaplicacion@gmail.com</span></p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
