import Swal from 'sweetalert2'

export const useAlert = () => {
  return {
    alert: (title: string, text?: string, icon: 'success' | 'error' | 'warning' | 'info' | 'question' = 'warning') => {
      return Swal.fire({
        title,
        text,
        icon,
        confirmButtonColor: '#111827', // gray-900 (theme color)
        confirmButtonText: 'ตกลง',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'rounded-xl px-6 py-2.5 font-bold'
        }
      })
    },
    confirm: (title: string, text?: string, icon: 'success' | 'error' | 'warning' | 'info' | 'question' = 'warning') => {
      return Swal.fire({
        title,
        text,
        icon,
        showCancelButton: true,
        confirmButtonColor: '#111827',
        cancelButtonColor: '#ef4444',
        confirmButtonText: 'ยืนยัน',
        cancelButtonText: 'ยกเลิก',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'rounded-xl px-6 py-2.5 font-bold',
          cancelButton: 'rounded-xl px-6 py-2.5 font-bold bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        }
      }).then((result) => result.isConfirmed)
    }
  }
}
