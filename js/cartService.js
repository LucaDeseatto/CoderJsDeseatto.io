/*Index*/
let bicicletas = [];

const contenedorTarjetas = document.querySelector(".productos-container"),
cantidadElement = document.querySelector("#cantidad"),
precioElement = document.querySelector("#precio"),
carritoVacioElement = document.querySelector("#carrito-vacio"),
totalesContainer = document.querySelector("#totales"),
cuentaCarritoElement = document.querySelector(".cuenta-carrito"),
reiniciar = document.querySelector("#reiniciar"),
cartConteniner = document.querySelector("#cartcontainer"),
comprar = document.querySelector("#comprar");

fetch('https://raw.githubusercontent.com/LucaDeseatto/CoderJsDeseatto.io/master/db/data.json')
.then(response => response.json())
.then(data => {
    bicicletas = data;
    crearTarjetasProductosInicio(bicicletas);
})
.catch(error => {
    console.error('Error al obtener los datos:', error);
});

/*Carts*/
document.addEventListener("DOMContentLoaded", function() {
    actualizarNumeroCarrito();
    crearTarjetasProductosCarrito();
  });

    // Creación de tarjetas de productos en el carrito
    function crearTarjetasProductosCarrito() {
      const cartContent = document.getElementById("cartcontainer");

      // Verificación para evitar errores si cartContent es null
      if (!cartContent) {
          console.error("Elemento cartcontainer no encontrado en el DOM");
          return;
      }

      cartContent.innerHTML = ""; // Limpia el contenido anterior

      //Manejo de caso vacio
      const productos = JSON.parse(localStorage.getItem("bicicletas")) || []; 

      if (productos && productos.length > 0) {
        productos.forEach((producto) => {
          const nuevaBicicleta = document.createElement("div");
          nuevaBicicleta.classList = "tarjeta-producto";
          nuevaBicicleta.innerHTML = `
          <img src="../img/${producto.img}" alt="${producto.nombre}">
          <h3>${producto.nombre}</h3>
          <span>$${producto.precio.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
                  const nuevaCantidad = restarAlCarrito(producto);
                  cantidadElement.innerText = nuevaCantidad;
                  if (nuevaCantidad === 0) {
                    // Eliminar la tarjeta del producto del DOM
                    cartContent.removeChild(nuevaBicicleta);
                  }
                  actualizarTotales();
              });
              botones[1].addEventListener("click", (e) => {
                  const cantidadElement = e.target.parentElement.querySelector(".cantidad");
                  cantidadElement.innerText = agregarAlCarrito(producto);
                  actualizarTotales();
              });
          }
          // Verificar si cartContent existe antes de llamar a appendChild
          if (cartContent) {
            cartContent.appendChild(nuevaBicicleta);
        }
        });
      } else {
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
        <p class="precio">$${producto.precio.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
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
    precioElement.innerText = precio.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if(precio === 0) {
      reiniciarCarrito();
      revisarMensajeVacio();
    }
  }

  function revisarMensajeVacio() {
    const productos = JSON.parse(localStorage.getItem("bicicletas"));
    if (carritoVacioElement) {
      carritoVacioElement.classList.toggle("escondido", productos);
    }
    if (totalesContainer) {
      totalesContainer.classList.toggle("escondido", !productos);
    }
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
      actualizarNumeroCarrito();
      crearTarjetasProductosCarrito();
      return cantidadProductoFinal;
    }
  }

  function restarAlCarrito(producto){
    let memoria = JSON.parse(localStorage.getItem("bicicletas"));
    const indiceProducto = memoria.findIndex(bicicleta => bicicleta.id === producto.id);
  
    if (indiceProducto !== -1) {
      memoria[indiceProducto].cantidad--;
      
      if (memoria[indiceProducto].cantidad === 0) {
        // Si la cantidad es 0, eliminar el producto del carrito
        memoria.splice(indiceProducto, 1);
        
      } 
        // Actualizar el localStorage
      localStorage.setItem("bicicletas", JSON.stringify(memoria));
      
      console.log("Producto restado del carrito:", memoria);
      actualizarNumeroCarrito();
      crearTarjetasProductosCarrito();
      return memoria[indiceProducto] ? memoria[indiceProducto].cantidad : 0;
    }

    return 0;
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
      crearTarjetasProductosCarrito();
    });
  }
 
  if(comprar){
    comprar.addEventListener("click",() =>{
      let precio = 0;

      const productos = JSON.parse(localStorage.getItem("bicicletas"));

      // Calcular el total del carrito
      if (productos && productos.length > 0) {
        precio = productos.reduce((total, producto) => {
          return total + (producto.precio * producto.cantidad);
        }, 0);
      }

      if(bicicletas.length == 0){

        Swal.fire("El carrito está vacío!", "", "error");
        return;
  
      }
      Swal.fire({
        title: "El total del carrito",
        text: "Total: " +precio.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Pagar",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {

            Swal.fire("¡Gracias por su compra ", "", "success");
            // Vaciar el carrito
            bicicletas = [];
                
          // Actualizar el localStorage
          reiniciarCarrito();
          crearTarjetasProductosCarrito();
        }else if (result.isDenied) {
          Swal.fire("Continue con la compra", "", "info");
      }
      });
    });
  }
