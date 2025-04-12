import React from 'react';
import { FloatingWhatsApp } from 'react-floating-whatsapp';
import s30Logo from '../../assets/logo.png';

const WhatsAppChat = () => {
  return (
    <FloatingWhatsApp
      phoneNumber="+919886944954"
      accountName="S30 Mocks Support"
      statusMessage="Typically replies within 1 hour"
      chatMessage="Hello! 👋 How can we help you with your mock interview experience?"
      placeholder="Type a message..."
      avatar={s30Logo}
      allowClickAway={true}
      notification={true}
      notificationDelay={30000}
      notificationSound={true}
    />
  );
};

export default WhatsAppChat;
