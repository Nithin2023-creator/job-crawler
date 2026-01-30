import toast, { Toaster } from 'react-hot-toast';

// Custom toast configurations with hacking theme
const toastConfig = {
    style: {
        background: 'rgba(10, 10, 10, 0.95)',
        color: '#fff',
        border: '1px solid rgba(0, 243, 255, 0.3)',
        borderRadius: '8px',
        backdropFilter: 'blur(20px)',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '14px',
        padding: '12px 16px',
    },
    success: {
        iconTheme: {
            primary: '#00ff41',
            secondary: '#000',
        },
    },
    error: {
        iconTheme: {
            primary: '#ff0040',
            secondary: '#000',
        },
    },
    loading: {
        iconTheme: {
            primary: '#00f3ff',
            secondary: '#000',
        },
    },
};

// Toast wrapper component
export const ToastContainer = () => {
    return (
        <Toaster
            position="top-right"
            toastOptions={toastConfig}
            containerStyle={{
                top: 20,
                right: 20,
            }}
        />
    );
};

// Utility functions for showing toasts
export const showToast = {
    success: (message) => {
        toast.success(message, {
            duration: 3000,
            style: {
                ...toastConfig.style,
                borderColor: 'rgba(0, 255, 65, 0.5)',
            },
        });
    },

    error: (message) => {
        toast.error(message, {
            duration: 4000,
            style: {
                ...toastConfig.style,
                borderColor: 'rgba(255, 0, 64, 0.5)',
            },
        });
    },

    loading: (message) => {
        return toast.loading(message, {
            style: {
                ...toastConfig.style,
                borderColor: 'rgba(0, 243, 255, 0.5)',
            },
        });
    },

    promise: (promise, messages) => {
        return toast.promise(promise, {
            loading: messages.loading || 'Processing...',
            success: messages.success || 'Success!',
            error: messages.error || 'Error occurred',
        }, {
            style: toastConfig.style,
        });
    },

    dismiss: (toastId) => {
        toast.dismiss(toastId);
    },
};

export default toast;
