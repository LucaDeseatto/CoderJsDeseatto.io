/*Index*/
let bicicletas = [];

const contenedorTarjetas = document.querySelector(".productos-container"),
cantidadElement = document.querySelector("#cantidad"),
precioElement = document.querySelector("#precio"),
carritoVacioElement = document.querySelector("#carrito-vacio"),
totalesContainer = document.querySelector("#totales"),
cuentaCarritoElement = document.querySelector(".cuenta-carrito"),
reiniciar = document.querySelector("#reiniciar"),
cartConteniner = document.querySelector("#cartcontainer")

fetch('https://raw.githubusercontent.com/LucaDeseatto/CoderJsDeseatto.io/master/db/data.json')
.then(response => response.json())
.then(data => {
    console.log(data);
    bicicletas = data;
    crearTarjetasProductosInicio(bicicletas);
})
.catch(error => {
    console.error('Error al obtener los datos:', error);
});

/*Carts*/

  // Creación de tarjetas de productos en el carrito
function crearTarjetasProductosCarrito() {
  console.log("Creando tarjetas del carrito");  // Log para verificar la ejecución de la función
  contenedorTarjetas.innerHTML = "";
  //Manejo de caso vacio
  const productos = JSON.parse(localStorage.getItem("bicicletas")) || []; 

  console.log("Productos del carrito:", productos);  // Log para verificar los productos obtenidos

  if (productos && productos.length > 0) {
    productos.forEach((producto) => {
      const nuevaBicicleta = document.createElement("div");
      nuevaBicicleta.classList = "tarjeta-producto";
      nuevaBicicleta.innerHTML = `
      <img src="../img/${producto.img}" alt="${producto.nombre}">
      <h3>${producto.nombre}</h3>
      <span>$${producto.precio}</span>
      <div>
      <button>-</button>
      <span class="cantidad">${producto.cantidad}</span>
      <button>+</button>
      </div>
      `;

      const botones = nuevaBicicleta.getElementsByTagName("button");
      if (botones.length === 2) {
          botones[0].addEventListener("click", (e) => {
              const cantidadElement = e.target.parentElement.querySelector(".cantidad");
              cantidadElement.innerText = restarAlCarrito(producto);
              actualizarTotales();
          });
          botones[1].addEventListener("click", (e) => {
              const cantidadElement = e.target.parentElement.querySelector(".cantidad");
              cantidadElement.innerText = agregarAlCarrito(producto);
              actualizarTotales();
          });
      }
      contenedorTarjetas.appendChild(nuevaBicicleta);
    });
  } else {
    console.log("El carrito está vacío");  // Log para cuando el carrito esté vacío
    carritoVacioElement.classList.remove("escondido");
    totalesContainer.classList.add("escondido");
  }
  revisarMensajeVacio();
  actualizarTotales();
  actualizarNumeroCarrito();
}


function crearTarjetasProductosInicio(productos){
  if (contenedorTarjetas) {
    productos.forEach(producto => {
      const nuevaBicicleta = document.createElement("div");
      nuevaBicicleta.classList = "tarjeta-producto";
      nuevaBicicleta.innerHTML = `
      <div class="productos-container">
      <img src="./img/${producto.img}" alt="${producto.nombre}">
      <h3>${producto.nombre}</h3>
      <p class="precio">$${producto.precio}</p>
      <button class="button">Agregar</button>
      </div>
      `;
      
      contenedorTarjetas.appendChild(nuevaBicicleta); 
      const boton = nuevaBicicleta.querySelector(".button");
      if (boton) {
          boton.addEventListener("click", () => agregarAlCarrito(producto));
      }
    });
  }
}


function actualizarTotales() {
  const productos = JSON.parse(localStorage.getItem("bicicletas"));
  let cantidad = 0;
  let precio = 0;
  if (productos && productos.length > 0) {
    productos.forEach((producto) => {
      cantidad += producto.cantidad;
      precio += producto.precio * producto.cantidad;
    });
  }
  cantidadElement.innerText = cantidad;
  precioElement.innerText = precio;
  if(precio === 0) {
    reiniciarCarrito();
    revisarMensajeVacio();
  }
}

function revisarMensajeVacio() {
  const productos = JSON.parse(localStorage.getItem("bicicletas"));
  carritoVacioElement.classList.toggle("escondido", productos);
  totalesContainer.classList.toggle("escondido", !productos);
}


/*CartServicee*/ 

function agregarAlCarrito(producto){
  //Reviso si el producto está en el carrito.
  let memoria = JSON.parse(localStorage.getItem("bicicletas"));
  let cantidadProductoFinal;
  //Si no hay localstorage lo creo
  if(!memoria || memoria.length === 0) {
    const nuevoProducto = getNuevoProductoParaMemoria(producto)
    localStorage.setItem("bicicletas",JSON.stringify([nuevoProducto]));
    actualizarNumeroCarrito();
    cantidadProductoFinal = 1;
  }
  else {
    //Si hay localstorage me fijo si el artículo ya está ahí
    const indiceProducto = memoria.findIndex(bicicleta => bicicleta.id === producto.id)
    const nuevaMemoria = memoria;
    //Si el producto no está en el carrito lo agregoooooo
    if(indiceProducto === -1){
      const nuevoProducto = getNuevoProductoParaMemoria(producto);
      nuevaMemoria.push(nuevoProducto);
      cantidadProductoFinal = 1;
    } else {
      //Si el producto está en el carrito le agrego 1 a la cantida.
      nuevaMemoria[indiceProducto].cantidad ++;
      cantidadProductoFinal = nuevaMemoria[indiceProducto].cantidad;
    }
    localStorage.setItem("bicicletas",JSON.stringify(nuevaMemoria));

    console.log("Producto agregado al carrito:", nuevaMemoria);  // Log para verificar el producto agregado

    actualizarNumeroCarrito();
    return cantidadProductoFinal;
  }
}

/** Resta una unidad de un producto del carrito */
function restarAlCarrito(producto){
  let memoria = JSON.parse(localStorage.getItem("bicicletas"));
  let cantidadProductoFinal = 0;
  const indiceProducto = memoria.findIndex(bicicleta => bicicleta.id === producto.id)
  let nuevaMemoria = memoria;
  nuevaMemoria[indiceProducto].cantidad--;
  cantidadProductoFinal = nuevaMemoria[indiceProducto].cantidad;
  if(cantidadProductoFinal === 0){
    nuevaMemoria.splice(indiceProducto,1)
  };
  localStorage.setItem("bicicletas",JSON.stringify(nuevaMemoria));
  
  console.log("Producto restado del carrito:", nuevaMemoria);  // Log para verificar el producto restado
  actualizarNumeroCarrito();
  return cantidadProductoFinal;
}


function getNuevoProductoParaMemoria(producto){
  const nuevoProducto = producto;
  nuevoProducto.cantidad = 1;
  return nuevoProducto;
}


function actualizarNumeroCarrito(){
  let cuenta = 0;
  const memoria = JSON.parse(localStorage.getItem("bicicletas"));
  if(memoria && memoria.length > 0){
    cuenta = memoria.reduce((acum, current)=>acum+current.cantidad,0)
    return cuentaCarritoElement.innerText = cuenta;
  }
  cuentaCarritoElement.innerText = 0;
}

actualizarNumeroCarrito();

function reiniciarCarrito(){
  localStorage.removeItem("bicicletas");
  actualizarNumeroCarrito();
}

if(reiniciar){
  reiniciar.addEventListener("click", () => {
    reiniciarCarrito();
    revisarMensajeVacio();
  });
}
