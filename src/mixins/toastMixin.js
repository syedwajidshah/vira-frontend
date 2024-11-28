// src/mixins/toastMixin.js
import Swal from 'sweetalert2';

export default {
  methods: {
    showToast(type, title, text = "") {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: type, // 'success', 'error', etc.
          title: title,
          text: text, // Optional additional message
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      },
      
  },
};
