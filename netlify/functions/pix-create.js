const https = require('https');

const PIX_URL = 'https://www.pagamentos-seguros.app/api-pix/btKq_tIxKS1U9Wel9bivk2-S0FYHUppCMtlJH_Ji91obwbbjhDLtOxqXCeLOmeArzwDmrPOu8ge6nJtzEMoPUg';

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
};

function httpsPost(url, body) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const bodyStr = JSON.stringify(body);
        const options = {
            hostname: urlObj.hostname,
            port: 443,
            path: urlObj.pathname + urlObj.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(bodyStr)
            }
        };
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                let parsed = {};
                try { parsed = JSON.parse(data); } catch (_) {}
                resolve({ statusCode: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 300, data: parsed });
            });
        });
        req.on('error', reject);
        req.write(bodyStr);
        req.end();
    });
}

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: CORS, body: '' };
    }
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const body = JSON.parse(event.body || '{}');
        const { amount, personal, bump, utm, upsell } = body;

        const amountBRL = Number(amount) || 0;
        if (amountBRL < 1) {
            return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Valor mínimo de R$ 1,00' }) };
        }

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

        const result = await httpsPost(PIX_URL, payload);
        const data = result.data;

        if (!result.ok) {
            return {
                statusCode: 400, headers: CORS,
                body: JSON.stringify({ error: String(data?.error || 'Falha ao gerar PIX. Tente novamente.') })
            };
        }

        const txId = data.transactionId || data.transaction_id || data.id || data.txid || '';
        const pixCode = data.pixCode || data.pix_code || data.qrCode || data.qr_code || data.emv || data.code || '';

        if (!txId || !pixCode) {
            console.error('Gateway response missing fields:', JSON.stringify(data));
            return {
                statusCode: 500, headers: CORS,
                body: JSON.stringify({ error: 'Resposta inválida do gateway de pagamento.' })
            };
        }

        return {
            statusCode: 200,
            headers: { ...CORS, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                idTransaction: txId,
                paymentCode: pixCode,
                paymentQrUrl: data.paymentQrUrl || data.qrCodeImage || data.qr_code_image || '',
                status: 'pending',
                gateway: 'pagamentos-seguros'
            })
        };

    } catch (err) {
        console.error('PIX create error:', err);
        return {
            statusCode: 500, headers: CORS,
            body: JSON.stringify({ error: 'Erro interno ao gerar PIX. Tente novamente.' })
        };
    }
};
