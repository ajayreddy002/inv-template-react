import { toast } from "react-toastify";

export default function showToast(type, message, position) {
    if (type === 'error') {
        toast.error(message, {
            position: position ? position : "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'colored'
        });
    }
    if (type === 'info') {
        toast.info(message, {
            position: position ? position : "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'colored'
        });
    }
    if (type === 'success') {
        toast.success(message, {
            position: position ? position : "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'colored'
        });
    }
    if (type === 'warning') {
        toast.warning(message, {
            position: position ? position : "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'colored'
        });
    }
}