$(function () {
    // Función para formatear la hora
    function getCurrentTime() {
        const d = new Date();
        const h = d.getHours().toString().padStart(2, "0");
        const t = d.getMinutes().toString().padStart(2, "0");
        return h > 12 ? `${h - 12}:${t} pm` : `${h}:${t} am`;
    }

    // Mensaje de bienvenida inicial
    const welcomeMessage = "¡Hola! ¿en qué te ayudo?";
    $("#ap").append(`
        <div class='message received'>${welcomeMessage}<span class='metadata'><span class='time'>${getCurrentTime()}</span></span></div>
    `);

    // Función para llamar al endpoint de IA
    async function sendMessageToAI(message) {
        try {
            const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDgqC5W--Mx4CUpieHj5r2hb3vwGn9V9us", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: message  // 👈 Estructura que espera Gemini
                        }]
                    }]
                }),
            });
            const data = await response.json();
            return data.candidates[0].content.parts[0].text;  // Extrae la respuesta de Gemini
        } catch (error) {
            console.error("Error:", error);
            return "⚠️ Error al conectar con la IA.";
        }
    }

    // Manejar solo el clic del botón (#msend) - Elimina el evento submit del formulario
    $("#msend").click(async function (e) {
        e.preventDefault(); // Evita cualquier comportamiento por defecto
        const userMessage = $("#val").val().trim();
        if (!userMessage) return;

        // Mostrar mensaje del usuario
        const userTime = getCurrentTime();
        $("#ap").append(`
            <div class='message sent'>${userMessage}<span class='metadata'><span class='time'>${userTime}</span></span></div>
        `);
        $("#val").val(""); // Limpiar el input

        // Scroll al final
        $(".conversation-container").scrollTop($(".conversation-container")[0].scrollHeight);

        // Mostrar "escribiendo..."
        $(".status").html("escribiendo...");

        // Obtener respuesta de la IA
        const aiResponse = await sendMessageToAI(userMessage);
        const aiTime = getCurrentTime();

        // Mostrar respuesta de la IA
        $("#ap").append(`
            <div class='message received'>${aiResponse}<span class='metadata'><span class='time'>${aiTime}</span></span></div>
        `);
        $(".status").html("online");

        // Scroll al final nuevamente
        $(".conversation-container").scrollTop($(".conversation-container")[0].scrollHeight);
    });

    // Opcional: Permitir enviar con la tecla "Enter"
    $("#val").keypress(function (e) {
        if (e.which === 13) { // 13 = tecla Enter
            $("#msend").click(); // Simula clic en el botón
            return false; // Evita el salto de línea
        }
    });
});