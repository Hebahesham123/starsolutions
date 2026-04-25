export interface FormSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  timestamp: Date;
  status: 'new' | 'contacted' | 'in-progress' | 'completed' | 'lost';
  notes: string[];
  lastUpdated: Date;
}

export interface ClientNote {
  id: string;
  submissionId: string;
  content: string;
  author: string;
  timestamp: Date;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager';
  createdAt: Date;
}
