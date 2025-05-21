import PaystackPop from '@paystack/inline-js'

export const completePayment = (access_code) => {
    const popup = new PaystackPop()
    popup.resumeTransaction(access_code);
}

  