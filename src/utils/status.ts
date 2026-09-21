/**
 * Turns a delivery status name from the API ("client_address_not_found") into
 * something readable ("Client address not found").
 */
function humanizeStatus(name: string): string {
  if (!name) return "";

  const words = name.split("_").join(" ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export { humanizeStatus };
