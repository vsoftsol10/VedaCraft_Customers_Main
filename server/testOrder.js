async function testOrder() {
  try {
    const res = await fetch('https://vedacraft-customers-main.onrender.comders/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: [{ name: 'Test', quantity: 1, price: 100 }],
        address: null,
        paymentMethod: 'Cash on Delivery',
        total: 100,
        itemCount: 1,
        product: 'Test Product'
      })
    });

    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', data);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testOrder();
