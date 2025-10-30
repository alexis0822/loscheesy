// Order System JavaScript with Formspree Integration
document.addEventListener('DOMContentLoaded', function() {
    // Cart state
    let cart = [];
    let selectedLocation = '';
    
    // DOM Elements
    const locationSelect = document.getElementById('location-select');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const checkoutForm = document.getElementById('checkout-form');
    const orderConfirmation = document.getElementById('order-confirmation');
    const backToCartBtn = document.getElementById('back-to-cart-btn');
    const submitOrderBtn = document.getElementById('submit-order-btn');
    const newOrderBtn = document.getElementById('new-order-btn');
    
    // Event Listeners
    locationSelect.addEventListener('change', function() {
        selectedLocation = this.value;
        updateCheckoutButton();
    });
    
    // Menu item click handlers
    document.querySelectorAll('.order-item').forEach(item => {
        item.addEventListener('click', function(e) {
            if (!e.target.classList.contains('size-option') && 
                !e.target.classList.contains('style-option') &&
                !e.target.classList.contains('add-to-cart-btn')) {
                toggleItemOptions(this);
            }
        });
    });
    
    // Size option selection
    document.querySelectorAll('.size-option').forEach(option => {
        option.addEventListener('click', function() {
            const parentItem = this.closest('.order-item');
            const sizeOptions = parentItem.querySelectorAll('.size-option');
            
            sizeOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            
            // Update price display
            const newPrice = this.getAttribute('data-price');
            parentItem.querySelector('.price-display').textContent = newPrice;
        });
    });
    
    // Style option selection (for items like Papas)
    document.querySelectorAll('.style-option').forEach(option => {
        option.addEventListener('click', function() {
            const parentItem = this.closest('.order-item');
            const styleOptions = parentItem.querySelectorAll('.style-option');
            
            styleOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            
            // Update price display
            const newPrice = this.getAttribute('data-price');
            parentItem.querySelector('.price-display').textContent = newPrice;
        });
    });
    
    // Add to cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const parentItem = this.closest('.order-item');
            addToCart(parentItem);
        });
    });
    
    // Checkout process
    checkoutBtn.addEventListener('click', function() {
        if (cart.length > 0 && selectedLocation) {
            checkoutForm.style.display = 'block';
            document.querySelector('.order-grid').style.display = 'none';
        }
    });
    
    backToCartBtn.addEventListener('click', function() {
        checkoutForm.style.display = 'none';
        document.querySelector('.order-grid').style.display = 'grid';
    });
    
    submitOrderBtn.addEventListener('click', function() {
        submitOrder();
    });
    
    newOrderBtn.addEventListener('click', function() {
        resetOrder();
    });
    
    // Functions
    function toggleItemOptions(item) {
        const options = item.querySelector('.order-item-options');
        const isVisible = options.style.display === 'block';
        
        // Hide all other options
        document.querySelectorAll('.order-item-options').forEach(opt => {
            opt.style.display = 'none';
        });
        
        // Toggle this one
        options.style.display = isVisible ? 'none' : 'block';
    }
    
    function addToCart(item) {
        const itemId = item.getAttribute('data-item');
        const itemName = item.querySelector('.order-item-name').textContent;
        
        // Get price - check if it has size or style options
        let price = item.getAttribute('data-price');
        let variant = '';
        
        if (!price) {
            // Check for size options
            const selectedSize = item.querySelector('.size-option.selected');
            if (selectedSize) {
                price = selectedSize.getAttribute('data-price');
                variant = selectedSize.getAttribute('data-size');
            } else {
                // Check for style options
                const selectedStyle = item.querySelector('.style-option.selected');
                if (selectedStyle) {
                    price = selectedStyle.getAttribute('data-price');
                    variant = selectedStyle.getAttribute('data-style');
                }
            }
        }
        
        // Check if item already in cart
        const existingItemIndex = cart.findIndex(cartItem => 
            cartItem.id === itemId && cartItem.variant === variant);
        
        if (existingItemIndex !== -1) {
            // Increment quantity
            cart[existingItemIndex].quantity += 1;
        } else {
            // Add new item
            cart.push({
                id: itemId,
                name: itemName,
                price: parseFloat(price),
                variant: variant,
                quantity: 1
            });
        }
        
        updateCartDisplay();
        updateCheckoutButton();
        toggleItemOptions(item); // Hide options after adding
    }
    
    function updateCartDisplay() {
        cartItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart">Tu carrito está vacío</div>';
            cartTotalElement.textContent = '0.00';
            return;
        }
        
        let total = 0;
        
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
            cartItemElement.innerHTML = `
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name} ${item.variant ? `(${item.variant.toUpperCase()})` : ''}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)} x ${item.quantity}</div>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn minus" data-index="${index}">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn plus" data-index="${index}">+</button>
                    <button class="quantity-btn remove" data-index="${index}">×</button>
                </div>
            `;
            
            cartItemsContainer.appendChild(cartItemElement);
        });
        
        cartTotalElement.textContent = total.toFixed(2);
        
        // Add event listeners to quantity buttons
        document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                decreaseQuantity(index);
            });
        });
        
        document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                increaseQuantity(index);
            });
        });
        
        document.querySelectorAll('.quantity-btn.remove').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                removeFromCart(index);
            });
        });
    }
    
    function increaseQuantity(index) {
        cart[index].quantity += 1;
        updateCartDisplay();
        updateCheckoutButton();
    }
    
    function decreaseQuantity(index) {
        if (cart[index].quantity > 1) {
            cart[index].quantity -= 1;
        } else {
            cart.splice(index, 1);
        }
        updateCartDisplay();
        updateCheckoutButton();
    }
    
    function removeFromCart(index) {
        cart.splice(index, 1);
        updateCartDisplay();
        updateCheckoutButton();
    }
    
    function updateCheckoutButton() {
        if (cart.length > 0 && selectedLocation) {
            checkoutBtn.disabled = false;
        } else {
            checkoutBtn.disabled = true;
        }
    }
    
    function submitOrder() {
        // Get form data
        const customerName = document.getElementById('customer-name').value;
        const customerPhone = document.getElementById('customer-phone').value;
        const customerEmail = document.getElementById('customer-email').value;
        const orderNotes = document.getElementById('order-notes').value;
        
        // Validate required fields
        if (!customerName || !customerPhone) {
            alert('Por favor completa los campos obligatorios: Nombre y Teléfono');
            return;
        }
        
        // Generate order number
        const orderNumber = 'LC-' + Math.floor(1000 + Math.random() * 9000);
        
        // Calculate total
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Prepare order data
        const orderData = {
            orderNumber: orderNumber,
            customerName: customerName,
            customerPhone: customerPhone,
            customerEmail: customerEmail,
            selectedLocation: getLocationName(selectedLocation),
            items: cart,
            notes: orderNotes,
            total: total
        };
        
        // Format order details for Formspree
        const formattedData = formatOrderForFormspree(orderData);
        
        // Submit to Formspree
        submitToFormspree(formattedData, orderNumber);
    }
    
    function getLocationName(locationValue) {
        const locations = {
            'hatillo': 'Hatillo',
            'dorado': 'Dorado',
            'aguadilla': 'Aguadilla',
            'condado': 'Condado'
        };
        return locations[locationValue] || locationValue;
    }
    
    function getCategoryFromItem(item) {
        const itemId = item.id.toLowerCase();
        
        if (itemId.includes('onion-smash') || itemId.includes('bacon-smash') || itemId.includes('deluxe-smash')) {
            return 'Smash Burgers';
        }
        if (itemId.includes('philly') || itemId.includes('chopped-cheese') || itemId.includes('tripleta')) {
            return 'Sandwiches';
        }
        if (itemId.includes('supreme')) {
            return 'Nachos o Papas Supreme';
        }
        if (itemId.includes('quesadilla')) {
            return 'Quesadillas';
        }
        if (itemId.includes('nachos-queso') || itemId.includes('sorullitos') || 
            itemId.includes('queso-frito') || itemId.includes('mazorcas-parmesana-2x') || 
            itemId.includes('mozzarella-sticks') || itemId.includes('alitas') || 
            itemId.includes('queso-fundido') || itemId.includes('surtido')) {
            return 'Aperitivos';
        }
        if (itemId.includes('papas') || itemId.includes('nachos-cheesy') || 
            itemId.includes('sorullitos-complemento') || itemId.includes('mazorca-parmesana') || 
            itemId.includes('mozzarella-sticks-complemento')) {
            return 'Complementos';
        }
        if (itemId.includes('cheesecake') || itemId.includes('milkshake')) {
            return 'Postres';
        }
        if (itemId.includes('coca-cola') || itemId.includes('sprite') || itemId.includes('agua')) {
            return 'Bebidas';
        }
        
        return 'Otros';
    }
    
    function formatOrderForFormspree(orderData) {
        // Build order summary
        let orderSummary = `PEDIDO: ${orderData.orderNumber}\n\n`;
        orderSummary += `CLIENTE:\n`;
        orderSummary += `  • Nombre: ${orderData.customerName}\n`;
        orderSummary += `  • Teléfono: ${orderData.customerPhone}\n`;
        orderSummary += `  • Email: ${orderData.customerEmail || 'No proporcionado'}\n`;
        orderSummary += `  • Local: ${orderData.selectedLocation}\n\n`;
        
        // Group items by category
        const itemsByCategory = {};
        orderData.items.forEach(item => {
            const category = getCategoryFromItem(item);
            if (!itemsByCategory[category]) {
                itemsByCategory[category] = [];
            }
            itemsByCategory[category].push(item);
        });
        
        orderSummary += `ITEMS:\n`;
        orderSummary += `${'='.repeat(50)}\n`;
        
        // Add items organized by section
        Object.keys(itemsByCategory).sort().forEach(category => {
            orderSummary += `\n${category.toUpperCase()}:\n`;
            
            let categoryTotal = 0;
            itemsByCategory[category].forEach(item => {
                const itemTotal = item.price * item.quantity;
                categoryTotal += itemTotal;
                
                orderSummary += `  • ${item.name}`;
                if (item.variant) {
                    orderSummary += ` (${item.variant.toUpperCase()})`;
                }
                orderSummary += `\n`;
                orderSummary += `    ${item.price.toFixed(2)} x ${item.quantity} = ${itemTotal.toFixed(2)}\n`;
            });
            
            orderSummary += `  ${category} Total: ${categoryTotal.toFixed(2)}\n`;
        });
        
        orderSummary += `\n${'='.repeat(50)}\n`;
        orderSummary += `TOTAL DEL PEDIDO: ${orderData.total.toFixed(2)}\n`;
        
        if (orderData.notes) {
            orderSummary += `\nNOTAS:\n`;
            orderSummary += `  • ${orderData.notes}\n`;
        }
        
        return {
            _subject: `Nuevo Pedido ${orderData.orderNumber} - ${orderData.selectedLocation}`,
            order_details: orderSummary,
            order_number: orderData.orderNumber,
            customer_name: orderData.customerName,
            customer_phone: orderData.customerPhone,
            customer_email: orderData.customerEmail,
            location: orderData.selectedLocation,
            total: `${orderData.total.toFixed(2)}`
        };
    }
    
    function getFormspreeEndpoint(location) {
        // Define Formspree endpoints for each location
        const endpoints = {
            'hatillo': 'https://formspree.io/f/mqagdzyn',
            'dorado': 'https://formspree.io/f/meopljvw',
            'aguadilla': 'https://formspree.io/f/YOUR_AGUADILLA_FORM_ID',
            'condado': 'https://formspree.io/f/YOUR_CONDADO_FORM_ID'
        };
        
        return endpoints[location] || 'https://formspree.io/f/mgvpozgz'; // Fallback to default
    }
    
    function sendCustomerConfirmation(orderData) {
        // Only send if customer provided an email
        if (!orderData.customerEmail) {
            return Promise.resolve();
        }
        
        // Format confirmation email for customer
        let confirmationMessage = `¡Gracias por tu pedido, ${orderData.customerName}!\n\n`;
        confirmationMessage += `Tu pedido ha sido recibido y está siendo procesado.\n\n`;
        confirmationMessage += `DETALLES DEL PEDIDO:\n`;
        confirmationMessage += `${'='.repeat(50)}\n`;
        confirmationMessage += `Número de Pedido: ${orderData.orderNumber}\n`;
        confirmationMessage += `Local: ${orderData.selectedLocation}\n\n`;
        
        // Group items by category
        const itemsByCategory = {};
        orderData.items.forEach(item => {
            const category = getCategoryFromItem(item);
            if (!itemsByCategory[category]) {
                itemsByCategory[category] = [];
            }
            itemsByCategory[category].push(item);
        });
        
        confirmationMessage += `TU ORDEN:\n`;
        
        Object.keys(itemsByCategory).sort().forEach(category => {
            confirmationMessage += `\n${category.toUpperCase()}:\n`;
            
            itemsByCategory[category].forEach(item => {
                const itemTotal = item.price * item.quantity;
                confirmationMessage += `  • ${item.name}`;
                if (item.variant) {
                    confirmationMessage += ` (${item.variant.toUpperCase()})`;
                }
                confirmationMessage += `\n`;
                confirmationMessage += `    ${item.price.toFixed(2)} x ${item.quantity} = ${itemTotal.toFixed(2)}\n`;
            });
        });
        
        confirmationMessage += `\n${'='.repeat(50)}\n`;
        confirmationMessage += `TOTAL: ${orderData.total.toFixed(2)}\n`;
        
        if (orderData.notes) {
            confirmationMessage += `\nNotas Especiales: ${orderData.notes}\n`;
        }
        
        confirmationMessage += `\n${'='.repeat(50)}\n`;
        confirmationMessage += `Recibirás una llamada de confirmación pronto.\n`;
        confirmationMessage += `\n¡Gracias por elegir Los Cheesy!\n`;
        
        // Send confirmation email using Formspree
        // You can use a separate Formspree form for customer confirmations
        const confirmationEndpoint = 'https://formspree.io/f/YOUR_CUSTOMER_CONFIRMATION_FORM_ID';
        
        const confirmationData = {
            _replyto: orderData.customerEmail,
            _subject: `Confirmación de Pedido ${orderData.orderNumber} - Los Cheesy`,
            to: orderData.customerEmail,
            customer_name: orderData.customerName,
            order_number: orderData.orderNumber,
            location: orderData.selectedLocation,
            order_confirmation: confirmationMessage
        };
        
        return fetch(confirmationEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(confirmationData)
        });
    }
    
    function submitToFormspree(formattedData, orderNumber) {
        // Get the correct Formspree endpoint based on selected location
        const formspreeEndpoint = getFormspreeEndpoint(selectedLocation);
        
        // Show loading state
        submitOrderBtn.textContent = 'Enviando...';
        submitOrderBtn.disabled = true;
        
        // First, send to restaurant
        fetch(formspreeEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formattedData)
        })
        .then(response => {
            if (response.ok) {
                // Success - now send customer confirmation
                const customerEmail = document.getElementById('customer-email').value;
                const customerName = document.getElementById('customer-name').value;
                
                if (customerEmail) {
                    // Calculate total
                    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                    
                    const orderData = {
                        orderNumber: orderNumber,
                        customerName: customerName,
                        customerEmail: customerEmail,
                        selectedLocation: getLocationName(selectedLocation),
                        items: cart,
                        notes: document.getElementById('order-notes').value,
                        total: total
                    };
                    
                    // Send confirmation to customer (don't wait for it)
                    sendCustomerConfirmation(orderData).catch(err => {
                        console.log('Customer confirmation email failed, but order was successful:', err);
                    });
                }
                
                // Show confirmation screen
                document.getElementById('order-number').textContent = orderNumber;
                checkoutForm.style.display = 'none';
                orderConfirmation.style.display = 'block';
            } else {
                throw new Error('Error en el envío');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Hubo un error al enviar tu pedido. Por favor intenta de nuevo o llama al restaurante.');
        })
        .finally(() => {
            // Reset button state
            submitOrderBtn.textContent = 'Enviar Pedido';
            submitOrderBtn.disabled = false;
        });
    }
    
    function resetOrder() {
        // Reset everything
        cart = [];
        selectedLocation = '';
        locationSelect.value = '';
        document.getElementById('customer-name').value = '';
        document.getElementById('customer-phone').value = '';
        document.getElementById('customer-email').value = '';
        document.getElementById('order-notes').value = '';
        
        // Reset UI
        orderConfirmation.style.display = 'none';
        document.querySelector('.order-grid').style.display = 'grid';
        updateCartDisplay();
        updateCheckoutButton();
    }
    
    // Initialize
    updateCartDisplay();
    updateCheckoutButton();
});