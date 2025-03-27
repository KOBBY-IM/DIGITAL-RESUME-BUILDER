const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFGenerator {
  constructor() {
    this.templatesPath = path.join(__dirname, '../TEMPLATES');
  }

  async generatePDF(resumeData, templateName = 'modern') {
    return new Promise((resolve, reject) => {
      try {
        // Create a PDF document with better formatting options
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
          bufferPages: true, // Keep this option for page management
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
        this.addSection(doc, 'Professional Summary', resumeData.summary || 'No summary provided');
        
        // Add experience section
        doc.moveDown(1)
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
        doc.moveDown(1)
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
          doc.moveDown(0.5);
          
          // Format skills in a compact manner
          let skillsText = resumeData.skills.join(', ');
          
          doc.fontSize(11)
             .fillColor('#333')
             .text(skillsText, {
               width: doc.page.width - 100,
               align: 'left'
             });
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
               
            // Check if content looks like a bullet list
            const contentLines = section.content.split('\n').filter(line => line.trim());
            
            if (contentLines.length > 1 && 
                (contentLines.some(line => line.trim().startsWith('-')) || 
                 contentLines.some(line => line.trim().startsWith('•')))) {
              // Format as bullet points
              contentLines.forEach(line => {
                let text = line.trim();
                // If line doesn't start with a bullet, add one
                if (!text.startsWith('-') && !text.startsWith('•')) {
                  text = `• ${text}`;
                } else {
                  // Replace dash with bullet
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
              // Regular text
              doc.text(section.content);
            }
          });
        }
        
        // Wait until all content is added, then check how many pages were created
        const range = doc.bufferedPageRange();
        const totalPages = range.count;
        
        // Only add page numbers if we have more than 1 page
        if (totalPages > 1) {
          // Add page numbers to all pages
          for (let i = 0; i < totalPages; i++) {
            doc.switchToPage(i);
            
            doc.fontSize(9)
               .fillColor('#aaaaaa')
               .text(
                 `Page ${i + 1} of ${totalPages}`,
                 doc.page.margins.left,
                 doc.page.height - 30,
                 { align: 'center' }
               );
          }
        }
        
        // Check for a third page and remove it if present
        if (totalPages > 2) {
          // We need to finalize the document to get the output
          // but we can't modify the document anymore at this point
          console.log("Warning: Resume generated with more than 2 pages. Content may be truncated.");
        }
        
        // Finalize the document
        doc.end();
      } catch (error) {
        console.error('PDF generation error:', error);
        reject(new Error(`Failed to generate PDF: ${error.message}`));
      }
    });
  }
  
  // Helper function to add a standard section
  addSection(doc, title, content) {
    doc.moveDown(1)
       .fontSize(16)
       .fillColor('#3498db')
       .text(title);
    
    doc.moveDown(0.5)
       .fontSize(11)
       .fillColor('#333')
       .text(content || `No ${title.toLowerCase()} provided`);
    
    return doc;
  }
}

module.exports = new PDFGenerator();