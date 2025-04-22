import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss'],
})
export class PrivacyPolicyComponent {
  @Output() back = new EventEmitter<void>();

  lastUpdated: string = 'January 1, 2025';
  companyName: string = 'GN CARRIER';
  contactInfo = {
    email: 'support@goodnewscarrier.com',
    phone: '+1 (708) 252-3829',
    address: '13450 King Rd., Lemont, IL 630439',
  };

  rights = [
    'The right to access the personal data we hold about you.',
    'The right to request corrections or deletion of your personal data.',
    'The right to restrict the processing of your personal data.',
  ];

  sharedInfo = [
    'Government authorities or regulatory agencies as required by law.',
    'Third-party service providers for background checks, identity verification, and application processing.',
  ];

  usageInfo = [
    'Process and evaluate your driver application.',
    'Comply with legal and regulatory requirements.',
    'Verify your identity and qualifications.',
    'Maintain records as required by law.',
    'Communicate with you regarding your application status or other updates.',
  ];

  /**
   * Метод для возврата к основному содержимому.
   */
  goBack(): void {
    this.back.emit();
  }
}
