/**
 * Evita que el traductor del navegador tumbe la app.
 *
 * El traductor de Chrome (y el de Safari) reemplaza cada nodo de texto suelto
 * por un <font> propio. React no se entera: su copia del árbol sigue apuntando
 * al nodo de texto viejo, así que cuando toca actualizar o desmontar esa parte
 * llama a removeChild/insertBefore con un nodo que ya no es hijo de donde React
 * cree, y el navegador tira NotFoundError. React no puede recuperarse de un
 * error en la fase de commit: desmonta todo y salta el error boundary.
 *
 * Es el bug conocido facebook/react#11538, sin arreglo del lado de React. La
 * alternativa sería envolver en <span> cada texto condicional del JSX —el
 * patrón {cond ? "A" : "B"} suelto dentro de un elemento— pero en esta app hay
 * cientos repartidos por todas las pantallas.
 *
 * Estas dos guardas convierten esa excepción en un no-op: si el nodo ya no está
 * donde React espera, es que el traductor lo movió y no hay nada que quitar. El
 * texto queda traducido y la app sigue viva. El console.warn está para que un
 * removeChild genuinamente incorrecto no pase inadvertido.
 */
export function installTranslatorGuard() {
  if (typeof Node === "undefined" || !Node.prototype) return;

  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function removeChild<T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) {
      console.warn("[translatorGuard] removeChild sobre un nodo que ya no es hijo; se ignora", child);
      return child;
    }
    return originalRemoveChild.call(this, child) as T;
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function insertBefore<T extends Node>(
    this: Node,
    newNode: T,
    referenceNode: Node | null
  ): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      console.warn("[translatorGuard] insertBefore con una referencia ajena; se inserta al final", newNode);
      return originalInsertBefore.call(this, newNode, null) as T;
    }
    return originalInsertBefore.call(this, newNode, referenceNode) as T;
  };
}
