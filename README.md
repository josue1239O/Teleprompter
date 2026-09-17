# Teleprompter

Teleprompter profesional para teatro, video y presentaciones. Aplicacion web pura (HTML/CSS/JS) sin dependencias externas.

## Caracteristicas

- **Editor de guiones** con deteccion automatica de personajes
- **Teleprompter** con scroll automatico y controles de velocidad
- **Filtro por personaje** para mostrar solo sus lineas
- **Busqueda** de texto en el editor
- **Colores personalizados** por personaje
- **Pantalla completa** con controles ocultos
- **Atajos de teclado** para control rapido
- **Estadisticas** en tiempo real (lineas, personajes, palabras, tiempo estimado)
- **Diseno responsive** para desktop y movil

## Formato del guion

```
ESCENA 1: DESCRIPCION DE LA ESCENA

NOMBRE DEL PERSONAJE: Su dialogo aqui.
OTRO PERSONAJE: Respuesta aqui.
```

### Reglas de deteccion

- **Personajes**: Nombres en MAYUSCULAS seguidos de dos puntos (`:`)
- **Escenas**: Lineas que empiecen con `ESCENA`, `VIDEO` o esten entre corchetes `[ ]]`
- **Grupos**: Se detectan automaticamente `CORO`, `VERSO`, `PRE CORO`, `TODOS`

## Atajos de teclado

| Tecla | Accion |
|-------|--------|
| `Espacio` | Play / Pausa |
| `Flechas ↑→` | Aumentar velocidad |
| `Flechas ↓←` | Disminuir velocidad |
| `F` | Pantalla completa |
| `Esc` | Volver al editor |

## Uso

1. Abre `index.html` en tu navegador
2. Pega tu guion en el editor
3. Ajusta velocidad y tamano de letra
4. Personaliza colores de personajes (opcional)
5. Haz clic en **Iniciar Teleprompter**
6. Presiona **Play** o la tecla **Espacio**

## Tecnologias

- HTML5
- CSS3 (Custom Properties, Grid, Flexbox)
- JavaScript vanilla (sin frameworks)
