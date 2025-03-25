const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class PDFGenerator {
  constructor() {
    this.templatesPath = path.join(__dirname, '../TEMPLATES');
  }

  async generatePDF(resumeData, templateName = 'modern') {
    let browser;
    try {
      // Validate input
      if (!resumeData) {
        throw new Error('Resume data is required');
      }
      
      if (!resumeData.personalInfo || !resumeData.personalInfo.fullName) {
        throw new Error('Resume must include full name');
      }

      // Find template file
      let templateFile = path.join(this.templatesPath, `${templateName}.html`);
      if (!fs.existsSync(templateFile)) {
        console.warn(`Template ${templateName} not found, using modern template instead`);
        templateFile = path.join(this.templatesPath, 'modern.html');
        
        // Double check that we at least have the modern template
        if (!fs.existsSync(templateFile)) {
          throw new Error('No valid template found');
        }
      }

      let html = fs.readFileSync(templateFile, 'utf8');
      html = this.populateTemplate(html, resumeData);
      
      // Launch browser with better error handling and system resources
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu'
        ],
        timeout: 30000
      });
      
      const page = await browser.newPage();
      
      // Set longer timeouts and better wait conditions
      await page.setContent(html, { 
        waitUntil: ['load', 'networkidle0'],
        timeout: 60000
      });
      
      // Add small delay to ensure complete rendering
      await page.waitForTimeout(500);
      
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
        timeout: 60000
      });
      
      return pdf;
    } catch (error) {
      console.error('PDF generation error:', error);
      throw new Error(`Failed to generate PDF: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close().catch(err => {
          console.error('Error closing browser:', err);
        });
      }
    }
  }

  populateTemplate(html, data) {
    try {
      // Create a safe copy with defaults for missing data
      const safeData = {
        personalInfo: {
          fullName: data.personalInfo?.fullName || 'Your Name',
          email: data.personalInfo?.email || 'email@example.com',
          phone: data.personalInfo?.phone || '',
          location: data.personalInfo?.location || '',
          jobTitle: data.personalInfo?.jobTitle || 'Professional'
        },
        summary: data.summary || '',
        experience: Array.isArray(data.experience) ? data.experience : [],
        education: Array.isArray(data.education) ? data.education : [],
        skills: Array.isArray(data.skills) ? data.skills : []
      };
      
      let result = html;
      
      // Replace personal info
      for (const [key, value] of Object.entries(safeData.personalInfo)) {
        const safeValue = this.escapeHtml(value || '');
        result = result.replace(new RegExp(`{{${key}}}`, 'g'), safeValue);
      }
      
      // Replace summary
      result = result.replace('{{summary}}', this.escapeHtml(safeData.summary || ''));
      
      // Handle arrays like experience and education
      result = this.populateArraySection(result, 'experience', safeData.experience);
      result = this.populateArraySection(result, 'education', safeData.education);
      
      // Handle skills
      if (safeData.skills && safeData.skills.length > 0) {
        const skillsHtml = safeData.skills
          .map(skill => `<li>${this.escapeHtml(skill)}</li>`)
          .join('');
        result = result.replace('{{skills}}', `<ul>${skillsHtml}</ul>`);
      } else {
        result = result.replace('{{skills}}', '<p>No skills listed</p>');
      }

      // Clean up any remaining template placeholders
      result = result.replace(/{{[^{}]+}}/g, '');
      
      return result;
    } catch (error) {
      console.error('Template population error:', error);
      // Return a basic fallback template
      return `<!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${this.escapeHtml(data.personalInfo?.fullName || 'Resume')}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; color: #333; }
            h1 { color: #2c3e50; margin-bottom: 5px; }
          </style>
        </head>
        <body>
          <h1>${this.escapeHtml(data.personalInfo?.fullName || 'Resume')}</h1>
          <p>${this.escapeHtml(data.personalInfo?.email || '')}</p>
          <p>Error generating complete resume</p>
        </body>
        </html>`;
    }
  }

  populateArraySection(html, sectionName, items) {
    if (!items || items.length === 0) {
      return html.replace(
        new RegExp(`{{${sectionName}-item}}(.*?){{/${sectionName}-item}}`, 's'),
        `<p>No ${sectionName} information provided.</p>`
      );
    }
    
    const templateRegex = new RegExp(
      `{{${sectionName}-item}}(.*?){{/${sectionName}-item}}`, 
      's'
    );
    const match = html.match(templateRegex);
    
    if (!match) return html;
    
    const itemTemplate = match[1];
    let itemsHtml = '';
    
    items.forEach(item => {
      let itemHtml = itemTemplate;
      for (const [key, value] of Object.entries(item)) {
        // Format date fields
        let displayValue = value;
        if (key.includes('Date') && value) {
          try {
            displayValue = new Date(value).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short'
            });
          } catch (e) {
            console.error('Date formatting error:', e);
          }
        }
        
        const safeValue = this.escapeHtml(displayValue || '');
        itemHtml = itemHtml.replace(
          new RegExp(`{{${key}}}`, 'g'), 
          safeValue
        );
      }
      itemsHtml += itemHtml;
    });
    
    return html.replace(templateRegex, itemsHtml);
  }

  escapeHtml(unsafe) {
    if (unsafe == null) return '';
    return String(unsafe)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

module.exports = new PDFGenerator();