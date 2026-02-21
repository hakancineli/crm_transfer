
const WA_SERVICE_URL = 'https://crm-transfer-whatsapp-production.up.railway.app';
const WA_SERVICE_KEY = 'crm-wa-service-secret-2025';
const USER_ID = '9cc5499f-e0dd-452f-a51c-8cf8ff739eca';

async function check() {
    try {
        const res = await fetch(`${WA_SERVICE_URL}/sessions/${USER_ID}/status`, {
            headers: { 'x-api-key': WA_SERVICE_KEY }
        });
        const data = await res.json();
        console.log('--- SERVICE STATUS ---');
        console.log(JSON.stringify(data, null, 2));

        const chatsRes = await fetch(`${WA_SERVICE_URL}/chats/${USER_ID}`, {
            headers: { 'x-api-key': WA_SERVICE_KEY }
        });
        console.log('--- CHATS STATUS ---');
        console.log(chatsRes.status);
        if (chatsRes.status === 200) {
            const chats = await chatsRes.json();
            console.log(`Found ${chats.length} chats`);
        } else {
            console.log(await chatsRes.text());
        }
    } catch (e) {
        console.error(e);
    }
}
check();
