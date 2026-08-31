/**
 * Meta WhatsApp Cloud API Service Library
 * Handles direct communication with Meta Graph API (v21.0)
 */

interface CloudApiConfig {
  phoneNumberId?: string;
  accessToken?: string;
  apiVersion?: string;
}

export interface InteractiveButton {
  id: string;
  title: string;
}

export interface ListSectionRow {
  id: string;
  title: string;
  description?: string;
}

export interface ListSection {
  title: string;
  rows: ListSectionRow[];
}

export class WhatsAppCloudService {
  private phoneNumberId: string;
  private accessToken: string;
  private apiVersion: string;
  private baseUrl: string;

  constructor(config?: CloudApiConfig) {
    this.phoneNumberId = (config?.phoneNumberId || process.env.META_WA_PHONE_NUMBER_ID || '').trim();
    this.accessToken = (config?.accessToken || process.env.META_WA_ACCESS_TOKEN || '').trim();
    this.apiVersion = config?.apiVersion || process.env.META_WA_API_VERSION || 'v21.0';
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`;
  }

  private isConfigured(): boolean {
    return Boolean(this.phoneNumberId && this.accessToken);
  }

  /**
   * Helper to execute API requests to Meta Cloud API
   */
  private async request(endpoint: string, data: any) {
    if (!this.isConfigured()) {
      console.warn('[WhatsAppCloud] Missing credentials (META_WA_PHONE_NUMBER_ID or META_WA_ACCESS_TOKEN)');
      return {
        success: false,
        error: 'META_CREDENTIALS_MISSING',
        details: 'Please configure META_WA_PHONE_NUMBER_ID and META_WA_ACCESS_TOKEN'
      };
    }

    const url = `${this.baseUrl}/${this.phoneNumberId}/${endpoint}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const responseData = await res.json();
      if (!res.ok) {
        console.error('[WhatsAppCloud] API Error:', responseData);
        return {
          success: false,
          error: responseData.error?.message || 'Cloud API request failed',
          status: res.status,
          details: responseData
        };
      }

      return { success: true, data: responseData };
    } catch (err: any) {
      console.error('[WhatsAppCloud] Network Error:', err);
      return { success: false, error: err.message || 'Network error' };
    }
  }

  /**
   * Format phone number to international E.164 (without +)
   */
  public static cleanPhoneNumber(phone: string): string {
    return phone.replace(/[^0-9]/g, '');
  }

  /**
   * Send a standard plain text message
   */
  async sendTextMessage(to: string, text: string) {
    const cleanPhone = WhatsAppCloudService.cleanPhoneNumber(to);
    return this.request('messages', {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
      type: 'text',
      text: {
        preview_url: true,
        body: text
      }
    });
  }

  /**
   * Send Quick Reply interactive buttons (up to 3 buttons)
   */
  async sendInteractiveButtons(to: string, bodyText: string, buttons: InteractiveButton[], headerText?: string, footerText?: string) {
    const cleanPhone = WhatsAppCloudService.cleanPhoneNumber(to);
    
    // Meta limits quick reply buttons to max 3 items
    const limitedButtons = buttons.slice(0, 3).map((btn) => ({
      type: 'reply',
      reply: {
        id: btn.id,
        title: btn.title.slice(0, 20) // Meta max length is 20 chars
      }
    }));

    const interactivePayload: any = {
      type: 'button',
      body: { text: bodyText },
      action: { buttons: limitedButtons }
    };

    if (headerText) {
      interactivePayload.header = {
        type: 'text',
        text: headerText.slice(0, 60)
      };
    }

    if (footerText) {
      interactivePayload.footer = {
        text: footerText.slice(0, 60)
      };
    }

    return this.request('messages', {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
      type: 'interactive',
      interactive: interactivePayload
    });
  }

  /**
   * Send an interactive dropdown list (up to 10 items)
   */
  async sendInteractiveList(
    to: string,
    bodyText: string,
    buttonTitle: string,
    sections: ListSection[],
    headerText?: string,
    footerText?: string
  ) {
    const cleanPhone = WhatsAppCloudService.cleanPhoneNumber(to);

    const interactivePayload: any = {
      type: 'list',
      body: { text: bodyText },
      action: {
        button: buttonTitle.slice(0, 20),
        sections: sections.map(sec => ({
          title: sec.title.slice(0, 24),
          rows: sec.rows.slice(0, 10).map(r => ({
            id: r.id,
            title: r.title.slice(0, 24),
            description: r.description ? r.description.slice(0, 72) : undefined
          }))
        }))
      }
    };

    if (headerText) {
      interactivePayload.header = {
        type: 'text',
        text: headerText.slice(0, 60)
      };
    }

    if (footerText) {
      interactivePayload.footer = {
        text: footerText.slice(0, 60)
      };
    }

    return this.request('messages', {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
      type: 'interactive',
      interactive: interactivePayload
    });
  }

  /**
   * Send media (image, video, document) via URL
   */
  async sendMediaMessage(to: string, mediaType: 'image' | 'video' | 'document' | 'audio', mediaUrl: string, caption?: string, filename?: string) {
    const cleanPhone = WhatsAppCloudService.cleanPhoneNumber(to);
    
    const mediaObject: any = {
      link: mediaUrl
    };

    if (caption && (mediaType === 'image' || mediaType === 'video' || mediaType === 'document')) {
      mediaObject.caption = caption;
    }

    if (filename && mediaType === 'document') {
      mediaObject.filename = filename;
    }

    return this.request('messages', {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
      type: mediaType,
      [mediaType]: mediaObject
    });
  }

  /**
   * Send Meta Approved Template Message
   */
  async sendTemplateMessage(to: string, templateName: string, languageCode: string = 'en', components: any[] = []) {
    const cleanPhone = WhatsAppCloudService.cleanPhoneNumber(to);

    return this.request('messages', {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: languageCode
        },
        components: components
      }
    });
  }

  /**
   * Mark an incoming message as read
   */
  async markAsRead(messageId: string) {
    return this.request('messages', {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId
    });
  }
}

// Default singleton instance
export const whatsappCloud = new WhatsAppCloudService();
