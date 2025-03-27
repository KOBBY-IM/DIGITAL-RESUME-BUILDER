const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class PDFGenerator {
  constructor() {
    this.templatesPath = path.join(__dirname, '../TEMPLATES');
    this.tempDir = path.join(__dirname, '../temp');
    
    // Create temp directory if it doesn't exist
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  async generatePDF(resumeData, templateName = 'modern') {
    let browser;
    let tempFile = null;
    
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
        
        if (!fs.existsSync(templateFile)) {
          throw new Error('No valid template found');
        }
      }

      // Read template and populate with data
      let html = fs.readFileSync(templateFile, 'utf8');
      html = this.populateTemplate(html, resumeData);
      
      // Write to temp file
      tempFile = path.join(this.tempDir, `resume-${Date.now()}.html`);
      fs.writeFileSync(tempFile, html, 'utf8');

      // Launch browser
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage'
        ]
      });
      
      const page = await browser.newPage();
      
      // Go to the file URL with proper waitUntil
      await page.goto(`file://${tempFile}`, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });
      
      // Wait a moment for any fonts/resources to load
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate PDF with better settings
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
        displayHeaderFooter: false,
        preferCSSPageSize: true
      });
      
      return pdf;
    } catch (error) {
      console.error('PDF generation error:', error);
      
      // If Puppeteer failed, fall back to PDFKit
      if (error.message.includes('Chrome')) {
        console.log('Falling back to PDFKit for PDF generation');
        return this.generatePDFWithPDFKit(resumeData);
      }
      
      throw new Error(`Failed to generate PDF: ${error.message}`);
    } finally {
      // Close browser
      if (browser) {
        await browser.close().catch(err => {
          console.error('Error closing browser:', err);
        });
      }
      
      // Clean up temp file
      if (tempFile && fs.existsSync(tempFile)) {
        try {
          fs.unlinkSync(tempFile);
        } catch (err) {
          console.error('Error deleting temp file:', err);
        }
      }
    }
  }

  populateTemplate(html, data) {
    try {
      // Process description into bullet points
      if (Array.isArray(data.experience)) {
        data.experience = data.experience.map(exp => {
          if (exp.description) {
            // Convert description into an array of bullet points
            exp.descriptionBullets = exp.description
              .split('\n')
              .map(line => line.trim())
              .filter(line => line.length > 0);
          } else {
            exp.descriptionBullets = [];
          }
          return exp;
        });
      }
      
      // Process skills for better formatting
      if (Array.isArray(data.skills)) {
        // Convert skills to a proper HTML list for better formatting
        const skillsHtml = `<ul class="skills-list">${data.skills.map(skill => 
          `<li>${this.escapeHtml(skill)}</li>`).join('')}</ul>`;
        data.skillsHtml = skillsHtml;
      }
      
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
        skills: Array.isArray(data.skills) ? data.skills : [],
        skillsHtml: data.skillsHtml || '<p>No skills listed</p>',
        customSections: Array.isArray(data.customSections) ? data.customSections : []
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
      
      // Handle skills - using the custom HTML format
      result = result.replace('{{skills}}', safeData.skillsHtml);
      
      // Handle custom sections if template supports them
      if (result.includes('{{#customSections}}')) {
        result = this.populateCustomSections(result, safeData.customSections);
      } else if (safeData.customSections.length > 0) {
        // If template doesn't have custom sections placeholder but we have custom sections,
        // append them manually
        let customSectionsHtml = '';
        safeData.customSections.forEach(section => {
          customSectionsHtml += `
            <div class="section">
              <h2>${this.escapeHtml(section.title)}</h2>
              <p>${this.escapeHtml(section.content)}</p>
            </div>
          `;
        });
        
        // Insert before closing body tag
        result = result.replace('</body>', customSectionsHtml + '</body>');
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
      
      // Special handling for description bullets if available
      if (item.descriptionBullets && itemHtml.includes('{{#description}}')) {
        const descRegex = /{{#description}}(.*?){{\/description}}/s;
        const descMatch = itemHtml.match(descRegex);
        
        if (descMatch) {
          const bulletTemplate = descMatch[1];
          let bulletHtml = '';
          
          if (item.descriptionBullets.length > 0) {
            item.descriptionBullets.forEach(bullet => {
              bulletHtml += bulletTemplate.replace('{{.}}', this.escapeHtml(bullet));
            });
          }
          
          itemHtml = itemHtml.replace(descMatch[0], bulletHtml);
        }
      }
      
      // Process regular placeholders
      for (const [key, value] of Object.entries(item)) {
        if (key === 'descriptionBullets') continue; // Skip the special array
        
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
      
      // Handle conditional sections (like GPA)
      const conditionalRegex = /{{#([^}]+)}}(.*?){{\/\1}}/gs;
      let conditionalMatch;
      while ((conditionalMatch = conditionalRegex.exec(itemHtml)) !== null) {
        const condition = conditionalMatch[1];
        const content = conditionalMatch[2];
        
        if (item[condition] && item[condition].toString().trim()) {
          // Replace the conditional with its content
          itemHtml = itemHtml.replace(conditionalMatch[0], content.replace(`{{${condition}}}`, this.escapeHtml(item[condition])));
        } else {
          // Remove the conditional and its content
          itemHtml = itemHtml.replace(conditionalMatch[0], '');
        }
      }
      
      itemsHtml += itemHtml;
    });
    
    return html.replace(templateRegex, itemsHtml);
  }
  
  populateCustomSections(html, customSections) {
    if (!customSections || customSections.length === 0) {
      return html.replace(/{{#customSections}}(.*?){{\/customSections}}/s, '');
    }
    
    const templateRegex = /{{#customSections}}(.*?){{\/customSections}}/s;
    const match = html.match(templateRegex);
    
    if (!match) return html;
    
    const sectionTemplate = match[1];
    let sectionsHtml = '';
    
    customSections.forEach(section => {
      let sectionHtml = sectionTemplate;
      
      for (const [key, value] of Object.entries(section)) {
        const safeValue = this.escapeHtml(value || '');
        sectionHtml = sectionHtml.replace(new RegExp(`{{${key}}}`, 'g'), safeValue);
      }
      
      sectionsHtml += sectionHtml;
    });
    
    return html.replace(templateRegex, sectionsHtml);
  }

  // Fallback PDF generation with PDFKit
  async generatePDFWithPDFKit(resumeData) {
    try {
      // Only require PDFKit if needed (lazy loading)
      const PDFDocument = require('pdfkit');
      
      return new Promise((resolve, reject) => {
        try {
          // Create a PDF document
          const doc = new PDFDocument({
            size: 'A4',
            margin: 50,
            bufferPages: true,
            info: {
              Title: `${resumeData.personalInfo?.fullName || 'Resume'} - Resume`,
              Author: resumeData.personalInfo?.fullName || 'Resume Builder'
            }
          });

          // Setup document to collect PDF data
          const chunks = [];
          doc.on('data', (chunk) => chunks.push(chunk));
          doc.on('end', () => {
            const pdfData = Buffer.concat(chunks);
            resolve(pdfData);
          });
          doc.on('error', (err) => reject(err));

          // Set fonts
          doc.font('Helvetica');
          
          // Add header with name and job title
          doc.fontSize(24)
             .fillColor('#2c3e50')
             .text(resumeData.personalInfo?.fullName || 'Your Name', {
               align: 'center'
             });
          
          doc.moveDown(0.3)
             .fontSize(14)
             .fillColor('#7f8c8d')
             .text(resumeData.personalInfo?.jobTitle || 'Professional', {
               align: 'center'
             });
          
          // Add contact info
          const contactInfo = [
            resumeData.personalInfo?.email || '',
            resumeData.personalInfo?.phone || '',
            resumeData.personalInfo?.location || ''
          ].filter(Boolean).join(' | ');
          
          doc.moveDown(0.3)
             .fontSize(10)
             .fillColor('#7f8c8d')
             .text(contactInfo, {
               align: 'center'
             });
          
          // Add line under header
          doc.moveDown(1)
             .lineCap('butt')
             .moveTo(50, doc.y)
             .lineTo(doc.page.width - 50, doc.y)
             .lineWidth(2)
             .strokeColor('#3498db')
             .stroke();
          
          // Add summary section
          doc.moveDown(1)
             .fontSize(16)
             .fillColor('#3498db')
             .text('Professional Summary');
          
          doc.moveDown(0.5)
             .fontSize(11)
             .fillColor('#333')
             .text(resumeData.summary || 'No summary provided');
          
          // Add experience section
          doc.moveDown(1.5)
             .fontSize(16)
             .fillColor('#3498db')
             .text('Work Experience');
          
          if (Array.isArray(resumeData.experience) && resumeData.experience.length > 0) {
            resumeData.experience.forEach(exp => {
              doc.moveDown(0.5)
                 .fontSize(13)
                 .fillColor('#2c3e50')
                 .text(exp.jobTitle || 'Position');
              
              const companyDate = [
                exp.company || 'Company',
                [exp.startDate || '', exp.endDate || ''].filter(Boolean).join(' - ')
              ].filter(Boolean).join(' | ');
              
              doc.fontSize(11)
                 .fillColor('#7f8c8d')
                 .font('Helvetica-Oblique')
                 .text(companyDate);
              
              // Format description as bullet points if it contains newlines
              doc.moveDown(0.5)
                 .font('Helvetica')
                 .fillColor('#333');
              
              if (exp.description) {
                const lines = exp.description.split('\n').filter(line => line.trim().length > 0);
                if (lines.length > 1) {
                  lines.forEach(line => {
                    doc.fontSize(11).text(`• ${line.trim()}`, {
                      indent: 10,
                      align: 'left',
                      lineGap: 2
                    });
                  });
                } else {
                  doc.text(exp.description);
                }
              } else {
                doc.text('No description provided');
              }
              
              doc.moveDown(0.5);
            });
          } else {
            doc.moveDown(0.5)
               .fontSize(11)
               .fillColor('#333')
               .text('No experience listed');
          }
          
          // Add education section
          doc.moveDown(1.5)
             .fontSize(16)
             .fillColor('#3498db')
             .text('Education');
          
          if (Array.isArray(resumeData.education) && resumeData.education.length > 0) {
            resumeData.education.forEach(edu => {
              doc.moveDown(0.5)
                 .fontSize(13)
                 .fillColor('#2c3e50')
                 .text(edu.degree || 'Degree');
              
              const institutionYears = [
                edu.institution || 'Institution',
                [edu.startYear || '', edu.endYear || ''].filter(Boolean).join(' - ')
              ].filter(Boolean).join(' | ');
              
              doc.fontSize(11)
                 .fillColor('#7f8c8d')
                 .font('Helvetica-Oblique')
                 .text(institutionYears);
              
              doc.moveDown(0.5);
            });
          } else {
            doc.moveDown(0.5)
               .fontSize(11)
               .fillColor('#333')
               .text('No education listed');
          }
          
          // Add skills section
          doc.moveDown(1.5)
             .fontSize(16)
             .fillColor('#3498db')
             .text('Skills');
          
          if (Array.isArray(resumeData.skills) && resumeData.skills.length > 0) {
            doc.moveDown(0.5)
               .fontSize(11)
               .fillColor('#333');
            
            const skillList = resumeData.skills.map(skill => `• ${skill}`);
            doc.list(skillList, {bulletRadius: 2});
          } else {
            doc.moveDown(0.5)
               .fontSize(11)
               .fillColor('#333')
               .text('No skills listed');
          }
          
          // Add custom sections
          if (Array.isArray(resumeData.customSections) && resumeData.customSections.length > 0) {
            resumeData.customSections.forEach(section => {
              // Skip if title or content is empty
              if (!section.title || !section.content) return;
              
              // Add section header
              doc.moveDown(1.5)
                 .fontSize(16)
                 .fillColor('#3498db')
                 .text(section.title);
              
              // Add section content
              doc.moveDown(0.5)
                 .fontSize(11)
                 .fillColor('#333');
                 
              // Format content
              const contentLines = section.content.split('\n').filter(line => line.trim());
              
              if (contentLines.length > 1) {
                contentLines.forEach(line => {
                  let text = line.trim();
                  if (!text.startsWith('-') && !text.startsWith('•')) {
                    text = `• ${text}`;
                  } else {
                    text = text.replace(/^-/, '•');
                  }
                  
                  doc.text(text, {
                    bulletIndent: 10,
                    indent: 10,
                    align: 'left',
                    lineGap: 2
                  });
                });
              } else {
                doc.text(section.content);
              }
            });
          }
          
          // Add page numbers
          const totalPages = doc.bufferedPageRange().count;
          for (let i = 0; i < totalPages; i++) {
            doc.switchToPage(i);
            
            // Skip page number on first page
            if (i === 0) continue;
            
            doc.fontSize(9)
               .fillColor('#aaaaaa')
               .text(
                 `Page ${i + 1} of ${totalPages}`,
                 doc.page.margins.left,
                 doc.page.height - 30,
                 { align: 'center' }
               );
          }
          
          // Finalize the PDF
          doc.end();
        } catch (error) {
          console.error('PDFKit generation error:', error);
          reject(new Error(`Failed to generate PDF with PDFKit: ${error.message}`));
        }
      });
    } catch (error) {
      console.error('PDFKit module error:', error);
      throw new Error('Failed to load PDFKit module. Please install it with: npm install pdfkit');
    }
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