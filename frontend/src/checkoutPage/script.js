// 1. Khởi tạo Stripe với Publishable Key (Lấy từ Dashboard Stripe của bạn)
// Thay bằng key dạng pk_test_... của bạn
const stripe = Stripe('pk_test_51TDj4xHG5kjK9VxF23zI02NKrGAbSZOiOrofKsp7y1Mb3EMwc29lTAejYHCxb3ih7DX6fOqQ5HkIOIMtu4aFBLIm00BmzuvoGw'); 
const elements = stripe.elements();

const serverUrl = 'http://localhost:3600'

// 2. Custom style một chút cho ô nhập thẻ của Stripe
const style = {
    base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
            color: '#aab7c4'
        }
    },
    invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
    }
};

// 3. Tạo Card Element và gắn (mount) nó vào thẻ div trong HTML
const card = elements.create('card', { style: style, hidePostalCode: true });
card.mount('#card-element');

// 4. Lắng nghe và hiển thị lỗi real-time khi người dùng gõ sai số thẻ
card.on('change', ({error}) => {
    const displayError = document.getElementById('card-errors');
    if (error) {
        displayError.textContent = error.message;
    } else {
        displayError.textContent = '';
    }
});

// 5. Xử lý khi nhấn nút Thanh toán
const form = document.getElementById('payment-form');

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setLoading(true);

    const nameInput = document.getElementById('cardholder-name').value;

    // Bước A: Tạo PaymentMethod từ thông tin thẻ vừa nhập
    const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: 'card',
        card: card,
        billing_details: {
            name: nameInput,
        },
    });

    if (error) {
        // Có lỗi từ phía Stripe (Ví dụ: thẻ hết hạn, sai số...)
        const errorElement = document.getElementById('card-errors');
        errorElement.textContent = error.message;
        setLoading(false);
    } else {
        
        console.log('Tạo PaymentMethod thành công:', paymentMethod.id);

        const response = await fetch(`${serverUrl}/api/payment/payment-intent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                paymentMethodId: paymentMethod.id,
                userId: '01903b6e-34a5-7b8a-8d3f-4e2c1a9f5d7b',
                orderIds: [
                    '01903b6e-34a5-7b8a-8d3f-4e2c1a9f5d7b',
                ],
                amount: 100000,
                currency: 'vnd'
            })
        })
        const data = await response.json()
        if(!data) {
            console.log('Không có response')
        } else {
            console.log(data)
        }


        const clientSecret = data.clientSecret;
        
        console.log(clientSecret)
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: card, // Form nhập thẻ của Stripe
                billing_details: { name: 'ABC' },
            },
        });

        if (error) {
            // Trực quan hóa lỗi cho người dùng (Ví dụ: Thẻ hết tiền, sai số thẻ)
            showErrorToUser(error.message);
        } else if (paymentIntent.status === 'succeeded') {
            // Thanh toán thành công ngay lập tức (Thẻ không trùng 3DS)
            alert('Thanh toán thành công')
        } else {
            console.log("???")
        }

        
        
        setLoading(false);
    }
});

// Hàm hỗ trợ UI thay đổi trạng thái khi đang xử lý
function setLoading(isLoading) {
    if (isLoading) {
        document.getElementById('submit-btn').disabled = true;
        document.getElementById('button-text').textContent = 'Đang xử lý...';
    } else {
        document.getElementById('submit-btn').disabled = false;
        document.getElementById('button-text').textContent = 'Thanh toán ngay';
    }
}