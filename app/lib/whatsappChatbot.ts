/**
 * Intelligent WhatsApp Reservation Chatbot Engine
 * Inspired by Meta Jasper's Market architecture
 * Manages conversation states and creates direct reservations in Prisma DB.
 */

import { prisma } from '@/lib/prisma';
import { whatsappCloud, InteractiveButton, ListSection } from './whatsappCloud';
import { sendTelegramNotification } from '@/app/lib/telegram';

export interface ChatSessionState {
  step: 'GREETING' | 'SELECT_SERVICE' | 'SELECT_ROUTE' | 'ENTER_DATETIME' | 'ENTER_PASSENGERS' | 'CONFIRM_SUMMARY';
  serviceType?: string;
  from?: string;
  to?: string;
  date?: string;
  time?: string;
  flightCode?: string;
  passengerNames?: string;
  luggageCount?: number;
  estimatedPrice?: number;
  currency?: string;
  lastUpdated: number;
}

// In-memory conversation state store (session expires after 4 hours)
const sessionStore = new Map<string, ChatSessionState>();
const SESSION_TTL_MS = 4 * 60 * 60 * 1000;

function getSession(phoneNumber: string): ChatSessionState {
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  const existing = sessionStore.get(cleanPhone);
  const now = Date.now();

  if (existing && (now - existing.lastUpdated < SESSION_TTL_MS)) {
    existing.lastUpdated = now;
    return existing;
  }

  const fresh: ChatSessionState = {
    step: 'GREETING',
    currency: 'EUR',
    lastUpdated: now
  };
  sessionStore.set(cleanPhone, fresh);
  return fresh;
}

function updateSession(phoneNumber: string, data: Partial<ChatSessionState>) {
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  const current = getSession(cleanPhone);
  const updated = { ...current, ...data, lastUpdated: Date.now() };
  sessionStore.set(cleanPhone, updated);
  return updated;
}

function resetSession(phoneNumber: string) {
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  sessionStore.delete(cleanPhone);
}

/**
 * Handle incoming message or interactive button/list event from Meta Webhook
 */
export async function handleIncomingCloudMessage(fromNumber: string, messageBody?: string, buttonId?: string, listId?: string) {
  const session = getSession(fromNumber);
  const inputId = buttonId || listId || '';
  const textInput = (messageBody || '').trim();

  console.log(`[Chatbot] Message from ${fromNumber} | Step: ${session.step} | Input: "${textInput}" | ID: "${inputId}"`);

  // Global reset trigger
  if (textInput.toLowerCase() === 'menu' || textInput.toLowerCase() === 'start' || textInput.toLowerCase() === 'reset' || inputId === 'BTN_RESTART') {
    resetSession(fromNumber);
    return sendWelcomeMenu(fromNumber);
  }

  switch (session.step) {
    case 'GREETING':
      return sendWelcomeMenu(fromNumber);

    case 'SELECT_SERVICE':
      return handleServiceSelection(fromNumber, inputId, textInput);

    case 'SELECT_ROUTE':
      return handleRouteSelection(fromNumber, inputId, textInput);

    case 'ENTER_DATETIME':
      return handleDateTimeInput(fromNumber, textInput);

    case 'ENTER_PASSENGERS':
      return handlePassengerInput(fromNumber, textInput);

    case 'CONFIRM_SUMMARY':
      return handleConfirmation(fromNumber, inputId);

    default:
      resetSession(fromNumber);
      return sendWelcomeMenu(fromNumber);
  }
}

/**
 * Step 1: Send Welcome greeting & Service Selection
 */
async function sendWelcomeMenu(to: string) {
  updateSession(to, { step: 'SELECT_SERVICE' });

  const bodyText = 
    `Hello & Welcome! 👋\n\n` +
    `Welcome to our VIP Transfer & Chauffeur Services in Türkiye.\n` +
    `How can we assist you with your journey today?`;

  const buttons: InteractiveButton[] = [
    { id: 'SRV_AIRPORT', title: '✈️ Airport Transfer' },
    { id: 'SRV_INTERCITY', title: '🚘 Intercity Transfer' },
    { id: 'SRV_SUPPORT', title: '💬 Live Support' }
  ];

  return whatsappCloud.sendInteractiveButtons(
    to,
    bodyText,
    buttons,
    'VIP Transfer Türkiye',
    'Please select an option below'
  );
}

/**
 * Step 2: Handle Service Selection and Prompt for Routes
 */
async function handleServiceSelection(to: string, inputId: string, textInput: string) {
  if (inputId === 'SRV_SUPPORT') {
    resetSession(to);
    return whatsappCloud.sendTextMessage(
      to,
      `A customer representative has been notified and will reply to you shortly. You can also reach our 24/7 hotline at +90 543 269 5442. 📞`
    );
  }

  if (inputId === 'SRV_AIRPORT' || textInput.toLowerCase().includes('airport')) {
    updateSession(to, { step: 'SELECT_ROUTE', serviceType: 'Airport Transfer' });

    const sections: ListSection[] = [
      {
        title: 'Istanbul Airports',
        rows: [
          { id: 'ROUTE_IST_EUROPE', title: 'IST Airport ➔ City', description: 'Taksim, Sultanahmet, Besiktas' },
          { id: 'ROUTE_SAW_EUROPE', title: 'SAW Airport ➔ City', description: 'Kadikoy, Taksim, Levent' },
          { id: 'ROUTE_CITY_AIRPORT', title: 'Hotel ➔ Airport', description: 'From your hotel to IST/SAW' }
        ]
      },
      {
        title: 'Other Regions',
        rows: [
          { id: 'ROUTE_AYT', title: 'Antalya Airport ➔ Hotel', description: 'Belek, Kemer, Side, Alanya' },
          { id: 'ROUTE_BJV', title: 'Bodrum Airport ➔ Hotel', description: 'Yalikavak, Turkbuku, Center' }
        ]
      }
    ];

    return whatsappCloud.sendInteractiveList(
      to,
      `Please select your transfer route:`,
      'Choose Route',
      sections,
      '✈️ Airport Routes',
      'Select from the list'
    );
  }

  if (inputId === 'SRV_INTERCITY' || textInput.toLowerCase().includes('intercity')) {
    updateSession(to, { step: 'SELECT_ROUTE', serviceType: 'Intercity VIP Transfer' });

    const sections: ListSection[] = [
      {
        title: 'Popular Destinations',
        rows: [
          { id: 'ROUTE_IST_BURSA', title: 'Istanbul ➔ Bursa', description: 'VIP Mercedes Vito Transfer' },
          { id: 'ROUTE_IST_SAPANCA', title: 'Istanbul ➔ Sapanca', description: 'Lake & Mountain Tour' },
          { id: 'ROUTE_IST_BOLU', title: 'Istanbul ➔ Bolu / Abant', description: 'Nature & Resort Transfer' }
        ]
      }
    ];

    return whatsappCloud.sendInteractiveList(
      to,
      `Please select your intercity transfer destination:`,
      'Choose Destination',
      sections,
      '🚘 Intercity Routes',
      'Select from the list'
    );
  }

  // Fallback if typed text
  updateSession(to, { step: 'ENTER_DATETIME', from: textInput, to: 'Destination Hotel/Address' });
  return whatsappCloud.sendTextMessage(
    to,
    `Great! Please reply with your **Transfer Date & Time** and **Flight Number** (if any).\n\nExample: *15 September, 14:30, Flight TK1821*`
  );
}

/**
 * Step 3: Handle Route Selection and Ask for Date/Time
 */
async function handleRouteSelection(to: string, inputId: string, textInput: string) {
  let routeFrom = 'Airport';
  let routeTo = 'Hotel / City Center';
  let price = 50;

  if (inputId === 'ROUTE_IST_EUROPE') {
    routeFrom = 'Istanbul Airport (IST)';
    routeTo = 'City Center (Taksim / Sultanahmet)';
    price = 55;
  } else if (inputId === 'ROUTE_SAW_EUROPE') {
    routeFrom = 'Sabiha Gokcen Airport (SAW)';
    routeTo = 'City Center / European Side';
    price = 60;
  } else if (inputId === 'ROUTE_CITY_AIRPORT') {
    routeFrom = 'Hotel / City Address';
    routeTo = 'Istanbul Airport (IST/SAW)';
    price = 55;
  } else if (inputId === 'ROUTE_IST_BURSA') {
    routeFrom = 'Istanbul';
    routeTo = 'Bursa / Uludag';
    price = 180;
  } else if (inputId === 'ROUTE_IST_SAPANCA') {
    routeFrom = 'Istanbul';
    routeTo = 'Sapanca / Masukiye';
    price = 140;
  } else if (inputId === 'ROUTE_IST_BOLU') {
    routeFrom = 'Istanbul';
    routeTo = 'Bolu / Abant Lake';
    price = 220;
  } else if (inputId === 'ROUTE_AYT') {
    routeFrom = 'Antalya Airport (AYT)';
    routeTo = 'Antalya Hotel / Resort';
    price = 65;
  } else if (inputId === 'ROUTE_BJV') {
    routeFrom = 'Bodrum Airport (BJV)';
    routeTo = 'Bodrum Hotel / Marina';
    price = 70;
  }

  updateSession(to, {
    step: 'ENTER_DATETIME',
    from: routeFrom,
    to: routeTo,
    estimatedPrice: price
  });

  return whatsappCloud.sendTextMessage(
    to,
    `📍 Route: *${routeFrom}* ➔ *${routeTo}*\n` +
    `💵 Estimated Price: *€${price}* (VIP Mercedes Vito with Chauffeur)\n\n` +
    `📅 Please provide your **Transfer Date & Time** and **Flight Number** (if arriving by air).\n` +
    `_Example: 10 September at 15:00, Flight TK1984_`
  );
}

/**
 * Step 4: Handle Date/Time Input and Ask for Passengers
 */
async function handleDateTimeInput(to: string, textInput: string) {
  if (!textInput || textInput.length < 3) {
    return whatsappCloud.sendTextMessage(to, `Please enter a valid transfer date and time (e.g. *12 October, 14:00*).`);
  }

  updateSession(to, {
    step: 'ENTER_PASSENGERS',
    date: textInput,
    time: textInput.includes(':') ? textInput.split(' ')[1] || '12:00' : '12:00',
    flightCode: textInput.includes('TK') ? textInput.match(/TK\s?\d+/i)?.[0] || 'N/A' : 'N/A'
  });

  return whatsappCloud.sendTextMessage(
    to,
    `✅ Date noted!\n\n` +
    `👤 Now, please write the **Lead Passenger Name**, **Number of Passengers**, and **Luggage Count**.\n` +
    `_Example: John Smith, 3 adults, 3 luggage_`
  );
}

/**
 * Step 5: Handle Passenger Input and Show Confirmation Summary
 */
async function handlePassengerInput(to: string, textInput: string) {
  const session = getSession(to);

  // Extract simple numbers for luggage if possible
  const luggageMatch = textInput.match(/(\d+)\s*(luggage|bag|valiz|bavul|piece)/i);
  const luggage = luggageMatch ? parseInt(luggageMatch[1]) : 2;

  const passengerName = textInput.split(',')[0].trim() || 'Valued Guest';

  const updatedSession = updateSession(to, {
    step: 'CONFIRM_SUMMARY',
    passengerNames: passengerName,
    luggageCount: luggage,
    estimatedPrice: session.estimatedPrice || 50
  });

  const summaryText = 
    `📋 *TRANSFER BOOKING SUMMARY*\n\n` +
    `• *Service:* ${updatedSession.serviceType || 'VIP Transfer'}\n` +
    `• *Route:* ${updatedSession.from} ➔ ${updatedSession.to}\n` +
    `• *Date & Time:* ${updatedSession.date}\n` +
    `• *Lead Passenger:* ${updatedSession.passengerNames}\n` +
    `• *Luggage:* ${updatedSession.luggageCount} bags\n` +
    `• *Vehicle:* VIP Mercedes Vito (Max 6 pax)\n` +
    `• *Total Price:* €${updatedSession.estimatedPrice} (Pay to Driver)\n\n` +
    `Would you like to confirm this reservation?`;

  const buttons: InteractiveButton[] = [
    { id: 'CONFIRM_YES', title: '✅ Confirm Booking' },
    { id: 'CONFIRM_NO', title: '❌ Modify / Cancel' }
  ];

  return whatsappCloud.sendInteractiveButtons(
    to,
    summaryText,
    buttons,
    'Booking Confirmation',
    'Tap below to finalize'
  );
}

/**
 * Step 6: Finalize Confirmation and Create Reservation in Prisma DB
 */
async function handleConfirmation(to: string, inputId: string) {
  const session = getSession(to);

  if (inputId === 'CONFIRM_NO') {
    resetSession(to);
    return whatsappCloud.sendTextMessage(
      to,
      `Your request has been cancelled. Type *menu* anytime to start a new booking! 👍`
    );
  }

  if (inputId === 'CONFIRM_YES' || inputId.includes('YES')) {
    const voucherNumber = `WA-${Date.now().toString().slice(-6)}`;
    const price = session.estimatedPrice || 50;

    try {
      // Find default tenant if available
      const defaultTenant = await prisma.tenant.findFirst({
        where: { isActive: true },
        select: { id: true, companyName: true }
      });

      const newReservation = await prisma.reservation.create({
        data: {
          voucherNumber: voucherNumber,
          date: session.date || new Date().toISOString().split('T')[0],
          time: session.time || '12:00',
          from: session.from || 'Airport',
          to: session.to || 'Hotel / City',
          flightCode: session.flightCode || 'N/A',
          passengerNames: session.passengerNames || 'WhatsApp Guest',
          luggageCount: session.luggageCount || 2,
          price: price,
          currency: session.currency || 'EUR',
          phoneNumber: to,
          paymentStatus: 'PENDING',
          source: 'whatsapp_cloud_bot',
          type: 'transfer',
          notes: `Created automatically via Meta WhatsApp Cloud API Bot. Service: ${session.serviceType || 'VIP Transfer'}`,
          tenantId: defaultTenant?.id || null
        }
      });

      console.log(`[Chatbot] Created Reservation in DB: Voucher ${voucherNumber} (ID: ${newReservation.id})`);

      // Notify operations via Telegram
      try {
        await sendTelegramNotification({
          type: 'new_reservation',
          reservation: {
            voucherNumber: voucherNumber,
            date: session.date || new Date().toISOString().split('T')[0],
            time: session.time || '12:00',
            from: session.from || 'Airport',
            to: session.to || 'Hotel / City',
            passengerNames: [session.passengerNames || 'WhatsApp Guest'],
            price: price,
            currency: session.currency || 'EUR'
          }
        });
      } catch (tgErr) {
        console.warn('[Chatbot] Telegram notification skipped/failed:', tgErr);
      }

      resetSession(to);

      return whatsappCloud.sendTextMessage(
        to,
        `🎉 *RESERVATION CONFIRMED!*\n\n` +
        `Your Voucher Number: *${voucherNumber}*\n\n` +
        `Our operations team has received your booking. Your VIP driver details will be sent to you prior to the transfer.\n\n` +
        `Thank you for choosing our VIP Transfer service! 🚘✨`
      );
    } catch (dbErr: any) {
      console.error('[Chatbot] Failed to save reservation to DB:', dbErr);
      return whatsappCloud.sendTextMessage(
        to,
        `Thank you! We received your request. Our representative will contact you directly to confirm your booking.`
      );
    }
  }

  // Fallback
  return sendWelcomeMenu(to);
}
