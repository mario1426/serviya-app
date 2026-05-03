import { useNavigate } from 'react-router-dom';

export default function TermsAndConditions() {
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
          <h1 className="text-2xl font-bold text-navy mb-1">Términos y Condiciones</h1>
          <p className="text-xs text-gray-medium mb-6">Última actualización: mayo 2025</p>

          <div className="space-y-5 text-sm text-gray-dark leading-relaxed">
            <section>
              <h2 className="font-bold text-navy mb-2">1. Aceptación de los términos</h2>
              <p>Al registrarte y usar ServiYa, aceptás estos Términos y Condiciones en su totalidad. Si no estás de acuerdo con alguna parte, no debés usar la plataforma.</p>
            </section>

            <section>
              <h2 className="font-bold text-navy mb-2">2. Descripción del servicio</h2>
              <p>ServiYa es una plataforma digital que conecta clientes con prestadores de servicios a domicilio en Argentina. ServiYa actúa como intermediario y no es responsable de la ejecución del servicio contratado entre las partes.</p>
            </section>

            <section>
              <h2 className="font-bold text-navy mb-2">3. Registro y cuenta</h2>
              <p>Para usar ServiYa debés crear una cuenta con información verdadera y actualizada. Sos responsable de mantener la confidencialidad de tu cuenta y de todas las actividades que ocurran en ella.</p>
            </section>

            <section>
              <h2 className="font-bold text-navy mb-2">4. Responsabilidades del cliente</h2>
              <p>El cliente se compromete a proporcionar información precisa sobre el servicio solicitado, a estar disponible en el lugar y horario acordado, y a realizar el pago correspondiente una vez completado el servicio.</p>
            </section>

            <section>
              <h2 className="font-bold text-navy mb-2">5. Responsabilidades del trabajador</h2>
              <p>El trabajador se compromete a brindar el servicio con profesionalismo, honestidad y en los términos acordados. Debe contar con los conocimientos y herramientas necesarias para realizar el trabajo. ServiYa no garantiza los resultados del servicio prestado.</p>
            </section>

            <section>
              <h2 className="font-bold text-navy mb-2">6. Cancelaciones y penalizaciones</h2>
              <p>Las cancelaciones reiteradas afectan la calificación del usuario en la plataforma. ServiYa se reserva el derecho de suspender cuentas que registren un patrón de cancelaciones abusivas o comportamiento inapropiado.</p>
            </section>

            <section>
              <h2 className="font-bold text-navy mb-2">7. Comisión de la plataforma</h2>
              <p>ServiYa aplica una comisión del 20% sobre el valor de cada servicio completado. Esta comisión se descuenta automáticamente del monto que recibe el trabajador. Los precios mostrados a los clientes son el precio total sin cargos adicionales.</p>
            </section>

            <section>
              <h2 className="font-bold text-navy mb-2">8. Conducta prohibida</h2>
              <p>Está prohibido usar ServiYa para actividades ilegales, fraudulentas, o que violen derechos de terceros. ServiYa puede suspender o eliminar cuentas que incumplan estas reglas sin previo aviso.</p>
            </section>

            <section>
              <h2 className="font-bold text-navy mb-2">9. Limitación de responsabilidad</h2>
              <p>ServiYa no se hace responsable por daños directos, indirectos o incidentales derivados del uso de la plataforma, ni por la conducta de los usuarios entre sí.</p>
            </section>

            <section>
              <h2 className="font-bold text-navy mb-2">10. Modificaciones</h2>
              <p>ServiYa puede modificar estos términos en cualquier momento. Los cambios serán notificados a través de la plataforma. El uso continuado de ServiYa implica la aceptación de los nuevos términos.</p>
            </section>

            <section>
              <h2 className="font-bold text-navy mb-2">11. Jurisdicción</h2>
              <p>Estos términos se rigen por las leyes de la República Argentina. Cualquier disputa será resuelta ante los tribunales competentes de la Ciudad Autónoma de Buenos Aires.</p>
            </section>

            <section>
              <h2 className="font-bold text-navy mb-2">12. Contacto</h2>
              <p>Para consultas sobre estos términos podés contactarnos en <span className="text-primary font-medium">ojedamario911@gmail.com</span></p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
