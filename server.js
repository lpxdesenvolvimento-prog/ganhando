const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Payment } = require('mercadopago');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ============================================================
// 🔐 SEU TOKEN DO MERCADO PAGO - COLOCADO COM SEGURANÇA!
// ============================================================
const client = new MercadoPagoConfig({
    accessToken: 'APP_USR-6823597079505982-052520-c5e51cc69baa71a5fd82936f285e214c-3047531051'
});

// Endpoint para criar pagamento PIX
app.post('/api/criar-pix', async (req, res) => {
    try {
        const { valor, nome, email, descricao } = req.body;
        
        console.log(`📤 Solicitando pagamento PIX: R$ ${valor} para ${nome}`);
        
        const payment = await new Payment(client).create({
            body: {
                transaction_amount: parseFloat(valor),
                description: descricao || `Saque PIX - ${nome}`,
                payment_method_id: 'pix',
                payer: {
                    email: email,
                    first_name: nome.split(' ')[0],
                    last_name: nome.split(' ').slice(1).join(' ') || 'Cliente'
                }
            }
        });
        
        res.json({
            success: true,
            qrCode: payment.point_of_interaction.transaction_data.qr_code,
            qrCodeBase64: payment.point_of_interaction.transaction_data.qr_code_base64,
            pixCopyPaste: payment.point_of_interaction.transaction_data.qr_code,
            paymentId: payment.id
        });
        
    } catch (error) {
        console.error('❌ Erro no pagamento:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message,
            detalhes: error.cause || 'Verifique seu token do Mercado Pago'
        });
    }
});

// Endpoint para verificar status do pagamento
app.get('/api/status-pagamento/:id', async (req, res) => {
    try {
        const payment = await new Payment(client).get({ id: req.params.id });
        res.json({ 
            status: payment.status,
            status_detail: payment.status_detail
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota de teste
app.get('/api/teste', (req, res) => {
    res.json({ message: 'Backend funcionando! Token configurado.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`💰 Token do Mercado Pago configurado com segurança!`);
    console.log(`📱 Endpoint PIX: http://localhost:${PORT}/api/criar-pix`);
});