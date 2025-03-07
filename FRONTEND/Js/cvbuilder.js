document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('resumeForm');

  if (!form) {
    console.error('Resume form not found');
    return;
  }

  // Select all preview elements
  const previewName = document.getElementById('previewName');
  const previewEmail = document.getElementById('previewEmail');
  const previewPhone = document.getElementById('previewPhone');
  const previewStatement = document.getElementById('previewStatement');
  const previewDegree = document.getElementById('previewDegree');
  const previewInstitution = document.getElementById('previewInstitution');
  const previewGraduation = document.getElementById('previewGraduation');
  const previewGpa = document.getElementById('previewGpa');
  const previewCompany = document.getElementById('previewCompany');
  const previewStartDate = document.getElementById('previewStartDate');
  const previewEndDate = document.getElementById('previewEndDate');
  const previewJobTitle = document.getElementById('previewJobTitle');
  const previewDescription = document.getElementById('previewDescription');
  const previewCertName = document.getElementById('previewCertName');
  const previewCertOrg = document.getElementById('previewCertOrg');
  const previewCertDate = document.getElementById('previewCertDate');
  const previewRefName = document.getElementById('previewRefName');
  const previewRelationship = document.getElementById('previewRelationship');
  const previewRefContact = document.getElementById('previewRefContact');

  // Tab navigation
  const tabs = Array.from(document.querySelectorAll('.tab-pane'));
  const tabLinks = Array.from(document.querySelectorAll('.tabs ul li'));
  let currentTab = 0;

  function showTab(index) {
    tabs.forEach((tab, i) => tab.classList.toggle('active', i === index));
    tabLinks.forEach((link, i) => link.classList.toggle('active', i === index));
    currentTab = index;
  }

  document.addEventListener('click', (e) => {
    if (e.target.matches('.next-btn') && currentTab < tabs.length - 1) {
      showTab(currentTab + 1);
    } else if (e.target.matches('.prev-btn') && currentTab > 0) {
      showTab(currentTab - 1);
    } else if (e.target.matches('.tabs ul li')) {
      const newIndex = tabLinks.indexOf(e.target);
      if (newIndex !== -1) {
        showTab(newIndex);
      }
    }
  });

  function goToHome() {
    window.location.href = "loginindex.html"; 
  }

  // Controls preview
  function updatePreview() {
    const formData = new FormData(form);
    
    previewName.textContent = formData.get('name') || 'Your Name';
    previewEmail.textContent = 'Email: ' + (formData.get('email') || 'example@example.com');
    previewPhone.textContent = 'Phone: ' + (formData.get('phone') || '000-000-0000');
    
    previewStatement.textContent = formData.get('statement') || 'Personal Statement';
    
    previewDegree.textContent = formData.get('degree') || 'Degree';
    previewInstitution.textContent = formData.get('institution') || 'Institution';
    previewGraduation.textContent = formData.get('graduation') || 'Graduation Date';
    previewGpa.textContent = formData.get('gpa') || 'GPA/Grade';
    
    previewCompany.textContent = formData.get('company') || 'Company';
    previewStartDate.textContent = formData.get('start_date') || 'Start Date';
    previewEndDate.textContent = formData.get('end_date') || 'End Date';
    previewJobTitle.textContent = formData.get('job_title') || 'Job Title';
    previewDescription.textContent = formData.get('description') || 'Description';
    
    previewCertName.textContent = formData.get('cert_name') || 'Certification Name';
    previewCertOrg.textContent = formData.get('cert_org') || 'Issuing Organization';
    previewCertDate.textContent = formData.get('cert_date') || 'Date Earned';
    
    previewRefName.textContent = formData.get('ref_name') || 'Reference Name';
    previewRelationship.textContent = formData.get('relationship') || 'Relationship';
    previewRefContact.textContent = formData.get('ref_contact') || 'Contact';
  }

  // Add an event listener for the form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent the default form submission

    // Check if the user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You are not logged in. Please log in to save your resume.');
      window.location.href = 'loginindex.html'; // Redirect to login page
      return;
    }

    // Collect form data
    const formData = new FormData(form);
    const resumeData = {
      personalInfo: {
        fullName: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
      },
      education: [
        {
          institution: formData.get('institution'),
          degree: formData.get('degree'),
          graduation: formData.get('graduation'),
          gpa: formData.get('gpa'),
        },
      ],
      workExperience: [
        {
          company: formData.get('company'),
          jobTitle: formData.get('job_title'),
          startDate: formData.get('start_date'),
          endDate: formData.get('end_date'),
          description: formData.get('description'),
        },
      ],
      certifications: [
        {
          certName: formData.get('cert_name'),
          certOrg: formData.get('cert_org'),
          certDate: formData.get('cert_date'),
        },
      ],
      references: [
        {
          refName: formData.get('ref_name'),
          relationship: formData.get('relationship'),
          refContact: formData.get('ref_contact'),
        },
      ],
    };

    // Show loading state
    const saveButton = form.querySelector('button[type="submit"]');
    saveButton.disabled = true;
    saveButton.textContent = 'Saving...';

    // Send the data to the backend
    try {
      const response = await fetch('/api/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Include the JWT token
        },
        body: JSON.stringify(resumeData),
      });

      if (response.ok) {
        alert('Resume saved successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error saving resume:', error);
      alert('An error occurred while saving the resume.');
    } finally {
      // Reset the button state
      saveButton.disabled = false;
      saveButton.textContent = 'Save Resume';
    }
  });

  // Update preview on every input change
  form.addEventListener('input', updatePreview);
});