#!/usr/bin/env node

const fetch = require('node-fetch');

async function testTourRouteAPI() {
    try {
        console.log('🧪 Testing tour route creation API...\n');

        const testRoute = {
            name: 'Test Rota',
            duration: 8,
            price: 100,
            currency: 'EUR',
            description: 'Test açıklama'
        };

        console.log('Sending request to /api/tour-routes...');
        console.log('Data:', JSON.stringify(testRoute, null, 2));

        const response = await fetch('http://localhost:3000/api/tour-routes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': 'your-session-cookie-here' // Manuel olarak eklenecek
            },
            body: JSON.stringify(testRoute)
        });

        console.log('\nResponse status:', response.status);
        const data = await response.json();
        console.log('Response data:', JSON.stringify(data, null, 2));

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testTourRouteAPI();
