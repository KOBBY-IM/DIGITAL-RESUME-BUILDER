const form = document.getElementById('resumeForm');

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

// Update preview on every input change
form.addEventListener('input', updatePreview);