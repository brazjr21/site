const PIX_URL = 'https://www.pagamentos-seguros.app/api-pix/btKq_tIxKS1U9Wel9bivk2-S0FYHUppCMtlJH_Ji91obwbbjhDLtOxqXCeLOmeArzwDmrPOu8ge6nJtzEMoPUg';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { amount, personal, bump, utm, upsell } = req.body || {};

        const amountBRL = Number(amount) || 0;
        if (amountBRL < 1) return res.status(400).json({ error: 'Valor mínimo de R$ 1,00' });

        const cpfDigits = String(personal?.cpf || '').replace(/\D/g, '');
        const phoneDigits = String(personal?.phoneDigits || personal?.phone || '').replace(/\D/g, '');

        const customer = {
            name: String(personal?.name || 'Cliente iFood').trim(),
            document: cpfDigits || '00000000000',
            email: String(personal?.email || 'cliente@ifoodbag.app').trim(),
            phone: phoneDigits || '11999999999'
        };

        const bumpPrice = Number(bump?.price || 0);
        const isUpsell = upsell?.enabled === true;
        let itemTitle = 'Bag do iFood - Taxa de Envio';
        if (isUpsell) {
            itemTitle = String(upsell?.title || 'Prioridade de Envio');
        } else if (bumpPrice > 0) {
            itemTitle = 'Bag iFood + Seguro Bag';
        }

        const utmString = utm
            ? Object.entries(utm).filter(([, v]) => v).map(([k, v]) => `${k}=${v}`).join('&')
            : '';

        const payload = {
            amount: amountBRL,
            description: itemTitle,
            customer,
            item: { title: itemTitle, price: amountBRL, quantity: 1 },
            paymentMethod: 'PIX',
            utm: utmString
        };

        const extRes = await fetch(PIX_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(payload)
        });

        let data = {};
        try { data = await extRes.json(); } catch (_) {}

        if (!extRes.ok) {
            const errMsg = data?.error || data?.message || data?.msg || `Gateway retornou ${extRes.status}`;
            return res.status(400).json({ error: errMsg });
        }

        const txId = data.transactionId || data.transaction_id || data.id || data.txid || '';
        const pixCode = data.pixCode || data.pix_code || data.qrCode || data.qr_code || data.emv || data.code || '';

        if (!txId || !pixCode) {
            return res.status(500).json({ error: 'Resposta inválida do gateway de pagamento.' });
        }

        return res.status(200).json({
            idTransaction: txId,
            paymentCode: pixCode,
            paymentQrUrl: data.paymentQrUrl || data.qrCodeImage || '',
            status: 'pending',
            gateway: 'pagamentos-seguros'
        });

    } catch (err) {
        console.error('PIX create error:', err);
        return res.status(500).json({ error: 'Erro interno ao gerar PIX: ' + err.message });
    }
}
