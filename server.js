const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Payment } = require('mercadopago');

const app = express();
app.use(cors());
app.use(express.json());

const client = new MercadoPagoConfig({
    accessToken: 'SEU_TOKEN_AQUI' // Cole seu token real
});

app.post('/api/criar-pix', async (req, res) => {
    try {
        const { valor, nome, email } = req.body;
        const payment = await new Payment(client).create({
            body: {
                transaction_amount: parseFloat(valor),
                description: `Saque MoneyAds`,
                payment_method_id: 'pix',
                payer: { email, first_name: nome.split(' ')[0] }
            }
        });
        res.json({
            success: true,
            qrCodeBase64: payment.point_of_interaction.transaction_data.qr_code_base64,
            paymentId: payment.id
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/status-pagamento/:id', async (req, res) => {
    const payment = await new Payment(client).get({ id: req.params.id });
    res.json({ status: payment.status });
});

app.listen(3000, () => console.log('Server on port 3000'));
