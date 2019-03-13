<link rel="stylesheet" href="styles.css">
<script src='https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-MML-AM_CHTML' async></script>

# Cálculo Lambda

<div id="contenedor">

El cálculo lambda es un sistema formal que nos permite modelar el concepto de "computación"
(o más precisamente, el de "función computable").

Las expresiones de cálculo lambda se pueden definir considerando tres elementos:
1. Variables, como \\(x\\), \\(y\\), \\(z\\) o \\(marta\\).

    Por ejemplo, intentá definir una variable llamada "pepe" haciendo click en el cuadrado naranja, y presionando _Enter_ al finalizar <img style="vertical-align: text-bottom; height: 1em;" src="https://twemoji.maxcdn.com/36x36/1f447.png" />

<div class="lambda only-variables without-undo without-evaluate">
_
</div>

2. Abstracciones, que se forman como \\(\lambda \text{\<variable\>}.\text{\<expresion\>}\\).

    Como vimos, las variables son expresiones, por lo tanto \\(\lambda x.x\\) es una expresión.
    Otra expresión puede ser \\(\lambda x.\lambda y.x\\), ya que las abstracciones también son expresiones.
    
    Semánticamente, las abstracciones representan funciones sin nombre:
    \\[\lambda x.x \sim f(x) = x\\]

3. Aplicaciones, que se forman como \\(\text{\<expresion\>} \\; \text{\<expresion\>}\\).

    Ejemplos de aplicaciones pueden ser:
    - \\(a \\; b\\)
    - \\((\lambda x.x) \\; y\\)
    - \\((\lambda x. x \\; x) \\; (\lambda y.y)\\)
    
    Semánticamente, una aplicación representa pasar un argumento a una función:
    \\[(\lambda x.x) y \sim f(y), \text{ donde: } f(x) = x\\]

---

### Editor completo

<div class="lambda">
(λx.λy._) a b
</div>

</div>

<script src="bundle.js"></script>
