/**
 * Botpress Custom Action / Execute Code Card Script
 * =================================================
 * Target Endpoint: POST https://unicric-backend-oaif.onrender.com/api/botpress/upload
 * Alternative Endpoint: POST https://unicric-backend-oaif.onrender.com/api/process-pdf-scorecard
 * Expects: multipart/form-data payload with field name 'file' (application/pdf)
 * 
 * HOW TO USE THIS SCRIPT IN BOTPRESS STUDIO:
 * ------------------------------------------
 * 1. Open your Botpress Studio workflow diagram.
 * 2. Add an "Execute Code" card right after capturing a PDF scorecard file from the user.
 * 3. In Botpress, ensure the uploaded file URL is saved to `workflow.pdfUrl` 
 *    (or read automatically from `event.payload.fileUrl`).
 * 4. Paste this entire code block into the Botpress "Execute Code" editor.
 * 5. This script downloads the PDF file, appends it as `file`, and posts it to
 *    your live Render FastAPI backend.
 * 6. The backend response will be stored in `workflow.apiResult` for display or chatbot response.
 */

const axios = require('axios');
const FormData = require('form-data');

async function executeBotpressWebhook() {
  try {
    // 1. Retrieve the PDF file URL from Botpress workflow variables or event payload
    const pdfUrl = 
      (typeof workflow !== 'undefined' && workflow.pdfUrl) ||
      (typeof event !== 'undefined' && event.payload && (event.payload.fileUrl || event.payload.url)) ||
      (typeof args !== 'undefined' && args.pdfUrl);

    if (!pdfUrl) {
      throw new Error('No PDF URL found in workflow.pdfUrl or event.payload.fileUrl.');
    }

    console.log(`[Botpress Webhook] Fetching PDF file from: ${pdfUrl}`);

    // 2. Download the binary PDF file as an ArrayBuffer
    const fileResponse = await axios.get(pdfUrl, {
      responseType: 'arraybuffer',
      timeout: 20000 // 20-second timeout
    });

    const fileBuffer = Buffer.from(fileResponse.data);

    // Extract valid filename or fallback to default
    let filename = 'scorecard.pdf';
    if (typeof pdfUrl === 'string' && pdfUrl.includes('.pdf')) {
      const parts = pdfUrl.split('/');
      const lastPart = parts[parts.length - 1].split('?')[0];
      if (lastPart.toLowerCase().endsWith('.pdf')) {
        filename = lastPart;
      }
    }

    console.log(`[Botpress Webhook] Downloaded ${fileBuffer.length} bytes (${filename}).`);

    // 3. Build multipart/form-data matching FastAPI parameters:
    //    - 'file': UploadFile (required)
    //    - 'user_id': string (optional)
    //    - 'conversation_id': string (optional)
    const formData = new FormData();
    formData.append('file', fileBuffer, {
      filename: filename,
      contentType: 'application/pdf'
    });

    const userId = (typeof user !== 'undefined' && user.id) || 'botpress-user';
    const conversationId = (typeof event !== 'undefined' && event.conversationId) || 'botpress-session';

    formData.append('user_id', userId);
    formData.append('conversation_id', conversationId);

    // 4. Send POST request to live Render FastAPI endpoint
    const backendEndpoint = 'https://unicric-backend-oaif.onrender.com/api/botpress/upload';
    
    console.log(`[Botpress Webhook] Sending POST request to: ${backendEndpoint}`);

    const response = await axios.post(backendEndpoint, formData, {
      headers: {
        ...formData.getHeaders()
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    console.log('[Botpress Webhook] Success response from FastAPI:', response.data);

    // 5. Store response in Botpress workflow context
    if (typeof workflow !== 'undefined') {
      workflow.apiResult = response.data;
      workflow.uploadSuccess = true;
    }

    return response.data;

  } catch (error) {
    const errorPayload = {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    };

    console.error('[Botpress Webhook Error] PDF ingestion failed:', errorPayload);

    if (typeof workflow !== 'undefined') {
      workflow.apiResult = {
        status: 'error',
        error: errorPayload
      };
      workflow.uploadSuccess = false;
    }

    throw error;
  }
}

// Execute function in Botpress runtime environment
return executeBotpressWebhook();
