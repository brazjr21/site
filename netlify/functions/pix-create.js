const PIX_URL = 'https://www.pagamentos-seguros.app/api-pix/btKq_tIxKS1U9Wel9bivk2-S0FYHUppCMtlJH_Ji91obwbbjhDLtOxqXCeLOmeArzwDmrPOu8ge6nJtzEMoPUg';

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
};

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: CORS, body: '' };
    }
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const body = JSON.parse(event.body || '{}');
        const { amount, personal, bump, shipping, utm, upsell } = body;

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

        const extRes = await fetch(PIX_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await extRes.json().catch(() => ({}));

        if (!extRes.ok) {
            return {
                statusCode: 400, headers: CORS,
                body: JSON.stringify({ error: String(data?.error || 'Falha ao gerar PIX. Tente novamente.') })
            };
        }

        if (!data.transactionId || !data.pixCode) {
            return {
                statusCode: 500, headers: CORS,
                body: JSON.stringify({ error: 'Resposta inválida do gateway de pagamento.' })
            };
        }

        return {
            statusCode: 200,
            headers: { ...CORS, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                idTransaction: data.transactionId,
                paymentCode: data.pixCode,
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
