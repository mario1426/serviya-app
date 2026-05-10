import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const FAQ = {
  cliente: [
    {
      q: '¿Cómo encuentro un profesional cerca mío?',
      a: 'Desde el inicio de la app vas a ver todas las categorías de servicios. Tocás la que necesitás y te mostramos trabajadores disponibles cerca tuyo según tu ubicación.'
    },
    {
      q: '¿Los trabajadores están verificados?',
      a: 'Sí. Los trabajadores con el tilde azul ✓ pasaron por nuestro proceso de verificación de identidad con DNI y selfie. Siempre podés ver las reseñas de otros clientes también.'
    },
    {
      q: '¿Cómo pago y es seguro?',
      a: 'Pagás con tarjeta de débito o crédito a través de Mercado Pago, que es 100% seguro. El pago se procesa solo cuando el servicio está completado y calificado.'
    },
    {
      q: '¿Qué métodos de pago se aceptan?',
      a: 'Aceptamos todas las tarjetas de débito y crédito (Visa, Mastercard, Naranja, etc.) a través de Mercado Pago. No hace falta tener cuenta de MP.'
    },
    {
      q: '¿Puedo cancelar una solicitud?',
      a: 'Sí, podés cancelar antes de que el trabajador la acepte sin costo. Si la cancelás después de aceptada, puede aplicar una penalización según nuestra política.'
    },
    {
      q: '¿Qué hago si el trabajador no se presenta?',
      a: 'Si el trabajador no aparece, contactá a nuestro soporte desde la app. Revisamos el caso y te damos una solución. No vas a pagar por un servicio que no recibiste.'
    },
    {
      q: '¿Puedo elegir el horario del servicio?',
      a: 'Sí. Al hacer la solicitud podés indicar el día y horario que preferís en la descripción, y lo acordás directamente con el trabajador por el chat de la app.'
    },
    {
      q: '¿Qué es precio fijo vs presupuesto?',
      a: 'Precio fijo: el trabajador ya tiene un precio definido y vos lo aceptás o no. Presupuesto: el trabajador te hace una cotización según el trabajo específico que necesitás.'
    },
    {
      q: '¿Cómo dejo una reseña?',
      a: 'Cuando el servicio está marcado como completado, te aparece automáticamente la pantalla para puntuar al trabajador del 1 al 5 y dejar un comentario.'
    },
  ],
  trabajador: [
    {
      q: '¿Cómo me registro para ofrecer servicios?',
      a: 'Ingresá con Google, luego en el dashboard tocá "Modo trabajo". Completá tu perfil con tus servicios, zona, precios y foto. ¡Y listo para recibir solicitudes!'
    },
    {
      q: '¿Cómo activo mi disponibilidad?',
      a: 'En tu panel de trabajador hay un toggle (interruptor) que dice "Disponible / No disponible". Cuando está en verde estás activo y podés recibir solicitudes.'
    },
    {
      q: '¿En qué zona me llegan solicitudes?',
      a: 'Usamos tu ubicación GPS para mostrarte solicitudes cercanas. También podés configurar tu radio de atención (en km) en tu perfil para controlar el alcance.'
    },
    {
      q: '¿Cuánto cobra ServiYa de comisión?',
      a: 'ServiYa cobra un 20% de comisión sobre el valor del servicio. Vos recibís el 80% restante. Esta comisión cubre la plataforma, el seguro y el soporte.'
    },
    {
      q: '¿Cuándo y cómo cobro?',
      a: 'Una vez que el cliente paga y el servicio está completado, ServiYa te transfiere el 80% a tu CBU o alias que cargaste en tu perfil. El tiempo depende del banco, generalmente 24-48hs.'
    },
    {
      q: '¿Qué es la verificación y para qué sirve?',
      a: 'Es un proceso donde subís una foto de tu DNI y una selfie. Al verificarte aparece el tilde azul ✓ en tu perfil, lo que genera más confianza y más clientes.'
    },
    {
      q: '¿Puedo ofrecer más de un servicio?',
      a: 'Sí, podés seleccionar todas las categorías que quieras en tu perfil. Por ejemplo: corte de pasto, paseo de perros y lavado de autos al mismo tiempo.'
    },
    {
      q: '¿Puedo fijar mis propios precios?',
      a: 'Sí. En tu perfil cargás cada servicio con su precio en pesos. También podés elegir trabajar con presupuesto si el precio varía según el trabajo.'
    },
    {
      q: '¿Qué pasa si tengo que cancelar un trabajo?',
      a: 'Podés rechazar una solicitud antes de aceptarla sin consecuencias. Si cancelás después de haber aceptado, puede afectar tu reputación en la plataforma.'
    },
    {
      q: '¿Cómo me califican los clientes?',
      a: 'Después de cada servicio completado, el cliente puede puntuarte del 1 al 5 y dejar un comentario. Tu promedio aparece en tu perfil público.'
    },
  ],
};

const BOT_DELAY = 600;

export default function SupportChat() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [step, setStep] = useState('inicio'); // inicio | cliente | trabajador | answer
  const [unread, setUnread] = useState(true);
  const bottomRef = useRef(null);

  const addMessage = (msg, delay = 0) => {
    setTimeout(() => {
      setMessages(prev => [...prev, msg]);
    }, delay);
  };

  useEffect(() => {
    if (open && messages.length === 0) {
      addMessage({ from: 'bot', text: '¡Hola! 👋 Soy el asistente de ServiYa.' });
      addMessage({ from: 'bot', text: '¿En qué te puedo ayudar hoy? Primero contame:', BOT_DELAY });
      addMessage({ from: 'options', options: ['👤 Soy cliente', '🔧 Soy trabajador'] }, BOT_DELAY * 2);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleOpen = () => {
    setOpen(true);
    setUnread(false);
  };

  const handleClose = () => setOpen(false);

  const handleOption = (option) => {
    if (option === '👤 Soy cliente' || option === '🔧 Soy trabajador') {
      const role = option.includes('cliente') ? 'cliente' : 'trabajador';
      setStep(role);
      addMessage({ from: 'user', text: option });
      addMessage({ from: 'bot', text: `Perfecto. Estas son las preguntas más frecuentes de ${role === 'cliente' ? 'clientes' : 'trabajadores'}:` }, BOT_DELAY);
      addMessage({ from: 'faq', role }, BOT_DELAY * 2);
    } else if (option === '🔙 Volver a preguntas') {
      addMessage({ from: 'user', text: option });
      addMessage({ from: 'faq', role: step }, BOT_DELAY);
    } else if (option === '✉️ Contactar soporte') {
      addMessage({ from: 'user', text: option });
      addMessage({ from: 'bot', text: 'Te llevo a nuestro centro de soporte donde podés enviarnos tu consulta.' }, BOT_DELAY);
      setTimeout(() => {
        setOpen(false);
        navigate('/support');
      }, BOT_DELAY * 2);
    }
  };

  const handleQuestion = (q, a) => {
    addMessage({ from: 'user', text: q });
    addMessage({ from: 'bot', text: a }, BOT_DELAY);
    addMessage({
      from: 'options',
      options: ['🔙 Volver a preguntas', '✉️ Contactar soporte'],
    }, BOT_DELAY * 2);
  };

  const handleReset = () => {
    setMessages([]);
    setStep('inicio');
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={handleOpen}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-red-700 transition-colors"
        style={{ display: open ? 'none' : 'flex' }}
      >
        {unread && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
        )}
        <span className="text-2xl">💬</span>
      </button>

      {/* Panel del chat */}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 w-80 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ height: '480px' }}>

          {/* Header */}
          <div className="bg-primary px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm">🤖</div>
              <div>
                <p className="text-white font-semibold text-sm">Asistente ServiYa</p>
                <p className="text-white/70 text-xs">Respuesta inmediata</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleReset} className="text-white/70 hover:text-white text-xs">↺</button>
              <button onClick={handleClose} className="text-white/70 hover:text-white text-lg leading-none">×</button>
            </div>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-gray-50">
            {messages.map((msg, i) => {
              if (msg.from === 'bot') return (
                <div key={i} className="flex items-end gap-2">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs flex-shrink-0">🤖</div>
                  <div className="bg-white rounded-2xl rounded-bl-sm px-3 py-2 text-sm text-gray-800 shadow-sm max-w-xs">
                    {msg.text}
                  </div>
                </div>
              );

              if (msg.from === 'user') return (
                <div key={i} className="flex justify-end">
                  <div className="bg-primary text-white rounded-2xl rounded-br-sm px-3 py-2 text-sm max-w-xs">
                    {msg.text}
                  </div>
                </div>
              );

              if (msg.from === 'options') return (
                <div key={i} className="flex flex-col gap-1.5 pl-8">
                  {msg.options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => handleOption(opt)}
                      className="text-left bg-white border border-primary/20 text-primary text-xs font-medium px-3 py-2 rounded-xl hover:bg-red-50 transition-colors shadow-sm"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              );

              if (msg.from === 'faq') return (
                <div key={i} className="flex flex-col gap-1.5 pl-8">
                  {FAQ[msg.role].map((item, j) => (
                    <button
                      key={j}
                      onClick={() => handleQuestion(item.q, item.a)}
                      className="text-left bg-white border border-gray-200 text-gray-700 text-xs px-3 py-2 rounded-xl hover:border-primary/30 hover:bg-red-50 transition-colors shadow-sm"
                    >
                      {item.q}
                    </button>
                  ))}
                  <button
                    onClick={() => handleOption('✉️ Contactar soporte')}
                    className="text-left bg-white border border-gray-200 text-gray-500 text-xs px-3 py-2 rounded-xl hover:border-primary/30 hover:bg-red-50 transition-colors shadow-sm"
                  >
                    ✉️ No encuentro lo que busco
                  </button>
                </div>
              );

              return null;
            })}
            <div ref={bottomRef} />
          </div>

          {/* Footer */}
          <div className="px-3 py-2 bg-white border-t border-gray-100 flex-shrink-0">
            <p className="text-center text-xs text-gray-400">ServiYa · Soporte automático</p>
          </div>
        </div>
      )}
    </>
  );
}
