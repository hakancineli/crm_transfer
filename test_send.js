
const WA_SERVICE_URL = 'https://crm-transfer-whatsapp-production.up.railway.app';
const WA_SERVICE_KEY = 'crm-wa-service-secret-2025';
const USER_ID = '9cc5499f-e0dd-452f-a51c-8cf8ff739eca';

async function testSend() {
    try {
        const res = await fetch(`${WA_SERVICE_URL}/sessions/${USER_ID}/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': WA_SERVICE_KEY
            },
            body: JSON.stringify({ to: '905545812034@s.whatsapp.net', message: 'Test message from server' })
        });
        const data = await res.json();
        console.log('--- SEND TEST ---');
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}
testSend();
