// src/services/twilio.ts

import twilio from 'twilio';

// Initialize Twilio client
const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID || '',
    process.env.TWILIO_AUTH_TOKEN || ''
);

const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || '';

interface SMSSendResult {
    success: boolean;
    message?: string;
    error?: string;
    sid?: string;
}

/**
 * Send tracking SMS to customer
 */
export async function sendTrackingSMS(
    phoneNumber: string,
    trackingCode: string,
    lang: 'fr' | 'ar' = 'ar'
): Promise<SMSSendResult> {
    // Validate Twilio credentials
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
        console.warn('[Twilio] Credentials not configured. SMS not sent.');
        return {
            success: false,
            error: 'Twilio credentials not configured'
        };
    }

    // Format phone number (ensure it's in international format)
    const formattedPhone = formatPhoneNumber(phoneNumber);

    if (!formattedPhone) {
        return {
            success: false,
            error: 'Invalid phone number format'
        };
    }

    // Build message based on language
    const message = lang === 'ar'
        ? `شكراً لتسوقك من تيكاتكوم! 🛍️\nرقم تتبع شحنتك: ${trackingCode}\nيمكنك متابعة شحنتك على: https://tikatkom.com/track/${trackingCode}`
        : `Merci d'avoir commandé chez Tikatkom! 🛍️\nVotre numéro de suivi: ${trackingCode}\nSuivez votre colis sur: https://tikatkom.com/track/${trackingCode}`;

    try {
        const result = await twilioClient.messages.create({
            body: message,
            from: TWILIO_PHONE_NUMBER,
            to: formattedPhone
        });

        console.log(`[Twilio] SMS sent successfully to ${formattedPhone}: SID ${result.sid}`);

        return {
            success: true,
            message: 'SMS sent successfully',
            sid: result.sid
        };
    } catch (error: any) {
        console.error('[Twilio] Failed to send SMS:', error.message);
        return {
            success: false,
            error: error.message || 'Failed to send SMS'
        };
    }
}

/**
 * Format phone number to E.164 format
 */
function formatPhoneNumber(phone: string): string | null {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // If it starts with 213, it's already in international format (without +)
    if (cleaned.startsWith('213')) {
        return '+' + cleaned;
    }

    // If it's 10 digits and starts with 0, it's an Algerian number
    if (cleaned.length === 10 && cleaned.startsWith('0')) {
        return '+213' + cleaned.substring(1);
    }

    // If it starts with +, it's already in E.164 format
    if (phone.startsWith('+')) {
        return phone;
    }

    // If it's 9 digits (without leading 0), add +213
    if (cleaned.length === 9) {
        return '+213' + cleaned;
    }

    console.warn('[Twilio] Invalid phone number format:', phone);
    return null;
}

/**
 * Send WhatsApp message as fallback (if Twilio WhatsApp is configured)
 */
export async function sendWhatsAppMessage(
    phoneNumber: string,
    trackingCode: string,
    lang: 'fr' | 'ar' = 'ar'
): Promise<SMSSendResult> {
    // Validate WhatsApp credentials
    if (!process.env.TWILIO_WHATSAPP_SENDER) {
        console.warn('[Twilio] WhatsApp sender not configured. WhatsApp message not sent.');
        return {
            success: false,
            error: 'WhatsApp sender not configured'
        };
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    if (!formattedPhone) {
        return {
            success: false,
            error: 'Invalid phone number format'
        };
    }

    const message = lang === 'ar'
        ? `شكراً لتسوقك من تيكاتكوم! 🛍️\nرقم تتبع شحنتك: ${trackingCode}\nيمكنك متابعة شحنتك على: https://tikatkom.com/track/${trackingCode}`
        : `Merci d'avoir commandé chez Tikatkom! 🛍️\nVotre numéro de suivi: ${trackingCode}\nSuivez votre colis sur: https://tikatkom.com/track/${trackingCode}`;

    try {
        const result = await twilioClient.messages.create({
            body: message,
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_SENDER}`,
            to: `whatsapp:${formattedPhone}`
        });

        console.log(`[Twilio] WhatsApp sent successfully to ${formattedPhone}: SID ${result.sid}`);

        return {
            success: true,
            message: 'WhatsApp sent successfully',
            sid: result.sid
        };
    } catch (error: any) {
        console.error('[Twilio] Failed to send WhatsApp:', error.message);
        return {
            success: false,
            error: error.message || 'Failed to send WhatsApp'
        };
    }
}