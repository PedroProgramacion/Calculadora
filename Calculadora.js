// ===== VARIABLES GLOBALES =====
// Almacenan la expresión matemática completa
let expresion = "";           // La expresión matemática completa (ej: "5+3*2-1")
let operacionPendiente = "";  // Operación que se está escribiendo actualmente

// Obtener referencia al elemento de la pantalla donde se muestran los números
let pantalla = document.getElementById("pantalla");

// ===== FUNCIÓN PARA MOSTRAR NÚMEROS EN PANTALLA =====
let cambiarPantalla = function(nuevoDigito){
    // Validar que el parámetro sea un string
    if(typeof nuevoDigito !== "string"){
        console.error("solo trabajamos con strings");
        return; // Salir de la función si no es string
    }
    
    // Si la pantalla muestra "0", "Error" o el resultado de una operación anterior
    if(pantalla.value === "0" || pantalla.value === "Error" || operacionPendiente === "resultado"){
        if(nuevoDigito === "0"){
            return; // No hacer nada si ya hay un 0 y se presiona otro 0
        }
        pantalla.value = nuevoDigito; // Reemplazar completamente
        expresion = nuevoDigito; // Iniciar nueva expresión
        operacionPendiente = "numero";
    } else {
        // Evitar múltiples ceros consecutivos al inicio
        if(pantalla.value === "0" && nuevoDigito === "0"){
            return;
        }
        
        pantalla.value += nuevoDigito; // Concatenar el nuevo dígito
        expresion += nuevoDigito; // Agregar a la expresión
        operacionPendiente = "numero";
    }
    
    // ===== AJUSTE AUTOMÁTICO DEL TAMAÑO DE FUENTE =====
    ajustarTamañoFuente();
}

// ===== FUNCIÓN PARA AJUSTAR EL TAMAÑO DE LA FUENTE SEGÚN LA CANTIDAD DE DÍGITOS =====
let ajustarTamañoFuente = function(){
    let longitudTexto = pantalla.value.length;
    let nuevoTamaño;
    
    // Calcular el tamaño de fuente basado en la cantidad de caracteres
    if(longitudTexto <= 8){
        // Números cortos: tamaño normal (2em = 32px aprox)
        nuevoTamaño = "2em";
    } else if(longitudTexto <= 12){
        // Números medianos: reducir un poco (1.6em = 25.6px aprox)
        nuevoTamaño = "1.6em";
    } else if(longitudTexto <= 16){
        // Números largos: reducir más (1.3em = 20.8px aprox)
        nuevoTamaño = "1.3em";
    } else if(longitudTexto <= 20){
        // Números muy largos: reducir bastante (1.1em = 17.6px aprox)
        nuevoTamaño = "1.1em";
    } else {
        // Números extremadamente largos: tamaño mínimo (0.9em = 14.4px aprox)
        nuevoTamaño = "0.9em";
    }
    
    // Aplicar el nuevo tamaño de fuente
    pantalla.style.fontSize = nuevoTamaño;
}

// ===== EVENTOS PARA BOTONES NUMÉRICOS =====
// Obtener todos los botones con clase "numero"
let botonesNumero = document.querySelectorAll(".numero");

// Recorrer cada botón numérico y agregarle un evento click
for(let botonNumero of botonesNumero){
    botonNumero.addEventListener("click", () => {
        // Cuando se hace click, llamar cambiarPantalla con el texto del botón
        cambiarPantalla(botonNumero.innerHTML);
    });
}

// ===== FUNCIÓN PARA SELECCIONAR OPERACIÓN =====
let seleccionarOperacion = function(nuevoOperador){
    // Mapear los IDs de los botones a símbolos matemáticos
    let mapaOperadores = {
        "sumar": "+",
        "restar": "-", 
        "multiplicar": "*",
        "dividir": "/"
    };
    
    // Validar que la operación sea válida
    if(!mapaOperadores[nuevoOperador]){
        console.error("La operacion es incorrecta");
        return;
    }
    
    let simboloOperador = mapaOperadores[nuevoOperador];
    
    // Si acabamos de obtener un resultado, empezar nueva expresión con ese resultado
    if(operacionPendiente === "resultado"){
        expresion = pantalla.value + simboloOperador;
        pantalla.value += simboloOperador;
        operacionPendiente = "operador";
        ajustarTamañoFuente();
        return;
    }
    
    // Si ya hay una operación pendiente, calcular resultado parcial primero
    if(operacionPendiente === "operador"){
        // Reemplazar el último operador si se presiona otro
        expresion = expresion.slice(0, -1) + simboloOperador;
        pantalla.value = pantalla.value.slice(0, -1) + simboloOperador;
    } else if(operacionPendiente === "numero" && expresion !== ""){
        // Calcular resultado parcial antes de agregar nueva operación
        try {
            let resultadoParcial = evaluarExpresion(expresion);
            expresion = resultadoParcial + simboloOperador;
            pantalla.value = resultadoParcial + simboloOperador;
        } catch(error) {
            expresion += simboloOperador;
            pantalla.value += simboloOperador;
        }
    } else {
        // Primera operación
        expresion += simboloOperador;
        pantalla.value += simboloOperador;
    }
    
    operacionPendiente = "operador";
    ajustarTamañoFuente();
}

// ===== FUNCIÓN PARA EVALUAR EXPRESIONES MATEMÁTICAS =====
let evaluarExpresion = function(expr){
    try {
        // Limpiar la expresión de espacios y caracteres no válidos
        let expresionLimpia = expr.replace(/[^0-9+\-*/.]/g, '');
        
        // Validar que la expresión no esté vacía
        if(!expresionLimpia){
            throw new Error("Expresión vacía");
        }
        
        // Evaluar la expresión usando Function (más seguro que eval)
        let resultado = Function(`"use strict"; return (${expresionLimpia})`)();
        
        // Verificar si el resultado es válido
        if(!isFinite(resultado)){
            throw new Error("Resultado no válido");
        }
        
        // Formatear el resultado
        if(Math.abs(resultado) >= 1e15 || (Math.abs(resultado) < 1e-10 && resultado !== 0)){
            return resultado.toExponential(8);
        } else {
            return parseFloat(resultado.toPrecision(12)).toString();
        }
        
    } catch(error) {
        console.error("Error al evaluar expresión:", error);
        throw error;
    }
}

// ===== EVENTOS PARA BOTONES DE OPERACIÓN =====
// Obtener todos los botones con clase "operacion"
let botonesOperacion = document.querySelectorAll(".operacion");

// Recorrer cada botón de operación
for(let botonOperacion of botonesOperacion){
    // Excluir el botón igual (se maneja por separado)
    if(botonOperacion.id !== "igual"){
        botonOperacion.addEventListener("click", () => {
            // Cuando se hace click, llamar seleccionarOperacion con el ID del botón
            seleccionarOperacion(botonOperacion.id);
        });
    }
}

// ===== FUNCIÓN PARA CALCULAR EL RESULTADO FINAL =====
let operacionIgual = function(){
    // Si no hay expresión, no hacer nada
    if(!expresion || expresion === ""){
        return;
    }
    
    try {
        // Evaluar la expresión completa
        let resultado = evaluarExpresion(expresion);
        
        // Mostrar el resultado en pantalla
        pantalla.value = resultado;
        
        // Preparar para próxima operación
        expresion = resultado.toString();
        operacionPendiente = "resultado";
        
        // Ajustar el tamaño de fuente
        ajustarTamañoFuente();
        
    } catch(error) {
        // Mostrar error si la evaluación falla
        pantalla.value = "Error";
        expresion = "";
        operacionPendiente = "";
        ajustarTamañoFuente();
    }
}

// ===== EVENTO PARA BOTÓN IGUAL =====
// Agregar evento click al botón con ID "igual"
document.getElementById("igual").addEventListener("click", operacionIgual);

// ===== FUNCIONALIDAD DEL BOTÓN LIMPIAR =====
// Agregar evento click al botón con ID "limpiar"
document.getElementById("limpiar").addEventListener("click", function(){
    pantalla.value = "0";        // Resetear pantalla a 0
    expresion = "";             // Limpiar expresión completa
    operacionPendiente = "";    // Limpiar estado de operación
    ajustarTamañoFuente();      // Resetear tamaño de fuente
});

// ===== FUNCIONALIDAD DE TECLADO =====
// Agregar evento para capturar teclas presionadas
document.addEventListener("keydown", function(evento){
    // Obtener la tecla presionada
    let tecla = evento.key;
    
    // ===== TECLAS NUMÉRICAS (0-9) =====
    if(tecla >= "0" && tecla <= "9"){
        // Si es un número, actuar como si se hubiera clickeado el botón correspondiente
        cambiarPantalla(tecla);
    }
    
    // ===== TECLAS DE OPERACIONES =====
    else if(tecla === "+"){
        // Tecla suma
        seleccionarOperacion("sumar");
    }
    else if(tecla === "-"){
        // Tecla resta
        seleccionarOperacion("restar");
    }
    else if(tecla === "*"){
        // Tecla multiplicación (asterisco)
        seleccionarOperacion("multiplicar");
    }
    else if(tecla === "/"){
        // Tecla división (barra diagonal)
        evento.preventDefault(); // Evitar que se abra búsqueda rápida del navegador
        seleccionarOperacion("dividir");
    }
    
    // ===== TECLAS ESPECIALES =====
    else if(tecla === "Enter" || tecla === "="){
        // Tecla Enter o igual: calcular resultado
        evento.preventDefault(); // Evitar comportamiento por defecto
        operacionIgual();
    }
    else if(tecla === "Escape" || tecla === "Delete" || tecla.toLowerCase() === "c"){
        // Teclas Escape, Delete o C: limpiar calculadora
        pantalla.value = "0";
        expresion = "";
        operacionPendiente = "";
        ajustarTamañoFuente(); // Resetear tamaño de fuente
    }
    else if(tecla === "Backspace"){
        // Tecla Backspace: borrar último carácter
        if(pantalla.value.length > 1 && pantalla.value !== "Error"){
            pantalla.value = pantalla.value.slice(0, -1);
            expresion = expresion.slice(0, -1);
            
            // Determinar el nuevo estado de operación
            let ultimoCaracter = expresion.slice(-1);
            if(['+', '-', '*', '/'].includes(ultimoCaracter)){
                operacionPendiente = "operador";
            } else if(ultimoCaracter.match(/[0-9.]/)){
                operacionPendiente = "numero";
            } else {
                operacionPendiente = "";
            }
        } else {
            pantalla.value = "0";
            expresion = "";
            operacionPendiente = "";
        }
        ajustarTamañoFuente(); // Ajustar tamaño después de borrar
    }
    else if(tecla === "."){
        // Tecla punto decimal
        // Obtener el último número en la expresión
        let ultimoNumero = expresion.split(/[+\-*/]/).pop();
        
        // Solo agregar punto si el último número no tiene punto decimal
        if(!ultimoNumero.includes(".") && operacionPendiente !== "operador"){
            if(pantalla.value === "0" || operacionPendiente === "resultado"){
                pantalla.value = "0.";
                expresion = "0.";
            } else {
                pantalla.value += ".";
                expresion += ".";
            }
            operacionPendiente = "numero";
            ajustarTamañoFuente();
        }
    }
    
    // Opcional: Mostrar en consola qué tecla se presionó (para debugging)
    console.log("Tecla presionada:", tecla);
    console.log("Expresión actual:", expresion);
});