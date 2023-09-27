export default function showToast(bgColor, text) {
  Toastify({
    text: text,
    style: {
      background: bgColor,
    },
    offset: {
      y: 40, // Vertical axis - can be a number or a string indicating unity. eg: '2em'
    },
    gravity: "top", // `top` or `bottom`
    position: "center", // `left`, `center` or `right`
    stopOnFocus: true, // Prevents dismissing of toast on hover
    duration: 3000,
    className: "toast-animated-border", // Add the CSS class for the animated border
  }).showToast();
}
