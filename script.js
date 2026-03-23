const STORAGE_KEY = 'whatsapp_contacts_v1';
const contactsList = document.getElementById('contactsList');
const chatArea = document.getElementById('chatArea');
const chatMessages = document.getElementById('chatMessages');
const chatTitle = document.getElementById('chatTitle');
const chatStatus = document.getElementById('chatStatus');
const searchInput = document.getElementById('searchInput');
const contactOverlay = document.getElementById('contactOverlay');
const contactForm = document.getElementById('contactForm');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const addContactBtn = document.querySelector('.add-contact-btn');
const sidebar = document.querySelector('.sidebar');

let contacts = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let currentContactId = null;
let filter = '';

// Toggle chat options menu
function toggleChatOptions() {
  const menu = document.getElementById('chatOptionsMenu');
  if (menu.classList.contains('show')) {
    menu.classList.remove('show');
  } else {
    menu.classList.add('show');
  }
}

// Close chat options when clicking outside
document.addEventListener('click', (e) => {
  const menu = document.getElementById('chatOptionsMenu');
  const btn = e.target.closest('.chat-header-btn');
  if (!btn && menu.classList.contains('show')) {
    menu.classList.remove('show');
  }
});

// Chat options functions
function viewContactInfo() {
  if (currentContactId) {
    const contact = contacts.find(c => c.id === currentContactId);
    if (contact) {
      showNotification(`Info: ${contact.name} (${contact.phone})`, 'info');
    }
  }
  toggleChatOptions();
}

function clearChat() {
  if (currentContactId) {
    if (confirm('Apakah Anda yakin ingin menghapus semua chat?')) {
      localStorage.removeItem(`chat_history_${currentContactId}`);
      renderChatMessages(currentContactId);
      showNotification('Chat berhasil dihapus', 'success');
    }
  }
  toggleChatOptions();
}

function muteNotifications() {
  showNotification('Notifikasi dibisukan', 'info');
  toggleChatOptions();
}

function blockContact() {
  if (currentContactId) {
    const contact = contacts.find(c => c.id === currentContactId);
    if (contact) {
      if (confirm(`Apakah Anda yakin ingin memblokir ${contact.name}?`)) {
        showNotification(`${contact.name} diblokir`, 'success');
      }
    }
  }
  toggleChatOptions();
}

// Attach file function
function attachFile() {
  showNotification('Fitur lampir file akan segera hadir', 'info');
}

// Toggle emoji function
function toggleEmoji() {
  showNotification('Fitur emoji akan segera hadir', 'info');
}

// Open new contact form
function openNewContactForm() {
  openForm();
}

// Back to contacts function
function backToContacts() {
  if (window.innerWidth <= 768) {
    sidebar.classList.add('show');
    chatArea.classList.remove('active');
    currentContactId = null;
  }
}

// Check screen size and adjust layout
function checkScreenSize() {
  if (window.innerWidth > 768) {
    sidebar.classList.remove('show');
    chatArea.classList.remove('active');
  } else {
    // On mobile, if no contact is selected, show contacts list
    if (!currentContactId) {
      sidebar.classList.add('show');
      chatArea.classList.remove('active');
    } else {
      sidebar.classList.remove('show');
      chatArea.classList.add('active');
    }
  }
}

// Load contacts
function loadContacts() {
  contacts = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  renderContacts();
}

function saveContacts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
}

// Load chat history for a specific contact
function loadChatHistory(contactId) {
  const chatHistory = JSON.parse(localStorage.getItem(`chat_history_${contactId}`)) || [];
  return chatHistory;
}

// Save chat history for a specific contact
function saveChatHistory(contactId, messages) {
  localStorage.setItem(`chat_history_${contactId}`, JSON.stringify(messages));
}

// Clear chat messages display
function clearChatMessages() {
  chatMessages.innerHTML = '';
}

// Render chat messages
function renderChatMessages(contactId) {
  const messages = loadChatHistory(contactId);
  clearChatMessages();
  
  if (messages.length === 0) {
    chatMessages.innerHTML = '<div style="text-align: center; color: #8696a0; margin-top: 100px;">Belum ada pesan. Mulai chat dengan kontak ini.</div>';
    return;
  }
  
  messages.forEach(message => {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${message.type}`;
    msgDiv.innerHTML = `<div class="message-bubble">${message.text}</div>`;
    chatMessages.appendChild(msgDiv);
  });
  
  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function renderContacts() {
  const filtered = contacts.filter(c => 
    c.name.toLowerCase().includes(filter.toLowerCase()) ||
    c.phone.includes(filter)
  );

  // Sort contacts by name for better organization
  filtered.sort((a, b) => a.name.localeCompare(b.name));

  contactsList.innerHTML = filtered.map(contact => `
    <div class="contact-item ${currentContactId === contact.id ? 'active' : ''}" data-id="${contact.id}">
      <div class="contact-avatar">
        ${contact.name.charAt(0).toUpperCase()}
        <div class="contact-status ${contact.status}"></div>
      </div>
      <div class="contact-info">
        <div class="contact-name">${contact.name}</div>
        <div class="contact-preview">${contact.lastMessage || 'Halo'}</div>
      </div>
      <div class="contact-time">${contact.lastMessageTime || new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})}</div>
      ${contact.unread > 0 ? `<span class="unread-badge">${contact.unread}</span>` : ''}
      <div class="contact-actions">
        <button class="btn-edit" onclick="editContact('${contact.id}')" title="Edit">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-delete" onclick="deleteContact('${contact.id}')" title="Hapus">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');

  // Event listeners for contact selection
  document.querySelectorAll('.contact-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (!e.target.closest('.contact-actions')) {
        selectContact(item.dataset.id);
      }
    });
  });

  // Show contact count
  if (contacts.length > 0) {
    if (!document.getElementById('contactCount')) {
      document.querySelector('.sidebar-header').insertAdjacentHTML('beforeend', `<div id="contactCount" style="color: #8696a0; font-size: 12px; margin-top: 8px;">${contacts.length} kontak</div>`);
    } else {
      document.getElementById('contactCount').textContent = `${contacts.length} kontak`;
    }
  }
}

function selectContact(id) {
  currentContactId = id;
  const contact = contacts.find(c => c.id === id);
  if (contact) {
    chatTitle.textContent = contact.name;
    chatStatus.textContent = contact.status === 'online' ? 'online' : 'offline';
    
    // Update chat header avatar with contact initial
    const chatHeaderAvatar = document.querySelector('.chat-header-avatar');
    if (chatHeaderAvatar) {
      chatHeaderAvatar.textContent = contact.name.charAt(0).toUpperCase();
      chatHeaderAvatar.style.background = '#d9fdd3';
      chatHeaderAvatar.style.color = '#111b21';
      chatHeaderAvatar.style.display = 'flex';
      chatHeaderAvatar.style.alignItems = 'center';
      chatHeaderAvatar.style.justifyContent = 'center';
      chatHeaderAvatar.style.fontWeight = '600';
      chatHeaderAvatar.style.fontSize = '16px';
    }
    
    // Load chat history for this contact
    renderChatMessages(id);
    
    // Mobile navigation - switch to chat view
    if (window.innerWidth <= 768) {
      sidebar.classList.remove('show');
      chatArea.classList.add('active');
    }
    
    renderContacts();
  }
}

// Form handlers
function openForm(contact = null) {
  if (contact) {
    document.getElementById('formTitle').textContent = 'Edit Kontak';
    document.getElementById('editId').value = contact.id;
    document.getElementById('contactName').value = contact.name;
    document.getElementById('contactPhone').value = contact.phone;
    document.getElementById('contactStatus').value = contact.status;
  } else {
    document.getElementById('formTitle').textContent = 'Tambah Kontak';
    contactForm.reset();
  }
  contactOverlay.classList.add('active');
}

function editContact(id) {
  const contact = contacts.find(c => c.id === id);
  if (contact) {
    openForm(contact);
  }
}

function deleteContact(id) {
  const contact = contacts.find(c => c.id === id);
  if (contact) {
    // Create custom confirmation modal
    const confirmationModal = document.createElement('div');
    confirmationModal.className = 'delete-confirmation-modal';
    confirmationModal.innerHTML = `
      <div class="delete-modal-content">
        <div class="delete-modal-header">
          <div class="delete-avatar">${contact.name.charAt(0).toUpperCase()}</div>
          <h3>Hapus Kontak</h3>
        </div>
        <div class="delete-modal-body">
          <p>Apakah Anda yakin ingin menghapus kontak <strong>"${contact.name}"</strong>?</p>
          <p class="delete-warning">Semua riwayat chat akan dihapus secara permanen.</p>
        </div>
        <div class="delete-modal-actions">
          <button class="btn-cancel-delete">Batal</button>
          <button class="btn-confirm-delete">Hapus</button>
        </div>
      </div>
    `;
    
    // Add modal to body
    document.body.appendChild(confirmationModal);
    
    // Add event listeners
    const cancelBtn = confirmationModal.querySelector('.btn-cancel-delete');
    const confirmBtn = confirmationModal.querySelector('.btn-confirm-delete');
    
    cancelBtn.addEventListener('click', () => {
      document.body.removeChild(confirmationModal);
    });
    
    confirmBtn.addEventListener('click', () => {
      // Add loading state
      confirmBtn.innerHTML = 'Menghapus...';
      confirmBtn.disabled = true;
      
      // Remove from contacts array
      contacts = contacts.filter(c => c.id !== id);
      saveContacts();
      
      // Delete chat history for this contact
      localStorage.removeItem(`chat_history_${id}`);
      
      // If deleted contact was selected, clear chat area and reset mobile view
      if (currentContactId === id) {
        currentContactId = null;
        chatTitle.textContent = 'Pilih kontak';
        chatStatus.textContent = 'Klik kontak untuk chat';
        clearChatMessages();
        
        // Reset chat header avatar
        const chatHeaderAvatar = document.querySelector('.chat-header-avatar');
        if (chatHeaderAvatar) {
          chatHeaderAvatar.textContent = '';
          chatHeaderAvatar.style.background = '#d9fdd3';
        }
        
        // On mobile, go back to contacts list
        if (window.innerWidth <=768) {
          sidebar.classList.add('show');
          chatArea.classList.remove('active');
        }
      }
      
      // Remove modal
      document.body.removeChild(confirmationModal);
      
      // Show success notification
      showNotification(`Kontak "${contact.name}" berhasil dihapus`, 'success');
      
      renderContacts();
    });
    
    // Close modal on outside click
    confirmationModal.addEventListener('click', (e) => {
      if (e.target === confirmationModal) {
        document.body.removeChild(confirmationModal);
      }
    });
  }
}

// Notification function
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    if (document.body.contains(notification)) {
      document.body.removeChild(notification);
    }
  }, 3000);
}

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('editId').value || Date.now().toString();
  const contact = {
    id,
    name: document.getElementById('contactName').value,
    phone: document.getElementById('contactPhone').value,
    status: document.getElementById('contactStatus').value,
    unread: 0,
    lastMessage: '',
    lastMessageTime: '',
    createdAt: new Date().toISOString()
  };

  const index = contacts.findIndex(c => c.id === id);
  if (index > -1) {
    contacts[index] = contact;
  } else {
    contacts.unshift(contact);
  }

  saveContacts();
  loadContacts();
  contactOverlay.classList.remove('active');
});

document.getElementById('cancelBtn').addEventListener('click', () => {
  contactOverlay.classList.remove('active');
});

// Search
searchInput.addEventListener('input', (e) => {
  filter = e.target.value;
  renderContacts();
});

// Chat simulation
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
  const text = messageInput.value.trim();
  if (!text || !currentContactId) return;

  // Load existing messages
  const messages = loadChatHistory(currentContactId);
  
  // Add new message
  const newMessage = {
    text: text,
    type: 'sent',
    timestamp: new Date().toISOString()
  };
  messages.push(newMessage);
  
  // Save updated messages
  saveChatHistory(currentContactId, messages);
  
  // Add message to display
  const msgDiv = document.createElement('div');
  msgDiv.className = 'message sent';
  msgDiv.innerHTML = `<div class="message-bubble">${text}</div>`;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  messageInput.value = '';

  // Update last message for contact
  const contact = contacts.find(c => c.id === currentContactId);
  if (contact) {
    contact.lastMessage = text;
    contact.lastMessageTime = new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'});
    saveContacts();
    renderContacts();
  }

  // Simulate reply
  setTimeout(() => {
    const replies = [
      'Halo',
      'Oke, terima kasih!',
      'Baik, saya mengerti.',
      'Siap, akan saya proses.',
      'Terima kasih informasinya.',
      'Saya setuju dengan Anda.'
    ];
    const randomReply = replies[Math.floor(Math.random() * replies.length)];
    
    // Add reply to messages
    const replyMessage = {
      text: randomReply,
      type: 'received',
      timestamp: new Date().toISOString()
    };
    messages.push(replyMessage);
    
    // Save updated messages with reply
    saveChatHistory(currentContactId, messages);
    
    // Add reply to display
    const replyDiv = document.createElement('div');
    replyDiv.className = 'message received';
    replyDiv.innerHTML = `<div class="message-bubble">${randomReply}</div>`;
    chatMessages.appendChild(replyDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Update last message with reply
    if (contact) {
      contact.lastMessage = randomReply;
      contact.lastMessageTime = new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'});
      saveContacts();
      renderContacts();
    }
  }, 1000);
}

// Event listeners
if (addContactBtn) {
  addContactBtn.addEventListener('click', () => openForm());
}

// Handle window resize
window.addEventListener('resize', checkScreenSize);

// Handle overlay click to close on mobile
contactOverlay.addEventListener('click', (e) => {
  if (e.target === contactOverlay) {
    contactOverlay.classList.remove('active');
  }
});

// Initialize
loadContacts();
checkScreenSize();
